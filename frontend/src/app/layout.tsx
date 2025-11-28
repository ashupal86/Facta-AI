import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/themes';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const workSans = Work_Sans({
  variable: '--font-work-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

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
    <ClerkProvider
      appearance={{
        baseTheme: shadcn,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            rel="stylesheet"
          />
        </head>
        <body className={`${workSans.variable} font-sans antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
