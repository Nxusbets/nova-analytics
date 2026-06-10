import { getDb } from '@/lib/neon';
import type { Conversation, ChatMessage } from './types';

type Row = Record<string, unknown>;

export async function createConversation(userId: string, title: string): Promise<Conversation> {
  const sql = getDb();
  const rows = (await sql`
    INSERT INTO conversations (user_id, title)
    VALUES (${userId}, ${title})
    RETURNING id, user_id, title, created_at, updated_at
  `) as Row[];
  return rows[0] as unknown as Conversation;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const sql = getDb();
  const rows = (await sql`
    SELECT id, user_id, title, created_at, updated_at
    FROM conversations
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `) as Row[];
  return (rows ?? []) as unknown as Conversation[];
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const sql = getDb();
  const rows = (await sql`
    SELECT id, conversation_id, role, content, created_at
    FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at ASC
  `) as Row[];
  return (rows ?? []) as unknown as ChatMessage[];
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<ChatMessage> {
  const sql = getDb();
  const rows = (await sql`
    INSERT INTO messages (conversation_id, role, content)
    VALUES (${conversationId}, ${role}, ${content})
    RETURNING id, conversation_id, role, content, created_at
  `) as Row[];
  return rows[0] as unknown as ChatMessage;
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  const sql = getDb();
  await (sql`
    UPDATE conversations
    SET title = ${title}, updated_at = NOW()
    WHERE id = ${conversationId}
  ` as Promise<unknown>);
}

export function getDashboardContext(): string {
  const productData = [
    { name: 'Wireless Headphones', category: 'Electronics', price: 149.99 },
    { name: 'Ergonomic Chair', category: 'Furniture', price: 399.0 },
    { name: 'Cotton T-Shirt', category: 'Clothing', price: 29.99 },
    { name: 'Building Blocks Set', category: 'Toys', price: 34.99 },
    { name: 'Organic Green Tea', category: 'Groceries', price: 12.99 },
    { name: 'Mystery Novel', category: 'Books', price: 15.99 },
    { name: 'Silver Earrings', category: 'Jewelry', price: 89.99 },
    { name: 'Moisturizer Cream', category: 'Beauty Products', price: 24.99 }
  ];

  const categories = [...new Set(productData.map((p) => p.category))];
  const categoryCounts = categories.map((cat) => ({
    category: cat,
    count: productData.filter((p) => p.category === cat).length
  }));

  const totalRevenue = 1250.0;
  const newCustomers = 1234;
  const activeAccounts = 45678;
  const growthRate = 4.5;

  const salesData = [
    { name: 'Olivia Martin', amount: 1999.0 },
    { name: 'Jackson Lee', amount: 39.0 },
    { name: 'Isabella Nguyen', amount: 299.0 },
    { name: 'William Kim', amount: 99.0 },
    { name: 'Sofia Davis', amount: 39.0 }
  ];

  const monthlyRevenue = [
    { month: 'January', desktop: 342, mobile: 245 },
    { month: 'February', desktop: 876, mobile: 654 },
    { month: 'March', desktop: 512, mobile: 387 },
    { month: 'April', desktop: 629, mobile: 521 },
    { month: 'May', desktop: 458, mobile: 412 },
    { month: 'June', desktop: 781, mobile: 598 },
    { month: 'July', desktop: 394, mobile: 312 },
    { month: 'August', desktop: 925, mobile: 743 },
    { month: 'September', desktop: 647, mobile: 489 },
    { month: 'October', desktop: 532, mobile: 476 },
    { month: 'November', desktop: 803, mobile: 687 },
    { month: 'December', desktop: 271, mobile: 198 }
  ];

  const browserVisitors = [
    { browser: 'Chrome', visitors: 275 },
    { browser: 'Safari', visitors: 200 },
    { browser: 'Firefox', visitors: 187 },
    { browser: 'Edge', visitors: 173 },
    { browser: 'Other', visitors: 90 }
  ];

  return JSON.stringify({
    products: { items: productData, categories: categoryCounts },
    overview: {
      totalRevenue,
      newCustomers,
      activeAccounts,
      growthRate,
      totalSalesThisMonth: 265
    },
    recentSales: salesData,
    monthlyRevenue,
    browserVisitors
  });
}

export function buildSystemPrompt(): string {
  return `You are Nova AI, an analytics assistant for the Nova Analytics dashboard. Your role is to help users understand their dashboard data.

Guidelines:
1. Only answer questions based on the dashboard data provided in the context below.
2. Do not make up or fabricate data. If the data doesn't contain the answer, say so.
3. If asked about topics outside dashboard analytics, politely redirect.
4. Be concise and reference specific data points.
5. Format numbers clearly (e.g., $1,250.00, 45,678 users).
6. When comparing categories or time periods, provide context.
7. You can calculate simple metrics from the data (totals, averages, percentages) as long as the underlying data exists.`;
}
