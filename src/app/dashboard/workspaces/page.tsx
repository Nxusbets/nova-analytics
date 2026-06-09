'use client';

import PageContainer from '@/components/layout/page-container';
import { OrganizationList } from '@clerk/nextjs';
import { workspacesInfoContent } from '@/config/infoconfig';
import { isClerkConfigured } from '@/lib/demo-auth';

export default function WorkspacesPage() {
  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
      infoContent={workspacesInfoContent}
    >
      {isClerkConfigured() ? (
        <OrganizationList
          appearance={{
            elements: {
              organizationListBox: 'space-y-2',
              organizationPreview: 'rounded-lg border p-4 hover:bg-accent',
              organizationPreviewMainIdentifier: 'text-lg font-semibold',
              organizationPreviewSecondaryIdentifier: 'text-sm text-muted-foreground'
            }
          }}
          afterSelectOrganizationUrl='/dashboard/workspaces/team'
          afterCreateOrganizationUrl='/dashboard/workspaces/team'
        />
      ) : (
        <div className='flex flex-col items-center gap-4 py-16 text-center'>
          <h2 className='text-2xl font-semibold'>Workspaces not available</h2>
          <p className='text-muted-foreground max-w-md'>
            Organization management requires Clerk authentication to be configured. Set up your
            Clerk API keys to use this feature.
          </p>
        </div>
      )}
    </PageContainer>
  );
}
