import { AddLinkForm } from '@/components/add-link-form';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suggest a Link',
  description: 'Help the community by suggesting a link to an essential service.',
};

export default function AddLinkPage() {
  return (
    <>
    <Header />
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">
              Suggest a Link
            </h1>
            <p className="text-muted-foreground mt-2">
              Help the community by sharing a link to an essential service. We'll review it and add it to our directory.
            </p>
          </div>
          <AddLinkForm />
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
