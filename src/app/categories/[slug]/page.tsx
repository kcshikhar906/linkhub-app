import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { type Category, type Service, categoryConverter, serviceConverter } from '@/lib/data';
import { notFound } from 'next/navigation';
import { CategoryPageClient } from './page-client';
import { Suspense } from 'react';

type CategoryPageProps = {
  params: { slug: string };
  searchParams: { country?: string; state?: string };
};

async function getCategoryData(slug: string): Promise<Category | null> {
    const categoryQuery = query(collection(db, "categories"), where("slug", "==", slug));
    const categorySnapshot = await getDocs(categoryQuery.withConverter(categoryConverter));

    if (categorySnapshot.empty) {
        return null;
    }
    return categorySnapshot.docs[0].data();
}

async function getServicesForCategory(slug: string, country: string): Promise<Service[]> {
    const conditions = [
        where("categorySlug", "==", slug),
        where("status", "==", "published"),
        where("country", "==", country),
    ];

    const servicesQuery = query(collection(db, "services"), ...conditions);
    const servicesSnapshot = await getDocs(servicesQuery.withConverter(serviceConverter));
    return servicesSnapshot.docs.map(doc => doc.data());
}


// This is the main export, a Server Component that wraps the client part.
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const country = searchParams?.country || 'AU';
  
  const category = await getCategoryData(slug);
  if (!category) {
      notFound();
  }

  const services = await getServicesForCategory(slug, country);
  
  return (
    <>
        <Header />
        <Suspense fallback={<div className="flex-1 text-center p-8">Loading...</div>}>
            <CategoryPageClient category={category} services={services} />
        </Suspense>
        <Footer />
    </>
  );
}
