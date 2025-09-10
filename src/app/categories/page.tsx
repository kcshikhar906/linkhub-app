import { LinkCard } from '@/components/link-card';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { type Category, type Service, categoryConverter, serviceConverter, getIcon } from '@/lib/data';
import { COUNTRIES } from '@/lib/countries';

export const metadata: Metadata = {
  title: 'All Categories',
};

async function getCategories(): Promise<Category[]> {
  const q = query(collection(db, 'categories'), orderBy('name'));
  const snapshot = await getDocs(q.withConverter(categoryConverter));
  return snapshot.docs.map(doc => doc.data());
}

async function getServices(country: string, state?: string): Promise<Service[]> {
  const conditions = [
      where("status", "==", "published"),
      where("country", "==", country),
  ];

  if (state) {
      conditions.push(where("state", "==", state));
  }
  
  const q = query(collection(db, 'services'), ...conditions, orderBy('title'));
  const snapshot = await getDocs(q.withConverter(serviceConverter));
  return snapshot.docs.map(doc => doc.data());
}


export default async function AllCategoriesPage({ searchParams }: { searchParams: { country?: string, state?: string } }) {
  const country = searchParams.country || 'AU'; // Default to Australia
  const state = searchParams.state;
  
  const categories = await getCategories();
  const services = await getServices(country, state);

  const countryData = COUNTRIES.find(c => c.code === country);
  const stateData = countryData?.states.find(s => s.code === state);
  const locationName = stateData ? `${stateData.name}, ${countryData?.name}` : countryData?.name;

  return (
    <>
      <Header />
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {categoryServices.map((service) => (
                      <LinkCard key={service.id} service={service} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
