
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, PlusCircle, Search, Shield, ShoppingBag } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { LinkHubLogo } from '@/components/icons';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { LocationSelector } from './location-selector';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/categories', label: 'All Categories' },
  { href: '/find-shops', label: 'Find Shops' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { user } = useAuth();

  const NavLink = ({ href, label }: { href: string; label:string; }) => {
    const isActive =
      href === '/' ? pathname === href : pathname.startsWith(href);
    const isFindShopsLink = href === '/find-shops';
    
    return (
      <Link
        href={href}
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary flex items-center gap-2',
          isActive ? (isFindShopsLink ? 'text-accent' : 'text-primary') : 'text-muted-foreground',
          isFindShopsLink && 'hover:text-accent'
        )}
        onClick={() => setSheetOpen(false)}
      >
        {isFindShopsLink && <ShoppingBag className="h-4 w-4" />}
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


  if (isMobile) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <LinkHubLogo size={40} />
            <span className="font-headline text-lg">LinkHub</span>
          </Link>
          <div className="flex items-center">
             <Button variant="ghost" size="icon" asChild>
                <Link href="/add">
                    <PlusCircle className="h-6 w-6" />
                    <span className="sr-only">List Your Service</span>
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
                    <LinkHubLogo size={24} />
                    <span className="font-headline text-lg">LinkHub</span>
                  </Link>
                  <div className='mb-8'>
                    <LocationSelector onValueChange={() => setSheetOpen(false)} />
                  </div>
                  <nav className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                      <NavLink key={link.href} {...link} />
                    ))}
                    {adminLink}
                  </nav>
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
          <LinkHubLogo size={24} />
          <span className="font-headline text-lg">LinkHub</span>
        </Link>
        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          {adminLink}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-4">
            <LocationSelector />
            <Button variant="ghost" size="icon" asChild>
                <Link href="/search">
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                </Link>
            </Button>
             <Button variant="outline" size="sm" asChild>
                <Link href="/add">
                    <PlusCircle />
                    List Your Service
                </Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
