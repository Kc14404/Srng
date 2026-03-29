const { Client } = require('../node_modules/pg');
const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await c.connect();
  const res = await c.query(`
    SELECT s.slug, t.title, 
      COUNT(DISTINCT q.id) as tq_count,
      COUNT(DISTINCT m.id) as method_count,
      COUNT(DISTINCT p.id) as practice_count,
      COUNT(DISTINCT e.id) as eq_count,
      COUNT(DISTINCT r.id) as rule_count
    FROM topics t
    JOIN sections s ON t.section_id = s.id
    LEFT JOIN questions q ON q.topic_id = t.id
    LEFT JOIN methods m ON m.topic_id = t.id
    LEFT JOIN practice_items p ON p.topic_id = t.id
    LEFT JOIN equations e ON e.topic_id = t.id
    LEFT JOIN rules r ON r.topic_id = t.id
    GROUP BY s.slug, t.title, t.order_idx
    ORDER BY s.slug, t.order_idx
  `);
  
  let totalTQ = 0, totalMethods = 0;
  console.log('\nSection | Topic | TQs | Methods | Practice | Equations | Rules');
  console.log('---------------------------------------------------------------');
  res.rows.forEach(r => {
    console.log(`[${r.slug}] ${r.title.padEnd(45)} TQ:${r.tq_count} M:${r.method_count} P:${r.practice_count} E:${r.eq_count} R:${r.rule_count}`);
    totalTQ += parseInt(r.tq_count);
    totalMethods += parseInt(r.method_count);
  });
  console.log(`\nTotals: ${res.rows.length} topics, ${totalTQ} typical questions, ${totalMethods} methods`);
  await c.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
