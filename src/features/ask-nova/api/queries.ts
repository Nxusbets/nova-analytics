import { queryOptions } from '@tanstack/react-query';
import { getConversations, getMessages } from './service';
import type { Conversation, ChatMessage } from './types';

export type { Conversation, ChatMessage };

export const conversationKeys = {
  all: (userId: string) => ['conversations', userId] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const
};

export const conversationsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: conversationKeys.all(userId),
    queryFn: () => getConversations(userId)
  });

export const messagesQueryOptions = (conversationId: string) =>
  queryOptions({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId
  });
