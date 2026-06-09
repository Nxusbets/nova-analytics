import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';
import { DEMO_SESSION_COOKIE, DEMO_USER_ID, isClerkConfigured } from '@/lib/demo-auth';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (isClerkConfigured()) {
    return clerkHandler(req, event);
  }

  if (isProtectedRoute(req)) {
    const session = req.cookies.get(DEMO_SESSION_COOKIE)?.value;
    if (session !== DEMO_USER_ID) {
      return NextResponse.redirect(new URL('/auth/sign-in', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
};
