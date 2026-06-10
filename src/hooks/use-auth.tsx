'use client';

import { useUser, useOrganization, useAuth, useOrganizationList } from '@clerk/nextjs';
import { createContext, useContext, type ReactNode } from 'react';

export interface AuthUser {
  id: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: { emailAddress: string }[];
  imageUrl: string;
}

interface AuthContextType {
  user: AuthUser | null;
  orgId: string | null;
  orgSlug: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  organization: {
    id: string;
    name: string;
    slug: string | null;
    imageUrl: string;
    hasImage: boolean;
  } | null;
  permissions: string[];
  role: string | undefined;
  orgMemberships: {
    data: {
      id: string;
      organization: {
        id: string;
        name: string;
        slug: string | null;
        imageUrl: string;
        hasImage: boolean;
      };
      role: string;
    }[];
  };
  setActiveOrg: ((id: string) => Promise<void>) | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      orgId: null,
      orgSlug: null,
      isLoaded: false,
      isSignedIn: false,
      signOut: async () => {},
      organization: null,
      permissions: [],
      role: undefined,
      orgMemberships: { data: [] },
      setActiveOrg: null
    };
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: userLoaded, isSignedIn } = useUser();
  const { organization, membership, isLoaded: orgLoaded } = useOrganization();
  const { orgId, orgSlug } = useAuth();
  const {
    isLoaded: listLoaded,
    setActive,
    userMemberships
  } = useOrganizationList({
    userMemberships: {
      infinite: true,
      keepPreviousData: false
    }
  });

  const isLoaded = userLoaded && orgLoaded && listLoaded;

  const value: AuthContextType = {
    user: clerkUser
      ? {
          id: clerkUser.id,
          fullName: clerkUser.fullName,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          emailAddresses: clerkUser.emailAddresses.map((e: { emailAddress: string }) => ({
            emailAddress: e.emailAddress
          })),
          imageUrl: clerkUser.imageUrl
        }
      : null,
    orgId: orgId ?? null,
    orgSlug: orgSlug ?? null,
    isLoaded,
    isSignedIn: !!isSignedIn,
    signOut: async () => {},
    permissions: (membership?.permissions as string[]) ?? [],
    role: membership?.role,
    organization: organization
      ? {
          id: organization.id,
          name: organization.name,
          slug: organization.slug ?? null,
          imageUrl: organization.imageUrl ?? '',
          hasImage: organization.hasImage ?? false
        }
      : null,
    orgMemberships: {
      data:
        userMemberships?.data?.map(
          (m: {
            id: string;
            organization: {
              id: string;
              name: string;
              slug: string | null;
              imageUrl: string;
              hasImage: boolean;
            };
            role: string;
          }) => ({
            id: m.id,
            organization: {
              id: m.organization.id,
              name: m.organization.name,
              slug: m.organization.slug ?? null,
              imageUrl: m.organization.imageUrl ?? '',
              hasImage: m.organization.hasImage ?? false
            },
            role: m.role
          })
        ) ?? []
    },
    setActiveOrg: setActive ? (id: string) => setActive({ organization: id }) : null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
