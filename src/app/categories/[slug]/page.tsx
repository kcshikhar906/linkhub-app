'use client';

import { LinkCard } from '@/components/link-card';
import { notFound, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { type Category, type Service, categoryConverter, serviceConverter, getIcon } from '@/lib/data';
import { COUNTRIES } from '@/lib/countries';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

// This component fetches the data on the client
function CategoryPageClient({ params }: CategoryPageProps) {
  const { slug } = params;
  const searchParams = useSearchParams();
  const country = searchParams.get('country') || 'AU'; // Default to Australia
  const state = searchParams.get('state');

  const [category, setCategory] = useState<Category | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

      if (state) {
          conditions.push(where("state", "==", state));
      }

      const servicesQuery = query(collection(db, "services"), ...conditions);
      const servicesSnapshot = await getDocs(servicesQuery.withConverter(serviceConverter));
      setServices(servicesSnapshot.docs.map(doc => doc.data()));

      setLoading(false);
      setSelectedTag(null); // Reset tag on data change
    }

    fetchData();
  }, [slug, country, state]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    services.forEach(service => {
        service.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!selectedTag) {
        return services;
    }
    return services.filter(service => service.tags?.includes(selectedTag));
  }, [services, selectedTag]);

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
          
          {allTags.length > 0 && (
            <div className="mb-8 flex items-center flex-wrap gap-2">
                <Button variant={!selectedTag ? 'default' : 'outline'} onClick={() => setSelectedTag(null)}>All</Button>
                {allTags.map(tag => (
                    <Button key={tag} variant={selectedTag === tag ? 'default' : 'outline'} onClick={() => setSelectedTag(tag)}>
                        {tag}
                    </Button>
                ))}
            </div>
          )}

          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <LinkCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-lg shadow-sm">
              <p className="text-muted-foreground">
                There are no services listed in this category for the selected region{selectedTag ? ` with the tag "${selectedTag}"` : ''} yet.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}


// The main export remains a Server Component that wraps the client one.
export default function CategoryPage({ params }: CategoryPageProps) {
  return <CategoryPageClient params={params} />;
}
