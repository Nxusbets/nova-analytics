import { redirect } from 'next/navigation';
import { LandingHeader } from '@/components/landing/header';
import { LandingHero } from '@/components/landing/hero';
import { LandingFeatures } from '@/components/landing/features';
import { LandingCta } from '@/components/landing/cta';
import { LandingFooter } from '@/components/landing/footer';
import { isClerkConfigured } from '@/lib/demo-auth';
import { demoAuth } from '@/lib/demo-auth-server';

async function checkAuth(): Promise<string | null> {
  if (isClerkConfigured()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    return userId;
  }
  const { userId } = await demoAuth();
  return userId;
}

export default async function LandingPage() {
  const userId = await checkAuth();

  if (userId) {
    redirect('/dashboard/overview');
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <LandingHeader />
      <main className='flex-1'>
        <LandingHero />
        <LandingFeatures />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
