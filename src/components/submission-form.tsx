
'use client';

import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler, FormProvider } from 'react-hook-form';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Link, ShoppingBag, Calendar } from 'lucide-react';
import { type Category } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { submissionConverter, categoryConverter } from '@/lib/data';
import { COUNTRIES, type State } from '@/lib/countries';
import { MALLS } from '@/lib/malls';
import { summarizeLinkCard } from '@/ai/flows/summarize-link-card';
import { Skeleton } from './ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';

const baseSchema = z.object({
    submissionType: z.enum(['service', 'shop', 'event']),
    notes: z.string().min(10, "Please provide some details or a description."),
});

const serviceSchema = baseSchema.extend({
  submissionType: z.literal('service'),
  title: z.string().min(5, { message: "Please enter a descriptive title."}),
  url: z.string().url({ message: 'A valid URL is required to suggest a service.' }),
  categorySlug: z.string({ required_error: 'Please select a category.' }),
  country: z.string({ required_error: 'Please select a country.' }),
  state: z.string().optional(),
});

const shopSchema = baseSchema.extend({
  submissionType: z.literal('shop'),
  shopName: z.string().min(2, "Please enter the shop's name."),
  mallId: z.string({ required_error: 'Please select a mall.' }),
});

const eventSchema = baseSchema.extend({
    submissionType: z.literal('event'),
    eventName: z.string().min(5, "Please enter the event's name."),
    mallId: z.string({ required_error: 'Please select a mall.' }),
});

const formSchema = z.discriminatedUnion("submissionType", [
    serviceSchema,
    shopSchema,
    eventSchema,
]);

type FormValues = z.infer<typeof formSchema>;

