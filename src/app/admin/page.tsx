'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SUBMITTED_LINKS } from '@/lib/data';
import { ExternalLink, Check, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    toast({
      title: 'Link Approved',
      description: `Link ${id} has been approved and will be added.`,
    });
    // Here you would typically call a function to move this data to your main SERVICES list
  };

  const handleReject = (id: string) => {
    toast({
      variant: 'destructive',
      title: 'Link Rejected',
      description: `Link ${id} has been rejected and removed.`,
    });
    // Here you would typically call a function to delete this data
  };

  return (
    <>
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}! Review and manage link submissions
            below.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Submissions</CardTitle>
          <CardDescription>
            {SUBMITTED_LINKS.length > 0
              ? 'Review the links submitted by the community.'
              : 'There are no pending submissions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SUBMITTED_LINKS.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{link.categorySlug}</Badge>
                  </TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {link.url.substring(0, 30)}...
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TableCell>
                  <TableCell>{link.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(link.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(link.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

// Note: withAuth is now applied in the layout, so we don't need it here.
export default AdminPage;
