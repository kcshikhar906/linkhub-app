'use client';

import {
  Dialog,
  DialogContent
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
          <div className="flex flex-col">
            <LinkCard service={service} />
          </div>
      </DialogContent>
    </Dialog>
  );
}
