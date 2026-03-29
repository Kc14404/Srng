/**
 * GMAT Hub — Math Batch 2: Full Type Coverage for Topics 8–13
 * Audits existing questions for each topic, then inserts ONLY the missing types.
 *
 * Run: node db/expand_math_batch2.js
 */

const { Client } = require('../node_modules/pg');

const client = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// ─── Missing Questions by Topic ─────────────────────────────────────────────

const missingByTopic = {
  'PEMDAS': [
    {
      subtype: 'PEMDAS Hard: Nested Exponents with Negatives',
      q_text: `Evaluate: −2³ − (−2)³ + 2 × (−3)²

(A) −26
(B) −10
(C) 10
(D) 18
(E) 26`,
      question_type: 'PS',
      signals: 'Exponents with negatives — distinction between −2³ (negate after cube) and (−2)³ (cube the negative). Squared negative becomes positive.',
      trap: 'Treating −2³ the same as (−2)³. −2³ = −8, but (−2)³ = −8 too in this case. The real trap is the (−3)² term: students may compute −9 instead of +9.',
      method: 'Evaluate each term carefully: −2³ = −8, (−2)³ = −8, (−3)² = 9. Then: −8 − (−8) + 2 × 9 = −8 + 8 + 18 = 18.',
      steps: [
        '−2³ = −(2³) = −8 (exponent applies to 2 only)',
        '(−2)³ = (−2)(−2)(−2) = −8',
        '(−3)² = (−3)(−3) = 9',
        'Expression: −8 − (−8) + 2 × 9',
        '= −8 + 8 + 18 = 18',
        'Correct answer: (D) 18'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'DS: Is the Expression Positive?',
      q_text: `x = −a² + b³. Is x > 0?

(1) a = 1
(2) b = 2

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'x = −a² + b³. Need to determine sign. −a² is always ≤ 0 (since a² ≥ 0). b³ can be positive or negative.',
      trap: 'Thinking statement 1 alone is sufficient. a=1 gives x = −1 + b³, but b is unknown.',
      method: 'Statement 1: x = −1 + b³ — depends on b. Insufficient. Statement 2: x = −a² + 8 — if a² < 8 then yes, but a could be 3 giving x = −9 + 8 = −1. Insufficient. Together: x = −1 + 8 = 7 > 0. Sufficient.',
      steps: [
        'Statement (1): a = 1 → x = −1 + b³. If b = 2, x = 7 > 0. If b = 0, x = −1 < 0. Insufficient.',
        'Statement (2): b = 2 → x = −a² + 8. If a = 1, x = 7 > 0. If a = 3, x = −1 < 0. Insufficient.',
        'Together: a = 1, b = 2 → x = −1 + 8 = 7 > 0. Sufficient.',
        'Correct answer: (C) — Both statements together are sufficient'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'PEMDAS Word Problem: Formula Evaluation',
      q_text: `A company's profit is calculated as P = R − (C + 0.1 × R²), where R is revenue in thousands and C is fixed cost in thousands. If R = 20 and C = 15, what is P (in thousands)?

(A) −35
(B) −25
(C) −15
(D) −5
(E) 5`,
      question_type: 'PS',
      signals: 'Substitute into formula with order of operations. Must compute R² first, then multiply by 0.1, then add C, then subtract from R.',
      trap: 'Computing R − C first (= 5) then subtracting 0.1 × R² = 40, getting −35 instead of following PEMDAS inside parentheses.',
      method: 'P = 20 − (15 + 0.1 × 400) = 20 − (15 + 40) = 20 − 55 = −35.',
      steps: [
        'R² = 20² = 400',
        '0.1 × R² = 0.1 × 400 = 40',
        'C + 0.1 × R² = 15 + 40 = 55',
        'P = R − 55 = 20 − 55 = −35',
        'Correct answer: (A) −35'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Comparison: Two Expressions with Nested Operations',
      q_text: `Column A: (3 + 4)²
Column B: 3² + 4²

(A) Column A is greater
(B) Column B is greater
(C) The two columns are equal
(D) The relationship cannot be determined`,
      question_type: 'PS',
      signals: 'Comparison of (a+b)² vs a² + b². Tests knowledge that (a+b)² = a² + 2ab + b² ≠ a² + b².',
      trap: 'Thinking (3+4)² = 3² + 4² — distributing the exponent over addition.',
      method: '(3+4)² = 7² = 49. 3² + 4² = 9 + 16 = 25. Column A > Column B.',
      steps: [
        'Column A: (3 + 4)² = 7² = 49',
        'Column B: 3² + 4² = 9 + 16 = 25',
        '49 > 25',
        'Correct answer: (A) — Column A is greater'
      ],
      difficulty: 'Medium'
    }
  ],

  'Ratios & Proportions': [
    {
      subtype: 'Ratio Hard: Three-Part Ratio After Redistribution',
      q_text: `The initial ratio of shares among A, B, and C is 3:4:5. If A transfers 20% of A's share to C, what is the new ratio of A:B:C?

(A) 12:20:27
(B) 12:20:28
(C) 3:5:7
(D) 12:16:22
(E) 6:10:14`,
      question_type: 'PS',
      signals: 'Three-part ratio with a redistribution. Must compute 20% of A and move it to C.',
      trap: 'Computing 20% of the total instead of 20% of A\'s share alone. Or forgetting to reduce to simplest form.',
      method: 'Let shares = 3x, 4x, 5x. A gives 20% of 3x = 0.6x to C. New A = 2.4x, B = 4x, C = 5.6x. Ratio = 2.4:4:5.6 = 12:20:28.',
      steps: [
        'Initial shares: A = 3x, B = 4x, C = 5x',
        '20% of A = 0.2 × 3x = 0.6x',
        'New A = 3x − 0.6x = 2.4x',
        'New C = 5x + 0.6x = 5.6x',
        'Ratio = 2.4 : 4 : 5.6 → multiply by 5 → 12 : 20 : 28',
        'Correct answer: (B) 12:20:28'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'Ratio Word Problem: Paint Mixing',
      q_text: `To make a specific shade of purple, red and blue paint must be mixed in the ratio 3:2. A painter has 15 gallons of red and 8 gallons of blue. What is the maximum amount of purple paint (in gallons) that can be made?

(A) 15
(B) 18
(C) 20
(D) 23
(E) 25`,
      question_type: 'PS',
      signals: 'Ratio constraint with limited supply of each component. The limiting reagent determines max output.',
      trap: 'Using all of both colors: 15 + 8 = 23, but this violates the 3:2 ratio.',
      method: 'If all red used: 15 red needs 10 blue. Have 8 blue → blue is limiting. Use all 8 blue → need 12 red. Total = 12 + 8 = 20.',
      steps: [
        'Ratio 3:2 → red = 3x, blue = 2x',
        'Red constraint: 3x ≤ 15 → x ≤ 5',
        'Blue constraint: 2x ≤ 8 → x ≤ 4',
        'Limiting: x = 4 (blue is the constraint)',
        'Red used = 12, blue used = 8, total = 20',
        'Correct answer: (C) 20'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Trap: Ratio vs. Actual Value',
      q_text: `In a school, the ratio of boys to girls is 3:5. There are 24 boys. A student calculates the number of girls as follows: "3:5 = 24:x, so x = 24 × 5 ÷ 3 = 40." Another student says: "The ratio 3:5 means there are 3 boys and 5 girls for every 8 students, so girls = (5/8) × 24 = 15." Which calculation is correct?

(A) Only the first student
(B) Only the second student
(C) Both students
(D) Neither student
(E) Cannot be determined`,
      question_type: 'PS',
      signals: 'Tests correct proportion setup. The second student incorrectly uses 24 as the total instead of the number of boys.',
      trap: 'Choosing (B) — the second student uses 24 as the total, but 24 is the number of boys, not total students.',
      method: 'First student: 3/5 = 24/x → x = 40. Correct. Second student: 24 is boys, not total; total = 24 × (8/3) = 64; girls = 64 − 24 = 40. Student 2 is wrong.',
      steps: [
        'Student 1: cross-multiply 3:5 = 24:x → x = 24 × 5/3 = 40 girls. Correct.',
        'Student 2: uses 24 as total, but 24 = boys only. 5/8 × 24 = 15 is wrong.',
        'Actual total = 24 × (8/3) = 64. Girls = 64 − 24 = 40.',
        'Correct answer: (A) — Only the first student'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Comparison: Direct vs. Inverse Proportion',
      q_text: `x and y are inversely proportional. When x = 4, y = 10. If x doubles to 8, let the new y be y_new.

Column A: y_new
Column B: y/2 (i.e., 5)

(A) Column A is greater
(B) Column B is greater
(C) The two columns are equal
(D) The relationship cannot be determined`,
      question_type: 'PS',
      signals: 'Inverse proportion: xy = k. When x doubles, y halves. Compare new y with y/2.',
      trap: 'Thinking inverse proportion means y decreases by the same amount x increased (additive thinking).',
      method: 'xy = k = 40. New x = 8 → y_new = 40/8 = 5. y/2 = 10/2 = 5. Equal.',
      steps: [
        'Inverse proportion: xy = k = 4 × 10 = 40',
        'x doubles to 8: y_new = 40/8 = 5',
        'y/2 = 10/2 = 5',
        'Both columns equal 5',
        'Correct answer: (C) — The two columns are equal'
      ],
      difficulty: 'Medium'
    }
  ],

  'Percentages & Markups': [
    {
      subtype: 'DS: What Is the Original Price?',
      q_text: `An item is sold at a 20% discount. What was the original price?

(1) The discount amount is $30.
(2) The sale price is $120.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: '20% discount means sale = 0.80 × original. Either the discount amount or the sale price pins the original.',
      trap: 'Thinking you need both statements. Each alone is sufficient: discount = 0.20 × original, or sale = 0.80 × original.',
      method: 'Statement 1: 0.20 × P = 30 → P = 150. Sufficient. Statement 2: 0.80 × P = 120 → P = 150. Sufficient. Each alone works.',
      steps: [
        'Statement (1): 20% of original = $30 → original = 30/0.20 = $150. Sufficient.',
        'Statement (2): sale price = 80% of original → 120 = 0.80 × P → P = $150. Sufficient.',
        'Each statement alone is sufficient.',
        'Correct answer: (D) — Each statement ALONE is sufficient'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Percent Word Problem: Commission + Salary',
      q_text: `A salesperson earns a base salary of $2,000 per month plus 8% commission on all sales. In a month where total earnings were $3,600, what was the total sales amount?

(A) $12,500
(B) $15,000
(C) $20,000
(D) $25,000
(E) $45,000`,
      question_type: 'PS',
      signals: 'Linear equation: base + commission rate × sales = total earnings. Solve for sales.',
      trap: 'Computing 8% of $3,600 = $288 or forgetting to subtract base salary before dividing by commission rate.',
      method: '2000 + 0.08S = 3600 → 0.08S = 1600 → S = 20,000.',
      steps: [
        'Total earnings = base + commission',
        '3,600 = 2,000 + 0.08 × S',
        '0.08 × S = 1,600',
        'S = 1,600 / 0.08 = 20,000',
        'Correct answer: (C) $20,000'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Trap: Percent Increase Then Decrease ≠ Original',
      q_text: `A stock price increases by 20% on Monday, then decreases by 20% on Tuesday. Compared to the original price, the stock is now:

(A) Back to the original price
(B) 4% higher than the original
(C) 4% lower than the original
(D) 2% lower than the original
(E) 2% higher than the original`,
      question_type: 'PS',
      signals: 'Successive percent changes — classic trap where students think +20% then −20% cancel out.',
      trap: 'Choosing (A), thinking the changes cancel. They do NOT because the base changes between operations.',
      method: 'Multiplier: 1.20 × 0.80 = 0.96 → net change = −4%.',
      steps: [
        'Start with price P',
        'After +20%: P × 1.20 = 1.20P',
        'After −20%: 1.20P × 0.80 = 0.96P',
        'Net change: 0.96 − 1 = −0.04 = −4%',
        'Correct answer: (C) — 4% lower than the original'
      ],
      difficulty: 'Medium'
    }
  ],

  'Word Problems — Rate, Work & Mixture': [
    {
      subtype: 'Rate Hard: Three Pipes, Two Open at Different Times',
      q_text: `Pipe A can fill a tank in 6 hours, Pipe B in 4 hours, and Pipe C can drain the tank in 12 hours. Pipes A and B are opened together. After 1 hour, Pipe C is also opened. How many total hours (from the start) does it take to fill the tank?

(A) 2 hours
(B) 2.5 hours
(C) 2.75 hours
(D) 3 hours
(E) 3.6 hours`,
      question_type: 'PS',
      signals: 'Combined work with a drain pipe joining after a delay. Must compute work done in first hour, then rate after C opens.',
      trap: 'Using all three pipes from the start, or forgetting that C drains (negative rate).',
      method: 'Rates: A=1/6, B=1/4, C=−1/12. First hour (A+B): 5/12. Remaining = 7/12. Combined A+B+C = 1/3/hr. Time = 7/12 ÷ 1/3 = 7/4h. Total = 1 + 7/4 = 11/4 = 2.75h.',
      steps: [
        'Rate A = 1/6, Rate B = 1/4, Rate C = −1/12 (drain)',
        'First hour (A + B only): 1/6 + 1/4 = 2/12 + 3/12 = 5/12 of tank filled',
        'Remaining after 1 hour: 1 − 5/12 = 7/12',
        'After hour 1, all three open: 1/6 + 1/4 − 1/12 = 2/12 + 3/12 − 1/12 = 4/12 = 1/3 per hour',
        'Time for remaining 7/12 at rate 1/3: (7/12) ÷ (1/3) = 7/4 = 1.75 hours',
        'Total time = 1 + 1.75 = 2.75 hours',
        'Correct answer: (C) 2.75 hours'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'DS: How Long for Both to Finish Together?',
      q_text: `Machine A can complete a job in 6 hours working alone. Machine B can complete the same job in x hours working alone. How long does it take for both machines to complete the job together?

(1) x = 3
(2) Machine B is twice as fast as Machine A.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'Combined work rate = 1/6 + 1/x. Need x to find combined time. Each statement pins x.',
      trap: 'Thinking statement 2 is insufficient because it gives a ratio, not a number. But A takes 6h, so "twice as fast" → B takes 3h.',
      method: 'Statement 1: x = 3 → combined = 1/6 + 1/3 = 1/2 → 2 hours. Sufficient. Statement 2: B twice as fast → B rate = 2 × (1/6) = 1/3 → x = 3. Same result. Sufficient.',
      steps: [
        'Statement (1): x = 3 → combined rate = 1/6 + 1/3 = 1/2 → time = 2 hours. Sufficient.',
        'Statement (2): B twice as fast → B rate = 2/6 = 1/3 → x = 3 → combined rate = 1/2 → time = 2 hours. Sufficient.',
        'Each statement alone is sufficient.',
        'Correct answer: (D) — Each statement ALONE is sufficient'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Trap: Average Speed ≠ Arithmetic Mean of Speeds',
      q_text: `A car travels from City A to City B at 60 mph, and returns from City B to City A at 40 mph. What is the average speed for the entire round trip?

(A) 45 mph
(B) 48 mph
(C) 50 mph
(D) 52 mph
(E) 55 mph`,
      question_type: 'PS',
      signals: 'Round trip at different speeds — average speed = total distance / total time, NOT arithmetic mean.',
      trap: 'Choosing (C) 50 mph by averaging 60 and 40. Average speed is the harmonic mean, not arithmetic mean.',
      method: 'Let distance = d each way. Total distance = 2d. Total time = d/60 + d/40 = 2d/120 + 3d/120 = 5d/120. Avg speed = 2d/(5d/120) = 240/5 = 48.',
      steps: [
        'Let one-way distance = d',
        'Time going = d/60, Time returning = d/40',
        'Total time = d/60 + d/40 = (2d + 3d)/120 = 5d/120',
        'Average speed = 2d / (5d/120) = 2d × 120/(5d) = 240/5 = 48 mph',
        'Correct answer: (B) 48 mph'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'Comparison: More Concentrated Mixture',
      q_text: `Solution A is 30% acid. Solution B is 50% acid. Equal volumes of A and B are mixed.

Column A: Concentration of the mixture
Column B: 40%

(A) Column A is greater
(B) Column B is greater
(C) The two columns are equal
(D) The relationship cannot be determined`,
      question_type: 'PS',
      signals: 'Equal volume mixture — the resulting concentration is the simple average of the two concentrations.',
      trap: 'Overcomplicating with weighted average formula. With equal volumes, it is just the arithmetic mean.',
      method: 'Equal parts: average concentration = (30% + 50%) / 2 = 40%. Equal.',
      steps: [
        'Let volume of each = V',
        'Acid from A = 0.30V, Acid from B = 0.50V',
        'Total acid = 0.80V, Total volume = 2V',
        'Concentration = 0.80V / 2V = 0.40 = 40%',
        'Both columns equal 40%',
        'Correct answer: (C) — The two columns are equal'
      ],
      difficulty: 'Medium'
    }
  ],

  'Statistics & Probability': [
    {
      subtype: 'Statistics Hard: Standard Deviation Change After Transformation',
      q_text: `A data set has a mean of 50 and a standard deviation of 8. Every value in the set is multiplied by 3 and then increased by 5. What is the new standard deviation?

(A) 8
(B) 24
(C) 29
(D) 155
(E) 160`,
      question_type: 'PS',
      signals: 'Linear transformation of data: y = ax + b. SD is affected by multiplication but NOT addition.',
      trap: 'Choosing (C) 29 by computing 8 × 3 + 5 = 29. Addition does not affect SD.',
      method: 'SD(ax + b) = |a| × SD(x). New SD = 3 × 8 = 24.',
      steps: [
        'Rule: SD(ax + b) = |a| × SD(x)',
        'Here a = 3, b = 5',
        'New SD = 3 × 8 = 24',
        'Adding 5 shifts all values but does not change spread',
        'Correct answer: (B) 24'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'DS: Is the Mean Greater Than the Median?',
      q_text: `Set S consists of 5 positive integers. Is the mean of S greater than the median of S?

(1) The range of S is 20.
(2) Four of the five values are 10, 12, 14, and 30.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'Mean vs median — skewed distributions have mean > median (right skew). Need specific values to determine.',
      trap: 'Thinking statement 1 is sufficient. A large range suggests skew but does not guarantee it.',
      method: 'Statement 1: range = 20 tells nothing about distribution. Insufficient. Statement 2: 4 values known. 5th value unknown — if 5th ≤ 14, median = 12 or 14, mean varies. Need to check all cases.',
      steps: [
        'Statement (1): range = 20 — could be symmetric (e.g., 10,15,15,15,30 → mean=median=17) or skewed. Insufficient.',
        'Statement (2): values include 10, 12, 14, 30, and unknown x.',
        'If x ≤ 10: sorted = x,10,12,14,30, median=12, mean=(66+x)/5. For x=10: mean=15.2>12. Yes.',
        'If 10<x≤12: median=12, mean=(66+x)/5 ≥ 76/5=15.2>12. Yes.',
        'If 12<x≤14: median=x, mean=(66+x)/5. Need (66+x)/5 > x → 66+x > 5x → 66 > 4x → x < 16.5. Since x ≤ 14, always yes.',
        'If 14<x≤30: median=14, mean=(66+x)/5 > (66+14)/5 = 16 > 14. Yes.',
        'If x>30: median=14, mean > (66+30)/5 = 19.2 > 14. Yes.',
        'In all cases, mean > median. Statement 2 alone is sufficient.',
        'Correct answer: (B) — Statement (2) ALONE is sufficient'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Statistics Word Problem: Class Score Distribution',
      q_text: `The average score of 20 students in a class is 78. If the average score of 12 of those students is 82, what is the average score of the remaining 8 students?

(A) 70
(B) 72
(C) 74
(D) 76
(E) 80`,
      question_type: 'PS',
      signals: 'Weighted average — total sum = group1 sum + group2 sum. Solve for unknown group average.',
      trap: 'Averaging the two averages: (78 + 82)/2 = 80. Wrong because group sizes differ.',
      method: 'Total = 20 × 78 = 1560. Group 1 = 12 × 82 = 984. Group 2 = 1560 − 984 = 576. Average = 576/8 = 72.',
      steps: [
        'Total sum = 20 × 78 = 1,560',
        'Sum of 12 students = 12 × 82 = 984',
        'Sum of remaining 8 = 1,560 − 984 = 576',
        'Average of remaining 8 = 576 / 8 = 72',
        'Correct answer: (B) 72'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Trap: Adding an Element Equal to the Mean',
      q_text: `A set of 10 numbers has a mean of 45. If an 11th number equal to 45 is added to the set, what is the new mean?

(A) 40.9
(B) 44
(C) 45
(D) 45.5
(E) 49.5`,
      question_type: 'PS',
      signals: 'Adding a value equal to the current mean. Tests whether students know this preserves the mean.',
      trap: 'Thinking the mean changes (increases or decreases). Adding a value equal to the mean does not change it.',
      method: 'Original sum = 10 × 45 = 450. New sum = 450 + 45 = 495. New mean = 495/11 = 45.',
      steps: [
        'Original sum = 10 × 45 = 450',
        'Add 45: new sum = 495',
        'New mean = 495 / 11 = 45',
        'Rule: adding a value equal to the mean does not change the mean',
        'Correct answer: (C) 45'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Comparison: Range of Two Data Sets',
      q_text: `Set A has mean 50 and standard deviation 10. Set B has mean 50 and standard deviation 15.

Column A: The range of Set A
Column B: The range of Set B

(A) Column A is greater
(B) Column B is greater
(C) The two columns are equal
(D) The relationship cannot be determined`,
      question_type: 'PS',
      signals: 'SD measures spread, and higher SD generally means larger range — but range depends on specific values, not just SD.',
      trap: 'Choosing (B) because higher SD implies larger range. While often true, range depends on exact data points — a set could have one extreme outlier.',
      method: 'SD does not uniquely determine range. Example: Set A could be {30,50,50,50,70} with range 40, or {40,45,50,55,60} with range 20, both with different SDs. Cannot determine.',
      steps: [
        'SD measures average spread from mean, not min-to-max difference',
        'Higher SD does not guarantee larger range',
        'Set A: could have range 30 or range 60 depending on distribution',
        'Set B: similarly, range is not determined by SD alone',
        'Without knowing the actual data points, the comparison is indeterminate',
        'Correct answer: (D) — The relationship cannot be determined'
      ],
      difficulty: 'Medium'
    }
  ],

  'Geometry': [
    {
      subtype: 'DS: Is the Quadrilateral a Rectangle?',
      q_text: `Quadrilateral ABCD has opposite sides that are parallel. Is ABCD a rectangle?

(1) One angle of ABCD is 90°.
(2) The diagonals of ABCD are equal in length.

(A) Statement (1) ALONE is sufficient
(B) Statement (2) ALONE is sufficient
(C) BOTH statements TOGETHER are sufficient
(D) EACH statement ALONE is sufficient
(E) Statements (1) and (2) TOGETHER are NOT sufficient`,
      question_type: 'DS',
      signals: 'Parallelogram (opposite sides parallel). Rectangle = parallelogram with right angles = parallelogram with equal diagonals.',
      trap: 'Thinking you need both statements. In a parallelogram, one right angle forces all four to be 90°. Equal diagonals also suffice.',
      method: 'Parallelogram + one 90° angle → all angles 90° → rectangle. Parallelogram + equal diagonals → rectangle. Each alone sufficient.',
      steps: [
        'Given: ABCD is a parallelogram (opposite sides parallel)',
        'Statement (1): one angle = 90° → in parallelogram, consecutive angles supplement → all angles = 90° → rectangle. Sufficient.',
        'Statement (2): equal diagonals → a parallelogram with equal diagonals is a rectangle (theorem). Sufficient.',
        'Each statement alone is sufficient.',
        'Correct answer: (D) — Each statement ALONE is sufficient'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'Geometry Word Problem: Fencing a Field',
      q_text: `A farmer has 120 meters of fencing to enclose a rectangular field. One side of the field borders a river and requires no fencing. What is the maximum area of the field, in square meters?

(A) 900
(B) 1,200
(C) 1,500
(D) 1,800
(E) 3,600`,
      question_type: 'PS',
      signals: 'Optimization: three sides fenced. If sides perpendicular to river = x each, side parallel = 120 − 2x. Maximize A = x(120 − 2x).',
      trap: 'Using perimeter formula for all four sides: 2l + 2w = 120, giving l = w = 30, area = 900. But one side needs no fencing.',
      method: 'Fencing: 2x + y = 120 → y = 120 − 2x. Area = xy = x(120 − 2x) = 120x − 2x². Max at x = 30: A = 30 × 60 = 1800.',
      steps: [
        'Let x = side perpendicular to river, y = side parallel to river',
        'Fencing constraint: 2x + y = 120 → y = 120 − 2x',
        'Area = x × y = x(120 − 2x) = 120x − 2x²',
        'Maximum at x = −120/(2 × −2) = 30',
        'y = 120 − 60 = 60',
        'Maximum area = 30 × 60 = 1,800 sq meters',
        'Correct answer: (D) 1,800'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'Trap: Area of Triangle — Wrong Base/Height Pair',
      q_text: `Triangle PQR has PQ = 10, QR = 8, and the altitude from P to QR is 6. A student calculates the area as (1/2) × 10 × 8 = 40. What is the correct area?

(A) 24
(B) 30
(C) 40
(D) 48
(E) 80`,
      question_type: 'PS',
      signals: 'Area = 1/2 × base × HEIGHT. The height must be perpendicular to the chosen base. Student used two sides instead.',
      trap: 'Using (1/2) × side × side instead of (1/2) × base × perpendicular height. Two sides are NOT base and height unless they are perpendicular.',
      method: 'Base = QR = 8, perpendicular height from P to QR = 6. Area = 1/2 × 8 × 6 = 24.',
      steps: [
        'Area formula: A = 1/2 × base × height',
        'The height must be perpendicular to the base',
        'Base = QR = 8, height from P to QR = 6',
        'Area = 1/2 × 8 × 6 = 24',
        'The student\'s error: using PQ × QR as if they were base and height',
        'Correct answer: (A) 24'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Comparison: Areas of Two Geometric Figures',
      q_text: `Column A: Area of a square with side length 5
Column B: Area of a circle with diameter 6

(A) Column A is greater
(B) Column B is greater
(C) The two columns are equal
(D) The relationship cannot be determined`,
      question_type: 'PS',
      signals: 'Direct computation: square area = s², circle area = π(d/2)². Compare 25 vs 9π.',
      trap: 'Estimating π poorly or confusing radius with diameter. Diameter 6 → radius 3.',
      method: 'Square: 5² = 25. Circle: π × 3² = 9π ≈ 28.27. Column B > Column A.',
      steps: [
        'Square area = 5² = 25',
        'Circle: diameter = 6 → radius = 3',
        'Circle area = π × 3² = 9π ≈ 28.27',
        '28.27 > 25',
        'Correct answer: (B) — Column B is greater'
      ],
      difficulty: 'Medium'
    }
  ]
};

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL.\n');

  // 1. Get math topics 8–13 (OFFSET 7, LIMIT 6)
  const { rows: topics } = await client.query(`
    SELECT t.id, t.title
    FROM topics t
    JOIN sections s ON t.section_id = s.id
    WHERE s.slug = 'math'
    ORDER BY t.order_idx
    LIMIT 6 OFFSET 7
  `);

  console.log(`Found ${topics.length} math topics (8–13):\n`);
  topics.forEach((t, i) => console.log(`  ${i + 8}. [${t.id}] ${t.title}`));
  console.log('');

  let totalInserted = 0;

  for (const topic of topics) {
    const missing = missingByTopic[topic.title];
    if (!missing) {
      console.log(`⚠ No missing-type data for "${topic.title}" — skipping.`);
      continue;
    }

    console.log(`── ${topic.title} (id=${topic.id}) ──`);

    // Get existing subtypes to avoid duplicates
    const { rows: existing } = await client.query(
      `SELECT subtype FROM questions WHERE topic_id = $1`,
      [topic.id]
    );
    const existingSubtypes = new Set(existing.map(r => r.subtype));

    // Get max order_idx for this topic's questions
    const { rows: [maxRow] } = await client.query(
      `SELECT COALESCE(MAX(order_idx), -1) AS max_idx FROM questions WHERE topic_id = $1`,
      [topic.id]
    );
    let orderIdx = maxRow.max_idx + 1;

    let inserted = 0;
    for (const q of missing) {
      if (existingSubtypes.has(q.subtype)) {
        console.log(`  ⊘ Already exists: "${q.subtype}"`);
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
          orderIdx++
        ]
      );
      inserted++;
      totalInserted++;
    }
    console.log(`  ✓ ${inserted} questions inserted (${missing.length - inserted} already existed)`);
  }

  console.log(`\n=== Done! Inserted ${totalInserted} new questions across ${topics.length} topics. ===`);
  await client.end();
}

main().catch(err => {
  console.error('ERROR:', err.message);
  client.end();
  process.exit(1);
});
