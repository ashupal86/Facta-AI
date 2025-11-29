import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogById, type Blog } from '../services/api';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';

const BlogDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchBlog = async () => {
            try {
                const data = await getBlogById(id);
                setBlog(data);
            } catch (err) {
                setError('Failed to load blog post.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="text-center py-12 space-y-4">
                <div className="text-red-400">{error || 'Blog not found'}</div>
                <Link to="/blogs" className="text-primary-500 hover:underline">Back to Blogs</Link>
            </div>
        );
    }

    return (
        <article className="max-w-3xl mx-auto space-y-8">
            <Link to="/blogs" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blogs
            </Link>

            <header className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    {blog.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
            </header>

            {blog.imageUrl && (
                <div className="aspect-video rounded-xl overflow-hidden bg-dark-800">
                    <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="prose prose-invert prose-lg max-w-none">
                {/* If content is markdown, render it. If HTML, use dangerouslySetInnerHTML (be careful) */}
                {/* Assuming markdown for now based on typical LLM output */}
                <div className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                    {blog.content}
                </div>
            </div>
        </article>
    );
};

export default BlogDetail;
