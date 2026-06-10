import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import {
  createConversation,
  getMessages,
  saveMessage,
  updateConversationTitle,
  getDashboardContext,
  buildSystemPrompt
} from '@/features/ask-nova/api/service';

function buildOpenAIMessages(
  systemPrompt: string,
  context: string,
  history: { role: string; content: string }[],
  userMessage: string
) {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'system', content: `Here is the current dashboard data:\n\n${context}` },
    ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage }
  ];
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { conversationId, message } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let activeConversationId = conversationId;

    if (!activeConversationId) {
      const title = message.slice(0, 60) + (message.length > 60 ? '...' : '');
      const conv = await createConversation(userId, title);
      activeConversationId = conv.id;
    }

    await saveMessage(activeConversationId, 'user', message);

    const previousMessages = await getMessages(activeConversationId);

    const history = previousMessages
      .filter((m) => m.role !== 'system')
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));

    const context = getDashboardContext();
    const systemPrompt = buildSystemPrompt();

    const apiMessages = buildOpenAIMessages(systemPrompt, context, history, message);

    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      const fallbackResponse =
        'The AI assistant is not configured yet. Please set the OPENAI_API_KEY environment variable to enable AI responses.';

      await saveMessage(activeConversationId, 'assistant', fallbackResponse);

      return new Response(
        JSON.stringify({
          type: 'done',
          content: fallbackResponse,
          conversationId: activeConversationId
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: apiMessages,
        stream: true,
        max_tokens: 1024
      })
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorBody);

      const errorMsg =
        openaiResponse.status === 401
          ? 'Invalid OpenAI API key. Please check the OPENAI_API_KEY environment variable.'
          : `AI service returned an error (${openaiResponse.status}). Please try again.`;

      await saveMessage(activeConversationId, 'assistant', errorMsg);

      return new Response(
        JSON.stringify({ type: 'error', content: errorMsg, conversationId: activeConversationId }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = openaiResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let fullContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

            for (const line of lines) {
              const data = line.slice(6).trim();

              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const token = parsed.choices?.[0]?.delta?.content;
                if (token) {
                  fullContent += token;
                  const payload = JSON.stringify({
                    type: 'token',
                    content: token,
                    conversationId: activeConversationId
                  });
                  controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }

          await saveMessage(activeConversationId, 'assistant', fullContent);

          if (previousMessages.length === 0 && fullContent.length > 0) {
            const title = message.slice(0, 60) + (message.length > 60 ? '...' : '');
            await updateConversationTitle(activeConversationId, title);
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'done', conversationId: activeConversationId })}\n\n`
            )
          );
        } catch (err) {
          console.error('Stream error:', err);

          if (fullContent) {
            await saveMessage(activeConversationId, 'assistant', fullContent);
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                content: 'Connection interrupted. Please try again.',
                conversationId: activeConversationId
              })}\n\n`
            )
          );
        } finally {
          controller.close();
          reader.releaseLock();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    });
  } catch (err) {
    console.error('Ask Nova error:', err);
    return new Response(
      JSON.stringify({ type: 'error', content: 'An unexpected error occurred. Please try again.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
