'use client';

import PageContainer from '@/components/layout/page-container';
import { ChatInterface } from './chat-interface';

export default function AskNovaPage() {
  return (
    <PageContainer pageTitle='Ask Nova' pageDescription='AI-powered analytics assistant'>
      <div className='flex h-[calc(100vh-8rem)] flex-col'>
        <ChatInterface />
      </div>
    </PageContainer>
  );
}
