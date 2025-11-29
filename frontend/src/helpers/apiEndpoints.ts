export const apiEndPoints = {
  analysis: {
    analyze: '/api/analysis',
    status: (jobId: string) => `/api/analysis/${jobId}`,
    sync: '/api/analysis/sync',
    jobs: (userId: string) => `/api/analysis/jobs/${userId}`,
    queueStats: '/api/queue/stats',
  },
  system: {
    health: '/api/health',
    queueStats: '/api/queue/stats',
    monitoring: '/api/monitoring/dashboard',
  },
};
