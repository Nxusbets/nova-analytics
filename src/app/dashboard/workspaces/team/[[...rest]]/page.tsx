'use client';

import PageContainer from '@/components/layout/page-container';
import { OrganizationProfile } from '@clerk/nextjs';
import { teamInfoContent } from '@/config/infoconfig';
import { isClerkConfigured } from '@/lib/demo-auth';

export default function TeamPage() {
  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
      infoContent={teamInfoContent}
    >
      {isClerkConfigured() ? (
        <OrganizationProfile />
      ) : (
        <div className='flex flex-col items-center gap-4 py-16 text-center'>
          <h2 className='text-2xl font-semibold'>Team management not available</h2>
          <p className='text-muted-foreground max-w-md'>
            Team management requires Clerk authentication to be configured. Set up your Clerk API
            keys to manage team members, roles, and security settings.
          </p>
        </div>
      )}
    </PageContainer>
  );
}
