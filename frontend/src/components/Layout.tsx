import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, FileText, Github } from 'lucide-react';
import clsx from 'clsx';

const Layout: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Facta<span className="text-primary-500">AI</span></span>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link
                            to="/"
                            className={clsx(
                                "text-sm font-medium transition-colors hover:text-white",
                                isActive('/') ? "text-white" : "text-gray-400"
                            )}
                        >
                            Analyze
                        </Link>
                        <Link
                            to="/blogs"
                            className={clsx(
                                "text-sm font-medium transition-colors hover:text-white",
                                isActive('/blogs') || location.pathname.startsWith('/blogs') ? "text-white" : "text-gray-400"
                            )}
                        >
                            Blogs
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-dark-700 py-8 mt-auto">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Facta AI. Truth at the Speed of AI.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
