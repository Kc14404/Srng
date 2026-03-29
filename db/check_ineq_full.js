const { Client } = require('pg');
const DB = 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres';

async function main() {
  const db = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await db.connect();

  // Check methods when_to_use and tip
  const { rows: methods } = await db.query(`
    SELECT m.id, m.name, m.when_to_use, m.tip
    FROM methods m JOIN topics t ON m.topic_id = t.id
    WHERE t.title ILIKE '%inequalit%' ORDER BY m.id
  `);
  console.log('=== METHODS ===');
  methods.forEach(r => {
    console.log(`\nMethod ${r.id}: ${r.name}`);
    console.log('  when_to_use:', r.when_to_use);
    console.log('  tip:', r.tip);
  });

  // Check questions signals/trap/method fields
  const { rows: qs } = await db.query(`
    SELECT q.id, q.subtype, q.signals, q.trap, q.method
    FROM questions q JOIN topics t ON q.topic_id = t.id
    WHERE t.title ILIKE '%inequalit%'
    AND (q.signals ILIKE '%frac%' OR q.method ILIKE '%frac%' OR q.signals ILIKE '%c-b%' OR q.method ILIKE '%c-b%')
    ORDER BY q.id
  `);
  console.log('\n=== QUESTIONS with suspicious math ===');
  qs.forEach(r => {
    console.log(`\nQ${r.id}: ${r.subtype}`);
    console.log('  signals:', r.signals);
    console.log('  method:', r.method);
    console.log('  trap:', r.trap);
  });

  // Also check the specific question subtypes shown in screenshot
  const { rows: qs2 } = await db.query(`
    SELECT q.id, q.subtype, q.q_text, q.signals, q.method
    FROM questions q JOIN topics t ON q.topic_id = t.id
    WHERE t.title ILIKE '%inequalit%'
    AND (q.subtype ILIKE '%linear%' OR q.subtype ILIKE '%compound%' OR q.subtype ILIKE '%absolute value def%')
    ORDER BY q.id
  `);
  console.log('\n=== LINEAR/COMPOUND/ABSVAL questions ===');
  qs2.forEach(r => {
    console.log(`\nQ${r.id}: ${r.subtype}`);
    console.log('  q_text:', r.q_text?.substring(0,100));
    console.log('  signals:', r.signals?.substring(0,100));
    console.log('  method:', r.method?.substring(0,100));
  });

  await db.end();
}
main().catch(console.error);
