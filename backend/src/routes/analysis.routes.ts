
import { Router } from 'express';
import { ClaimNormalizationService } from '../services/normalization.service.js';
import { QueueService } from '../services/queue.js';
import { redis } from '../lib/redis.js';

const router = Router();

// POST /analyze
router.post('/', async (req, res) => {
    try {
        const { claim } = req.body;

        if (!claim) {
            return res.status(400).json({ error: 'Claim is required' });
        }

        const result = await ClaimNormalizationService.processClaim(claim);

        res.json(result);
    } catch (error: any) {
        console.error('Analysis request failed:', error);
        res.status(500).json({ error: 'Failed to process analysis request' });
    }
});

// POST /analyze/sync
router.post('/sync', async (req, res) => {
    try {
        const { claim } = req.body;

        if (!claim) {
            return res.status(400).json({ error: 'Claim is required' });
        }

        console.log(`[Sync] Received sync analysis request for: ${claim.substring(0, 50)}...`);
        const initialResult = await ClaimNormalizationService.processClaim(claim);

        // If cached or rejected, return immediately
        if (initialResult.status === 'cached' || initialResult.status === 'rejected') {
            console.log(`[Sync] Returning immediate result: ${initialResult.status}`);
            return res.json(initialResult);
        }

        // If queued, poll for completion
        if (initialResult.status === 'queued' && initialResult.jobId) {
            const jobId = initialResult.jobId;
            console.log(`[Sync] Job queued (${jobId}). Polling for results...`);

            const startTime = Date.now();
            const TIMEOUT_MS = 60000; // 60 seconds timeout
            const POLLING_INTERVAL_MS = 1000; // 1 second interval

            while (Date.now() - startTime < TIMEOUT_MS) {
                const status = await QueueService.getJobStatus(jobId);

                if (status.error) {
                    return res.status(404).json({ error: 'Job lost during processing' });
                }

                const state = status.metadata.state;

                if (state === 'completed') {
                    console.log(`[Sync] Job ${jobId} completed.`);
                    return res.json({
                        status: 'completed',
                        result: status.analysis.result // The worker returns { result: ... } in the returnvalue
                    });
                }

                if (state === 'failed') {
                    console.log(`[Sync] Job ${jobId} failed.`);
                    return res.status(500).json({
                        status: 'failed',
                        error: status.failedReason
                    });
                }

                // Wait before next poll
                await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
            }

            // Timeout
            console.log(`[Sync] Job ${jobId} timed out.`);
            return res.status(408).json({
                error: 'Analysis timed out',
                jobId: jobId,
                message: 'The analysis is taking longer than expected. Please check status asynchronously using the jobId.'
            });
        }

        // Fallback for unexpected status
        res.json(initialResult);

    } catch (error: any) {
        console.error('Sync analysis request failed:', error);
        res.status(500).json({ error: 'Failed to process synchronous analysis request' });
    }
});

// GET /analyze/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check Redis for cached result (if id is a hash) or job status (if id is uuid)
        // Actually, our processClaim returns either { status: 'cached', result: ... } or { status: 'queued', jobId: ... }

        // If the user provides a jobId (UUID)
        // Use QueueService to get job status
        const status = await QueueService.getJobStatus(id);

        if (status.error) {
            return res.status(404).json({ error: status.error });
        }

        return res.json({
            id,
            status: status.metadata.state,
            progress: status.metadata.progress,
            result: status.analysis,
            error: status.failedReason
        });

        // If not found in queue, maybe it's a claim hash?
        // But the API client usually gets a jobId.
        // Let's assume it's a jobId.

        res.status(404).json({ error: 'Analysis job not found' });
    } catch (error) {
        console.error('Status check failed:', error);
        res.status(500).json({ error: 'Failed to check status' });
    }
});

export default router;
