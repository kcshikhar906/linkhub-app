'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, PlusCircle, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { LinkHubLogo } from '@/components/icons';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive =
      href === '/' ? pathname === href : pathname.startsWith(href);
    const isNepalLink = href === '/nepal';
    return (
      <Link
        href={href}
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          isActive ? (isNepalLink ? 'text-accent' : 'text-primary') : 'text-muted-foreground',
          isNepalLink && 'hover:text-accent'
        )}
        onClick={() => setSheetOpen(false)}
      >
        {label}
      </Link>
    );
  };

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
          <LinkHubLogo className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg">LinkHub</span>
        </Link>
        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
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
                    Add New Link
                </Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
