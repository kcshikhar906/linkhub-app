
'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, animate } from 'framer-motion';
import { Briefcase, Landmark, UserCheck, LucideIcon, Globe, Layers } from 'lucide-react';

interface StatItemProps {
  icon: LucideIcon;
  to: number;
  label: string;
}

function StatItem({ icon: Icon, to, label }: StatItemProps) {
  const count = useMotionValue(0);
  // Using a stiffer spring for a faster, "odometer-like" effect
  const rounded = useSpring(count, { mass: 0.5, stiffness: 100, damping: 20 });
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, {
        duration: 1.5, // Faster animation duration
        ease: 'easeOut',
        onComplete: () => {
          // Start the "live" increment effect after the initial animation
          const interval = setInterval(() => {
            const increment = Math.floor(Math.random() * 2) + 1;
            count.set(count.get() + increment);
          }, 4000 + Math.random() * 2000); // every 4-6 seconds

          return () => clearInterval(interval);
        },
      });
      return () => controls.stop();
    }
  }, [inView, count, to]);

  useEffect(() => {
    return rounded.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Math.round(latest).toLocaleString()}+`;
      }
    });
  }, [rounded]);

  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <div className="text-4xl font-bold tracking-tighter" ref={ref}>0+</div>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export function StatsCounter() {
  const stats = [
    { icon: Briefcase, to: 560, label: 'Services Listed' },
    { icon: Landmark, to: 480, label: 'Government Agencies' },
    { icon: UserCheck, to: 620, label: 'Verified Sources' },
    { icon: Layers, to: 20, label: 'Active Categories' },
    { icon: Globe, to: 2, label: 'Countries Covered' },
  ];

  return (
    <section className="py-12 md:py-20 bg-muted/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-8">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
