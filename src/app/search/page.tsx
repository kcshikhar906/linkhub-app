'use client';

import { useSearchParams } from 'next/navigation';
import { LinkCard } from '@/components/link-card';
import { SERVICES } from '@/lib/data';
import { SearchBar } from '@/components/search-bar';
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const filteredServices = query
    ? SERVICES.filter(
        (service) =>
          service.title.toLowerCase().includes(query.toLowerCase()) ||
          service.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-3xl mx-auto mb-12">
            <SearchBar />
          </div>

          {query ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 font-headline">
                Results for "{query}"
              </h1>
              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredServices.map((service) => (
                    <LinkCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-lg shadow-sm">
                  <p className="text-lg font-medium">No results found.</p>
                  <p className="text-muted-foreground mt-2">
                    Try searching for something else.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-card rounded-lg shadow-sm">
              <p className="text-lg font-medium">Search for a service</p>
              <p className="text-muted-foreground mt-2">
                Use the search bar above to find guides for essential services.
              </p>
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
