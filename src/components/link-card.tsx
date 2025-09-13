'use client';

import { Copy, Share2, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface LinkCardProps {
  service: Service;
}

export function LinkCard({ service }: LinkCardProps) {
  const { toast } = useToast();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const countryData = COUNTRIES.find(c => c.code === service.country);
  const stateData = countryData?.states.find(s => s.code === service.state);
  const location = stateData ? `${stateData.name}, ${countryData?.name}` : countryData?.name;


  const handleCopyLink = () => {
    navigator.clipboard.writeText(service.link);
    toast({
      title: 'Link Copied!',
      description: 'The official site URL has been copied to your clipboard.',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service.title,
        text: `Check out this guide for "${service.title}" on LinkHub.`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
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
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
             <CardTitle className="font-headline text-xl flex-1">{service.title}</CardTitle>
             <div className="flex flex-col items-end gap-2 shrink-0">
                {service.verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Verified
                    </Badge>
                )}
                {location && <Badge variant="secondary">{location}</Badge>}
             </div>
          </div>
          <CardDescription>{service.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <Accordion type="single" collapsible>
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
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 justify-between">
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
      </Card>
    </>
  );
}
