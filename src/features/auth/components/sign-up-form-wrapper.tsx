'use client';

import { SignUp as ClerkSignUpForm } from '@clerk/nextjs';
import { Icons } from '@/components/icons';
import { Component, type ReactNode } from 'react';

class SignUpErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex flex-col items-center gap-4 text-center'>
          <Icons.warning className='size-12 text-destructive' />
          <h2 className='text-xl font-semibold'>Unable to load sign-up form</h2>
          <p className='text-muted-foreground max-w-sm text-sm'>
            The authentication service is not configured. Please contact the administrator or check
            that Clerk API keys are set.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function SignUpFormWrapper() {
  return (
    <SignUpErrorBoundary>
      <ClerkSignUpForm
        initialValues={{
          emailAddress: 'admin@novaanalytics.io'
        }}
      />
    </SignUpErrorBoundary>
  );
}
