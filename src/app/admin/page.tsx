'use client';

import type { Metadata } from 'next';
import withAuth from '@/components/auth/with-auth';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBMITTED_LINKS } from '@/lib/data';
import { ExternalLink, Check, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// export const metadata: Metadata = {
//   title: 'Admin',
//   description: 'Admin dashboard for LinkHub.',
// };

function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleApprove = (id: string) => {
      toast({ title: "Link Approved", description: `Link ${id} has been approved and will be added.`});
      // Here you would typically call a function to move this data to your main SERVICES list
  }

  const handleReject = (id: string) => {
    toast({ variant: "destructive", title: "Link Rejected", description: `Link ${id} has been rejected and removed.`});
    // Here you would typically call a function to delete this data
  }


  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mb-8">
          Welcome back, {user?.email}! Review and manage link submissions below.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Pending Submissions</CardTitle>
            <CardDescription>
              {SUBMITTED_LINKS.length > 0
                ? "Review the links submitted by the community."
                : "There are no pending submissions."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SUBMITTED_LINKS.map(link => (
                <div key={link.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{link.title}</h3>
                            <Badge variant="secondary">{link.categorySlug}</Badge>
                        </div>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all flex items-center gap-1">
                           {link.url} <ExternalLink className="h-4 w-4" />
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">Submitted by: {link.email}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" onClick={() => handleApprove(link.id)}>
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                        </Button>
                         <Button size="sm" variant="destructive" onClick={() => handleReject(link.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Reject
                        </Button>
                    </div>
                </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default withAuth(AdminPage);
