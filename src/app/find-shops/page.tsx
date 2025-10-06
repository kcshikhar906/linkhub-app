
'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Building, Calendar, MapPin, Search, ShoppingBag, Globe, Phone, ExternalLink, Clock, Users, X } from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';
import { MALLS, type Mall, type Shop } from '@/lib/malls';
import { SHOPS, type ShopWithMall } from '@/lib/shops';
import { EVENTS } from '@/lib/events';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function ShopCard({ shop, onSelect, isSelected }: { shop: ShopWithMall, onSelect: () => void, isSelected: boolean }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
        >
            <Card 
                className={`cursor-pointer transition-all duration-200 ${isSelected ? 'border-primary shadow-lg' : 'hover:border-primary/50'}`}
                onClick={onSelect}
            >
                <CardHeader className="flex flex-row items-start gap-4">
                    <Image src={shop.logoUrl} alt={`${shop.name} logo`} width={50} height={50} className="rounded-md border aspect-square object-contain" />
                    <div className="flex-1">
                        <CardTitle className="text-base">{shop.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{shop.category}</p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">{shop.floor}</Badge>
                            <Badge variant="outline" className="text-xs">{shop.mallName}</Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </motion.div>
    )
}

function ShopDetails({ shop, allShops, onSelectShop, onDeselect }: { shop: ShopWithMall, allShops: ShopWithMall[], onSelectShop: (shop: ShopWithMall) => void, onDeselect: () => void }) {
    const similarShops = allShops.filter(s => s.category === shop.category && s.id !== shop.id).slice(0, 3);
    
    return (
        <motion.div
            layout
            key={shop.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="sticky top-24"
        >
            <Card className="shadow-xl relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full" onClick={onDeselect}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </Button>
                <CardHeader className="text-center items-center pt-8">
                    <Image src={shop.logoUrl} alt={`${shop.name} logo`} width={80} height={80} className="rounded-lg border mb-2" />
                    <CardTitle className="text-2xl font-bold font-headline">{shop.name}</CardTitle>
                    <p className="text-muted-foreground">{shop.mallName} - {shop.floor}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-center text-muted-foreground">{shop.description}</p>
                    
                    <Separator />
                    
                    <div className="space-y-3 text-sm">
                        {shop.openingHours && (
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="font-medium text-foreground">{shop.openingHours}</span>
                            </div>
                        )}
                         {shop.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                                <a href={`tel:${shop.phone}`} className="font-medium text-foreground hover:underline">{shop.phone}</a>
                            </div>
                        )}
                        {shop.website && (
                             <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                                <a href={shop.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline truncate">
                                    {shop.website.replace(/^(https?:\/\/)?(www\.)?/, '')} <ExternalLink className="inline h-3 w-3" />
                                </a>
                            </div>
                        )}
                    </div>

                    {similarShops.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="h-4 w-4"/> Similar Shops</h4>
                                <div className="space-y-2">
                                    {similarShops.map(similar => (
                                        <div key={similar.id} onClick={() => onSelectShop(similar)} className="cursor-pointer flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                                            <Image src={similar.logoUrl} alt={`${similar.name} logo`} width={32} height={32} className="rounded-md border" />
                                            <div>
                                                <p className="font-semibold text-sm">{similar.name}</p>
                                                <p className="text-xs text-muted-foreground">{similar.mallName}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                </CardContent>
            </Card>
        </motion.div>
    )
}


function FindShopsPageComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const nepalData = COUNTRIES.find(c => c.code === 'NP');
    const provinces = nepalData?.states || [];

    const [selectedProvince, setSelectedProvince] = useState(searchParams.get('province') || 'ALL');
    const [selectedMall, setSelectedMall] = useState(searchParams.get('mall') || 'ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedShop, setSelectedShop] = useState<ShopWithMall | null>(null);

    const mallsInProvince = useMemo(() => {
        if (selectedProvince === 'ALL') return MALLS;
        return MALLS.filter(mall => mall.province === selectedProvince);
    }, [selectedProvince]);

    const filteredShops = useMemo(() => {
        let shops: ShopWithMall[] = SHOPS;

        if (selectedProvince !== 'ALL') {
            shops = shops.filter(shop => shop.province === selectedProvince);
        }

        if (selectedMall !== 'ALL') {
            shops = shops.filter(shop => shop.mallId === selectedMall);
        }
        
        if (searchTerm) {
            shops = shops.filter(shop => 
                shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return shops;
    }, [selectedProvince, selectedMall, searchTerm]);

    const handleFilterChange = (type: 'province' | 'mall', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        setSelectedShop(null); // Deselect shop on filter change

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
                           <ShoppingBag className="h-10 w-10" /> Find Shops in Nepal
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                            Discover shops, restaurants, and entertainment in Nepal's top shopping malls. Select a province and a mall to get started.
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
                            
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search for a shop or category..."
                                    className="pl-10 h-10 w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    aria-label="Search shops"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Shops List */}
                        <motion.div 
                            layout 
                            className={`${selectedShop ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-4`}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                             {filteredShops.length > 0 ? (
                                <AnimatePresence>
                                    {filteredShops.map((shop) => (
                                        <ShopCard 
                                            key={shop.id} 
                                            shop={shop} 
                                            onSelect={() => setSelectedShop(shop)}
                                            isSelected={selectedShop?.id === shop.id}
                                        />
                                    ))}
                                </AnimatePresence>
                             ) : (
                                <div className="text-center py-16 bg-background rounded-lg border-dashed border-2 flex flex-col items-center justify-center h-full">
                                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No shops found matching your criteria.</p>
                                </div>
                             )}
                        </motion.div>

                        {/* Details Column */}
                        <motion.div 
                            layout
                            className={`${selectedShop ? 'lg:col-span-2' : 'lg:col-span-1'} relative`}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <AnimatePresence>
                                {selectedShop ? (
                                    <ShopDetails 
                                        shop={selectedShop} 
                                        allShops={filteredShops} 
                                        onSelectShop={setSelectedShop}
                                        onDeselect={() => setSelectedShop(null)}
                                    />
                                ) : (
                                    <div className="sticky top-24 text-center py-16 bg-background rounded-lg border-dashed border-2 flex flex-col items-center justify-center">
                                        <p className="text-muted-foreground">Select a shop to see details.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
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
