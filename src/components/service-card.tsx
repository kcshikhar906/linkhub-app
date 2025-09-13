'use client';

import type { Service } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COUNTRIES } from '@/lib/countries';

interface ServiceCardProps {
    service: Service;
    onClick: () => void;
    className?: string;
}

export function ServiceCard({ service, onClick, className }: ServiceCardProps) {
    const countryData = COUNTRIES.find(c => c.code === service.country);
    const stateData = countryData?.states.find(s => s.code === service.state);
    const location = stateData ? stateData.name : countryData?.name;
    
    return (
        <Card 
            className={cn("cursor-pointer flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-primary", className)}
            onClick={onClick}
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
            role="button"
            aria-label={`View details for ${service.title}`}
        >
            <CardHeader>
                <CardTitle className="text-base font-semibold leading-snug">{service.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                 {service.description && <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 pt-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {service.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verified
                        </Badge>
                    )}
                    {location && <Badge variant="secondary">{location}</Badge>}
                </div>
                 {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {service.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
