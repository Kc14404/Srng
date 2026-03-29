const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();

  const sections = await client.query('SELECT id, title, slug FROM sections ORDER BY order_idx');

  for (const sec of sections.rows) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`SECTION: ${sec.title} (${sec.slug})`);
    console.log('='.repeat(70));

    const topics = await client.query(`
      SELECT t.id, t.title,
        COUNT(DISTINCT q.id) as qcount,
        COUNT(DISTINCT m.id) as mcount,
        json_agg(DISTINCT q.subtype) FILTER (WHERE q.subtype IS NOT NULL) as subtypes,
        json_agg(DISTINCT q.difficulty) FILTER (WHERE q.difficulty IS NOT NULL) as difficulties
      FROM topics t
      LEFT JOIN questions q ON q.topic_id = t.id
      LEFT JOIN methods m ON m.topic_id = t.id
      WHERE t.section_id = $1
      GROUP BY t.id, t.title
      ORDER BY t.order_idx
    `, [sec.id]);

    for (const t of topics.rows) {
      const subtypes = (t.subtypes || []).filter(s => s !== null).join(', ');
      const difficulties = (t.difficulties || []).filter(d => d !== null).sort().join('/');
      console.log(`\n  [${t.qcount}Q/${t.mcount}M] ${t.title}`);
      console.log(`    Subtypes: ${subtypes || '(none)'}`);
      console.log(`    Difficulties: ${difficulties || '(none)'}`);
    }
  }

  // Summary stats
  console.log('\n' + '='.repeat(70));
  console.log('TOTALS');
  console.log('='.repeat(70));
  const totals = await client.query(`
    SELECT s.title as section,
      COUNT(DISTINCT t.id) as topics,
      COUNT(DISTINCT q.id) as questions,
      COUNT(DISTINCT m.id) as methods
    FROM sections s
    JOIN topics t ON t.section_id = s.id
    LEFT JOIN questions q ON q.topic_id = t.id
    LEFT JOIN methods m ON m.topic_id = t.id
    GROUP BY s.id, s.title
    ORDER BY s.order_idx
  `);
  for (const row of totals.rows) {
    console.log(`  ${row.section}: ${row.topics} topics, ${row.questions} questions, ${row.methods} methods`);
  }
  const grand = await client.query(`SELECT COUNT(*) as t FROM topics`);
  const grandQ = await client.query(`SELECT COUNT(*) as q FROM questions`);
  const grandM = await client.query(`SELECT COUNT(*) as m FROM methods`);
  console.log(`\n  GRAND TOTAL: ${grand.rows[0].t} topics | ${grandQ.rows[0].q} questions | ${grandM.rows[0].m} methods`);

  await client.end();
}

main().catch(console.error);
