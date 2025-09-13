import { CategoryCard } from '@/components/category-card';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, getCountFromServer } from 'firebase/firestore';
import { type Category, categoryConverter, type Service, serviceConverter } from '@/lib/data';
import { COUNTRIES } from '@/lib/countries';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

const popularSearches = [
    {
        text: 'Student Visas in New South Wales',
        categorySlug: 'visas-and-immigration',
        tag: 'Student Visa',
        country: 'AU',
        state: 'NSW',
    },
    {
        text: 'Educational Consultancies in Bagmati',
        categorySlug: 'education-and-training',
        tag: 'Educational Consultancy',
        country: 'NP',
        state: 'BAGMATI',
    },
    {
        text: 'Driving Licenses in Victoria',
        categorySlug: 'driving-and-transport',
        tag: 'License Application',
        country: 'AU',
        state: 'VIC',
    },
    {
        text: 'Community Organizations in Nepal',
        categorySlug: 'nepal-specific',
        tag: 'Community Organizations',
        country: 'NP',
        state: undefined,
    }
];


async function getServicesForLocation(country: string, state?: string) {
    const conditions = [
        where('country', '==', country), 
        where('status', '==', 'published')
    ];
    if (state) {
        conditions.push(where('state', '==', state));
    }
    
    const servicesQuery = query(collection(db, 'services'), ...conditions);
    const servicesSnapshot = await getDocs(servicesQuery.withConverter(serviceConverter));
    return servicesSnapshot.docs.map(doc => doc.data());
}

async function getAllCategories() {
    const categoriesQuery = query(collection(db, 'categories'));
    const categoriesSnapshot = await getDocs(categoriesQuery.withConverter(categoryConverter));
    return categoriesSnapshot.docs.map(doc => doc.data());
}

async function getPopularSearchCounts() {
    const counts = await Promise.all(popularSearches.map(async (search) => {
        const conditions = [
            where('categorySlug', '==', search.categorySlug),
            where('country', '==', search.country),
            where('tags', 'array-contains', search.tag),
            where('status', '==', 'published')
        ];
        if (search.state) {
            conditions.push(where('state', '==', search.state));
        }

        const q = query(collection(db, 'services'), ...conditions);
        const snapshot = await getCountFromServer(q);
        return {
            ...search,
            count: snapshot.data().count
        };
    }));
    return counts.filter(c => c.count > 0);
}


export default async function Home({ searchParams }: { searchParams: { country?: string; state?: string } }) {
  // Default to Australia if no country is provided
  const countryCode = searchParams.country || 'AU';
  const stateCode = searchParams.state;

  const allCategories = await getAllCategories();
  const locationServices = await getServicesForLocation(countryCode, stateCode);
  const popularSearchesWithCounts = await getPopularSearchCounts();
  
  // Get the slugs of categories that have services in the selected location
  const availableCategorySlugs = new Set(locationServices.map(service => service.categorySlug));
  
  // Filter the main category list
  const categories = allCategories.filter(category => availableCategorySlugs.has(category.slug));
  
  const countryData = COUNTRIES.find(c => c.code === countryCode);
  const countryName = countryData ? countryData.name : 'the selected region';

  return (
   <>
    <Header />
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <section className="text-center mb-16 md:mb-24">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-headline">
            Navigate Bureaucracy, Simplified.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Your clear, step-by-step guide to essential services in {countryName}. Find what you need, fast.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </section>

        <section className="mb-16 md:mb-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">
              Browse by Category
            </h2>
            <Button asChild variant="link" className="text-primary">
              <Link href={{ pathname: '/categories', query: searchParams }}>View All</Link>
            </Button>
          </div>
        
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
            {categories.length === 0 && (
                <div className="text-center py-16 bg-card rounded-lg shadow-sm">
                    <p className="text-muted-foreground">
                        There are no services listed for {countryName} yet.
                    </p>
                </div>
            )}
        </section>
        
        {popularSearchesWithCounts.length > 0 && (
        <section>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">
                  Popular Searches
                </h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularSearchesWithCounts.map(search => (
                    <Link
                        key={search.text}
                        href={{
                            pathname: `/categories/${search.categorySlug}`,
                            query: { country: search.country, state: search.state, tag: search.tag }
                        }}
                        className="group block"
                    >
                        <div className="border rounded-lg p-4 h-full flex justify-between items-center transition-all hover:border-primary hover:shadow-md">
                            <div>
                                <p className="font-semibold text-card-foreground">{search.text}</p>
                                <p className="text-sm text-muted-foreground">{search.count} service{search.count !== 1 && 's'}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </Link>
                ))}
             </div>
        </section>
        )}

      </div>
    </main>
    <Footer />
   </>
  );
}
