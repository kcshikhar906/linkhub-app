'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, PlusCircle, Search, Shield, LogIn, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { LinkHubLogo } from '@/components/icons';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/categories', label: 'All Categories' },
  { href: '/nepal', label: 'For Nepal' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut(auth);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/');
  };

  const NavLink = ({ href, label }: { href: string; label:string; }) => {
    const isActive =
      href === '/' ? pathname === href : pathname.startsWith(href);
    const isNepalLink = href === '/nepal';
    
    return (
      <Link
        href={href}
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary flex items-center gap-2',
          isActive ? (isNepalLink ? 'text-accent' : 'text-primary') : 'text-muted-foreground',
          isNepalLink && 'hover:text-accent'
        )}
        onClick={() => setSheetOpen(false)}
      >
        {label}
      </Link>
    );
  };
  
  // Conditionally render admin link
  const adminLink = user ? (
    <Link
      href="/admin"
      className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 text-primary"
      onClick={() => setSheetOpen(false)}
    >
      <Shield className="h-4 w-4" />
      Admin
    </Link>
  ) : null;

  const authButton = user ? (
    <Button onClick={handleLogout} variant="outline" size="sm">
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  ) : (
    <Button asChild variant="outline" size="sm">
      <Link href="/login">
        <LogIn className="h-4 w-4 mr-2" />
        Admin Login
      </Link>
    </Button>
  );

  if (isMobile) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <LinkHubLogo className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg">LinkHub</span>
          </Link>
          <div className="flex items-center">
             <Button variant="ghost" size="icon" asChild>
                <Link href="/add">
                    <PlusCircle className="h-6 w-6" />
                    <span className="sr-only">Add Link</span>
                </Link>
            </Button>
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="p-4">
                  <Link href="/" className="flex items-center gap-2 font-bold mb-8" onClick={() => setSheetOpen(false)}>
                    <LinkHubLogo className="h-6 w-6 text-primary" />
                    <span className="font-headline text-lg">LinkHub</span>
                  </Link>
                  <nav className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                      <NavLink key={link.href} {...link} />
                    ))}
                    {adminLink}
                  </nav>
                  <div className="mt-8 pt-4 border-t">
                    {authButton}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center gap-2 font-bold">
          <LinkHubLogo className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg">LinkHub</span>
        </Link>
        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          {adminLink}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/search">
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                </Link>
            </Button>
             <Button variant="outline" size="sm" asChild>
                <Link href="/add">
                    <PlusCircle />
                    Suggest a Link
                </Link>
            </Button>
            {authButton}
        </div>
      </div>
    </header>
  );
}
