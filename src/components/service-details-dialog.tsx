
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Service } from '@/lib/data';
import { LinkCard } from './link-card';

interface ServiceDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
}

export function ServiceDetailsDialog({ isOpen, onOpenChange, service }: ServiceDetailsDialogProps) {
  
  if (!service) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0">
          {/* A DialogTitle is required for accessibility. We make it visually hidden. */}
          <DialogHeader className="sr-only">
             <DialogTitle>{service.title}</DialogTitle>
          </DialogHeader>
          <LinkCard service={service} />
      </DialogContent>
    </Dialog>
  );
}
