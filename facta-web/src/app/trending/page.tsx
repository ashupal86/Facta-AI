"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowUpRight, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock data for trending topics
const trendingTopics = [
    {
        id: 1,
        topic: "Global Climate Summit 2025",
        claims: 1240,
        sentiment: "Mixed",
        growth: "+15%",
        category: "Environment",
    },
    {
        id: 2,
        topic: "New Space Telescope Discoveries",
        claims: 856,
        sentiment: "Positive",
        growth: "+22%",
        category: "Science",
    },
    {
        id: 3,
        topic: "Digital Currency Regulation Bill",
        claims: 2300,
        sentiment: "Negative",
        growth: "+45%",
        category: "Finance",
    },
    {
        id: 4,
        topic: "AI in Healthcare Regulations",
        claims: 980,
        sentiment: "Neutral",
        growth: "+12%",
        category: "Technology",
    },
    {
        id: 5,
        topic: "Mars Colonization Timeline",
        claims: 650,
        sentiment: "Positive",
        growth: "+8%",
        category: "Space",
    },
];

export default function TrendingPage() {
    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center">
                    <TrendingUp className="mr-3 h-8 w-8 text-primary" />
                    Trending Topics
                </h1>
                <p className="text-muted-foreground">
                    See what claims and topics are currently trending across the web.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trendingTopics.map((topic) => (
                    <Card key={topic.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline">{topic.category}</Badge>
                                <span className="text-green-500 text-sm font-medium flex items-center">
                                    {topic.growth} <ArrowUpRight className="ml-1 h-3 w-3" />
                                </span>
                            </div>
                            <CardTitle className="mt-2">{topic.topic}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm text-muted-foreground mb-4">
                                <div className="flex items-center">
                                    <MessageSquare className="mr-1 h-4 w-4" />
                                    {topic.claims} Claims
                                </div>
                                <div className="flex items-center">
                                    <Eye className="mr-1 h-4 w-4" />
                                    High Visibility
                                </div>
                            </div>
                            <Button variant="secondary" className="w-full" asChild>
                                <Link href={`/fact-check?claim=${encodeURIComponent(topic.topic)}`}>
                                    Analyze Related Claims
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
