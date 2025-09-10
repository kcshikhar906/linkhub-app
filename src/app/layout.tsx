import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/auth-context';

export const metadata: Metadata = {
  title: {
    default: 'LinkHub - Your Guide to Essential Services',
    template: '%s | LinkHub',
  },
  description:
    'LinkHub is a clean, hyper-efficient, and universally accessible digital directory. It acts as a centralized bridge between users and essential government or institutional services by cutting through the clutter of official websites.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <AuthProvider>
            {/* The children here will be either the public site with its own layout, or the admin panel with its own layout */}
            {children}
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
