
'use client';

import { motion, type MotionProps } from 'framer-motion';
import Link, { type LinkProps } from 'next/link';
import * as React from 'react';

type MotionLinkProps = MotionProps & LinkProps & {
    children: React.ReactNode;
    className?: string;
};

export const MotionLink = React.forwardRef<HTMLAnchorElement, MotionLinkProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref as any}
        {...props}
      >
        <Link href={props.href} className={className}>
          {children}
        </Link>
      </motion.div>
    );
  }
);

MotionLink.displayName = 'MotionLink';
