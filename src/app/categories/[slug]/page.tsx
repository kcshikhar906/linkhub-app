'use client';

import { LinkCard } from '@/components/link-card';
import { notFound, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { type Category, type Service, categoryConverter, serviceConverter, getIcon } from '@/lib/data';
import { COUNTRIES } from '@/lib/countries';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CATEGORY_TAGS } from '@/lib/category-tags';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type CategoryPageClientProps = {
  slug: string;
};

function CategoryPageClient({ slug }: CategoryPageClientProps) {
  const searchParams = useSearchParams();
  const country = searchParams.get('country') || 'AU'; // Default to Australia
  const state = searchParams.get('state');

  const [category, setCategory] = useState<Category | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering state
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const availableTags = useMemo(() => CATEGORY_TAGS[slug] || [], [slug]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const categoryQuery = query(collection(db, "categories"), where("slug", "==", slug));
      const categorySnapshot = await getDocs(categoryQuery.withConverter(categoryConverter));
      
      if (categorySnapshot.empty) {
        notFound();
        return;
      }
      const fetchedCategory = categorySnapshot.docs[0].data();
      setCategory(fetchedCategory);

      const conditions = [
          where("categorySlug", "==", slug),
          where("status", "==", "published"),
          where("country", "==", country),
      ];

      const servicesQuery = query(collection(db, "services"), ...conditions);
      let servicesSnapshot = await getDocs(servicesQuery.withConverter(serviceConverter));

      let fetchedServices = servicesSnapshot.docs.map(doc => doc.data());
      
      if (state) {
        fetchedServices = fetchedServices.filter(service => service.state === state);
      }
      
      setServices(fetchedServices);

      setLoading(false);
      setSelectedTag('');
      setSearchTerm('');
    }

    fetchData();
  }, [slug, country, state]);


  const filteredServices = useMemo(() => {
    return services.filter(service => {
        const tagMatch = selectedTag === '' || (service.tags && service.tags.includes(selectedTag));
        const searchMatch = searchTerm === '' || 
            service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        return tagMatch && searchMatch;
    });
  }, [services, selectedTag, searchTerm]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="flex items-center gap-4 mb-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-64" />
            </div>
            <Skeleton className="h-6 w-48 mb-8" />
             <div className="flex flex-col md:flex-row gap-4 mb-8">
                {availableTags.length > 0 && <Skeleton className="h-10 w-full md:w-[240px]" />}
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!category) {
    return null; // notFound() would have been called
  }

  const Icon = getIcon(category.iconName);
  const countryData = COUNTRIES.find(c => c.code === country);
  const stateData = countryData?.states.find(s => s.code === state);
  const locationName = stateData ? `${stateData.name}, ${countryData?.name}` : countryData?.name;

  return (
    <>
      <Header />
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
                        <SelectItem value="">All Sub-categories</SelectItem>
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
      <Footer />
    </>
  );
}


type CategoryPageProps = {
  params: {
    slug: string;
  };
};

// This is the main export, a Server Component that wraps the client part.
export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryPageClient slug={slug} />
    </Suspense>
  );
}