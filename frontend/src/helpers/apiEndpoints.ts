export const apiEndPoints = {
  analysis: {
    analyze: '/api/analysis',
    status: (jobId: string) => `/api/analysis/${jobId}`,
    sync: '/api/analysis/sync',
    jobs: (userId: string) => `/api/analysis/jobs/${userId}`,
    queueStats: '/api/analysis/queue/stats',
    cleanQueue: '/api/analysis/queue/clean',
  },
};
