
'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Calendar, MapPin } from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';
import { MALLS } from '@/lib/malls';
import { EVENTS } from '@/lib/events';
import { motion, AnimatePresence } from 'framer-motion';

function EventCard({ event }: { event: typeof EVENTS[0] }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="overflow-hidden h-full flex flex-col group">
                <div className="relative h-48 w-full">
                    <Image src={event.imageUrl} alt={`${event.name} banner`} fill style={{ objectFit: 'cover' }} className="transition-transform duration-300 group-hover:scale-105"/>
                </div>
                <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                    <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date}</span>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{event.description}</p>
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
    const [selectedMall, setSelectedMall] = useState(searchParams.get('mall') || 'ALL');

    const mallsInProvince = useMemo(() => {
        if (selectedProvince === 'ALL') return MALLS;
        return MALLS.filter(mall => mall.province === selectedProvince);
    }, [selectedProvince]);

    const filteredEvents = useMemo(() => {
        let events = EVENTS;

        if (selectedProvince !== 'ALL') {
            events = events.filter(event => event.province === selectedProvince);
        }

        if (selectedMall !== 'ALL') {
            events = events.filter(event => event.mallId === selectedMall);
        }
        
        return events;
    }, [selectedProvince, selectedMall]);

    const handleFilterChange = (type: 'province' | 'mall', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (type === 'province') {
            setSelectedProvince(value);
            setSelectedMall('ALL'); // Reset mall when province changes
            params.set('province', value);
            params.delete('mall');
            if (value === 'ALL') params.delete('province');
        }
        if (type === 'mall') {
            setSelectedMall(value);
            params.set('mall', value);
            if (value === 'ALL') params.delete('mall');
        }
        router.push(`?${params.toString()}`);
    }

    return (
        <>
            <Header />
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

                             <Select value={selectedMall} onValueChange={(val) => handleFilterChange('mall', val)}>
                                <SelectTrigger className="w-full md:w-[240px]">
                                    <SelectValue placeholder="Select a Mall" />
                                </SelectTrigger>
                                <SelectContent>
                                     <SelectItem value="ALL">All Malls</SelectItem>
                                    {mallsInProvince.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))
                            ) : (
                                <motion.div 
                                    className="col-span-full text-center py-16 bg-background rounded-lg border-dashed border-2 flex flex-col items-center justify-center h-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No events found matching your criteria.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
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
