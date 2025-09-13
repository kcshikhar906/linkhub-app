'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} LinkHub. All rights reserved.</p>
          <nav className="flex gap-4 mt-4 md:mt-0">
            <Link href="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Report an Error
            </Link>
             {user ? (
                <Link href="/admin" className="hover:text-primary transition-colors">
                    Admin Dashboard
                </Link>
             ) : (
                <Link href="/login" className="hover:text-primary transition-colors">
                    Admin
                </Link>
             )}
          </nav>
        </div>
      </div>
    </footer>
  );
}
