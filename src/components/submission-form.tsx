
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
import { Loader2, Link, ShoppingBag, Calendar, User, Mail, Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Category, categoryConverter } from '@/lib/data';
import { MALLS } from '@/lib/malls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
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
        mallId: z.string({ required_error: "Please select a mall."}),
        notes: z.string().min(10, "Please provide a brief description of the shop."),
    }),
    z.object({
        submissionType: z.literal('event'),
        name: z.string().min(2, "Please enter your name."),
        email: zstring().email("Please enter a valid email address."),
        phone: z.string().optional(),
        eventName: z.string().min(3, "Please enter the event's name."),
        mallId: z.string({ required_error: "Please select a mall."}),
        eventDates: z.object({ from: z.date(), to: z.date() }, { required_error: "Please select the event dates."}),
        notes: z.string().min(10, "Please provide a brief description of the event."),
    })
]);

type FormValues = z.infer<typeof formSchema>;

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
    defaultValues: {
      submissionType: 'service',
      name: '',
      email: '',
      phone: '',
      url: '',
      notes: '',
    },
  });

  const handleNext = async () => {
    // Only validate the fields relevant to the current step if needed in a more complex form
    setCurrentStep(1);
  };

  const handleBack = () => {
    setCurrentStep(0);
  }

  const handleTypeSelect = (type: 'service' | 'shop' | 'event') => {
    setSubmissionType(type);
    form.reset(); // Reset form when type changes to clear irrelevant fields and errors
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
        submissionData = { ...submissionData, shopName: data.shopName, mallId: data.mallId };
    } else if (data.submissionType === 'event') {
        submissionData = { ...submissionData, eventName: data.eventName, mallId: data.mallId, startDate: data.eventDates.from, endDate: data.eventDates.to };
    }
    
    try {
        const submissionsCol = collection(db, 'submissions');
        await addDoc(submissionsCol, submissionData);
        
        toast({ title: 'Submission Received!', description: "Thank you for your contribution. We will review it shortly."});
        form.reset();
        setCurrentStep(0);
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
                                <FormControl><Input type="tel" placeholder="Your contact number" {...field} disabled={isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        
                        <hr/>

                        {submissionType === 'service' && (
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

                        {submissionType === 'shop' && (
                            <div className="space-y-4">
                                <FormField control={form.control} name="shopName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shop Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Awesome Store" {...field} disabled={isSubmitting} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="mallId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mall</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select a mall" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {MALLS.map(mall => <SelectItem key={mall.id} value={mall.id}>{mall.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                        )}

                        {submissionType === 'event' && (
                            <div className="space-y-4">
                                <FormField control={form.control} name="eventName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Grand Opening Festival" {...field} disabled={isSubmitting} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="mallId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mall</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a mall" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {MALLS.map(mall => <SelectItem key={mall.id} value={mall.id}>{mall.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField
                                        control={form.control}
                                        name="eventDates"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col pt-2">
                                                <FormLabel>Event Dates</FormLabel>
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
                                                        {field.value?.from ? (
                                                            field.value.to ? (
                                                            <>
                                                                {format(field.value.from, "LLL dd, y")} -{" "}
                                                                {format(field.value.to, "LLL dd, y")}
                                                            </>
                                                            ) : (
                                                            format(field.value.from, "LLL dd, y")
                                                            )
                                                        ) : (
                                                            <span>Pick a date range</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                    <CalendarPicker
                                                        initialFocus
                                                        mode="range"
                                                        defaultMonth={field.value?.from}
                                                        selected={{ from: field.value?.from, to: field.value?.to }}
                                                        onSelect={field.onChange}
                                                        numberOfMonths={2}
                                                    />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}
                        
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes / Description</FormLabel>
                                <FormControl>
                                    <Textarea rows={4} placeholder="Tell us more about your submission..." {...field} disabled={isSubmitting} />
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
                        {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
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

    