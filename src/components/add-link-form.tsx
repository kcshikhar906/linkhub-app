'use client';

import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getIcon, type Category } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { submissionConverter, categoryConverter } from '@/lib/data';
import { COUNTRIES, type State } from '@/lib/countries';

const formSchema = z.object({
  title: z.string().min(5, { message: "Please enter a descriptive title."}),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  categorySlug: z.string({ required_error: 'Please select a category.' }),
  country: z.string({ required_error: 'Please select a country.' }),
  state: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddLinkForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCategories() {
        const q = query(collection(db, 'categories'), orderBy('name'));
        const snapshot = await getDocs(q.withConverter(categoryConverter));
        setCategories(snapshot.docs.map(doc => doc.data()));
    }
    fetchCategories();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      url: '',
      email: '',
      notes: '',
    },
  });

  const selectedCountry = form.watch('country');

  useEffect(() => {
    const countryData = COUNTRIES.find(c => c.code === selectedCountry);
    setStates(countryData ? countryData.states : []);
    form.setValue('state', undefined);
  }, [selectedCountry, form]);


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    
    try {
        const submissionData = {
            ...data,
            status: 'pending' as const,
            submittedAt: serverTimestamp(),
        }
        const submissionsCol = collection(db, 'submissions').withConverter(submissionConverter);
        await addDoc(submissionsCol, submissionData);
        
        toast({
            title: 'Link Submitted!',
            description: "Thank you for your contribution. We will review the link and add it to our directory shortly.",
        });
        form.reset();
    } catch (error) {
        console.error("Error submitting form: ", error);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was a problem submitting your link. Please try again later.',
        });
    }

    setIsLoading(false);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
              <CardTitle>Suggest a New Link</CardTitle>
              <CardDescription>
              Fill out the form below to recommend a new service.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., How to apply for a TFN"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Official URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://service.gov.au/..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="categorySlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || categories.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map(c => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Province (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || states.length === 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {states.map(s => (
                            <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Email</FormLabel>
                   <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    We'll only use this to contact you if we have questions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anything else we should know about this link?"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
