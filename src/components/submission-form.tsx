
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Link, ShoppingBag, Calendar, ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Category, categoryConverter } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isBefore, startOfToday } from 'date-fns';
import { Calendar as CalendarPicker } from './ui/calendar';


const formSchema = z.discriminatedUnion('submissionType', [
    z.object({
        submissionType: z.literal('service'),
        name: z.string().min(2, "Please enter your name."),
        email: z.string().email("Please enter a valid email address."),
        phone: z.string().optional(),
        url: z.string().url("Please enter a valid URL."),
        categorySlug: z.string({ required_error: 'Please select a category.'}),
        notes: z.string().optional(),
    }),
    z.object({
        submissionType: z.literal('shop'),
        name: z.string().min(2, "Please enter your name."),
        email: z.string().email("Please enter a valid email address."),
        phone: z.string().optional(),
        shopName: z.string().min(2, "Please enter the shop's name."),
        notes: z.string().min(10, "Please provide a brief description of the shop."),
    }),
    z.object({
        submissionType: z.literal('event'),
        name: z.string().min(2, "Please enter your name."),
        email: z.string().email("Please enter a valid email address."),
        phone: z.string().optional(),
        eventName: z.string().min(3, "Please enter the event's name."),
        eventDate: z.date({ required_error: "Please select the event date."}),
        notes: z.string().min(10, "Please provide a brief description of the event."),
    })
]);

type FormValues = z.infer<typeof formSchema>;

const initialValues = {
  submissionType: 'service' as const,
  name: '',
  email: '',
  phone: '',
  url: '',
  notes: '',
  shopName: '',
  eventName: '',
  categorySlug: '',
  eventDate: undefined,
};


export function SubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submissionType, setSubmissionType] = useState<'service' | 'shop' | 'event'>('service');
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCategories() {
        const catCol = collection(db, 'categories').withConverter(categoryConverter);
        const catSnap = await getDocs(catCol);
        setCategories(catSnap.docs.map(doc => doc.data()));
    }
    fetchCategories();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const watchedSubmissionType = form.watch('submissionType');
  const watchedEventDate = form.watch('submissionType') === 'event' ? form.watch('eventDate') : undefined;
  const isEventDateSoon = watchedEventDate ? isBefore(watchedEventDate, startOfToday()) : false;


  const handleNext = async () => {
    setCurrentStep(1);
  };

  const handleBack = () => {
    setCurrentStep(0);
  }

  const handleTypeSelect = (type: 'service' | 'shop' | 'event') => {
    setSubmissionType(type);
    form.reset(initialValues); 
    form.setValue('submissionType', type);
    handleNext();
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    
    let submissionData: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        submissionType: data.submissionType,
        notes: data.notes,
        status: 'pending',
        submittedAt: serverTimestamp(),
    };

    if (data.submissionType === 'service') {
        submissionData = { ...submissionData, url: data.url, categorySlug: data.categorySlug };
    } else if (data.submissionType === 'shop') {
        submissionData = { ...submissionData, shopName: data.shopName };
    } else if (data.submissionType === 'event') {
        submissionData = { ...submissionData, eventName: data.eventName, startDate: data.eventDate };
    }
    
    try {
        const submissionsCol = collection(db, 'submissions');
        await addDoc(submissionsCol, submissionData);
        
        toast({ title: 'Submission Received!', description: "Thank you for your contribution. We will review it shortly."});
        form.reset(initialValues);
        setCurrentStep(0);
    } catch (error) {
        console.error("Error submitting form: ", error);
        toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was a problem submitting your request. Please try again.'});
    }

    setIsSubmitting(false);
  };

  const placeholderText = {
    service: "Please include any extra details, like if this link replaces an old one or why it's important.",
    shop: "e.g., Sells organic coffee and has a nice seating area. Located in Civil Mall.",
    event: "e.g., This is a free concert series happening every Friday in the main courtyard of City Centre."
  }[submissionType];

  const submitButtonText = {
    service: 'Submit Contribution',
    shop: 'Request Contact',
    event: 'Submit Event for Review'
  }[submissionType];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
              <CardTitle>Contribution Form</CardTitle>
              <CardDescription>
                Help us grow by adding a new service, shop, or event to our directory.
              </CardDescription>
          </CardHeader>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                {currentStep === 0 && (
                     <CardContent className="text-center">
                        <h3 className="text-lg font-semibold mb-4">What would you like to submit?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button type="button" variant="outline" className="h-24 flex-col gap-2" onClick={() => handleTypeSelect('service')}><Link className="h-8 w-8"/>New Service Link</Button>
                            <Button type="button" variant="outline" className="h-24 flex-col gap-2" onClick={() => handleTypeSelect('shop')}><ShoppingBag className="h-8 w-8"/>New Shop</Button>
                            <Button type="button" variant="outline" className="h-24 flex-col gap-2" onClick={() => handleTypeSelect('event')}><Calendar className="h-8 w-8"/>New Event</Button>
                        </div>
                    </CardContent>
                )}

                {currentStep === 1 && (
                <>
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
                                <FormControl><Input type="tel" placeholder="Your contact number" {...field} value={field.value || ''} disabled={isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        
                        <hr/>

                        {watchedSubmissionType === 'service' && (
                             <div className="space-y-4">
                                <FormField control={form.control} name="url" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service URL</FormLabel>
                                        <FormControl><Input placeholder="https://example.gov.au/service" {...field} disabled={isSubmitting} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="categorySlug" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map(cat => <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                             </div>
                        )}

                        {watchedSubmissionType === 'shop' && (
                            <div className="space-y-4">
                                <FormField control={form.control} name="shopName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shop Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Awesome Store" {...field} disabled={isSubmitting} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                        )}

                        {watchedSubmissionType === 'event' && (
                            <div className="space-y-4">
                                <FormField control={form.control} name="eventName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Grand Opening Festival" {...field} disabled={isSubmitting} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField
                                    control={form.control}
                                    name="eventDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Event Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarPicker
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>
                                                {isEventDateSoon
                                                    ? "This date is in the past. Please select a future date."
                                                    : "We will review your submission and email you for more details before it is published."}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                        
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes / Description</FormLabel>
                                <FormControl>
                                    <Textarea rows={4} placeholder={placeholderText} {...field} value={field.value || ''} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
                            <ArrowLeft className="mr-2"/> Back
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Submitting...' : submitButtonText}
                        </Button>
                    </CardFooter>
                 </>
                )}
               </motion.div>
            </AnimatePresence>
        </Card>
      </form>
    </Form>
  );
}
