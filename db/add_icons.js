const { Client } = require('../node_modules/pg');

const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const icons = [
  // Math (index.html order)
  { title: 'Fractions & Operations',       icon: '➗' },
  { title: 'Linear & Quadratic Equations', icon: '📐' },
  { title: 'Number Properties',            icon: '🔢' },
  { title: 'Divisibility Rules',           icon: '🧮' },
  { title: 'Factors, Multiples, LCM & GCF', icon: '🔬' },
  { title: 'Roots & Radicals',             icon: '√'  },
  { title: 'Exponents',                    icon: '⬆️' },
  { title: 'PEMDAS',                       icon: '📋' },
  // Verbal
  { title: 'Argument Structure',           icon: '🏗️' },
  { title: 'CR — Weaken',                  icon: '⚡' },
  { title: 'CR — Strengthen & Assumption', icon: '🔗' },
  { title: 'CR — Other Types',             icon: '🔍' },
  { title: 'RC — Strategy',               icon: '📖' },
  { title: 'RC — Question Types',          icon: '🎯' },
  // DI
  { title: 'DS Framework',                 icon: '⚖️' },
  { title: 'DS Advanced Traps',            icon: '🧠' },
  { title: 'Multi-Source Reasoning',       icon: '📑' },
  { title: 'Table Analysis',               icon: '📊' },
  { title: 'Graphics Interpretation',      icon: '📈' },
  { title: 'Two-Part Analysis',            icon: '⚡' },
];

async function run() {
  await c.connect();

  // Add icon column if not exists
  await c.query(`ALTER TABLE topics ADD COLUMN IF NOT EXISTS icon TEXT`);
  console.log('✅ icon column ready');

  // Update each topic
  for (const { title, icon } of icons) {
    const r = await c.query(`UPDATE topics SET icon = $1 WHERE title = $2`, [icon, title]);
    console.log(`  ${icon} ${title} → ${r.rowCount} row(s) updated`);
  }

  const count = await c.query(`SELECT COUNT(*) FROM topics WHERE icon IS NOT NULL`);
  console.log(`\n✅ ${count.rows[0].count}/20 topics have icons`);

  await c.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
