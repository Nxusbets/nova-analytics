'use client';

import { Icons } from '@/components/icons';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
        scrolled ? 'border-border/40 bg-background/80 shadow-xs backdrop-blur-xl' : 'bg-transparent'
      )}
    >
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <Link href='/' className='flex items-center gap-2'>
          <div className='flex size-8 items-center justify-center rounded-lg bg-primary'>
            <Icons.dashboard className='size-4 text-primary-foreground' />
          </div>
          <span className='text-lg font-semibold tracking-tight'>Nova Analytics</span>
        </Link>

        <nav className='hidden items-center gap-6 md:flex'>
          <Link
            href='#features'
            className='text-muted-foreground hover:text-foreground text-sm transition-colors'
          >
            Features
          </Link>
          <Link
            href='/about'
            className='text-muted-foreground hover:text-foreground text-sm transition-colors'
          >
            About
          </Link>
          <Link
            href='/auth/sign-up'
            className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'ml-4')}
          >
            Get Started
          </Link>
        </nav>

        <Link href='/auth/sign-up' className='md:hidden'>
          <Button size='sm'>Get Started</Button>
        </Link>
      </div>
    </motion.header>
  );
}
