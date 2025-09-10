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
import { ExternalLink, Check, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import {
  submissionConverter,
  type SubmittedLink,
  serviceConverter,
} from '@/lib/data';

function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<SubmittedLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const submissionsCol = collection(db, 'submissions').withConverter(
      submissionConverter
    );
    const unsubscribe = onSnapshot(submissionsCol, (snapshot) => {
      setSubmissions(snapshot.docs.map((doc) => doc.data()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleApprove = async (submission: SubmittedLink) => {
    // Note: For a real app, you'd likely open a modal here
    // to edit/confirm the details before approving.
    // For simplicity, we'll auto-summarize and add.
    
    // This is a placeholder for the AI summarization logic.
    // In a real scenario, you'd call a cloud function or a server-side
    // flow to fetch the URL content and generate a summary.
    const serviceData = {
        title: submission.title,
        description: 'Description generated from URL.', // Placeholder
        steps: ['Step 1 generated from URL', 'Step 2 generated from URL'], // Placeholder
        link: submission.url,
        categorySlug: submission.categorySlug
    };

    try {
        // Add to the public 'services' collection
        const newServiceRef = doc(collection(db, 'services')).withConverter(serviceConverter);
        await setDoc(newServiceRef, serviceData);

        // Delete from the 'submissions' collection
        await deleteDoc(doc(db, 'submissions', submission.id));

        toast({
            title: 'Link Approved',
            description: `Link "${submission.title}" has been approved and published.`,
        });

    } catch (error) {
        console.error("Error approving link: ", error);
        toast({
            variant: 'destructive',
            title: 'Approval Failed',
            description: 'There was an error approving the link.',
        });
    }
  };

  const handleReject = async (id: string, title: string) => {
     try {
        await deleteDoc(doc(db, 'submissions', id));
        toast({
          variant: 'destructive',
          title: 'Link Rejected',
          description: `Link "${title}" has been rejected and removed.`,
        });
     } catch (error) {
         console.error("Error rejecting link: ", error);
         toast({
            variant: 'destructive',
            title: 'Rejection Failed',
            description: 'There was an error rejecting the link.',
        });
     }
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
            {loading ? 'Loading submissions...' : 
                submissions.length > 0
              ? 'Review the links submitted by the community.'
              : 'There are no pending submissions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div> :
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
              {submissions.map((link) => (
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
                        onClick={() => handleApprove(link)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(link.id, link.title)}
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
          }
        </CardContent>
      </Card>
    </>
  );
}

// Note: withAuth is now applied in the layout, so we don't need it here.
export default AdminPage;
