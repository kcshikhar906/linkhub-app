'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  type Category,
  type Service,
  categoryConverter,
  serviceConverter,
} from '@/lib/data';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
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
import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  query,
  orderBy,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import Link from 'next/link';
import { notFound } from 'next/navigation';


const formSchema = z.object({
  title: z.string().min(5),
  link: z.string().url(),
  categorySlug: z.string(),
  description: z.string().min(10),
  steps: z.string().min(10),
});

type FormValues = z.infer<typeof formSchema>;

type EditLinkPageProps = {
    params: {
        id: string;
    };
};

export default function EditLinkPage({ params }: EditLinkPageProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const fetchService = useCallback(async (id: string) => {
      try {
        const serviceRef = doc(db, 'services', id).withConverter(serviceConverter);
        const serviceSnap = await getDoc(serviceRef);

        if (!serviceSnap.exists()) {
            notFound();
            return;
        }
        
        const service = serviceSnap.data();
        form.reset({
            ...service,
            steps: service.steps.join('\n'),
        });
      } catch (error) {
        console.error("Error fetching service:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load service data."});
      } finally {
        setIsDataLoading(false);
      }

  }, [form, toast]);


  useEffect(() => {
    fetchService(params.id);

    const fetchCategories = onSnapshot(
      query(collection(db, 'categories'), orderBy('name')),
      (snapshot) => {
        setCategories(
          snapshot.docs.map((doc) =>
            categoryConverter.fromFirestore(doc)
          )
        );
      }
    );

    return () => {
      fetchCategories();
    };
  }, [params.id, fetchService]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    try {
      const serviceRef = doc(db, 'services', params.id);
      const serviceData = {
        ...data,
        steps: data.steps.split('\n').filter((step) => step.trim() !== ''),
      };
      await updateDoc(serviceRef, serviceData);
      toast({
        title: 'Service Updated',
        description: 'The service has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating service: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update service.',
      });
    }
    setIsLoading(false);
  };
  
  if (isDataLoading) {
      return (
          <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                    <Link href="/admin/manage-links">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Edit Service
                </h1>
                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Edit Service Details</CardTitle>
              <CardDescription>
                Update the information for this service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <label htmlFor="title">Service Title</label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., How to apply for a TFN"
                  {...form.register('title')}
                />
                 {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
              </div>
              <div className="grid gap-3">
                <label htmlFor="link">Official URL</label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://service.gov.au/..."
                  {...form.register('link')}
                />
                 {form.formState.errors.link && <p className="text-sm text-destructive">{form.formState.errors.link.message}</p>}

              </div>
              <div className="grid gap-3">
                <label htmlFor="categorySlug">Category</label>
                <Select value={form.watch('categorySlug')} onValueChange={(value) => form.setValue('categorySlug', value)}>
                  <SelectTrigger
                    id="categorySlug"
                    aria-label="Select category"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 {form.formState.errors.categorySlug && <p className="text-sm text-destructive">{form.formState.errors.categorySlug.message}</p>}

              </div>
              <div className="grid gap-3">
                <label htmlFor="description">Short Description</label>
                <Textarea
                  id="description"
                  placeholder="A brief explanation of the service."
                  {...form.register('description')}
                />
                 {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
              </div>
              <div className="grid gap-3">
                <label htmlFor="steps">Steps (one per line)</label>
                <Textarea
                  id="steps"
                  rows={5}
                  placeholder="Step 1...\nStep 2...\nStep 3..."
                  {...form.register('steps')}
                />
                {form.formState.errors.steps && <p className="text-sm text-destructive">{form.formState.errors.steps.message}</p>}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-center gap-2 md:hidden mt-4">
              <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                  {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
