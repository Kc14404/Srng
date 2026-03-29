const { Client } = require('pg');
const DB = 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres';

async function main() {
  const db = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await db.connect();

  // Find questions in Inequalities topic or with mangled math
  const { rows } = await db.query(`
    SELECT q.id, q.subtype, q.q_text, t.title
    FROM questions q
    JOIN topics t ON q.topic_id = t.id
    WHERE t.title ILIKE '%inequalit%'
       OR q.q_text ILIKE '%c-ba%'
       OR q.q_text ILIKE '%a+k or x%'
    ORDER BY q.id
    LIMIT 20
  `);

  rows.forEach(r => {
    console.log(`\nID ${r.id} | ${r.subtype} | Topic: ${r.title}`);
    console.log('  q_text:', r.q_text);
  });

  await db.end();
}
main().catch(console.error);
