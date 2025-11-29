'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { analysisService } from '@/services/analysisService';
import type { Job } from '@/types/analysis';
import NewsCard from '@/components/NewsCard';
import MaterialIcon from '@/components/common/material-icon';
import Link from 'next/link';

export default function ChatsPage() {
    const { user } = useUser();
    const [analysis, setAnalysis] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const response = await analysisService.getUserJobs(user.id);

                if (response.success && response.data?.jobs) {
                    setAnalysis(response.data.jobs);
                } else {
                    setAnalysis([]);
                }
            } catch (error: any) {
                console.error('Failed to fetch jobs:', error);
                setError(error.message || 'Failed to fetch analysis history');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [user?.id]);

    return (
        <section className="flex-1 overflow-y-auto space-y-6 pt-6 pr-2 -mr-2">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">My Chats</h1>
                <Link
                    href="/factcheck"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                    <MaterialIcon icon="add" />
                    New Chat
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <MaterialIcon icon="progress_activity" className="text-4xl text-primary animate-spin" />
                </div>
            ) : error ? (
                <div className="bg-background rounded-lg p-6 text-center">
                    <MaterialIcon icon="error" className="text-4xl text-destructive mb-2" />
                    <p className="text-secondary">{error}</p>
                </div>
            ) : analysis.length === 0 ? (
                <div className="bg-background rounded-lg p-12 text-center">
                    <MaterialIcon icon="chat_bubble_outline" className="text-6xl text-secondary mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Chats Yet</h3>
                    <p className="text-secondary mb-6">
                        Start a new fact-check analysis to see your chat history here
                    </p>
                    <Link
                        href="/factcheck"
                        className="inline-flex items-center gap-2 bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <MaterialIcon icon="add" />
                        Start New Chat
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {analysis.map((job) => (
                        <NewsCard key={job.id} analysis={job} />
                    ))}
                </div>
            )}
        </section>
    );
}
