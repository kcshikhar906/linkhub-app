
'use client';

import type { Service } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COUNTRIES } from '@/lib/countries';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface ServiceCardProps {
    service: Service;
    onClick: () => void;
    className?: string;
    index?: number;
}

export function ServiceCard({ service, onClick, className, index = 0 }: ServiceCardProps) {
    const countryData = COUNTRIES.find(c => c.code === service.country);
    const stateData = countryData?.states.find(s => s.code === service.state);
    const location = stateData ? stateData.name : countryData?.name;
    
    const [logoError, setLogoError] = useState(false);
    const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${service.link}`;
    const showFavicon = !logoError;

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
            viewport={{ once: true, amount: 0.2 }}
        >
            <Card 
                className={cn("cursor-pointer h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-primary", className)}
                onClick={onClick}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
                role="button"
                aria-label={`View details for ${service.title}`}
            >
                <CardHeader className="flex-row gap-4 items-start">
                     <div className="w-10 h-10 flex-shrink-0 bg-secondary rounded-sm flex items-center justify-center">
                        {showFavicon ? (
                            <Image 
                                src={faviconUrl} 
                                alt={`${service.title} logo`}
                                width={40}
                                height={40}
                                className="rounded-sm"
                                onError={() => setLogoError(true)}
                            />
                        ) : service.iconDataUri ? (
                            <Image src={service.iconDataUri} alt={`${service.title} icon`} width={40} height={40} className="rounded-sm" />
                        ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                     </div>
                    <div className="flex-1">
                        <CardTitle className="text-base font-semibold leading-snug">{service.title}</CardTitle>
                    </div>
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
        </motion.div>
    )
}
