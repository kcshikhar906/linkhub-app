'use client';

import { LinkCard } from '@/components/link-card';
import { type Category, type Service, getIcon } from '@/lib/data';
import { COUNTRIES } from '@/lib/countries';
import { useMemo, useState } from 'react';
import { CATEGORY_TAGS } from '@/lib/category-tags';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface CategoryPageClientProps {
    category: Category;
    services: Service[];
}

export function CategoryPageClient({ category, services: initialServices }: CategoryPageClientProps) {
    const searchParams = useSearchParams();
    const country = searchParams.get('country') || 'AU';
    const state = searchParams.get('state');

    // Filtering state
    const [selectedTag, setSelectedTag] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const availableTags = useMemo(() => CATEGORY_TAGS[category.slug] || [], [category.slug]);

    const filteredServices = useMemo(() => {
        let services = initialServices;
        
        // Client-side state filter
        if (state) {
            services = services.filter(service => service.state === state);
        } else {
            services = services.filter(service => !service.state);
        }

        return services.filter(service => {
            const tagMatch = selectedTag === 'ALL' || (service.tags && service.tags.includes(selectedTag));
            const searchMatch = searchTerm === '' ||
                service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(searchTerm.toLowerCase());

            return tagMatch && searchMatch;
        });
    }, [initialServices, selectedTag, searchTerm, state]);

    const Icon = getIcon(category.iconName);
    const countryData = COUNTRIES.find(c => c.code === country);
    const stateData = countryData?.states.find(s => s.code === state);
    const locationName = stateData ? `${stateData.name}, ${countryData?.name}` : countryData?.name;


    return (
        <main className="flex-1">
            <div className="container mx-auto px-4 py-8 md:py-16">
                <div className="flex items-center gap-4 mb-2">
                    <Icon className="h-10 w-10 text-primary" />
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">
                        {category.name}
                    </h1>
                </div>
                {locationName && <p className="text-muted-foreground mb-8">Showing services for {locationName}</p>}

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {availableTags.length > 0 && (
                        <Select value={selectedTag} onValueChange={setSelectedTag}>
                            <SelectTrigger className="w-full md:w-[240px]">
                                <SelectValue placeholder="Filter by sub-category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Sub-categories</SelectItem>
                                {availableTags.map(tag => (
                                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search within this category..."
                            className="pl-10 h-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search services"
                        />
                    </div>
                </div>


                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredServices.map((service) => (
                            <LinkCard key={service.id} service={service} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-card rounded-lg shadow-sm">
                        <p className="text-muted-foreground">
                            There are no services that match your criteria in this category for the selected region.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
