
'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Check, Trash2, Loader2, Link as LinkIcon, Layers, FileClock, AlertCircle, Edit, Clock, Pencil, Mail, Phone, ShoppingBag, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, query, orderBy, getCountFromServer, where } from 'firebase/firestore';
import {
  submissionConverter,
  type SubmittedContact,
  reportConverter,
  type ReportedLink,
} from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type GroupedReports = {
  [key: string]: {
    serviceTitle: string;
    serviceId: string;
    reports: ReportedLink[];
  };
}

function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<SubmittedContact[]>([]);
  const [groupedReports, setGroupedReports] = useState<GroupedReports>({});
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [stats, setStats] = useState({ services: 0, categories: 0, submissions: 0, reports: 0});
  const [loadingStats, setLoadingStats] = useState(true);
  
  // State for dialogs
  const [isReportsDialogOpen, setIsReportsDialogOpen] = useState(false);
  const [viewingReports, setViewingReports] = useState<{serviceTitle: string; serviceId: string; reports: ReportedLink[] } | null>(null);
  
  useEffect(() => {
    if (!user) return;
    setLoadingSubmissions(true);
    setLoadingReports(true);
    setLoadingStats(true);
    
    const fetchStats = async () => {
        try {
            const servicesCol = collection(db, 'services');
            const categoriesCol = collection(db, 'categories');
            const submissionsCol = query(collection(db, 'submissions'), where('status', '==', 'pending'));
            const reportsCol = query(collection(db, 'reports'), where('status', '==', 'pending'));

            const [servicesSnapshot, categoriesSnapshot, submissionsSnapshot, reportsSnapshot] = await Promise.all([
                getCountFromServer(servicesCol),
                getCountFromServer(categoriesCol),
                getCountFromServer(submissionsCol),
                getCountFromServer(reportsCol),
            ]);

            setStats({
                services: servicesSnapshot.data().count,
                categories: categoriesSnapshot.data().count,
                submissions: submissionsSnapshot.data().count,
                reports: reportsSnapshot.data().count
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch dashboard statistics.'})
        }
        setLoadingStats(false);
    }

    fetchStats();

    const submissionsQuery = query(collection(db, 'submissions'), where('status', '==', 'pending'), orderBy('submittedAt', 'desc'));
    const submissionsUnsubscribe = onSnapshot(submissionsQuery.withConverter(submissionConverter), (snapshot) => {
      setSubmissions(snapshot.docs.map((doc) => doc.data()));
      setLoadingSubmissions(false);
    }, (error) => {
      console.error("Error fetching submissions:", error);
      setLoadingSubmissions(false);
    });
    
    const reportsQuery = query(collection(db, 'reports'), orderBy('reportedAt', 'desc'));
    const reportsUnsubscribe = onSnapshot(reportsQuery.withConverter(reportConverter), (snapshot) => {
        const reports = snapshot.docs.map(doc => doc.data());
        const grouped = reports.reduce((acc, report) => {
          if (report.status === 'pending') {
            const { serviceId, serviceTitle } = report;
            if (!acc[serviceId]) {
              acc[serviceId] = { serviceTitle, serviceId, reports: [] };
            }
            acc[serviceId].reports.push(report);
          }
          return acc;
        }, {} as GroupedReports)
        setGroupedReports(grouped);
        setLoadingReports(false);
    });


    return () => {
        submissionsUnsubscribe();
        reportsUnsubscribe();
    }
  }, [user, toast]);
  
  const openReportsDialog = (reportGroup: {serviceTitle: string; serviceId: string; reports: ReportedLink[] }) => {
    setViewingReports(reportGroup);
    setIsReportsDialogOpen(true);
  }

  const handleSubmissionAction = async (id: string, newStatus: 'resolved' | 'delete') => {
    try {
        if (newStatus === 'delete') {
            await deleteDoc(doc(db, 'submissions', id));
            toast({ title: 'Submission Deleted' });
        } else {
            await updateDoc(doc(db, 'submissions', id), { status: 'resolved' });
            toast({ title: 'Submission Resolved' });
        }
    } catch (error) {
        console.error("Error updating submission: ", error);
        toast({
           variant: 'destructive',
           title: 'Action Failed',
           description: 'There was an error updating the submission.',
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

  const SubmissionTypeIcon = ({ type }: { type: SubmittedContact['submissionType']}) => {
    switch (type) {
        case 'service': return <LinkIcon className="h-4 w-4" />;
        case 'shop': return <ShoppingBag className="h-4 w-4" />;
        case 'event': return <Calendar className="h-4 w-4" />;
        default: return null;
    }
  }

  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your site.
          </p>
        </div>
         <Button asChild>
            <Link href="/admin/manage-links">
                <Pencil className="mr-2"/>
                Manage Links
            </Link>
        </Button>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                <LinkIcon className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                {loadingStats ? <Loader2 className="animate-spin" /> : <div className="text-2xl font-bold">{stats.services}</div>}
                <p className="text-xs text-muted-foreground">Live on the site</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                {loadingStats ? <Loader2 className="animate-spin" /> : <div className="text-2xl font-bold">{stats.categories}</div>}
                 <p className="text-xs text-muted-foreground">Service categories</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Inquiries</CardTitle>
                <FileClock className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
               {loadingStats ? <Loader2 className="animate-spin" /> : <div className="text-2xl font-bold">{stats.submissions}</div>}
                 <p className="text-xs text-muted-foreground">Awaiting follow-up</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                {loadingStats ? <Loader2 className="animate-spin" /> : <div className="text-2xl font-bold">{stats.reports}</div>}
                <p className="text-xs text-muted-foreground">Issues reported by users</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Inquiries</CardTitle>
          <CardDescription>
            {loadingSubmissions ? 'Loading inquiries...' : 
                submissions.length > 0
              ? 'Contact these users to get more details about their submissions.'
              : 'There are no pending inquiries.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSubmissions ? (
            <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {submissions.map((sub) => (
                    <Card key={sub.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold leading-tight flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    {sub.name}
                                </CardTitle>
                                <Badge variant="secondary" className="capitalize flex gap-2">
                                   <SubmissionTypeIcon type={sub.submissionType} />
                                   {sub.submissionType}
                                </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground pt-2 space-y-1">
                                <a href={`mailto:${sub.email}`} className="flex items-center gap-2 hover:text-primary">
                                    <Mail className="h-4 w-4" /> {sub.email}
                                </a>
                                {sub.phone && (
                                    <a href={`tel:${sub.phone}`} className="flex items-center gap-2 hover:text-primary">
                                        <Phone className="h-4 w-4" /> {sub.phone}
                                    </a>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground italic line-clamp-3">
                                &quot;{sub.notes}&quot;
                            </p>
                        </CardContent>
                        <CardFooter className="justify-between">
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                               <Clock className="h-3 w-3" />
                                {sub.submittedAt ? formatDistanceToNow(sub.submittedAt.toDate(), { addSuffix: true }) : 'Just now'}
                            </p>
                            <div className="flex gap-2">
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="outline"><Trash2/></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to delete this inquiry?</AlertDialogTitle>
                                            <AlertDialogDescription>This action is permanent.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleSubmissionAction(sub.id, 'delete')}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button size="sm" onClick={() => handleSubmissionAction(sub.id, 'resolved')}>
                                    <Check className="mr-2"/> Mark as Resolved
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
             </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Reported Links</CardTitle>
          <CardDescription>
            {loadingReports ? 'Loading reports...' : 
                Object.keys(groupedReports).length > 0
              ? 'Review links that have been reported by users.'
              : 'There are no active reports.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingReports ? <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div> :
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(groupedReports).map(([serviceId, group]) => (
                <Card key={serviceId} className="flex flex-col cursor-pointer hover:border-destructive/50 hover:shadow-lg transition-all" onClick={() => openReportsDialog(group)}>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold leading-tight">{group.serviceTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <Badge variant="destructive">{group.reports.length} pending report{group.reports.length > 1 && 's'}</Badge>
                  </CardContent>
                   <CardFooter className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Latest: {formatDistanceToNow(group.reports[0].reportedAt.toDate(), { addSuffix: true })}
                   </CardFooter>
                </Card>
              ))}
            </div>
          }
        </CardContent>
      </Card>

      {/* View Reports Dialog */}
      <Dialog open={isReportsDialogOpen} onOpenChange={setIsReportsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Reports for &quot;{viewingReports?.serviceTitle}&quot;</DialogTitle>
            <DialogDescription>Review and resolve the issues reported by users for this service.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingReports?.reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className='max-w-xs'>{report.reason}</TableCell>
                      <TableCell>{report.reporterEmail}</TableCell>
                      <TableCell>{formatDistanceToNow(report.reportedAt.toDate(), { addSuffix: true })}</TableCell>
                      <TableCell className='text-right'>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveReport(report.id)}
                            disabled={report.status === 'resolved'}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </div>
          <DialogFooter className="justify-between">
            <Button asChild variant="secondary">
                <Link href={`/admin/manage-links?edit=${viewingReports?.serviceId}`} target="_blank">
                    <Edit className="mr-2 h-4 w-4" />
                    Manage Service
                </Link>
            </Button>
            <DialogClose asChild><Button>Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default AdminPage;
