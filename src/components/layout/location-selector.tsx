'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRIES, type State } from '@/lib/countries';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationSelectorProps {
    onValueChange?: () => void;
    className?: string;
}

export function LocationSelector({ onValueChange, className }: LocationSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCountry = searchParams.get('country') || 'AU';
  const currentState = searchParams.get('state');

  const [selectedCountry, setSelectedCountry] = useState(currentCountry);
  const [selectedState, setSelectedState] = useState(currentState);
  const [states, setStates] = useState<State[]>([]);

  useEffect(() => {
    const countryData = COUNTRIES.find((c) => c.code === selectedCountry);
    setStates(countryData?.states || []);
  }, [selectedCountry]);
  
  useEffect(() => {
    setSelectedCountry(currentCountry);
    setSelectedState(currentState);
  }, [currentCountry, currentState]);


  const handleLocationChange = (type: 'country' | 'state', value: string | null) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (type === 'country') {
      newParams.set('country', value || 'AU');
      newParams.delete('state'); // Reset state when country changes
      setSelectedCountry(value || 'AU');
      setSelectedState(null);
    } else if (type === 'state') {
        if (value) {
            newParams.set('state', value);
        } else {
            newParams.delete('state');
        }
        setSelectedState(value);
    }
    
    // Don't append location to admin or nepal-specific pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/nepal')) {
        return;
    }

    router.push(`${pathname}?${newParams.toString()}`);
    if (onValueChange) {
        onValueChange();
    }
  };

  return (
    <div className={cn("flex gap-2 items-center", className)}>
        <Globe className="h-5 w-5 text-muted-foreground" />
      <Select
        value={selectedCountry}
        onValueChange={(value) => handleLocationChange('country', value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select Country" />
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {states.length > 0 && (
         <Select
            value={selectedState || undefined}
            onValueChange={(value) => handleLocationChange('state', value)}
        >
            <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="">All States</SelectItem>
                {states.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                        {s.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      )}
    </div>
  );
}
