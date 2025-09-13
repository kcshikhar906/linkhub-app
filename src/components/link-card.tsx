'use client';

import { Copy, Share2, AlertTriangle, ExternalLink, ShieldCheck, Phone, Mail, MapPin, Image as ImageIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Service } from '@/lib/data';
import { COUNTRIES } from '@/lib/countries';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ReportDialog } from './report-dialog';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';


interface LinkCardProps {
  service: Service;
}

export function LinkCard({ service }: LinkCardProps) {
  const { toast } = useToast();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const countryData = COUNTRIES.find(c => c.code === service.country);
  const stateData = countryData?.states.find(s => s.code === service.state);
  const location = stateData ? `${stateData.name}, ${countryData?.name}` : countryData?.name;
  
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${service.link}`;
  const showFavicon = !logoError;


  const handleCopyLink = () => {
    navigator.clipboard.writeText(service.link);
    toast({
      title: 'Link Copied!',
      description: 'The official site URL has been copied to your clipboard.',
    });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/${service.id}`;
    if (navigator.share) {
      navigator.share({
        title: service.title,
        text: `Check out this guide for "${service.title}" on LinkHub.`,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Page Link Copied!',
        description: 'You can now share it with others.',
      });
    }
  }


  return (
    <>
      <ReportDialog 
        isOpen={isReportDialogOpen} 
        setIsOpen={setIsReportDialogOpen} 
        service={service} 
      />
        <CardHeader>
          <div className="flex items-start gap-4">
             <div className="w-14 h-14 flex-shrink-0 bg-secondary rounded-md flex items-center justify-center">
                {showFavicon ? (
                    <Image 
                        src={faviconUrl} 
                        alt={`${service.title} logo`} 
                        width={56} 
                        height={56} 
                        className="rounded-md"
                        onError={() => setLogoError(true)}
                    />
                ) : service.iconDataUri ? (
                    <Image src={service.iconDataUri} alt={`${service.title} icon`} width={56} height={56} className="rounded-md" />
                ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
            </div>
             <div className="flex-1">
                <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                    {service.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            Verified
                        </Badge>
                    )}
                    {location && <Badge variant="secondary">{location}</Badge>}
                </div>
             </div>
          </div>
          <CardDescription className="pt-4">{service.description}</CardDescription>
            {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {service.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                </div>
            )}
        </CardHeader>
        <CardContent className="flex-grow">
          <ScrollArea className="h-full max-h-[40vh] pr-4">
              {service.serviceType === 'guide' && service.steps && service.steps.length > 0 && (
                <Accordion type="single" collapsible defaultValue='item-1'>
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-base">How to do it:</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
                        {service.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {service.serviceType === 'info' && (service.phone || service.email || service.address) && (
                <Accordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-base">Contact Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-muted-foreground">
                        {service.phone && (
                          <a href={`tel:${service.phone}`} className="flex items-center gap-3 group">
                            <Phone className="h-4 w-4 text-primary" />
                            <span className="group-hover:underline">{service.phone}</span>
                          </a>
                        )}
                        {service.email && (
                          <a href={`mailto:${service.email}`} className="flex items-center gap-3 group">
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="group-hover:underline">{service.email}</span>
                          </a>
                        )}
                        {service.address && (
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.address)}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                            <MapPin className="h-4 w-4 text-primary mt-1" />
                            <span className="group-hover:underline">{service.address}</span>
                          </a>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
           </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 justify-between border-t pt-6">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <a href={service.link} target="_blank" rel="noopener noreferrer">
              Visit Official Site
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleCopyLink} aria-label="Copy official link">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share this guide">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsReportDialogOpen(true)} aria-label="Report broken link">
              <AlertTriangle className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
    </>
  );
}
