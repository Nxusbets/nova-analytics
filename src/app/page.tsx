import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { LandingHeader } from '@/components/landing/header';
import { LandingHero } from '@/components/landing/hero';
import { LandingFeatures } from '@/components/landing/features';
import { LandingCta } from '@/components/landing/cta';
import { LandingFooter } from '@/components/landing/footer';

export default async function LandingPage() {
  const { userId } = await auth();

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
