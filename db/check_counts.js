const { Client } = require('../node_modules/pg');
const client = new Client({ 
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres', 
  ssl: { rejectUnauthorized: false } 
});
client.connect().then(async () => {
  const r = await client.query(`
    SELECT s.slug, COUNT(q.id) as q_count, COUNT(DISTINCT q.topic_id) as topics
    FROM questions q
    JOIN topics t ON q.topic_id = t.id
    JOIN sections s ON t.section_id = s.id
    GROUP BY s.slug
    ORDER BY s.slug
  `);
  console.log('Questions per section:', JSON.stringify(r.rows, null, 2));
  const m = await client.query(`
    SELECT s.slug, COUNT(me.id) as m_count, COUNT(DISTINCT me.topic_id) as topics
    FROM methods me
    JOIN topics t ON me.topic_id = t.id
    JOIN sections s ON t.section_id = s.id
    GROUP BY s.slug
    ORDER BY s.slug
  `);
  console.log('Methods per section:', JSON.stringify(m.rows, null, 2));
  const perTopic = await client.query(`
    SELECT s.slug, t.title, COUNT(q.id) as q_count
    FROM questions q
    JOIN topics t ON q.topic_id = t.id
    JOIN sections s ON t.section_id = s.id
    GROUP BY s.slug, t.title, t.order_idx
    ORDER BY s.slug, t.order_idx
  `);
  console.log('Per topic:', JSON.stringify(perTopic.rows, null, 2));
  await client.end();
});
