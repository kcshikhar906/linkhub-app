import Link from 'next/link';
import type { Category } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getIcon } from '@/lib/data';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = getIcon(category.iconName);

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group block"
      aria-label={`View services in ${category.name}`}
    >
      <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-primary">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <Icon className="h-10 w-10 mb-4 text-primary transition-transform duration-300 group-hover:scale-110" />
          <h3 className="font-semibold text-base text-card-foreground">
            {category.name}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
}
