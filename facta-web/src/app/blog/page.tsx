"use client";

import { useEffect, useState } from "react";
import { api, BlogPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get("/blog/list");
            setPosts(response.data);
        } catch (error) {
            console.error("Failed to fetch blog posts", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Blog & News</h1>
                    <p className="text-muted-foreground">
                        AI-generated articles based on verified facts.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/blog/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Post
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : posts.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <h3 className="text-lg font-semibold">No posts yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Generate your first AI blog post from a claim.
                        </p>
                        <Button asChild variant="secondary">
                            <Link href="/blog/create">Create Post</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
                                {post.imageUrl && (
                                    <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="h-full w-full object-cover transition-transform hover:scale-105"
                                        />
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                                    <CardDescription className="flex items-center mt-2">
                                        <Calendar className="mr-2 h-3 w-3" />
                                        {new Date(post.date).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-muted-foreground line-clamp-3 text-sm">
                                        {post.excerpt}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild variant="ghost" className="w-full justify-between group">
                                        <Link href={`/blog/${post.id}`}>
                                            Read More
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
