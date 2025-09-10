'use client';

import type { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import withAuth from '@/components/auth/with-auth';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

/*
export const metadata: Metadata = {
  title: 'Admin',
  description: 'Admin dashboard for LinkHub.',
};
*/
// Metadata export is not allowed in a client component.
// We can set the title in the RootLayout or individual pages if needed.

function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-muted/40">
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}

export default withAuth(AdminLayout);
