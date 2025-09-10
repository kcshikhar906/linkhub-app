'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('q', query);
      router.push(`/search?${newParams.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="e.g., 'get a driver's license', 'TFN', 'renew visa'..."
          className="pl-10 h-12 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search for services"
        />
      </div>
      <Button type="submit" size="lg" className="h-12">
        Search
      </Button>
    </form>
  );
}
