
'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Building, Calendar, MapPin, Search, ShoppingBag } from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';
import { MALLS, type Mall } from '@/lib/malls';
import { SHOPS } from '@/lib/shops';
import { EVENTS } from '@/lib/events';
import { motion } from 'framer-motion';

function FindShopsPageComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Nepal's country data
    const nepalData = COUNTRIES.find(c => c.code === 'NP');
    const provinces = nepalData?.states || [];

    // Component state
    const [selectedProvince, setSelectedProvince] = useState(searchParams.get('province') || provinces[0]?.code || '');
    const [selectedMall, setSelectedMall] = useState(searchParams.get('mall') || '');
    const [searchTerm, setSearchTerm] = useState('');

    const mallsInProvince = useMemo(() => {
        return MALLS.filter(mall => mall.province === selectedProvince);
    }, [selectedProvince]);

    const mallDetails = useMemo(() => {
        return MALLS.find(mall => mall.id === selectedMall);
    }, [selectedMall]);

    const shopsInMall = useMemo(() => {
        if (!selectedMall) return [];
        const allShops = SHOPS[selectedMall] || [];
        if (!searchTerm) return allShops;
        return allShops.filter(shop => 
            shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [selectedMall, searchTerm]);

    const eventsInMall = useMemo(() => {
        if (!selectedMall) return [];
        return EVENTS[selectedMall] || [];
    }, [selectedMall]);

    const handleProvinceChange = (provinceCode: string) => {
        setSelectedProvince(provinceCode);
        setSelectedMall(''); // Reset mall selection
        const params = new URLSearchParams();
        params.set('province', provinceCode);
        router.push(`?${params.toString()}`);
    };
    
    const handleMallChange = (mallId: string) => {
        setSelectedMall(mallId);
        const params = new URLSearchParams(searchParams.toString());
        params.set('mall', mallId);
        router.push(`?${params.toString()}`);
    };

    return (
        <>
            <Header />
            <main className="flex-1 bg-muted/20">
                <div className="container mx-auto px-4 py-8 md:py-16">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline text-accent flex items-center justify-center gap-3">
                           <ShoppingBag className="h-10 w-10" /> Find Shops in Nepal
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                            Discover shops, restaurants, and entertainment in Nepal's top shopping malls. Select a province and a mall to get started.
                        </p>
                    </div>

                    {/* Filters */}
                    <Card className="mb-8">
                        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                            <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Select a Province" />
                                </SelectTrigger>
                                <SelectContent>
                                    {provinces.map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>

                             <Select value={selectedMall} onValueChange={handleMallChange} disabled={mallsInProvince.length === 0}>
                                <SelectTrigger className="w-full md:w-[240px]">
                                    <SelectValue placeholder="Select a Mall" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mallsInProvince.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search for a shop or category..."
                                    className="pl-10 h-10 w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    aria-label="Search shops"
                                    disabled={!selectedMall}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {!selectedMall ? (
                        <div className="text-center py-16 bg-card rounded-lg shadow-sm flex flex-col items-center justify-center">
                            <Building className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">Please select a mall to see the directory.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Shops List (Left/Main Column) */}
                            <div className="lg:col-span-2">
                                <h2 className="text-2xl font-bold font-headline mb-4">{mallDetails?.name} Directory</h2>
                                {shopsInMall.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {shopsInMall.map((shop, index) => (
                                            <motion.div key={shop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                                <Card className="h-full">
                                                    <CardHeader className="flex flex-row items-start gap-4">
                                                        <Image src={shop.logoUrl} alt={`${shop.name} logo`} width={60} height={60} className="rounded-md border" />
                                                        <div className="flex-1">
                                                            <CardTitle className="text-lg">{shop.name}</CardTitle>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="secondary">{shop.category}</Badge>
                                                                <Badge variant="outline">{shop.floor}</Badge>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-muted-foreground">{shop.description}</p>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                     <div className="text-center py-16 bg-background rounded-lg border-dashed border-2 flex flex-col items-center justify-center">
                                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No shops found matching your search.</p>
                                    </div>
                                )}
                            </div>

                            {/* Mall Info & Events (Right/Side Column) */}
                            <div className="space-y-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-headline">Mall Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Building className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                            <p className="font-semibold">{mallDetails?.name}</p>
                                        </div>
                                         <div className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                            <p className="text-sm text-muted-foreground">{mallDetails?.address}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-headline">What's Happening</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {eventsInMall.length > 0 ? (
                                            <div className="space-y-6">
                                                {eventsInMall.map(event => (
                                                    <div key={event.id}>
                                                        <Image src={event.imageUrl} alt={event.name} width={400} height={200} className="rounded-lg mb-3 aspect-video object-cover" />
                                                        <h4 className="font-semibold">{event.name}</h4>
                                                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                                                        <Badge><Calendar className="h-3 w-3 mr-1.5" />{event.date}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                             <div className="text-center py-8">
                                                <p className="text-sm text-muted-foreground">No current events to show.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

export default function FindShopsPage() {
    return (
        <Suspense fallback={<div className="flex-1 text-center p-8">Loading...</div>}>
            <FindShopsPageComponent />
        </Suspense>
    )
}
