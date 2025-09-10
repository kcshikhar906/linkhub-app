import { LinkCard } from '@/components/link-card';
import { CATEGORIES, SERVICES } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Categories',
};

export default function AllCategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 font-headline">
        All Services
      </h1>
      <div className="space-y-12">
        {CATEGORIES.map((category) => {
          const categoryServices = SERVICES.filter(
            (service) => service.categorySlug === category.slug
          );
          if (categoryServices.length === 0) return null;

          const Icon = category.icon;

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
  );
}
