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
import { ExternalLink, Check, Trash2, Loader2, FileClock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import {
  submissionConverter,
  type SubmittedLink,
  serviceConverter,
  reportConverter,
  type ReportedLink,
} from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';

function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<SubmittedLink[]>([]);
  const [reports, setReports] = useState<ReportedLink[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);


  useEffect(() => {
    if (!user) return;
    setLoadingSubmissions(true);
    setLoadingReports(true);

    const submissionsQuery = query(collection(db, 'submissions'), orderBy('title'));
    const submissionsUnsubscribe = onSnapshot(submissionsQuery.withConverter(
      submissionConverter
    ), (snapshot) => {
      setSubmissions(snapshot.docs.map((doc) => doc.data()));
      setLoadingSubmissions(false);
    });
    
    const reportsQuery = query(collection(db, 'reports'), orderBy('reportedAt', 'desc'));
    const reportsUnsubscribe = onSnapshot(reportsQuery.withConverter(reportConverter), (snapshot) => {
        setReports(snapshot.docs.map(doc => doc.data()));
        setLoadingReports(false);
    });


    return () => {
        submissionsUnsubscribe();
        reportsUnsubscribe();
    }
  }, [user]);

  const handleApprove = async (submission: SubmittedLink) => {
    // Note: This is a simplified approval. A real app might have an AI step.
    const serviceData = {
        title: submission.title,
        description: 'Please edit this description.',
        steps: ['Step 1', 'Step 2'],
        link: submission.url,
        categorySlug: submission.categorySlug
    };

    try {
        const newServiceRef = doc(collection(db, 'services')).withConverter(serviceConverter);
        await setDoc(newServiceRef, serviceData);
        await deleteDoc(doc(db, 'submissions', submission.id));

        toast({
            title: 'Link Approved',
            description: `"${submission.title}" has been published.`,
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
          title: 'Link Rejected',
          description: `"${title}" has been rejected.`,
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

  const handleResolveReport = async(reportId: string) => {
    try {
        const reportRef = doc(db, 'reports', reportId);
        await updateDoc(reportRef, { status: 'resolved' });
        toast({
            title: "Report Resolved",
            description: "The report has been marked as resolved."
        })
    } catch (error) {
        console.error("Error resolving report: ", error);
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not update the report status.',
        });
    }
  }

  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Review and manage submissions and reports.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Submissions</CardTitle>
          <CardDescription>
            {loadingSubmissions ? 'Loading submissions...' : 
                submissions.length > 0
              ? 'Review the links submitted by the community.'
              : 'There are no pending submissions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSubmissions ? <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div> :
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
      
      <Card>
        <CardHeader>
          <CardTitle>Reported Links</CardTitle>
          <CardDescription>
            {loadingReports ? 'Loading reports...' : 
                reports.length > 0
              ? 'Review links that have been reported by users.'
              : 'There are no active reports.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingReports ? <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div> :
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Title</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.serviceTitle}</TableCell>
                  <TableCell className="text-muted-foreground max-w-sm">{report.reason}</TableCell>
                  <TableCell>{formatDistanceToNow(report.reportedAt.toDate(), { addSuffix: true })}</TableCell>
                   <TableCell>
                      <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>{report.status}</Badge>
                    </TableCell>
                  <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveReport(report.id)}
                        disabled={report.status === 'resolved'}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Resolved
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          }
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminPage;
