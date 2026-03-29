/**
 * Fix equations that were incorrectly wrapped in $$ by fix_equations.js.
 * Any formula that is $$content$$ where content has NO LaTeX commands (no \, ^, _, {, })
 * should have the $$ removed — render as plain HTML text, not math mode.
 * 
 * Equations with actual LaTeX (\frac, \Rightarrow, etc.) are left untouched.
 */
const { Client } = require('pg');
const DB = 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres';

async function main() {
  const db = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await db.connect();

  const { rows } = await db.query(`SELECT id, label, formula FROM equations ORDER BY id`);

  let fixed = 0;
  let skipped = 0;

  for (const row of rows) {
    const f = row.formula;
    if (!f) continue;

    // Match $$...$$ (double-dollar wrapped)
    const m = f.match(/^\$\$(.+)\$\$$/s);
    if (!m) continue; // Not $$-wrapped — skip

    const inner = m[1];

    // If inner content has NO LaTeX commands → pure text, remove $$
    const hasLatex = /[\\^_{}\[\]]/.test(inner);
    if (hasLatex) {
      skipped++;
      continue; // Real math — leave alone
    }

    // Strip $$ wrappers
    const clean = inner.trim();
    await db.query('UPDATE equations SET formula = $1 WHERE id = $2', [clean, row.id]);
    console.log(`  Fixed ID ${row.id} | ${row.label}`);
    console.log(`    Before: $$${inner}$$`);
    console.log(`    After:  ${clean}`);
    fixed++;
  }

  console.log(`\nFixed: ${fixed} | Skipped (real math): ${skipped}`);
  await db.end();
}
main().catch(console.error);
