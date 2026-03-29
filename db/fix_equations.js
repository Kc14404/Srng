const { Client } = require('pg');
const DB = 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres';

async function main() {
  const db = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await db.connect();

  // Get ALL equations to audit
  const { rows } = await db.query(`SELECT e.id, e.label, e.formula, t.title FROM equations e JOIN topics t ON e.topic_id = t.id ORDER BY t.title, e.id`);

  console.log(`Total equations: ${rows.length}`);
  const unformatted = rows.filter(r => r.formula && !r.formula.includes('$$') && !r.formula.includes('\\'));
  console.log(`Without $$ or LaTeX: ${unformatted.length}`);
  unformatted.forEach(r => console.log(`  ID ${r.id} | ${r.title} | ${r.label}: ${r.formula}`));

  // Targeted fixes for known broken entries
  const fixes = [
    // Linear inequality — corrupted fraction, missing arrow
    {
      id: 271,
      formula: '$$ax + b > c \\Rightarrow x > \\dfrac{c-b}{a} \\text{ (if } a>0)$$'
    },
    // Absolute value equation — missing arrow/delimiter
    {
      id: 274,
      formula: '$$|x - a| = k \\Rightarrow x = a+k \\text{ or } x = a-k$$'
    },
  ];

  // Auto-fix: wrap any formula that has math chars but no $$ in $$ delimiters
  for (const row of unformatted) {
    const alreadyFixed = fixes.find(f => f.id === row.id);
    if (alreadyFixed) continue;
    
    // If it looks like it just needs wrapping (simple math, no complex LaTeX needed)
    // We'll add it to fixes with $$ wrapping
    const needsLatex = row.formula.match(/[\/\^]/) || row.formula.includes('\\') || row.formula.includes('frac');
    if (needsLatex) {
      console.log(`\nNEEDS MANUAL FIX: ID ${row.id} | ${row.label}: ${row.formula}`);
    } else {
      // Simple text formula — just wrap in $$
      fixes.push({ id: row.id, formula: `$$${row.formula}$$` });
      console.log(`Auto-wrapping ID ${row.id}: ${row.formula}`);
    }
  }

  // Apply fixes
  console.log(`\nApplying ${fixes.length} fixes...`);
  for (const fix of fixes) {
    await db.query('UPDATE equations SET formula = $1 WHERE id = $2', [fix.formula, fix.id]);
    console.log(`  Updated eq ${fix.id}`);
  }

  console.log('\nDone.');
  await db.end();
}
main().catch(console.error);
