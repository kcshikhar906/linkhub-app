
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

  // Function to get initial values from localStorage or fallback to searchParams/defaults
  const getInitialState = (key: 'country' | 'state') => {
    if (typeof window === 'undefined') {
      return key === 'country' ? 'AU' : null;
    }
    const storedValue = localStorage.getItem(`linkhub-location-${key}`);
    const paramValue = searchParams.get(key);
    if (paramValue) return paramValue;
    if (storedValue) return storedValue;
    return key === 'country' ? 'AU' : null;
  };
  
  const [selectedCountry, setSelectedCountry] = useState(getInitialState('country'));
  const [selectedState, setSelectedState] = useState(getInitialState('state'));
  const [states, setStates] = useState<State[]>([]);

  useEffect(() => {
    const countryData = COUNTRIES.find((c) => c.code === selectedCountry);
    setStates(countryData?.states || []);
  }, [selectedCountry]);
  
  // This effect synchronizes the component's state with URL changes, e.g., when using back/forward buttons
  useEffect(() => {
    const countryFromUrl = searchParams.get('country') || (localStorage.getItem('linkhub-location-country') || 'AU');
    const stateFromUrl = searchParams.get('state') || (localStorage.getItem('linkhub-location-state') || null);
    setSelectedCountry(countryFromUrl);
    setSelectedState(stateFromUrl);
  }, [searchParams]);

  // This effect updates the URL whenever the persisted location changes, on initial load.
   useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    let needsUpdate = false;

    if (selectedCountry && !newParams.has('country')) {
      newParams.set('country', selectedCountry);
      needsUpdate = true;
    }
    if (selectedState && !newParams.has('state')) {
      newParams.set('state', selectedState);
      needsUpdate = true;
    }

    if (needsUpdate && !pathname.startsWith('/admin') && !pathname.startsWith('/nepal')) {
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, selectedState, pathname]);


  const handleLocationChange = (type: 'country' | 'state', value: string | null) => {
    const newParams = new URLSearchParams(searchParams.toString());
    let newCountry = selectedCountry;
    let newState = selectedState;

    if (type === 'country') {
      newCountry = value || 'AU';
      newState = null; // Reset state when country changes
      newParams.set('country', newCountry);
      newParams.delete('state');
      localStorage.setItem('linkhub-location-country', newCountry);
      localStorage.removeItem('linkhub-location-state');

    } else if (type === 'state') {
        newState = value && value !== 'ALL_STATES' ? value : null;
        if (newState) {
            newParams.set('state', newState);
            localStorage.setItem('linkhub-location-state', newState);
        } else {
            newParams.delete('state');
            localStorage.removeItem('linkhub-location-state');
        }
    }
    
    setSelectedCountry(newCountry);
    setSelectedState(newState);
    
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
    <div className={cn("flex flex-col sm:flex-row gap-2 items-start sm:items-center", className)}>
        <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium sm:hidden">Location</span>
        </div>
      <Select
        value={selectedCountry || 'AU'}
        onValueChange={(value) => handleLocationChange('country', value)}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
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
            value={selectedState || 'ALL_STATES'}
            onValueChange={(value) => handleLocationChange('state', value)}
        >
            <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL_STATES">All States</SelectItem>
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
