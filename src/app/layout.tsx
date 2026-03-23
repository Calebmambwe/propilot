import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCReactProvider } from '@/trpc/client';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProPilot — AI Proposal Intelligence',
  description:
    'Draft, send, and win more proposals with AI-powered insights and section-level analytics.',
  openGraph: {
    title: 'ProPilot — AI Proposal Intelligence',
    description: 'Win more proposals with AI coaching and prospect engagement analytics.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
