import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FactCheck - Facta AI",
  description: "Advanced AI-powered content analysis to detect misinformation and assess credibility",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}
