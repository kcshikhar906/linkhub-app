
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Link, ShoppingBag, Calendar, User, Mail, Phone } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const formSchema = z.object({
    name: z.string().min(2, "Please enter your name."),
    email: z.string().email("Please enter a valid email address."),
    phone: z.string().optional(),
    submissionType: z.enum(['service', 'shop', 'event'], { required_error: "Please select a submission type."}),
    notes: z.string().min(10, "Please provide some details about your submission."),
});

type FormValues = z.infer<typeof formSchema>;

export function SubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submissionType: 'service',
      notes: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    
    const submissionData = {
        ...data,
        status: 'pending',
        submittedAt: serverTimestamp(),
    };
    
    try {
        const submissionsCol = collection(db, 'submissions');
        await addDoc(submissionsCol, submissionData);
        
        toast({ title: 'Submission Received!', description: "Thank you for your contribution. We will contact you shortly for more details."});
        form.reset({
            name: '',
            email: '',
            phone: '',
            submissionType: data.submissionType,
            notes: '' 
        });
    } catch (error) {
        console.error("Error submitting form: ", error);
        toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was a problem submitting your request. Please try again.'});
    }

    setIsSubmitting(false);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
              <CardTitle>Contribution Form</CardTitle>
              <CardDescription>
                Tell us what you want to add. We'll email you back to get the full details.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Jane Doe" {...field} disabled={isSubmitting} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Your Email</FormLabel>
                        <FormControl><Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
             <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl><Input type="tel" placeholder="Your contact number" {...field} disabled={isSubmitting} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
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
            
             <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                        <Textarea rows={5} placeholder="Tell us a bit about what you want to list. e.g., 'I want to add the new Nike store in Civil Mall' or 'There's a great link for renewing a driver's license...'" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>This helps us prepare for our follow-up email.</FormDescription>
                    <FormMessage />
                </FormItem>
            )}/>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Send Inquiry'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
