
'use client';

import Link from 'next/link';
import type { Category } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { getIcon } from '@/lib/data';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  category: Category;
  index: number;
}

function CategoryCardLink({ category, index }: CategoryCardProps) {
  const searchParams = useSearchParams();
  const Icon = getIcon(category.iconName);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
        ease: 'easeOut'
      }
    },
  };

  return (
     <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
     >
      <Link
        href={{ pathname: `/categories/${category.slug}`, query: searchParams.toString() }}
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
    </motion.div>
  )
}


export function CategoryCard(props: CategoryCardProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryCardLink {...props} />
    </Suspense>
  )
}
