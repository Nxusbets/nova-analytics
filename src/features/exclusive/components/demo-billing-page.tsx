'use client';

export function DemoBillingPage() {
  return (
    <div className='flex flex-col items-center gap-4 py-16 text-center'>
      <h2 className='text-2xl font-semibold'>Billing not available</h2>
      <p className='text-muted-foreground max-w-md'>
        Billing and subscription management requires Clerk authentication to be configured. Set up
        your Clerk API keys to manage plans and payments.
      </p>
    </div>
  );
}
