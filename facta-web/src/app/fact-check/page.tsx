"use client";

import { useState } from "react";
import { api, AnalysisResult } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FactCheckPage() {
    const [claim, setClaim] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!claim.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Using sync endpoint for immediate results as per plan, 
            // but falling back to async if needed could be an option.
            // For now, let's assume sync is preferred for the demo.
            const response = await api.post("/api/analysis/sync", { claim });
            const data = response.data;

            setResult(data);

            // Save to history
            const historyItem = {
                id: data.jobId || Date.now().toString(),
                claim,
                date: new Date().toISOString(),
                result: data.result,
            };

            const existingHistory = JSON.parse(localStorage.getItem("facta-history") || "[]");
            localStorage.setItem("facta-history", JSON.stringify([historyItem, ...existingHistory]));

        } catch (err) {
            console.error(err);
            setError("Failed to analyze claim. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Fact Check</h1>
                <p className="text-muted-foreground">
                    Verify claims instantly with our advanced AI analysis.
                </p>
            </div>

            <Card className="border-2">
                <CardHeader>
                    <CardTitle>Enter a Claim</CardTitle>
                    <CardDescription>
                        Paste a statement, news headline, or text snippet to analyze its veracity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="e.g., 'The moon is made of green cheese.'"
                        className="min-h-[120px] text-lg resize-none"
                        value={claim}
                        onChange={(e) => setClaim(e.target.value)}
                    />
                </CardContent>
                <CardFooter className="justify-between">
                    <div className="text-sm text-muted-foreground">
                        {claim.length} characters
                    </div>
                    <Button onClick={handleAnalyze} disabled={loading || !claim.trim()} size="lg">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            "Analyze Claim"
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-lg bg-destructive/10 p-4 text-destructive flex items-center"
                    >
                        <AlertCircle className="mr-2 h-5 w-5" />
                        {error}
                    </motion.div>
                )}

                {result && result.result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="overflow-hidden border-primary/20 shadow-lg">
                            <div className="bg-primary/5 p-6 border-b border-primary/10">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-semibold">Analysis Result</h2>
                                    <Badge
                                        variant={result.result.truthScore > 70 ? "default" : result.result.truthScore < 40 ? "destructive" : "secondary"}
                                        className="text-lg px-4 py-1"
                                    >
                                        Score: {result.result.truthScore}/100
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center">
                                        {result.result.truthScore > 70 ? (
                                            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                                        ) : result.result.truthScore < 40 ? (
                                            <XCircle className="mr-2 h-5 w-5 text-red-500" />
                                        ) : (
                                            <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                                        )}
                                        Verdict
                                    </h3>
                                    <p className="text-lg leading-relaxed">{result.result.verdict}</p>
                                </div>

                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Explanation</h3>
                                    <p className="text-muted-foreground">{result.result.explanation}</p>
                                </div>

                                {result.result.sources && result.result.sources.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Sources</h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                            {result.result.sources.map((source, index) => (
                                                <li key={index} className="truncate">
                                                    <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                                        {source}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
