
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useMemo } from 'react';
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
} from 'firebase/firestore';
import Link from 'next/link';

const formSchema = z.object({
  title: z.string().min(5),
  link: z.string().url(),
  categorySlug: z.string(),
  description: z.string().min(10),
  steps: z.string().min(10),
  country: z.string({ required_error: 'Please select a country.' }),
  state: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ManageLinksPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // View management state
  const [currentView, setCurrentView] = useState<'categories' | 'links'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [linksDisplayMode, setLinksDisplayMode] = useState<'list' | 'grid'>('grid');

  // Filters for the list
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const selectedCountry = form.watch('country');

  useEffect(() => {
    const countryData = COUNTRIES.find((c) => c.code === selectedCountry);
    setStates(countryData ? countryData.states : []);
    form.setValue('state', undefined);
  }, [selectedCountry, form]);

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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    try {
      const serviceData = {
        ...data,
        steps: data.steps.split('\n').filter((step) => step.trim() !== ''),
        status: 'published' as const,
      };
      const servicesCol =
        collection(db, 'services').withConverter(serviceConverter);
      await addDoc(servicesCol, serviceData);
      toast({
        title: 'Service Added',
        description: 'The new service has been published.',
      });
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding service: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add service.',
      });
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
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
                            <TableHead>Status</TableHead>
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
                                <Badge variant={service.status === 'published' ? 'default' : 'destructive'}>{service.status}</Badge>
                                </TableCell>
                                <TableCell>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" size="icon" asChild><Link href={`/admin/manage-links/${service.id}/edit`}><Edit className="h-4 w-4"/></Link></Button>
                                    <Button variant="outline" size="icon" onClick={() => handleToggleStatus(service)}>{service.status === 'published' ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</Button>
                                    <Button variant="destructive" size="icon" onClick={() => handleDelete(service.id, service.title)}><Trash2  className="h-4 w-4"/></Button>
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
                                 <div className="flex items-center gap-2 pt-1">
                                    <Badge variant={service.status === 'published' ? 'default' : 'destructive'}>{service.status}</Badge>
                                    <Badge variant="secondary">{service.country}{service.state && ` - ${service.state}`}</Badge>
                                 </div>
                            </CardHeader>
                             <CardFooter className="flex gap-2 justify-end mt-auto">
                                <Button variant="outline" size="icon" asChild><Link href={`/admin/manage-links/${service.id}/edit`}><Edit className="h-4 w-4"/></Link></Button>
                                <Button variant="outline" size="icon" onClick={() => handleToggleStatus(service)}>{service.status === 'published' ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDelete(service.id, service.title)}><Trash2  className="h-4 w-4"/></Button>
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
                                <h3 className="font-semibold text-base text-card-foreground">
                                    {category.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-2">{count} service{count !== 1 && 's'}</p>
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
        <h1 className="text-2xl font-bold">Manage Links</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Add New Service
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                    <DialogTitle>Add a New Service</DialogTitle>
                    <DialogDescription>
                        Manually add a new service to the directory. This will be published immediately.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-6 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="grid gap-3">
                            <label htmlFor="title">Service Title</label>
                            <Input id="title" type="text" placeholder="e.g., How to apply for a TFN" {...form.register('title')} />
                            {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
                        </div>
                        <div className="grid gap-3">
                            <label htmlFor="link">Official URL</label>
                            <Input id="link" type="url" placeholder="https://service.gov.au/..." {...form.register('link')} />
                            {form.formState.errors.link && <p className="text-sm text-destructive">{form.formState.errors.link.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-3">
                                <label htmlFor="country">Country</label>
                                <Select onValueChange={(value) => form.setValue('country', value)}>
                                <SelectTrigger id="country"><SelectValue placeholder="Select a country" /></SelectTrigger>
                                <SelectContent>
                                    {COUNTRIES.map((c) => (<SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>))}
                                </SelectContent>
                                </Select>
                                {form.formState.errors.country && <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>}
                            </div>
                            <div className="grid gap-3">
                                <label htmlFor="state">State / Province</label>
                                <Select onValueChange={(value) => form.setValue('state', value)} disabled={states.length === 0}>
                                <SelectTrigger id="state"><SelectValue placeholder="Select a state (if applicable)" /></SelectTrigger>
                                <SelectContent>
                                    {states.map((s) => (<SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>))}
                                </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <label htmlFor="categorySlug">Category</label>
                            <Select onValueChange={(value) => form.setValue('categorySlug', value)}>
                            <SelectTrigger id="categorySlug" aria-label="Select category"><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (<SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>))}
                            </SelectContent>
                            </Select>
                            {form.formState.errors.categorySlug && <p className="text-sm text-destructive">{form.formState.errors.categorySlug.message}</p>}
                        </div>
                        <div className="grid gap-3">
                            <label htmlFor="description">Short Description</label>
                            <Textarea id="description" placeholder="A brief explanation of the service." {...form.register('description')} />
                            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
                        </div>
                        <div className="grid gap-3">
                            <label htmlFor="steps">Steps (one per line)</label>
                            <Textarea id="steps" placeholder="Step 1...\nStep 2...\nStep 3..." {...form.register('steps')} />
                            {form.formState.errors.steps && <p className="text-sm text-destructive">{form.formState.errors.steps.message}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                      <Button type="submit" disabled={isLoading}>
                          {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <PlusCircle className="mr-2" />}
                          {isLoading ? 'Adding...' : 'Add Service'}
                      </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>

      {currentView === 'categories' ? renderCategoryView() : renderLinksView()}
      
    </div>
  );
}

  