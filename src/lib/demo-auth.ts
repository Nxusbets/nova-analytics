export const DEMO_USER_ID = 'demo_user_nova';
export const DEMO_SESSION_COOKIE = 'demo_session';

export function isClerkConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

export function getDemoUser() {
  return {
    id: DEMO_USER_ID,
    firstName: 'Demo',
    lastName: 'User',
    email: 'admin@novaanalytics.io',
    imageUrl: ''
  };
}
