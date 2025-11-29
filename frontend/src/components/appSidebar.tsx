'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import MaterialIcon from './common/material-icon';

const navigationItems = [
  { href: '/', icon: 'update', label: 'Top updates' },
  { href: '/chat', icon: 'chat', label: 'My Chats' },
  { href: '/headlines', icon: 'newspaper', label: 'Headlines' },
  { href: '/factcheck', icon: 'gavel', label: 'FactCheck' },
  { href: '/monitoring', icon: 'monitor_heart', label: 'System Status' },
  { href: '/ask', icon: 'help_center', label: "Today's Ask" },
  { href: '/trending', icon: 'trending_up', label: 'Trending' },
  { href: '/saved', icon: 'bookmark', label: 'Saved' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="w-[280px] flex-shrink-0 bg-surface rounded-lg p-6 flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <MaterialIcon icon="verified_user" className="text-3xl text-primary" />
          <h1 className="text-xl font-bold">FactCheck</h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-secondary hover:bg-muted transition-colors'
                  }`}
              >
                <MaterialIcon icon={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Section */}
      <SignedIn>
        <div className="flex items-center gap-3 border-t border-border pt-6 mt-6">
          <UserButton />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user?.fullName || 'User'}</p>
            <p className="text-xs text-secondary truncate">
              {user?.emailAddresses[0]?.emailAddress || 'user@example.com'}
            </p>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="border-t border-border pt-6 mt-6">
          <SignInButton>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <MaterialIcon icon="login" />
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </aside>
  );
}
