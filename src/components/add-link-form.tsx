'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { summarizeLinkCard, type SummarizeLinkCardOutput } from '@/ai/flows/summarize-link-card';
import { Loader2 } from 'lucide-react';
import { LinkCard } from './link-card';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function AddLinkForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<SummarizeLinkCardOutput | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState('');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setSummary(null);
    setSubmittedUrl(data.url);
    try {
      const result = await summarizeLinkCard({ url: data.url });
      setSummary(result);
      toast({
        title: 'Summary Generated!',
        description: 'Review the generated card below. We will add it to the directory soon.',
      });
    } catch (error) {
      console.error('Error summarizing link:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Summary',
        description: 'Could not summarize the provided link. Please try another one.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Submit a URL</CardTitle>
        <CardDescription>
          Enter the URL of an official government or institutional service page.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Generating...' : 'Generate Summary'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>

    {summary && (
        <div className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight font-headline mb-4 text-center">
                Generated Preview
            </h2>
            <LinkCard service={{
                id: 'preview',
                title: 'Generated Service',
                description: summary.description,
                steps: summary.steps,
                link: submittedUrl,
                categorySlug: ''
            }} />
        </div>
    )}
    </>
  );
}
