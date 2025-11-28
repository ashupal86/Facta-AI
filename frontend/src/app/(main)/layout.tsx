import { AppSidebar } from '@/components/appSidebar';
import Header from '@/components/header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FactCheck - Facta AI',
  description: 'Advanced AI-powered content analysis to detect misinformation and assess credibility',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full p-4 gap-4">
      <AppSidebar />
      <main className="flex-1 bg-surface rounded-lg flex flex-col p-6">
        <Header />
        {children}
      </main>
    </div>
  );
}
