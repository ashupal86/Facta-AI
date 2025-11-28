'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ModeToggle } from './common/theme-toggle';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MaterialIcon from './common/material-icon';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isChatPage = pathname?.startsWith('/chat/');

  // Determine page title
  let pageTitle = 'Updates';
  if (isChatPage) {
    pageTitle = 'Chat';
  } else if (pathname === '/headlines') {
    pageTitle = 'Headlines';
  } else if (pathname === '/factcheck') {
    pageTitle = 'FactCheck';
  } else if (pathname === '/ask') {
    pageTitle = "Today's Ask";
  } else if (pathname === '/trending') {
    pageTitle = 'Trending';
  } else if (pathname === '/saved') {
    pageTitle = 'Saved';
  }

  return (
    <header className="flex-shrink-0 pb-6 border-b border-border flex justify-between items-center">
      <div className="flex items-center gap-4">
        {isChatPage && (
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-full hover:bg-background transition-colors"
          >
            <MaterialIcon icon="arrow_back" className="text-secondary" />
          </button>
        )}
        <h2 className="text-xl font-bold">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2.5 rounded-full hover:bg-background transition-colors">
          <MaterialIcon icon="search" className="text-secondary" />
        </button>

        <button className="p-2.5 rounded-full hover:bg-background transition-colors">
          <MaterialIcon icon="notifications" className="text-secondary" />
        </button>

        <ModeToggle />

        <SignedOut>
          <SignInButton>
            <button className="bg-primary text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
              <MaterialIcon icon="login" className="text-base" />
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
