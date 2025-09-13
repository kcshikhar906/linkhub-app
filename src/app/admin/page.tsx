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
import { ExternalLink, Check, Trash2, Loader2, PlusCircle, Link as LinkIcon, Layers, FileClock, AlertCircle, Save, Clock, Pencil, Edit, BookText, Info, ChevronsUpDown, FileText, Map, Phone, Mail, MapPin, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useMemo, forwardRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, query, orderBy, getCountFromServer, where, addDoc } from 'firebase/firestore';
import {
  submissionConverter,
  type SubmittedLink,
  serviceConverter,
  type Service,
  reportConverter,
  type ReportedLink,
  categoryConverter,
  type Category,
} from '@/lib/data';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
  } from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useForm, type SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COUNTRIES, type State } from '@/lib/countries';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { CATEGORY_TAGS } from '@/lib/category-tags';
import { summarizeLinkCard } from '@/ai/flows/summarize-link-card';
import { Skeleton } from '@/components/ui/skeleton';


type GroupedReports = {
  [key: string]: {
    serviceTitle: string;
    serviceId: string;
    reports: ReportedLink[];
  };
}

const serviceFormSchema = z.object({
  title: z.string().min(5),
  link: z.string().url(),
  categorySlug: z.string({ required_error: 'Please select a category.' }),
  description: z.string().min(10),
  country: z.string({ required_error: 'Please select a country.' }),
  state: z.string().optional(),
  verified: z.boolean().optional(),
  serviceType: z.enum(['guide', 'info'], { required_error: 'You must select a service type.' }),
  steps: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).refine(data => {
    if (data.serviceType === 'guide') {
        return !!data.steps && data.steps.length > 10;
    }
    return true;
}, {
    message: 'Steps are required for a guide.',
    path: ['steps'],
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
  
  // State for dialogs
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] = useState<SubmittedLink | null>(null);
  const [isReportsDialogOpen, setIsReportsDialogOpen] = useState(false);
  const [viewingReports, setViewingReports] = useState<{serviceTitle: string; serviceId: string; reports: ReportedLink[] } | null>(null);


  const [categories, setCategories] = useState<Category[]>([]);
  
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

    const submissionsQuery = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
    const submissionsUnsubscribe = onSnapshot(submissionsQuery.withConverter(
      submissionConverter
    ), (snapshot) => {
      const pendingSubmissions = snapshot.docs
        .map((doc) => doc.data())
        .filter(sub => sub.status === 'pending');
      setSubmissions(pendingSubmissions);
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
        fetchCategories();
        submissionsUnsubscribe();
        reportsUnsubscribe();
    }
  }, [user, toast]);
  
  const openReviewDialog = (submission: SubmittedLink) => {
    setReviewingSubmission(submission);
    setIsReviewDialogOpen(true);
  }

  const openReportsDialog = (reportGroup: {serviceTitle: string; serviceId: string; reports: ReportedLink[] }) => {
    setViewingReports(reportGroup);
    setIsReportsDialogOpen(true);
  }
  
  const handleApproveSuccess = () => {
    toast({
        title: 'Link Approved & Published',
        description: "The submission has been successfully added to the directory.",
    });
    setIsReviewDialogOpen(false);
    setReviewingSubmission(null);
  }

  const handleReject = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
     e.stopPropagation();
     if (!reviewingSubmission) return;
     if (!window.confirm(`Are you sure you want to reject and delete the submission "${reviewingSubmission.title}"?`)) return;
     try {
        await deleteDoc(doc(db, 'submissions', reviewingSubmission.id));
        toast({
          title: 'Link Rejected',
          description: `The submission for "${reviewingSubmission.title}" has been deleted.`,
        });
        setIsReviewDialogOpen(false);
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
          {loadingSubmissions ? (
            <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {submissions.map((link) => {
                    const category = categories.find(c => c.slug === link.categorySlug);
                    return (
                        <Card key={link.id} className="flex flex-col cursor-pointer hover:border-primary hover:shadow-lg transition-all" onClick={() => openReviewDialog(link)}>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold leading-tight">{link.title}</CardTitle>
                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                    <Badge variant="secondary">{category?.name || link.categorySlug}</Badge>
                                    <Badge variant="outline">{link.country}{link.state && ` - ${link.state}`}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-sm text-primary hover:underline break-all">
                                    {link.url} <ExternalLink className="inline h-3 w-3" />
                                </a>
                                {link.notes && (
                                  <p className="text-sm text-muted-foreground mt-2 italic line-clamp-3">
                                    &quot;{link.notes}&quot;
                                  </p>
                                )}
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    {link.submittedAt ? formatDistanceToNow(link.submittedAt.toDate(), { addSuffix: true }) : 'Just now'}
                                </div>
                                <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">New</Badge>
                            </CardFooter>
                        </Card>
                    );
                })}
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
      
      {/* Review and Approve Submission Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
              setReviewingSubmission(null);
          }
          setIsReviewDialogOpen(isOpen);
      }}>
           <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                  <DialogTitle>Review & Approve Submission</DialogTitle>
                  <DialogDescription>
                     Review the details for &quot;{reviewingSubmission?.title}&quot; before publishing.
                  </DialogDescription>
              </DialogHeader>
              {reviewingSubmission && (
                <ReviewForm 
                    submission={reviewingSubmission}
                    categories={categories}
                    onSuccess={handleApproveSuccess}
                    onReject={handleReject}
                />
              )}
          </DialogContent>
      </Dialog>

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

// Encapsulated Review Form Component
interface ReviewFormProps {
    submission: SubmittedLink;
    categories: Category[];
    onSuccess: () => void;
    onReject: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

function ReviewForm({ submission, categories, onSuccess, onReject }: ReviewFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [states, setStates] = useState<State[]>([]);

    let initialDescription = submission.notes || '';
    let initialSteps = '';

    if (initialDescription.includes('Steps:\n- ')) {
        const parts = initialDescription.split('Steps:\n- ');
        initialDescription = parts[0].trim();
        if (parts[1]) {
            const stepsAndTags = parts[1].split('\n\nSuggested Tags:');
            initialSteps = stepsAndTags[0].replace(/- /g, '').trim();
        }
    }
    
    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceFormSchema),
        defaultValues: {
            title: submission.title,
            link: submission.url,
            categorySlug: submission.categorySlug,
            country: submission.country,
            state: submission.state,
            description: initialDescription,
            steps: initialSteps,
            tags: [],
            serviceType: initialSteps ? 'guide' : 'info',
            verified: false,
        }
    });

    const selectedCountry = form.watch('country');
    const serviceType = form.watch('serviceType');
    const selectedCategorySlug = form.watch('categorySlug');
    const availableTags = useMemo(() => CATEGORY_TAGS[selectedCategorySlug] || [], [selectedCategorySlug]);

    useEffect(() => {
        const countryData = COUNTRIES.find((c) => c.code === selectedCountry);
        setStates(countryData ? countryData.states : []);
    }, [selectedCountry]);
    
    const handleApprove: SubmitHandler<ServiceFormValues> = async (data) => {
        setIsLoading(true);

        const isGuide = data.serviceType === 'guide';
        
        const serviceData = {
            ...data,
            tags: data.tags || [],
            steps: isGuide ? data.steps?.split('\n').filter((step) => step.trim() !== '') : null,
            phone: !isGuide ? data.phone : null,
            email: !isGuide ? data.email : null,
            address: !isGuide ? data.address : null,
            status: 'published' as const,
            verified: data.verified || false,
        };

        try {
            const servicesCol = collection(db, 'services');
            await addDoc(servicesCol.withConverter(serviceConverter), serviceConverter.toFirestore(serviceData));
            await deleteDoc(doc(db, 'submissions', submission.id));
            onSuccess();
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

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleApprove)}>
                <ServiceFormFields categories={categories} states={states} availableTags={availableTags} serviceType={serviceType} />
                <DialogFooter className="gap-2 sm:gap-0 sm:justify-between pt-4 mt-6 border-t">
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onReject}
                        disabled={isLoading}
                    >
                        <Trash2 className="mr-2" />
                        Reject
                    </Button>
                    <div className="flex gap-2">
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                            {isLoading ? 'Publishing...' : 'Approve & Publish'}
                        </Button>
                    </div>
                </DialogFooter>
            </form>
        </FormProvider>
    );
}


// UI Fields for the form
interface ServiceFormFieldsProps {
    categories: Category[];
    states: State[];
    availableTags: string[];
    serviceType?: 'guide' | 'info';
}

const ServiceFormFields = forwardRef<HTMLDivElement, ServiceFormFieldsProps>(
  ({ categories, states, availableTags, serviceType }, ref) => {
    const form = useFormContext<ServiceFormValues>();

    return (
      <div ref={ref} className="space-y-6 py-6 max-h-[75vh] overflow-y-auto pr-4 -mr-4">
          {/* Core Details */}
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5"/> Core Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <div className="grid gap-3">
                      <Label htmlFor="description">Short Description</Label>
                      <Textarea id="description" placeholder="A brief explanation of the service." {...form.register('description')} />
                      {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
                  </div>
              </CardContent>
          </Card>

          {/* Categorization */}
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><Map className="h-5 w-5"/> Location & Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-3">
                          <Label htmlFor="country">Country</Label>
                          <Select value={form.watch('country')} onValueChange={(value) => form.setValue('country', value, { shouldValidate: true })}>
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
                      <Select value={form.watch('categorySlug')} onValueChange={(value) => form.setValue('categorySlug', value, { shouldValidate: true })}>
                      <SelectTrigger id="categorySlug" aria-label="Select category"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                          {categories.map((cat) => (<SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>))}
                      </SelectContent>
                      </Select>
                      {form.formState.errors.categorySlug && <p className="text-sm text-destructive">{form.formState.errors.categorySlug.message}</p>}
                  </div>
                  {availableTags.length > 0 && (
                      <div className="grid gap-3">
                          <Label>Tags / Sub-categories</Label>
                          <MultiSelect
                              options={availableTags.map(tag => ({ value: tag, label: tag }))}
                              selected={form.watch('tags') || []}
                              onChange={(selected) => form.setValue('tags', selected)}
                              placeholder="Select tags..."
                           />
                           <p className="text-xs text-muted-foreground">Select one or more tags to help users filter.</p>
                      </div>
                  )}
              </CardContent>
          </Card>
          
          {/* Service Content */}
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><BookText className="h-5 w-5"/> Service Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                   <div className="grid gap-3">
                      <Label>Service Type</Label>
                       <ToggleGroup
                          type="single"
                          value={serviceType}
                          onValueChange={(value: 'guide' | 'info') => {
                              if (value) form.setValue('serviceType', value, { shouldValidate: true })
                          }}
                          className="grid grid-cols-2"
                          >
                          <ToggleGroupItem value="guide" aria-label="Select guide type">
                              <BookText className="mr-2 h-4 w-4" />
                              Guide
                          </ToggleGroupItem>
                          <ToggleGroupItem value="info" aria-label="Select info type">
                              <Info className="mr-2 h-4 w-4" />
                              Info
                          </ToggleGroupItem>
                      </ToggleGroup>
                      {form.formState.errors.serviceType && <p className="text-sm text-destructive">{form.formState.errors.serviceType.message}</p>}
                  </div>
                  
                  {serviceType === 'guide' && (
                      <div className="grid gap-3">
                          <Label htmlFor="steps">Steps (one per line)</Label>
                          <Textarea id="steps" rows={5} placeholder="Step 1...\nStep 2...\nStep 3..." {...form.register('steps')} />
                          {form.formState.errors.steps && <p className="text-sm text-destructive">{form.formState.errors.steps.message}</p>}
                      </div>
                  )}
                  
                  {serviceType === 'info' && (
                      <div className="space-y-4 rounded-md border p-4">
                          <h4 className="font-medium text-sm">Contact Information</h4>
                           <div className="grid gap-3">
                              <Label htmlFor="phone">Phone Number</Label>
                               <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input id="phone" type="tel" placeholder="e.g., (02) 1234 5678" {...form.register('phone')} className="pl-10" />
                               </div>
                          </div>
                           <div className="grid gap-3">
                              <Label htmlFor="email">Email Address</Label>
                               <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input id="email" type="email" placeholder="e.g., contact@business.com.au" {...form.register('email')} className="pl-10"/>
                               </div>
                              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                          </div>
                           <div className="grid gap-3">
                              <Label htmlFor="address">Physical Address</Label>
                               <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input id="address" type="text" placeholder="e.g., 123 Example St, Sydney NSW 2000" {...form.register('address')} className="pl-10" />
                              </div>
                          </div>
                      </div>
                  )}
              </CardContent>
          </Card>
          
          <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="verified" checked={form.watch('verified')} onCheckedChange={(checked) => form.setValue('verified', !!checked)} />
              <Label htmlFor="verified" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Mark as Verified
              </Label>
          </div>
      </div>
    );
  }
);
ServiceFormFields.displayName = "ServiceFormFields";

interface MultiSelectProps {
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    className?: string;
    placeholder?: string;
}

function MultiSelect({ options, selected, onChange, className, placeholder = "Select..." }: MultiSelectProps) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
                {selected.length === 0 && placeholder}
                {selected.length === 1 && selected[0]}
                {selected.length > 1 && `${selected.length} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandEmpty>No tag found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    const newSelected = selected.includes(currentValue)
                      ? selected.filter((item) => item !== currentValue)
                      : [...selected, currentValue]
                    onChange(newSelected)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    )
}

export default AdminPage;
