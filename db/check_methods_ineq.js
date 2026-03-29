const { Client } = require('pg');
const DB = 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres';

async function main() {
  const db = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await db.connect();

  const { rows } = await db.query(`
    SELECT m.id, m.name, m.steps, t.title
    FROM methods m
    JOIN topics t ON m.topic_id = t.id
    WHERE t.title ILIKE '%inequalit%'
    ORDER BY m.id
  `);

  rows.forEach(r => {
    console.log(`\nMethod ID ${r.id} | ${r.name} | Topic: ${r.title}`);
    if (Array.isArray(r.steps)) {
      r.steps.forEach((s, i) => console.log(`  step[${i}]: ${s}`));
    } else {
      console.log('  steps:', JSON.stringify(r.steps));
    }
  });

  await db.end();
}
main().catch(console.error);
