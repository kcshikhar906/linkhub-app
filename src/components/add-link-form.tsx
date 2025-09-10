'use client';

import { useState } from 'react';
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
import { CATEGORIES } from '@/lib/data';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  title: z.string().min(5, { message: "Please enter a descriptive title."}),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  categorySlug: z.string({ required_error: 'Please select a category.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddLinkForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      url: '',
      email: '',
      notes: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    // In a real app, you would send this data to your backend (e.g., Firestore)
    console.log('Form submitted:', data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
        title: 'Link Submitted!',
        description: "Thank you for your contribution. We will review the link and add it to our directory shortly.",
    });
    form.reset();
    setIsLoading(false);
  };
  
  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                </F_ormItem>
              )}
            />
             <FormField
              control={form.control}
              name="categorySlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
        </form>
      </Form>
    </Card>
  );
}