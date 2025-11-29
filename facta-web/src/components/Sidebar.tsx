"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle, History, TrendingUp, Newspaper, ShieldCheck } from "lucide-react";

const navItems = [
    { name: "Fact Check", href: "/fact-check", icon: CheckCircle },
    { name: "History", href: "/history", icon: History },
    { name: "Blog/News", href: "/blog", icon: Newspaper },
    { name: "Trending", href: "/trending", icon: TrendingUp },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-16 items-center border-b px-6">
                <ShieldCheck className="mr-2 h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Facta AI</span>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
