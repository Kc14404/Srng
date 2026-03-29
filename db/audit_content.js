const { Client } = require('../node_modules/pg');
const client = new Client({ 
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres', 
  ssl: { rejectUnauthorized: false } 
});

client.connect().then(async () => {
  // Get all sections
  const sections = await client.query(`SELECT id, slug, title FROM sections ORDER BY order_idx`);

  for (const section of sections.rows) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`SECTION: ${section.title} (${section.slug})`);
    console.log(`${'='.repeat(60)}`);

    const topics = await client.query(
      `SELECT id, title FROM topics WHERE section_id = $1 ORDER BY order_idx`,
      [section.id]
    );

    for (const topic of topics.rows) {
      // Get methods
      const methods = await client.query(
        `SELECT name, order_idx FROM methods WHERE topic_id = $1 ORDER BY order_idx`,
        [topic.id]
      );

      // Get questions
      const questions = await client.query(
        `SELECT subtype, question_type, difficulty, order_idx FROM questions WHERE topic_id = $1 ORDER BY order_idx`,
        [topic.id]
      );

      console.log(`\n  TOPIC: ${topic.title}`);
      console.log(`  Methods (${methods.rows.length}):`);
      for (const m of methods.rows) {
        console.log(`    [${m.order_idx}] ${m.name}`);
      }
      console.log(`  Questions (${questions.rows.length}):`);
      for (const q of questions.rows) {
        console.log(`    [${q.order_idx}] [${q.question_type}/${q.difficulty}] ${q.subtype}`);
      }
    }
  }

  await client.end();
});
