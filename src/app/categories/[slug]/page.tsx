import { LinkCard } from '@/components/link-card';
import { CATEGORIES, SERVICES } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = CATEGORIES.find((c) => c.slug === params.slug);
  if (!category) {
    return {};
  }
  return {
    title: category.name,
    description: `Find guides for services in the ${category.name} category.`,
  };
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    slug: category.slug,
  }));
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const services = SERVICES.filter((service) => service.categorySlug === slug);
  const Icon = category.icon;

  return (
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
  );
}
