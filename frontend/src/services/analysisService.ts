import { postApi, getApi } from '@/helpers/api';
import { apiEndPoints } from '@/helpers/apiEndpoints';

export interface SubmitClaimRequest {
    claim: string;
}

export interface SubmitClaimResponse {
    status: 'queued' | 'cached' | 'rejected';
    jobId?: string;
    result?: any;
    message?: string;
}

export interface JobStatusResponse {
    id: string;
    status: string;
    progress?: number;
    result?: any;
    error?: string;
}

export interface UserJobsResponse {
    success: boolean;
    data: {
        jobs: Array<{
            id: string;
            queueJobId: string;
            status: string;
            input: string;
            result: any;
            createdAt: string;
            updatedAt: string;
        }>;
    };
}

export const analysisService = {
    /**
     * Submit a claim for async analysis
     */
    async submitClaim(claim: string): Promise<SubmitClaimResponse> {
        const response = await postApi(apiEndPoints.analysis.analyze, { claim });

        console.log('Submit claim response:', { status: response.status, data: response.data });

        if (response.status !== 200) {
            const errorMessage = response.data?.error || response.data?.message || JSON.stringify(response.data) || 'Failed to submit claim';
            console.error('Submit claim failed:', errorMessage);
            throw new Error(errorMessage);
        }

        return response.data;
    },

    /**
     * Submit a claim for sync analysis (waits for result)
     */
    async submitClaimSync(claim: string): Promise<any> {
        const response = await postApi(apiEndPoints.analysis.sync, { claim });

        if (response.status !== 200) {
            throw new Error(response.data?.error || 'Failed to submit claim');
        }

        return response.data;
    },

    /**
     * Get job status by ID
     */
    async getJobStatus(jobId: string): Promise<JobStatusResponse> {
        const response = await getApi(apiEndPoints.analysis.status(jobId));

        if (response.status !== 200) {
            throw new Error(response.data?.error || 'Failed to get job status');
        }

        return response.data;
    },

    /**
     * Get all jobs for a user
     */
    async getUserJobs(userId: string): Promise<UserJobsResponse> {
        const response = await getApi(apiEndPoints.analysis.jobs(userId));

        if (response.status !== 200) {
            throw new Error(response.data?.error || 'Failed to get user jobs');
        }

        return response.data;
    },
};
