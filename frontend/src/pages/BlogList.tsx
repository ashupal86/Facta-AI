import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBlogs, type Blog } from '../services/api';
import { Calendar, ArrowRight, Loader2 } from 'lucide-react';

const BlogList: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const data = await getBlogs();
                setBlogs(data);
            } catch (err) {
                setError('Failed to load blogs.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-400 py-12">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Latest Investigations</h1>
                <p className="text-gray-400">Deep dives into trending claims and misinformation.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                    <Link
                        key={blog.id}
                        to={`/blogs/${blog.id}`}
                        className="card group flex flex-col h-full hover:-translate-y-1 transition-transform duration-300"
                    >
                        {blog.imageUrl && (
                            <div className="aspect-video rounded-lg bg-dark-900 mb-4 overflow-hidden">
                                <img
                                    src={blog.imageUrl}
                                    alt={blog.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                        </div>

                        <h2 className="text-xl font-bold mb-3 group-hover:text-primary-400 transition-colors line-clamp-2">
                            {blog.title}
                        </h2>

                        <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                            {blog.summary}
                        </p>

                        <div className="flex items-center text-primary-500 text-sm font-medium mt-auto">
                            Read Article
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BlogList;
