
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import type { ShopWithMall } from '@/lib/shops';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Clock, Globe, Phone, Users, ExternalLink } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface ShopDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shop: ShopWithMall | null;
  allShops: ShopWithMall[];
  onSelectShop: (shop: ShopWithMall) => void;
}

export function ShopDetailsDialog({ isOpen, onOpenChange, shop, allShops, onSelectShop }: ShopDetailsDialogProps) {
  
  if (!shop) {
    return null;
  }

  const similarShops = allShops.filter(s => s.category === shop.category && s.id !== shop.id).slice(0, 3);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
          <ScrollArea className="max-h-[80vh]">
            <CardHeader className="text-center items-center pt-8">
                <Image src={shop.logoUrl} alt={`${shop.name} logo`} width={80} height={80} className="rounded-lg border mb-2" />
                <DialogTitle className="text-2xl font-bold font-headline">{shop.name}</DialogTitle>
                <DialogDescription>{shop.mallName} - {shop.floor}</DialogDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-8">
                <p className="text-sm text-center text-muted-foreground">{shop.description}</p>
                
                <Separator />
                
                <div className="space-y-3 text-sm">
                    {shop.openingHours && (
                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-medium text-foreground">{shop.openingHours}</span>
                        </div>
                    )}
                      {shop.phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                            <a href={`tel:${shop.phone}`} className="font-medium text-foreground hover:underline">{shop.phone}</a>
                        </div>
                    )}
                    {shop.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                            <a href={shop.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline truncate">
                                {shop.website.replace(/^(https?:\/\/)?(www\.)?/, '')} <ExternalLink className="inline h-3 w-3" />
                            </a>
                        </div>
                    )}
                </div>

                {similarShops.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="h-4 w-4"/> Similar Shops</h4>
                            <div className="space-y-2">
                                {similarShops.map(similar => (
                                    <div key={similar.id} onClick={() => onSelectShop(similar)} className="cursor-pointer flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                                        <Image src={similar.logoUrl} alt={`${similar.name} logo`} width={32} height={32} className="rounded-md border" />
                                        <div>
                                            <p className="font-semibold text-sm">{similar.name}</p>
                                            <p className="text-xs text-muted-foreground">{similar.mallName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

            </CardContent>
          </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
