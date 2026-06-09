'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0, 1] } }
};

export function LandingHero() {
  return (
    <section className='relative isolate flex min-h-[calc(100vh-4rem)] items-center overflow-hidden pt-16'>
      <div className='absolute inset-0 -z-10'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-20%,oklch(0.38_0.18_275/0.12),transparent)]' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,oklch(0.6_0.12_190/0.08),transparent)]' />
      </div>

      <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='mx-auto max-w-4xl text-center'
        >
          <motion.div
            variants={itemVariants}
            className='bg-primary/10 text-primary mb-6 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium'
          >
            <span className='size-1.5 rounded-full bg-current' />
            Now in public beta
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className='text-foreground text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl'
          >
            Turn data into{' '}
            <span className='bg-linear-to-r from-primary to-[oklch(0.6_0.12_190)] bg-clip-text text-transparent'>
              decisions
            </span>
            .
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className='text-muted-foreground mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed sm:text-xl'
          >
            Nova Analytics gives your team real-time insights, beautiful dashboards, and powerful
            reporting — without the complexity.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'
          >
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
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0, 1] }}
          className='mt-16 grid grid-cols-3 gap-3 sm:gap-4'
        >
          {[
            { label: 'Active users', value: '12k+', color: 'from-primary/20 to-primary/5' },
            {
              label: 'Data points',
              value: '2.4B',
              color: 'from-[oklch(0.6_0.12_190)]/20 to-[oklch(0.6_0.12_190)]/5'
            },
            { label: 'Avg. response', value: '<50ms', color: 'from-primary/20 to-primary/5' }
          ].map((stat) => (
            <div
              key={stat.label}
              className='bg-card/50 rounded-2xl border p-4 text-center backdrop-blur-sm sm:p-6'
            >
              <div
                className={cn(
                  'bg-linear-to-b mb-2 inline-block rounded-lg px-3 py-1 text-2xl font-bold sm:text-3xl',
                  stat.color
                )}
              >
                {stat.value}
              </div>
              <p className='text-muted-foreground text-xs sm:text-sm'>{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
