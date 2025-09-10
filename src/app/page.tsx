import { CategoryCard } from '@/components/category-card';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { type Category, categoryConverter, type Service, serviceConverter } from '@/lib/data';

async function getCategories(country: string, state?: string) {
    const servicesQuery = state 
    ? query(collection(db, 'services'), where('country', '==', country), where('state', '==', state), where('status', '==', 'published'))
    : query(collection(db, 'services'), where('country', '==', country), where('status', '==', 'published'));
    
    const servicesSnapshot = await getDocs(servicesQuery.withConverter(serviceConverter));
    const services = servicesSnapshot.docs.map(doc => doc.data());
    
    // If there are no services for the selected location, we can't show any categories for it.
    if (services.length === 0) return [];

    // Get the unique slugs from the services available in the location
    const categorySlugs = [...new Set(services.map(service => service.categorySlug))];
    
    if (categorySlugs.length === 0) return [];

    // Fetch the full category details for those slugs
    // Firestore 'in' queries are limited to 30 items. If you have more than 30 categories with services, this will need refactoring.
    const categoriesQuery = query(collection(db, 'categories'), where('slug', 'in', categorySlugs));
    const categoriesSnapshot = await getDocs(categoriesQuery.withConverter(categoryConverter));
    
    return categoriesSnapshot.docs.map(doc => doc.data());
}


export default async function Home({ searchParams }: { searchParams: { country?: string; state?: string } }) {
  // Default to Australia if no country is provided
  const country = searchParams.country || 'AU';
  const state = searchParams.state;

  const categories = await getCategories(country, state);

  const countryName = country === 'AU' ? 'Australia' : 'the selected region'; // Simple mapping for now

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
              <Link href="/categories">View All</Link>
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
                        There are no services listed for the selected region yet.
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
