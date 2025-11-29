"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateBlogPage() {
    const [claim, setClaim] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        if (!claim.trim()) return;

        setLoading(true);
        try {
            await api.post("/blog/generate", { claim });
            router.push("/blog");
        } catch (error) {
            console.error("Failed to generate blog post", error);
            // Ideally show a toast notification here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/blog">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Create Blog Post</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Generate from Claim</CardTitle>
                    <CardDescription>
                        Enter a claim or topic, and our AI will research and write a blog post about it.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="e.g., 'The impact of renewable energy on global economy'"
                        className="min-h-[150px] text-lg resize-none"
                        value={claim}
                        onChange={(e) => setClaim(e.target.value)}
                    />
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleGenerate} disabled={loading || !claim.trim()} size="lg">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Content...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Post
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