export function SubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
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
      submissionType: 'service',
      notes: '',
    },
  });

  const submissionType = form.watch('submissionType');
  const selectedCountry = submissionType === 'service' ? form.watch('country') : undefined;
  
  useEffect(() => {
    if (selectedCountry) {
        const countryData = COUNTRIES.find(c => c.code === selectedCountry);
        setStates(countryData ? countryData.states : []);
        form.setValue('state', undefined);
    }
  }, [selectedCountry, form]);
  
  const handleAiFill = async () => {
    // This function is specific to 'service' submissions
    if (form.getValues('submissionType') !== 'service') return;

    const isUrlValid = await form.trigger('url');
    const isCategoryValid = await form.trigger('categorySlug');
    if (!isUrlValid || !isCategoryValid) {
        toast({
            variant: 'destructive',
            title: 'URL and Category Required',
            description: 'Please enter a valid URL and select a category before using the AI feature.',
        });
        return;
    }
    
    setIsAiLoading(true);
    setAiUsed(true);

    try {
        const aiSummary = await summarizeLinkCard({ url: form.getValues('url'), categorySlug: form.getValues('categorySlug') });
        
        form.setValue('title', aiSummary.title, { shouldValidate: true });
        
        const stepsText = aiSummary.steps.length > 0 ? `Steps:\n- ${aiSummary.steps.join('\n- ')}` : '';
        const tagsText = aiSummary.suggestedTags && aiSummary.suggestedTags.length > 0 ? `\n\nSuggested Tags: ${aiSummary.suggestedTags.join(', ')}` : '';
        const notesText = `${aiSummary.description}\n\n${stepsText}${tagsText}`;

        form.setValue('notes', notesText.trim(), { shouldValidate: true });
        
        toast({
            title: 'Content Filled by AI!',
            description: 'Please review the generated content and make any necessary changes.',
        });

    } catch (error) {
        console.error("AI summarization failed:", error);
        toast({ variant: 'destructive', title: 'AI Analysis Failed', description: 'Could not analyze the URL. Please fill the form manually.'});
        setAiUsed(false);
    } finally {
        setIsAiLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    
    let submissionData: any = {
        submissionType: data.submissionType,
        notes: data.notes,
        status: 'pending',
        submittedAt: serverTimestamp(),
    };

    if (data.submissionType === 'service') {
        submissionData = {
            ...submissionData,
            title: data.title,
            url: data.url,
            categorySlug: data.categorySlug,
            country: data.country,
            state: data.state,
        };
    } else if (data.submissionType === 'shop') {
        submissionData = { ...submissionData, title: data.shopName, mallId: data.mallId };
    } else if (data.submissionType === 'event') {
        submissionData = { ...submissionData, title: data.eventName, mallId: data.mallId };
    }
    
    try {
        const submissionsCol = collection(db, 'submissions');
        await addDoc(submissionsCol, submissionData);
        
        toast({ title: 'Submission Received!', description: "Thank you for your contribution. We'll review it shortly."});
        form.reset({ submissionType: data.submissionType, notes: '' });
        setAiUsed(false);
    } catch (error) {
        console.error("Error submitting form: ", error);
        toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was a problem submitting your request. Please try again.'});
    }

    setIsSubmitting(false);
  };
  
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
              <CardTitle>Contribution Form</CardTitle>
              <CardDescription>
                Tell us what you want to add. The form will update based on your selection.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="submissionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What would you like to submit?</FormLabel>
                   <ToggleGroup
                      type="single"
                      defaultValue={field.value}
                      onValueChange={(value) => {
                          if (value) field.onChange(value);
                          form.reset({ submissionType: value as FormValues['submissionType'] });
                          setAiUsed(false);
                      }}
                      className="grid grid-cols-3 w-full"
                    >
                      <ToggleGroupItem value="service" aria-label="Submit a service">
                        <Link className="mr-2" /> Service Link
                      </ToggleGroupItem>
                      <ToggleGroupItem value="shop" aria-label="Submit a shop">
                        <ShoppingBag className="mr-2" /> Shop
                      </ToggleGroupItem>
                       <ToggleGroupItem value="event" aria-label="Submit an event">
                        <Calendar className="mr-2" /> Event
                      </ToggleGroupItem>
                    </ToggleGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={submissionType}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                >
                {submissionType === 'service' && (
                    <>
                        <FormField control={form.control} name="url" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Official URL</FormLabel>
                                <FormControl><Input placeholder="https://service.gov.au/..." {...field} disabled={isSubmitting || isAiLoading} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="categorySlug" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting || isAiLoading || categories.length === 0}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                    <SelectContent>{categories.map(cat => <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <div className="relative border-t pt-6">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-card text-sm text-muted-foreground">OR</div>
                            <Button type="button" variant="outline" className="w-full" onClick={handleAiFill} disabled={isAiLoading || aiUsed || isSubmitting}>
                                {isAiLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                                {isAiLoading ? 'Analyzing Link...' : 'Fill Details with AI'}
                            </Button>
                            {aiUsed && <p className="text-xs text-center text-muted-foreground mt-2">AI can only be used once per submission.</p>}
                        </div>
                        {isAiLoading ? <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-1/2" /></div> : (
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service Title</FormLabel>
                                    <FormControl><Input placeholder="e.g., How to apply for a TFN" {...field} disabled={isSubmitting} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="country" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Country</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger></FormControl>
                                    <SelectContent>{COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="state" render={({ field }) => (
                                <FormItem>
                                <FormLabel>State / Province</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || states.length === 0}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger></FormControl>
                                    <SelectContent>{states.map(s => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    </>
                )}

                {submissionType === 'shop' && (
                    <>
                         <FormField control={form.control} name="shopName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Shop Name</FormLabel>
                                <FormControl><Input placeholder="e.g., Acme Apparel" {...field} disabled={isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="mallId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Shopping Mall</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a mall" /></SelectTrigger></FormControl>
                                    <SelectContent>{MALLS.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </>
                )}

                 {submissionType === 'event' && (
                    <>
                         <FormField control={form.control} name="eventName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Name</FormLabel>
                                <FormControl><Input placeholder="e.g., Summer Music Festival" {...field} disabled={isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="mallId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Shopping Mall</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a mall" /></SelectTrigger></FormControl>
                                    <SelectContent>{MALLS.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </>
                )}
                 <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Details & Description</FormLabel>
                        <FormControl>
                            <Textarea rows={5} placeholder="Provide as much detail as possible. For events, include dates/times. For shops, include floor number or category." {...field} disabled={isSubmitting || isAiLoading} />
                        </FormControl>
                        <FormDescription>This helps us review and add your submission quickly and accurately.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
            </motion.div>
          </AnimatePresence>
        </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || isAiLoading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}
