'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { analysisService } from '@/services/analysisService';
import { toast } from 'sonner';
import MaterialIcon from './common/material-icon';

interface FactCheckFormProps {
    onSubmitSuccess?: (jobId: string) => void;
}

export default function FactCheckForm({ onSubmitSuccess }: FactCheckFormProps) {
    const router = useRouter();
    const [claim, setClaim] = useState('');
    const [mode, setMode] = useState<'async' | 'sync'>('async');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!claim.trim()) {
            toast.error('Please enter a claim to fact-check');
            return;
        }

        setIsSubmitting(true);

        try {
            if (mode === 'async') {
                const response = await analysisService.submitClaim(claim);

                if (response.status === 'queued' && response.jobId) {
                    toast.success('Analysis started! Redirecting...');
                    router.push(`/chat/${response.jobId}`);
                    if (onSubmitSuccess) onSubmitSuccess(response.jobId);
                } else if (response.status === 'cached' && response.result) {
                    toast.success('Found cached result!');
                    router.push(`/chat/${response.result.jobId}`);
                } else {
                    toast.error(response.message || 'Failed to submit claim');
                }
            } else {
                toast.info('Analyzing claim... This may take a moment.');
                const response = await analysisService.submitClaimSync(claim);

                if (response.status === 'completed' && response.result) {
                    toast.success('Analysis complete!');
                    router.push(`/chat/${response.result.jobId}`);
                    if (onSubmitSuccess) onSubmitSuccess(response.result.jobId);
                } else {
                    toast.error('Analysis failed or timed out');
                }
            }
        } catch (error: any) {
            console.error('Error submitting claim:', error);
            toast.error(error.message || 'Failed to submit claim');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="claim" className="block text-sm font-medium mb-2">
                    Enter a claim to fact-check
                </label>
                <textarea
                    id="claim"
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="e.g., The moon is made of cheese"
                    className="w-full min-h-[120px] p-4 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Analysis Mode:</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setMode('async')}
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'async'
                                ? 'bg-primary text-white'
                                : 'bg-surface text-secondary hover:bg-surface/80'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <MaterialIcon icon="bolt" className="text-sm" />
                            Async (Fast)
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('sync')}
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'sync'
                                ? 'bg-primary text-white'
                                : 'bg-surface text-secondary hover:bg-surface/80'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <MaterialIcon icon="hourglass_empty" className="text-sm" />
                            Sync (Wait for result)
                        </div>
                    </button>
                </div>
            </div>

            <div className="bg-surface/50 border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <MaterialIcon icon="info" className="text-primary mt-0.5" />
                    <div className="text-sm text-secondary">
                        {mode === 'async' ? (
                            <p>
                                <strong>Async mode:</strong> Your analysis will be queued and processed in the background.
                                You will be redirected to view the progress immediately.
                            </p>
                        ) : (
                            <p>
                                <strong>Sync mode:</strong> The system will wait for the complete analysis before showing
                                results. This may take 30-60 seconds.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting || !claim.trim()}
                className="w-full bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <MaterialIcon icon="progress_activity" className="animate-spin" />
                        {mode === 'async' ? 'Submitting...' : 'Analyzing...'}
                    </>
                ) : (
                    <>
                        <MaterialIcon icon="fact_check" />
                        Start Fact-Check
                    </>
                )}
            </button>
        </form>
    );
}
