import { redirect } from 'next/navigation';
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

export default async function Dashboard() {
  const userId = await checkAuth();

  if (!userId) {
    return redirect('/auth/sign-in');
  } else {
    redirect('/dashboard/overview');
  }
}
