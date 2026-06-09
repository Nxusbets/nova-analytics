'use client';

import { createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface DemoUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
}

interface DemoAuthContext {
  user: DemoUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  orgId: string | null;
  orgSlug: string | null;
  signOut: () => Promise<void>;
}

const DemoAuthContext = createContext<DemoAuthContext | null>(null);

export function useDemoAuth() {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) {
    return {
      user: null,
      isLoaded: false,
      isSignedIn: false,
      orgId: null,
      orgSlug: null,
      signOut: async () => {}
    };
  }
  return ctx;
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const signOut = useCallback(async () => {
    document.cookie = 'demo_session=; path=/; max-age=0';
    router.push('/');
    router.refresh();
  }, [router]);

  const value: DemoAuthContext = {
    user: {
      id: 'demo_user_nova',
      firstName: 'Demo',
      lastName: 'User',
      email: 'admin@novaanalytics.io',
      imageUrl: ''
    },
    isLoaded: true,
    isSignedIn: true,
    orgId: null,
    orgSlug: null,
    signOut
  };

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}
