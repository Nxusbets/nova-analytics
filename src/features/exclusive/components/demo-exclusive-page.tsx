'use client';

export function DemoExclusivePage() {
  return (
    <div className='flex flex-col items-center gap-4 py-16 text-center'>
      <h2 className='text-2xl font-semibold'>Plan-based features not available</h2>
      <p className='text-muted-foreground max-w-md'>
        This feature requires Clerk authentication to be configured. Set up your Clerk API keys to
        access exclusive features.
      </p>
    </div>
  );
}
