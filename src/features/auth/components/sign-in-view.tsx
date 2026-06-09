import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { Metadata } from 'next';
import Link from 'next/link';
import { InteractiveGridPattern } from './interactive-grid';
import { Icons } from '@/components/icons';
import { DemoSignIn } from './demo-sign-in';
import { isClerkConfigured } from '@/lib/demo-auth';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/auth/sign-up'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 hidden md:top-8 md:right-8'
        )}
      >
        Create account
      </Link>
      <div className='relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-sidebar' />
        <div className='text-sidebar-foreground relative z-20 flex items-center text-lg font-medium'>
          <Icons.dashboard className='mr-2 size-6' />
          Nova Analytics
        </div>
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(400px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-12'
          )}
        />
        <div className='text-sidebar-foreground relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Nova Analytics transformed how we understand our data. Real-time insights,
              beautiful dashboards, and zero friction.&rdquo;
            </p>
            <footer className='text-sidebar-foreground/70 text-sm'>
              Sarah Chen, Data Lead at TechFlow
            </footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          {isClerkConfigured() ? (
            <>
              <ClerkSignInForm
                initialValues={{
                  emailAddress: 'admin@novaanalytics.io'
                }}
              />
              <p className='text-muted-foreground px-8 text-center text-sm'>
                By clicking continue, you agree to our{' '}
                <Link
                  href='/terms-of-service'
                  className='hover:text-primary underline underline-offset-4'
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href='/privacy-policy'
                  className='hover:text-primary underline underline-offset-4'
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          ) : (
            <DemoSignIn />
          )}
        </div>
      </div>
    </div>
  );
}
