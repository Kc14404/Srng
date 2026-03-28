const { Client } = require('../node_modules/pg');

const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await c.connect();

  // Delete duplicate topics (keep lowest id per title+section)
  const del = await c.query(`
    DELETE FROM topics
    WHERE id NOT IN (
      SELECT MIN(id) FROM topics GROUP BY title, section_id
    )
  `);
  console.log('Deleted duplicate topics:', del.rowCount);

  const count = await c.query('SELECT COUNT(*) FROM topics');
  console.log('Topics remaining:', count.rows[0].count);

  await c.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
