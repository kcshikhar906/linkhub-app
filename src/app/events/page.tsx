
'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Calendar, MapPin, Ticket, Clock } from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';
import { EVENTS, type MallEvent } from '@/lib/events';
import { motion, AnimatePresence } from 'framer-motion';
import { EventDetailsDialog } from '@/components/event-details-dialog';
import { isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, endOfDay } from 'date-fns';

function EventCard({ event, onSelect }: { event: MallEvent, onSelect: () => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="overflow-hidden h-full flex flex-col group cursor-pointer" onClick={onSelect}>
                <div className="relative h-48 w-full">
                    <Image src={event.imageUrl} alt={`${event.name} banner`} fill style={{ objectFit: 'cover' }} className="transition-transform duration-300 group-hover:scale-105"/>
                    <Badge variant={event.type === 'Paid' ? 'destructive' : 'default'} className="absolute top-2 right-2 flex items-center gap-1">
                        <Ticket className="h-3 w-3"/>{event.type}
                    </Badge>
                </div>
                <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                    <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date}</span>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                </CardContent>
                <CardContent>
                     <Badge variant="outline" className="flex items-center gap-2 w-fit">
                        <MapPin className="h-3 w-3" /> {event.mallName}
                    </Badge>
                </CardContent>
            </Card>
        </motion.div>
    )
}

function EventsPageComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const nepalData = COUNTRIES.find(c => c.code === 'NP');
    const provinces = nepalData?.states || [];

    const [selectedProvince, setSelectedProvince] = useState(searchParams.get('province') || 'ALL');
    const [selectedTime, setSelectedTime] = useState(searchParams.get('time') || 'ALL');
    const [selectedCost, setSelectedCost] = useState(searchParams.get('cost') || 'ALL');
    const [selectedEvent, setSelectedEvent] = useState<MallEvent | null>(null);

    const filteredEvents = useMemo(() => {
        let events = EVENTS;

        if (selectedProvince !== 'ALL') {
            events = events.filter(event => event.province === selectedProvince);
        }

        if (selectedCost !== 'ALL') {
            events = events.filter(event => event.type === selectedCost);
        }

        if (selectedTime !== 'ALL') {
            const now = new Date();
            events = events.filter(event => {
                const eventStart = event.startDate;
                const eventEnd = endOfDay(event.endDate); // Consider event valid for the whole end day

                if (selectedTime === 'THIS_WEEK') {
                    const weekStart = startOfWeek(now);
                    const weekEnd = endOfWeek(now);
                    return isWithinInterval(eventStart, { start: weekStart, end: weekEnd }) || isWithinInterval(now, { start: eventStart, end: eventEnd });
                }
                if (selectedTime === 'THIS_MONTH') {
                    const monthStart = startOfMonth(now);
                    const monthEnd = endOfMonth(now);
                     return isWithinInterval(eventStart, { start: monthStart, end: monthEnd }) || isWithinInterval(now, { start: eventStart, end: eventEnd });
                }
                return true;
            });
        }
        
        return events;
    }, [selectedProvince, selectedTime, selectedCost]);

    const handleFilterChange = (type: 'province' | 'time' | 'cost', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        const updateParam = (key: string, val: string) => {
            if (val === 'ALL') {
                params.delete(key);
            } else {
                params.set(key, val);
            }
        };

        if (type === 'province') {
            setSelectedProvince(value);
            updateParam('province', value);
        }
        if (type === 'time') {
            setSelectedTime(value);
            updateParam('time', value);
        }
        if (type === 'cost') {
            setSelectedCost(value);
            updateParam('cost', value);
        }
        router.push(`?${params.toString()}`);
    }

    return (
        <>
            <Header />
             <EventDetailsDialog 
                event={selectedEvent} 
                isOpen={!!selectedEvent}
                onOpenChange={(isOpen) => !isOpen && setSelectedEvent(null)}
            />
            <main className="flex-1 bg-muted/20">
                <div className="container mx-auto px-4 py-8 md:py-16">
                    <div className="text-center mb-8">
                         <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline text-accent flex items-center justify-center gap-3">
                           <Calendar className="h-10 w-10" /> What's Happening
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                            Find events, festivals, and live performances happening at shopping malls across Nepal.
                        </p>
                    </div>

                    <Card className="mb-8 sticky top-[65px] z-40">
                        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                            <Select value={selectedProvince} onValueChange={(val) => handleFilterChange('province', val)}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Select a Province" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Provinces</SelectItem>
                                    {provinces.map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>

                             <Select value={selectedTime} onValueChange={(val) => handleFilterChange('time', val)}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by Time" />
                                </SelectTrigger>
                                <SelectContent>
                                     <SelectItem value="ALL">All Times</SelectItem>
                                     <SelectItem value="THIS_WEEK">This Week</SelectItem>
                                     <SelectItem value="THIS_MONTH">This Month</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedCost} onValueChange={(val) => handleFilterChange('cost', val)}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by Cost" />
                                </SelectTrigger>
                                <SelectContent>
                                     <SelectItem value="ALL">All Costs</SelectItem>
                                     <SelectItem value="Free">Free</SelectItem>
                                     <SelectItem value="Paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <AnimatePresence>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map((event) => (
                                        <EventCard key={event.id} event={event} onSelect={() => setSelectedEvent(event)} />
                                    ))
                                ) : (
                                    <motion.div 
                                        className="col-span-full text-center py-16 bg-background rounded-lg border-dashed border-2 flex flex-col items-center justify-center h-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No events found matching your criteria.</p>
                                    </motion.div>
                                )}
                        </div>
                    </AnimatePresence>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default function EventsPage() {
    return (
        <Suspense fallback={<div className="flex-1 text-center p-8">Loading...</div>}>
            <EventsPageComponent />
        </Suspense>
    )
}
