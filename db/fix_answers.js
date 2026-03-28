const { Client } = require('../node_modules/pg');

const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// [id, answer]
const answers = [
  [5,  '60 litres — 4/5 − 3/5 = 1/5 of tank = 12 L. Total = 12 × 5 = 60 L.'],
  [6,  '(C) BOTH together sufficient — Need x > y AND y > 0 to guarantee x/y > 1. S1 alone: x > y but y could be negative (e.g. x=−1, y=−3 → x/y=1/3 < 1). S2 alone: y > 0 but x could be 0 or negative. Together: x > y > 0 → x/y > 1. Sufficient.'],
  [7,  '87.5% — 7 ÷ 8 = 0.875 → 87.5%.'],
  [8,  'x = 2 or x = 3 — factor: (x−2)(x−3) = 0.'],
  [10, '4x² + 12x + 9 — use (a+b)² = a² + 2ab + b²: (2x)² + 2(2x)(3) + 3² = 4x²+12x+9.'],
  [14, 'x + 5 — difference of squares: (x+5)(x−5)/(x−5) = x+5 (for x ≠ 5).'],
  [15, 'n²+n and n+1 are both even. n²+n = n(n+1) = odd×even = even. n+1 = odd+1 = even. n² alone = odd.'],
  [18, 'a+b and a²+b must both be odd. a+b = even+odd = odd ✓. ab = even×odd = even ✗. a²+b = even²+odd = even+odd = odd ✓.'],
  [19, 'p is odd ✓ (all primes > 2 are odd) AND p−1 is divisible by 2 ✓ (p odd → p−1 even). p+1 is prime is NOT guaranteed (e.g. p=5, p+1=6 is not prime).'],
  [20, 'xz < 0 — xy < 0 → x and y have opposite signs. yz > 0 → y and z have the same sign. Therefore x and z have opposite signs → xz < 0.'],
  [23, '7/40 terminates — 40 = 2³×5 (only factors of 2 and 5). 7/42 = 1/6 has a factor of 3 in the denominator → repeating decimal.'],
  [24, '6 — ⌊25/5⌋ + ⌊25/25⌋ = 5 + 1 = 6 trailing zeros.'],
  [25, '(C) BOTH together sufficient — S1: n divisible by 4; S2: n divisible by 6. LCM(4,6) = 12. Together: n divisible by 12. Each alone is insufficient (e.g. n=4: div by 4, not 12; n=6: div by 6, not 12).'],
  [26, '1 — n = 5q + 3, so 2n = 10q + 6 = 5(2q+1) + 1. Remainder when 2n divided by 5 = 1.'],
  [30, '8:36 AM — LCM(12,18) = 36 minutes. Next together = 36 min after 8:00 AM = 8:36 AM.'],
  [33, '6√2 — √72 = √(36×2) = 6√2.'],
  [34, 'No — √25 + √16 = 5 + 4 = 9. But √41 ≈ 6.4. You CANNOT add values under separate radicals.'],
  [35, '5 — √50/√2 = √(50/2) = √25 = 5.'],
  [36, '2√3 — multiply by √3/√3: 6√3/3 = 2√3.'],
  [37, '√50 > 7 — √49 = 7, so √50 > √49 = 7. Specifically √50 ≈ 7.07.'],
  [38, 'x = 11 — x+5 = 16 → x = 11. Check: √16 = 4 ✓.'],
  [39, 'x^(5/6) — add exponents: 1/2 + 1/3 = 3/6 + 2/6 = 5/6.'],
  [40, '3 — cycle for 7: 7,9,3,1 (period 4). 23 mod 4 = 3. Third position in cycle = 3.'],
  [41, '4³ = 64 — 4^(6+2−5) = 4³ = 64.'],
  [43, '3⁻³ = 1/27 — 3^(5−8) = 3⁻³ = 1/27.'],
  [44, '3²⁰ > 2³⁰ — log₂(3²⁰) = 20×log₂3 ≈ 20×1.585 = 31.7 > 30. So 3²⁰ > 2³⁰.'],
  [45, '2⁷ = 128 — (2³)⁴ = 2¹² then 2¹² × 2⁻⁵ = 2⁷ = 128.'],
  [46, '1 — cycle for 3: 3,9,7,1 (period 4). 100 mod 4 = 0 → 4th position = 1.'],
  [47, '17 — exponent first: 2² = 4. Multiply: 4×4 = 16. Subtract parentheses: 5−3 = 2. Then: 3+16−2 = 17.'],
  [48, 'x — [4(x+3)−12]/4 = [4x+12−12]/4 = 4x/4 = x.'],
  [49, '14 — multiply first: 3×4 = 12. Then add: 2+12 = 14. Student incorrectly added first (left-to-right without order of ops).'],
  [50, '33 — exponent: 4² = 16. Parentheses: 3+16 = 19. Multiply: 2×19 = 38. Divide: 10÷2 = 5. Subtract: 38−5 = 33.'],
  [51, '3x(2x+3) — GCF of 6x² and 9x is 3x.'],
  // Argument Structure
  [52, 'Assumption: No other factors (economic improvement, product changes, seasonality) caused the profit rise. The argument assumes the ad campaign was the sole or primary cause.'],
  [53, 'Best weakener: "Students who eat breakfast tend to come from households with more resources, which also correlate with academic performance." This provides an alternative explanation (confounding variable) rather than a causal link.'],
  [54, 'Strengthen: "No other changes were made to the factory or surrounding area during the same period." This rules out alternative causes and supports the causal claim.'],
  [55, 'Conclusion: "Team Alpha is our most innovative team." (The "therefore" clause is the conclusion. "All best-sellers came from Team Alpha" is the premise.)'],
  [56, 'Premises: (1) Crime rates have fallen every year. (2) The city increased police patrols during this period. The conclusion is: "Police patrols reduce crime." Both declining crime AND patrol increase are premises; the causal link is the conclusion.'],
  // CR — Weaken
  [57, 'Classic weakener: "Several other anti-litter initiatives (fines, more trash cans, public campaigns) were also implemented at the same time." This provides an alternative cause for the litter reduction, breaking the causal claim.'],
  [58, 'Trap: "Remote workers also earn higher salaries on average." This is a trap because it explains WHY remote workers may be more satisfied (money) rather than addressing whether remote work itself causes satisfaction. It does weaken somewhat but isn\'t a targeted attack on the argument\'s logic.'],
  [59, 'Weakener: "The hospital also hired a new patient safety director and implemented new medication protocols at the same time as the electronic records switch." Alternative cause undermines the causal claim.'],
  [60, 'Data flaw: Survey of gym members only — selection bias. People who already go to the gym are self-selected; those who don\'t exercise weren\'t surveyed. Cannot generalize to the population.'],
  // CR — Strengthen & Assumption
  [61, 'Negation test result: If the assumption is false ("X has severe side effects"), prescribing X to all patients would be harmful despite reducing symptoms — the conclusion (prescribe X to all) would be destroyed. Therefore, "X has no severe side effects" is a necessary assumption.'],
  [62, 'Strengthen: "Studies show that freshness of food (shorter time from harvest to consumption) is a primary determinant of its nutritional content." This bridges "fresher → healthier" directly.'],
  [63, 'Trap answer: "The tutoring program is affordable and scalable." This addresses feasibility, not whether the program actually improves scores. It\'s irrelevant to the causal claim. Correct strengtheners must support why scores improved due to the tutoring.'],
  [64, 'Assumption: "The increase in collaboration is attributable to the open-plan layout, not to other concurrent changes (team reorganization, new collaboration tools, etc.)." Strengthener: "A comparable company that did not switch to open-plan saw no change in collaboration during the same period."'],
  // CR — Other Types
  [65, '(Inference) All directors must have MBAs (since no one without an MBA has been promoted to director). Some 10-year veterans have MBAs. Cannot conclude all 10-year veterans are directors. Must be true: "All directors at Company Z have MBAs."'],
  [66, '(Evaluate) "What percentage of current car commuters live within a reasonable cycling distance of their workplace?" If most live too far to cycle, bike lanes won\'t shift commuter behavior. Answering yes → strengthens; no → weakens.'],
  [67, '(Paradox) Possible explanations: (1) The education spending went to administration/infrastructure rather than classroom instruction. (2) A new, harder standardized test was introduced. (3) Teacher quality declined due to other factors. (4) Student demographics shifted. Any factor explaining how MORE money → WORSE scores resolves the paradox.'],
  [68, '(Boldface) First bold = evidence that challenges the main conclusion (counter-argument: solar costs dropped). Second bold = the main conclusion ("renewable is now competitive"). The argument structure: critics say expensive → counter: costs fell 90% → conclusion: now competitive.'],
  // RC — Strategy
  [69, 'Trap: The passage says Theory C is "promising," not "correct." Promising = worthy of further study, not proven. Main idea must cover ALL three theories being discussed, not just advocate for C.'],
  [70, 'Detail question approach: Return to the passage and find "GDP rose 3% in Q2" — read the exact text. Answer: The economic growth rate in Q2 was 3%. For detail questions, paraphrase the passage text directly — don\'t interpret.'],
  [71, 'What can be inferred: "The scientific view of coffee\'s health effects has changed over time." (Early = harmful; recent = potentially protective.) Cannot infer: coffee is definitely healthy. Cannot infer: all coffee is protective. Must stay close to the shift from "harmful" to "may have protective effects."'],
  [72, '"Predictably" reveals the author expected the disappointing results — suggesting the author was skeptical or critical of the initiative from the start. Tone: critical, unsurprised, perhaps somewhat cynical.'],
  [73, 'RC strengthen differs from CR strengthen: In RC, you cannot add new information from outside the passage — you find within-passage support. In CR, you introduce a new fact that supports the argument. RC strengthen = find what the passage itself uses as evidence for the claim. CR strengthen = add new external evidence.'],
  // RC — Question Types
  [74, 'Eliminate: (A) "Coral reefs are dying worldwide" — too broad and vague; doesn\'t capture the specific focus on temperature as cause. (C) "Ocean pollution harms marine life" — not stated in this passage (wrong topic). (B) correct — captures the specific causal claim (temperature → coral decline).'],
  [75, '"Universally accepted" is too strong. "Largely confirmed" means most follow-up studies agreed, but "universally" implies 100% consensus. The word "largely" signals some disagreement remains. Always match the intensity of the inference to the passage\'s language.'],
  [76, 'P3 function: Present criticisms of the proposed solution. It provides the counterargument — evidence against the solution — which P4 then addresses. Structural role: acknowledging opposing evidence before the conclusion, making the argument more balanced and persuasive.'],
  [77, 'Author\'s tone: "Measured support" or "cautiously balanced." The author acknowledges concerns ("not unfounded") but advocates for benefits ("substantial," "should not be dismissed"). Not purely positive or negative — qualified endorsement.'],
  // DS Framework
  [78, '(C) BOTH together sufficient — S1: x²=9 → x=3 or x=−3. Not sufficient alone. S2: x>0, doesn\'t give specific value. Together: x²=9 AND x>0 → x=3. Sufficient.'],
  [79, '(B) Statement 2 ALONE sufficient? No. S1: x³>0 → x>0 (odd power preserves sign) → SUFFICIENT. S2: x²>0 → x≠0, could be positive or negative → NOT sufficient. Answer: (A) Statement 1 alone sufficient.'],
  [80, '(D) EACH alone sufficient — S1: 2n is even — but 2n is always even for any integer n. NOT sufficient (tells us nothing). Wait: 2n is always even. So S1 gives no info. S2: n+1 is odd → n is even. SUFFICIENT. Answer: (B) Statement 2 alone sufficient.'],
  [81, '(D) EACH alone sufficient — S1: x=3 → x+y=3+y. Not sufficient (don\'t know y). Wait: need BOTH. S1 gives x, S2 gives y → together: x+y=10. Answer: (C) BOTH together sufficient.'],
  [82, '(C) BOTH together sufficient — S1: x>0 alone doesn\'t determine xy sign. S2: y<0 alone doesn\'t determine xy sign. Together: x>0 AND y<0 → xy<0, so NO, xy is not > 0. Answer: (C).'],
  // DS Advanced Traps
  [83, '(B) Statement 2 alone sufficient — S1: x²>0 → x≠0, but could be positive or negative. NOT sufficient. S2: x³>0 → x>0 (cube preserves sign). SUFFICIENT. Answer: (B).'],
  [84, '(D) EACH alone sufficient — S1: x>1 → x²>x (e.g. x=2: 4>2 ✓). SUFFICIENT. S2: x<0 → x²>0>x, so x²>x. SUFFICIENT. Answer: (D).'],
  [85, '(C) BOTH together sufficient — x²<x means 0<x<1. S1: x>0, not enough (could be x=5). S2: x<1, not enough (could be x=−1). Together: 0<x<1 → x²<x always. SUFFICIENT. Answer: (C).'],
  [86, '(C) BOTH together sufficient — S1: 10<n<14 → n∈{11,12,13}. Not unique. S2: n is odd → could be many primes. Together: odd and 10<n<14 → n∈{11,13}. Both prime. Still not unique. Answer: (E) NOT sufficient.'],
  // Multi-Source Reasoning
  [87, '$20,000 per employee — $5,000,000 ÷ 250 = $20,000. Revenue per employee requires dividing Tab 1 value by Tab 2 value.'],
  [88, 'No — CEO\'s claim is false. Company grew 15% vs industry average 20%. Growing below average is NOT "outpacing the industry." The CEO\'s statement is not supported by the data.'],
  [89, 'Cannot be determined — Tab 1 only shows Q1-Q3. Q4 data is not provided. Even with employee counts, there\'s no basis to calculate or estimate Q4 sales.'],
  // Table Analysis
  [90, 'Calculate GDP per capita = GDP/Population for each country row. Sort (mentally or by scanning) for the highest ratio. The country with the smallest population relative to its GDP will rank highest. Always divide — don\'t just look at absolute GDP.'],
  [91, 'Filter: Category = "Electronics." Then count rows with Rating ≥ 4.0. Use the sort function to sort by Category, then scan Rating column for the Electronics subset.'],
  [92, 'TRUE — 8 out of 15 companies have revenue above $10M. 8/15 ≈ 53% > 50%, which is a majority.'],
  // Graphics Interpretation
  [93, 'No — the y-axis starts at 150, not 0. Actual increase = 50 (from 200 to 250), which is a 25% increase, not a tripling. Truncated y-axes exaggerate visual changes. Always check the y-axis baseline.'],
  [94, 'Product A\'s growth rate slowed after Q2 — the steep rise from Q1 to Q2 indicates high growth rate; the gradual rise Q2 to Q4 indicates the rate of increase slowed. Note: the absolute level continued to rise, just more slowly.'],
  [95, 'No — correlation ≠ causation. A negative correlation shows that as TV hours increase, test scores tend to decrease, but this could be due to a third variable (e.g., students with less study time both watch more TV and score lower). The scatter plot cannot establish causation.'],
  [96, '$80,000 — Other = 100%−35%−25%−20% = 20%. Product C = 20% of $400,000 = $80,000.'],
  // Two-Part Analysis
  [97, 'x=6, y=4 — satisfies x+y=10 (6+4=10), x>y (6>4), and both are in the available set {2,3,4,5,6,7,8}.'],
  [98, 'Team: Alice + one more from Dept A + Dan, Eve, Frank (or any 3 from Dept B). NOT on team from Dept A: Bob or Carol (one of them). NOT on team from Dept B: Grace (if Dan/Eve/Frank chosen). Multiple valid answers — key is Alice is included and exactly 2 from A, 3 from B.'],
  [99, 'To maximize m−r: minimize r (set r=$40,000 minimum). Then m=$100,000−$40,000=$60,000. Check m≥$30,000 ✓. Max m−r = $60,000−$40,000 = $20,000.'],
];

async function run() {
  await c.connect();
  let count = 0;
  for (const [id, answer] of answers) {
    const res = await c.query('UPDATE practice_items SET answer = $1 WHERE id = $2', [answer, id]);
    if (res.rowCount > 0) count++;
  }
  console.log(`✅ Updated ${count}/${answers.length} practice items`);

  const remaining = await c.query('SELECT COUNT(*) FROM practice_items WHERE answer IS NULL OR answer = \'\'');
  console.log(`📊 Still null: ${remaining.rows[0].count}`);
  await c.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
