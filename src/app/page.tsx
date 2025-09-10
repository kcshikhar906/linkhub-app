import { CategoryCard } from '@/components/category-card';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { type Category, categoryConverter, type Service, serviceConverter } from '@/lib/data';
import { COUNTRIES } from '@/lib/countries';


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


export default async function Home({ searchParams }: { searchParams: { country?: string; state?: string } }) {
  // Default to Australia if no country is provided
  const countryCode = searchParams.country || 'AU';
  const stateCode = searchParams.state;

  const allCategories = await getAllCategories();
  const locationServices = await getServicesForLocation(countryCode, stateCode);
  
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
      </div>
    </main>
    <Footer />
   </>
  );
}
