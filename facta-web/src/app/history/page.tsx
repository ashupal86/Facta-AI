"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalysisResult } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface HistoryItem {
    id: string;
    claim: string;
    date: string;
    result?: AnalysisResult['result'];
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem("facta-history");
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const clearHistory = () => {
        localStorage.removeItem("facta-history");
        setHistory([]);
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
                    <p className="text-muted-foreground">
                        View your past fact-checking analyses.
                    </p>
                </div>
                {history.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={clearHistory}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear History
                    </Button>
                )}
            </div>

            {history.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold">No history yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Start by analyzing a claim on the Fact Check page.
                        </p>
                        <Button asChild>
                            <a href="/fact-check">Go to Fact Check</a>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {history.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:bg-accent/5 transition-colors">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base line-clamp-1">
                                                    {item.claim}
                                                </CardTitle>
                                                <CardDescription>
                                                    {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString()}
                                                </CardDescription>
                                            </div>
                                            {item.result && (
                                                <Badge
                                                    variant={
                                                        item.result.truthScore > 70
                                                            ? "default"
                                                            : item.result.truthScore < 40
                                                                ? "destructive"
                                                                : "secondary"
                                                    }
                                                >
                                                    {item.result.truthScore}/100
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {item.result?.verdict || "Analysis pending..."}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
