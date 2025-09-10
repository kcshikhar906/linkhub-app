import { CategoryCard } from '@/components/category-card';
import { SearchBar } from '@/components/search-bar';
import { CATEGORIES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <section className="text-center mb-16 md:mb-24">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-headline">
          Navigate Bureaucracy, Simplified.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Your clear, step-by-step guide to essential services. Find what you need, fast.
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">
            Browse by Category
          </h2>
          <Button asChild variant="link" className="text-primary">
            <Link href="/categories">View All</Link>
          </Button>
        </div>
       
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
