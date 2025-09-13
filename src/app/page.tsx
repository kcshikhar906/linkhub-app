
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
import { TypingEffect } from '@/components/typing-effect';
import { WelcomeGuide } from '@/components/welcome-guide';
import { MotionLink } from '@/components/motion-link';
import { StatsCounter } from '@/components/stats-counter';

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
        tag: 'Study abroad consultancies',
        country: 'NP',
        state: 'BAGMATI',
    },
    {
        text: 'Driving Licenses in Victoria',
        categorySlug: 'driving-and-transport',
        tag: 'Driver licensing',
        country: 'AU',
        state: 'VIC',
    },
    {
        text: 'Community Organizations in Nepal',
        categorySlug: 'nepal-specific',
        tag: 'NGOs & nonprofits',
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
        const conditions: any[] = [
            where('categorySlug', '==', search.categorySlug),
            where('country', '==', search.country),
            where('status', '==', 'published')
        ];
        
        // Firestore doesn't allow `array-contains` and `in` on the same field, or multiple `array-contains`.
        // So, we have to be specific.
        if (search.tag) {
            conditions.push(where('tags', 'array-contains', search.tag));
        }

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
    <WelcomeGuide />
    <main className="flex-1">
      {/* Hero section is pulled up behind the sticky header with a negative margin */}
      <div className="container px-4">
        <section className="relative h-[70vh] flex items-center justify-center text-center text-white overflow-hidden -mt-[64px] pt-[64px] rounded-b-lg">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute z-0 w-full h-full object-cover"
          >
            <source src="/logo/hero-video.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute z-10 w-full h-full bg-black/50"></div>
           <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20"></div>
          <div className="z-20 container px-4">
              <TypingEffect />
              <div className="max-w-2xl mx-auto mt-8">
                <SearchBar />
              </div>
          </div>
        </section>
      </div>

      <StatsCounter />

      <div className="container mx-auto px-4 py-16 md:py-24">
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
            {categories.map((category, index) => (
              <CategoryCard key={category.slug} category={category} index={index} />
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
                {popularSearchesWithCounts.map((search, index) => (
                    <MotionLink
                        key={search.text}
                        href={{
                            pathname: `/categories/${search.categorySlug}`,
                            query: { country: search.country, state: search.state, tag: search.tag }
                        }}
                        className="group block"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ delay: index * 0.1, duration: 0.3, ease: 'easeOut' }}
                    >
                        <div className="border rounded-lg p-4 h-full flex justify-between items-center transition-all hover:border-primary hover:shadow-md">
                            <div>
                                <p className="font-semibold text-card-foreground">{search.text}</p>
                                <p className="text-sm text-muted-foreground">{search.count} service{search.count !== 1 && 's'}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </MotionLink>
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
