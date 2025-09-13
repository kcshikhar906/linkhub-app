'use client';

import type { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { type Category, type Service, categoryConverter, serviceConverter, getIcon } from '@/lib/data';
import { COUNTRIES } from '@/lib/countries';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ServiceCard } from '@/components/service-card';
import { ServiceDetailsDialog } from '@/components/service-details-dialog';
import { Skeleton } from '@/components/ui/skeleton';

/*
// This page is now a client component to handle its own loading and state.
export const metadata: Metadata = {
  title: 'All Categories',
};
*/

function AllCategoriesPageComponent() {
  const searchParams = useSearchParams();
  const country = searchParams.get('country') || 'AU';
  const state = searchParams.get('state');

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        try {
            const categoriesQuery = query(collection(db, 'categories'), orderBy('name'));
            const categoriesSnapshot = await getDocs(categoriesQuery.withConverter(categoryConverter));
            setCategories(categoriesSnapshot.docs.map(doc => doc.data()));

            const serviceConditions = [
                where("status", "==", "published" as const),
                where("country", "==", country),
            ];
            if (state) {
                serviceConditions.push(where("state", "==", state));
            }

            const servicesQuery = query(collection(db, 'services'), ...serviceConditions, orderBy('title'));
            const servicesSnapshot = await getDocs(servicesQuery.withConverter(serviceConverter));
            setServices(servicesSnapshot.docs.map(doc => doc.data()));

        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [country, state]);
  
  const countryData = COUNTRIES.find(c => c.code === country);
  const stateData = countryData?.states.find(s => s.code === state);
  const locationName = stateData ? `${stateData.name}, ${countryData?.name}` : countryData?.name;
  
  if (loading) {
      return (
        <main className="flex-1">
            <div className="container mx-auto px-4 py-8 md:py-16">
                 <Skeleton className="h-10 w-1/2 mb-2" />
                 <Skeleton className="h-6 w-1/3 mb-8" />
                 <div className="space-y-12">
                     <div>
                        <Skeleton className="h-8 w-1/4 mb-6" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                     </div>
                      <div>
                        <Skeleton className="h-8 w-1/3 mb-6" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                             <Skeleton className="h-32 w-full" />
                        </div>
                     </div>
                 </div>
            </div>
        </main>
      )
  }

  return (
    <>
      <ServiceDetailsDialog service={selectedService} isOpen={!!selectedService} onOpenChange={(isOpen) => !isOpen && setSelectedService(null)} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 font-headline">
            All Services
          </h1>
          {locationName && <p className="text-muted-foreground mb-8">Showing services for {locationName}</p>}
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryServices = services.filter(
                (service) => service.categorySlug === category.slug
              );
              if (categoryServices.length === 0) return null;

              const Icon = getIcon(category.iconName);

              return (
                <section key={category.slug} id={category.slug}>
                  <div className="flex items-center gap-3 mb-6">
                    <Icon className="h-8 w-8 text-primary" />
                    <h2 className="text-2xl md:text-3xl font-bold font-headline">
                      {category.name}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryServices.map((service) => (
                      <ServiceCard key={service.id} service={service} onClick={() => setSelectedService(service)} />
                    ))}
                  </div>
                </section>
              );
            })}
             {services.length === 0 && !loading && (
                 <div className="text-center py-16 bg-card rounded-lg shadow-sm">
                    <p className="text-muted-foreground">
                        There are no services available for {locationName}.
                    </p>
                </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function AllCategoriesPage() {
    return (
        <>
            <Header />
            <Suspense fallback={<div className="flex-1 text-center p-8">Loading...</div>}>
                <AllCategoriesPageComponent />
            </Suspense>
            <Footer />
        </>
    )
}
