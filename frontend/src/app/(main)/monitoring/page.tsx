'use client';

import { useEffect, useState } from 'react';
import { systemService, type HealthResponse, type QueueStatsResponse } from '@/services/systemService';
import { toast } from 'sonner';
import MaterialIcon from '@/components/common/material-icon';
import Loading from '@/components/common/loading';

export default function MonitoringPage() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [stats, setStats] = useState<QueueStatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [healthData, statsData] = await Promise.all([
                systemService.getHealth(),
                systemService.getQueueStats(),
            ]);

            setHealth(healthData);
            setStats(statsData);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch monitoring data:', err);
            setError(err.message || 'Failed to load monitoring data');
            toast.error('Failed to load monitoring data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Poll every 5 seconds
        const interval = setInterval(fetchData, 5000);

        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loading variant="ring" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center max-w-md">
                    <MaterialIcon icon="error" className="text-4xl text-destructive mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
                    <p className="text-secondary text-sm mb-4">{error}</p>
                    <button
                        onClick={fetchData}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'ok':
            case 'healthy':
            case 'connected':
                return 'text-green-500';
            case 'degraded':
            case 'unhealthy':
                return 'text-yellow-500';
            default:
                return 'text-red-500';
        }
    };

    return (
        <section className="flex-1 overflow-y-auto space-y-6 pt-6 pr-2 -mr-2">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">System Monitoring</h1>
                    <p className="text-secondary">Real-time system health and queue statistics</p>
                </div>

                {/* Health Status */}
                {health && (
                    <div className="bg-background rounded-xl p-6 shadow-sm mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <MaterialIcon icon="monitor_heart" className="text-2xl text-primary" />
                            <h2 className="text-xl font-semibold">System Health</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-surface rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-secondary">Overall Status</span>
                                    <MaterialIcon
                                        icon={health.status === 'ok' ? 'check_circle' : 'warning'}
                                        className={getStatusColor(health.status)}
                                    />
                                </div>
                                <p className={`text-2xl font-bold mt-2 ${getStatusColor(health.status)}`}>
                                    {health.status.toUpperCase()}
                                </p>
                            </div>
                            <div className="bg-surface rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-secondary">Redis</span>
                                    <MaterialIcon
                                        icon={health.redis === 'connected' ? 'check_circle' : 'error'}
                                        className={getStatusColor(health.redis)}
                                    />
                                </div>
                                <p className={`text-2xl font-bold mt-2 ${getStatusColor(health.redis)}`}>
                                    {health.redis.toUpperCase()}
                                </p>
                            </div>
                            <div className="bg-surface rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-secondary">Queue</span>
                                    <MaterialIcon
                                        icon={health.queue.status === 'healthy' ? 'check_circle' : 'warning'}
                                        className={getStatusColor(health.queue.status || 'unknown')}
                                    />
                                </div>
                                <p className={`text-2xl font-bold mt-2 ${getStatusColor(health.queue.status || 'unknown')}`}>
                                    {(health.queue.status || 'UNKNOWN').toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Queue Statistics */}
                {stats && stats.data && (
                    <div className="bg-background rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <MaterialIcon icon="queue" className="text-2xl text-primary" />
                            <h2 className="text-xl font-semibold">Queue Statistics</h2>
                        </div>

                        {/* Job Counts */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-surface rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MaterialIcon icon="schedule" className="text-yellow-500" />
                                    <span className="text-sm text-secondary">Waiting</span>
                                </div>
                                <p className="text-3xl font-bold">{stats.data.waiting}</p>
                            </div>
                            <div className="bg-surface rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MaterialIcon icon="play_circle" className="text-blue-500" />
                                    <span className="text-sm text-secondary">Active</span>
                                </div>
                                <p className="text-3xl font-bold">{stats.data.active}</p>
                            </div>
                            <div className="bg-surface rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MaterialIcon icon="check_circle" className="text-green-500" />
                                    <span className="text-sm text-secondary">Completed</span>
                                </div>
                                <p className="text-3xl font-bold">{stats.data.completed}</p>
                            </div>
                            <div className="bg-surface rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MaterialIcon icon="error" className="text-red-500" />
                                    <span className="text-sm text-secondary">Failed</span>
                                </div>
                                <p className="text-3xl font-bold">{stats.data.failed}</p>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-surface rounded-lg p-4">
                                <h3 className="text-sm font-medium mb-3">Queue Utilization</h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-muted rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${stats.data.currentQueueUtilization > 80
                                                    ? 'bg-red-500'
                                                    : stats.data.currentQueueUtilization > 50
                                                        ? 'bg-yellow-500'
                                                        : 'bg-green-500'
                                                }`}
                                            style={{ width: `${stats.data.currentQueueUtilization}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-lg">{stats.data.currentQueueUtilization}%</span>
                                </div>
                                <p className="text-xs text-secondary mt-2">
                                    {stats.data.waiting + stats.data.active} / {stats.data.maxQueueSize} jobs
                                </p>
                            </div>
                            <div className="bg-surface rounded-lg p-4">
                                <h3 className="text-sm font-medium mb-3">Failure Rate</h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-muted rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${stats.data.failureRate > 20
                                                    ? 'bg-red-500'
                                                    : stats.data.failureRate > 10
                                                        ? 'bg-yellow-500'
                                                        : 'bg-green-500'
                                                }`}
                                            style={{ width: `${Math.min(stats.data.failureRate, 100)}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-lg">{stats.data.failureRate.toFixed(1)}%</span>
                                </div>
                                <p className="text-xs text-secondary mt-2">
                                    {stats.data.totalJobsFailed} / {stats.data.totalJobsProcessed} jobs failed
                                </p>
                            </div>
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="bg-surface rounded-lg p-4">
                                <span className="text-sm text-secondary">Avg Processing Time</span>
                                <p className="text-xl font-bold mt-1">{stats.data.averageProcessingTime}ms</p>
                            </div>
                            <div className="bg-surface rounded-lg p-4">
                                <span className="text-sm text-secondary">Worker Concurrency</span>
                                <p className="text-xl font-bold mt-1">{stats.data.workerConcurrency}</p>
                            </div>
                            <div className="bg-surface rounded-lg p-4">
                                <span className="text-sm text-secondary">Total Processed</span>
                                <p className="text-xl font-bold mt-1">{stats.data.totalJobsProcessed}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
