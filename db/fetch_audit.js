const { Client } = require('../node_modules/pg');
const fs = require('fs');

const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await c.connect();

  const questions = await c.query(`
    SELECT t.title as topic, q.subtype, q.q_text, q.question_type, q.signals, q.trap, q.method, q.steps, q.difficulty
    FROM questions q JOIN topics t ON q.topic_id = t.id
    ORDER BY t.id, q.order_idx
  `);

  const practice = await c.query(`
    SELECT t.title as topic, p.question, p.answer
    FROM practice_items p JOIN topics t ON p.topic_id = t.id
    ORDER BY t.id, p.order_idx
  `);

  const equations = await c.query(`
    SELECT t.title as topic, e.label, e.formula, e.note
    FROM equations e JOIN topics t ON e.topic_id = t.id
    ORDER BY t.id, e.order_idx
  `);

  fs.writeFileSync('db/audit_data.json', JSON.stringify({
    questions: questions.rows,
    practice: practice.rows,
    equations: equations.rows
  }, null, 2));

  console.log('Fetched:', questions.rows.length, 'questions,', practice.rows.length, 'practice items,', equations.rows.length, 'equations');
  await c.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
