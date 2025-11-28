import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000';

async function testPipeline() {
    try {
        console.log('Starting Pipeline Test...');

        // 1. Submit Claim
        const claim = "The Eiffel Tower was originally intended for Barcelona.";
        console.log(`Submitting claim: "${claim}"`);

        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ claim })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json() as any;
        console.log('Submission response:', data);

        if (data.status === 'cached') {
            console.log('Result was cached!');
            console.log('Verdict:', data.result.verdict);
            return;
        }

        const jobId = data.jobId;
        if (!jobId) {
            throw new Error('No jobId returned');
        }

        console.log(`Job queued with ID: ${jobId}. Polling for results...`);

        // 2. Poll for completion
        let attempts = 0;
        const maxAttempts = 60; // 60 seconds (since we wait 1s)

        while (attempts < maxAttempts) {
            const statusRes = await fetch(`${API_URL}/analyze/${jobId}`);
            const statusData = await statusRes.json() as any;

            if (!statusData.status) {
                console.log('Status is undefined. Full response:', statusData);
            } else {
                console.log(`Status: ${statusData.status}, Progress: ${statusData.progress}%`);
            }

            if (statusData.status === 'completed') {
                console.log('Job Completed!');
                console.log('Result:', JSON.stringify(statusData.result, null, 2));
                break;
            } else if (statusData.status === 'failed') {
                console.error('Job Failed:', statusData.error);
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        if (attempts >= maxAttempts) {
            console.error('Timeout waiting for job completion');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testPipeline();
