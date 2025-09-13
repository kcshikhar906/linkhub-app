'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, PlusCircle, Compass, CheckCircle } from 'lucide-react';
import { LinkHubLogo } from './icons';

const GuideStep = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <motion.div
    className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50"
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <h4 className="font-semibold text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </motion.div>
);

export function WelcomeGuide() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has seen the guide before
    const hasSeenGuide = localStorage.getItem('hasSeenWelcomeGuide');
    if (!hasSeenGuide) {
      // Use a small timeout to let the page load before showing the dialog
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcomeGuide', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="p-6 text-center items-center">
                <LinkHubLogo size={40} className="mb-2" />
                <DialogTitle className="text-2xl font-bold font-headline">
                  Welcome to LinkHub!
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  Your simple guide to navigating essential services. Here’s how to get started:
                </DialogDescription>
              </DialogHeader>
              <motion.div
                className="grid gap-4 px-6 pb-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2,
                    },
                  },
                }}
              >
                <GuideStep
                  icon={Compass}
                  title="Search & Discover"
                  description="Use the search bar to find exactly what you need, or browse our categories to explore available services."
                />
                <GuideStep
                  icon={Globe}
                  title="Select Your Location"
                  description="Use the location selectors in the header to filter services for your country and state."
                />
                <GuideStep
                  icon={PlusCircle}
                  title="Contribute a Link"
                  description="Know a useful service we're missing? Click 'List Your Service' to help our community grow."
                />
              </motion.div>
              <DialogFooter className="bg-secondary/50 p-6">
                <Button onClick={handleClose} className="w-full sm:w-auto">
                    <CheckCircle className="mr-2"/>
                    Got it, let's go!
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
