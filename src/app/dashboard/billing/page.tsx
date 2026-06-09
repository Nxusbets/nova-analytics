'use client';

import { isClerkConfigured } from '@/lib/demo-auth';
import { ClerkBillingPage } from '@/features/exclusive/components/clerk-billing-page';
import { DemoBillingPage } from '@/features/exclusive/components/demo-billing-page';

export default function BillingPage() {
  if (isClerkConfigured()) {
    return <ClerkBillingPage />;
  }
  return <DemoBillingPage />;
}
