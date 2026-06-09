'use client';

import { isClerkConfigured } from '@/lib/demo-auth';
import { ClerkExclusivePage } from '@/features/exclusive/components/clerk-exclusive-page';
import { DemoExclusivePage } from '@/features/exclusive/components/demo-exclusive-page';

export default function ExclusivePage() {
  if (isClerkConfigured()) {
    return <ClerkExclusivePage />;
  }
  return <DemoExclusivePage />;
}
