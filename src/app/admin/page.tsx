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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Check, Trash2, Loader2, PlusCircle, ArrowUpRight, Link as LinkIcon, Layers, FileClock, AlertCircle, Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, setDoc, updateDoc, query, orderBy, getCountFromServer, where, addDoc } from 'firebase/firestore';
import {
  submissionConverter,
  type SubmittedLink,
  serviceConverter,
  reportConverter,
  type ReportedLink,
  categoryConverter,
  type Category,
} from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COUNTRIES, type State } from '@/lib/countries';


type GroupedReports = {
  [key: string]: {
    serviceTitle: string;
    reports: ReportedLink[];
  };
}

const serviceFormSchema = z.object({
  title: z.string().min(5),
  link: z.string().url(),
  categorySlug: z.string({ required_error: 'Please select a category.' }),
  description: z.string().min(10),
  steps: z.string().min(10),
  country: z.string({ required_error: 'Please select a country.' }),
  state: z.string().optional(),
  verified: z.boolean().optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<SubmittedLink[]>([]);
  const [groupedReports, setGroupedReports] = useState<GroupedReports>({});
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [stats, setStats] = useState({ services: 0, categories: 0, submissions: 0, reports: 0});
  const [loadingStats, setLoadingStats] = useState(true);
  
  // State for the review dialog
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] = useState<SubmittedLink | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      verified: false,
    }
  });

  const selectedCountry = form.watch('country');

  useEffect(() => {
    const countryData = COUNTRIES.find((c) => c.code === selectedCountry);
    setStates(countryData ? countryData.states : []);
    if (!reviewingSubmission) {
        form.setValue('state', undefined);
    }
  }, [selectedCountry, form, reviewingSubmission]);


  useEffect(() => {
    if (!user) return;
    setLoadingSubmissions(true);
    setLoadingReports(true);
    setLoadingStats(true);
    
    const fetchCategories = onSnapshot(
      query(collection(db, 'categories'), orderBy('name')),
      (snapshot) => {
        setCategories(
          snapshot.docs.map((doc) => categoryConverter.fromFirestore(doc))
        );
      }
    );

    const fetchStats = async () => {
        try {
            const servicesCol = collection(db, 'services');
            const categoriesCol = collection(db, 'categories');
            const submissionsCol = query(collection(db, 'submissions'), where('status', '==', 'pending'));
            const reportsCol = query(collection(db, 'reports'), where('status', '==', 'pending'));

            const servicesSnapshot = await getCountFromServer(servicesCol);
            const categoriesSnapshot = await getCountFromServer(categoriesCol);
            const submissionsSnapshot = await getCountFromServer(submissionsCol);
            const reportsSnapshot = await getCountFromServer(reportsCol);

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

    const submissionsQuery = query(collection(db, 'submissions'), where('status', '==', 'pending'), orderBy('title'));
    const submissionsUnsubscribe = onSnapshot(submissionsQuery.withConverter(
      submissionConverter
    ), (snapshot) => {
      setSubmissions(snapshot.docs.map((doc) => doc.data()));
      setLoadingSubmissions(false);
    });
    
    const reportsQuery = query(collection(db, 'reports'), orderBy('reportedAt', 'desc'));
    const reportsUnsubscribe = onSnapshot(reportsQuery.withConverter(reportConverter), (snapshot) => {
        const reports = snapshot.docs.map(doc => doc.data());
        const grouped = reports.reduce((acc, report) => {
          if (report.status === 'pending') {
            const { serviceId, serviceTitle } = report;
            if (!acc[serviceId]) {
              acc[serviceId] = { serviceTitle, reports: [] };
            }
            acc[serviceId].reports.push(report);
          }
          return acc;
        }, {} as GroupedReports)
        setGroupedReports(grouped);
        setLoadingReports(false);
    });


    return () => {
        fetchCategories();
        submissionsUnsubscribe();
        reportsUnsubscribe();
    }
  }, [user, toast]);
  
  const openReviewDialog = (submission: SubmittedLink) => {
    setReviewingSubmission(submission);
    form.reset({
        title: submission.title,
        link: submission.url,
        categorySlug: submission.categorySlug,
        country: submission.country,
        state: submission.state,
        // Default values for fields not in submission
        description: '', 
        steps: '',
        verified: false,
    });
    setIsReviewDialogOpen(true);
  }

  const handleApprove: SubmitHandler<ServiceFormValues> = async (data) => {
    if (!reviewingSubmission) return;
    setIsLoading(true);

    const serviceData = {
        ...data,
        steps: data.steps.split('\n').filter(Boolean),
        status: 'published' as const,
    };

    try {
        const servicesCol = collection(db, 'services').withConverter(serviceConverter);
        await addDoc(servicesCol, serviceData);
        await deleteDoc(doc(db, 'submissions', reviewingSubmission.id));

        toast({
            title: 'Link Approved & Published',
            description: `"${data.title}" has been successfully added to the directory.`,
        });
        setIsReviewDialogOpen(false);
        setReviewingSubmission(null);

    } catch (error) {
        console.error("Error approving link: ", error);
        toast({
            variant: 'destructive',
            title: 'Approval Failed',
            description: 'There was an error approving the link.',
        });
    }
    setIsLoading(false);
  };

  const handleReject = async (id: string, title: string) => {
     if (!window.confirm(`Are you sure you want to reject and delete the submission "${title}"?`)) return;
     try {
        await deleteDoc(doc(db, 'submissions', id));
        toast({
          title: 'Link Rejected',
          description: `The submission for "${title}" has been deleted.`,
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
  
  const ServiceFormFields = () => (
    <div className="space-y-4 py-6 max-h-[70vh] overflow-y-auto pr-4">
        <div className="grid gap-3">
            <Label htmlFor="title">Service Title</Label>
            <Input id="title" type="text" placeholder="e.g., How to apply for a TFN" {...form.register('title')} />
            {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
        </div>
        <div className="grid gap-3">
            <Label htmlFor="link">Official URL</Label>
            <Input id="link" type="url" placeholder="https://service.gov.au/..." {...form.register('link')} />
            {form.formState.errors.link && <p className="text-sm text-destructive">{form.formState.errors.link.message}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-3">
                <Label htmlFor="country">Country</Label>
                <Select value={form.watch('country')} onValueChange={(value) => form.setValue('country', value)}>
                <SelectTrigger id="country"><SelectValue placeholder="Select a country" /></SelectTrigger>
                <SelectContent>
                    {COUNTRIES.map((c) => (<SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>))}
                </SelectContent>
                </Select>
                {form.formState.errors.country && <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>}
            </div>
            <div className="grid gap-3">
                <Label htmlFor="state">State / Province</Label>
                <Select value={form.watch('state')} onValueChange={(value) => form.setValue('state', value)} disabled={states.length === 0}>
                <SelectTrigger id="state"><SelectValue placeholder="Select a state (if applicable)" /></SelectTrigger>
                <SelectContent>
                    {states.map((s) => (<SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>))}
                </SelectContent>
                </Select>
            </div>
        </div>
        <div className="grid gap-3">
            <Label htmlFor="categorySlug">Category</Label>
            <Select value={form.watch('categorySlug')} onValueChange={(value) => form.setValue('categorySlug', value)}>
            <SelectTrigger id="categorySlug" aria-label="Select category"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
                {categories.map((cat) => (<SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>))}
            </SelectContent>
            </Select>
            {form.formState.errors.categorySlug && <p className="text-sm text-destructive">{form.formState.errors.categorySlug.message}</p>}
        </div>
        <div className="grid gap-3">
            <Label htmlFor="description">Short Description</Label>
            <Textarea id="description" placeholder="A brief explanation of the service." {...form.register('description')} />
            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
        </div>
        <div className="grid gap-3">
            <Label htmlFor="steps">Steps (one per line)</Label>
            <Textarea id="steps" rows={5} placeholder="Step 1...\nStep 2...\nStep 3..." {...form.register('steps')} />
            {form.formState.errors.steps && <p className="text-sm text-destructive">{form.formState.errors.steps.message}</p>}
        </div>
        <div className="flex items-center space-x-2">
            <Checkbox id="verified" checked={form.watch('verified')} onCheckedChange={(checked) => form.setValue('verified', !!checked)} />
            <Label htmlFor="verified" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Mark as Verified
            </Label>
        </div>
    </div>
  );


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
                <PlusCircle className="mr-2"/>
                Add New Link
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
                <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
                <FileClock className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
               {loadingStats ? <Loader2 className="animate-spin" /> : <div className="text-2xl font-bold">{stats.submissions}</div>}
                 <p className="text-xs text-muted-foreground">Awaiting review</p>
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
            <Accordion type="multiple" className="w-full">
               {submissions.map((link) => (
                <AccordionItem value={link.id} key={link.id}>
                    <AccordionTrigger>
                        <div className="flex items-center gap-4 flex-1 text-left">
                            <span className="font-medium">{link.title}</span>
                            <Badge variant="secondary">{link.categorySlug}</Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 px-2">
                            <div className="text-sm">
                                <span className="font-semibold text-muted-foreground">URL: </span>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{link.url} <ExternalLink className="inline h-4 w-4" /></a>
                            </div>
                             <div className="text-sm">
                                <span className="font-semibold text-muted-foreground">Location: </span>
                                <span>{link.country}{link.state && `, ${link.state}`}</span>
                            </div>
                            <div className="text-sm">
                                <span className="font-semibold text-muted-foreground">Submitted by: </span>
                                <span>{link.email}</span>
                            </div>
                             {link.notes && (
                                <div className="text-sm pt-2 border-t">
                                    <p className="font-semibold text-muted-foreground mb-1">Additional Notes:</p>
                                    <p className="p-3 bg-muted rounded-md whitespace-pre-wrap">{link.notes}</p>
                                </div>
                             )}
                             <div className="flex gap-2 justify-end pt-4">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openReviewDialog(link)}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Review & Approve
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
                        </div>
                    </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          }
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
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedReports).map(([serviceId, group]) => (
                <AccordionItem value={serviceId} key={serviceId}>
                  <AccordionTrigger>
                    <div className='flex items-center gap-4'>
                      <span className='font-medium'>{group.serviceTitle}</span>
                      <Badge variant="destructive">{group.reports.length} pending</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reason</TableHead>
                          <TableHead>Reporter</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className='max-w-xs'>{report.reason}</TableCell>
                            <TableCell>{report.reporterEmail}</TableCell>
                            <TableCell>{formatDistanceToNow(report.reportedAt.toDate(), { addSuffix: true })}</TableCell>
                            <TableCell>
                              <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>
                                {report.status}
                              </Badge>
                            </TableCell>
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
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          }
        </CardContent>
      </Card>
      
      {/* Review and Approve Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
              setReviewingSubmission(null);
          }
          setIsReviewDialogOpen(isOpen);
      }}>
           <DialogContent className="sm:max-w-2xl">
              <form onSubmit={form.handleSubmit(handleApprove)}>
                  <DialogHeader>
                      <DialogTitle>Review & Approve Submission</DialogTitle>
                      <DialogDescription>
                          Edit and finalize the details for &quot;{reviewingSubmission?.title}&quot; before publishing.
                      </DialogDescription>
                  </DialogHeader>
                  <ServiceFormFields />
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                        {isLoading ? 'Publishing...' : 'Approve & Publish'}
                    </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

    </div>
  );
}

export default AdminPage;
