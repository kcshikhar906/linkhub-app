
"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

// The admin UID is now read from environment variables for better security
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        } else if (user.uid !== ADMIN_UID) {
          // If the user is logged in but not an admin, send them to the homepage.
          router.push('/');
        }
      }
    }, [user, loading, router]);

    // Show a loading skeleton while checking auth status
    if (loading || !user || user.uid !== ADMIN_UID) {
       return (
         <div className="flex h-screen w-full items-center justify-center">
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">Verifying access...</p>
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-24 w-64" />
            </div>
         </div>
       )
    }

    // If authorized, render the component
    return <Component {...props} />;
  };

  AuthComponent.displayName = `WithAuth(${Component.displayName || Component.name || 'Component'})`;
  
  return AuthComponent;
};

export default withAuth;
