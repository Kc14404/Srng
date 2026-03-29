/**
 * GMAT Hub — Final Gap Fill
 * Inserts 6 missing questions to close all taxonomy audit warnings.
 *
 * Run: node db/expand_final_gaps.js
 */

const { Client } = require('../node_modules/pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// Slug → actual topic title + section slug
const SLUG_MAP = {
  'rc-strategy':       { section: 'verbal', title: 'RC — Strategy' },
  'ds-framework':      { section: 'di',     title: 'DS Framework' },
  'ds-advanced-traps': { section: 'di',     title: 'DS Advanced Traps' },
  'two-part-analysis': { section: 'di',     title: 'Two-Part Analysis' },
};

const QUESTIONS = [
  {
    slug: 'rc-strategy',
    subtype: 'ExplicitDetail',
    question_type: 'RC',
    difficulty: 'Easy',
    q_text: "The passage states that early immune responses in mammals involve two distinct mechanisms. According to the passage, which of the following is true of the first mechanism?\n\n(A) It relies on previously acquired antibodies from prior exposure\n(B) It operates without requiring specific antigen recognition\n(C) It is slower to activate than the second mechanism\n(D) It produces long-term immunological memory\n(E) It is triggered only by bacterial pathogens",
    signals: "According to the passage — explicit retrieval signal",
    trap: "Wrong answers introduce scope creep (antibodies, memory — features of adaptive immunity, not innate)",
    method: "Reference-and-Read: locate the relevant sentence, read only what is stated",
    steps: [
      "Identify the retrieval keyword: 'first mechanism'",
      "Go back to the passage and find the sentence that directly describes it",
      "Match only what is explicitly stated — eliminate anything that requires inference",
      "Correct answer: (B) — innate immunity acts without specific recognition"
    ],
  },
  {
    slug: 'rc-strategy',
    subtype: 'Application',
    question_type: 'RC',
    difficulty: 'Hard',
    q_text: "The passage describes how coral reefs achieve resilience through biodiversity — when one species is disrupted, others fulfil similar ecological roles, maintaining overall system function. Which of the following scenarios most closely parallels the mechanism described?\n\n(A) A city builds redundant water pipelines so that if one fails, supply continues via alternate routes\n(B) A company trains all employees on the same software to improve efficiency\n(C) A government standardises building codes to reduce variation in construction practices\n(D) A hospital centralises all diagnostic equipment in a single department\n(E) A school reduces elective courses to focus resources on core curriculum",
    signals: "Most closely parallels / most analogous to — application question signal",
    trap: "Answer (A) looks structural (redundancy = resilience) but is about identical parallel paths, not diverse species filling the same role. The key is functional diversity, not identical backup.",
    method: "Extract the core principle first, then match it to answer choices",
    steps: [
      "Extract the principle: multiple different entities can perform the same function → system survives loss of any one",
      "Translate to abstract: functional redundancy via diversity",
      "Match to choices: (A) redundant pipelines = same function different path ✓ — closest match",
      "Verify others fail: (B)(C)(D)(E) are about uniformity or centralisation — opposite of functional diversity"
    ],
  },
  {
    slug: 'ds-framework',
    subtype: 'DSTrap',
    question_type: 'DS',
    difficulty: 'Hard',
    q_text: "Is x² > x?\n\n(1) x > 0\n(2) x ≠ 1",
    signals: "Is [expression] > [expression] — Yes/No DS with a classic inequality trap",
    trap: "Statement (1) alone looks sufficient — if x > 0, surely x² > x? Not if 0 < x < 1. E.g. x = 0.5 → x² = 0.25 < 0.5. Statement (2) alone is clearly insufficient. Together: x > 0 and x ≠ 1 still allows x = 0.5 (No) and x = 2 (Yes). Answer: E.",
    method: "ZOFNI testing — always test Zero, One, Fraction, Negative, Integer before concluding sufficiency",
    steps: [
      "Rephrase question: Is x² > x? → Is x(x−1) > 0? → Is x < 0 or x > 1?",
      "Statement (1): x > 0. Test x = 2: Yes. Test x = 0.5: No. → Insufficient.",
      "Statement (2): x ≠ 1. Test x = 2: Yes. Test x = 0.5: No. → Insufficient.",
      "Combined: x > 0 and x ≠ 1. Still allows x = 0.5 (No) and x = 2 (Yes). → Insufficient.",
      "Answer: E"
    ],
  },
  {
    slug: 'ds-advanced-traps',
    subtype: 'DSYesNo',
    question_type: 'DS',
    difficulty: 'Medium',
    q_text: "Is the integer n divisible by 12?\n\n(1) n is divisible by 4\n(2) n is divisible by 6",
    signals: "Is [integer] divisible by [number] — Yes/No DS about divisibility",
    trap: "Students often think 4 × 6 = 24, so together they imply divisibility by 24. Wrong — LCM(4,6) = 12, not 24. But n = 12 satisfies both and is divisible by 12, while n = 24 also satisfies both. The question is whether together they GUARANTEE divisibility by 12. Test: n = 12 → Yes. n = 24 → Yes. n = 36 → Yes. Actually LCM(4,6) = 12, so together → always divisible by 12. Answer: C.",
    method: "Use LCM logic for combined divisibility DS questions",
    steps: [
      "Statement (1): n divisible by 4. n = 4 → No (4/12 not integer). n = 12 → Yes. Insufficient.",
      "Statement (2): n divisible by 6. n = 6 → No. n = 12 → Yes. Insufficient.",
      "Combined: n divisible by LCM(4,6) = 12. → Always divisible by 12. Sufficient.",
      "Answer: C"
    ],
  },
  {
    slug: 'ds-advanced-traps',
    subtype: 'DSAlgebraic',
    question_type: 'DS',
    difficulty: 'Hard',
    q_text: "What is the value of x + y?\n\n(1) 2x + 3y = 18\n(2) 3x + 2y = 17",
    signals: "What is the value of [expression] — Value DS; tests whether you need individual values or just the expression",
    trap: "Students often think: two equations, two unknowns — must be C (solve individually then add). But you can add both equations directly: 5x + 5y = 35 → x + y = 7 without solving for x or y individually. Answer: C (but via elegant addition, not brute solving).",
    method: "Target-expression strategy: manipulate equations to produce exactly what's asked",
    steps: [
      "Statement (1) alone: one equation, two unknowns. Insufficient.",
      "Statement (2) alone: one equation, two unknowns. Insufficient.",
      "Combined: Add equations: (2x+3y) + (3x+2y) = 18+17 → 5x+5y = 35 → x+y = 7.",
      "We found x+y directly without solving x and y individually. Sufficient.",
      "Answer: C"
    ],
  },
  {
    slug: 'two-part-analysis',
    subtype: 'ScenarioTPA',
    question_type: 'TPA',
    difficulty: 'Medium',
    q_text: "A regional airline is evaluating two policy changes to reduce operating costs. Policy A involves renegotiating fuel contracts; Policy B involves reducing the frequency of flights on low-demand routes.\n\nIn the table below, identify the policy change that would MOST LIKELY reduce fuel costs as a percentage of revenue AND the policy change that would MOST LIKELY face the greatest resistance from passengers.\n\n| Option | Description |\n|--------|-------------|\n| 1 | Policy A only |\n| 2 | Policy B only |\n| 3 | Both Policy A and Policy B |\n| 4 | Neither policy |\n| 5 | Policy A has no fuel cost impact |",
    signals: "Identify [X] AND identify [Y] — two-column scenario TPA; each column answers a different question",
    trap: "Students try to find one answer satisfying both columns. Each column is independent — the answers CAN be the same option but don't have to be. Fuel cost as % of revenue depends on both numerator and denominator; Policy B reduces flights (revenue) which could raise the % even if absolute fuel cost drops.",
    method: "Treat each column as an independent question; solve separately then enter",
    steps: [
      "Column 1 (reduce fuel costs as % of revenue): Policy A directly lowers fuel cost (numerator ↓). Policy B reduces flights → revenue ↓ but fuel cost per revenue % may not improve. → Policy A only (Option 1).",
      "Column 2 (greatest passenger resistance): Policy B directly removes flight options for passengers → strong resistance. Policy A is behind-the-scenes. → Policy B only (Option 2).",
      "Enter Option 1 for Column 1, Option 2 for Column 2.",
      "Verify: each column answered independently, both answers are logically consistent."
    ],
  },
];

async function run() {
  await client.connect();
  console.log('Connected to Supabase.\n');

  let inserted = 0;

  for (const q of QUESTIONS) {
    const mapping = SLUG_MAP[q.slug];
    if (!mapping) throw new Error(`Unknown slug: ${q.slug}`);

    // Look up topic_id by title + section
    const { rows: topics } = await client.query(
      `SELECT t.id FROM topics t
       JOIN sections s ON t.section_id = s.id
       WHERE s.slug = $1 AND t.title = $2`,
      [mapping.section, mapping.title]
    );
    if (topics.length === 0) throw new Error(`Topic not found: ${mapping.title} in section ${mapping.section}`);
    const topicId = topics[0].id;

    // Get next order_idx
    const { rows: maxRows } = await client.query(
      `SELECT COALESCE(MAX(order_idx), 0) + 1 AS next_idx FROM questions WHERE topic_id = $1`,
      [topicId]
    );
    const orderIdx = maxRows[0].next_idx;

    // Insert question
    await client.query(
      `INSERT INTO questions (topic_id, subtype, q_text, question_type, signals, trap, method, steps, difficulty, order_idx)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [topicId, q.subtype, q.q_text, q.question_type, q.signals, q.trap, q.method, JSON.stringify(q.steps), q.difficulty, orderIdx]
    );

    inserted++;
    console.log(`  ✓ [${q.slug}] ${q.subtype} (${q.difficulty}) → order_idx=${orderIdx}`);
  }

  console.log(`\nDone: ${inserted} questions inserted.`);
  await client.end();
}

run().catch(err => { console.error('ERROR:', err); process.exit(1); });
