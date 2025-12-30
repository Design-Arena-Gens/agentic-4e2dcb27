import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Agentic WhatsApp Control',
  description:
    'Centralize every WhatsApp conversation with automation-ready tooling, webhook ingestion, and proactive messaging.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-emerald-50/40">
      <body className={`${inter.className} min-h-screen bg-transparent`}>{children}</body>
    </html>
  );
}
