import { LinkCard } from '@/components/link-card';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MountainSnow } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { type Category, type Service, categoryConverter, serviceConverter, getIcon } from '@/lib/data';

export const metadata: Metadata = {
  title: 'For the Nepalese Community',
  description: 'Services and guides specifically for the Nepalese community in Australia.',
};

async function getNepalCategory(): Promise<Category | null> {
    const q = query(collection(db, "categories"), where("slug", "==", 'nepal-specific'));
    const querySnapshot = await getDocs(q.withConverter(categoryConverter));
    if (querySnapshot.empty) {
        return null;
    }
    return querySnapshot.docs[0].data();
}

async function getNepalServices(): Promise<Service[]> {
    const q = query(collection(db, "services"), where("categorySlug", "==", 'nepal-specific'));
    const querySnapshot = await getDocs(q.withConverter(serviceConverter));
    return querySnapshot.docs.map(doc => doc.data());
}


export default async function NepalPage() {
  const category = await getNepalCategory();

  if (!category) {
    notFound();
  }

  const services = await getNepalServices();
  const Icon = getIcon(category.iconName);


  return (
   <>
    <Header />
    <main className="flex-1">
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <Icon className="h-10 w-10 text-accent" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline text-accent">
          {category.name}
        </h1>
      </div>
      <p className="max-w-4xl text-lg text-muted-foreground mb-12">
        A collection of resources curated for Nepalese individuals in Australia, covering everything from consular services to community connections and financial tools.
      </p>
      {services.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((service) => (
            <LinkCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg shadow-sm">
          <p className="text-muted-foreground">
            There are no services listed in this category yet.
          </p>
        </div>
      )}
    </div>
    </main>
    <Footer />
   </>
  );
}
