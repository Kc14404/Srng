const { Client } = require('pg');
const DB = 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres';

async function main() {
  const db = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await db.connect();

  // Check if equations table exists
  const { rows: tables } = await db.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='equations'`);
  if (!tables.length) { console.log('No equations table!'); await db.end(); return; }

  const { rows } = await db.query(`
    SELECT e.id, e.label, e.formula, e.note, t.title
    FROM equations e
    JOIN topics t ON e.topic_id = t.id
    WHERE t.title ILIKE '%inequalit%'
    ORDER BY e.id
  `);

  rows.forEach(r => {
    console.log(`\nEq ${r.id} | Topic: ${r.title}`);
    console.log('  label:', r.label);
    console.log('  formula:', r.formula);
    console.log('  note:', r.note);
  });

  await db.end();
}
main().catch(console.error);
