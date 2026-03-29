const { Client } = require('../node_modules/pg');

const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await c.connect();

  // Step 1: Find EXACT duplicate subtypes (case-insensitive)
  console.log('=== EXACT SUBTYPE DUPLICATES ===\n');
  const exact = await c.query(`
    SELECT t.title as topic, q1.subtype as subtype1, q2.subtype as subtype2, q1.id as id1, q2.id as id2
    FROM questions q1
    JOIN questions q2 ON q1.topic_id = q2.topic_id AND q1.id < q2.id
    JOIN topics t ON t.id = q1.topic_id
    WHERE q1.subtype IS NOT NULL AND q2.subtype IS NOT NULL
      AND lower(q1.subtype) = lower(q2.subtype)
    ORDER BY t.title;
  `);
  for (const r of exact.rows) {
    console.log(`[${r.topic}] "${r.subtype1}" (id:${r.id1}) vs "${r.subtype2}" (id:${r.id2})`);
  }
  console.log(`\nExact duplicates: ${exact.rows.length}`);

  // Step 2: Check the 4 confirmed duplicates from TASK file
  console.log('\n=== CONFIRMED DUPLICATE PAIRS ===\n');

  const confirmed = [
    { topic: 'Sequences', like1: '%Arithmetic Sequence%nth Term%', like2: '%Arithmetic%nth Term%' },
    { topic: 'Factors%Multiples%LCM', like1: '%LCM Scheduling%', like2: '%LCM%Scheduling%' },
    { topic: 'Roots%Radicals', like1: '%Nested Radical%', like2: '%Nested Radical%' },
    { topic: 'Statistics%Probability', like1: '%Complement%', like2: '%Complement%' },
  ];

  for (const pair of confirmed) {
    const res = await c.query(`
      SELECT q.id, q.subtype, q.q_text, q.difficulty, length(q.q_text) as len, t.title
      FROM questions q JOIN topics t ON t.id = q.topic_id
      WHERE t.title ILIKE $1 AND (q.subtype ILIKE $2 OR q.subtype ILIKE $3)
      ORDER BY q.id
    `, [pair.topic, pair.like1, pair.like2]);
    console.log(`--- ${pair.topic} ---`);
    for (const r of res.rows) {
      console.log(`  ID:${r.id} | "${r.subtype}" | diff:${r.difficulty} | len:${r.len}`);
      console.log(`  q_text: ${r.q_text.substring(0, 250)}`);
      console.log();
    }
  }

  // Step 3: Manual checks
  console.log('=== MANUAL CHECKS ===\n');

  const stats = await c.query(`
    SELECT q.id, q.subtype, q.q_text, t.title FROM questions q
    JOIN topics t ON t.id = q.topic_id
    WHERE t.title ILIKE '%statistic%' AND (q.subtype ILIKE '%weighted%' OR q.subtype ILIKE '%class score%' OR q.subtype ILIKE '%distribution%')
  `);
  console.log('Stats — Weighted Average vs Class Score Distribution:');
  for (const r of stats.rows) {
    console.log(`  ID:${r.id} [${r.title}] "${r.subtype}"`);
    console.log(`  ${r.q_text.substring(0, 200)}\n`);
  }

  const catchup = await c.query(`
    SELECT q.id, q.subtype, t.title FROM questions q
    JOIN topics t ON t.id = q.topic_id
    WHERE q.subtype ILIKE '%catch%up%' OR q.subtype ILIKE '%relative speed%'
  `);
  console.log('Catch-Up/Relative Speed (check topic):');
  for (const r of catchup.rows) {
    console.log(`  ID:${r.id} [${r.title}] "${r.subtype}"`);
  }

  const circle = await c.query(`
    SELECT q.id, q.subtype, q.q_text, t.title FROM questions q
    JOIN topics t ON t.id = q.topic_id
    WHERE q.subtype ILIKE '%arc length%'
  `);
  console.log('\nCircle Arc Length:');
  for (const r of circle.rows) {
    console.log(`  ID:${r.id} [${r.title}] "${r.subtype}"`);
    console.log(`  ${r.q_text.substring(0, 200)}\n`);
  }

  // Current counts per topic (to ensure none drop below 8)
  console.log('\n=== TOPIC COUNTS ===\n');
  const counts = await c.query(`
    SELECT t.title, COUNT(*) as cnt FROM questions q
    JOIN topics t ON t.id = q.topic_id
    GROUP BY t.title ORDER BY cnt ASC LIMIT 20
  `);
  for (const r of counts.rows) {
    console.log(`  ${r.title}: ${r.cnt}`);
  }

  await c.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
