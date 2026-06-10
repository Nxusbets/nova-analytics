'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthContext } from '@/hooks/use-auth';
import { getConversations, getMessages } from '../api/service';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { ConversationList } from './conversation-list';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '../api/types';

type StreamMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function ChatWidget() {
  const { user, isSignedIn } = useAuthContext();
  const [open, setOpen] = useState(false);
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
    if (!user?.id || !open) return;
    setConvsLoading(true);
    getConversations(user.id)
      .then((convs) => {
        setConversations(convs);
      })
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setConvsLoading(false));
  }, [user?.id, open]);

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
        body: JSON.stringify({ conversationId: activeConversationId, message }),
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

  function handleNewChat() {
    setActiveConversationId(null);
    setMessages([]);
  }

  function handleSelectConversation(id: string) {
    if (isStreaming) {
      abortRef.current?.abort();
      setIsStreaming(false);
    }
    setActiveConversationId(id);
  }

  if (!isSignedIn) return null;

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setOpen(!open)}
        size='icon'
        className='fixed right-4 bottom-4 z-50 size-12 rounded-full shadow-lg'
      >
        {open ? <Icons.close className='size-5' /> : <Icons.chat className='size-5' />}
      </Button>

      {/* Chat panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div className='fixed inset-0 z-40 bg-black/20' onClick={() => setOpen(false)} />

          {/* Panel */}
          <div
            className={cn(
              'bg-background fixed right-4 bottom-20 z-50 flex',
              'h-[600px] w-[480px] rounded-2xl border shadow-2xl',
              'max-h-[calc(100vh-8rem)] max-w-[calc(100vw-2rem)]'
            )}
          >
            {/* Conversation sidebar */}
            <div className='bg-muted/30 hidden w-44 shrink-0 rounded-l-2xl border-r md:block'>
              <ConversationList
                conversations={conversations}
                activeId={activeConversationId}
                onSelect={handleSelectConversation}
                onNew={handleNewChat}
                isLoading={convsLoading}
              />
            </div>

            {/* Chat area */}
            <div className='flex flex-1 flex-col rounded-r-2xl'>
              {/* Messages or empty state */}
              {messages.length > 0 ? (
                <div className='flex-1 overflow-y-auto p-3'>
                  {loadingMessages && (
                    <div className='flex items-center justify-center py-8'>
                      <Icons.spinner className='size-4 animate-spin text-muted-foreground' />
                    </div>
                  )}
                  {!loadingMessages && (
                    <div className='space-y-3'>
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
              ) : (
                <div className='flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center'>
                  <div className='bg-primary/10 flex size-12 items-center justify-center rounded-2xl'>
                    <Icons.dashboard className='text-primary size-6' />
                  </div>
                  <h3 className='text-sm font-semibold'>Ask Nova</h3>
                  <p className='text-muted-foreground max-w-xs text-xs'>
                    Ask about your dashboard data:
                  </p>
                  <div className='flex flex-wrap justify-center gap-1.5'>
                    {[
                      'What was the best-selling category?',
                      'What is the total revenue?',
                      'How many active accounts?'
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className='bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 text-xs transition-colors'
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Always show input at the bottom */}
              <ChatInput onSend={handleSend} isLoading={isStreaming} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
