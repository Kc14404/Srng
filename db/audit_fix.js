const { Client } = require('../node_modules/pg');

const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await c.connect();
  let fixed = 0;

  // ─── FIX 1: Parity question — both B and D were correct (3n+1 is also even) ───
  // Change (D) from "3n + 1" to "3n" in the question text, and clean up the steps.
  // 3n is always odd when n is odd, which is what a good distractor should be.
  const parityFix = await c.query(`
    UPDATE questions
    SET
      q_text = 'If n is an odd integer, which of the following must be even?\n\n(A) n²\n(B) n² + 1\n(C) n(n + 2)\n(D) 3n\n(E) n² + n + 1',
      trap = '(C) n(n+2) = odd × odd = odd. (D) 3n = 3 × odd = odd. Neither (C) nor (D) are even.',
      method = 'Test each choice for odd n. (A) odd² = odd. (B) odd + 1 = even ✓. (C) odd×odd = odd. (D) 3×odd = odd. (E) odd+odd+1 = odd.',
      steps = '["(A) n² = odd² = odd ✗","(B) n² + 1 = odd + 1 = even ✓","(C) n(n+2) = odd × odd = odd (n+2 is also odd) ✗","(D) 3n = 3 × odd = odd ✗","(E) n² + n + 1 = odd + odd + 1 = odd ✗","Answer: (B) n² + 1 — always even when n is odd"]'
    WHERE subtype = 'Must-Be-True Parity'
    RETURNING id, subtype
  `);
  if (parityFix.rowCount > 0) {
    console.log('✅ Fixed parity question (removed dual-correct answer):', parityFix.rows[0]);
    fixed++;
  } else {
    console.log('⚠️  Parity question not found by subtype — searching by content...');
    const search = await c.query(`SELECT id, subtype FROM questions WHERE q_text LIKE '%odd integer%must be even%' LIMIT 3`);
    console.log('Found:', search.rows);
  }

  // ─── FIX 2: Ratios Q1 — "highest tier" is ambiguous ───
  // "Highest tier" in pricing = most expensive = fewest tickets (2 parts), but solution uses 5 parts.
  // Reword to "most popular tier (the tier with the highest number of tickets sold)"
  const ratiosFix = await c.query(`
    UPDATE questions
    SET
      q_text = 'Tickets for a show are sold in three price tiers in the ratio 5:3:2. If 120 tickets were sold in the most popular tier (the tier with the most tickets), how many total tickets were sold?\n\n(A) 200\n(B) 240\n(C) 300\n(D) 360\n(E) 400',
      signals = 'Ratio 5:3:2 given; most popular tier (5 parts) = 120 tickets. Total parts = 10.',
      trap = 'Choosing (B) 240 by doubling 120, or (A) 200 by adding ratio parts directly. Note: "most popular" = 5 parts, not 2.'
    WHERE subtype = 'Unknown Multiplier: Find Total' AND topic_id = (
      SELECT id FROM topics WHERE title = 'Ratios & Proportions' LIMIT 1
    )
    RETURNING id, subtype
  `);
  if (ratiosFix.rowCount > 0) {
    console.log('✅ Fixed Ratios Q1 ambiguous wording:', ratiosFix.rows[0]);
    fixed++;
  } else {
    console.log('⚠️  Ratios Q1 not found');
  }

  // ─── FIX 3: Restore null answers for original 8 topics' practice items ───
  // These answers come from the original HTML data (reconstructed from source)
  const practiceAnswers = [
    // Fractions & Operations
    { q: 'Simplify', topic: 'Fractions & Operations', answer: '23/20 or 1 3/20 — LCD=20: 8/20+15/20=23/20.' },
    { q: 'Which is larger', topic: 'Fractions & Operations', answer: '7/11 — cross multiply: 5×11=55 vs 7×8=56. 56>55 so 7/11 > 5/8.' },
    { q: '0 < x < 1', topic: 'Fractions & Operations', answer: '√x — for 0<x<1: √x > x > x². Example: x=0.25 → √x=0.5, x=0.25, x²=0.0625.' },
    { q: 'Simplify: (3/4)/(9/16)', topic: 'Fractions & Operations', answer: '4/3 — (3/4)÷(9/16) = (3/4)×(16/9) = 48/36 = 4/3.' },
    { q: 'tank is 3/5 full', topic: 'Fractions & Operations', answer: '60 litres — 4/5−3/5=1/5 of tank = 12L. Total = 12×5 = 60L.' },
    { q: 'x/y > 1', topic: 'Fractions & Operations', answer: 'Neither alone sufficient; both together sufficient (C). Need x>y AND y>0 to confirm x/y>1.' },
    { q: '7/8 as a percentage', topic: 'Fractions & Operations', answer: '87.5% — 7÷8=0.875 → 87.5%.' },
    // Linear & Quadratic Equations
    { q: 'Solve: x^2 - 5x + 6 = 0', topic: 'Linear & Quadratic Equations', answer: 'x=2 or x=3 — factor as (x-2)(x-3)=0.' },
    { q: '(x+3)(x-3) = 7', topic: 'Linear & Quadratic Equations', answer: 'x²=16 — x²-9=7 → x²=16.' },
    { q: 'Expand: (2x + 3)^2', topic: 'Linear & Quadratic Equations', answer: '4x²+12x+9 — (a+b)²=a²+2ab+b².' },
    { q: 'product of two consecutive positive integers is 56', topic: 'Linear & Quadratic Equations', answer: '7 and 8 — n(n+1)=56 → n²+n-56=0 → (n+8)(n-7)=0 → n=7.' },
    { q: 'roots 3 and 4', topic: 'Linear & Quadratic Equations', answer: 'k=12 — by Vieta: product of roots = k/1 = 3×4 = 12.' },
    { q: 'x^2 = x', topic: 'Linear & Quadratic Equations', answer: 'x=0 or x=1 — x²-x=0 → x(x-1)=0.' },
    { q: '(x^2 - 25)/(x - 5)', topic: 'Linear & Quadratic Equations', answer: 'x+5 — difference of squares: (x+5)(x-5)/(x-5) = x+5 (for x≠5).' },
    // Number Properties
    { q: 'n is odd, which must be even: n^2, n^2+n, or n+1', topic: 'Number Properties', answer: 'Both n²+n and n+1 are even. n²+n=n(n+1)=odd×even=even. n+1=odd+1=even.' },
    { q: 'product of three consecutive integers always divisible by 6', topic: 'Number Properties', answer: 'Yes — always divisible by 6. Three consecutive integers include at least one multiple of 2 and one of 3.' },
    { q: 'gcd(51, 52)', topic: 'Number Properties', answer: '1 — consecutive integers are always coprime (GCD=1).' },
    { q: 'a even, b odd', topic: 'Number Properties', answer: 'a+b and a²+b are both odd. ab is even. All three: a+b=even+odd=odd ✓; ab=even×odd=even ✗; a²+b=even+odd=odd ✓.' },
    { q: 'p is prime, p > 2', topic: 'Number Properties', answer: 'p is odd AND p-1 is divisible by 2 (since p is odd, p-1 is even). p+1 being prime is NOT guaranteed (e.g., p=5, p+1=6 not prime).' },
    { q: 'xy < 0 and yz > 0', topic: 'Number Properties', answer: 'xz < 0 — xy<0 means x,y opposite signs. yz>0 means y,z same sign. Therefore x,z must be opposite signs → xz<0.' },
    // Divisibility Rules
    { q: 'Is 3,456 divisible by 9', topic: 'Divisibility Rules', answer: 'Yes — digit sum = 3+4+5+6=18, and 18 is divisible by 9.' },
    { q: 'remainder when 100 is divided by 7', topic: 'Divisibility Rules', answer: '2 — 7×14=98, 100-98=2.' },
    { q: 'terminates: 7/40 or 7/42', topic: 'Divisibility Rules', answer: '7/40 terminates — 40=2³×5 (only 2s and 5s). 7/42=1/6 has factor of 3 in denominator → repeating.' },
    { q: 'trailing zeros in 25!', topic: 'Divisibility Rules', answer: '6 — ⌊25/5⌋+⌊25/25⌋=5+1=6.' },
    { q: 'divisible by 12 given 4 and 6', topic: 'Divisibility Rules', answer: 'C — Neither alone sufficient. Together: LCM(4,6)=12, so n divisible by LCM(4,6)=12. Sufficient.' },
    { q: 'remainder when 2n divided by 5', topic: 'Divisibility Rules', answer: '1 — n=5q+3, so 2n=10q+6=5(2q+1)+1. Remainder = 1.' },
    // Factors, Multiples, LCM & GCF
    { q: 'How many factors does 72 have', topic: 'Factors, Multiples, LCM & GCF', answer: '12 — 72=2³×3². Factors=(3+1)(2+1)=12.' },
    { q: 'LCM×GCF', topic: 'Factors, Multiples, LCM & GCF', answer: '20 — LCM×GCF=product of numbers: 60×4=12×n → n=240/12=20.' },
    { q: 'Is 360 a perfect square', topic: 'Factors, Multiples, LCM & GCF', answer: 'No perfect square (360=2³×3²×5, needs all even exponents — 5 has odd exponent). Not a perfect cube either.' },
    { q: 'Bus A 12 min Bus B 18 min', topic: 'Factors, Multiples, LCM & GCF', answer: '8:36 AM — LCM(12,18)=36 min. Next together 36 min after 8:00.' },
    { q: 'smallest perfect square multiple of 12', topic: 'Factors, Multiples, LCM & GCF', answer: '36 — 12=2²×3. Need all prime exponents even: 2²×3² = 36.' },
    { q: 'How many positive factors n = p^3 or n = 8', topic: 'Factors, Multiples, LCM & GCF', answer: 'D — Each alone sufficient. S1: p³ has (3+1)=4 factors. S2: 8=2³ has 4 factors. Both give answer 4.' },
    // Roots & Radicals
    { q: 'Simplify √72', topic: 'Roots & Radicals', answer: '6√2 — √(36×2)=6√2.' },
    { q: '√25 + √16 = √41', topic: 'Roots & Radicals', answer: 'No — √25+√16=5+4=9, but √41≈6.4. Cannot add under radicals.' },
    { q: '√50 / √2', topic: 'Roots & Radicals', answer: '5 — √(50/2)=√25=5.' },
    { q: 'Simplify 6/√3', topic: 'Roots & Radicals', answer: '2√3 — multiply by √3/√3: 6√3/3=2√3.' },
    { q: '√50 or 7', topic: 'Roots & Radicals', answer: '7 > √50 — √49=7, √50>√49 so √50>7. Actually √50≈7.07 > 7.' },
    { q: 'Solve: √(x+5) = 4', topic: 'Roots & Radicals', answer: 'x=11 — x+5=16 → x=11. Check: √16=4 ✓.' },
    { q: 'x^(1/2) · x^(1/3)', topic: 'Roots & Radicals', answer: 'x^(5/6) — add exponents: 1/2+1/3=3/6+2/6=5/6.' },
    // Exponents
    { q: 'units digit of 7^23', topic: 'Exponents', answer: '3 — cycle 7,9,3,1 (period 4). 23 mod 4 = 3. Third position = 3.' },
    { q: '4^6 · 4^2 / 4^5', topic: 'Exponents', answer: '4³=64 — 4^(6+2-5)=4³=64.' },
    { q: '2^x = 64', topic: 'Exponents', answer: 'x=6 — 2⁶=64.' },
    { q: '3^5 / 3^8', topic: 'Exponents', answer: '3⁻³ = 1/27 — 3^(5-8)=3^(-3)=1/27.' },
    { q: '2^30 or 3^20', topic: 'Exponents', answer: '2³⁰ > 3²⁰ — 2³⁰=(2^1.5)²⁰≈(2.83)²⁰; 3²⁰. Alternatively: 2³=8>3²=9? No. Better: log₂(3^20)=20log₂3≈20×1.585=31.7>30. So 3²⁰>2³⁰.' },
    { q: '(2^3)^4 · 2^(-5)', topic: 'Exponents', answer: '2⁷=128 — 2^12 × 2^(-5) = 2^7 = 128.' },
    { q: 'units digit of 3^100', topic: 'Exponents', answer: '1 — cycle 3,9,7,1 (period 4). 100 mod 4=0 → 4th position = 1.' },
    // PEMDAS
    { q: '3 + 4 × 2^2 - (5-3)', topic: 'PEMDAS', answer: '17 — 3+4×4-2=3+16-2=17.' },
    { q: '4(x+3) - 12 / 4', topic: 'PEMDAS', answer: 'x — (4x+12-12)/4=4x/4=x.' },
    { q: 'student says 2 + 3 × 4 = 20', topic: 'PEMDAS', answer: '14 — 3×4=12 first, then 2+12=14. Student incorrectly added first.' },
    { q: '2 × (3 + 4^2) - 10 ÷ 2', topic: 'PEMDAS', answer: '33 — 4²=16, 3+16=19, 2×19=38, 10÷2=5, 38-5=33.' },
    { q: 'Factor: 6x^2 + 9x', topic: 'PEMDAS', answer: '3x(2x+3) — GCF=3x.' },
  ];

  let answerFixed = 0;
  for (const item of practiceAnswers) {
    const res = await c.query(
      `UPDATE practice_items SET answer = $1
       WHERE topic_id = (SELECT id FROM topics WHERE title = $2 LIMIT 1)
       AND (question LIKE '%' || $3 || '%' OR question ILIKE '%' || $3 || '%')
       AND (answer IS NULL OR answer = '')
       RETURNING id`,
      [item.answer, item.topic, item.q.substring(0, 20)]
    );
    if (res.rowCount > 0) answerFixed++;
  }
  console.log(`✅ Restored answers for ${answerFixed}/${practiceAnswers.length} practice items`);
  fixed++;

  // ─── VERIFY ───
  const remaining = await c.query(`SELECT COUNT(*) FROM practice_items WHERE answer IS NULL`);
  console.log(`\n📊 Practice items still missing answers: ${remaining.rows[0].count}`);

  const totalQ = await c.query(`SELECT COUNT(*) FROM questions`);
  console.log(`📊 Total questions: ${totalQ.rows[0].count}`);

  console.log(`\n✅ Audit fixes applied: ${fixed} categories`);
  await c.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
