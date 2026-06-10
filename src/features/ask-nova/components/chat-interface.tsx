'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthContext } from '@/hooks/use-auth';
import { getConversations, getMessages } from '../api/service';
import { conversationKeys } from '../api/queries';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { ConversationList } from './conversation-list';
import { Icons } from '@/components/icons';
import type { ChatMessage } from '../api/types';

type StreamMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function ChatInterface() {
  const { user, isSignedIn } = useAuthContext();
  const queryClient = useQueryClient();

  const [conversations, setConversations] = useState<any[]>([]);
  const [convsLoading, setConvsLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!user?.id) return;
    setConvsLoading(true);
    getConversations(user.id)
      .then((convs) => {
        setConversations(convs);
        if (convs.length > 0 && !activeConversationId) {
          setActiveConversationId(convs[0].id);
        }
      })
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setConvsLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    getMessages(activeConversationId)
      .then((msgs) => {
        setMessages(
          msgs
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
        );
      })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoadingMessages(false));
  }, [activeConversationId]);

  async function handleSend(message: string) {
    if (!message.trim() || isStreaming) return;

    const userMessage: StreamMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    const assistantMessage: StreamMessage = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMessage]);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const response = await fetch('/api/ask-nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let newConversationId = activeConversationId;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'token') {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant') {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + (data.content || '')
                    };
                  }
                  return updated;
                });
                if (data.conversationId && data.conversationId !== newConversationId) {
                  newConversationId = data.conversationId;
                }
              } else if (data.type === 'done') {
                if (data.conversationId) {
                  newConversationId = data.conversationId;
                }
              } else if (data.type === 'error') {
                toast.error(data.content || 'An error occurred');
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant' && !last.content) {
                    updated.pop();
                  }
                  return updated;
                });
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }

        if (newConversationId && newConversationId !== activeConversationId) {
          setActiveConversationId(newConversationId);
          if (user?.id) {
            const convs = await getConversations(user.id);
            setConversations(convs);
          }
        }
      } else {
        const data = await response.json();
        if (data.type === 'error') {
          toast.error(data.content || 'An error occurred');
          setMessages((prev) => prev.slice(0, -1));
        } else if (data.content) {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: data.content };
            }
            return updated;
          });
          if (data.conversationId && data.conversationId !== activeConversationId) {
            setActiveConversationId(data.conversationId);
            if (user?.id) {
              const convs = await getConversations(user.id);
              setConversations(convs);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error(err.message || 'Failed to get response');
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant' && !last.content) {
            updated.pop();
          }
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      if (user?.id) {
        getConversations(user.id)
          .then(setConversations)
          .catch(() => {});
      }
    }
  }

  async function handleNewChat() {
    setActiveConversationId(null);
    setMessages([]);
  }

  async function handleSelectConversation(id: string) {
    if (isStreaming) {
      abortRef.current?.abort();
      setIsStreaming(false);
    }
    setActiveConversationId(id);
  }

  if (!isSignedIn) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-muted-foreground text-sm'>Sign in to use Ask Nova.</p>
      </div>
    );
  }

  return (
    <div className='flex h-full'>
      <div className='bg-muted/30 hidden w-64 shrink-0 border-r md:block'>
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          isLoading={convsLoading}
        />
      </div>
      <div className='flex flex-1 flex-col'>
        {activeConversationId || messages.length > 0 ? (
          <>
            <div className='flex-1 overflow-y-auto p-4'>
              {loadingMessages && (
                <div className='flex items-center justify-center py-8'>
                  <Icons.spinner className='size-5 animate-spin text-muted-foreground' />
                </div>
              )}
              {!loadingMessages && (
                <div className='space-y-4'>
                  {messages.map((msg, i) => (
                    <MessageBubble
                      key={i}
                      role={msg.role}
                      content={msg.content}
                      isStreaming={
                        isStreaming && i === messages.length - 1 && msg.role === 'assistant'
                      }
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <ChatInput onSend={handleSend} isLoading={isStreaming} />
          </>
        ) : (
          <div className='flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center'>
            <div className='bg-primary/10 flex size-16 items-center justify-center rounded-2xl'>
              <Icons.dashboard className='text-primary size-8' />
            </div>
            <h2 className='text-xl font-semibold'>Ask Nova</h2>
            <p className='text-muted-foreground max-w-md text-sm'>
              Ask questions about your dashboard data. For example:
            </p>
            <div className='flex flex-wrap justify-center gap-2'>
              {[
                'What was the best-selling category?',
                'Summarize this month trends',
                'What is the total revenue?',
                'How many active accounts?'
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className='bg-muted hover:bg-muted/80 rounded-full px-4 py-2 text-sm transition-colors'
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
