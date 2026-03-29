const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres', ssl: { rejectUnauthorized: false } });
c.connect().then(async () => {
  const r = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='sections' ORDER BY ordinal_position");
  console.log('sections columns:', r.rows.map(x => x.column_name));
  await c.end();
});
