'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';

export function DemoSignIn() {
  const router = useRouter();

  async function handleEnterDashboard() {
    document.cookie = 'demo_session=demo_user_nova; path=/; max-age=86400';
    router.push('/dashboard/overview');
    router.refresh();
  }

  return (
    <div className='flex w-full max-w-sm flex-col items-center gap-6'>
      <div className='bg-card flex w-full flex-col items-center rounded-xl border p-8 shadow-sm'>
        <div className='bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-full'>
          <Icons.dashboard className='text-primary size-6' />
        </div>
        <h2 className='text-foreground mb-1 text-xl font-semibold'>Welcome to Nova Analytics</h2>
        <p className='text-muted-foreground mb-6 text-center text-sm'>
          Demo mode — no account required. Click below to explore the dashboard.
        </p>
        <Button onClick={handleEnterDashboard} size='lg' className='w-full'>
          Enter Dashboard
          <Icons.arrowRight className='ml-2 size-4' />
        </Button>
      </div>
      <div className='text-muted-foreground space-y-1 text-center text-xs'>
        <p>Authentication requires Clerk API keys for production.</p>
        <p>
          Set{' '}
          <code className='bg-muted rounded px-1 py-0.5'>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to
          enable Clerk.
        </p>
      </div>
    </div>
  );
}
