export type MessageRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type AskNovaRequest = {
  conversationId?: string;
  message: string;
};

export type StreamChunk = {
  type: 'token' | 'error' | 'done';
  content?: string;
  conversationId?: string;
};
