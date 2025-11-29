import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, HelpCircle, Loader2, ArrowRight, FileText } from 'lucide-react';
import { analyzeClaim, type AnalysisResult } from '../services/api';
import clsx from 'clsx';

const Home: React.FC = () => {
    const [claim, setClaim] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState('');

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!claim.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await analyzeClaim(claim);
            setResult(data);
        } catch (err) {
            setError('Failed to analyze claim. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict?.toLowerCase()) {
            case 'true': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'false': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'misleading': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getVerdictIcon = (verdict: string) => {
        switch (verdict?.toLowerCase()) {
            case 'true': return <CheckCircle className="w-6 h-6" />;
            case 'false': return <AlertTriangle className="w-6 h-6" />;
            case 'misleading': return <AlertTriangle className="w-6 h-6" />;
            default: return <HelpCircle className="w-6 h-6" />;
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4 pt-10">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Verify Claims Instantly
                </h1>
                <p className="text-lg text-gray-400 max-w-xl mx-auto">
                    Enter any claim, news headline, or statement to verify its accuracy using our advanced AI fact-checking engine.
                </p>
            </div>

            <form onSubmit={handleAnalyze} className="relative group">
                <div className="absolute inset-0 bg-primary-500/20 rounded-xl blur-xl group-hover:bg-primary-500/30 transition-all opacity-0 group-hover:opacity-100" />
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={claim}
                        onChange={(e) => setClaim(e.target.value)}
                        placeholder="e.g., The earth is flat..."
                        className="input-field pr-32 text-lg py-4"
                    />
                    <button
                        type="submit"
                        disabled={loading || !claim.trim()}
                        className="absolute right-2 top-2 bottom-2 btn-primary flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        <span>Analyze</span>
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
                    {error}
                </div>
            )}

            {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Verdict Card */}
                    <div className={clsx("p-6 rounded-xl border flex items-center gap-4", getVerdictColor(result.verdict))}>
                        <div className="p-3 rounded-full bg-current/10">
                            {getVerdictIcon(result.verdict)}
                        </div>
                        <div>
                            <div className="text-sm font-medium opacity-80 uppercase tracking-wider">Verdict</div>
                            <div className="text-2xl font-bold">{result.verdict}</div>
                        </div>
                        <div className="ml-auto text-right">
                            <div className="text-sm font-medium opacity-80">Confidence</div>
                            <div className="text-2xl font-bold">{result.confidence}%</div>
                        </div>
                    </div>

                    {/* Analysis */}
                    <div className="card space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary-500" />
                            Analysis
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                            {result.analysis}
                        </p>
                    </div>

                    {/* Evidence */}
                    {result.evidence && result.evidence.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <Search className="w-5 h-5 text-primary-500" />
                                Evidence
                            </h3>
                            <div className="grid gap-4">
                                {result.evidence.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="card group hover:bg-dark-700/50 transition-colors block"
                                    >
                                        <p className="text-gray-300 mb-2 group-hover:text-white transition-colors">"{item.text}"</p>
                                        <div className="flex items-center gap-2 text-sm text-primary-400">
                                            <span>{item.source}</span>
                                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
