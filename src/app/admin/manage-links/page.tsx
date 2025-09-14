'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  type Category,
  type Service,
  categoryConverter,
  serviceConverter,
  getIcon,
} from '@/lib/data';
import { COUNTRIES, type State } from '@/lib/countries';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Trash2,
  Loader2,
  EyeOff,
  Eye,
  Edit,
  ArrowLeft,
  LayoutGrid,
  List,
  Save,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  BookText,
  Info,
  Check,
  ChevronsUpDown,
  FileText,
  Tags,
  Map,
  ExternalLink,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useForm, type SubmitHandler, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useMemo, Suspense, forwardRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CATEGORY_TAGS } from '@/lib/category-tags';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

function ManageLinksPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editServiceId = searchParams.get('edit');

  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);


  // View management state
  const [currentView, setCurrentView] = useState<'categories' | 'links'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [linksDisplayMode, setLinksDisplayMode] = useState<'grid' | 'list'>('grid');

  // Filters for the list
  const [countryFilter, setCountryFilter] = useState<string>('all');
  
  const openViewDialog = (service: Service) => {
    setViewingService(service);
    setIsViewDialogOpen(true);
  };

  const openEditDialogFromView = () => {
    if (viewingService) {
      openEditDialog(viewingService);
      setIsViewDialogOpen(false); // Close view dialog
    }
  };


  const openEditDialog = async (serviceOrId: Service | string) => {
    let service: Service | null = null;
    if (typeof serviceOrId === 'string') {
        try {
            const serviceRef = doc(db, 'services', serviceOrId).withConverter(serviceConverter);
            const serviceSnap = await getDoc(serviceRef);
            if (serviceSnap.exists()) {
                service = serviceSnap.data();
            } else {
                 toast({ variant: 'destructive', title: 'Error', description: 'Service not found.' });
                 return;
            }
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch service.' });
             return;
        }
    } else {
        service = serviceOrId;
    }
    
    if (service) {
        setEditingService(service);
        setIsEditDialogOpen(true);
    }
  }

  useEffect(() => {
    if (editServiceId) {
      openEditDialog(editServiceId);
      // Optional: remove the query param from URL after opening
      router.replace('/admin/manage-links');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editServiceId, services]); // Depend on services to ensure data is loaded


  useEffect(() => {
    const fetchCategories = onSnapshot(
      query(collection(db, 'categories'), orderBy('name')),
      (snapshot) => {
        setCategories(
          snapshot.docs.map((doc) => categoryConverter.fromFirestore(doc))
        );
      }
    );

    const fetchServices = onSnapshot(
      query(collection(db, 'services'), orderBy('title')),
      (snapshot) => {
        setServices(
          snapshot.docs.map((doc) => serviceConverter.fromFirestore(doc))
        );
        setIsServicesLoading(false);
      }
    );

    return () => {
      fetchCategories();
      fetchServices();
    };
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const countryMatch = countryFilter === 'all' || service.country === countryFilter;
      const categoryMatch = !selectedCategory || service.categorySlug === selectedCategory.slug;
      return countryMatch && categoryMatch;
    });
  }, [services, countryFilter, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts: { [slug: string]: number } = {};
    const servicesToCount = services.filter(service => countryFilter === 'all' || service.country === countryFilter);

    for (const service of servicesToCount) {
        if (!counts[service.categorySlug]) {
            counts[service.categorySlug] = 0;
        }
        counts[service.categorySlug]++;
    }
    return counts;
  }, [services, countryFilter]);

  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingService(null);
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
      toast({
        title: 'Service Deleted',
        description: `"${title}" has been removed.`,
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete service.',
      });
    }
  };

  const handleToggleStatus = async (service: Service) => {
    const newStatus =
      service.status === 'published' ? 'disabled' : 'published';
    const action = newStatus === 'published' ? 'Published' : 'Disabled';
    try {
      const serviceRef = doc(db, 'services', service.id);
      await updateDoc(serviceRef, { status: newStatus });
      toast({
        title: `Service ${action}`,
        description: `"${service.title}" is now ${newStatus}.`,
      });
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing service:`, error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to update service status.`,
      });
    }
  };

  const handleCategoryClick = (category: Category) => {
      setSelectedCategory(category);
      setCurrentView('links');
  }

  const handleBackToCategories = () => {
      setSelectedCategory(null);
      setCurrentView('categories');
  }
  
  const handleBackToDashboard = () => {
    router.push('/admin');
  }

  const renderLinksView = () => {
    if (!selectedCategory) return null;
    const Icon = getIcon(selectedCategory.iconName);

    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleBackToCategories}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Categories</span>
                </Button>
                <Icon className="h-6 w-6 text-primary" />
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    {selectedCategory.name}
                </h1>
                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                    <Button variant={linksDisplayMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setLinksDisplayMode('grid')}><LayoutGrid /></Button>
                    <Button variant={linksDisplayMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setLinksDisplayMode('list')}><List /></Button>
                </div>
            </div>
            
            {linksDisplayMode === 'list' && (
                 <Card>
                    <CardContent className="pt-6">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Verified</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredServices.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell className="font-medium">{service.title}</TableCell>
                                <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-semibold">{service.country}</span>
                                    <span className="text-xs text-muted-foreground">{service.state}</span>
                                </div>
                                </TableCell>
                                <TableCell>
                                <Badge variant="outline">{service.serviceType}</Badge>
                                </TableCell>
                                <TableCell>
                                <Badge variant={service.status === 'published' ? 'default' : 'secondary'}>{service.status}</Badge>
                                </TableCell>
                                <TableCell>
                                 {service.verified && <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200"><ShieldCheck className="h-3 w-3 mr-1"/>Yes</Badge>}
                                </TableCell>
                                <TableCell>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" size="icon" onClick={() => openViewDialog(service)}><Eye className="h-4 w-4"/></Button>
                                    <Button variant="outline" size="icon" onClick={() => openEditDialog(service)}><Edit className="h-4 w-4"/></Button>
                                    <Button variant="outline" size="icon" onClick={() => handleToggleStatus(service)}>{service.status === 'published' ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon"><Trash2  className="h-4 w-4"/></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure you want to delete &quot;{service.title}&quot;?</AlertDialogTitle>
                                                <AlertDialogDescription>This action cannot be undone. This will permanently delete the service.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(service.id, service.title)}>Yes, Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                 </Card>
            )}

            {linksDisplayMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map(service => (
                        <Card key={service.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold leading-tight">{service.title}</CardTitle>
                                 <div className="flex items-center gap-2 pt-1 flex-wrap">
                                    <Badge variant={service.status === 'published' ? 'default' : 'secondary'}>{service.status}</Badge>
                                    <Badge variant="outline">{service.country}{service.state && ` - ${service.state}`}</Badge>
                                    {service.verified && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                            <ShieldCheck className="h-3 w-3 mr-1" />
                                            Verified
                                        </Badge>
                                    )}
                                    <Badge variant="outline">{service.serviceType}</Badge>
                                 </div>
                            </CardHeader>
                             <CardFooter className="flex gap-2 justify-end mt-auto pt-4">
                                <Button variant="outline" size="icon" onClick={() => openViewDialog(service)}><Eye className="h-4 w-4"/></Button>
                                <Button variant="outline" size="icon" onClick={() => openEditDialog(service)}><Edit className="h-4 w-4"/></Button>
                                <Button variant="outline" size="icon" onClick={() => handleToggleStatus(service)}>{service.status === 'published' ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon"><Trash2  className="h-4 w-4"/></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to delete &quot;{service.title}&quot;?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone. This will permanently delete the service.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(service.id, service.title)}>Yes, Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                             </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
            
            {filteredServices.length === 0 && (
                <div className="text-center py-16 bg-card rounded-lg shadow-sm">
                    <p className="text-muted-foreground">No services found in this category for the selected location.</p>
                </div>
            )}

        </div>
    )
  }

  const renderCategoryView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Manage Services by Category</CardTitle>
        <CardDescription>
          Select a category to view and manage its services. Use the filters to
          narrow your search.
        </CardDescription>
        <div className="flex items-center gap-4 pt-4">
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isServicesLoading ? (
            <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categories.map(category => {
                    const Icon = getIcon(category.iconName);
                    const count = categoryCounts[category.slug] || 0;
                    return (
                        <div key={category.slug} onClick={() => handleCategoryClick(category)} className="cursor-pointer">
                             <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-primary">
                                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <Icon className="h-10 w-10 mb-4 text-primary" />
                                <h3 className="font-semibold text-base text-card-foreground mb-2">
                                    {category.name}
                                </h3>
                                <p className="text-2xl font-bold text-primary">{count}</p>
                                <p className="text-xs text-muted-foreground">service{count !== 1 && 's'}</p>
                                </CardContent>
                            </Card>
                        </div>
                    )
                })}
            </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleBackToDashboard}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to Dashboard</span>
              </Button>
            <h1 className="text-2xl font-bold">Manage Links</h1>
        </div>
        
        {/* ADD DIALOG */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Add New Service
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add a New Service</DialogTitle>
                    <DialogDescription>
                        Manually add a new service to the directory. This will be published immediately.
                    </DialogDescription>
                </DialogHeader>
                <ServiceForm 
                    categories={categories}
                    onSuccess={handleFormSuccess}
                />
            </DialogContent>
        </Dialog>

        {/* EDIT DIALOG */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
             <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Service</DialogTitle>
                    <DialogDescription>
                        Update the details for &quot;{editingService?.title}&quot;.
                    </DialogDescription>
                </DialogHeader>
                {editingService && (
                    <ServiceForm 
                        categories={categories}
                        editingService={editingService}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </DialogContent>
        </Dialog>

        {/* VIEW DIALOG */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-lg">
                {viewingService && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{viewingService.title}</DialogTitle>
                            <DialogDescription>
                                Read-only view of the service details. Click Edit to make changes.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-4 -mr-4">
                            <div className="space-y-4 py-4 text-sm">
                                <p className="text-muted-foreground">{viewingService.description}</p>
                                
                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Official URL</span>
                                        <a href={viewingService.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1.5 font-medium">
                                            Visit Link <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Category</span>
                                        <span className="font-medium">{categories.find(c => c.slug === viewingService.categorySlug)?.name || viewingService.categorySlug}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Location</span>
                                        <span className="font-medium">{viewingService.country}{viewingService.state && `, ${viewingService.state}`}</span>
                                    </div>
                                     <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Service Type</span>
                                        <Badge variant="outline" className="capitalize">{viewingService.serviceType}</Badge>
                                    </div>
                                     <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Status</span>
                                         <Badge variant={viewingService.status === 'published' ? 'default' : 'secondary'}>{viewingService.status}</Badge>
                                    </div>
                                </div>

                                {viewingService.tags && viewingService.tags.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-foreground">Tags</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {viewingService.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                {viewingService.serviceType === 'guide' && viewingService.steps && viewingService.steps.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-foreground">Steps</h4>
                                            <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
                                                {viewingService.steps.map((step, i) => <li key={i}>{step}</li>)}
                                            </ol>
                                        </div>
                                    </>
                                )}

                                {viewingService.serviceType === 'info' && (
                                     <>
                                        <Separator />
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-foreground">Contact Information</h4>
                                            {viewingService.phone && <p className="flex items-center justify-between"><span className="text-muted-foreground">Phone</span> <span className="font-medium">{viewingService.phone}</span></p>}
                                            {viewingService.email && <p className="flex items-center justify-between"><span className="text-muted-foreground">Email</span> <span className="font-medium">{viewingService.email}</span></p>}
                                            {viewingService.address && <p className="flex items-start justify-between gap-4"><span className="text-muted-foreground">Address</span> <span className="font-medium text-right">{viewingService.address}</span></p>}
                                            {!viewingService.phone && !viewingService.email && !viewingService.address && <p className="text-sm text-muted-foreground">No contact information provided.</p>}
                                        </div>
                                     </>
                                )}
                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-4 border-t">
                            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                            <Button onClick={openEditDialogFromView}><Edit className="mr-2"/>Edit Service</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>

      </div>

      {currentView === 'categories' ? renderCategoryView() : renderLinksView()}
      
    </div>
  );
}

// Encapsulated Service Form Component
interface ServiceFormProps {
    categories: Category[];
    editingService?: Service | null;
    onSuccess: () => void;
}

function ServiceForm({ categories, editingService = null, onSuccess }: ServiceFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: editingService 
            ? {
                ...editingService,
                steps: editingService.steps?.join('\\n') || '',
                tags: editingService.tags || [],
              }
            : {
                verified: false,
                tags: [],
              }
    });

    const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
        setIsLoading(true);
        const isGuide = data.serviceType === 'guide';
        
        const serviceData = {
          ...data,
          tags: data.tags || [],
          steps: isGuide ? data.steps?.split('\\n').filter((step) => step.trim() !== '') : null,
          phone: !isGuide ? data.phone : null,
          email: !isGuide ? data.email : null,
          address: !isGuide ? data.address : null,
          status: editingService?.status || 'published' as const,
          verified: data.verified || false,
        };
        
        try {
            if (editingService) {
                // Update existing service
                const serviceRef = doc(db, 'services', editingService.id);
                await updateDoc(serviceRef, serviceConverter.toFirestore(serviceData));
                toast({ title: 'Service Updated', description: 'The service has been successfully updated.' });
            } else {
                // Add new service
                const servicesCol = collection(db, 'services');
                await addDoc(servicesCol.withConverter(serviceConverter), serviceConverter.toFirestore(serviceData));
                toast({ title: 'Service Added', description: 'The new service has been published.' });
            }
            onSuccess();
            form.reset();
        } catch (error) {
          console.error('Error saving service: ', error);
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to save service.' });
        }
        setIsLoading(false);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                <ServiceFormFields categories={categories} />
                <DialogFooter className="pt-6 border-t">
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : (editingService ? <Save className="mr-2" /> : <PlusCircle className="mr-2" />)}
                        {isLoading ? 'Saving...' : (editingService ? 'Save Changes' : 'Add Service')}
                    </Button>
                </DialogFooter>
            </form>
        </FormProvider>
    );
}

// UI Fields for the form
interface ServiceFormFieldsProps {
    categories: Category[];
}

const ServiceFormFields = forwardRef<HTMLDivElement, ServiceFormFieldsProps>(
  ({ categories }, ref) => {
    const form = useFormContext<FormValues>();
    const [states, setStates] = useState<State[]>([]);

    const selectedCountry = form.watch('country');
    const serviceType = form.watch('serviceType');
    const selectedCategorySlug = form.watch('categorySlug');
    const availableTags = useMemo(() => CATEGORY_TAGS[selectedCategorySlug] || [], [selectedCategorySlug]);

    useEffect(() => {
        const countryData = COUNTRIES.find((c) => c.code === selectedCountry);
        setStates(countryData ? countryData.states : []);
        // Don't reset state field if we are not actively changing the country
    }, [selectedCountry]);
    
    // Reset tags when category changes unless we are editing
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'categorySlug') {
                form.setValue('tags', []);
            }
        })
        return () => subscription.unsubscribe()
    }, [form]);

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
                          <Textarea id="steps" rows={5} placeholder="Step 1...\\nStep 2...\\nStep 3..." {...form.register('steps')} />
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


export default function ManageLinksPage() {
    return (
        <Suspense fallback={<div className="flex-1 text-center p-8">Loading...</div>}>
            <ManageLinksPageComponent />
        </Suspense>
    )
}

    
