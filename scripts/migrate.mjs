import { neon } from '@neondatabase/serverless';

const statements = [
  `CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`
];

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  for (const stmt of statements) {
    const label = stmt.split('\n')[0].trim().slice(0, 70);
    console.log(`Running: ${label}...`);
    await sql.query(stmt);
    console.log('  ✓');
  }

  console.log('\nMigration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
