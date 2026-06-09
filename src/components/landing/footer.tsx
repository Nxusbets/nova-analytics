import { Icons } from '@/components/icons';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className='border-t bg-background'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center justify-between gap-6 sm:flex-row'>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-md bg-primary'>
              <Icons.dashboard className='size-3.5 text-primary-foreground' />
            </div>
            <span className='text-sm font-semibold'>Nova Analytics</span>
          </div>

          <nav className='flex items-center gap-6 text-sm'>
            <Link
              href='/about'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              About
            </Link>
            <Link
              href='/privacy-policy'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              Privacy
            </Link>
            <Link
              href='/terms-of-service'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              Terms
            </Link>
          </nav>

          <p className='text-muted-foreground text-sm'>
            &copy; {new Date().getFullYear()} Nova Analytics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
