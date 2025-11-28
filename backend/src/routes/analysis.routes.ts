
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
