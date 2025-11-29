import { getApi } from '@/helpers/api';
import { apiEndPoints } from '@/helpers/apiEndpoints';

export interface HealthResponse {
    status: string;
    redis: string;
    queue: {
        status: string;
        waiting?: number;
        active?: number;
    };
}

export interface QueueStatsResponse {
    success: boolean;
    data: {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        total: number;
        totalJobsProcessed: number;
        totalJobsFailed: number;
        failureRate: number;
        averageProcessingTime: number;
        lastProcessedAt: number;
        redisStatus: any;
        workerConcurrency: number;
        maxQueueSize: number;
        currentQueueUtilization: number;
    };
}

export interface MonitoringDashboardResponse {
    success: boolean;
    data: {
        timestamp: string;
        redis: any;
        queue: {
            health: any;
            stats: any;
            metrics: any;
        };
    };
}

export const systemService = {
    /**
     * Get system health status
     */
    async getHealth(): Promise<HealthResponse> {
        const response = await getApi(apiEndPoints.system.health);

        if (response.status !== 200) {
            throw new Error(response.data?.error || 'Failed to get health status');
        }

        return response.data;
    },

    /**
     * Get queue statistics
     */
    async getQueueStats(): Promise<QueueStatsResponse> {
        const response = await getApi(apiEndPoints.system.queueStats);

        if (response.status !== 200) {
            throw new Error(response.data?.error || 'Failed to get queue stats');
        }

        return response.data;
    },

    /**
     * Get monitoring dashboard data
     */
    async getMonitoringDashboard(): Promise<MonitoringDashboardResponse> {
        const response = await getApi(apiEndPoints.system.monitoring);

        if (response.status !== 200) {
            throw new Error(response.data?.error || 'Failed to get monitoring data');
        }

        return response.data;
    },
};
