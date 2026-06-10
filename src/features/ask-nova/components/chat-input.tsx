'use client';

import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

type ChatInputProps = {
  onSend: (message: string) => void;
  isLoading: boolean;
};

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  }

  return (
    <form onSubmit={handleSubmit} className='flex items-end gap-2 p-4'>
      <div className='bg-background border-input focus-within:ring-ring relative flex flex-1 items-end rounded-2xl border px-4 py-2 focus-within:ring-1'>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder='Ask a question about your data...'
          rows={1}
          className='max-h-[150px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground'
          disabled={isLoading}
        />
      </div>
      <Button
        type='submit'
        size='icon'
        disabled={!input.trim() || isLoading}
        className='size-10 shrink-0 rounded-full'
      >
        {isLoading ? (
          <Icons.spinner className='size-4 animate-spin' />
        ) : (
          <Icons.send className='size-4' />
        )}
      </Button>
    </form>
  );
}
