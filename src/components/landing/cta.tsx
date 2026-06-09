'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import Link from 'next/link';

export function LandingCta() {
  return (
    <section className='relative py-24 sm:py-32'>
      <div className='absolute inset-0 -z-10'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,oklch(0.38_0.18_275/0.08),transparent)]' />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
        className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
      >
        <div className='relative overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center shadow-sm sm:px-16 sm:py-24'>
          <div className='absolute inset-0 -z-10'>
            <div className='absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.38_0.18_275/0.1),transparent)]' />
            <div className='absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,oklch(0.6_0.12_190/0.08),transparent)]' />
          </div>

          <h2 className='text-foreground text-balance text-3xl font-bold tracking-tight sm:text-4xl'>
            Ready to see what your data can do?
          </h2>
          <p className='text-muted-foreground mx-auto mt-4 max-w-lg text-lg'>
            Start your free trial — no credit card required. Full access to every feature for 14
            days.
          </p>
          <div className='mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link href='/auth/sign-up'>
              <Button size='lg' className='w-full sm:w-auto'>
                Start free trial
                <svg
                  className='ml-1.5 size-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                >
                  <path d='M5 12h14M12 5l7 7-7 7' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              </Button>
            </Link>
            <Link href='/auth/sign-in'>
              <Button variant='outline' size='lg' className='w-full sm:w-auto'>
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
