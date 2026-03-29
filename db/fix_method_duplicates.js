const { Client } = require('../node_modules/pg');

const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const fixes = [
  {
    topic: 'Fractions & Operations',
    order_idx: 4,
    old_name: 'Benchmark Fractions',
    name: 'Fraction-to-Decimal Conversion',
    when_to_use: 'Use when you need to compare fractions quickly or when a problem asks for a decimal equivalent. Converting to decimals makes ordering and arithmetic straightforward.',
    steps: JSON.stringify([
      'Divide the numerator by the denominator (long division or known equivalents)',
      'Memorize key conversions: 1/8=0.125, 1/6≈0.167, 3/8=0.375, 5/8=0.625, 7/8=0.875',
      'For comparison, convert all fractions to decimals and line up decimal places',
      'To convert a terminating decimal back: read as fraction over power of 10, then simplify',
      'Check: denominator with only factors of 2 and 5 terminates; any other prime factor repeats'
    ]),
    tip: 'On the GMAT, knowing the common fraction-decimal pairs by heart (thirds, eighths, sixths) saves 30+ seconds per question. If the denominator is 2ᵃ×5ᵇ, the decimal terminates.'
  },
  {
    topic: 'Combinations, Permutations & Counting',
    order_idx: 4,
    old_name: 'Complement Counting',
    name: 'Symmetry Method',
    when_to_use: 'Use when an arrangement problem has symmetrical structure — mirror images, rotations, or equivalent positions — so you can count one portion and multiply.',
    steps: JSON.stringify([
      'Identify the symmetry: rotational (circular), reflective (mirror), or positional equivalence',
      'Count the total arrangements without considering symmetry',
      'Determine the symmetry factor (e.g., 2 for mirror images, n for rotational in a circle)',
      'Divide total arrangements by the symmetry factor to remove duplicates',
      'Verify with a small example to confirm the symmetry factor is correct'
    ]),
    tip: 'Circular permutations are the classic GMAT symmetry case: n people around a table = (n−1)! because all n rotations are identical. If the table has a fixed reference point, use n! instead.'
  },
  {
    topic: 'Combinations, Permutations & Counting',
    order_idx: 5,
    old_name: 'Slot Method',
    name: 'Casework Method',
    when_to_use: 'Use when a counting problem has conditional constraints that split naturally into distinct, non-overlapping cases. Count each case separately, then add.',
    steps: JSON.stringify([
      'Identify the condition or constraint that creates distinct cases',
      'List the cases exhaustively — make sure they are mutually exclusive and cover all possibilities',
      'Count the arrangements within each case independently',
      'Add the counts from all cases together',
      'Double-check that no case overlaps and no scenario is missing'
    ]),
    tip: 'On the GMAT, casework is the go-to method when you see phrases like "at least one," "no two adjacent," or constraints that change depending on which item is chosen first.'
  },
  {
    topic: 'Statistics & Probability',
    order_idx: 4,
    old_name: 'Complement Probability',
    name: 'Favorable Outcomes Method',
    when_to_use: 'Use when the sample space is small enough to list all outcomes. Calculate P = favorable outcomes / total outcomes by systematic enumeration.',
    steps: JSON.stringify([
      'Define the experiment and list the total number of equally likely outcomes',
      'Identify which outcomes satisfy the event (favorable outcomes)',
      'Count favorable outcomes systematically — use a table, tree diagram, or ordered list',
      'Compute probability: P = (number of favorable) / (total outcomes)',
      'Sanity-check: probability must be between 0 and 1, and all event probabilities should sum to 1'
    ]),
    tip: 'For GMAT probability with two dice, two coins, or cards from a small deck, just list every outcome in a grid. It is faster and more reliable than formulas when the total count is under 36.'
  },
  {
    topic: 'Sequences (Arithmetic & Geometric)',
    order_idx: 4,
    old_name: 'Term-Count Formula',
    name: 'Sequence Gap Method',
    when_to_use: 'Use when you know two terms of an arithmetic or geometric sequence and need to find the common difference/ratio or the position of a specific term.',
    steps: JSON.stringify([
      'Identify two known terms and their positions: aₘ and aₙ',
      'For arithmetic: compute d = (aₙ − aₘ) / (n − m)',
      'For geometric: compute r = (aₙ / aₘ)^(1/(n − m))',
      'Use d or r to find any other term: aₖ = aₘ + (k − m)d  or  aₖ = aₘ · r^(k − m)',
      'Verify by plugging the found d or r back into both known terms'
    ]),
    tip: 'The "gap" between positions is the key insight: if you know the 3rd and 7th terms, there are 4 gaps. On the GMAT, set up the equation with gaps first — it avoids off-by-one errors from the nth-term formula.'
  }
];

(async () => {
  await c.connect();
  console.log('Connected.\n');

  for (const f of fixes) {
    // Find the method by topic title + order_idx
    const find = await c.query(
      `SELECT m.id, m.name, m.when_to_use, m.steps, m.tip
       FROM methods m JOIN topics t ON m.topic_id = t.id
       WHERE t.title = $1 AND m.order_idx = $2`,
      [f.topic, f.order_idx]
    );

    if (find.rows.length === 0) {
      console.log(`⚠️  NOT FOUND: "${f.topic}" order_idx=${f.order_idx}`);
      continue;
    }

    const row = find.rows[0];
    console.log(`--- ${f.topic} [order_idx=${f.order_idx}] ---`);
    console.log(`  BEFORE: "${row.name}"`);

    await c.query(
      `UPDATE methods SET name = $1, when_to_use = $2, steps = $3, tip = $4 WHERE id = $5`,
      [f.name, f.when_to_use, f.steps, f.tip, row.id]
    );

    console.log(`  AFTER:  "${f.name}"`);
    console.log();
  }

  await c.end();
  console.log('Done — all duplicates renamed.');
})();
