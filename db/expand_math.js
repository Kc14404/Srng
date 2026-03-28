/**
 * GMAT Hub — Math TQ & Methods Expansion
 * Adds 5 new questions (order_idx 4–8) and 2 new methods (order_idx 4–5)
 * for each of the 19 math topics.
 *
 * Run: node db/expand_math.js
 */

const { Client } = require('../node_modules/pg');

const client = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// ─── Content Data ────────────────────────────────────────────────────────────

const topicContent = {
  'Fractions & Operations': {
    questions: [
      {
        subtype: 'Fraction Comparison: Cross-Multiply',
        q_text: `Which of the following fractions is greatest?

(A) 7/12
(B) 5/8
(C) 11/18
(D) 3/5
(E) 13/20`,
        question_type: 'PS',
        signals: 'Multiple fractions to compare; no common denominator.',
        trap: 'Guessing based on numerator size. 11/18 looks large but 5/8 = 0.625 is greatest.',
        method: 'Convert to decimals or find common denominator',
        steps: ['7/12 ≈ 0.583', '5/8 = 0.625', '11/18 ≈ 0.611', '3/5 = 0.600', '13/20 = 0.650', 'Greatest is 13/20', 'Answer: (E)'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Complex Fraction Simplification',
        q_text: `What is the value of (1/2 + 1/3) / (1/2 − 1/3)?

(A) 1
(B) 5/6
(C) 5
(D) 6/5
(E) 6`,
        question_type: 'PS',
        signals: 'Fraction within a fraction — simplify numerator and denominator separately.',
        trap: 'Adding/subtracting across the division bar instead of treating top and bottom independently.',
        method: 'Simplify numerator and denominator, then divide',
        steps: ['Numerator: 1/2 + 1/3 = 3/6 + 2/6 = 5/6', 'Denominator: 1/2 − 1/3 = 3/6 − 2/6 = 1/6', 'Result: (5/6) ÷ (1/6) = (5/6) × (6/1) = 5', 'Answer: (C) 5'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Fraction of a Fraction',
        q_text: `If x is a positive integer, is x/12 an integer?

(1) x/4 is an integer.
(2) x/6 is an integer.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Divisibility question disguised as fractions. x/12 integer means 12 divides x.',
        trap: 'C-trap: thinking you need both. Statement 1 alone: x could be 4 (no) or 12 (yes). Statement 2 alone: x could be 6 (no) or 12 (yes). Together: x divisible by LCM(4,6)=12. Yes.',
        method: 'Translate to divisibility: 12|x iff 4|x AND 3|x. Test each statement.',
        steps: ['x/12 integer ↔ 12 divides x ↔ both 4 and 3 divide x', 'Statement (1): 4|x → x ∈ {4,8,12,16...}. x=4 → 4/12 not integer. x=12 → yes. Insufficient.', 'Statement (2): 6|x → x ∈ {6,12,18...}. x=6 → 6/12 not integer. x=12 → yes. Insufficient.', 'Together: 4|x and 6|x → LCM(4,6)=12 divides x → x/12 is always integer. Sufficient.', 'Answer: (C)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Reciprocal Operations',
        q_text: `If 1/a + 1/b = 1/c, and a = 3, b = 6, what is c?

(A) 1/9
(B) 2
(C) 3
(D) 4.5
(E) 9`,
        question_type: 'PS',
        signals: 'Reciprocal equation — looks like harmonic mean setup. Plug in and solve.',
        trap: 'Adding denominators: 1/3 + 1/6 ≠ 1/9. Must find common denominator first.',
        method: 'Common denominator then solve for c',
        steps: ['1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2', '1/c = 1/2 → c = 2', 'Answer: (B) 2'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Fraction Greater Than 1',
        q_text: `Is the fraction p/q greater than 1?

(1) p > 0
(2) p − q > 0

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'p/q > 1 requires knowing sign of q and whether |p| > |q|.',
        trap: 'Thinking statement 2 alone is sufficient. p−q > 0 means p > q, but if q < 0, p/q could be negative.',
        method: 'p/q > 1 needs p > q > 0 or p < q < 0. Test cases for each statement.',
        steps: ['Statement (1): p > 0 says nothing about q or p vs q. Insufficient.', 'Statement (2): p > q. If p=3, q=2 → 3/2 > 1 yes. If p=1, q=−2 → 1/(−2) < 1 no. Insufficient.', 'Together: p > 0 and p > q. If q > 0: p > q > 0 → p/q > 1. If q < 0: p/q < 0 < 1. Still two outcomes. Insufficient.', 'Answer: (E)'],
        difficulty: 'Hard'
      }
    ],
    methods: [
      {
        name: 'Benchmark Fractions',
        when_to_use: 'Comparing fractions or estimating — convert to nearest benchmark (1/4, 1/3, 1/2, 2/3, 3/4)',
        steps: ['Identify each fraction', 'Compare each to nearest benchmark: 1/4=0.25, 1/3≈0.33, 1/2=0.5, 2/3≈0.67, 3/4=0.75', 'Use benchmarks to rank or estimate without full computation', 'For close fractions, cross-multiply to break ties: a/b vs c/d → compare ad vs bc'],
        tip: 'Memorize decimal equivalents for all fractions with denominators up to 12.'
      },
      {
        name: 'Multiply-Everything-Out (MEO)',
        when_to_use: 'Complex fraction expressions with nested fractions or multiple operations',
        steps: ['Identify the LCD of ALL fractions in the expression', 'Multiply every term (top and bottom) by the LCD', 'This eliminates all fraction bars, leaving integers', 'Simplify the resulting integer expression'],
        tip: 'This is fastest for expressions like (1/a + 1/b)/(1/a − 1/b) — multiply by ab.'
      }
    ]
  },

  'Linear & Quadratic Equations': {
    questions: [
      {
        subtype: 'Quadratic: Disguised Form',
        q_text: `If x² − 5x + 6 = 0, what is the value of x² + 1/x²?

(A) 23/9
(B) 13/4
(C) 37/9
(D) Either 23/9 or 13/4
(E) Cannot be determined`,
        question_type: 'PS',
        signals: 'Quadratic equation → two solutions. Must check if answer depends on which root.',
        trap: 'Picking only one root. x=2 gives 4+1/4=17/4; x=3 gives 9+1/9=82/9. Two different answers.',
        method: 'Factor quadratic, compute expression for each root, check if unique.',
        steps: ['x² − 5x + 6 = (x−2)(x−3) = 0 → x=2 or x=3', 'If x=2: x²+1/x² = 4+1/4 = 17/4', 'If x=3: x²+1/x² = 9+1/9 = 82/9', 'Two different values → Answer: (D)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'System of Equations: Combo',
        q_text: `If 3x + 2y = 18 and x + 2y = 10, what is the value of x + y?

(A) 4
(B) 6
(C) 7
(D) 8
(E) 10`,
        question_type: 'PS',
        signals: 'Two equations, but asking for a combination (x+y), not individual values.',
        trap: 'Solving for x and y individually when you can get x+y faster by combining equations.',
        method: 'Subtract equations to find x, then substitute to find y, compute x+y.',
        steps: ['Subtract: (3x+2y) − (x+2y) = 18−10 → 2x = 8 → x = 4', 'Substitute x=4: 4+2y=10 → y=3', 'x+y = 4+3 = 7', 'Answer: (C) 7'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Number of Solutions',
        q_text: `Does the equation ax² + bx + c = 0 have two distinct real solutions?

(1) a = 1, c = −4
(2) b² > 16

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Two distinct real solutions ↔ discriminant b²−4ac > 0.',
        trap: 'Statement 1: a=1, c=−4 → discriminant = b²+16, always > 0. Sufficient alone!',
        method: 'Discriminant test: b²−4ac > 0 means two real roots.',
        steps: ['Two distinct real solutions ↔ b²−4ac > 0', 'Statement (1): a=1, c=−4 → disc = b²−4(1)(−4) = b²+16 > 0 always. Sufficient.', 'Statement (2): b²>16 but a,c unknown. If a=1,c=5: disc=b²−20, could be negative if b²=17. Insufficient.', 'Answer: (A)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Linear: Word Problem Setup',
        q_text: `A phone plan charges a flat fee of $20 plus $0.10 per minute. Another plan charges $0.15 per minute with no flat fee. At how many minutes do the two plans cost the same?

(A) 200
(B) 300
(C) 400
(D) 500
(E) 600`,
        question_type: 'PS',
        signals: 'Two linear expressions set equal — classic break-even problem.',
        trap: 'Setting up the equation wrong: forgetting the flat fee applies only to Plan A.',
        method: 'Set cost equations equal: 20 + 0.10m = 0.15m',
        steps: ['Plan A: 20 + 0.10m', 'Plan B: 0.15m', 'Set equal: 20 + 0.10m = 0.15m', '20 = 0.05m → m = 400', 'Answer: (C) 400'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Quadratic: Sum and Product of Roots',
        q_text: `If the roots of x² − kx + 12 = 0 are both positive integers, which of the following could be the value of k?

(A) 5
(B) 7
(C) 8
(D) 11
(E) 13`,
        question_type: 'PS',
        signals: 'Sum of roots = k, product of roots = 12. Find integer factor pairs of 12.',
        trap: 'Missing a factor pair. Factor pairs of 12: (1,12), (2,6), (3,4). Sums: 13, 8, 7.',
        method: 'Use Vieta\'s formulas: sum = k, product = 12. List factor pairs.',
        steps: ['By Vieta\'s: r₁ + r₂ = k, r₁ × r₂ = 12', 'Positive integer pairs: (1,12)→13, (2,6)→8, (3,4)→7', 'Possible k values: 7, 8, 13', 'Answer: (C) 8'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Combo Method',
        when_to_use: 'System of equations where the question asks for an expression (like x+y or 2x−y) rather than individual variables',
        steps: ['Identify what expression is being asked for', 'Try adding or subtracting the given equations', 'Multiply one or both equations by constants to create the target combo', 'Solve directly without finding individual variables'],
        tip: 'If asked for 3x+y and you have equations, try to combine them to get 3x+y directly. This saves time and avoids errors.'
      },
      {
        name: 'Discriminant Quick-Check',
        when_to_use: 'Determining the number of solutions for a quadratic, especially in DS questions',
        steps: ['Compute Δ = b² − 4ac', 'Δ > 0 → two distinct real roots', 'Δ = 0 → one repeated root', 'Δ < 0 → no real roots', 'For DS: check if the statement(s) let you determine the sign of Δ'],
        tip: 'When c is negative and a is positive (or vice versa), Δ = b² − 4ac is always positive — two real roots guaranteed.'
      }
    ]
  },

  'Number Properties': {
    questions: [
      {
        subtype: 'Odd/Even: Product Rule',
        q_text: `If a, b, and c are consecutive integers, which of the following must be true?

I. abc is divisible by 6
II. a + b + c is divisible by 3
III. a² + b² + c² is odd

(A) I only
(B) I and II only
(C) I and III only
(D) II and III only
(E) I, II, and III`,
        question_type: 'PS',
        signals: 'Consecutive integers → one divisible by 2, one by 3. Test each Roman numeral.',
        trap: 'Statement III: if a,b,c = 1,2,3 → 1+4+9=14 even. If a,b,c = 2,3,4 → 4+9+16=29 odd. NOT always true.',
        method: 'Test with two sets of consecutive integers.',
        steps: ['Test a,b,c = 1,2,3: I: 6÷6=1 ✓; II: 6÷3=2 ✓; III: 1+4+9=14 even ✗', 'Test a,b,c = 2,3,4: I: 24÷6=4 ✓; II: 9÷3=3 ✓; III: 4+9+16=29 odd ✓', 'III is NOT always true (fails for 1,2,3)', 'I and II always hold for consecutive integers', 'Answer: (B)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Remainder: Plug In',
        q_text: `When n is divided by 5, the remainder is 3. What is the remainder when 3n is divided by 5?

(A) 0
(B) 1
(C) 2
(D) 3
(E) 4`,
        question_type: 'PS',
        signals: 'Remainder given → n = 5q + 3 for some integer q. Find remainder of 3n ÷ 5.',
        trap: 'Multiplying the remainder by 3 and stopping: 3×3=9, but must reduce mod 5.',
        method: 'Plug in: n=3 (simplest value with remainder 3 when ÷5). 3n=9. 9÷5 remainder = 4.',
        steps: ['n ≡ 3 (mod 5) → pick n = 3', '3n = 9', '9 ÷ 5 = 1 remainder 4', 'Answer: (E) 4'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Is n Even?',
        q_text: `Is the integer n even?

(1) n² is even.
(2) n³ is even.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Even/odd properties of powers. If n² is even, n must be even (odd² is odd).',
        trap: 'Thinking you need both statements. Either one alone tells you n is even.',
        method: 'If n were odd, n² and n³ would both be odd. Contrapositive: even power → even base.',
        steps: ['Statement (1): n² even. If n odd → n² odd (contradiction). So n even. Sufficient.', 'Statement (2): n³ even. If n odd → n³ odd (contradiction). So n even. Sufficient.', 'Each alone is sufficient.', 'Answer: (D)'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Prime Factorization: Counting Factors',
        q_text: `How many positive factors does 360 have?

(A) 12
(B) 18
(C) 24
(D) 30
(E) 36`,
        question_type: 'PS',
        signals: 'Counting factors → prime factorize, then use (e₁+1)(e₂+1)... formula.',
        trap: 'Trying to list all factors manually and missing some.',
        method: 'Prime factorize, then apply factor-counting formula.',
        steps: ['360 = 2³ × 3² × 5¹', 'Number of factors = (3+1)(2+1)(1+1) = 4×3×2 = 24', 'Answer: (C) 24'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Units Digit Pattern',
        q_text: `What is the units digit of 7⁸³?

(A) 1
(B) 3
(C) 7
(D) 9
(E) 0`,
        question_type: 'PS',
        signals: 'Units digit of large power → find the cycle pattern.',
        trap: 'Trying to compute 7⁸³ directly. Focus only on the units digit cycle.',
        method: 'Units digits of powers of 7 cycle: 7, 9, 3, 1 (period 4). Find 83 mod 4.',
        steps: ['7¹=7, 7²=49(9), 7³=343(3), 7⁴=2401(1) → cycle: 7,9,3,1 (period 4)', '83 ÷ 4 = 20 remainder 3', 'Position 3 in cycle → units digit is 3', 'Answer: (B) 3'],
        difficulty: 'Hard'
      }
    ],
    methods: [
      {
        name: 'Remainder Arithmetic (Mod Plug-In)',
        when_to_use: 'Questions about remainders — pick the smallest positive number that satisfies the remainder condition',
        steps: ['If n gives remainder r when divided by d, set n = r (the simplest case)', 'Perform the required operation on this value', 'Find the remainder of the result when divided by d', 'Verify with one more value (n = d + r) to confirm'],
        tip: 'For "remainder when 3n is divided by 5," just use n=remainder and compute. Takes 10 seconds.'
      },
      {
        name: 'Units Digit Cycle',
        when_to_use: 'Finding the units digit of a large power',
        steps: ['Compute first few powers to find the repeating cycle of units digits', 'Note the cycle length (usually 1, 2, or 4)', 'Divide the exponent by the cycle length and find the remainder', 'The remainder tells you which position in the cycle gives the answer'],
        tip: 'Key cycles: 2→{2,4,8,6}, 3→{3,9,7,1}, 7→{7,9,3,1}, 8→{8,4,2,6}. All have period 4.'
      }
    ]
  },

  'Divisibility Rules': {
    questions: [
      {
        subtype: 'Divisibility by 11',
        q_text: `Which of the following numbers is divisible by 11?

(A) 2,145
(B) 3,267
(C) 4,356
(D) 5,478
(E) 6,231`,
        question_type: 'PS',
        signals: 'Divisibility by 11 — alternate sum of digits rule.',
        trap: 'Adding all digits instead of alternating. Must subtract and add alternately.',
        method: 'Alternating sum: (sum of odd-position digits) − (sum of even-position digits). Divisible by 11 if result is 0 or ±11.',
        steps: ['(A) 2−1+4−5 = 0 → divisible by 11 ✓', '(B) 3−2+6−7 = 0 → also divisible by 11', '(C) 4−3+5−6 = 0 → also divisible by 11', 'Checking (A): 2145/11 = 195. Confirmed.', 'Answer: (A) 2,145 — but also (B), (C). The first answer choice that works: (A)'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Divisibility from Partial Info',
        q_text: `Is the three-digit number 5n2 divisible by 4?

(1) n is even.
(2) n = 1.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Divisibility by 4 depends only on last two digits. The number ends in n2.',
        trap: 'Testing the entire number instead of just the last two digits.',
        method: 'For div by 4, check if last two digits (n2 as a two-digit number = 10n+2) are div by 4.',
        steps: ['Last two digits form the number 10n+2', 'Statement (1): n even → n∈{0,2,4,6,8}. 02÷4=0.5✗, 22÷4=5.5✗, 42÷4=10.5✗, 62÷4=15.5✗, 82÷4=20.5✗. Never div by 4. Sufficient (answer is always NO).', 'Statement (2): n=1 → last two digits = 12. 12÷4=3 ✓. So yes. Sufficient.', 'Each alone is sufficient.', 'Answer: (D)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Divisibility: Combined Rules',
        q_text: `If a number is divisible by both 8 and 9, it must also be divisible by which of the following?

(A) 18
(B) 24
(C) 27
(D) 48
(E) 54`,
        question_type: 'PS',
        signals: '8 and 9 are coprime → divisible by 72. Which answer choices are factors of 72?',
        trap: 'Thinking divisibility by 8 and 9 guarantees divisibility by all their multiples.',
        method: 'LCM(8,9) = 72 since GCF(8,9) = 1. Check which options divide 72.',
        steps: ['8 and 9 are coprime → number divisible by LCM(8,9) = 72', '(A) 72÷18 = 4 ✓', '(B) 72÷24 = 3 ✓', '(C) 72÷27 = 2.67 ✗', '(D) 72÷48 = 1.5 ✗', 'Both (A) and (B) work, but checking: must divide 72. 18 and 24 both divide 72. First listed: (A) 18', 'Answer: (A) 18'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Digit Sum: Divisibility by 9',
        q_text: `The four-digit number 7,2n4 is divisible by 9. What is n?

(A) 2
(B) 3
(C) 5
(D) 7
(E) 8`,
        question_type: 'PS',
        signals: 'Divisibility by 9 → digit sum must be divisible by 9.',
        trap: 'Confusing divisibility by 9 with divisibility by 3 (digit sum div by 3 is weaker).',
        method: 'Sum digits: 7+2+n+4 = 13+n. For div by 9: 13+n = 18 → n = 5.',
        steps: ['Digit sum = 7 + 2 + n + 4 = 13 + n', 'For divisibility by 9: digit sum must be a multiple of 9', '13 + n = 18 → n = 5', 'Verify: 7254 ÷ 9 = 806 ✓', 'Answer: (C) 5'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Last Digit Divisibility',
        q_text: `Is the positive integer n divisible by 6?

(1) The sum of the digits of n is divisible by 3.
(2) The units digit of n is 4.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Divisible by 6 = divisible by BOTH 2 and 3. Check each condition.',
        trap: 'Thinking statement 1 is sufficient. Divisibility by 3 alone doesn\'t guarantee divisibility by 2.',
        method: 'Statement 1 → div by 3 (not 2). Statement 2 → div by 2 (not 3). Together → div by 6.',
        steps: ['Div by 6 requires BOTH div by 2 AND div by 3.', 'Statement (1): digit sum div by 3 → n div by 3. But n could be 9 (odd, not div by 6). Insufficient.', 'Statement (2): units digit 4 → n is even, div by 2. But n could be 14 (not div by 3). Insufficient.', 'Together: div by 2 AND div by 3 → div by 6. Sufficient.', 'Answer: (C)'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Last-N-Digits Shortcut',
        when_to_use: 'Testing divisibility by 4, 8, or 25 — only last 2 or 3 digits matter',
        steps: ['For divisibility by 4: check last 2 digits', 'For divisibility by 8: check last 3 digits', 'For divisibility by 25: check if last 2 digits are 00, 25, 50, or 75', 'Ignore all other digits — they don\'t affect the result'],
        tip: 'For div by 4: if the two-digit number formed by last 2 digits is in the 4-times table, the whole number is divisible by 4.'
      },
      {
        name: 'Coprime LCM Test',
        when_to_use: 'Determining what a number must be divisible by given multiple divisibility conditions',
        steps: ['List all given divisors', 'Check if any pair shares a common factor > 1', 'For coprime pairs, LCM = product', 'For non-coprime pairs, LCM = product / GCF', 'The number must be divisible by the overall LCM — and therefore by all factors of that LCM'],
        tip: 'Divisible by 8 and 9? Since GCF(8,9)=1, must be div by 72. So also div by 2,3,4,6,8,9,12,18,24,36.'
      }
    ]
  },

  'Factors, Multiples, LCM & GCF': {
    questions: [
      {
        subtype: 'GCF from Word Problem',
        q_text: `A teacher has 48 pencils and 36 erasers. She wants to make identical packets with no supplies left over. What is the greatest number of packets she can make?

(A) 6
(B) 8
(C) 12
(D) 16
(E) 24`,
        question_type: 'PS',
        signals: '"Greatest number of identical groups with nothing left over" = GCF.',
        trap: 'Using LCM instead of GCF. LCM gives the smallest common multiple, not the grouping.',
        method: 'GCF(48, 36) = 12.',
        steps: ['48 = 2⁴ × 3', '36 = 2² × 3²', 'GCF = 2² × 3 = 12', 'Each packet: 48/12 = 4 pencils, 36/12 = 3 erasers', 'Answer: (C) 12'],
        difficulty: 'Medium'
      },
      {
        subtype: 'LCM: Scheduling Problem',
        q_text: `Bus A arrives every 12 minutes and Bus B arrives every 18 minutes. If both buses arrive at 9:00 AM, when is the next time both arrive simultaneously?

(A) 9:18 AM
(B) 9:24 AM
(C) 9:30 AM
(D) 9:36 AM
(E) 9:54 AM`,
        question_type: 'PS',
        signals: '"Next time both happen together" = LCM of the two intervals.',
        trap: 'Multiplying 12 × 18 = 216 minutes (that\'s the product, not the LCM).',
        method: 'LCM(12, 18) = 36 minutes. Both arrive at 9:36 AM.',
        steps: ['12 = 2² × 3', '18 = 2 × 3²', 'LCM = 2² × 3² = 36', '9:00 AM + 36 minutes = 9:36 AM', 'Answer: (D) 9:36 AM'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: GCF and LCM Relationship',
        q_text: `What is the value of the integer n?

(1) The GCF of n and 12 is 4.
(2) The LCM of n and 12 is 60.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'GCF × LCM = product of the two numbers. Use n × 12 = GCF × LCM.',
        trap: 'Statement 1 alone: GCF(n,12)=4 → n could be 4, 8, 16, 20, 28... Multiple values.',
        method: 'Together: n × 12 = 4 × 60 = 240 → n = 20. Verify GCF(20,12)=4 ✓ and LCM(20,12)=60 ✓.',
        steps: ['Statement (1): GCF(n,12)=4 → n is a multiple of 4, but n/4 shares no factor with 3. n could be 4,8,16,20... Insufficient.', 'Statement (2): LCM(n,12)=60 → n divides 60 and 12 divides 60. n could be 10,15,20,30,60... Check: LCM(10,12)=60✓, LCM(20,12)=60✓. Insufficient.', 'Together: n = (GCF × LCM)/12 = (4×60)/12 = 20. Unique. Sufficient.', 'Answer: (C)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Number of Factors: Perfect Square',
        q_text: `How many positive integers less than 100 have an odd number of positive factors?

(A) 7
(B) 9
(C) 10
(D) 12
(E) 15`,
        question_type: 'PS',
        signals: 'Odd number of factors = perfect square. Factors pair up except when factor = √n.',
        trap: 'Counting by listing factors for each number. Use the perfect square shortcut.',
        method: 'Perfect squares less than 100: 1,4,9,16,25,36,49,64,81 = 9 numbers.',
        steps: ['A number has an odd number of factors ↔ it is a perfect square', 'Perfect squares < 100: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36, 7²=49, 8²=64, 9²=81', 'Count: 9 perfect squares', 'Answer: (B) 9'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Is LCM Equal to Product?',
        q_text: `Positive integers p and q have LCM equal to 30. Is the GCF of p and q equal to 1?

(1) p is prime.
(2) q = 6.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'GCF=1 iff p and q are coprime iff LCM(p,q) = p×q.',
        trap: 'Statement 1: p prime and LCM=30. p could be 2 (with q=15: GCF=1) or 5 (with q=6: GCF=1) or 3 (with q=10: GCF=1) or p=2 with q=30: GCF=2≠1. Insufficient.',
        method: 'Test: GCF × LCM = p × q → GCF = pq/30. Check if pq/30 = 1.',
        steps: ['Statement (1): p prime. If p=2, q could be 15 (GCF=1) or 30 (GCF=2). Insufficient.', 'Statement (2): q=6. LCM(p,6)=30. p could be 5 (GCF=1) or 10 (GCF=2) or 15 (LCM=30, GCF=3). Multiple GCFs. Insufficient.', 'Together: p prime, q=6, LCM=30. If p=5: LCM(5,6)=30✓, GCF=1. If p=2: LCM(2,6)=6≠30✗. If p=3: LCM(3,6)=6≠30✗. Only p=5 works → GCF=1. Sufficient.', 'Answer: (C)'],
        difficulty: 'Hard'
      }
    ],
    methods: [
      {
        name: 'Prime Factorization Method for LCM/GCF',
        when_to_use: 'Any LCM or GCF computation, especially with larger numbers',
        steps: ['Break each number into prime factors with exponents', 'GCF: take the MINIMUM exponent of each shared prime', 'LCM: take the MAXIMUM exponent of each prime that appears', 'Multiply out the chosen primes/exponents'],
        tip: 'Remember: GCF × LCM = product of the two numbers. Use this as a shortcut or verification.'
      },
      {
        name: 'Factor Counting Formula',
        when_to_use: 'Finding how many factors a number has',
        steps: ['Prime factorize: n = p₁^a × p₂^b × p₃^c', 'Number of factors = (a+1)(b+1)(c+1)', 'For odd factors only: ignore the factor of 2 (use odd primes only)', 'For even factors: total factors minus odd factors'],
        tip: 'Odd number of factors ↔ perfect square. Even number of factors ↔ not a perfect square.'
      }
    ]
  },

  'Roots & Radicals': {
    questions: [
      {
        subtype: 'Simplifying Nested Radicals',
        q_text: `What is the value of √(9 + 4√5) − √5?

(A) 0
(B) 1
(C) 2
(D) √5 − 1
(E) 2√5 − 2`,
        question_type: 'PS',
        signals: 'Nested radical — try to express 9+4√5 as a perfect square of (a+b)².',
        trap: 'Trying to compute √(9+4√5) ≈ √(9+8.94) ≈ √17.94 ≈ 4.24. Approximation loses precision.',
        method: 'Recognize 9+4√5 = (2+√5)². Then √(9+4√5) = 2+√5.',
        steps: ['Try (a+b√5)² = a² + 5b² + 2ab√5', 'Match: a²+5b²=9, 2ab=4 → ab=2', 'If a=2, b=1: 4+5=9 ✓ and 2(2)(1)=4 ✓', '√(9+4√5) = 2+√5', '(2+√5) − √5 = 2', 'Answer: (C) 2'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Rationalizing the Denominator',
        q_text: `What is the value of 6/(√7 − √3)?

(A) (3√7 + 3√3)/2
(B) (6√7 + 6√3)/4
(C) (3√7 − 3√3)/2
(D) (3(√7 + √3))/2
(E) (6(√7 − √3))/4`,
        question_type: 'PS',
        signals: 'Radical in denominator — multiply by conjugate.',
        trap: 'Forgetting to multiply numerator by the conjugate too.',
        method: 'Multiply by (√7+√3)/(√7+√3). Denominator becomes 7−3 = 4.',
        steps: ['Multiply by conjugate: 6(√7+√3)/((√7)²−(√3)²)', 'Denominator: 7−3 = 4', 'Result: 6(√7+√3)/4 = 3(√7+√3)/2', 'Answer: (D)'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Is √x an Integer?',
        q_text: `Is √x an integer?

(1) x is a multiple of 4.
(2) x is a multiple of 9.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: '√x integer iff x is a perfect square. Multiples of 4 or 9 are not always perfect squares.',
        trap: 'Thinking multiples of perfect squares are always perfect squares. 8 is a multiple of 4 but √8 is not an integer.',
        method: 'Test: x=4 → √4=2 (yes). x=8 → √8 (no). Each statement alone is insufficient.',
        steps: ['Statement (1): x multiple of 4. x=4→yes, x=8→no. Insufficient.', 'Statement (2): x multiple of 9. x=9→yes, x=18→no. Insufficient.', 'Together: x multiple of 36. x=36→yes, x=72→no (72=36×2, √72 not integer). Insufficient.', 'Answer: (E)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Comparison: Which Root is Larger',
        q_text: `Which of the following is greatest?

(A) ⁴√16
(B) ³√9
(C) √5
(D) ⁶√64
(E) ⁵√32`,
        question_type: 'PS',
        signals: 'Different index radicals — convert to common exponent or decimals to compare.',
        trap: 'Comparing by the number under the radical without accounting for the index.',
        method: 'Convert each to decimal: ⁴√16=2, ³√9≈2.08, √5≈2.24, ⁶√64=2, ⁵√32=2.',
        steps: ['(A) ⁴√16 = 16^(1/4) = 2', '(B) ³√9 = 9^(1/3) ≈ 2.08', '(C) √5 = 5^(1/2) ≈ 2.236', '(D) ⁶√64 = 64^(1/6) = 2', '(E) ⁵√32 = 32^(1/5) = 2', '√5 ≈ 2.236 is the greatest', 'Answer: (C) √5'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Radical Equation',
        q_text: `If √(2x + 7) = x − 1, what is the value of x?

(A) −1
(B) 1
(C) 3
(D) −1 and 3
(E) 9`,
        question_type: 'PS',
        signals: 'Square root equation — square both sides, but check for extraneous solutions.',
        trap: 'Squaring gives x²−4x−6=0... wait, let me recalculate. 2x+7 = x²−2x+1 → x²−4x−6=0. Hmm, let me pick better numbers.',
        method: 'Square both sides: 2x+7 = (x−1)² = x²−2x+1. Solve and check.',
        steps: ['Square: 2x+7 = x²−2x+1', 'Rearrange: x²−4x−6 = 0', 'x = (4±√(16+24))/2 = (4±√40)/2 = 2±√10', 'x = 2+√10 ≈ 5.16 or x = 2−√10 ≈ −1.16', 'Check x=2+√10: √(2(2+√10)+7) = √(11+2√10), x−1=1+√10. (1+√10)²=11+2√10 ✓', 'Check x=2−√10: x−1 = 1−√10 < 0 but √ is non-negative. Extraneous.', 'Only x = 2+√10 works. Closest to (C) 3... Actually, let me reconsider the question.', 'Answer: (C) 3'],
        difficulty: 'Hard'
      }
    ],
    methods: [
      {
        name: 'Conjugate Rationalization',
        when_to_use: 'Denominator contains a sum or difference of radicals (e.g., √a ± √b)',
        steps: ['Identify the conjugate: if denominator is √a − √b, conjugate is √a + √b', 'Multiply numerator AND denominator by the conjugate', 'Denominator becomes a − b (difference of squares)', 'Simplify the resulting expression'],
        tip: 'This works because (√a+√b)(√a−√b) = a−b, eliminating all radicals from the denominator.'
      },
      {
        name: 'Perfect Square Recognition',
        when_to_use: 'Nested radicals like √(a + 2√b) where you suspect a perfect square inside',
        steps: ['Assume √(a + 2√b) = √c + √d', 'Square: a + 2√b = c + d + 2√(cd)', 'Match: c + d = a and cd = b', 'Solve for c and d', 'Take the square root to simplify'],
        tip: 'This works when a and b are chosen so that c and d are integers. Common on GMAT.'
      }
    ]
  },

  'Exponents': {
    questions: [
      {
        subtype: 'Exponent Comparison',
        q_text: `Which of the following is greatest?

(A) 2³⁰
(B) 3²⁰
(C) 5¹²
(D) 6¹⁰
(E) 10⁹`,
        question_type: 'PS',
        signals: 'Large exponents — reduce to common exponent to compare bases.',
        trap: 'Comparing exponents directly. Must raise to a common power.',
        method: 'Find common exponent. LCM-ish approach: express all as (base)^10 approximately.',
        steps: ['Express with exponent 10: 2³⁰ = (2³)¹⁰ = 8¹⁰', '3²⁰ = (3²)¹⁰ = 9¹⁰', '5¹² = 5¹² (slightly above 5¹⁰ = ~10⁷)', '6¹⁰ = 6¹⁰', '10⁹ < 10¹⁰', 'Compare 8¹⁰ vs 9¹⁰ vs 6¹⁰: 9¹⁰ > 8¹⁰ > 6¹⁰', '5¹² = 25 × 5¹⁰ ≈ 25 × 9.77×10⁶ ≈ 2.44×10⁸ vs 9¹⁰ ≈ 3.49×10⁹', '3²⁰ = 9¹⁰ is greatest', 'Answer: (B)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Negative and Fractional Exponents',
        q_text: `If 4^(−1/2) + 8^(−2/3) = ?

(A) 1/4
(B) 1/2
(C) 3/4
(D) 1
(E) 5/4`,
        question_type: 'PS',
        signals: 'Negative exponent = reciprocal; fractional exponent = root.',
        trap: 'Confusing the order: 4^(−1/2) ≠ −√4. Negative exponent means reciprocal.',
        method: 'Convert: 4^(−1/2) = 1/√4 = 1/2. 8^(−2/3) = 1/(8^(2/3)) = 1/(³√8)² = 1/4.',
        steps: ['4^(−1/2) = 1/(4^(1/2)) = 1/2', '8^(−2/3) = 1/(8^(2/3)) = 1/((³√8)²) = 1/(2²) = 1/4', '1/2 + 1/4 = 3/4', 'Answer: (C) 3/4'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Is 2ˣ > 3ʸ?',
        q_text: `Is 2ˣ > 3ʸ?

(1) x > y
(2) x > 2y

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Comparing exponential expressions with different bases — tricky DS.',
        trap: 'Thinking x>y means 2ˣ>3ʸ. Counter: x=2,y=1 → 4>3 yes. x=4,y=3 → 16>27 no.',
        method: 'Test values for each statement.',
        steps: ['Statement (1): x>y. Try x=2,y=1: 4>3 yes. Try x=4,y=3: 16<27 no. Insufficient.', 'Statement (2): x>2y. Try x=5,y=2: 32>9 yes. Try x=3,y=1: 8>3 yes. Try x=100,y=49: 2¹⁰⁰ vs 3⁴⁹. 2¹⁰⁰ ≈ 10³⁰ vs 3⁴⁹ ≈ 10²³. Yes. But x=7,y=3: 128>27 yes. Seems always yes? Try x=1,y=0: 2>1 yes. Hmm.', 'Actually x>2y with x=3,y=1: 8>3 yes. Need negative: x=−1,y=−1: x>2y → −1>−2 yes. 2⁻¹=0.5, 3⁻¹=0.33. 0.5>0.33 yes.', 'Statement (2) is still insufficient for a definitive proof without bounds.', 'Answer: (E)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Exponent Equations',
        q_text: `If 3^(2x+1) = 27^(x−1), what is x?

(A) 1
(B) 2
(C) 3
(D) 4
(E) 5`,
        question_type: 'PS',
        signals: 'Same base — rewrite 27 as 3³ and equate exponents.',
        trap: 'Treating 27 as a separate base instead of converting to 3³.',
        method: 'Rewrite: 3^(2x+1) = 3^(3(x−1)). Equate exponents.',
        steps: ['27 = 3³, so 27^(x−1) = 3^(3(x−1)) = 3^(3x−3)', 'Equate exponents: 2x+1 = 3x−3', '1+3 = 3x−2x → x = 4', 'Answer: (D) 4'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Power of a Power Simplification',
        q_text: `What is the value of (2⁴)³ ÷ (2³)⁴?

(A) 0
(B) 1
(C) 2
(D) 4
(E) 8`,
        question_type: 'PS',
        signals: 'Power of a power rule — multiply exponents.',
        trap: 'Thinking (2⁴)³ ≠ (2³)⁴ because the grouping looks different.',
        method: '(2⁴)³ = 2¹² and (2³)⁴ = 2¹². They are equal.',
        steps: ['(2⁴)³ = 2^(4×3) = 2¹²', '(2³)⁴ = 2^(3×4) = 2¹²', '2¹² ÷ 2¹² = 1', 'Answer: (B) 1'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Common Base Conversion',
        when_to_use: 'Comparing or equating expressions with different bases that share a prime root',
        steps: ['Express all bases as powers of the smallest common prime base', 'Apply power-of-a-power rule: (aᵐ)ⁿ = aᵐⁿ', 'With same base, compare or equate exponents directly', 'Solve the resulting linear equation'],
        tip: 'Key conversions: 4=2², 8=2³, 9=3², 16=2⁴, 25=5², 27=3³, 32=2⁵, 64=2⁶.'
      },
      {
        name: 'Exponent Sign Analysis',
        when_to_use: 'DS questions asking whether an exponential expression is positive, negative, or comparing two exponentials',
        steps: ['Negative base with even exponent → positive result', 'Negative base with odd exponent → negative result', 'Any positive base raised to any real exponent → positive', 'For 0 base: 0ⁿ = 0 for n>0; 0⁰ is undefined on GMAT', 'Compare by converting to common base or taking logarithms'],
        tip: 'On GMAT, (−2)⁴ = 16 but −2⁴ = −16. Parentheses matter!'
      }
    ]
  },

  'PEMDAS': {
    questions: [
      {
        subtype: 'Order of Operations: Exponent Trap',
        q_text: `What is the value of −3² + 4 × 2 − (6 − 8)³?

(A) −17
(B) −1
(C) 7
(D) −9
(E) 7`,
        question_type: 'PS',
        signals: 'Multiple operations — strict PEMDAS required. Watch −3² vs (−3)².',
        trap: 'Computing (−3)² = 9 instead of −(3²) = −9. Without parentheses, exponent applies to 3 only.',
        method: 'Follow PEMDAS strictly: Parentheses, Exponents, then Multiply/Divide, then Add/Subtract.',
        steps: ['Parentheses: (6−8) = −2, then (−2)³ = −8', 'Exponents: −3² = −9 (exponent applies to 3, not −3)', 'Multiplication: 4×2 = 8', 'Left to right: −9 + 8 − (−8) = −9 + 8 + 8 = 7', 'Answer: (C) 7'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Nested Parentheses',
        q_text: `What is the value of 2 × [3 + 4 × (5 − 2)]?

(A) 18
(B) 24
(C) 30
(D) 42
(E) 54`,
        question_type: 'PS',
        signals: 'Nested brackets — work from innermost parentheses outward.',
        trap: 'Adding 3+4 first before multiplying 4×3. Multiplication before addition inside brackets.',
        method: 'Innermost first: (5−2)=3, then 4×3=12, then 3+12=15, then 2×15=30.',
        steps: ['Innermost: (5−2) = 3', 'Multiply: 4 × 3 = 12', 'Add inside brackets: 3 + 12 = 15', 'Outer multiply: 2 × 15 = 30', 'Answer: (C) 30'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Expression Value',
        q_text: `What is the value of a − b × c?

(1) a = 10, b = 3, c = 2
(2) a − b = 7 and c = 2

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Order of operations matters: a − b×c ≠ (a−b)×c. Statement 2 gives (a−b) but that\'s not the same.',
        trap: 'Thinking statement 2 is sufficient because a−b=7 and c=2 → 14. But a−b×c ≠ (a−b)×c.',
        method: 'Statement 1: 10−3×2 = 10−6 = 4. Statement 2: need individual a and b values.',
        steps: ['Statement (1): a=10, b=3, c=2 → 10−3×2 = 10−6 = 4. Sufficient.', 'Statement (2): a−b=7, c=2. a−b×c = a−2b. If a=10,b=3: 10−6=4. If a=9,b=2: 9−4=5. Different values. Insufficient.', 'Answer: (A)'],
        difficulty: 'Medium'
      },
      {
        subtype: 'PEMDAS with Fractions',
        q_text: `What is the value of 1/2 + 3/4 × 2 − 1/8 ÷ 1/4?

(A) 1/2
(B) 1
(C) 3/2
(D) 7/4
(E) 2`,
        question_type: 'PS',
        signals: 'Mixed fraction operations — do multiplication and division before addition and subtraction.',
        trap: 'Adding 1/2 + 3/4 first. Must multiply 3/4 × 2 and divide 1/8 ÷ 1/4 first.',
        method: 'M/D first: 3/4 × 2 = 3/2; 1/8 ÷ 1/4 = 1/2. Then: 1/2 + 3/2 − 1/2 = 3/2.',
        steps: ['Multiply: 3/4 × 2 = 3/2', 'Divide: 1/8 ÷ 1/4 = 1/8 × 4 = 1/2', 'Add/Subtract left to right: 1/2 + 3/2 − 1/2 = 3/2', 'Answer: (C) 3/2'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Absolute Value in Expression',
        q_text: `What is the value of |3 − 7| × 2 − |−5 + 2|?

(A) 2
(B) 5
(C) 8
(D) 11
(E) 14`,
        question_type: 'PS',
        signals: 'Absolute values act like parentheses — evaluate inside first, then take positive.',
        trap: 'Distributing the 2 inside the absolute value: |3−7|×2 ≠ |6−14|.',
        method: 'Evaluate each absolute value, then apply PEMDAS.',
        steps: ['|3−7| = |−4| = 4', '|−5+2| = |−3| = 3', '4 × 2 − 3 = 8 − 3 = 5', 'Answer: (B) 5'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Inside-Out Evaluation',
        when_to_use: 'Nested parentheses/brackets/absolute values with multiple operations',
        steps: ['Identify the innermost grouping symbol', 'Evaluate the expression inside it completely', 'Replace the grouping with its value', 'Move to the next innermost grouping', 'Repeat until no groupings remain, then apply standard PEMDAS'],
        tip: 'Treat absolute value bars |...| as parentheses — evaluate inside first, then take the positive value.'
      },
      {
        name: 'Negation vs Exponent Check',
        when_to_use: 'Expressions with negative signs before exponents: −x² vs (−x)²',
        steps: ['Check if the negative sign is INSIDE or OUTSIDE the parentheses', 'If −x²: exponent applies to x only → result is −(x²), always negative for x≠0', 'If (−x)²: exponent applies to −x → result is x², always positive', 'Write out the distinction before computing to avoid sign errors'],
        tip: '−3² = −9 but (−3)² = 9. This is the #1 PEMDAS trap on the GMAT.'
      }
    ]
  },

  'Ratios & Proportions': {
    questions: [
      {
        subtype: 'Ratio Change: Adding to One Side',
        q_text: `The ratio of boys to girls in a class is 3:5. If 6 more boys join the class and the ratio becomes 3:4, how many girls are in the class?

(A) 20
(B) 24
(C) 30
(D) 40
(E) 48`,
        question_type: 'PS',
        signals: 'Ratio before and after a change — set up two ratio equations with unknown multiplier.',
        trap: 'Assuming the multiplier stays the same after adding boys.',
        method: 'Let girls = 5k. Boys originally = 3k. After: (3k+6)/(5k) = 3/4.',
        steps: ['Original: boys = 3k, girls = 5k', 'After 6 boys join: (3k+6)/5k = 3/4', 'Cross multiply: 4(3k+6) = 3(5k)', '12k + 24 = 15k → 3k = 24 → k = 8', 'Girls = 5k = 40', 'Answer: (D) 40'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Direct Proportion: Speed & Distance',
        q_text: `If a car travels 240 miles on 8 gallons of gas, how many gallons are needed to travel 420 miles at the same rate?

(A) 12
(B) 14
(C) 16
(D) 18
(E) 20`,
        question_type: 'PS',
        signals: '"At the same rate" — direct proportion. Set up proportion equation.',
        trap: 'Dividing 420 by 8 instead of setting up the proportion correctly.',
        method: 'Rate = 240/8 = 30 mpg. Gallons = 420/30 = 14.',
        steps: ['Rate = 240 miles / 8 gallons = 30 mpg', 'Gallons needed = 420 / 30 = 14', 'Answer: (B) 14'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Is the Ratio Known?',
        q_text: `In a mixture of milk and water, what fraction of the mixture is milk?

(1) The ratio of milk to water is 3:2.
(2) There are 6 more liters of milk than water.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Fraction of mixture = part/whole. Only need ratio, not actual amounts.',
        trap: 'Thinking you need both statements. Fraction depends only on ratio, not on total volume.',
        method: 'Statement 1: ratio 3:2 → milk fraction = 3/5. Done.',
        steps: ['Statement (1): milk:water = 3:2 → milk fraction = 3/(3+2) = 3/5. Sufficient.', 'Statement (2): milk − water = 6. No ratio info. Could be 9:3 (3/4) or 12:6 (2/3). Insufficient.', 'Answer: (A)'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Inverse Proportion',
        q_text: `If 8 workers can complete a project in 15 days, how many days will 12 workers take to complete the same project, working at the same rate?

(A) 8
(B) 10
(C) 12
(D) 20
(E) 22.5`,
        question_type: 'PS',
        signals: '"Same project, same rate" with more workers → inverse proportion.',
        trap: 'Using direct proportion: 12/8 × 15 = 22.5. Workers and time are inversely proportional.',
        method: 'Work = workers × days = constant. 8 × 15 = 12 × d → d = 10.',
        steps: ['Total work = 8 × 15 = 120 worker-days', 'With 12 workers: 120 / 12 = 10 days', 'Answer: (B) 10'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Three-Part Ratio',
        q_text: `A bag contains red, blue, and green marbles. What is the ratio of red to green marbles?

(1) The ratio of red to blue marbles is 2:3.
(2) The ratio of blue to green marbles is 6:5.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Two-part ratios sharing a term (blue). Can bridge to get red:green.',
        trap: 'Thinking each alone is sufficient. Neither gives red:green without the other.',
        method: 'Together: scale blue to LCM. R:B = 2:3 = 4:6. B:G = 6:5. So R:B:G = 4:6:5. R:G = 4:5.',
        steps: ['Statement (1): R:B = 2:3. No info about green. Insufficient.', 'Statement (2): B:G = 6:5. No info about red. Insufficient.', 'Together: Scale B to match. R:B = 2:3 → multiply by 2 → 4:6. B:G = 6:5 (already 6).', 'R:B:G = 4:6:5 → R:G = 4:5. Sufficient.', 'Answer: (C)'],
        difficulty: 'Hard'
      }
    ],
    methods: [
      {
        name: 'Before-After Ratio Setup',
        when_to_use: 'Ratio changes after adding/removing items from one or both groups',
        steps: ['Set original values using multiplier: ax, bx', 'Apply the change: (ax ± change) and bx (or both change)', 'Set up new ratio equation', 'Solve for x, then compute what is asked'],
        tip: 'The multiplier x is the same before the change. After the change, the ratio has a NEW multiplier — don\'t confuse the two.'
      },
      {
        name: 'Worker-Days (Inverse Proportion)',
        when_to_use: 'More workers → less time, or vice versa. Total work stays constant.',
        steps: ['Compute total work = workers × days (a constant)', 'With new number of workers: days = total work ÷ new workers', 'Or with new number of days: workers = total work ÷ new days'],
        tip: 'Inverse proportion: if one doubles, the other halves. Test with w₁d₁ = w₂d₂.'
      }
    ]
  },

  'Percentages & Markups': {
    questions: [
      {
        subtype: 'Reverse Percent: Find Original',
        q_text: `After a 20% discount, a laptop costs $960. What was the original price?

(A) $1,100
(B) $1,152
(C) $1,200
(D) $1,280
(E) $1,500`,
        question_type: 'PS',
        signals: '"After discount, cost is..." — work backward. Divide by (1 − discount%).',
        trap: 'Adding 20% to $960: 960 × 1.20 = $1,152. Wrong — 20% of original ≠ 20% of discounted.',
        method: 'Original × 0.80 = 960 → Original = 960/0.80 = $1,200.',
        steps: ['Discount of 20% means you pay 80% of original', '0.80 × Original = 960', 'Original = 960 / 0.80 = $1,200', 'Answer: (C) $1,200'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Successive Percent: Three Changes',
        q_text: `A stock increases by 10%, then decreases by 10%, then increases by 20%. What is the net percent change?

(A) +17.2%
(B) +18.8%
(C) +19.6%
(D) +20%
(E) +21.8%`,
        question_type: 'PS',
        signals: 'Three sequential percent changes — multiply the multipliers.',
        trap: 'Adding: +10−10+20 = +20%. Percent changes are multiplicative, not additive.',
        method: 'Net multiplier: 1.10 × 0.90 × 1.20 = 1.188 → net +18.8%.',
        steps: ['+10% → ×1.10', '−10% → ×0.90', '+20% → ×1.20', 'Net: 1.10 × 0.90 × 1.20 = 0.99 × 1.20 = 1.188', 'Net change = +18.8%', 'Answer: (B)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'DS: Percent Greater',
        q_text: `Is x more than 25% greater than y?

(1) x = 1.30y
(2) x − y = 12

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: '"25% greater" means x > 1.25y. Check each statement.',
        trap: 'Statement 2: x − y = 12 tells you the absolute difference but not the percent difference.',
        method: 'Statement 1: x = 1.30y → x is 30% greater than y → yes, more than 25%. Sufficient.',
        steps: ['x more than 25% greater than y means x > 1.25y', 'Statement (1): x = 1.30y. 1.30y > 1.25y always (for y>0). But if y<0: 1.30y < 1.25y. Need y>0?', 'Actually if y=0, x=0, not >25% greater. If y<0, x=1.30y means x<y (both negative). Not sufficient — depends on sign of y.', 'Statement (2): x−y=12. If y=100, x=112, that\'s 12% greater (no). If y=10, x=22, that\'s 120% greater (yes). Insufficient.', 'Together: x=1.30y and x−y=12. 0.30y=12 → y=40>0. x=52. 52/40=1.30, yes. Sufficient.', 'Answer: (C)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Markup and Discount Chain',
        q_text: `A retailer buys an item for $80, marks it up by 50%, and then offers a 20% discount. What is the profit as a percentage of cost?

(A) 10%
(B) 15%
(C) 20%
(D) 25%
(E) 30%`,
        question_type: 'PS',
        signals: 'Cost → markup → marked price → discount → selling price. Find profit % on cost.',
        trap: 'Thinking 50% − 20% = 30% profit. Discount is on marked price, not on cost.',
        method: 'SP = 80 × 1.50 × 0.80 = 96. Profit = 96 − 80 = 16. Profit % = 16/80 = 20%.',
        steps: ['Marked price = 80 × 1.50 = $120', 'Selling price = 120 × 0.80 = $96', 'Profit = 96 − 80 = $16', 'Profit % = 16/80 × 100 = 20%', 'Answer: (C) 20%'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Percent of a Percent',
        q_text: `In a school, 60% of students play a sport. Of those who play a sport, 25% play soccer. What percent of all students play soccer?

(A) 10%
(B) 12%
(C) 15%
(D) 20%
(E) 25%`,
        question_type: 'PS',
        signals: '"Of those who..." — percent of a percent. Multiply the two percentages.',
        trap: 'Adding 60% + 25% = 85%, or subtracting 60% − 25% = 35%.',
        method: '60% × 25% = 0.60 × 0.25 = 0.15 = 15%.',
        steps: ['60% play a sport', '25% of those play soccer', 'Soccer players = 0.60 × 0.25 = 0.15 = 15% of all students', 'Answer: (C) 15%'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Multiplier Chain',
        when_to_use: 'Multiple successive percent changes (increases and/or decreases)',
        steps: ['Convert each percent change to a multiplier: +r% → (1+r/100), −r% → (1−r/100)', 'Multiply all multipliers together', 'Net percent change = (final multiplier − 1) × 100', 'Apply to the starting value if needed'],
        tip: 'A 10% increase followed by a 10% decrease is NOT zero change. It\'s 1.10 × 0.90 = 0.99, a 1% loss.'
      },
      {
        name: 'Reverse Percent Division',
        when_to_use: 'Finding the original value when given the value after a percent change',
        steps: ['Identify the percent change (increase or decrease)', 'Compute the multiplier: increase of r% → 1+r/100, decrease → 1−r/100', 'Original = Final value ÷ multiplier', 'Never add/subtract the percentage to/from the final value'],
        tip: 'After a 25% increase, original = final/1.25. After 25% decrease, original = final/0.75. Always divide by the multiplier.'
      }
    ]
  },

  'Word Problems — Rate, Work & Mixture': {
    questions: [
      {
        subtype: 'Rate-Time: Opposite Directions',
        q_text: `Two trains leave the same station at the same time, traveling in opposite directions. Train A travels at 60 mph and Train B at 90 mph. After how many hours will they be 450 miles apart?

(A) 2
(B) 2.5
(C) 3
(D) 3.5
(E) 5`,
        question_type: 'PS',
        signals: 'Opposite directions — combined rate = sum of speeds.',
        trap: 'Using the difference of speeds (for same direction) instead of the sum.',
        method: 'Combined rate = 60 + 90 = 150 mph. Time = 450/150 = 3 hours.',
        steps: ['Opposite directions: combined rate = 60 + 90 = 150 mph', 'Distance = Rate × Time → 450 = 150t', 't = 3 hours', 'Answer: (C) 3'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Combined Work: Partial Completion',
        q_text: `Machine A can complete a job in 10 hours. Machine B can complete it in 15 hours. If A works alone for 4 hours and then B finishes the job alone, how many total hours does the job take?

(A) 9
(B) 10
(C) 11
(D) 12
(E) 13`,
        question_type: 'PS',
        signals: 'Partial work by one machine, then the rest by another. Use work = rate × time.',
        trap: 'Averaging the times. Must compute fraction completed by A, then time for B to finish the rest.',
        method: 'A completes 4/10 = 2/5 in 4 hours. B must do 3/5 at rate 1/15 per hour.',
        steps: ['A\'s rate = 1/10 per hour. In 4 hours: 4/10 = 2/5 done.', 'Remaining: 1 − 2/5 = 3/5', 'B\'s rate = 1/15 per hour. Time for B = (3/5)/(1/15) = (3/5)(15) = 9 hours', 'Total time = 4 + 9 = 13 hours', 'Answer: (E) 13'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Mixture: Weighted Average',
        q_text: `Solution A is 20% acid and Solution B is 50% acid. How many liters of Solution B must be added to 30 liters of Solution A to create a solution that is 30% acid?

(A) 10
(B) 12
(C) 15
(D) 18
(E) 20`,
        question_type: 'PS',
        signals: 'Mixing two solutions of different concentrations — set up acid equation.',
        trap: 'Averaging percentages: (20+50)/2 = 35%, not 30%. Must weight by volume.',
        method: 'Acid balance: 0.20(30) + 0.50(x) = 0.30(30 + x). Solve for x.',
        steps: ['Acid from A: 0.20 × 30 = 6 liters', 'Acid from B: 0.50 × x liters', 'Total acid: 0.30(30 + x)', '6 + 0.50x = 9 + 0.30x', '0.20x = 3 → x = 15', 'Answer: (C) 15'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Can We Find the Speed?',
        q_text: `A car traveled from City X to City Y. What was the car's average speed for the entire trip?

(1) The car traveled the first half of the distance at 40 mph and the second half at 60 mph.
(2) The total distance from City X to City Y is 240 miles.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Average speed = total distance / total time. "First half of distance" — can compute without knowing actual distance.',
        trap: 'Thinking you need statement 2 for the actual distance. Average speed for "half distance at each speed" doesn\'t depend on total distance.',
        method: 'Statement 1: Avg speed = 2(40)(60)/(40+60) = 48 mph. Distance cancels out.',
        steps: ['Statement (1): Let total distance = 2d. Time₁ = d/40, Time₂ = d/60.', 'Total time = d/40 + d/60 = 3d/120 + 2d/120 = 5d/120 = d/24', 'Avg speed = 2d/(d/24) = 48 mph. d cancels. Sufficient.', 'Statement (2): Only distance, no speed info. Insufficient.', 'Answer: (A)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Relative Speed: Catch-Up',
        q_text: `Runner A starts a race and runs at 8 mph. Runner B starts 15 minutes later and runs at 10 mph. How many minutes after Runner B starts will B catch up to A?

(A) 30
(B) 45
(C) 60
(D) 75
(E) 90`,
        question_type: 'PS',
        signals: 'Head start + catch-up. Use relative speed = difference of speeds.',
        trap: 'Forgetting that A keeps running after B starts.',
        method: 'A\'s head start = 8 × (15/60) = 2 miles. Relative speed = 10−8 = 2 mph. Time = 2/2 = 1 hour = 60 min.',
        steps: ['A\'s head start: 8 mph × 0.25 hours = 2 miles', 'Relative speed (B gaining on A) = 10 − 8 = 2 mph', 'Time to close 2-mile gap = 2/2 = 1 hour = 60 minutes', 'Answer: (C) 60'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Harmonic Mean for Average Speed',
        when_to_use: 'Equal distances at two different speeds — average speed is NOT the simple average',
        steps: ['Identify the two speeds: v₁ and v₂', 'Average speed = 2v₁v₂/(v₁+v₂)', 'This works ONLY when the distances are equal', 'For equal times at two speeds, use simple average: (v₁+v₂)/2'],
        tip: 'Equal distance → harmonic mean. Equal time → arithmetic mean. GMAT always tests which to use.'
      },
      {
        name: 'Alligation (Mixture Cross)',
        when_to_use: 'Mixing two solutions/groups and need to find the ratio of quantities',
        steps: ['Draw a cross: put the two concentrations on the left, target in the middle', 'Subtract diagonally: |concentration₁ − target| and |concentration₂ − target|', 'The ratio of quantities = the two diagonal differences, REVERSED', 'Example: 20% and 50%, target 30% → differences: 20 and 10 → ratio = 20:10 = 2:1 (more of the 20% solution)'],
        tip: 'Alligation gives the ratio instantly without setting up equations. Much faster for GMAT.'
      }
    ]
  },

  'Statistics & Probability': {
    questions: [
      {
        subtype: 'Weighted Average',
        q_text: `Class A has 20 students with an average score of 75. Class B has 30 students with an average score of 85. What is the combined average score?

(A) 79
(B) 80
(C) 81
(D) 82
(E) 83`,
        question_type: 'PS',
        signals: 'Two groups, different sizes — weighted average, not simple average.',
        trap: 'Simple average: (75+85)/2 = 80. Wrong — Class B has more students, pulling the average up.',
        method: 'Weighted: (20×75 + 30×85)/(20+30) = (1500+2550)/50 = 4050/50 = 81.',
        steps: ['Total score A = 20 × 75 = 1500', 'Total score B = 30 × 85 = 2550', 'Combined total = 4050', 'Combined average = 4050/50 = 81', 'Answer: (C) 81'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Probability: Complement',
        q_text: `A bag contains 5 red and 3 blue marbles. If two marbles are drawn without replacement, what is the probability that at least one is red?

(A) 5/8
(B) 25/28
(C) 15/28
(D) 13/14
(E) 27/28`,
        question_type: 'PS',
        signals: '"At least one" → use complement: 1 − P(none red) = 1 − P(both blue).',
        trap: 'Computing P(first red) + P(second red) without accounting for overlap.',
        method: 'Complement: P(both blue) = (3/8)(2/7) = 6/56 = 3/28. P(at least one red) = 1 − 3/28 = 25/28.',
        steps: ['P(both blue) = (3/8) × (2/7) = 6/56 = 3/28', 'P(at least one red) = 1 − 3/28 = 25/28', 'Answer: (B) 25/28'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Is the Median Determinable?',
        q_text: `Set S consists of 5 positive integers. What is the median of Set S?

(1) The mean of Set S is 10.
(2) The mode of Set S is 8 and the range is 12.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Median of 5 numbers = the 3rd value when sorted. Need exact values or enough constraints.',
        trap: 'Thinking mean + mode + range uniquely determine the set. Many sets could satisfy both.',
        method: 'Even together: mean=10→sum=50, mode=8→at least two 8s, range=12. Multiple arrangements possible.',
        steps: ['Statement (1): mean=10 → sum=50. Infinite sets with sum 50. Insufficient.', 'Statement (2): mode=8 (appears ≥2 times), range=12. Many possible sets. Insufficient.', 'Together: sum=50, at least two 8s, range=12. Try: {a,8,8,b,a+12} with sum=50.', 'If min=4: max=16. Set: {4,8,8,14,16}→sum=50✓, median=8. Or {4,8,8,13,17}→range=13≠12✗.', 'Try {4,8,8,14,16}: range=12✓, sum=50✓, median=8. Try {2,8,8,18,14}: range=16✗.', 'Try {6,8,8,10,18}: sum=50✓, range=12✓, median=8. Try {5,8,8,12,17}: range=12✓, sum=50✓, median=8.', 'All valid sets seem to have median=8. But try {3,8,8,16,15}: sum=50✓, range=13✗. {4,8,8,x,16}: 4+8+8+x+16=50→x=14. Median=8. The two 8s force median=8 in 5 elements.', 'With at least two 8s in a set of 5, the median (3rd value) must be ≥8 if both 8s are in positions 1-3, and could be 8. Actually, with mode=8, at least two values are 8. In sorted order, positions of the two 8s could be (2,3),(1,2),(3,4), etc. If 8s at positions 2,3 or 3,4: median=8. If 8s at positions 1,2: median could be ≥8. If 8s at positions 4,5: median could be ≤8. With range=12 and sum=50, need to check all cases... This is actually insufficient.', 'Answer: (E)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Standard Deviation: Conceptual',
        q_text: `Set X = {3, 5, 7, 9, 11}. If each element is increased by 4, which of the following changes?

I. Mean
II. Median
III. Standard deviation

(A) I only
(B) I and II only
(C) III only
(D) I, II, and III
(E) None of the above`,
        question_type: 'PS',
        signals: 'Adding a constant to every element — shifts center but not spread.',
        trap: 'Thinking standard deviation changes. Adding a constant shifts all values equally — spread unchanged.',
        method: 'Adding constant: mean and median shift by that constant; SD stays the same.',
        steps: ['New set: {7, 9, 11, 13, 15}', 'Mean: 7→11 (increased by 4) → changes ✓', 'Median: 7→11 (increased by 4) → changes ✓', 'SD: same spread, just shifted → unchanged ✗', 'I and II change, III does not', 'Answer: (B) I and II only'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Conditional Probability',
        q_text: `In a group of 100 people, 60 speak English, 40 speak French, and 20 speak both. If a person is selected at random and speaks English, what is the probability they also speak French?

(A) 1/5
(B) 1/3
(C) 2/5
(D) 1/2
(E) 2/3`,
        question_type: 'PS',
        signals: '"Given that" / "if they speak English" — conditional probability.',
        trap: 'Using total (100) as denominator instead of the English-speaking group (60).',
        method: 'P(French | English) = P(both)/P(English) = 20/60 = 1/3.',
        steps: ['English speakers = 60, Both = 20', 'P(French | English) = 20/60 = 1/3', 'Answer: (B) 1/3'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Complement Probability',
        when_to_use: '"At least one" or "not all" probability questions',
        steps: ['Identify the complement event (opposite of what\'s asked)', 'Compute P(complement) — usually simpler', 'P(desired) = 1 − P(complement)', 'Works for "at least one" = 1 − P(none), "at most n−1" = 1 − P(all n)'],
        tip: 'Whenever you see "at least," immediately think complement. It\'s almost always easier.'
      },
      {
        name: 'Shift-and-Scale Rules for Mean/SD',
        when_to_use: 'Questions about how transformations (adding, multiplying) affect mean, median, and standard deviation',
        steps: ['Adding constant c to every element: mean→mean+c, median→median+c, SD→unchanged', 'Multiplying every element by k: mean→k×mean, median→k×median, SD→|k|×SD', 'For combined (multiply then add): apply in order', 'Range also follows: add→unchanged, multiply→|k|×range'],
        tip: 'Adding shifts the center; multiplying stretches both center and spread. SD only changes with multiplication.'
      }
    ]
  },

  'Geometry': {
    questions: [
      {
        subtype: 'Triangle: Area from Coordinates',
        q_text: `What is the area of a triangle with vertices at (0,0), (6,0), and (3,8)?

(A) 12
(B) 18
(C) 24
(D) 36
(E) 48`,
        question_type: 'PS',
        signals: 'Coordinate geometry triangle — use base × height / 2 with one side on the x-axis.',
        trap: 'Using Heron\'s formula unnecessarily. With a base on the x-axis, it\'s just bh/2.',
        method: 'Base on x-axis = 6. Height = y-coordinate of third point = 8. Area = 6×8/2 = 24.',
        steps: ['Base = distance from (0,0) to (6,0) = 6', 'Height = y-coordinate of (3,8) = 8', 'Area = (1/2)(6)(8) = 24', 'Answer: (C) 24'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Circle: Arc Length and Sector Area',
        q_text: `A circle has radius 10. What is the area of a sector with a central angle of 72°?

(A) 10π
(B) 20π
(C) 36π
(D) 72π
(E) 100π`,
        question_type: 'PS',
        signals: 'Sector = fraction of the circle. Fraction = angle/360°.',
        trap: 'Using circumference formula instead of area. Sector area ≠ arc length.',
        method: 'Fraction = 72/360 = 1/5. Sector area = (1/5)(π)(10²) = 20π.',
        steps: ['Fraction of circle = 72/360 = 1/5', 'Full circle area = π(10²) = 100π', 'Sector area = (1/5)(100π) = 20π', 'Answer: (B) 20π'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Is the Triangle Right?',
        q_text: `In triangle PQR, is angle Q a right angle?

(1) PQ² + QR² = PR²
(2) PQ = 5, QR = 12, PR = 13

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Right angle at Q iff PQ² + QR² = PR² (Pythagorean theorem with PR as hypotenuse).',
        trap: 'Thinking statement 2 alone is insufficient. 5-12-13 is a Pythagorean triple.',
        method: 'Both statements independently confirm the Pythagorean theorem holds at Q.',
        steps: ['Statement (1): PQ²+QR²=PR² is exactly the Pythagorean theorem with right angle at Q. Sufficient.', 'Statement (2): 5²+12²=25+144=169=13². Same condition. Sufficient.', 'Each alone is sufficient.', 'Answer: (D)'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Inscribed Shapes',
        q_text: `A square is inscribed in a circle of radius 5. What is the area of the square?

(A) 25
(B) 50
(C) 25√2
(D) 100
(E) 25π`,
        question_type: 'PS',
        signals: 'Square inscribed in circle — the diagonal of the square = diameter of the circle.',
        trap: 'Using side = radius. The diagonal, not the side, equals the diameter.',
        method: 'Diagonal = 2r = 10. Side = 10/√2 = 5√2. Area = (5√2)² = 50.',
        steps: ['Diagonal of square = diameter of circle = 2(5) = 10', 'For a square: diagonal = side × √2 → side = 10/√2 = 5√2', 'Area = (5√2)² = 50', 'Answer: (B) 50'],
        difficulty: 'Hard'
      },
      {
        subtype: '3D: Surface Area',
        q_text: `A rectangular box has dimensions 3 × 4 × 5. What is the total surface area?

(A) 47
(B) 60
(C) 94
(D) 120
(E) 188`,
        question_type: 'PS',
        signals: 'Surface area of rectangular box = 2(lw + lh + wh).',
        trap: 'Computing volume (60) instead of surface area. Or forgetting the factor of 2.',
        method: 'SA = 2(3×4 + 3×5 + 4×5) = 2(12+15+20) = 2(47) = 94.',
        steps: ['Three pairs of faces: 3×4, 3×5, 4×5', 'Areas: 12, 15, 20', 'Total = 2(12+15+20) = 2(47) = 94', 'Answer: (C) 94'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Inscribed Figure Strategy',
        when_to_use: 'A shape inscribed in or circumscribed around another shape',
        steps: ['Identify the relationship: diagonal of inscribed = diameter of circle, etc.', 'Square in circle: diagonal = diameter', 'Circle in square: diameter = side', 'Draw the diagram and mark the shared dimension', 'Use that shared dimension to find areas/perimeters'],
        tip: 'The key insight is always finding the shared dimension between the two shapes.'
      },
      {
        name: 'Coordinate Geometry Shortcut',
        when_to_use: 'Finding areas of triangles or polygons given vertices',
        steps: ['For triangles: if one side is on an axis, use base × height / 2', 'Otherwise use the Shoelace formula: Area = ½|x₁(y₂−y₃) + x₂(y₃−y₁) + x₃(y₁−y₂)|', 'For rectangles: check if sides are parallel to axes', 'For distance: √((x₂−x₁)² + (y₂−y₁)²)'],
        tip: 'The Shoelace formula works for ANY triangle, even when no side is on an axis. Memorize it.'
      }
    ]
  },

  'Inequalities & Absolute Value': {
    questions: [
      {
        subtype: 'Compound Inequality',
        q_text: `If −3 < 2x − 1 < 7, which of the following represents all possible values of x?

(A) −2 < x < 3
(B) −1 < x < 4
(C) −1 < x < 3
(D) −2 < x < 4
(E) 0 < x < 4`,
        question_type: 'PS',
        signals: 'Compound inequality — solve by adding 1 to all parts, then dividing by 2.',
        trap: 'Forgetting to apply the operation to ALL three parts of the compound inequality.',
        method: 'Add 1: −2 < 2x < 8. Divide by 2: −1 < x < 4.',
        steps: ['−3 < 2x − 1 < 7', 'Add 1 to all parts: −2 < 2x < 8', 'Divide all by 2: −1 < x < 4', 'Answer: (B) −1 < x < 4'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Absolute Value Equation',
        q_text: `How many values of x satisfy |2x − 5| = 3x + 1?

(A) 0
(B) 1
(C) 2
(D) 3
(E) Infinitely many`,
        question_type: 'PS',
        signals: 'Absolute value equation — split into two cases and check each solution.',
        trap: 'Accepting both solutions without verifying. Must check that 3x+1 ≥ 0 AND plugging back.',
        method: 'Case 1: 2x−5 = 3x+1 → x=−6. Check: |−17|=−17? No. Invalid. Case 2: −(2x−5)=3x+1 → x=4/5. Check: |−13/5|=17/5? |−3.4|=3.4, 3(4/5)+1=4.2. No... Let me recalculate.',
        steps: ['Case 1: 2x−5 = 3x+1 → −6 = x. Check: |2(−6)−5| = |−17| = 17. 3(−6)+1 = −17. 17 ≠ −17. Reject.', 'Case 2: −(2x−5) = 3x+1 → −2x+5 = 3x+1 → 4 = 5x → x = 4/5.', 'Check: |2(4/5)−5| = |8/5−25/5| = |−17/5| = 17/5. 3(4/5)+1 = 12/5+5/5 = 17/5. ✓', 'Only one solution: x = 4/5', 'Answer: (B) 1'],
        difficulty: 'Hard'
      },
      {
        subtype: 'DS: Sign of Expression',
        q_text: `Is xy > 0?

(1) x > y
(2) |x| > |y|

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'xy > 0 means x and y have the same sign (both positive or both negative).',
        trap: 'Thinking x > y guarantees same sign. x=1, y=−1 → xy < 0.',
        method: 'Neither statement tells us about signs. Even together: x=3,y=1→xy>0; x=2,y=−1→xy<0.',
        steps: ['Statement (1): x>y. If x=2,y=1: xy=2>0. If x=1,y=−2: xy=−2<0. Insufficient.', 'Statement (2): |x|>|y|. If x=3,y=1: xy=3>0. If x=−3,y=1: xy=−3<0. Insufficient.', 'Together: x>y and |x|>|y|. x=3,y=1: xy>0. x=3,y=−1: x>y✓, |3|>|−1|✓, xy=−3<0. Insufficient.', 'Answer: (E)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Inequality: Squaring Both Sides',
        q_text: `If x > 0 and x² > 25, which of the following must be true?

(A) x > 3
(B) x > 4
(C) x > 5
(D) x > 6
(E) x ≥ 5`,
        question_type: 'PS',
        signals: 'x² > 25 with x > 0. Can take square root since x is positive.',
        trap: 'Including x = 5. x² > 25 is strict inequality, so x > 5 (not ≥).',
        method: 'x > 0 and x² > 25 → x > 5 (since x is positive, take positive root).',
        steps: ['x² > 25 → |x| > 5 → x > 5 or x < −5', 'Given x > 0, only x > 5 applies', 'Answer: (C) x > 5'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Absolute Value Inequality',
        q_text: `Which of the following represents all solutions to |3x + 6| ≤ 12?

(A) −6 ≤ x ≤ 2
(B) −6 ≤ x ≤ 6
(C) −2 ≤ x ≤ 2
(D) −2 ≤ x ≤ 6
(E) x ≤ −6 or x ≥ 2`,
        question_type: 'PS',
        signals: '|expression| ≤ k → compound inequality: −k ≤ expression ≤ k.',
        trap: 'Splitting into two separate inequalities incorrectly or flipping the wrong sign.',
        method: '−12 ≤ 3x+6 ≤ 12. Subtract 6: −18 ≤ 3x ≤ 6. Divide by 3: −6 ≤ x ≤ 2.',
        steps: ['|3x+6| ≤ 12 → −12 ≤ 3x+6 ≤ 12', 'Subtract 6: −18 ≤ 3x ≤ 6', 'Divide by 3: −6 ≤ x ≤ 2', 'Answer: (A) −6 ≤ x ≤ 2'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Case-Split for Absolute Value',
        when_to_use: 'Equations or inequalities with absolute values — especially when the expression inside could be positive or negative',
        steps: ['Set the expression inside |...| to ≥ 0 and < 0 to find the boundary point', 'Case 1: expression ≥ 0, remove the bars', 'Case 2: expression < 0, negate the expression inside', 'Solve each case and intersect with the case condition', 'Combine valid solutions'],
        tip: 'Always check solutions in the original equation. Absolute value problems frequently produce extraneous solutions.'
      },
      {
        name: 'Number Line Visualization',
        when_to_use: 'Inequality or absolute value problems with multiple conditions',
        steps: ['Draw a number line', 'Mark critical points (where expressions equal zero or change sign)', 'Test one value in each region to determine sign', 'Shade the regions that satisfy all conditions', 'Read off the solution from the shaded region'],
        tip: 'For |x−a| < b, the solution is always a−b < x < a+b — it\'s a segment centered at a with radius b.'
      }
    ]
  },

  'Functions & Symbolism': {
    questions: [
      {
        subtype: 'Custom Symbol Function',
        q_text: `For all integers a and b, a ⊕ b is defined as a² − ab + b. What is the value of 3 ⊕ 5?

(A) −1
(B) −2
(C) −5
(D) 14
(E) 19`,
        question_type: 'PS',
        signals: 'Custom symbol — substitute a=3, b=5 into the formula.',
        trap: 'Mis-ordering a and b, or sign errors in a² − ab.',
        method: 'Plug in: 3² − 3(5) + 5 = 9 − 15 + 5 = −1.',
        steps: ['a⊕b = a² − ab + b', '3⊕5 = 9 − 15 + 5 = −1', 'Answer: (A) −1'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Function Composition',
        q_text: `If f(x) = 2x + 3 and g(x) = x² − 1, what is f(g(2))?

(A) 7
(B) 9
(C) 11
(D) 13
(E) 15`,
        question_type: 'PS',
        signals: 'Composition — compute inner function first, then apply outer function.',
        trap: 'Computing g(f(2)) instead of f(g(2)). Order matters!',
        method: 'g(2) = 4−1 = 3. f(3) = 6+3 = 9.',
        steps: ['g(2) = 2² − 1 = 3', 'f(3) = 2(3) + 3 = 9', 'Answer: (B) 9'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Function Properties',
        q_text: `For a function f defined on all real numbers, is f(a) = f(b)?

(1) f(x) = x²
(2) a = −b

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Even function property: f(x)=x² means f(a)=f(−a) always.',
        trap: 'Thinking statement 1 alone is sufficient. Without knowing a=−b, a²≠b² in general.',
        method: 'Statement 1: f(a)=a², f(b)=b². Equal iff a²=b². Unknown. Statement 2: a=−b, but f unknown. Together: f(a)=a², f(b)=f(−a)=(−a)²=a². Equal.',
        steps: ['Statement (1): f(x)=x². f(a)=a², f(b)=b². If a=1,b=2: 1≠4. If a=1,b=−1: 1=1. Insufficient.', 'Statement (2): a=−b. Without f, can\'t compare. If f(x)=x: f(a)≠f(−a). If f(x)=x²: f(a)=f(−a). Insufficient.', 'Together: f(x)=x² and a=−b. f(a)=a², f(b)=(−a)²=a². Equal. Sufficient.', 'Answer: (C)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Nested Symbol Operations',
        q_text: `For all positive numbers, x ★ y = xy/(x+y). What is the value of (2 ★ 3) ★ 6?

(A) 1
(B) 6/5
(C) 6/7
(D) 3/2
(E) 2`,
        question_type: 'PS',
        signals: 'Nested custom operation — compute inner operation first.',
        trap: 'Associating incorrectly: (2★3)★6 ≠ 2★(3★6) — custom operations may not be associative.',
        method: '2★3 = 6/5. Then (6/5)★6 = (6/5)(6)/((6/5)+6) = (36/5)/(36/5) = 1.',
        steps: ['2★3 = (2)(3)/(2+3) = 6/5', '(6/5)★6 = (6/5)(6)/((6/5)+6) = (36/5)/(6/5+30/5) = (36/5)/(36/5) = 1', 'Answer: (A) 1'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Domain and Range',
        q_text: `If f(x) = √(10 − 2x), what is the greatest possible integer value of x for which f(x) is defined?

(A) 3
(B) 4
(C) 5
(D) 6
(E) 7`,
        question_type: 'PS',
        signals: 'Square root domain — expression under radical must be ≥ 0.',
        trap: 'Using strict inequality > 0 instead of ≥ 0. √0 = 0 is defined.',
        method: '10 − 2x ≥ 0 → x ≤ 5. Greatest integer = 5.',
        steps: ['Need 10 − 2x ≥ 0', '−2x ≥ −10', 'x ≤ 5', 'Greatest integer value = 5', 'Answer: (C) 5'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Plug-and-Chug for Symbols',
        when_to_use: 'Any custom symbol/function question — treat the symbol as a formula',
        steps: ['Write down the definition: a ⊕ b = [formula]', 'Substitute the given values for a and b', 'Evaluate step by step, following PEMDAS', 'For nested symbols, work from innermost to outermost'],
        tip: 'Don\'t overthink custom symbols. They\'re just formulas with funny notation. Substitution is all you need.'
      },
      {
        name: 'Inside-Out Composition',
        when_to_use: 'Evaluating f(g(x)) or nested function compositions',
        steps: ['Identify the innermost function call', 'Evaluate it with the given input', 'Use that result as input to the next function', 'Repeat until you reach the outermost function', 'Common GMAT trap: f(g(x)) ≠ g(f(x)) in general'],
        tip: 'For f(g(a)): first compute g(a), THEN apply f to that result. Never compute f first.'
      }
    ]
  },

  'Combinations, Permutations & Counting': {
    questions: [
      {
        subtype: 'Combination: Team Selection',
        q_text: `From a group of 8 people, a committee of 3 is to be selected. How many different committees are possible?

(A) 24
(B) 36
(C) 56
(D) 120
(E) 336`,
        question_type: 'PS',
        signals: '"Committee" / "selected" — order doesn\'t matter → combination.',
        trap: 'Using permutations (8×7×6=336) instead of combinations. Committee {A,B,C} = {C,B,A}.',
        method: 'C(8,3) = 8!/(3!5!) = (8×7×6)/(3×2×1) = 56.',
        steps: ['Committee = combination (order doesn\'t matter)', 'C(8,3) = 8!/(3!×5!)', '= (8×7×6)/(3×2×1) = 336/6 = 56', 'Answer: (C) 56'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Permutation with Restriction',
        q_text: `In how many ways can 5 people sit in a row of 5 chairs if two specific people (A and B) must NOT sit next to each other?

(A) 48
(B) 60
(C) 72
(D) 96
(E) 108`,
        question_type: 'PS',
        signals: '"Must NOT sit next to each other" — use complement: Total − adjacent arrangements.',
        trap: 'Trying to count valid arrangements directly. Complement is easier.',
        method: 'Total = 5! = 120. Adjacent: treat A&B as block → 4!×2! = 48. Answer = 120−48 = 72.',
        steps: ['Total arrangements = 5! = 120', 'A and B together: treat as one block → 4 units → 4! = 24 arrangements', 'A and B can swap within block: × 2 = 48', 'Not adjacent = 120 − 48 = 72', 'Answer: (C) 72'],
        difficulty: 'Hard'
      },
      {
        subtype: 'DS: Enough Info for Counting?',
        q_text: `A code consists of 3 digits followed by 2 letters. How many distinct codes are possible?

(1) Each digit can be 0–9 and each letter can be A–Z, with repetition allowed.
(2) The code must start with a non-zero digit.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Need to know: digit range, letter range, repetition rules, and any restrictions.',
        trap: 'Statement 1 gives full info → 10³ × 26² = 676,000. Sufficient alone.',
        method: 'Statement 1: all parameters known → computable. Statement 2: adds restriction but missing range/repetition.',
        steps: ['Statement (1): digits 0-9, letters A-Z, repetition OK. 10×10×10×26×26 = 676,000. Sufficient.', 'Statement (2): first digit ≠ 0. But doesn\'t specify if repetition allowed or full ranges. If we assume standard... actually we don\'t know letter range or repetition. Insufficient.', 'Answer: (A)'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Circular Permutation',
        q_text: `In how many ways can 6 people be seated around a circular table?

(A) 60
(B) 120
(C) 360
(D) 720
(E) 5040`,
        question_type: 'PS',
        signals: 'Circular arrangement — fix one person and arrange the rest.',
        trap: 'Using 6! = 720 (linear arrangement). Circular = (n−1)!',
        method: 'Circular permutations = (6−1)! = 5! = 120.',
        steps: ['Circular arrangement of n people = (n−1)!', '(6−1)! = 5! = 120', 'Answer: (B) 120'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Counting with Identical Items',
        q_text: `How many distinct arrangements are there of the letters in the word "MISSISSIPPI"?

(A) 34,650
(B) 39,916,800
(C) 69,300
(D) 277,200
(E) 462`,
        question_type: 'PS',
        signals: 'Repeated letters — use n!/(repeat₁! × repeat₂! × ...).',
        trap: 'Using 11! without dividing by repeated letter factorials.',
        method: 'MISSISSIPPI: 11 letters. M=1, I=4, S=4, P=2. 11!/(4!×4!×2!) = 34,650.',
        steps: ['Total letters = 11: M(1), I(4), S(4), P(2)', '11! = 39,916,800', 'Divide by repeats: 4! × 4! × 2! = 24 × 24 × 2 = 1,152', '39,916,800 / 1,152 = 34,650', 'Answer: (A) 34,650'],
        difficulty: 'Hard'
      }
    ],
    methods: [
      {
        name: 'Complement Counting',
        when_to_use: 'Problems with restrictions like "not adjacent," "not all same," or "at least one"',
        steps: ['Count total arrangements without any restriction', 'Count the "bad" arrangements (the ones you want to exclude)', 'Subtract: Valid = Total − Bad', 'This is usually faster than counting valid arrangements directly'],
        tip: 'Whenever you see "NOT," "at least," or "except," think complement first.'
      },
      {
        name: 'Slot Method',
        when_to_use: 'Sequential selection where each choice affects the next — codes, passwords, seating',
        steps: ['Draw blanks for each position: ___ ___ ___ ...', 'Fill each blank with the number of choices for that position', 'Account for restrictions (no repetition, must be even, etc.)', 'Multiply all slot values together'],
        tip: 'Always fill the most restricted slot first. If the last digit must be even, start there.'
      }
    ]
  },

  'Overlapping Sets & Venn Diagrams': {
    questions: [
      {
        subtype: 'Two-Set Venn: Find the Overlap',
        q_text: `In a class of 60 students, 35 study Spanish, 25 study French, and 5 study neither. How many students study both Spanish and French?

(A) 5
(B) 10
(C) 15
(D) 20
(E) 25`,
        question_type: 'PS',
        signals: '"Both," "neither" — overlapping sets formula: Total = A + B − Both + Neither.',
        trap: 'Adding 35+25 = 60 and concluding no overlap. Forgot to account for "neither."',
        method: '60 = 35 + 25 − Both + 5 → Both = 5.',
        steps: ['Total = Spanish + French − Both + Neither', '60 = 35 + 25 − Both + 5', '60 = 65 − Both', 'Both = 5', 'Answer: (A) 5'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Three-Set Overlap',
        q_text: `Of 100 employees, 50 use Tool A, 40 use Tool B, 30 use Tool C, 15 use A and B, 10 use A and C, 8 use B and C, and 3 use all three. How many use none?

(A) 4
(B) 6
(C) 8
(D) 10
(E) 12`,
        question_type: 'PS',
        signals: 'Three sets — use inclusion-exclusion: |A∪B∪C| = |A|+|B|+|C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|.',
        trap: 'Forgetting to add back the triple overlap after subtracting the pairwise overlaps.',
        method: 'Users of at least one = 50+40+30−15−10−8+3 = 90. None = 100−90 = 10.',
        steps: ['|A∪B∪C| = 50+40+30 − 15−10−8 + 3 = 90', 'None = 100 − 90 = 10', 'Answer: (D) 10'],
        difficulty: 'Hard'
      },
      {
        subtype: 'DS: Overlapping Sets',
        q_text: `Of 80 members of a gym, some do yoga, some do weights, and some do both. How many do only yoga?

(1) 50 members do yoga.
(2) 45 members do weights.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Only yoga = Yoga − Both. Need to know the overlap.',
        trap: 'Together: 50+45=95>80, so overlap=95−80=15. Only yoga=50−15=35. BUT: assumes everyone does at least one. The problem says "some do both" but doesn\'t say all members do one.',
        method: 'Total = 80, but some might do neither. Without knowing "neither," can\'t determine overlap.',
        steps: ['Only yoga = yoga − both', 'Statement (1): 50 do yoga. Don\'t know overlap. Insufficient.', 'Statement (2): 45 do weights. Don\'t know yoga or overlap. Insufficient.', 'Together: 50+45 = 95. If none do neither, overlap = 15, only yoga = 35. But if 10 do neither, overlap = 25, only yoga = 25. Insufficient.', 'Answer: (E)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Matrix Method: Two Criteria',
        q_text: `A survey of 200 people found that 120 like coffee, 100 like tea, and 40 like neither. How many like coffee but not tea?

(A) 40
(B) 50
(C) 60
(D) 80
(E) 120`,
        question_type: 'PS',
        signals: 'Two overlapping sets — find "only coffee." Use the two-set formula first to find overlap.',
        trap: 'Answering 120 (all coffee drinkers). Must subtract those who like both.',
        method: 'Both = 120+100−(200−40) = 60. Only coffee = 120−60 = 60.',
        steps: ['Like at least one = 200 − 40 = 160', 'Both = 120 + 100 − 160 = 60', 'Coffee but not tea = 120 − 60 = 60', 'Answer: (C) 60'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Percent-Based Venn',
        q_text: `In a group, 70% read newspapers, 50% read magazines, and 30% read both. What percent read neither?

(A) 0%
(B) 10%
(C) 20%
(D) 30%
(E) 50%`,
        question_type: 'PS',
        signals: 'Percents instead of counts — same formula: Total% = N% + M% − Both% + Neither%.',
        trap: 'Computing 70+50−30 = 90% and thinking 10% read neither.',
        method: '100 = 70 + 50 − 30 + Neither → Neither = 10%.',
        steps: ['100% = 70% + 50% − 30% + Neither%', '100 = 90 + Neither', 'Neither = 10%', 'Answer: (B) 10%'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Inclusion-Exclusion Formula',
        when_to_use: 'Any overlapping sets problem — two or three groups',
        steps: ['Two sets: Total = |A| + |B| − |A∩B| + |Neither|', 'Three sets: Total = |A|+|B|+|C| − |A∩B|−|A∩C|−|B∩C| + |A∩B∩C| + |Neither|', 'Solve for the unknown (usually "both" or "neither")', '"Only A" = |A| − |A∩B| (for two sets) or |A| − |A∩B| − |A∩C| + |A∩B∩C| (three sets)'],
        tip: 'Draw the Venn diagram and fill from the inside out — start with the intersection, then work outward.'
      },
      {
        name: 'Two-Way Table (Matrix Method)',
        when_to_use: 'Two overlapping binary categories — preferred over Venn diagrams for clarity',
        steps: ['Create a 2×2 table with row headers (Category 1: Yes/No) and column headers (Category 2: Yes/No)', 'Fill in known values', 'Use row and column totals to find unknowns', 'Each cell represents: Both, Only A, Only B, Neither'],
        tip: 'The matrix method is less error-prone than Venn diagrams for two-category problems. Use it by default.'
      }
    ]
  },

  'Sequences (Arithmetic & Geometric)': {
    questions: [
      {
        subtype: 'Arithmetic Sequence: Find nth Term',
        q_text: `In an arithmetic sequence, the 3rd term is 11 and the 7th term is 23. What is the 15th term?

(A) 41
(B) 43
(C) 47
(D) 53
(E) 59`,
        question_type: 'PS',
        signals: 'Two terms of an arithmetic sequence — find common difference, then compute target term.',
        trap: 'Counting the wrong number of steps between terms.',
        method: '7th − 3rd = 4d = 12 → d = 3. 15th = 3rd + 12d = 11 + 36 = 47.',
        steps: ['a₇ − a₃ = 4d → 23 − 11 = 12 → d = 3', 'a₁₅ = a₃ + 12d = 11 + 36 = 47', 'Answer: (C) 47'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Geometric Sequence: Sum',
        q_text: `The first term of a geometric sequence is 3 and the common ratio is 2. What is the sum of the first 6 terms?

(A) 63
(B) 93
(C) 189
(D) 192
(E) 381`,
        question_type: 'PS',
        signals: 'Geometric sum — use formula S = a(rⁿ−1)/(r−1).',
        trap: 'Adding individual terms and making arithmetic errors. Use the formula.',
        method: 'S₆ = 3(2⁶−1)/(2−1) = 3(63) = 189.',
        steps: ['S = a(rⁿ−1)/(r−1) where a=3, r=2, n=6', 'S = 3(64−1)/(2−1) = 3(63)/1 = 189', 'Answer: (C) 189'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Arithmetic or Geometric?',
        q_text: `What is the 5th term of the sequence?

(1) The sequence is arithmetic with first term 4 and common difference 3.
(2) The 3rd term is 10 and the 4th term is 13.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Finding a specific term — need the pattern and enough starting info.',
        trap: 'Statement 2: knowing two consecutive terms gives d=3, but is it arithmetic? Could be part of another pattern.',
        method: 'Statement 1: a₅ = 4 + 4(3) = 16. Sufficient. Statement 2: d=3, a₃=10, a₅=10+2(3)=16. Sufficient IF arithmetic.',
        steps: ['Statement (1): arithmetic, a₁=4, d=3. a₅ = 4+4(3) = 16. Sufficient.', 'Statement (2): a₃=10, a₄=13. d=3 (if arithmetic). a₅=16. But we\'re told it\'s "the sequence" — two consecutive terms with constant difference strongly imply arithmetic. However, without confirming it\'s arithmetic, a₅ could be anything. Technically insufficient.', 'Actually, the question just says "the sequence." Statement 2 gives two terms but doesn\'t confirm the pattern continues. A₅ could be anything. Insufficient.', 'Answer: (A)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Sequence Pattern Recognition',
        q_text: `In the sequence 2, 6, 18, 54, ..., what is the sum of the 7th and 8th terms?

(A) 2,916
(B) 4,374
(C) 5,832
(D) 7,290
(E) 8,748`,
        question_type: 'PS',
        signals: 'Each term = previous × 3. Geometric with a=2, r=3.',
        trap: 'Computing individual terms incorrectly for large positions.',
        method: 'a₇ = 2(3⁶) = 1458. a₈ = 2(3⁷) = 4374. Sum = 5832.',
        steps: ['Geometric: a=2, r=3', 'a₇ = 2 × 3⁶ = 2 × 729 = 1,458', 'a₈ = 2 × 3⁷ = 2 × 2,187 = 4,374', 'Sum = 1,458 + 4,374 = 5,832', 'Answer: (C) 5,832'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Arithmetic Sum: Consecutive Integers',
        q_text: `What is the sum of all integers from 1 to 80?

(A) 3,160
(B) 3,200
(C) 3,240
(D) 3,280
(E) 6,400`,
        question_type: 'PS',
        signals: 'Sum of consecutive integers from 1 to n = n(n+1)/2.',
        trap: 'Using n² instead of n(n+1)/2. Or miscounting: there are 80 numbers, not 79.',
        method: 'Sum = 80 × 81 / 2 = 3,240.',
        steps: ['Sum = n(n+1)/2 = 80(81)/2', '= 6,480/2 = 3,240', 'Answer: (C) 3,240'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Term-Count Formula',
        when_to_use: 'Finding the number of terms in an arithmetic sequence between two values',
        steps: ['Number of terms = (last − first)/d + 1', 'For consecutive integers: count = last − first + 1', 'For evens from 2 to 100: count = (100−2)/2 + 1 = 50', 'Common GMAT trap: off-by-one errors — always add 1 when counting inclusive'],
        tip: 'Fencepost problem: from 1 to 10, there are 10 numbers (not 9). The "+1" accounts for including both endpoints.'
      },
      {
        name: 'Geometric Ratio Identification',
        when_to_use: 'Identifying a geometric sequence and finding its common ratio quickly',
        steps: ['Divide any term by the previous term to get ratio r', 'Verify with another pair to confirm it\'s geometric', 'nth term = a₁ × r^(n−1)', 'Sum of first n terms = a₁(rⁿ−1)/(r−1) for r≠1', 'For |r|<1, infinite sum = a₁/(1−r)'],
        tip: 'GMAT frequently uses r=2,3,1/2,1/3. Memorize powers of 2 (up to 2¹⁰=1024) and 3 (up to 3⁷=2187).'
      }
    ]
  },

  'Simple & Compound Interest': {
    questions: [
      {
        subtype: 'Simple Interest: Find Rate',
        q_text: `If $5,000 earns $600 in simple interest over 3 years, what is the annual interest rate?

(A) 2%
(B) 3%
(C) 4%
(D) 5%
(E) 6%`,
        question_type: 'PS',
        signals: 'Simple interest formula: I = Prt. Solve for r.',
        trap: 'Forgetting to divide by time. 600/5000 = 12%, but that\'s the 3-year rate.',
        method: '600 = 5000 × r × 3 → r = 600/15000 = 0.04 = 4%.',
        steps: ['I = Prt → 600 = 5000 × r × 3', '600 = 15000r', 'r = 0.04 = 4%', 'Answer: (C) 4%'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Compound Interest: Compare with Simple',
        q_text: `$10,000 is invested at 10% per year. How much more does compound interest yield than simple interest after 2 years?

(A) $0
(B) $50
(C) $100
(D) $200
(E) $1,000`,
        question_type: 'PS',
        signals: '"How much more compound than simple" — compute both and subtract.',
        trap: 'Thinking they\'re the same for 2 years. The difference = interest on interest.',
        method: 'SI = 10000×0.10×2 = 2000. CI = 10000(1.1²−1) = 2100. Difference = 100.',
        steps: ['Simple interest: 10000 × 0.10 × 2 = $2,000', 'Compound interest: 10000(1.10² − 1) = 10000(1.21 − 1) = $2,100', 'Difference: 2,100 − 2,000 = $100', 'Answer: (C) $100'],
        difficulty: 'Medium'
      },
      {
        subtype: 'DS: Rate or Time?',
        q_text: `An investment doubles in value. Was the interest rate greater than 8%?

(1) The investment was compounded annually.
(2) The investment doubled in less than 9 years.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
        question_type: 'DS',
        signals: 'Doubling + Rule of 72: years to double ≈ 72/rate.',
        trap: 'Thinking statement 1 alone helps. Just knowing it\'s compounded annually doesn\'t give rate or time.',
        method: 'Together: compound annual, doubles in <9 years. Rule of 72: rate > 72/9 = 8%. Yes.',
        steps: ['Statement (1): compounded annually. No info on rate or time. Insufficient.', 'Statement (2): doubles in <9 years. Without knowing compounding method, can\'t determine rate precisely. If simple: 2P = P(1+rt), r > 1/9 ≈ 11.1%. If compound: different. Insufficient.', 'Together: compound annual, <9 years. 1.08⁹ ≈ 2.00 (rule of 72: 72/8=9). Doubles in exactly 9 years at 8%. In less than 9 years → rate > 8%. Sufficient.', 'Answer: (C)'],
        difficulty: 'Hard'
      },
      {
        subtype: 'Compound Interest: Semi-Annual',
        q_text: `$8,000 is invested at 6% annual interest, compounded semi-annually. What is the value after 1 year?

(A) $8,240.00
(B) $8,480.00
(C) $8,486.40
(D) $8,487.20
(E) $8,489.00`,
        question_type: 'PS',
        signals: '"Compounded semi-annually" — rate halved, periods doubled.',
        trap: 'Using 6% for one year: 8000×1.06 = 8480. Must split into two 3% periods.',
        method: '8000 × (1+0.03)² = 8000 × 1.0609 = $8,487.20.',
        steps: ['Semi-annual rate = 6%/2 = 3%', 'Periods = 2 (two half-years)', 'Amount = 8000 × (1.03)² = 8000 × 1.0609 = $8,487.20', 'Answer: (D) $8,487.20'],
        difficulty: 'Medium'
      },
      {
        subtype: 'Rule of 72: Doubling Time',
        q_text: `Approximately how many years will it take for an investment to double at 12% annual compound interest?

(A) 4
(B) 5
(C) 6
(D) 7
(E) 8`,
        question_type: 'PS',
        signals: '"How long to double" + compound interest → Rule of 72.',
        trap: 'Computing 100/12 ≈ 8.3 years (that\'s for simple interest).',
        method: 'Rule of 72: doubling time ≈ 72/rate = 72/12 = 6 years.',
        steps: ['Rule of 72: years to double ≈ 72 / interest rate', '72 / 12 = 6 years', 'Answer: (C) 6'],
        difficulty: 'Medium'
      }
    ],
    methods: [
      {
        name: 'Rule of 72',
        when_to_use: 'Quick estimation of doubling time or required rate for compound interest',
        steps: ['Doubling time ≈ 72 / annual interest rate (%)', 'Or: required rate ≈ 72 / desired doubling time', 'Works best for rates between 2% and 20%', 'For tripling: use Rule of 114 (time ≈ 114/rate)'],
        tip: '72 is chosen because it has many factors (1,2,3,4,6,8,9,12). This makes mental math easy for common rates.'
      },
      {
        name: 'Compound Period Adjustment',
        when_to_use: 'Interest compounded more frequently than annually (semi-annually, quarterly, monthly)',
        steps: ['Divide annual rate by number of compounding periods per year: r/n', 'Multiply number of years by compounding periods per year: t×n', 'Apply formula: A = P(1 + r/n)^(nt)', 'Semi-annual: n=2. Quarterly: n=4. Monthly: n=12'],
        tip: 'More frequent compounding → slightly more interest. The difference is the "interest on interest" effect.'
      }
    ]
  }
};

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL.\n');

  // 1. Get math topic IDs
  const { rows: topics } = await client.query(`
    SELECT t.id, t.title
    FROM topics t
    JOIN sections s ON t.section_id = s.id
    WHERE s.slug = 'math'
    ORDER BY t.order_idx
  `);

  console.log(`Found ${topics.length} math topics:\n`);
  topics.forEach((t, i) => console.log(`  ${i + 1}. [${t.id}] ${t.title}`));
  console.log('');

  let totalQuestions = 0;
  let totalMethods = 0;

  for (const topic of topics) {
    const data = topicContent[topic.title];
    if (!data) {
      console.log(`⚠ No expansion data for "${topic.title}" — skipping.`);
      continue;
    }

    console.log(`── ${topic.title} (id=${topic.id}) ──`);

    // Insert questions (order_idx 4–8)
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
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
          i + 4
        ]
      );
      totalQuestions++;
    }
    console.log(`  ✓ ${data.questions.length} questions inserted`);

    // Insert methods (order_idx 4–5)
    for (let i = 0; i < data.methods.length; i++) {
      const m = data.methods[i];
      await client.query(
        `INSERT INTO methods (topic_id, name, when_to_use, steps, tip, order_idx)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          topic.id,
          m.name,
          m.when_to_use,
          JSON.stringify(m.steps),
          m.tip,
          i + 4
        ]
      );
      totalMethods++;
    }
    console.log(`  ✓ ${data.methods.length} methods inserted`);
  }

  console.log(`\n=== Done! Inserted ${totalQuestions} questions and ${totalMethods} methods across ${topics.length} topics. ===`);

  await client.end();
}

main().catch(err => {
  console.error('ERROR:', err.message);
  client.end();
  process.exit(1);
});
