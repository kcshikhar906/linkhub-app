
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import type { MallEvent } from '@/lib/events';
import Image from 'next/image';
import { CardHeader } from './ui/card';
import { Separator } from './ui/separator';
import { Calendar, Clock, Globe, MapPin, Phone, Ticket, User } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface EventDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event: MallEvent | null;
}

export function EventDetailsDialog({ isOpen, onOpenChange, event }: EventDetailsDialogProps) {
  
  if (!event) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0">
          <ScrollArea className="max-h-[85vh]">
            <div className="relative h-64 w-full">
              <Image src={event.imageUrl} alt={`${event.name} banner`} fill style={{ objectFit: 'cover' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
               <div className="absolute bottom-4 left-4 text-white">
                    <Badge variant={event.type === 'Paid' ? 'destructive' : 'default'} className="mb-2">{event.type}</Badge>
                    <DialogTitle className="text-2xl font-bold font-headline ">{event.name}</DialogTitle>
                    <DialogDescription className="text-sm text-gray-300">{event.mallName}</DialogDescription>
                </div>
            </div>
            
            <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">{event.longDescription}</p>
                
                <Separator />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <p className="font-semibold">Date</p>
                            <p className="text-muted-foreground">{event.date}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                         <div>
                            <p className="font-semibold">Time</p>
                            <p className="text-muted-foreground">{event.time}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                         <div>
                            <p className="font-semibold">Location</p>
                            <p className="text-muted-foreground">{event.mallName}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                         <div>
                            <p className="font-semibold">Organizer</p>
                            <p className="text-muted-foreground">{event.organizer}</p>
                        </div>
                    </div>
                </div>

                {event.contact && (
                    <>
                        <Separator />
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Contact</p>
                                <a href={`tel:${event.contact}`} className="text-sm text-muted-foreground hover:underline">{event.contact}</a>
                            </div>
                        </div>
                    </>
                )}

            </div>
          </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
