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
import { Loader2, Wand2 } from 'lucide-react';
import { type Category } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { submissionConverter, categoryConverter } from '@/lib/data';
import { COUNTRIES, type State } from '@/lib/countries';
import { summarizeLinkCard } from '@/ai/flows/summarize-link-card';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  title: z.string().min(5, { message: "Please enter a descriptive title."}),
  url: z.string().url({ message: 'Please enter a valid URL to use the AI feature.' }),
  categorySlug: z.string({ required_error: 'Please select a category.' }),
  country: z.string({ required_error: 'Please select a country.' }),
  state: z.string().optional(),
  notes: z.string().optional(),
  // Fields for AI population
  description: z.string().optional(),
  steps: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddLinkForm() {
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
      title: '',
      url: '',
      notes: '',
      description: '',
    },
  });

  const selectedCountry = form.watch('country');
  const urlValue = form.watch('url');
  const categorySlugValue = form.watch('categorySlug');

  useEffect(() => {
    const countryData = COUNTRIES.find(c => c.code === selectedCountry);
    setStates(countryData ? countryData.states : []);
    form.setValue('state', undefined);
  }, [selectedCountry, form]);
  
  const handleAiFill = async () => {
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
        const aiSummary = await summarizeLinkCard({ url: urlValue, categorySlug: categorySlugValue });
        
        // Populate form fields with AI data
        form.setValue('title', aiSummary.title, { shouldValidate: true });
        form.setValue('description', aiSummary.description, { shouldValidate: true });
        form.setValue('steps', aiSummary.steps, { shouldValidate: true });
        form.setValue('tags', aiSummary.suggestedTags, { shouldValidate: true });

        // Format steps for the notes field
        const stepsText = aiSummary.steps.length > 0 ? `Steps:\n- ${aiSummary.steps.join('\n- ')}` : '';
        const tagsText = aiSummary.suggestedTags && aiSummary.suggestedTags.length > 0 ? `\n\nSuggested Tags: ${aiSummary.suggestedTags.join(', ')}` : '';
        const notesText = `${aiSummary.description}\n\n${stepsText}${tagsText}`;

        form.setValue('notes', notesText.trim(), { shouldValidate: true });
        
        toast({
            title: 'Content Filled by AI!',
            description: 'Please review the generated content and make any necessary changes before submitting.',
        });

    } catch (error) {
        console.error("AI summarization failed:", error);
        toast({
            variant: 'destructive',
            title: 'AI Analysis Failed',
            description: 'Could not analyze the URL. Please fill the form manually.',
        });
        setAiUsed(false); // Allow retry if AI fails
    } finally {
        setIsAiLoading(false);
    }
  };


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    
    try {
        // Ensure we are submitting the core fields
        const submissionData = {
            title: data.title,
            url: data.url,
            categorySlug: data.categorySlug,
            country: data.country,
            state: data.state,
            notes: data.notes,
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
        setAiUsed(false);
    } catch (error) {
        console.error("Error submitting form: ", error);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was a problem submitting your link. Please try again later.',
        });
    }

    setIsSubmitting(false);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
              <CardTitle>Suggest a New Link</CardTitle>
              <CardDescription>
                Provide a URL and a category, then either fill the form manually or let our AI do the heavy lifting for you.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                      disabled={isSubmitting || isAiLoading}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting || isAiLoading || categories.length === 0}>
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

            <div className="relative border-t pt-6">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-card text-sm text-muted-foreground">OR</div>
                 <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleAiFill}
                    disabled={isAiLoading || aiUsed || isSubmitting}
                 >
                     {isAiLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                     {isAiLoading ? 'Analyzing Link...' : 'Fill Details with AI'}
                 </Button>
                 {aiUsed && <p className="text-xs text-center text-muted-foreground mt-2">AI can only be used once per submission.</p>}
            </div>

            {isAiLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-1/2" />
                </div>
            ) : (
                <>
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
                            disabled={isSubmitting}
                            />
                        </FormControl>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
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
                            <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || states.length === 0}>
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
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Notes / Details</FormLabel>
                        <FormControl>
                            <Textarea
                            rows={6}
                            placeholder="A brief description of the service, steps involved, or any other helpful notes."
                            {...field}
                            disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormDescription>
                            This helps us understand and categorize the link. Feel free to edit the AI's response.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </>
            )}

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || isAiLoading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
