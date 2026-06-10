'use client';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

type MessageBubbleProps = {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
};

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className='bg-primary flex size-8 shrink-0 items-center justify-center rounded-full'>
          <Icons.dashboard className='size-4 text-primary-foreground' />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'
        )}
      >
        <div className='whitespace-pre-wrap break-words'>{content}</div>
        {isStreaming && (
          <span className='inline-block w-1.5 animate-pulse'>
            <Icons.spinner className='size-3 animate-spin' />
          </span>
        )}
      </div>
      {isUser && (
        <div className='bg-secondary flex size-8 shrink-0 items-center justify-center rounded-full'>
          <Icons.user className='size-4 text-secondary-foreground' />
        </div>
      )}
    </div>
  );
}
