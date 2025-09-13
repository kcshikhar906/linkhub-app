
'use client';

import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { motion } from 'framer-motion';

/*
// Metadata cannot be exported from a client component. 
// This can be set in the layout or moved to a server component parent if needed.
export const metadata: Metadata = {
  title: "About",
};
*/

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
};


export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-3xl mx-auto bg-card p-8 rounded-lg shadow-sm">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold tracking-tight mb-6 font-headline text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              About LinkHub
            </motion.h1>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <motion.p
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
              >
                LinkHub is a clean, hyper-efficient, and universally accessible
                digital directory. It acts as a centralized bridge between users and
                essential government or institutional services by cutting through the
                clutter of official websites.
              </motion.p>
              <motion.p
                 variants={sectionVariants}
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true, amount: 0.5 }}
              >
                Instead of searching through multiple pages filled with legal jargon,
                users come to LinkHub to find a simple, human-readable explanation of
                any process, a clear, step-by-step guide on how to complete it, and a
                direct deep link to the exact page on the official website where the
                action must be taken. It’s the ultimate "get things done" utility for
                navigating bureaucratic processes.
              </motion.p>
              <motion.div
                 variants={sectionVariants}
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true, amount: 0.5 }}
              >
                <h2 className="text-2xl font-semibold text-foreground pt-4 font-headline">Our Vision</h2>
                <p>
                  Initially, the app serves two primary groups: Nepalese individuals
                  living in Australia who need to navigate Australian systems, and
                  Australians who also find government websites overwhelming. The
                  long-term vision is to create a scalable framework where the
                  platform can be easily expanded to include any country, making it an
                  indispensable tool for global citizens, immigrants, and anyone
                  seeking clarity.
                </p>
              </motion.div>
              <motion.div
                 variants={sectionVariants}
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true, amount: 0.5 }}
              >
                <h2 className="text-2xl font-semibold text-foreground pt-4 font-headline">Our Commitment</h2>
                <p>
                  The design is minimal, professional, and completely free of ads or
                  sponsored links to build absolute trust. The value is in the utility,
                  not manipulation. We rely on community feedback to keep links accurate
                  and information up-to-date, fostering a sense of collective
                  ownership.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
