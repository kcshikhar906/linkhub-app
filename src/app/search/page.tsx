
'use client';

import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search-bar';
import { Suspense, useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { serviceConverter, type Service } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { COUNTRIES } from '@/lib/countries';
import { ServiceCard } from '@/components/service-card';
import { ServiceDetailsDialog } from '@/components/service-details-dialog';

function SearchResults() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');
  const country = searchParams.get('country') || 'AU';
  const state = searchParams.get('state');

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);


  useEffect(() => {
    async function fetchServices() {
        setLoading(true);
        const conditions = [
            where('status', '==', 'published' as const),
            where('country', '==', country)
        ];
        if (state) {
            conditions.push(where('state', '==', state));
        }
        const servicesQuery = query(
            collection(db, 'services'),
            ...conditions
        ).withConverter(serviceConverter);

        const servicesSnapshot = await getDocs(servicesQuery);
        setServices(servicesSnapshot.docs.map(doc => doc.data()));
        setLoading(false);
    }
    fetchServices();
  }, [country, state])

  const filteredServices = queryParam
    ? services.filter(
        (service) =>
          service.title.toLowerCase().includes(queryParam.toLowerCase()) ||
          service.description.toLowerCase().includes(queryParam.toLowerCase()) ||
          (service.tags && service.tags.some(tag => tag.toLowerCase().includes(queryParam.toLowerCase())))
      )
    : services;

  const countryData = COUNTRIES.find(c => c.code === country);
  const stateData = countryData?.states.find(s => s.code === state);
  const locationName = stateData ? `${stateData.name}, ${countryData?.name}` : countryData?.name;


  return (
    <>
      <ServiceDetailsDialog service={selectedService} isOpen={!!selectedService} onOpenChange={(isOpen) => !isOpen && setSelectedService(null)} />
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-3xl mx-auto mb-8">
            <SearchBar />
          </div>
            {locationName && <p className="text-muted-foreground text-center mb-8">Showing services for {locationName}</p>}

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
          ) : queryParam ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 font-headline">
                Results for "{queryParam}"
              </h1>
              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service, index) => (
                    <ServiceCard key={service.id} service={service} onClick={() => setSelectedService(service)} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-lg shadow-sm">
                  <p className="text-lg font-medium">No results found.</p>
                  <p className="text-muted-foreground mt-2">
                    Try searching for something else in the selected region.
                  </p>
                </div>
              )}
            </>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                   <ServiceCard key={service.id} service={service} onClick={() => setSelectedService(service)} index={index} />
                ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
    )
}
