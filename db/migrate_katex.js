const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres';

function convertToLatex(text) {
  if (!text) return text;
  let t = text;

  // --- FRACTIONS ---
  // Complex fraction: (expr)/(expr) — must come before simple fraction
  // Matches things like (x+1)/(y-2) or (2x+3)/(4)
  t = t.replace(/\(([^()]+)\)\/\(([^()]+)\)/g, (_, num, den) => `$\\frac{${num}}{${den}}$`);

  // Simple fraction: word/word like x/y, a/b (but NOT http:// or dates like 1/2/2024)
  // Only convert single-token numerator/denominator
  t = t.replace(/(?<![:/\d])(\b[a-zA-Z0-9]+)\s*\/\s*([a-zA-Z0-9]+\b)(?![:/\d])/g, (match, num, den) => {
    // Skip if both are pure numbers > 2 digits (likely a date or ID)
    if (/^\d{3,}$/.test(num) || /^\d{3,}$/.test(den)) return match;
    // Skip if looks like a URL path
    return `$\\frac{${num}}{${den}}$`;
  });

  // --- EXPONENTS ---
  // x^2 → x^{2}, x^n → x^{n}, already inside $ if detected with surrounding math
  // Handle standalone exponents not already in $ delimiters
  t = t.replace(/(?<!\$)([a-zA-Z0-9])\^(\d+)(?!\})/g, (_, base, exp) => `$${base}^{${exp}}$`);
  t = t.replace(/(?<!\$)([a-zA-Z0-9])\^([a-zA-Z])(?!\})/g, (_, base, exp) => `$${base}^{${exp}}$`);

  // --- SQUARE ROOTS ---
  // √x or √(x+y)
  t = t.replace(/√\(([^)]+)\)/g, (_, inner) => `$\\sqrt{${inner}}$`);
  t = t.replace(/√([a-zA-Z0-9]+)/g, (_, inner) => `$\\sqrt{${inner}}$`);

  // --- SUBSCRIPTS ---
  // x_1 → x_{1}
  t = t.replace(/([a-zA-Z])_(\d+)/g, (_, base, sub) => `$${base}_{${sub}}$`);

  // --- MULTIPLICATION DOT ---
  // Avoid converting × already present; just ensure it's not doubled
  // (leave × as-is; KaTeX renders it fine)

  // --- CLEANUP: merge adjacent $ blocks ---
  // e.g. $\frac{x}{y}$ = $\frac{3}{4}$ — leave as-is, that's fine

  return t;
}

async function migrate() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const { rows } = await client.query(
    `SELECT id, q_text FROM questions WHERE q_text IS NOT NULL ORDER BY id`
  );

  console.log(`Processing ${rows.length} questions...`);
  let updated = 0;
  let unchanged = 0;
  let errors = [];

  for (const row of rows) {
    const original = row.q_text;
    const converted = convertToLatex(original);

    if (converted !== original) {
      try {
        await client.query('UPDATE questions SET q_text = $1 WHERE id = $2', [converted, row.id]);
        updated++;
        console.log(`✅ Q${row.id}: ${original.substring(0, 60)}...`);
        console.log(`   → ${converted.substring(0, 80)}`);
      } catch (err) {
        errors.push({ id: row.id, err: err.message });
        console.error(`❌ Q${row.id}: ${err.message}`);
      }
    } else {
      unchanged++;
    }
  }

  // Also update steps (jsonb array of strings)
  const { rows: stepsRows } = await client.query(
    `SELECT id, steps FROM questions WHERE steps IS NOT NULL ORDER BY id`
  );

  let stepsUpdated = 0;
  for (const row of stepsRows) {
    if (!Array.isArray(row.steps)) continue;
    const newSteps = row.steps.map(s => typeof s === 'string' ? convertToLatex(s) : s);
    const changed = newSteps.some((s, i) => s !== row.steps[i]);
    if (changed) {
      await client.query('UPDATE questions SET steps = $1 WHERE id = $2', [JSON.stringify(newSteps), row.id]);
      stepsUpdated++;
    }
  }

  await client.end();

  console.log(`\n📊 Summary:`);
  console.log(`  q_text updated: ${updated}`);
  console.log(`  q_text unchanged: ${unchanged}`);
  console.log(`  steps updated: ${stepsUpdated}`);
  if (errors.length) console.log(`  errors: ${errors.length}`, errors);
}

migrate().catch(console.error);
