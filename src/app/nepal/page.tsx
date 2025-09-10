import { LinkCard } from '@/components/link-card';
import { CATEGORIES, SERVICES } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MountainSnow } from 'lucide-react';

export const metadata: Metadata = {
  title: 'For the Nepalese Community',
  description: 'Services and guides specifically for the Nepalese community in Australia.',
};

export default function NepalPage() {
  const category = CATEGORIES.find((c) => c.slug === 'nepal-specific');

  if (!category) {
    notFound();
  }

  const services = SERVICES.filter((service) => service.categorySlug === 'nepal-specific');

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <MountainSnow className="h-10 w-10 text-accent" />
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
  );
}
