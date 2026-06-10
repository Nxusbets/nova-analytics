'use client';
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ActiveThemeProvider } from '../themes/active-theme';
import QueryProvider from './query-provider';
import { AuthProvider } from '@/hooks/use-auth';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </ActiveThemeProvider>
    </ClerkProvider>
  );
}
