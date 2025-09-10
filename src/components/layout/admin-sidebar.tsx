'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Link2,
  LogOut,
  Home,
  Settings,
  Layers,
  Upload,
} from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { LinkHubLogo } from '../icons';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/manage-links', label: 'Manage Links', icon: Link2 },
  { href: '/admin/manage-categories', label: 'Manage Categories', icon: Layers },
  { href: '/admin/bulk-import', label: 'Bulk Import', icon: Upload },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut(auth);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/login');
  };

  const NavLink = ({ href, icon: Icon, label }: (typeof adminNavLinks)[0]) => {
    const isActive = pathname.startsWith(href) && (href !== '/admin' || pathname === '/admin');
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
              isActive && 'bg-accent text-accent-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">{label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <aside className="sticky top-0 z-30 flex h-screen w-14 flex-col border-r bg-background">
        <nav className="flex flex-col items-center gap-4 px-2 py-5">
          <Link
            href="/admin"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <LinkHubLogo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">LinkHub Admin</span>
          </Link>
          {adminNavLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-5">
           <Tooltip>
            <TooltipTrigger asChild>
                <Link
                    href="/"
                    target="_blank"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                    <Home className="h-5 w-5" />
                    <span className="sr-only">Go to Homepage</span>
                </Link>
            </TooltipTrigger>
             <TooltipContent side="right">Go to Homepage</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </nav>
      </aside>
    </TooltipProvider>
  );
}
