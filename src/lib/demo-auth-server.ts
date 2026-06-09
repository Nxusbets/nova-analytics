import { cookies } from 'next/headers';
import { DEMO_SESSION_COOKIE, DEMO_USER_ID, isClerkConfigured } from './demo-auth';

export async function demoAuth(): Promise<{ userId: string | null }> {
  if (isClerkConfigured()) {
    return { userId: null };
  }
  const cookieStore = await cookies();
  const session = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
  return { userId: session === DEMO_USER_ID ? DEMO_USER_ID : null };
}
