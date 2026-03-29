const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect().then(async () => {
  const stats = await client.query(`
    SELECT s.title as section, COUNT(DISTINCT t.id) as topics, COUNT(q.id) as questions,
      ROUND(AVG(CASE q.difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 END)::numeric, 2) as avg_diff
    FROM sections s JOIN topics t ON t.section_id=s.id LEFT JOIN questions q ON q.topic_id=t.id
    GROUP BY s.title ORDER BY s.title
  `);
  console.log('=== SECTION OVERVIEW ===');
  stats.rows.forEach(r => console.log(r.section, '| topics:', r.topics, '| questions:', r.questions, '| avg_difficulty:', r.avg_diff));

  const diff = await client.query(`
    SELECT s.title as section, q.difficulty, COUNT(*) as cnt
    FROM sections s JOIN topics t ON t.section_id=s.id JOIN questions q ON q.topic_id=t.id
    GROUP BY s.title, q.difficulty ORDER BY s.title, q.difficulty
  `);
  console.log('\n=== DIFFICULTY DISTRIBUTION ===');
  diff.rows.forEach(r => console.log(r.section, '|', r.difficulty, ':', r.cnt));

  const types = await client.query(`
    SELECT s.title as section, q.question_type, COUNT(*) as cnt
    FROM sections s JOIN topics t ON t.section_id=s.id JOIN questions q ON q.topic_id=t.id
    GROUP BY s.title, q.question_type ORDER BY s.title, q.question_type
  `);
  console.log('\n=== QUESTION TYPE DISTRIBUTION ===');
  types.rows.forEach(r => console.log(r.section, '|', r.question_type, ':', r.cnt));

  const methods = await client.query(`
    SELECT s.title as section, COUNT(m.id) as methods
    FROM sections s JOIN topics t ON t.section_id=s.id LEFT JOIN methods m ON m.topic_id=t.id
    GROUP BY s.title ORDER BY s.title
  `);
  console.log('\n=== METHOD COUNT ===');
  methods.rows.forEach(r => console.log(r.section, '| methods:', r.methods));

  const topicBreakdown = await client.query(`
    SELECT s.title as section, t.title, COUNT(q.id) as q_count,
      SUM(CASE WHEN q.difficulty='Easy' THEN 1 ELSE 0 END) as easy,
      SUM(CASE WHEN q.difficulty='Medium' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN q.difficulty='Hard' THEN 1 ELSE 0 END) as hard
    FROM sections s JOIN topics t ON t.section_id=s.id LEFT JOIN questions q ON q.topic_id=t.id
    GROUP BY s.title, t.title, t.order_idx ORDER BY s.title, t.order_idx
  `);
  console.log('\n=== TOPIC BREAKDOWN (questions: easy/medium/hard) ===');
  topicBreakdown.rows.forEach(r => console.log(`[${r.section}] ${r.title}: ${r.q_count}q (E:${r.easy} M:${r.medium} H:${r.hard})`));

  await client.end();
}).catch(e => { console.error(e); process.exit(1); });
