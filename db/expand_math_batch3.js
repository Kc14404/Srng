/**
 * GMAT Hub — Math Batch 3: Full Type Coverage for Topics 14–19
 * Audits existing questions per topic, inserts only missing question types.
 *
 * Run: node db/expand_math_batch3.js
 */

const { Client } = require('../node_modules/pg');

const client = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// ─── Content Data (only missing types per topic) ─────────────────────────────

const gapFills = {
  'Inequalities & Absolute Value': [
    {
      subtype: 'DS: Is x > 0?',
      q_text: `Is x > 0?

(1) |x| = x
(2) x² > x

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'Absolute value and inequality. |x| = x means x ≥ 0. x² > x means x < 0 or x > 1.',
      trap: 'C-trap: Statement 1 gives x ≥ 0, not x > 0 (x could be 0). Statement 2 allows x < 0 or x > 1.',
      method: 'Statement 1: |x| = x → x ≥ 0, but x = 0 possible → insufficient. Statement 2: x² > x → x(x−1) > 0 → x < 0 or x > 1 → insufficient. Together: x ≥ 0 AND (x < 0 or x > 1) → x > 1 → x > 0. Sufficient.',
      steps: ['Statement (1): |x| = x means x ≥ 0. But x = 0 is allowed, so not necessarily > 0. Insufficient.', 'Statement (2): x² > x → x(x−1) > 0 → x < 0 or x > 1. Could be negative. Insufficient.', 'Together: x ≥ 0 from (1) and x < 0 or x > 1 from (2) → x > 1. So x > 0. Sufficient.', 'Answer: (C)'],
      difficulty: 'Medium'
    },
    {
      subtype: 'Inequality Word Problem: Budget Constraint',
      q_text: `A student can spend at most $120 on books. Each book costs $14 and there is a $10 shipping fee regardless of the number of books ordered. What is the maximum number of books the student can buy?

(A) 7
(B) 8
(C) 9
(D) 10
(E) 11`,
      question_type: 'PS',
      signals: '"At most" signals ≤ inequality. Fixed cost + variable cost structure.',
      trap: 'Forgetting the shipping fee: 120/14 ≈ 8.57 → choosing (B) 8. Must subtract shipping first.',
      method: '14n + 10 ≤ 120 → 14n ≤ 110 → n ≤ 7.86 → n = 7.',
      steps: ['Set up inequality: 14n + 10 ≤ 120', '14n ≤ 110', 'n ≤ 110/14 ≈ 7.86', 'Maximum whole number: n = 7', 'Answer: (A) 7'],
      difficulty: 'Medium'
    },
    {
      subtype: 'Comparison: |a + b| vs |a| + |b|',
      q_text: `If a = −3 and b = 5, which of the following is true?

(A) |a + b| > |a| + |b|
(B) |a + b| = |a| + |b|
(C) |a + b| < |a| + |b|
(D) |a + b| = 0
(E) Cannot be determined`,
      question_type: 'PS',
      signals: 'Triangle inequality: |a + b| ≤ |a| + |b|, with equality iff same sign.',
      trap: 'Choosing (B) by assuming equality always holds, or (E) thinking more info is needed.',
      method: '|a + b| = |−3 + 5| = |2| = 2. |a| + |b| = 3 + 5 = 8. Since 2 < 8, answer is (C).',
      steps: ['|a + b| = |−3 + 5| = |2| = 2', '|a| + |b| = 3 + 5 = 8', '2 < 8', 'Answer: (C)'],
      difficulty: 'Medium'
    }
  ],

  'Functions & Symbolism': [
    {
      subtype: 'DS: What Is f(2)?',
      q_text: `A function f is defined for all integers. What is f(2)?

(1) f(x) = f(x − 1) + 3 for all integers x
(2) f(0) = 7

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'Recursive function definition. Need base case + recurrence to find specific value.',
      trap: 'C-trap avoided: Statement 1 gives the pattern but no starting value. Statement 2 gives a value but no rule. Together they work.',
      method: 'Statement 1 alone: f(2) = f(1) + 3, but f(1) unknown → insufficient. Statement 2 alone: f(0) = 7, no rule → insufficient. Together: f(1) = f(0) + 3 = 10, f(2) = f(1) + 3 = 13. Sufficient.',
      steps: ['Statement (1): f(x) = f(x−1) + 3. Without a starting value, cannot determine f(2). Insufficient.', 'Statement (2): f(0) = 7. Without a rule, cannot determine f(2). Insufficient.', 'Together: f(1) = f(0) + 3 = 10; f(2) = f(1) + 3 = 13. Sufficient.', 'Answer: (C)'],
      difficulty: 'Medium'
    },
    {
      subtype: 'Function Word Problem: Revenue Model',
      q_text: `A company models its revenue as R(x) = −2x² + 80x, where x is the price per unit in dollars. At what price is revenue maximized?

(A) $10
(B) $15
(C) $20
(D) $25
(E) $40`,
      question_type: 'PS',
      signals: 'Quadratic revenue function with negative leading coefficient → parabola opens downward → vertex is max.',
      trap: 'Setting R(x) = 0 and solving for x-intercepts (x = 0 or x = 40) instead of finding the vertex.',
      method: 'Vertex at x = −b/(2a) = −80/(2·(−2)) = 80/4 = 20.',
      steps: ['R(x) = −2x² + 80x, a = −2, b = 80', 'Vertex x-coordinate: x = −b/(2a) = −80/(−4) = 20', 'Revenue maximized at x = $20', 'Answer: (C) $20'],
      difficulty: 'Hard'
    },
    {
      subtype: 'Comparison: f(a+b) vs f(a) + f(b)',
      q_text: `If f(x) = x², which of the following is true?

(A) f(3 + 4) > f(3) + f(4)
(B) f(3 + 4) = f(3) + f(4)
(C) f(3 + 4) < f(3) + f(4)
(D) f(3 + 4) = f(3) · f(4)
(E) Cannot be determined`,
      question_type: 'PS',
      signals: 'Testing whether f(x) = x² is additive. It is not: (a+b)² ≠ a² + b².',
      trap: 'Assuming f(a+b) = f(a) + f(b) — this only holds for linear functions.',
      method: 'f(3+4) = f(7) = 49. f(3) + f(4) = 9 + 16 = 25. 49 > 25.',
      steps: ['f(3 + 4) = f(7) = 7² = 49', 'f(3) + f(4) = 3² + 4² = 9 + 16 = 25', '49 > 25', 'Answer: (A)'],
      difficulty: 'Medium'
    }
  ],

  'Combinations, Permutations & Counting': [
    {
      subtype: 'DS: How Many 3-Digit Codes Are Possible?',
      q_text: `A 3-digit code is formed using digits 1 through 9, with no digit repeated. How many such codes are possible?

(1) The sum of the three digits in the code is 12.
(2) The code contains the digit 4.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'Counting DS. Sum constraint limits digit choices. "Contains 4" limits one position.',
      trap: 'C-trap: thinking both together pin it down. Statement 1 gives multiple combos (e.g., 1-2-9, 1-3-8, etc.). Statement 2 still leaves many options. Together still insufficient.',
      method: 'Statement 1: digits summing to 12 with no repeats from 1–9 → multiple combos × 3! arrangements each → not a single number. Statement 2: must include 4, other two from remaining 8, arranged → not unique. Together: combos summing to 12 that include 4 → multiple options (e.g., 1-4-7, 2-4-6, 3-4-5) → still not unique.',
      steps: ['Statement (1): Multiple sets of 3 digits from 1–9 sum to 12 (e.g., {1,2,9}, {1,3,8}, {1,4,7}…). Each set yields 3! = 6 codes. Not a unique count without knowing which set. Insufficient.', 'Statement (2): Code contains 4. Other 2 digits chosen from 8 remaining → many possibilities. Insufficient.', 'Together: Sets summing to 12 that include 4: {1,4,7}, {2,4,6}, {3,4,5}. Three different sets, each giving 6 codes = 18 total. But the question asks "how many codes are possible" — this IS determinable: 18. Sufficient.', 'Answer: (C)'],
      difficulty: 'Hard'
    },
    {
      subtype: 'Counting Word Problem: Tournament Bracket',
      q_text: `In a round-robin tournament, each pair of teams plays exactly one game. If there are 8 teams in the tournament, how many total games are played?

(A) 16
(B) 24
(C) 28
(D) 32
(E) 56`,
      question_type: 'PS',
      signals: '"Each pair plays once" — this is a combinations problem: C(n, 2).',
      trap: 'Multiplying 8 × 7 = 56 (permutations) instead of dividing by 2 for unordered pairs.',
      method: 'C(8, 2) = 8!/(2!·6!) = (8 × 7)/2 = 28.',
      steps: ['Each game involves a unique pair of teams', 'Number of pairs = C(8, 2) = 8! / (2! × 6!)', '= (8 × 7) / 2 = 28', 'Answer: (C) 28'],
      difficulty: 'Medium'
    },
    {
      subtype: 'Trap: Combinations vs. Permutations — When Order Matters',
      q_text: `From a group of 10 people, 3 are to be chosen for the positions of President, Vice President, and Secretary. How many ways can this be done?

(A) 120
(B) 360
(C) 504
(D) 720
(E) 1000`,
      question_type: 'PS',
      signals: 'Three distinct positions from 10 people — order matters (President ≠ VP ≠ Secretary).',
      trap: 'Using C(10,3) = 120 instead of P(10,3) = 720. The distinct roles make this a permutation.',
      method: 'P(10, 3) = 10 × 9 × 8 = 720.',
      steps: ['Positions are distinct → order matters → permutation', 'P(10, 3) = 10 × 9 × 8 = 720', 'Answer: (D) 720'],
      difficulty: 'Medium'
    },
    {
      subtype: 'Comparison: Two Counting Scenarios',
      q_text: `Which is greater: C(10, 3) or P(5, 3)?

(A) C(10, 3) is greater
(B) P(5, 3) is greater
(C) They are equal
(D) C(10, 3) is exactly twice P(5, 3)
(E) Cannot be determined`,
      question_type: 'PS',
      signals: 'Direct computation and comparison of combination vs permutation values.',
      trap: 'Assuming permutations are always larger than combinations without computing.',
      method: 'C(10,3) = 120. P(5,3) = 60. C(10,3) = 120 > 60.',
      steps: ['C(10, 3) = 10! / (3! × 7!) = (10 × 9 × 8) / 6 = 120', 'P(5, 3) = 5 × 4 × 3 = 60', '120 > 60, and 120 = 2 × 60', 'Answer: (D) C(10,3) is exactly twice P(5,3)'],
      difficulty: 'Medium'
    }
  ],

  'Overlapping Sets & Venn Diagrams': [
    {
      subtype: 'DS: How Many Study Both Subjects?',
      q_text: `Of 50 students in a class, some study math, some study science, and some study both. How many students study both math and science?

(1) 30 students study math.
(2) 25 students study science.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'Two overlapping sets. Need total, both individual sets, and either overlap or "neither" to solve.',
      trap: 'C-trap: With total = 50, math = 30, science = 25, overlap = 30 + 25 − 50 = 5 ONLY if everyone studies at least one. But "some study both" doesn\'t rule out students studying neither.',
      method: 'Statement 1 alone: only math count → insufficient. Statement 2 alone: only science count → insufficient. Together: 30 + 25 = 55 > 50, so at least 5 overlap. But without knowing "neither," exact overlap unknown. Insufficient.',
      steps: ['Statement (1): 30 study math. No info on science or overlap. Insufficient.', 'Statement (2): 25 study science. No info on math or overlap. Insufficient.', 'Together: Math + Science = 55. Total = 50. If no one studies neither: overlap = 55 − 50 = 5. But if 3 study neither: overlap = 55 − (50 − 3) = 8. Overlap depends on "neither" count.', 'Insufficient even together.', 'Answer: (E)'],
      difficulty: 'Medium'
    },
    {
      subtype: 'Overlapping Sets Word Problem: Survey Results',
      q_text: `In a survey of 200 people, 120 drink coffee, 80 drink tea, and 40 drink both coffee and tea. How many people drink neither coffee nor tea?

(A) 0
(B) 20
(C) 40
(D) 60
(E) 80`,
      question_type: 'PS',
      signals: 'Classic two-set Venn diagram with all four values: total, A, B, both. Find neither.',
      trap: 'Subtracting both from total: 200 − 40 = 160. Must use inclusion-exclusion formula.',
      method: 'Neither = Total − (Coffee + Tea − Both) = 200 − (120 + 80 − 40) = 200 − 160 = 40.',
      steps: ['Coffee ∪ Tea = Coffee + Tea − Both = 120 + 80 − 40 = 160', 'Neither = Total − (Coffee ∪ Tea) = 200 − 160 = 40', 'Answer: (C) 40'],
      difficulty: 'Medium'
    },
    {
      subtype: 'Trap: Double-Counting in 3-Set Venn',
      q_text: `In a group of 100 students: 60 play soccer, 50 play basketball, 40 play tennis, 25 play soccer and basketball, 20 play soccer and tennis, 15 play basketball and tennis, and 10 play all three. How many play at least one sport?

(A) 80
(B) 90
(C) 100
(D) 110
(E) 150`,
      question_type: 'PS',
      signals: 'Three-set Venn diagram. Must apply inclusion-exclusion correctly.',
      trap: 'Adding 60 + 50 + 40 = 150 without subtracting overlaps. Or subtracting pairwise but forgetting to add back triple overlap.',
      method: '|A ∪ B ∪ C| = |A| + |B| + |C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C| = 60 + 50 + 40 − 25 − 20 − 15 + 10 = 100.',
      steps: ['Apply inclusion-exclusion for 3 sets:', '60 + 50 + 40 = 150', '150 − 25 − 20 − 15 = 90', '90 + 10 = 100', 'Answer: (C) 100'],
      difficulty: 'Hard'
    },
    {
      subtype: 'Comparison: Venn vs. Matrix Method Results',
      q_text: `Of 80 employees, 50 speak English, 35 speak Spanish, and 15 speak both. Using the inclusion-exclusion formula, how many speak at least one language?

(A) 55
(B) 60
(C) 65
(D) 70
(E) 80`,
      question_type: 'PS',
      signals: 'Two-set overlap. Straightforward inclusion-exclusion verification.',
      trap: 'Adding 50 + 35 = 85 without subtracting the overlap of 15.',
      method: 'At least one = English + Spanish − Both = 50 + 35 − 15 = 70.',
      steps: ['English ∪ Spanish = 50 + 35 − 15 = 70', '70 speak at least one language', 'Answer: (D) 70'],
      difficulty: 'Medium'
    }
  ],

  'Sequences (Arithmetic & Geometric)': [
    {
      subtype: 'Sequence Hard: Recursive Definition',
      q_text: `A sequence is defined by a(1) = 1, a(2) = 2, and a(n) = a(n−1) + a(n−2) for n ≥ 3. What is a(7)?

(A) 11
(B) 13
(C) 18
(D) 21
(E) 29`,
      question_type: 'PS',
      signals: 'Fibonacci-like recurrence. Must compute step by step — no shortcut formula.',
      trap: 'Arithmetic errors in the chain, or confusing this with a standard arithmetic/geometric sequence.',
      method: 'Compute: a(3)=3, a(4)=5, a(5)=8, a(6)=13, a(7)=21.',
      steps: ['a(1) = 1, a(2) = 2', 'a(3) = 2 + 1 = 3', 'a(4) = 3 + 2 = 5', 'a(5) = 5 + 3 = 8', 'a(6) = 8 + 5 = 13', 'a(7) = 13 + 8 = 21', 'Answer: (D) 21'],
      difficulty: 'Hard'
    },
    {
      subtype: 'DS: What Is the 10th Term?',
      q_text: `In an arithmetic sequence, what is the 10th term?

(1) The first term is 5 and the common difference is 3.
(2) The 5th term is 17 and the 7th term is 23.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'Arithmetic sequence: a(n) = a(1) + (n−1)d. Need a(1) and d to find any term.',
      trap: 'Choosing (A) because it gives explicit values, but Statement 2 also gives enough to find a(1) and d.',
      method: 'Statement 1: a(10) = 5 + 9(3) = 32. Sufficient. Statement 2: d = (23−17)/(7−5) = 3; a(1) = 17 − 4(3) = 5; a(10) = 32. Sufficient.',
      steps: ['Statement (1): a(1) = 5, d = 3. a(10) = 5 + 9(3) = 32. Sufficient.', 'Statement (2): Two terms give d = (23−17)/2 = 3. Then a(1) = 17 − 4(3) = 5. a(10) = 32. Sufficient.', 'Each alone is sufficient.', 'Answer: (D)'],
      difficulty: 'Medium'
    },
    {
      subtype: 'Sequence Word Problem: Salary Growth',
      q_text: `An employee's annual salary starts at $40,000 and increases by $2,500 each year. In what year does the salary first exceed $60,000?

(A) Year 8
(B) Year 9
(C) Year 10
(D) Year 11
(E) Year 12`,
      question_type: 'PS',
      signals: 'Arithmetic sequence: a(1) = 40000, d = 2500. Find smallest n where a(n) > 60000.',
      trap: 'Off-by-one: computing (60000−40000)/2500 = 8, choosing year 8. But year 8 salary = 40000 + 7(2500) = 57500 < 60000.',
      method: 'a(n) = 40000 + (n−1)(2500) > 60000 → n−1 > 8 → n > 9. First integer: n = 9. Check: a(9) = 40000 + 8(2500) = 60000. Not exceeded. n = 10: a(10) = 62500 > 60000.',
      steps: ['a(n) = 40000 + (n−1)(2500)', 'Need a(n) > 60000', '(n−1)(2500) > 20000', 'n − 1 > 8, so n > 9', 'a(9) = 40000 + 8(2500) = 60000 (not exceeded, equal)', 'a(10) = 40000 + 9(2500) = 62500 > 60000', 'Answer: (C) Year 10'],
      difficulty: 'Medium'
    },
    {
      subtype: 'Trap: First Term Is n=1, Not n=0',
      q_text: `The nth term of a sequence is given by a(n) = 3n + 2. What is the first term of the sequence?

(A) 2
(B) 3
(C) 5
(D) 6
(E) 8`,
      question_type: 'PS',
      signals: 'Explicit formula. "First term" = a(1), not a(0).',
      trap: 'Computing a(0) = 3(0) + 2 = 2, choosing (A). The first term is a(1).',
      method: 'First term = a(1) = 3(1) + 2 = 5.',
      steps: ['First term means n = 1', 'a(1) = 3(1) + 2 = 5', 'Trap: a(0) = 2 is not the first term', 'Answer: (C) 5'],
      difficulty: 'Medium'
    },
    {
      subtype: 'Comparison: Sum of Arithmetic vs. Geometric Sequence',
      q_text: `Which is greater: the sum of the first 5 terms of an arithmetic sequence with a = 2 and d = 3, or the sum of the first 5 terms of a geometric sequence with a = 2 and r = 2?

(A) The arithmetic sum is greater
(B) The geometric sum is greater
(C) They are equal
(D) The arithmetic sum is exactly half the geometric sum
(E) Cannot be determined`,
      question_type: 'PS',
      signals: 'Direct computation of two sequence sums. AS: S = n/2 × (2a + (n−1)d). GS: S = a(r^n − 1)/(r − 1).',
      trap: 'Miscalculating one of the sums or confusing the formulas.',
      method: 'AS: S = 5/2 × (4 + 12) = 5/2 × 16 = 40. GS: S = 2(2⁵ − 1)/(2 − 1) = 2(31) = 62. GS > AS.',
      steps: ['Arithmetic: terms are 2, 5, 8, 11, 14. Sum = 40.', 'Geometric: terms are 2, 4, 8, 16, 32. Sum = 62.', '62 > 40', 'Answer: (B) The geometric sum is greater'],
      difficulty: 'Medium'
    }
  ],

  'Simple & Compound Interest': [
    {
      subtype: 'Compound Interest Hard: Quarterly vs. Annual Comparison',
      q_text: `$1,000 is invested at 8% annual interest for 2 years. What is the positive difference between the amount earned with annual compounding and the amount earned with quarterly compounding? (Use 1.02⁸ ≈ 1.1717)

(A) $0.64
(B) $1.17
(C) $5.28
(D) $8.10
(E) $11.70`,
      question_type: 'PS',
      signals: 'Compound interest comparison. Quarterly: rate/4 per quarter, 4×years periods.',
      trap: 'Using simple interest formula, or forgetting that quarterly compounding uses r/4 for 4n periods.',
      method: 'Annual: 1000(1.08)² = 1000(1.1664) = 1166.40. Quarterly: 1000(1.02)⁸ ≈ 1000(1.1717) = 1171.66. Difference ≈ 1171.66 − 1166.40 = 5.26 ≈ $5.28.',
      steps: ['Annual compounding: A = 1000(1.08)² = 1000 × 1.1664 = $1166.40', 'Quarterly compounding: rate per quarter = 8%/4 = 2%, periods = 4×2 = 8', 'A = 1000(1.02)⁸ ≈ 1000 × 1.1717 = $1171.66', 'Difference = 1171.66 − 1166.40 ≈ $5.26', 'Answer: (C) $5.28'],
      difficulty: 'Hard'
    },
    {
      subtype: 'DS: How Much Interest Was Earned?',
      q_text: `An account earns simple interest. How much interest was earned?

(1) The annual interest rate is 5%.
(2) The money was invested for 3 years.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'Simple interest: I = Prt. Three unknowns: P, r, t. Need all three for I.',
      trap: 'C-trap: combining both gives r = 5% and t = 3, so I = P(0.05)(3) = 0.15P. But P is unknown → still insufficient.',
      method: 'I = Prt. Statement 1: r = 0.05, but P and t unknown. Statement 2: t = 3, but P and r unknown. Together: I = P(0.05)(3) = 0.15P. P still unknown.',
      steps: ['I = Prt requires P, r, and t.', 'Statement (1): r = 5%. Missing P and t. Insufficient.', 'Statement (2): t = 3. Missing P and r. Insufficient.', 'Together: I = P × 0.05 × 3 = 0.15P. Principal P is still unknown. Insufficient.', 'Answer: (E)'],
      difficulty: 'Medium'
    },
    {
      subtype: 'Trap: Simple Interest — Interest vs. Total Amount',
      q_text: `Maria invests $2,000 at a simple interest rate of 6% per year for 5 years. What is the total amount in her account at the end of 5 years?

(A) $600
(B) $2,060
(C) $2,300
(D) $2,600
(E) $2,676`,
      question_type: 'PS',
      signals: 'Simple interest: I = Prt. "Total amount" = P + I, not just I.',
      trap: 'Choosing (A) $600 which is just the interest, not the total. Or choosing (E) by using compound interest formula.',
      method: 'I = 2000 × 0.06 × 5 = $600. Total = P + I = 2000 + 600 = $2,600.',
      steps: ['I = Prt = 2000 × 0.06 × 5 = $600', 'Total amount = Principal + Interest = 2000 + 600 = $2,600', 'Trap: $600 is interest only, not total', 'Answer: (D) $2,600'],
      difficulty: 'Medium'
    }
  ]
};

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL.\n');

  // 1. Get math topics 14–19
  const { rows: topics } = await client.query(`
    SELECT t.id, t.title FROM topics t
    JOIN sections s ON t.section_id = s.id
    WHERE s.slug = 'math'
    ORDER BY t.order_idx
    LIMIT 6 OFFSET 13
  `);

  console.log(`Found ${topics.length} topics (14–19):`);
  topics.forEach((t, i) => console.log(`  ${14 + i}. [${t.id}] ${t.title}`));
  console.log('');

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const topic of topics) {
    const newQuestions = gapFills[topic.title];
    if (!newQuestions) {
      console.log(`⚠ No gap-fill data for "${topic.title}" — skipping.`);
      continue;
    }

    console.log(`── ${topic.title} (id=${topic.id}) ──`);

    // 2. Audit existing subtypes
    const { rows: existing } = await client.query(
      `SELECT subtype FROM questions WHERE topic_id = $1`,
      [topic.id]
    );
    const existingSubtypes = new Set(existing.map(r => r.subtype));
    console.log(`  Existing subtypes (${existingSubtypes.size}): ${[...existingSubtypes].join(', ')}`);

    // 3. Get max order_idx
    const { rows: maxRows } = await client.query(
      `SELECT COALESCE(MAX(order_idx), -1) AS max_idx FROM questions WHERE topic_id = $1`,
      [topic.id]
    );
    let nextIdx = maxRows[0].max_idx + 1;

    // 4. Insert only missing types
    for (const q of newQuestions) {
      if (existingSubtypes.has(q.subtype)) {
        console.log(`  ⏭ Already exists: "${q.subtype}" — skipped.`);
        totalSkipped++;
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
          nextIdx++
        ]
      );
      console.log(`  ✓ Inserted: "${q.subtype}" (order_idx=${nextIdx - 1})`);
      totalInserted++;
    }
  }

  console.log(`\n=== Done! Inserted ${totalInserted} questions, skipped ${totalSkipped} duplicates. ===`);
  await client.end();
}

main().catch(err => { console.error(err.message); process.exit(1); });
