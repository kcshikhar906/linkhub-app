import { LinkCard } from '@/components/link-card';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { type Category, type Service, categoryConverter, serviceConverter, getIcon } from '@/lib/data';

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

async function getCategory(slug: string): Promise<Category | null> {
    const q = query(collection(db, "categories"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q.withConverter(categoryConverter));
    if (querySnapshot.empty) {
        return null;
    }
    return querySnapshot.docs[0].data();
}

async function getServices(slug: string): Promise<Service[]> {
    const q = query(collection(db, "services"), where("categorySlug", "==", slug), where("status", "==", "published"));
    const querySnapshot = await getDocs(q.withConverter(serviceConverter));
    return querySnapshot.docs.map(doc => doc.data());
}

async function getCategories() {
  const categoriesCol = collection(db, 'categories').withConverter(categoryConverter);
  const categoriesSnapshot = await getDocs(categoriesCol);
  return categoriesSnapshot.docs.map(doc => doc.data());
}


export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategory(params.slug);
  if (!category) {
    return {};
  }
  return {
    title: category.name,
    description: `Find guides for services in the ${category.name} category.`,
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const services = await getServices(slug);
  const Icon = getIcon(category.iconName);

  return (
    <>
    <Header />
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex items-center gap-4 mb-8">
          <Icon className="h-10 w-10 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">
            {category.name}
          </h1>
        </div>
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
