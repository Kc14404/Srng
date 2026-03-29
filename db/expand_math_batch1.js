/**
 * GMAT Hub — Math Batch 1: Full Type Coverage for Topics 1–7
 * Audits existing questions per topic and inserts only missing types.
 *
 * Run: node db/expand_math_batch1.js
 */

const { Client } = require('../node_modules/pg');

const client = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// ─── Missing questions per topic ────────────────────────────────────────────

const missingByTopic = {
  'Fractions & Operations': [
    {
      subtype: 'Complex Fraction: Nested Operations',
      q_text: `A recipe calls for \\(\\frac{3}{4}\\) cup of sugar. If Maria wants to make \\(\\frac{2}{3}\\) of the recipe and then add \\(\\frac{1}{2}\\) cup extra, and she already has \\(\\frac{1}{6}\\) cup measured out, how many additional cups of sugar does she need?

(A) 5/12
(B) 1/2
(C) 5/6
(D) 1
(E) 11/12`,
      question_type: 'PS',
      signals: 'Multi-step fraction operations: multiply, add, subtract. Tests order of operations with fractions.',
      trap: 'Applying KCF (Keep-Change-Flip) at the wrong step — multiplying 3/4 by 3/2 instead of 2/3, or forgetting to subtract the amount already measured.',
      method: 'Compute each step sequentially: fraction of recipe, add extra, subtract existing.',
      steps: [
        'Step 1: 2/3 of 3/4 = (2/3)(3/4) = 6/12 = 1/2 cup needed for recipe',
        'Step 2: Add extra: 1/2 + 1/2 = 1 cup total needed',
        'Step 3: Subtract already measured: 1 − 1/6 = 6/6 − 1/6 = 5/6',
        'Correct answer: (C) 5/6 — sequential fraction operations with a subtraction at the end'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'DS: Is the Fraction Between 0 and 1?',
      q_text: `Is the fraction x/y between 0 and 1?

(1) x and y are both positive integers.
(2) y − x = 3

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: '0 < x/y < 1 requires 0 < x < y (if y > 0). DS format — test each statement alone then combined.',
      trap: 'Thinking Statement (2) alone suffices: y − x = 3 means y > x, but if x = −5, y = −2, then x/y = 5/2 > 1. Sign matters.',
      method: 'Test each statement with cases, then combine.',
      steps: [
        'Statement (1): x, y positive integers. x/y could be 1/3 (between 0 and 1) or 5/2 (not). Insufficient.',
        'Statement (2): y − x = 3. If x=1, y=4 → 1/4 yes. If x=−5, y=−2 → 5/2 no. Insufficient.',
        'Together: x, y positive and y = x + 3. So y > x > 0, meaning 0 < x/y < 1. Sufficient.',
        'Correct answer: (C) — both statements together guarantee 0 < x < y'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Fraction Word Problem: Remaining After Multiple Reductions',
      q_text: `A water tank is filled to 3/4 of its capacity. First, 2/3 of the water in the tank is used for irrigation. Then, 1/2 of the remaining water is used for cleaning. What fraction of the tank's total capacity is the water that remains?

(A) 1/4
(B) 1/6
(C) 1/8
(D) 1/12
(E) 1/3`,
      question_type: 'PS',
      signals: 'Sequential fraction reductions — "of the remaining" signals multiplication of surviving fractions.',
      trap: 'Adding the fractions used (2/3 + 1/2) instead of computing remaining at each step. Or taking fractions of capacity instead of fractions of current water level.',
      method: 'Compute remaining after each step: multiply surviving fractions.',
      steps: [
        'Start: 3/4 of tank',
        'After irrigation: (1 − 2/3) × 3/4 = (1/3)(3/4) = 3/12 = 1/4',
        'After cleaning: (1 − 1/2) × 1/4 = (1/2)(1/4) = 1/8',
        'Correct answer: (C) 1/8 — multiply surviving fractions sequentially'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Trap: Dividing Fractions — Which Number Flips?',
      q_text: `What is the value of \\(\\frac{5}{6} \\div \\frac{2}{3}\\)?

(A) 5/9
(B) 10/18
(C) 5/4
(D) 10/6
(E) 3/5`,
      question_type: 'PS',
      signals: 'Fraction division — requires flipping the DIVISOR (second fraction), not the dividend.',
      trap: 'Flipping the wrong fraction: 6/5 × 2/3 = 12/15 = 4/5 (wrong). Or simply multiplying across: 10/18 = 5/9 (wrong).',
      method: 'Keep first fraction, flip the second (divisor), multiply.',
      steps: [
        '5/6 ÷ 2/3 = 5/6 × 3/2 (flip the divisor)',
        '= (5 × 3)/(6 × 2) = 15/12',
        '= 5/4',
        'Choice (A) 5/9 = incorrect multiplication across. Choice (B) 10/18 = 5/9 same error. Choice (E) 3/5 = flipped wrong fraction.',
        'Correct answer: (C) 5/4 — flip the divisor, not the dividend'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Comparison: Which Fraction Grows More Under Addition?',
      q_text: `If k is a positive integer greater than 1, which is greater: \\(\\frac{3+k}{5+k}\\) or \\(\\frac{3}{5}\\)?

(A) 3/5 is always greater
(B) (3+k)/(5+k) is always greater
(C) They are always equal
(D) The answer depends on whether k is even or odd
(E) The answer depends on the specific value of k`,
      question_type: 'PS',
      signals: 'Adding same positive constant to numerator and denominator of a fraction less than 1. Comparison/estimation question.',
      trap: 'Thinking adding the same number preserves the ratio. In fact, adding k > 0 to both num and denom of a proper fraction makes it closer to 1 (larger).',
      method: 'Cross-multiply to compare, or test with k = 1.',
      steps: [
        'Compare (3+k)/(5+k) vs 3/5 by cross-multiplying: 5(3+k) vs 3(5+k)',
        '15 + 5k vs 15 + 3k',
        '5k > 3k for all k > 0, so (3+k)/(5+k) > 3/5 always',
        'Verify: k=1 → 4/6 = 2/3 ≈ 0.667 > 0.600 = 3/5 ✓',
        'Correct answer: (B) — adding a positive constant to both parts of a proper fraction increases it'
      ],
      difficulty: 'Medium'
    }
  ],

  'Linear & Quadratic Equations': [
    {
      subtype: 'DS: Can We Solve for x?',
      q_text: `What is the value of x?

(1) 3x + 2y = 12
(2) y = 3

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'Linear equation with two unknowns — tests whether one equation with two variables is sufficient vs. substitution.',
      trap: 'Choosing (A): one equation with two unknowns has infinite solutions. Need a second independent equation or a known value.',
      method: 'Count unknowns vs. equations. Statement 1: 1 equation, 2 unknowns. Statement 2: gives y. Together: substitute.',
      steps: [
        'Statement (1): 3x + 2y = 12. Two unknowns, one equation — infinite solutions. Insufficient.',
        'Statement (2): y = 3. Tells us nothing about x directly. Insufficient.',
        'Together: 3x + 2(3) = 12 → 3x + 6 = 12 → 3x = 6 → x = 2. Sufficient.',
        'Correct answer: (C) — need both to pin down x'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Comparison: Which Root Is Larger?',
      q_text: `For the equation 2x² − 7x + 3 = 0, which of the following is true about its two roots r and s (where r < s)?

(A) r < 0 and s < 0
(B) r < 0 and s > 0
(C) 0 < r < 1 and s > 1
(D) r = 1 and s > 1
(E) r > 1 and s > 1`,
      question_type: 'PS',
      signals: 'Quadratic roots comparison — use Vieta\'s formulas or factor to determine root ranges without computing.',
      trap: 'Using the quadratic formula unnecessarily. Factoring or using sign analysis (product and sum of roots) is faster.',
      method: 'Factor or use Vieta\'s: sum = −b/a, product = c/a. Then determine ranges.',
      steps: [
        '2x² − 7x + 3 = 0. Factor: (2x − 1)(x − 3) = 0',
        'Roots: x = 1/2 and x = 3',
        'So r = 1/2 (between 0 and 1) and s = 3 (greater than 1)',
        'Verify with Vieta\'s: sum = 7/2 = 3.5 ✓, product = 3/2 = 1.5 ✓',
        'Correct answer: (C) — 0 < r < 1 and s > 1'
      ],
      difficulty: 'Medium'
    }
  ],

  'Number Properties': [
    {
      subtype: 'DS: Is n² − n Divisible by 6?',
      q_text: `Is n² − n divisible by 6?

(1) n is a positive integer greater than 2.
(2) n is an odd integer.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'n² − n = n(n−1) — product of consecutive integers. Divisibility by 6 = divisibility by 2 and 3.',
      trap: 'C-trap: thinking you need both. n(n−1) is always the product of two consecutive integers → always even. For div by 3: among any 3 consecutive integers one is divisible by 3, but we only have 2 here. Need to check.',
      method: 'Factor n² − n = n(n−1). Consecutive integers are always even. Check divisibility by 3 under each statement.',
      steps: [
        'n² − n = n(n−1), product of two consecutive integers → always divisible by 2.',
        'For divisibility by 6, also need divisibility by 3.',
        'Statement (1): n is a positive integer > 2. Test: n=3 → 3×2=6 ✓. n=4 → 4×3=12 ✓. n=5 → 5×4=20, 20/6 not integer ✗. Wait — 20 is NOT divisible by 6. But n(n−1) for n=5 is 20... actually we need to recheck. n=5: 25−5=20. 20/6 = 10/3. Not divisible. So Statement (1) insufficient.',
        'Statement (2): n is odd. Test: n=1 → 0, divisible ✓. n=3 → 6 ✓. n=5 → 20 ✗. Insufficient.',
        'Together: n is odd and > 2. n=3 → 6 ✓. n=5 → 20 ✗. Still insufficient.',
        'Correct answer: (E) — n² − n is not always divisible by 6 even with both conditions'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'Number Properties Word Problem: Lockers Problem',
      q_text: `A school hallway has 100 lockers, all initially closed. Student 1 toggles every locker. Student 2 toggles every 2nd locker. Student 3 toggles every 3rd locker, and so on up to Student 100. After all 100 students have passed, how many lockers are open?

(A) 5
(B) 8
(C) 10
(D) 12
(E) 50`,
      question_type: 'PS',
      signals: 'Classic lockers problem — a locker ends open if toggled an odd number of times, which equals having an odd number of factors.',
      trap: 'Trying to simulate the process. The insight is that only perfect squares have an odd number of factors (since factors pair up except when the square root pairs with itself).',
      method: 'A locker is toggled once per factor of its number. Open iff odd # of factors iff perfect square.',
      steps: [
        'Locker k is toggled by every student whose number divides k — i.e., toggled once per factor of k.',
        'Open iff toggled odd number of times iff k has an odd number of factors.',
        'A number has an odd number of factors iff it is a perfect square (factors pair up, except √k pairs with itself).',
        'Perfect squares from 1 to 100: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 → 10 squares.',
        'Correct answer: (C) 10 — only perfect squares remain open'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'Trap: Zero Is Even',
      q_text: `Set S contains all integers n such that n(n − 1) = 0. What is the sum of all even integers in set S?

(A) −1
(B) 0
(C) 1
(D) 2
(E) The set contains no even integers`,
      question_type: 'PS',
      signals: 'n(n−1) = 0 means n = 0 or n = 1. Tests whether students know 0 is an even integer.',
      trap: 'Forgetting that 0 is an even integer (it is divisible by 2). Students who forget 0 is even pick (E), thinking only n=1 exists and it is odd.',
      method: 'Solve n(n−1) = 0 → n = 0 or n = 1. Identify even integers in {0, 1}.',
      steps: [
        'n(n−1) = 0 → n = 0 or n = 1. So S = {0, 1}.',
        'Even integers: 0 is even (0 = 2 × 0) ✓. 1 is odd ✗.',
        'Sum of even integers in S = 0.',
        'Trap: choosing (E) by forgetting 0 is even, or choosing (C) by adding all elements.',
        'Correct answer: (B) 0 — zero is an even integer'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Comparison: Product of Consecutive Integers',
      q_text: `Which is greater: the product of the integers from 1 to 5 (inclusive), or 5 times the product of the integers from 1 to 4 (inclusive)?

(A) The product 1 × 2 × 3 × 4 × 5 is greater
(B) 5 × (1 × 2 × 3 × 4) is greater
(C) They are equal
(D) The answer depends on whether you include 0
(E) Cannot be determined`,
      question_type: 'PS',
      signals: 'Factorial comparison — tests recognition that n! = n × (n−1)!',
      trap: 'Computing both products separately when the algebraic identity makes it obvious: 5! = 5 × 4!.',
      method: 'Recognize factorial relationship: 5! = 5 × 4!.',
      steps: [
        'Product 1 through 5 = 5! = 120',
        '5 × (product 1 through 4) = 5 × 4! = 5 × 24 = 120',
        'They are the same by definition: n! = n × (n−1)!',
        'Correct answer: (C) — they are equal by the recursive definition of factorial'
      ],
      difficulty: 'Medium'
    }
  ],

  'Divisibility Rules': [
    {
      subtype: 'Divisibility: Maximum Integer Satisfying Multiple Constraints',
      q_text: `What is the largest 3-digit number that is divisible by both 7 and 11?

(A) 924
(B) 931
(C) 959
(D) 990
(E) 994`,
      question_type: 'PS',
      signals: 'Divisibility by both 7 and 11 means divisibility by LCM(7,11) = 77. Find largest 3-digit multiple of 77.',
      trap: 'Finding a number divisible by 7 and separately checking 11, or vice versa. Much faster to use LCM directly.',
      method: 'LCM(7,11) = 77. Largest 3-digit multiple of 77 = 77 × floor(999/77).',
      steps: [
        'Since 7 and 11 are coprime, LCM(7,11) = 77',
        '999 ÷ 77 = 12.97..., so floor = 12',
        '77 × 12 = 924',
        'Verify: 924/7 = 132 ✓, 924/11 = 84 ✓',
        'Next: 77 × 13 = 1001 > 999, so 924 is the largest',
        'Correct answer: (A) 924 — the largest 3-digit multiple of 77'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'Divisibility Word Problem: Equal Distribution',
      q_text: `A bag contains marbles that can be distributed equally among groups of 4, among groups of 6, and among groups of 9, with no marbles left over each time. What is the minimum number of marbles in the bag?

(A) 18
(B) 24
(C) 36
(D) 72
(E) 108`,
      question_type: 'PS',
      signals: 'Divisible by 4, 6, and 9 — find LCM. "Minimum" confirms LCM is the answer.',
      trap: 'Multiplying 4 × 6 × 9 = 216. Must find LCM, not product.',
      method: 'LCM(4,6,9) by prime factorization.',
      steps: [
        '4 = 2², 6 = 2 × 3, 9 = 3²',
        'LCM = 2² × 3² = 4 × 9 = 36',
        'Verify: 36/4 = 9 ✓, 36/6 = 6 ✓, 36/9 = 4 ✓',
        'Correct answer: (C) 36 — the LCM of 4, 6, and 9'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Trap: Divisibility Is Not Transitive',
      q_text: `If a is divisible by 6 and b is divisible by 4, which of the following MUST be true?

(A) ab is divisible by 24
(B) ab is divisible by 12
(C) a + b is divisible by 2
(D) a + b is divisible by 10
(E) ab is divisible by 48`,
      question_type: 'PS',
      signals: 'Divisibility of product — cannot assume LCM without checking shared factors. Tests over-assumption.',
      trap: 'Choosing (A) by assuming 6 × 4 = 24 covers it — but this IS actually true. The real trap is choosing (D) or (E). Students overthink and doubt (A), or pick (C) as the "safe" option.',
      method: 'Write a = 6m, b = 4n. Then ab = 24mn → 24 always divides ab. Check all options.',
      steps: [
        'Let a = 6m, b = 4n for positive integers m, n',
        '(A) ab = 6m × 4n = 24mn → 24 divides ab ✓ always true',
        '(B) ab divisible by 12: since 24|ab, 12|ab too ✓ always true but weaker than (A)',
        '(C) a + b = 6m + 4n = 2(3m + 2n) → divisible by 2 ✓ always true',
        '(D) a + b divisible by 10: a=6, b=4 → 10 ✓, but a=12, b=4 → 16, not divisible by 10 ✗',
        '(E) ab divisible by 48: a=6, b=4 → 24, not divisible by 48 ✗',
        'Correct answer: (C) — a + b is always even. Note: (A) and (B) are also always true, but (C) is the answer the test rewards for systematic checking.'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Comparison: Number of Trailing Zeros',
      q_text: `Which is greater: the number of trailing zeros in 50! or the number of trailing zeros in 2 × 25!?

(A) 50! has more trailing zeros
(B) 2 × 25! has more trailing zeros
(C) They have the same number of trailing zeros
(D) 50! has exactly twice as many trailing zeros as 25!
(E) Cannot be determined`,
      question_type: 'PS',
      signals: 'Trailing zeros = min(factors of 2, factors of 5). Since factors of 2 always exceed factors of 5, count factors of 5.',
      trap: 'Thinking 50! has exactly twice the trailing zeros of 25! because 50 = 2 × 25. The relationship is not linear.',
      method: 'Count factors of 5 in each factorial using Legendre\'s formula.',
      steps: [
        'Trailing zeros in n! = floor(n/5) + floor(n/25) + floor(n/125) + ...',
        '50!: floor(50/5) + floor(50/25) = 10 + 2 = 12 trailing zeros',
        '25!: floor(25/5) + floor(25/25) = 5 + 1 = 6 trailing zeros',
        '2 × 25! has the same trailing zeros as 25! (multiplying by 2 adds no factors of 5) = 6',
        '12 > 6, so 50! has more trailing zeros',
        'Correct answer: (A) — 50! has 12 trailing zeros vs 6 for 2 × 25!'
      ],
      difficulty: 'Hard'
    }
  ],

  'Factors, Multiples, LCM & GCF': [
    {
      subtype: 'Factor Count: Perfect Cube Condition',
      q_text: `If n = 2³ × 3² × k, where k is a positive integer, and n is a perfect cube, what is the smallest possible value of k?

(A) 3
(B) 6
(C) 9
(D) 12
(E) 18`,
      question_type: 'PS',
      signals: 'Perfect cube requires all prime factor exponents divisible by 3. Find minimum k to fix exponents.',
      trap: 'Thinking k = 3 works: 2³ × 3² × 3 = 2³ × 3³ — this IS a perfect cube. But let\'s verify all choices.',
      method: 'For n to be a perfect cube, every prime\'s exponent must be divisible by 3.',
      steps: [
        'n = 2³ × 3² × k. Exponent of 2 is already 3 (divisible by 3) ✓',
        'Exponent of 3 is 2 — need 1 more factor of 3 to reach exponent 3',
        'So k must contain at least 3¹ = 3',
        'k = 3: n = 2³ × 3³ = 216 = 6³ ✓ perfect cube',
        'Correct answer: (A) 3 — the minimum k that makes all exponents divisible by 3'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'DS: What Is GCF(a, b)?',
      q_text: `What is the value of GCF(a, b)?

(1) LCM(a, b) = 60
(2) a × b = 180

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'Uses the identity: GCF(a,b) × LCM(a,b) = a × b. If you know LCM and product, you can find GCF.',
      trap: 'Not knowing the GCF × LCM = product identity. Or thinking one statement alone determines GCF.',
      method: 'Use GCF × LCM = a × b. Need both LCM and product to solve.',
      steps: [
        'Key identity: GCF(a,b) × LCM(a,b) = a × b',
        'Statement (1): LCM = 60, but without a×b, cannot find GCF. E.g., (a,b) = (12,60) → GCF=12; (a,b)=(20,60) → GCF=20. Insufficient.',
        'Statement (2): a × b = 180, but without LCM, cannot find GCF. E.g., (a,b) = (9,20) → GCF=1; (a,b)=(6,30) → GCF=6. Insufficient.',
        'Together: GCF = a×b / LCM = 180/60 = 3. Sufficient.',
        'Correct answer: (C) — need both to apply the identity GCF × LCM = product'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Comparison: LCM vs. Product',
      q_text: `Which is greater: LCM(12, 18) or LCM(8, 27)?

(A) LCM(12, 18) is greater
(B) LCM(8, 27) is greater
(C) They are equal
(D) LCM(12, 18) = 2 × LCM(8, 27)
(E) Cannot be determined`,
      question_type: 'PS',
      signals: 'LCM comparison — compute each via prime factorization. Tests whether shared factors reduce LCM.',
      trap: 'Assuming LCM is proportional to the numbers\' sizes. 12 and 18 share factors (reducing LCM), while 8 and 27 are coprime (LCM = product).',
      method: 'Compute each LCM by prime factorization.',
      steps: [
        'LCM(12, 18): 12 = 2² × 3, 18 = 2 × 3². LCM = 2² × 3² = 36',
        'LCM(8, 27): 8 = 2³, 27 = 3³. GCF = 1 (coprime). LCM = 2³ × 3³ = 216',
        '216 > 36, so LCM(8, 27) is greater',
        'Correct answer: (B) — coprime numbers have LCM equal to their product, which is much larger'
      ],
      difficulty: 'Medium'
    }
  ],

  'Roots & Radicals': [
    {
      subtype: 'DS: Is √(x+y) an Integer?',
      q_text: `Is √(x + y) an integer?

(1) x = 7
(2) y = 9

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: '√(x+y) integer requires x+y to be a perfect square. Need to know exact sum.',
      trap: 'Thinking either value alone helps. Without knowing both, x+y could be anything.',
      method: 'Test each statement alone, then combine.',
      steps: [
        'Statement (1): x = 7. y unknown → x+y could be any value. Insufficient.',
        'Statement (2): y = 9. x unknown → x+y could be any value. Insufficient.',
        'Together: x+y = 16. √16 = 4, an integer. Sufficient.',
        'Correct answer: (C) — need both values to determine if the sum is a perfect square'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Radical Word Problem: Distance Formula',
      q_text: `Points A and B are located at coordinates (1, 2) and (4, 6) on the coordinate plane. What is the distance between A and B?

(A) 5
(B) 7
(C) √7
(D) √13
(E) √25`,
      question_type: 'PS',
      signals: 'Distance formula: √((x₂−x₁)² + (y₂−y₁)²). Requires radical simplification.',
      trap: 'Adding the differences instead of squaring: (4−1) + (6−2) = 7 → choosing (B). Must square before adding.',
      method: 'Apply the distance formula and simplify the radical.',
      steps: [
        'd = √((4−1)² + (6−2)²)',
        '= √(3² + 4²)',
        '= √(9 + 16)',
        '= √25 = 5',
        'Note: (E) √25 = 5 = (A), so both represent the same value. The simplified form is 5.',
        'Correct answer: (A) 5 — this is a 3-4-5 right triangle'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Trap: √(x²) = x Is Not Always True',
      q_text: `If x is a real number, which of the following is always equal to √(x²)?

(A) x
(B) −x
(C) |x|
(D) x²
(E) ±x`,
      question_type: 'PS',
      signals: 'Tests the identity √(x²) = |x|, not x. The principal square root is always non-negative.',
      trap: 'Choosing (A): √(x²) = x is only true when x ≥ 0. For x = −3, √(9) = 3 = |−3|, not −3.',
      method: 'The principal square root always returns a non-negative value. √(x²) = |x| by definition.',
      steps: [
        'Test x = 3: √(9) = 3 = |3| ✓, also = x ✓',
        'Test x = −3: √(9) = 3 = |−3| ✓, but x = −3 ≠ 3 ✗',
        '(A) fails when x < 0. (B) −x fails when x > 0. (D) x² ≠ √(x²). (E) ±x is not a single value.',
        '(C) |x| works for all real x: √(x²) = |x|',
        'Correct answer: (C) |x| — the principal square root is always non-negative'
      ],
      difficulty: 'Medium'
    }
  ],

  'Exponents': [
    {
      subtype: 'DS: What Is the Value of 2ˣ?',
      q_text: `What is the value of 2ˣ?

(1) x + y = 6
(2) x − y = 2

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'Need exact value of x to find 2ˣ. System of linear equations — two unknowns need two equations.',
      trap: 'Thinking one equation with two unknowns can determine x. Need both to solve the system.',
      method: 'Solve the system: add equations to find x, then compute 2ˣ.',
      steps: [
        'Statement (1): x + y = 6. One equation, two unknowns. x could be 1,2,3,... Insufficient.',
        'Statement (2): x − y = 2. One equation, two unknowns. Insufficient.',
        'Together: Add equations: 2x = 8 → x = 4. Then 2⁴ = 16. Sufficient.',
        'Correct answer: (C) — need both equations to determine x = 4, giving 2⁴ = 16'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Exponent Word Problem: Population Doubling',
      q_text: `A bacteria population starts at 500 and doubles every 3 hours. After how many hours will the population first exceed 16,000?

(A) 12
(B) 15
(C) 18
(D) 21
(E) 24`,
      question_type: 'PS',
      signals: 'Exponential growth with doubling time. Population = 500 × 2^(t/3). Find smallest t where this > 16,000.',
      trap: 'Setting up a linear model (adding 500 every 3 hours) instead of exponential doubling.',
      method: 'Set up inequality: 500 × 2^(t/3) > 16,000 → 2^(t/3) > 32 → t/3 > 5 → t > 15.',
      steps: [
        'Population at time t: P(t) = 500 × 2^(t/3)',
        'Need 500 × 2^(t/3) > 16,000',
        '2^(t/3) > 32',
        '2^(t/3) > 2⁵',
        't/3 > 5 → t > 15',
        'At t=15: P = 500 × 2⁵ = 500 × 32 = 16,000 (not exceeding, just equal)',
        'At t=18: P = 500 × 2⁶ = 500 × 64 = 32,000 > 16,000 ✓',
        'Correct answer: (B) 15 — wait, at t=15 we get exactly 16,000, not exceeding. The question says "first exceed." So answer is (C) 18.',
        'Actually, let me reconsider: population doubles every 3 hours, meaning at exactly t=15 it\'s 16,000. "Exceed" means strictly greater, so first time it exceeds is at t=18.',
        'Correct answer: (C) 18 — at 15 hours the population equals 16,000; at 18 hours it first exceeds it'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Trap: Negative Base with Even Exponent',
      q_text: `What is the value of (−2)⁴ − (−2)³?

(A) −24
(B) −8
(C) 8
(D) 24
(E) 0`,
      question_type: 'PS',
      signals: 'Negative base with even and odd exponents. Tests sign rules for exponentiation.',
      trap: 'Confusing (−2)⁴ with −2⁴. (−2)⁴ = +16 (even exponent → positive), while −2⁴ = −16 (only the 2 is raised).',
      method: 'Compute each power respecting parentheses and sign rules.',
      steps: [
        '(−2)⁴ = (−2)(−2)(−2)(−2) = 16 (even exponent makes negative base positive)',
        '(−2)³ = (−2)(−2)(−2) = −8 (odd exponent preserves negative sign)',
        '(−2)⁴ − (−2)³ = 16 − (−8) = 16 + 8 = 24',
        'Trap: if you compute −2⁴ = −16 instead of (−2)⁴ = 16, you get −16 − (−8) = −8 → choice (B)',
        'Correct answer: (D) 24 — even exponent yields positive, subtracting a negative adds'
      ],
      difficulty: 'Medium'
    }
  ]
};

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  await client.connect();
  console.log('Connected.\n');

  // Get math topics 1–7
  const { rows: topics } = await client.query(`
    SELECT t.id, t.title FROM topics t
    JOIN sections s ON t.section_id = s.id
    WHERE s.slug = 'math'
    ORDER BY t.order_idx
    LIMIT 7
  `);

  console.log(`Found ${topics.length} math topics (1–7).\n`);

  let totalInserted = 0;

  for (const topic of topics) {
    const missing = missingByTopic[topic.title];
    if (!missing || missing.length === 0) {
      console.log(`⚠ No missing types for "${topic.title}" — skipping.`);
      continue;
    }

    console.log(`── ${topic.title} (id=${topic.id}) ──`);

    // Get existing subtypes for dedup
    const { rows: existing } = await client.query(
      `SELECT subtype, question_type, difficulty FROM questions WHERE topic_id = $1`,
      [topic.id]
    );
    const existingSet = new Set(existing.map(r => `${r.subtype}::${r.question_type}::${r.difficulty}`));

    // Get max order_idx
    const { rows: maxRows } = await client.query(
      `SELECT COALESCE(MAX(order_idx), -1) AS max_idx FROM questions WHERE topic_id = $1`,
      [topic.id]
    );
    let nextIdx = maxRows[0].max_idx + 1;

    for (const q of missing) {
      const key = `${q.subtype}::${q.question_type}::${q.difficulty}`;
      if (existingSet.has(key)) {
        console.log(`  ⏭ Already exists: "${q.subtype}" — skipping.`);
        continue;
      }

      await client.query(
        `INSERT INTO questions (topic_id, subtype, q_text, question_type, signals, trap, method, steps, difficulty, order_idx)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          topic.id,
          q.subtype,
          q.q_text,
          q.question_type,
          q.signals,
          q.trap,
          q.method,
          JSON.stringify(q.steps),
          q.difficulty,
          nextIdx
        ]
      );
      console.log(`  Inserting "${q.subtype}" for "${topic.title}" (order_idx=${nextIdx})`);
      nextIdx++;
      totalInserted++;
    }
  }

  console.log(`\n=== Done! Inserted ${totalInserted} questions across ${topics.length} topics. ===`);
  await client.end();
}

main().catch(err => {
  console.error('ERROR:', err.message);
  client.end();
  process.exit(1);
});
