const { Client } = require('../node_modules/pg');

const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

function stripLatex(formula) {
  if (!formula) return formula;
  
  // Handle multi-line formulas: split on $$ and extract text content
  // Pattern: $$\text{...}$$ or $$\text{...}$$\n$$\text{...}$$
  let result = formula;
  
  // Replace $$\text{content}$$ with just content
  // Also handle \quad as separator
  result = result.replace(/\$\$\\text\{([^}]+)\}\$\$/g, '$1');
  result = result.replace(/\$\$([^$]+)\$\$/g, (_, inner) => {
    // For remaining $$...$$ blocks, try to clean up LaTeX commands
    return inner
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\quad/g, '  |  ')
      .replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (_, content) => {
        return content.replace(/\\\\/g, ' or ').replace(/&/g, '').trim();
      })
      .replace(/\\[a-zA-Z]+/g, '')  // strip remaining LaTeX commands
      .replace(/\{|\}/g, '')
      .trim();
  });
  
  // Clean up any leftover LaTeX
  result = result.replace(/\\n/g, '\n').trim();
  
  return result;
}

async function run() {
  await c.connect();
  
  // Get all equations from verbal and DI sections that use $$\text{} format
  const res = await c.query(`
    SELECT e.id, t.title, s.slug, e.label, e.formula
    FROM equations e 
    JOIN topics t ON e.topic_id = t.id
    JOIN sections s ON t.section_id = s.id
    WHERE e.formula LIKE '$$\\text{%' 
       OR e.formula LIKE '%\\text{%'
    ORDER BY s.slug, t.order_idx, e.order_idx
  `);
  
  console.log(`Found ${res.rows.length} equations with LaTeX text formatting`);
  
  let fixed = 0;
  for (const row of res.rows) {
    const cleaned = stripLatex(row.formula);
    if (cleaned !== row.formula) {
      await c.query('UPDATE equations SET formula = $1 WHERE id = $2', [cleaned, row.id]);
      console.log(`  ✓ [${row.slug}] ${row.title} — ${row.label}`);
      console.log(`    Before: ${row.formula.substring(0, 80)}`);
      console.log(`    After:  ${cleaned.substring(0, 80)}`);
      fixed++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixed} equations`);
  
  // Also check for any equations that still have raw $$ in verbal sections
  const check = await c.query(`
    SELECT COUNT(*) as cnt FROM equations e
    JOIN topics t ON e.topic_id = t.id
    JOIN sections s ON t.section_id = s.id
    WHERE s.slug = 'verbal' AND e.formula LIKE '%$$%'
  `);
  console.log(`Remaining verbal equations with $$: ${check.rows[0].cnt}`);
  
  await c.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
