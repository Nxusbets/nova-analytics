'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { Conversation } from '../api/types';

type ConversationListProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  isLoading?: boolean;
};

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  isLoading
}: ConversationListProps) {
  return (
    <div className='flex h-full flex-col'>
      <div className='border-border flex items-center justify-between border-b px-4 py-3'>
        <h2 className='text-sm font-semibold'>History</h2>
        <Button variant='ghost' size='icon' className='size-7' onClick={onNew} title='New chat'>
          <Icons.add className='size-4' />
        </Button>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {isLoading && (
          <div className='flex items-center justify-center py-8'>
            <Icons.spinner className='size-4 animate-spin text-muted-foreground' />
          </div>
        )}
        {!isLoading && conversations.length === 0 && (
          <p className='text-muted-foreground px-4 py-8 text-center text-xs'>
            No conversations yet
          </p>
        )}
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              'hover:bg-muted w-full px-4 py-3 text-left text-sm transition-colors',
              activeId === conv.id && 'bg-muted'
            )}
          >
            <p className='truncate font-medium'>{conv.title}</p>
            <p className='text-muted-foreground mt-0.5 text-xs'>
              {new Date(conv.updated_at).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
