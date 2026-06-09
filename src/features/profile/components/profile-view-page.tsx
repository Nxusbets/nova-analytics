'use client';

import { UserProfile } from '@clerk/nextjs';
import { isClerkConfigured } from '@/lib/demo-auth';

export default function ProfileViewPage() {
  return (
    <div className='flex w-full flex-col p-4'>
      {isClerkConfigured() ? (
        <UserProfile />
      ) : (
        <div className='flex flex-col items-center gap-4 py-16 text-center'>
          <h2 className='text-2xl font-semibold'>Profile management not available</h2>
          <p className='text-muted-foreground max-w-md'>
            Profile management requires Clerk authentication to be configured. Set up your Clerk API
            keys to manage your profile settings.
          </p>
        </div>
      )}
    </div>
  );
}
