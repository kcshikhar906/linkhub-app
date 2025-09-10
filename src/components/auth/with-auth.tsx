"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

// IMPORTANT: Replace with your actual admin User ID from Firebase Auth
const ADMIN_UID = "Gz2nLtgMrchgprKNancZmSa5NQl1"; 

const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!user || user.uid !== ADMIN_UID)) {
        router.push('/login');
      }
    }, [user, loading, router]);

    if (loading || !user || user.uid !== ADMIN_UID) {
       return (
         <div className="container mx-auto p-4">
            <Skeleton className="h-12 w-1/2 mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
         </div>
       )
    }

    return <Component {...props} />;
  };

  AuthComponent.displayName = `WithAuth(${Component.displayName || Component.name || 'Component'})`;
  
  return AuthComponent;
};

export default withAuth;
