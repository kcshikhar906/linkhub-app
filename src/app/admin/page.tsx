import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Admin dashboard for LinkHub.',
};

export default function AdminPage() {
  // In a real application, you would protect this page.
  // For example, using a library like NextAuth.js or Firebase Auth.
  // const { data: session, status } = useSession();
  // const router = useRouter();

  // if (status === 'loading') {
  //   return <p>Loading...</p>;
  // }

  // if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
  //    router.push('/login');
  //    return null;
  // }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline mb-8">
          Admin Dashboard
        </h1>
        <div className="bg-card p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold font-headline mb-4">Welcome, Admin!</h2>
            <p className="text-muted-foreground">
                This is the admin area. You can manage links, categories, and users from here.
            </p>
            {/* Admin-specific components and data will go here */}
        </div>
      </div>
    </div>
  );
}
