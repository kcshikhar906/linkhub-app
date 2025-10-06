
import { SubmissionForm } from '@/components/submission-form';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contribute to LinkHub',
  description: 'Help the community by suggesting a link, shop, or event.',
};

export default function AddPage() {
  return (
    <>
    <Header />
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">
              Contribute to LinkHub
            </h1>
            <p className="text-muted-foreground mt-2">
              Help our community grow by sharing a new service, shop, or event. We'll review your submission and add it to our directory.
            </p>
          </div>
          <SubmissionForm />
        </div>
      </div>
    </main>
    <Footer />
    </>
    );
}
