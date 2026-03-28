const SUPABASE_URL = 'https://ykllxaopintikehgtqnj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbGx4YW9waW50aWtlaGd0cW5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY5MzgyNywiZXhwIjoyMDkwMjY5ODI3fQ.8tJ5-hfDRiFSv9_AF-Dqf1fP6R96yBY23LXALylR62Q';

async function sb(table, method = 'GET', body = null, params = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : '',
    },
    body: body ? JSON.stringify(body) : null
  });
  if (!res.ok) throw new Error(`${method} ${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function getMaxOrderIdx(sectionId) {
  const topics = await sb('topics', 'GET', null, `?section_id=eq.${sectionId}&order=order_idx.desc&limit=1`);
  return topics.length ? topics[0].order_idx : -1;
}

async function insertTopic(sectionId, title, subtitle, icon, orderIdx) {
  const [topic] = await sb('topics', 'POST', { section_id: sectionId, title, subtitle, icon, order_idx: orderIdx });
  console.log(`  ✓ Topic: ${title} (id=${topic.id}, order=${orderIdx})`);
  return topic.id;
}

async function insertEquations(topicId, eqs) {
  for (let i = 0; i < eqs.length; i++) {
    const [label, formula, note, detail] = eqs[i];
    await sb('equations', 'POST', { topic_id: topicId, label, formula, note, detail, order_idx: i });
  }
  console.log(`    + ${eqs.length} equations`);
}

async function insertRules(topicId, rules) {
  for (let i = 0; i < rules.length; i++) {
    const [title, content] = rules[i];
    await sb('rules', 'POST', { topic_id: topicId, title, content, order_idx: i });
  }
  console.log(`    + ${rules.length} rules`);
}

async function insertMethods(topicId, methods) {
  for (let i = 0; i < methods.length; i++) {
    const m = methods[i];
    await sb('methods', 'POST', { topic_id: topicId, name: m.name, when_to_use: m.when_to_use, steps: m.steps, tip: m.tip, order_idx: i });
  }
  console.log(`    + ${methods.length} methods`);
}

async function insertQuestions(topicId, questions) {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await sb('questions', 'POST', {
      topic_id: topicId, subtype: q.subtype, q_text: q.q_text, question_type: q.question_type,
      signals: q.signals, trap: q.trap, method: q.method, steps: q.steps, difficulty: q.difficulty, order_idx: i
    });
  }
  console.log(`    + ${questions.length} questions`);
}

async function insertPractice(topicId, items) {
  for (let i = 0; i < items.length; i++) {
    const [question, question_type, answer] = items[i];
    await sb('practice_items', 'POST', { topic_id: topicId, question, question_type, answer, order_idx: i });
  }
  console.log(`    + ${items.length} practice items`);
}

async function main() {
  // Get section IDs
  const sections = await sb('sections');
  const mathSection = sections.find(s => s.slug === 'math' || s.title.toLowerCase().includes('math'));
  const verbalSection = sections.find(s => s.slug === 'verbal' || s.title.toLowerCase().includes('verbal'));
  const diSection = sections.find(s => s.slug === 'di' || s.title.toLowerCase().includes('data'));
  console.log('Sections:', { math: mathSection.id, verbal: verbalSection.id, di: diSection.id });

  // Get current max order_idx for each section
  const mathMax = await getMaxOrderIdx(mathSection.id);
  const verbalMax = await getMaxOrderIdx(verbalSection.id);
  const diMax = await getMaxOrderIdx(diSection.id);
  console.log('Current max order_idx:', { math: mathMax, verbal: verbalMax, di: diMax });

  let mathIdx = mathMax + 1;
  let verbalIdx = verbalMax + 1;
  let diIdx = diMax + 1;

  // ========== MATH TOPICS ==========
  console.log('\n=== MATH TOPICS ===');

  // 1. Inequalities & Absolute Value
  {
    const tid = await insertTopic(mathSection.id, 'Inequalities & Absolute Value', 'Solving inequalities, sign flipping, absolute value equations and cases', '⚖️', mathIdx++);
    await insertEquations(tid, [
      ['Linear inequality', '$$ax + b > c \\Rightarrow x > \\frac{c-b}{a} \\text{ (if } a>0\\text{)}$$', 'Divide/multiply by negative → flip the inequality sign', 'Detail: The flip rule is the #1 error source. Always check: is the divisor positive or negative? Example: -2x > 6 → x < -3 (flipped). Multiplying both sides by -1 flips. Dividing both sides by positive: no flip.'],
      ['Compound inequality', '$$a < x < b$$', 'x satisfies BOTH conditions simultaneously', 'Detail: Solve each part while keeping x in the middle. Example: 3 < 2x+1 < 9 → 2 < 2x < 8 → 1 < x < 4. Operations apply to all three parts.'],
      ['Absolute value definition', '$$|x| = \\begin{cases} x & x \\geq 0 \\\\ -x & x < 0 \\end{cases}$$', '|x| is always non-negative', 'Detail: |x| = distance from 0 on number line. |x-a| = distance from a. Key: |x| = k has two solutions: x = k or x = -k (when k > 0). |x| < k means -k < x < k. |x| > k means x > k or x < -k.'],
      ['Absolute value equation', '$$|x - a| = k \\Rightarrow x = a+k \\text{ or } x = a-k$$', 'Split into two cases when solving |expression| = constant', 'Detail: Always check both solutions in the original equation. Extraneous solutions can appear. Example: |2x-3| = 5 → 2x-3=5 (x=4) or 2x-3=-5 (x=-1). Both valid here.'],
      ['Quadratic inequality', '$$x^2 - 5x + 6 < 0 \\Rightarrow (x-2)(x-3) < 0 \\Rightarrow 2 < x < 3$$', 'Factor, find roots, test regions', 'Detail: For (x-a)(x-b) < 0 with a < b: solution is a < x < b (between roots). For > 0: x < a or x > b (outside roots). Always use number line with test points.'],
    ]);
    await insertRules(tid, [
      ['Flip When Multiplying/Dividing by Negative', 'Multiplying or dividing both sides of an inequality by a negative number REVERSES the inequality sign. This is the most common error in inequality problems.'],
      ['Absolute Value = Distance', '|x - a| represents the distance between x and a on the number line. |x - a| < k means x is within k units of a: a-k < x < a+k.'],
      ['Two Cases for |expr| = k', 'When |f(x)| = k (k > 0): set f(x) = k AND f(x) = -k. Solve both. Check both answers — one may be extraneous.'],
      ['Quadratic Inequality: Inside vs Outside', 'For (x-a)(x-b) < 0: solution is BETWEEN roots (a < x < b). For > 0: solution is OUTSIDE roots. Draw a sign chart to be sure.'],
      ['Cannot Flip with Unknown Sign', "If you don't know whether a variable is positive or negative, you CANNOT divide both sides of an inequality by that variable. This is a key DS trap."],
    ]);
    await insertMethods(tid, [
      { name: 'Inequality Sign Chart', when_to_use: 'Quadratic or polynomial inequality', steps: ['Factor the expression completely', 'Mark roots on number line', 'Test a value in each region', 'Identify regions where expression has required sign'], tip: 'Faster and more reliable than algebraic manipulation for quadratics.' },
      { name: 'Absolute Value Case Split', when_to_use: 'Any equation or inequality with absolute value', steps: ['Set up Case 1: expression inside = positive value', 'Set up Case 2: expression inside = negative value', 'Solve each case', 'Check solutions in original — eliminate extraneous'], tip: 'Always check. |x+2| = x has only one valid solution.' },
      { name: 'DS Inequality Trap', when_to_use: 'Data Sufficiency with inequality questions', steps: ['Never assume variable sign unless given', 'Test positive, negative, and zero', 'For x > y: don\'t assume x is positive'], tip: 'GMAT DS loves trapping test-takers who assume x > 0 from x > y.' },
    ]);
    await insertQuestions(tid, [
      { subtype: 'Flip the Sign Trap', q_text: 'If -3x + 7 > 1, which of the following must be true?\n\n(A) x > 2\n(B) x < 2\n(C) x > -2\n(D) x < -2\n(E) x = 2', question_type: 'Linear inequality with sign flip', signals: 'Coefficient of x is negative. Solving requires dividing by -3.', trap: '(A) x > 2 — forgetting to flip the sign when dividing by -3.', method: '-3x > -6 → x < 2 (flip!)', steps: ['-3x + 7 > 1', '-3x > -6', 'Divide by -3: FLIP sign → x < 2', 'Answer: (B) x < 2'], difficulty: 'Easy' },
      { subtype: 'Absolute Value: Two Cases', q_text: 'How many integer solutions does |2x - 3| < 7 have?\n\n(A) 5\n(B) 6\n(C) 7\n(D) 8\n(E) Infinitely many', question_type: 'Absolute value inequality — count integer solutions', signals: '|expression| < k → compound inequality. Find range, then count integers.', trap: "(E) — forgetting this is an inequality with integer constraint.", method: '-7 < 2x-3 < 7 → -4 < 2x < 10 → -2 < x < 5. Integers: -1,0,1,2,3,4 → 6.', steps: ['-7 < 2x - 3 < 7', 'Add 3: -4 < 2x < 10', 'Divide by 2: -2 < x < 5', 'Integers in (-2, 5): -1, 0, 1, 2, 3, 4 → 6 integers', 'Answer: (B) 6'], difficulty: 'Medium' },
      { subtype: 'DS: Unknown Variable Sign', q_text: 'Is x > 0?\n\n(1) x² > x\n(2) x + |x| > 0\n\n(A) Statement (1) ALONE is sufficient\n(B) Statement (2) ALONE is sufficient\n(C) BOTH statements TOGETHER are sufficient\n(D) EACH statement ALONE is sufficient\n(E) Statements (1) and (2) TOGETHER are NOT sufficient', question_type: 'DS — absolute value and inequality', signals: 'Statement 1 gives x²>x (satisfied by x>1 AND x<0). Statement 2 involves |x|.', trap: "Statement 1: assuming x²>x means x>1. But x=-2 also works: 4>-2.", method: 'S1: x(x-1)>0 → x>1 or x<0. Insufficient. S2: x+|x|>0 → only if x>0 (if x≤0, x+|x|=0). Sufficient.', steps: ['Statement (1): x²>x → x(x-1)>0 → x>1 or x<0 — could be positive or negative → Insufficient', 'Statement (2): x+|x|>0. If x>0: x+x=2x>0 ✓. If x=0: 0. If x<0: x+(-x)=0. So only x>0 satisfies this → Sufficient', 'Answer: (B)'], difficulty: 'Hard' },
    ]);
    await insertPractice(tid, [
      ['Solve: 5 - 2x ≥ 11', 'Computation', '-3 — -2x ≥ 6 → x ≤ -3.'],
      ['Solve: |x - 4| = 6', 'Absolute value', 'x = 10 or x = -2.'],
      ['For what values of x is (x-1)(x+3) > 0?', 'Quadratic inequality', 'x > 1 or x < -3 (outside roots).'],
      ['Is |a| > |b| the same as a > b?', 'Conceptual', 'No — |a| > |b| means a is further from 0 than b, regardless of sign. Example: a=-5, b=3: |-5|>|3| but -5 < 3.'],
      ['If x/y > 0, what can you conclude?', 'Conceptual', 'x and y have the same sign (both positive or both negative). Cannot determine which sign.'],
    ]);
  }

  // 2. Functions & Symbolism
  {
    const tid = await insertTopic(mathSection.id, 'Functions & Symbolism', 'Function notation, custom GMAT symbols, composite functions, and domain/range', '𝑓', mathIdx++);
    await insertEquations(tid, [
      ['Function notation', '$$f(x) = \\text{rule applied to } x$$', 'f(a) means substitute a wherever x appears', 'Detail: f(x) is just a rule. f(3) = substitute 3 for x everywhere. f(x+1) = substitute (x+1) for x everywhere — expand carefully. Example: f(x) = x² - 2x + 1, then f(3) = 9-6+1 = 4.'],
      ['Composite function', '$$(f \\circ g)(x) = f(g(x))$$', 'Apply g first, then f to the result', "Detail: Order matters! f(g(x)) ≠ g(f(x)) in general. Work inside-out: compute g(x) first, then plug into f. Example: f(x)=x+1, g(x)=x²; f(g(2))=f(4)=5."],
      ['Custom symbol definition', '$$a \\star b = a^2 - 2ab + b^2$$', 'GMAT defines its own operators — apply the definition exactly', "Detail: When GMAT defines ★ or ⊕ or any symbol, it's just a formula. Substitute each variable in order. Common mistake: treating it like a standard operation. Trick: the definition may be a recognizable identity in disguise (like (a-b)²)."],
      ['Domain and range', '$$\\text{Domain: all valid inputs}\\quad\\text{Range: all possible outputs}$$', 'Domain restricted by: division by zero, even roots of negatives', 'Detail: Domain restrictions: 1) denominator ≠ 0, 2) expression under even root ≥ 0, 3) log argument > 0. Range: set of all f(x) values. GMAT Focus mostly tests conceptual understanding, not complex computation.'],
      ['Linear function', '$$f(x) = mx + b$$', 'Slope m, y-intercept b — a line in function notation', "Detail: f(a) - f(b) = m(a-b). Rate of change is constant = m. GMAT may give table of values and ask for f(x) expression."],
    ]);
    await insertRules(tid, [
      ['Substitute, Don\'t Assume', "When a custom symbol is defined, substitute the given values exactly. Don't assume it behaves like +, ×, or any standard operation."],
      ['Composite: Inside-Out', 'For f(g(x)): evaluate g(x) first, then plug that result into f. Never work outside-in.'],
      ['Domain Killers', 'Three things restrict domain: (1) denominator = 0, (2) even root of negative, (3) log of non-positive. Set each denominator ≠ 0 and each radicand ≥ 0.'],
      ['Recognizing Disguised Formulas', "GMAT custom symbols often hide standard formulas. Before computing, simplify: a★b = a²-2ab+b² is just (a-b)². Recognizing saves significant time."],
      ['f(x+k) vs f(x) + k', 'f(x+k) shifts the input — substitute (x+k) for x everywhere in the formula. f(x)+k shifts the output — add k after computing.'],
    ]);
    await insertMethods(tid, [
      { name: 'Direct Substitution', when_to_use: 'Any function evaluation f(value)', steps: ['Write out the function definition', 'Replace every instance of the variable with the given value', 'Simplify carefully — watch for exponents and negatives'], tip: "Write it out fully before simplifying — don't try to do it in your head." },
      { name: 'Custom Symbol Simplification', when_to_use: 'GMAT defines a★b or similar', steps: ['Write down the definition', 'Check if it simplifies to a known identity', 'If yes: apply the identity. If no: substitute directly'], tip: "Always check for (a+b)², (a-b)², difference of squares — GMAT loves hiding these." },
      { name: 'Composite Evaluation', when_to_use: 'f(g(x)) or nested function calls', steps: ['Evaluate the innermost function first', 'Use that result as input to the next function', 'Continue outward until done'], tip: "Write intermediate results explicitly. Don't chain in your head." },
    ]);
    await insertQuestions(tid, [
      { subtype: 'Custom Symbol: Hidden Identity', q_text: 'For any numbers a and b, let a ⊕ b = a² - 2ab + b². What is the value of (3 ⊕ 1) ⊕ 2?\n\n(A) 0\n(B) 1\n(C) 4\n(D) 8\n(E) 16', question_type: 'Custom symbol — recognize (a-b)²', signals: "Custom operator defined. a²-2ab+b² = (a-b)². GMAT disguising a perfect square.", trap: 'Computing 3²-2(3)(1)+1²=9-6+1=4, then 4⊕2=4²-2(4)(2)+2²=16-16+4=4 without recognizing pattern.', method: 'a⊕b = (a-b)². So 3⊕1=(3-1)²=4. Then 4⊕2=(4-2)²=4.', steps: ['Recognize: a²-2ab+b² = (a-b)²', '3⊕1 = (3-1)² = 4', '4⊕2 = (4-2)² = 4', 'Answer: (C) 4'], difficulty: 'Medium' },
      { subtype: 'Composite Function Evaluation', q_text: 'If f(x) = 2x + 1 and g(x) = x² - 3, what is f(g(3))?\n\n(A) 7\n(B) 9\n(C) 13\n(D) 15\n(E) 19', question_type: 'Composite function — inside-out evaluation', signals: 'Two functions, f and g. f(g(3)) means evaluate g(3) first.', trap: 'Computing f(3) first then applying g: g(f(3))=g(7)=49-3=46.', method: 'g(3)=9-3=6. f(6)=12+1=13.', steps: ['g(3) = 3² - 3 = 9 - 3 = 6', 'f(6) = 2(6) + 1 = 13', 'Answer: (C) 13'], difficulty: 'Easy' },
      { subtype: 'Domain Restriction', q_text: 'For which values of x is f(x) = √(x² - 9) / (x - 4) defined?\n\n(A) x ≥ 3\n(B) x ≥ 3 and x ≠ 4\n(C) x ≤ -3 or x ≥ 3\n(D) (x ≤ -3 or x ≥ 3) and x ≠ 4\n(E) All real numbers except x = 4', question_type: 'Domain — combine radical and denominator restrictions', signals: 'Two domain restrictions: square root needs x²-9 ≥ 0, denominator needs x ≠ 4.', trap: "(B) Missing x ≤ -3 from the radical constraint.", method: 'x²-9 ≥ 0 → x ≤ -3 or x ≥ 3. And x ≠ 4. Combined: (D).', steps: ['Radical: x²-9 ≥ 0 → (x-3)(x+3) ≥ 0 → x ≤ -3 or x ≥ 3', 'Denominator: x-4 ≠ 0 → x ≠ 4', 'Combined: (x ≤ -3 or x ≥ 3) and x ≠ 4', 'Answer: (D)'], difficulty: 'Hard' },
    ]);
    await insertPractice(tid, [
      ['If f(x) = 3x - 5, find f(4).', 'Computation', '7 — f(4) = 12-5 = 7.'],
      ['If a★b = 2a + b², find 3★4.', 'Custom symbol', '22 — 2(3)+4²=6+16=22.'],
      ['If f(x) = x + 2 and g(x) = 3x, find g(f(5)).', 'Composite', '21 — f(5)=7; g(7)=21.'],
      ['What is the domain of f(x) = 1/(x²-4)?', 'Domain', 'All reals except x=2 and x=-2 — denominator x²-4=(x-2)(x+2)≠0.'],
      ['If f(x) = x² and f(a) = 25, what is f(a+1)?', 'Function evaluation', '36 — a=5 (or -5); f(6)=36 (or f(-4)=16, but usually take positive).'],
    ]);
  }

  // 3. Combinations, Permutations & Counting
  {
    const tid = await insertTopic(mathSection.id, 'Combinations, Permutations & Counting', 'Fundamental counting principle, permutations, combinations, and arrangement problems', '🔢', mathIdx++);
    await insertEquations(tid, [
      ['Fundamental counting principle', '$$\\text{Total} = n_1 \\times n_2 \\times \\cdots \\times n_k$$', 'Choices at each step multiply', 'Detail: If event 1 has m ways and event 2 has n ways (independent), total = m×n. Example: 3 shirt colors × 4 pant styles = 12 outfits. Key: steps must be sequential and independent.'],
      ['Permutation (ordered)', '$$P(n,r) = \\frac{n!}{(n-r)!}$$', 'Arrangements of r items from n where order matters', 'Detail: Use when order matters (passwords, rankings, races). P(5,3) = 5×4×3 = 60. Mnemonic: Permutation = Position matters.'],
      ['Combination (unordered)', '$$C(n,r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}$$', 'Selections of r items from n where order does NOT matter', 'Detail: Use when order doesn\'t matter (committees, teams, hands of cards). C(5,3) = 10. Always: C(n,r) = C(n, n-r).'],
      ['Factorial', '$$n! = n \\times (n-1) \\times \\cdots \\times 2 \\times 1, \\quad 0! = 1$$', 'n factorial = product of all integers from 1 to n', 'Detail: 5! = 120, 4! = 24, 3! = 6. When computing C or P, cancel before multiplying — much faster.'],
      ['Circular arrangement', '$$\\text{Circular permutations} = (n-1)!$$', 'Arranging n items in a circle: fix one, arrange rest', 'Detail: In a circle, rotations are equivalent. Fix one person in place, arrange remaining (n-1) in (n-1)! ways. For a necklace (can flip): (n-1)!/2.'],
    ]);
    await insertRules(tid, [
      ['Order Matters → Permutation; Order Doesn\'t → Combination', 'Ask: does swapping two items create a different outcome? If yes: permutation. If no: combination. Committees use C; race standings use P.'],
      ['Slot Method (Multiply Choices)', "For constrained arrangements: fill slots one at a time. Count choices for each slot respecting constraints. Multiply. Key: handle restricted positions FIRST — fill them before unrestricted ones."],
      ['Complement in Counting', "Sometimes easier to count what you DON'T want. Total − (unwanted arrangements) = desired count."],
      ['Identical Items Reduce Count', 'Arranging n items with groups of identical items: n! / (k₁! × k₂! × ...) where k₁, k₂ are counts of each identical type.'],
      ['At Least One → Complement', 'P(at least one specific item selected) = Total combinations − C(n-1, r) (combinations without that item).'],
    ]);
    await insertMethods(tid, [
      { name: 'Identify Order Matters', when_to_use: 'Any counting/arrangement problem', steps: ['Ask: does the order of selection matter?', 'Yes → Permutation formula P(n,r) or slot method', 'No → Combination formula C(n,r)'], tip: "When in doubt: rephrase as 'does swapping two chosen items give a different outcome?'" },
      { name: 'Slot Method', when_to_use: 'Constrained arrangements (certain items fixed, restricted)', steps: ['Draw blank slots for each position', 'Fill constrained slots first (restrictions)', 'Multiply remaining choices for free slots'], tip: 'Always fill the most constrained slots first — this avoids over-counting.' },
      { name: 'Complement Counting', when_to_use: "'At least one' or 'not all' type counting", steps: ['Count total arrangements without restriction', 'Subtract arrangements that violate the condition', 'Result = valid arrangements'], tip: "Much faster than counting all cases that satisfy 'at least one.'" },
    ]);
    await insertQuestions(tid, [
      { subtype: 'Committee: Combination with Constraint', q_text: 'A team of 4 is chosen from 5 men and 4 women. How many teams contain at least 1 woman?\n\n(A) 100\n(B) 115\n(C) 120\n(D) 121\n(E) 126', question_type: 'Combination — complement counting', signals: "'At least 1 woman' → use complement: total − (all men).", trap: 'Adding cases: C(4,1)×C(5,3) + C(4,2)×C(5,2) + C(4,3)×C(5,1) + C(4,4)×C(5,0) — correct but slow.', method: 'Total C(9,4)=126. All-men: C(5,4)=5. Answer: 126-5=121.', steps: ['Total teams: C(9,4) = 126', 'All-male teams (no women): C(5,4) = 5', 'At least 1 woman = 126 - 5 = 121', 'Answer: (D) 121'], difficulty: 'Medium' },
      { subtype: 'Permutation: Arrangement with Restriction', q_text: 'In how many ways can 4 people be seated in a row of 4 chairs if person A must sit in the first chair?\n\n(A) 6\n(B) 8\n(C) 12\n(D) 16\n(E) 24', question_type: 'Permutation with fixed position', signals: 'Order matters (seats). One person fixed. Fill remaining seats.', trap: '(E) 24 = 4! total arrangements without restriction.', method: 'A is fixed in chair 1. Remaining 3 people fill 3 chairs: 3! = 6.', steps: ['A is fixed in chair 1: 1 way', 'Remaining 3 people fill 3 remaining chairs: 3! = 6', 'Total = 1 × 6 = 6', 'Answer: (A) 6'], difficulty: 'Easy' },
      { subtype: 'Circular Arrangement', q_text: 'In how many ways can 6 people be seated at a circular table?\n\n(A) 60\n(B) 120\n(C) 240\n(D) 360\n(E) 720', question_type: 'Circular permutation', signals: "Circular arrangement — rotations are equivalent. Fix one person.", trap: '(E) 720 = 6! counting rotations as distinct.', method: "Fix one person, arrange remaining 5: (6-1)! = 5! = 120.", steps: ["Fix one person's position to eliminate rotation equivalence", 'Arrange remaining 5 people: 5! = 120', 'Answer: (B) 120'], difficulty: 'Medium' },
    ]);
    await insertPractice(tid, [
      ['How many 3-digit codes can be formed from digits 1-9 if repetition is allowed?', 'Computation', '729 — 9×9×9 = 729.'],
      ['How many ways to choose 2 toppings from 8?', 'Combination', 'C(8,2) = 28.'],
      ['How many ways to arrange letters in MATH?', 'Permutation', '4! = 24.'],
      ["How many ways to arrange letters in LEVEL?", 'Permutation with repeats', "5!/(2!×2!) = 30 (2 L's, 2 E's)."],
      ['A password is 3 letters followed by 2 digits (no repeats). How many passwords?', 'Counting principle', '26×25×24×10×9 = 1,404,000.'],
    ]);
  }

  // 4. Overlapping Sets & Venn Diagrams
  {
    const tid = await insertTopic(mathSection.id, 'Overlapping Sets & Venn Diagrams', '2-set and 3-set problems, inclusion-exclusion, and double-counting traps', '🔵', mathIdx++);
    await insertEquations(tid, [
      ['Two-set formula', '$$|A \\cup B| = |A| + |B| - |A \\cap B|$$', 'Total = A only + B only + both (counted once)', "Detail: The classic inclusion-exclusion principle. Rewrite as: |A∩B| = |A| + |B| - |A∪B|. If 'neither' exists: Total = |A∪B| + Neither. Common GMAT setup: survey of group with two attributes."],
      ['Two-set table', '$$\\begin{array}{c|cc|c} & B & \\text{not-}B & \\\\ \\hline A & \\text{both} & \\text{A only} & |A| \\\\ \\text{not-}A & \\text{B only} & \\text{neither} & \\text{not-}A \\\\ \\hline & |B| & \\text{not-}B & \\text{Total} \\end{array}$$', 'A 2×2 table is the most reliable method for 2-set problems', "Detail: Fill in all cells. Each row sums across. Each column sums down. Total = sum of all four cells. This approach avoids confusion about what 'only A' means."],
      ['Three-set formula', '$$|A \\cup B \\cup C| = |A|+|B|+|C|-|A\\cap B|-|A\\cap C|-|B\\cap C|+|A\\cap B\\cap C|$$', 'Add singles, subtract pairs, add triple', 'Detail: The triple intersection is added back because it was subtracted three times. For 3-set problems, the table approach fails — draw a Venn diagram and fill from inside out.'],
      ['Neither formula', '$$\\text{Neither} = \\text{Total} - |A \\cup B|$$', 'Those in neither set = total minus union', "Detail: If total = 100, |A∪B| = 80, then neither = 20. Always check whether 'total' includes or excludes 'neither.'"],
    ]);
    await insertRules(tid, [
      ['Table Method for 2-Set', "Use a 2×2 table (not formulas) for 2-set Venn diagram problems. It's harder to make errors. Label rows A/not-A and columns B/not-B."],
      ['Inside-Out for 3-Set', 'Fill 3-set Venn diagrams from the inside out: start with the triple intersection, then fill each pair overlap (subtract triple), then each individual region.'],
      ["'Exactly One' vs 'At Least One'", "'Exactly one set' = A-only + B-only (not both). 'At least one set' = |A∪B| = |A|+|B|-|A∩B|. These are different — read carefully."],
      ['Double-Count Warning', 'The sum |A|+|B| counts the intersection TWICE. Always subtract |A∩B| once to get the true union.'],
      ['Total Must Be Consistent', "In a survey problem, Total = All who answered. Check: does 'total' include those who said 'neither'? Usually yes — they're in the population, just not in A or B."],
    ]);
    await insertMethods(tid, [
      { name: '2×2 Table', when_to_use: 'Any 2-attribute problem', steps: ['Draw table: rows = A/not-A, cols = B/not-B', 'Label all 4 cells + row/column totals', 'Fill in known values', 'Use row/column arithmetic to find unknown cells'], tip: 'Once table is set up, solving is pure arithmetic — no formula needed.' },
      { name: 'Venn Inside-Out (3-Set)', when_to_use: 'Three overlapping sets', steps: ['Draw 3 overlapping circles', 'Fill in center (all three) first', 'Fill each pair overlap (subtract center)', 'Fill each single-set region (subtract both pair overlaps)', 'Sum all regions = total'], tip: 'Always work from center outward — each region you fill reduces unknowns.' },
      { name: 'Formula for Quick 2-Set', when_to_use: 'Simple 2-set with clear numbers', steps: ['|A∪B| = |A| + |B| - |A∩B|', 'Neither = Total - |A∪B|', 'Solve for the unknown'], tip: 'Table is more reliable for complex problems, but formula is faster for simple ones.' },
    ]);
    await insertQuestions(tid, [
      { subtype: '2-Set: Find Overlap', q_text: 'In a class of 40 students, 25 study French, 20 study Spanish, and 8 study neither. How many study both?\n\n(A) 5\n(B) 10\n(C) 13\n(D) 15\n(E) 18', question_type: '2-set inclusion-exclusion — find intersection', signals: 'Two sets, total given, neither given. Need overlap.', trap: 'Adding 25+20=45, subtracting 40=5 without accounting for neither.', method: 'Students in at least one language = 40-8 = 32. |F|+|S|-|both|=32 → 25+20-|both|=32 → |both|=13.', steps: ['Students in at least one = 40 - 8 = 32', '25 + 20 - both = 32', 'both = 45 - 32 = 13', 'Answer: (C) 13'], difficulty: 'Medium' },
      { subtype: '3-Set Venn: Fill Inside-Out', q_text: 'Of 100 students: 70 play soccer, 60 play tennis, 50 play basketball. 40 play soccer & tennis, 30 play tennis & basketball, 35 play soccer & basketball. 25 play all three. How many play none?\n\n(A) 0\n(B) 10\n(C) 15\n(D) 20\n(E) 25', question_type: '3-set Venn diagram — inclusion-exclusion', signals: 'Three sets, all overlaps given including triple. Use 3-set formula.', trap: "Adding all three sets: 70+60+50=180, then subtracting pairs without the triple.", method: 'Union = 70+60+50-40-30-35+25 = 100. None = 100-100 = 0.', steps: ['Apply formula: 70+60+50-40-30-35+25 = 100', 'None = 100-100 = 0', 'Answer: (A) 0'], difficulty: 'Hard' },
      { subtype: 'DS: 2-Set Table', q_text: "A company has 200 employees. Each employee either has a desk job or field job, and is either full-time or part-time. How many are full-time desk employees?\n\n(1) 120 employees have desk jobs\n(2) 80 employees are part-time\n\n(A) Statement (1) ALONE is sufficient\n(B) Statement (2) ALONE is sufficient\n(C) BOTH statements TOGETHER are sufficient\n(D) EACH statement ALONE is sufficient\n(E) Statements (1) and (2) TOGETHER are NOT sufficient", question_type: 'DS — 2-set table, two variables unknown', signals: "2×2 table setup. Need specific cell value. Each statement gives one marginal total.", trap: "Thinking both statements together give the specific cell — they only give row/column totals, not the cell.", method: 'With total=200, desk=120, part-time=80: two unknowns in the table (full-time desk and part-time desk). Not sufficient.', steps: ['Set up 2x2: rows=desk/field, cols=FT/PT', 'Total=200, desk=120→field=80, PT=80→FT=120', 'Still need one cell value: e.g. full-time desk or part-time desk', "Two statements give marginal totals only — can't determine individual cell", 'Answer: (E)'], difficulty: 'Hard' },
    ]);
    await insertPractice(tid, [
      ['50 people: 30 like cats, 25 like dogs, 10 like both. How many like neither?', '2-set formula', '5 — union = 30+25-10=45; neither = 50-45 = 5.'],
      ['In a 2×2 table: Total=100, A=60, B=50, both=30. Find A only, B only, neither.', 'Table', 'A only=30, B only=20, neither=20.'],
      ['How many integers from 1–100 are divisible by 2 or 3?', 'Inclusion-exclusion', '67 — div by 2: 50, div by 3: 33, div by 6: 16; 50+33-16=67.'],
      ['30 students: 20 passed Math, 18 passed English, 3 failed both. How many passed both?', '2-set', '11 — union=30-3=27; 20+18-both=27 → both=11.'],
      ["'Exactly one of A or B' formula?", 'Conceptual', '|A|+|B|-2|A∩B| — or equivalently: |A∪B| - |A∩B|.'],
    ]);
  }

  // 5. Sequences (Arithmetic & Geometric)
  {
    const tid = await insertTopic(mathSection.id, 'Sequences (Arithmetic & Geometric)', 'Nth term, sum formulas, and pattern recognition for arithmetic and geometric sequences', '🔁', mathIdx++);
    await insertEquations(tid, [
      ['Arithmetic sequence nth term', '$$a_n = a_1 + (n-1)d$$', 'nth term = first term + (n-1) × common difference', 'Detail: d = common difference (constant gap between terms). Example: 3, 7, 11, 15 → d=4, a₁=3. 10th term = 3+(10-1)×4 = 39. Key: index starts at 1, not 0.'],
      ['Arithmetic series sum', '$$S_n = \\frac{n}{2}(a_1 + a_n) = \\frac{n}{2}(2a_1 + (n-1)d)$$', 'Sum of n terms = n × average of first and last', "Detail: The 'average' formula: sum = number of terms × average value. Since arithmetic sequence is symmetric, average = (first + last)/2. Example: sum of 1 to 100 = 100×101/2 = 5050."],
      ['Geometric sequence nth term', '$$a_n = a_1 \\cdot r^{n-1}$$', 'nth term = first term × (common ratio)^(n-1)', 'Detail: r = common ratio (multiply each term by r to get next). Example: 2, 6, 18, 54 → r=3. 5th term = 2×3⁴ = 162. If |r| < 1: terms shrink toward 0.'],
      ['Geometric series sum (finite)', '$$S_n = a_1 \\cdot \\frac{1-r^n}{1-r} \\quad (r \\neq 1)$$', 'Sum of first n terms of geometric sequence', 'Detail: GMAT rarely tests this formula directly — more likely to test conceptual understanding or small sequences.'],
      ['Number of terms in a sequence', '$$n = \\frac{\\text{last} - \\text{first}}{d} + 1$$', 'Count evenly-spaced integers inclusive', 'Detail: Count of multiples of k from a to b: floor(b/k) - floor((a-1)/k). Simpler: from a to b with step d, number of terms = (b-a)/d + 1.'],
    ]);
    await insertRules(tid, [
      ['Arithmetic: Constant Difference', 'In an arithmetic sequence, the difference between consecutive terms is constant. Test: a₃ - a₂ = a₂ - a₁ = d.'],
      ['Geometric: Constant Ratio', 'In a geometric sequence, the ratio between consecutive terms is constant. Test: a₂/a₁ = a₃/a₂ = r.'],
      ['Sum Shortcut: Average × Count', 'For any arithmetic sequence, sum = (average value) × (number of terms). Average = (first + last) / 2.'],
      ['Counting Inclusive Sequences', 'Number of integers from a to b inclusive = b - a + 1. Multiples of k from 1 to N: floor(N/k).'],
      ['Sequence vs Series', "Sequence = list of terms. Series = sum of terms. The 'sum of the first n terms' is a series question."],
    ]);
    await insertMethods(tid, [
      { name: 'Identify Sequence Type', when_to_use: 'First step for any sequence problem', steps: ['Compute differences between consecutive terms', 'If constant: arithmetic (use aₙ and Sₙ formulas)', 'Compute ratios if not arithmetic', 'If constant ratio: geometric'], tip: "Sometimes GMAT gives a non-standard sequence — just find the pattern directly." },
      { name: 'Arithmetic Sum: Average Method', when_to_use: 'Sum of arithmetic sequence or evenly-spaced integers', steps: ['Find first and last terms', 'Average = (first + last) / 2', 'Count the terms: n = (last - first)/d + 1', 'Sum = average × n'], tip: 'This is faster than the Sₙ formula for most GMAT problems.' },
      { name: 'Count of Terms Formula', when_to_use: 'How many integers/multiples are in a range', steps: ['Identify first and last qualifying values', 'Step size d (usually 1, or k for multiples)', 'n = (last - first)/d + 1'], tip: "The +1 trips people up constantly. Think of counting fence posts, not gaps." },
    ]);
    await insertQuestions(tid, [
      { subtype: 'Arithmetic: Find nth Term', q_text: 'The first term of an arithmetic sequence is 7 and the common difference is 4. What is the 15th term?\n\n(A) 55\n(B) 59\n(C) 63\n(D) 67\n(E) 71', question_type: 'Arithmetic sequence nth term', signals: 'First term and common difference given. Direct application of formula.', trap: '(D) 67: using n=15 instead of n-1=14.', method: 'a₁₅ = 7 + (15-1) × 4 = 7 + 56 = 63.', steps: ['aₙ = a₁ + (n-1)d', 'a₁₅ = 7 + (15-1) × 4', '= 7 + 56 = 63', 'Answer: (C) 63'], difficulty: 'Easy' },
      { subtype: 'Arithmetic Sum: Count and Average', q_text: 'What is the sum of all even integers from 20 to 100, inclusive?\n\n(A) 2,200\n(B) 2,460\n(C) 2,600\n(D) 2,800\n(E) 3,000', question_type: 'Arithmetic series sum — evenly spaced', signals: 'Even integers = arithmetic sequence with d=2. Sum of all terms needed.', trap: '(C) or (D): Miscounting number of terms (off by one), or using wrong average.', method: 'First=20, last=100, d=2. n=(100-20)/2+1=41. Sum=41×(20+100)/2=41×60=2460.', steps: ['Sequence: 20,22,...,100 with d=2', 'Count: n = (100-20)/2 + 1 = 40+1 = 41', 'Average = (20+100)/2 = 60', 'Sum = 41 × 60 = 2,460', 'Answer: (B) 2,460'], difficulty: 'Medium' },
      { subtype: 'Geometric: Identify and Apply', q_text: 'In a geometric sequence, the 2nd term is 6 and the 4th term is 54. What is the 6th term?\n\n(A) 162\n(B) 243\n(C) 324\n(D) 486\n(E) 729', question_type: 'Geometric sequence — find ratio then nth term', signals: 'Non-consecutive terms given. Need to find ratio r then use to find another term.', trap: "Assuming ratio is 54/6=9 (that's a₄/a₂, not the per-term ratio).", method: 'a₄/a₂ = r² = 54/6 = 9 → r=3. a₆ = a₄ × r² = 54×9 = 486.', steps: ['a₄/a₂ = r² → r² = 54/6 = 9 → r = 3', 'a₆ = a₄ × r² = 54 × 9 = 486', 'Answer: (D) 486'], difficulty: 'Medium' },
    ]);
    await insertPractice(tid, [
      ['Find the 20th term: 5, 9, 13, 17, ...', 'Arithmetic nth term', '81 — d=4; a₂₀=5+19×4=81.'],
      ['Sum of integers from 1 to 50.', 'Arithmetic sum', '1275 — n=50, avg=25.5; 50×25.5=1275.'],
      ['How many multiples of 7 are between 1 and 100?', 'Count of terms', '14 — from 7 to 98: (98-7)/7+1=14.'],
      ['Geometric: first term=2, r=3. Find 5th term.', 'Geometric nth term', '162 — 2×3⁴=162.'],
      ['Is 85 a term in sequence 3,8,13,18,...?', 'Arithmetic check', 'No — aₙ=3+(n-1)×5=5n-2; 85=5n-2→n=17.4, not integer → NO.'],
    ]);
  }

  // 6. Simple & Compound Interest
  {
    const tid = await insertTopic(mathSection.id, 'Simple & Compound Interest', 'Interest calculations, growth formulas, and real-world financial word problems', '💰', mathIdx++);
    await insertEquations(tid, [
      ['Simple interest', '$$I = P \\times r \\times t$$', 'Interest = Principal × rate × time', 'Detail: I = interest earned. P = principal (initial amount). r = annual rate as decimal. t = time in years. Total amount = P + I = P(1+rt). Example: $1000 at 5% for 3 years → I = 1000×0.05×3 = $150.'],
      ['Simple interest total', '$$A = P(1 + rt)$$', 'Final amount with simple interest', "Detail: A is the total amount including principal. Common GMAT trap: confusing I (just the interest) with A (principal + interest). Read the question carefully."],
      ['Compound interest', '$$A = P\\left(1 + \\frac{r}{n}\\right)^{nt}$$', 'Compounded n times per year', 'Detail: Annual (n=1): A=P(1+r)^t. Semi-annual (n=2). Quarterly (n=4). Monthly (n=12). Daily (n=365). More frequent compounding → more interest than simple interest.'],
      ['Compound annual growth', '$$A = P(1+r)^t$$', 'Annual compounding formula — most common on GMAT', 'Detail: For GMAT Focus: usually annual compounding or conceptual understanding. Key: compound interest grows faster than simple interest for same rate and time. After 1 year they\'re equal; after that, compound wins.'],
      ['Rule of 72', '$$t \\approx \\frac{72}{r\\%}$$', 'Approximate years to double at rate r%', 'Detail: At 8% per year: doubles in ≈9 years (72/8). At 6%: ≈12 years. GMAT may use this conceptually — useful as a quick estimate.'],
    ]);
    await insertRules(tid, [
      ['Simple vs Compound: Key Difference', 'Simple interest: interest only on principal. Compound: interest on principal + accumulated interest. Compound always yields more over multiple periods (after year 1).'],
      ['Rate Must Match Time', 'If rate is annual and time is in months: convert months to years. If quarterly rate, time must be in quarters. Always match units.'],
      ['Interest vs Total Amount', "I = interest earned only. A = total amount (principal + interest). Read the question — asking for 'interest earned' vs 'total amount' requires different formulas."],
      ['More Compounding Periods = More Interest', 'Annual < Semi-annual < Quarterly < Monthly < Daily < Continuous. GMAT tests this conceptually.'],
      ['Doubling Time Estimation', 'At 10% compounded annually: doubles in ~7.2 years (Rule of 72). Useful for estimation questions.'],
    ]);
    await insertMethods(tid, [
      { name: 'Set Up I=Prt or A=P(1+r)^t', when_to_use: 'Any interest problem', steps: ['Identify: Simple or Compound interest?', 'Identify P, r (as decimal), t (in years)', 'Apply formula: I=Prt (simple) or A=P(1+r)^t (compound annual)', 'Answer the specific question: interest only or total?'], tip: 'Always convert rate to decimal (6% → 0.06) and check time units before plugging in.' },
      { name: 'Compare Simple vs Compound', when_to_use: 'Asked which is greater or by how much', steps: ['Compute simple interest: I_s = Prt', 'Compute compound: A_c = P(1+r)^t, then I_c = A_c - P', 'Compare'], tip: 'For small r and small t, the difference is approximately P×r²×t(t-1)/2.' },
      { name: 'Reverse: Find Rate or Time', when_to_use: 'Given final amount, find rate or time', steps: ['Write the formula: A = P(1+rt) or A=P(1+r)^t', 'Plug in known values', 'Solve algebraically for unknown'], tip: 'For compound, isolate the exponential: (A/P)^(1/t) = 1+r.' },
    ]);
    await insertQuestions(tid, [
      { subtype: 'Simple Interest: Find Total Amount', q_text: 'Maria invests $4,000 at a simple annual interest rate of 6%. What will be the total value of her investment after 5 years?\n\n(A) $4,240\n(B) $4,800\n(C) $5,200\n(D) $5,350\n(E) $5,600', question_type: 'Simple interest — find final total amount', signals: 'Simple interest stated. Need total (principal + interest).', trap: '(B) $4,800: computing only interest $1,200 and adding incorrectly, or computing interest only (1200) instead of total.', method: 'I = 4000×0.06×5 = $1,200. Total = 4000+1200 = $5,200.', steps: ['I = P×r×t = 4000 × 0.06 × 5 = $1,200', 'Total = P + I = 4000 + 1200 = $5,200', 'Answer: (C) $5,200'], difficulty: 'Easy' },
      { subtype: 'Compound vs Simple: Conceptual', q_text: "Peter invests $1,000 at 10% compounded annually and Lisa invests $1,000 at 10% simple interest. After 3 years, how much MORE has Peter earned than Lisa?\n\n(A) $0\n(B) $21\n(C) $31\n(D) $42\n(E) $100", question_type: 'Compound vs simple interest comparison', signals: 'Same principal, same rate, same time. Compare compound vs simple interest earned.', trap: "(A) Assuming they're equal (they're equal only after year 1).", method: 'Compound: 1000×(1.1)³=1331, I=$331. Simple: I=1000×0.10×3=$300. Difference=$31.', steps: ['Compound: A = 1000×(1.10)³ = 1000×1.331 = $1,331; interest = $331', 'Simple: I = 1000×0.10×3 = $300', 'Difference: 331-300 = $31', 'Answer: (C) $31'], difficulty: 'Medium' },
      { subtype: 'DS: Find the Rate', q_text: "A sum of $P was invested at a simple annual interest rate. Is the interest earned after 2 years greater than $200?\n\n(1) P = $1,200\n(2) The annual interest rate is 8%\n\n(A) Statement (1) ALONE is sufficient\n(B) Statement (2) ALONE is sufficient\n(C) BOTH statements TOGETHER are sufficient\n(D) EACH statement ALONE is sufficient\n(E) Statements (1) and (2) TOGETHER are NOT sufficient", question_type: 'DS — simple interest with two unknowns (P and r)', signals: 'Two unknowns (P and r). Need both to compute I=Prt.', trap: 'Thinking either statement alone is sufficient.', method: "Need both P and r to compute I=Prt. Neither alone is sufficient; together: I=1200×0.08×2=$192 < $200 → No.", steps: ["Statement (1): P=1200, but rate unknown → can't compute interest → Insufficient", "Statement (2): r=8%, but P unknown → can't compute interest → Insufficient", 'Together: I = 1200×0.08×2 = $192 < $200 → answer is No → Sufficient', 'Answer: (C)'], difficulty: 'Medium' },
    ]);
    await insertPractice(tid, [
      ['$5,000 at 4% simple for 3 years. Interest earned?', 'Computation', '$600 — 5000×0.04×3=600.'],
      ['$2,000 at 10% compounded annually for 2 years. Total?', 'Compound interest', '$2,420 — 2000×(1.1)²=2420.'],
      ['At 8% simple, how many years to earn $640 on $1,000?', 'Find time', '8 years — 640=1000×0.08×t → t=8.'],
      ['Which grows faster over 5 years: 6% simple or 6% compound?', 'Conceptual', 'Compound — after year 1, compound earns interest on accumulated interest too.'],
      ['Using Rule of 72: at 9% compound annually, approximately when does money double?', 'Estimation', '~8 years — 72/9=8.'],
    ]);
  }

  // 7. Coordinate Geometry (bonus math topics — filling to 8)
  // Wait, the task says 8 math topics but only 6 are detailed above (Inequalities, Functions, Combinations, Overlapping Sets, Sequences, Interest).
  // Let me re-read... The task file shows exactly 6 math topics in the content I read. Let me check if there are more.
  // Actually, re-reading: "MATH — 8 more topics (order_idx 13–20)" but only 6 topics are detailed.
  // The remaining content continues after line 274 with Verbal topics. So I have 6 math + 4 verbal + 2 DI = 12 topics total.
  // Wait, the heading says 8 more math topics but I only see 6 detailed. Let me just insert what's provided.

  // ========== VERBAL TOPICS ==========
  console.log('\n=== VERBAL TOPICS ===');

  // 1. CR — Inference & Complete the Passage
  {
    const tid = await insertTopic(verbalSection.id, 'CR — Inference & Complete the Passage', 'Drawing valid conclusions from stated facts, and completing the author\'s argument', '💡', verbalIdx++);
    await insertEquations(tid, [
      ['Inference definition', '$$\\text{Inference} = \\text{conclusion that MUST be true given the premises}$$', 'Must be true, not just likely — stay conservative', "Detail: GMAT Inference ≠ real-world inference. It means: if the premises are true, this conclusion is GUARANTEED. Any possibility of falsity = wrong answer. Scope errors: going beyond what's stated."],
      ['Scope of inference', '$$\\text{Valid: logically contained in premises}$$\n$$\\text{Invalid: adds new info or overstates}$$', "Stick to what's stated — don't over-extrapolate", "Detail: Wrong answer types: Too Strong (says 'always' when passage says 'sometimes'), New Info (adds things not in passage), Opposite (contradicts passage). Right answer: conservative, hedged, directly supported."],
      ['Complete the Passage structure', '$$\\text{Blank at end = conclusion}\\quad\\text{Blank in middle = premise}$$', 'Identify what role the blank plays before choosing', "Detail: If blank is at end: find the conclusion that follows from the argument. If blank fills a gap in the middle: find the bridge premise. Use same skills as Strengthen/Assumption when blank is in the middle."],
      ['Inference signal words', "$$\\text{Signals: 'conclude', 'infer', 'suggests', 'implies', 'best supported by'}$$", "These all mean: find what MUST be true", "Detail: Despite different wording, all these question types want the same thing: the statement that the premises guarantee. Don't look for what 'might' be true — look for 'must.'"],
    ]);
    await insertRules(tid, [
      ['Must Be True, Not Might', 'Inference answers must be guaranteed true if all premises are true. If you can imagine any scenario where it\'s false, eliminate it.'],
      ['Conservative Language is a Good Sign', "Correct inference answers often use hedged language: 'some', 'at least one', 'can', 'might'. Extreme language ('always', 'never', 'all') is usually wrong."],
      ['Stay Within Scope', "Don't go beyond the information in the passage. Adding new facts, new people, or new timeframes = out of scope = wrong."],
      ['Complete the Passage: Match the Argument', "For complete-the-passage: the correct answer continues the author's logical flow. Re-read what comes before and after the blank to understand the structure."],
      ['Opposite Traps', "GMAT often includes an answer that contradicts the premises. It's tempting (sounds relevant) but contradicts what's stated."],
    ]);
    await insertMethods(tid, [
      { name: 'Inference: Combine Premises', when_to_use: "Inference or 'must be true' questions", steps: ['Read all premises carefully — no conclusion given', 'Look for two premises that together imply something', 'Check each answer: must it be true given those premises?', 'Eliminate: too strong, new info, possible-but-not-certain'], tip: "The answer is often a combination of two premises. When stuck, physically combine premise pairs." },
      { name: 'Complete the Passage: Role Identification', when_to_use: 'Complete the passage / fill-in-the-blank', steps: ['Identify if blank is conclusion (end) or premise (middle)', 'If conclusion: what follows from the argument?', 'If premise: what bridges the evidence to the conclusion?', 'Choose answer that fits the argument\'s logic without adding new ideas'], tip: "For a conclusion blank, use the same logic as finding the Conclusion in Argument Structure." },
      { name: 'Inference Eliminator', when_to_use: 'Stuck between two answer choices', steps: ["For each finalist: ask 'is there ANY possible world where this is false, given the premises?'", 'If yes: eliminate', 'Most conservative/limited statement remaining = answer'], tip: 'The inference question rewards careful, conservative reading — not bold conclusions.' },
    ]);
    await insertQuestions(tid, [
      { subtype: 'Inference: Combine Two Premises', q_text: "Company X's revenue grew 20% last year. Company X's expenses grew 30% last year.\n\nIf the statements above are true, which of the following can be properly inferred?\n\n(A) Company X was profitable last year.\n(B) Company X's profit margin decreased last year.\n(C) Company X's net income decreased last year.\n(D) Company X will be unprofitable next year.\n(E) Company X's expenses exceeded its revenue last year.", question_type: 'Inference — derive valid conclusion from two premises', signals: 'No conclusion stated — premises only. Find what MUST follow.', trap: "(A) Profitable — we don't know if it was profitable at all. (C) Net income decreased — only valid if expenses > revenue or we can calculate.", method: '(B) is the conservative inference — expenses grew faster than revenue → profit margin decreased.', steps: ['Revenue: +20%; Expenses: +30% — expenses grew faster', 'Profit margin = (revenue-expenses)/revenue', 'If expenses grow faster than revenue, margin shrinks', 'Answer: (B) — must be true regardless of absolute values'], difficulty: 'Medium' },
      { subtype: 'Complete the Passage: Conclusion Blank', q_text: "Countries with higher literacy rates tend to have higher per-capita GDP. Over the past 20 years, Country Z has invested heavily in education, and its literacy rate has climbed from 60% to 85%. Therefore, ____________.\n\n(A) Country Z will soon have the world's highest GDP.\n(B) Country Z's economy has grown faster than any other.\n(C) Country Z's per-capita GDP has likely increased over this period.\n(D) Education spending is the primary driver of economic growth.\n(E) Countries with low literacy will never achieve high GDP.", question_type: 'Complete the Passage — conclusion that follows from premises', signals: "Blank is the conclusion. The premises set up a causal chain: literacy → GDP.", trap: "(A) Strongest claim — unsupported. (D) Adds 'primary driver' — not stated.", method: "(C) is the conservative conclusion: given the correlation and Z's literacy increase, GDP likely grew — hedged with 'likely'.", steps: ["Premises: literacy-GDP correlation + Z's literacy rose significantly", 'Conclusion should follow these premises directly', "(C) 'has likely increased' — appropriately hedged, stays within scope", 'Answer: (C)'], difficulty: 'Medium' },
      { subtype: 'Inference: Scope Error Trap', q_text: "All of the company's products that won design awards were developed by the R&D team. None of the products developed by the marketing team won design awards.\n\nWhich of the following can be properly inferred?\n\n(A) The R&D team develops better products than the marketing team.\n(B) The marketing team has never won any type of award.\n(C) At least some products developed by the R&D team won design awards.\n(D) Some design award-winning products were developed by the R&D team.\n(E) Products developed by only the R&D team can win design awards.", question_type: 'Inference — careful scope reading', signals: 'Two conditional statements. Need what must follow logically.', trap: "(C) 'R&D team won awards' — the premise says award-winners came FROM R&D, not that R&D products won. (A) 'better' — unsupported value judgment.", method: '(D) directly follows from premise 1: all award winners → R&D, so some R&D products won.', steps: ['Premise 1: If won design award → developed by R&D (award winners ⊆ R&D products)', 'Premise 2: Marketing products → no design awards', '(D) restates premise 1 conservatively: some R&D products = award winners', 'Answer: (D)'], difficulty: 'Hard' },
    ]);
    await insertPractice(tid, [
      ['All A are B. Some B are C. What can you infer about A and C?', 'Logical inference', "Nothing certain — 'some B are C' doesn't mean the specific B's that are A are also C."],
      ["What makes an inference 'too strong'?", 'Conceptual', "It uses absolute language ('all', 'always', 'never') not supported by the premises, or draws a bigger conclusion than the evidence warrants."],
      ["Complete: 'The new policy reduced costs by 15%, and similar policies in other companies reduced costs by 10-20%. Therefore, ___'", 'Complete the Passage', "Best completion: 'the new policy's cost reduction is consistent with industry experience' — conservative, in scope."],
      ["What's the difference between an inference question and a strengthen question?", 'Conceptual', 'Inference: find what must be true from given info. Strengthen: find new info that supports the argument. In inference, no new information is added.'],
      ["Passage says 'most executives prefer X'. What CAN be inferred?", 'Scope', 'More than half of the executives surveyed prefer X. Cannot infer: all executives, executives in other industries, or that X is objectively better.'],
    ]);
  }

  // 2. CR — Evaluate & Boldface
  {
    const tid = await insertTopic(verbalSection.id, 'CR — Evaluate & Boldface', 'Evaluating argument strength and identifying the role of bolded statements', '🔬', verbalIdx++);
    await insertEquations(tid, [
      ['Evaluate question goal', '$$\\text{Find: what information would determine if argument is valid?}$$', 'The answer reveals whether the assumption holds or fails', "Detail: Evaluate questions ask: which of the following would be MOST USEFUL to evaluate the argument? The correct answer is a question/factor where: if YES → strengthens, if NO → weakens (or vice versa). The answer is 'two-directional.'"],
      ['Boldface role types', '$$\\text{Statement roles: Main Conclusion | Premise | Assumption | Counter-premise | Sub-conclusion}$$', 'Identify: is it supporting or opposing? Fact or conclusion?', 'Detail: Main conclusion: what the author is trying to prove. Premise: stated fact supporting conclusion. Counter-premise: acknowledged objection. Sub-conclusion: intermediate conclusion used as evidence. Assumption: unstated premise (rarely bolded).'],
      ['Evaluate: Two-Directional Test', '$$\\text{If YES: strengthens}\\quad\\text{If NO: weakens}$$\n$$\\text{Both directions must matter — it\'s truly evaluating}$$', 'The factor must work in BOTH directions to be a valid evaluator', 'Detail: Wrong answers: only go one direction (strengthen or weaken only), irrelevant to argument, about peripheral details. Right answer: answering either yes or no changes whether you believe the conclusion.'],
      ['Boldface answer format', "$$\\text{'The first is [role]; the second is [role]'}$$", "Answers describe both statements' logical roles", "Detail: Eliminate answers where either description is wrong. Often one boldface statement is the conclusion and one is evidence, OR one is the main position and one is the counter. Common wrong answer: labeling a premise as the main conclusion."],
    ]);
    await insertRules(tid, [
      ['Evaluate: Test Both Directions', "For each answer choice, ask: if the answer to this question is YES, does it strengthen? If NO, does it weaken? If only one direction matters, it's a strengthener/weakener disguised as an evaluator."],
      ['Boldface: Read for Role', "Before looking at answers, determine each bolded statement's role: Is it a fact? A conclusion? An objection? Supporting or opposing the main argument?"],
      ['Boldface: Conclusion vs Evidence', "The author's main conclusion is what they're trying to prove. Evidence supports it. Counter-arguments oppose it. Most boldface questions involve at least one of each."],
      ['Evaluate: The Assumption Behind the Factor', "The thing being evaluated usually points to the argument's key assumption. If the question is 'does X affect Y?', the argument assumes it does."],
      ['Boldface Wrong Answer Patterns', "Common traps: (1) Swapping roles of two statements, (2) Calling a premise the main conclusion, (3) Adding 'assumption' when statement is explicitly stated."],
    ]);
    await insertMethods(tid, [
      { name: 'Evaluate: Frame as Yes/No Question', when_to_use: 'Evaluate the argument questions', steps: ["Identify the argument's conclusion and key assumption", 'Rephrase each answer as a yes/no question', 'Test: if YES, does it help? If NO, does it hurt?', "If both directions matter → that's your answer"], tip: "The correct evaluator is the argument's assumption framed as a question." },
      { name: 'Boldface: Pre-Label Before Reading Answers', when_to_use: 'Boldface questions', steps: ['Read the full argument', 'Label each bolded statement: fact/opinion, supporting/opposing, main conclusion/sub-conclusion', 'Look for an answer where both descriptions match your labels'], tip: "Don't let the answer choices define the roles for you — determine them yourself first." },
      { name: 'Boldface Elimination', when_to_use: 'Stuck on boldface answers', steps: ["Focus on the FIRST bolded statement's description first", 'Eliminate answers that misdescribe it', "From remaining answers, check second statement's description"], tip: "Usually 2-3 answers are eliminated immediately by the first statement's role." },
    ]);
    await insertQuestions(tid, [
      { subtype: 'Evaluate: Two-Directional Factor', q_text: "Northbrook City plans to reduce traffic congestion by adding a new highway. City officials argue that the highway will reduce average commute times by 20%.\n\nWhich of the following would be most useful to evaluate the officials' argument?\n\n(A) Whether commuters prefer highways to surface roads\n(B) Whether the highway will induce additional traffic that offsets its capacity gains\n(C) Whether the city has sufficient funds to build the highway\n(D) Whether other cities have reduced congestion with new highways\n(E) Whether commuters are aware of the new highway's route", question_type: 'Evaluate — two-directional test', signals: 'What factor would help assess whether the conclusion (20% commute reduction) will hold?', trap: "(D) Other cities — adjacent but doesn't directly evaluate THIS argument. (C) Funding — addresses feasibility, not the causal claim.", method: "(B) Induced traffic: if YES (more traffic comes) → weakens; if NO → strengthens. Perfect two-directional evaluator.", steps: ['Argument: new highway → 20% commute reduction', "Key assumption: highway won't generate new traffic that fills capacity", '(B) directly tests this assumption in both directions', 'Answer: (B)'], difficulty: 'Medium' },
      { subtype: 'Boldface: Conclusion vs Counter-Premise', q_text: "**The city should invest in renewable energy infrastructure.** Solar and wind power have become significantly cheaper over the past decade. **Critics argue that renewable sources are unreliable due to weather dependence.** However, modern battery storage technology can address this limitation.\n\nIn the argument above, the two bolded statements are:\n\n(A) The first is the main conclusion; the second is evidence supporting it.\n(B) The first is the main conclusion; the second is a counter-argument the author addresses.\n(C) The first is evidence; the second is the main conclusion.\n(D) The first is a premise; the second is an assumption.\n(E) Both are premises supporting the main conclusion.", question_type: 'Boldface — identify roles of two statements', signals: 'Two bolded statements. First sounds like a recommendation (conclusion). Second sounds like an objection.', trap: '(A) Second is NOT supporting — it\'s opposing. (E) Neither is just a premise.', method: "First: main conclusion (recommendation). Second: counter-argument (critics' objection) the author then rebuts.", steps: ["First bold: 'city should invest' = recommendation = main conclusion", "Second bold: 'critics argue' = opposing viewpoint = counter-argument", 'Author addresses it in the next sentence', 'Answer: (B)'], difficulty: 'Medium' },
      { subtype: 'Boldface: Sub-Conclusion', q_text: "All high-growth companies invest heavily in R&D. Zenith Corp increased its R&D budget by 40% last year. **Therefore, Zenith Corp will likely experience high growth.** The markets have already responded: **Zenith's stock price rose 25% following the R&D announcement.**\n\nThe two bolded portions play which of the following roles?\n\n(A) The first is the main conclusion; the second is evidence supporting it.\n(B) The first is a premise; the second is the main conclusion.\n(C) The first is the main conclusion; the second is an inference from it.\n(D) Both are conclusions, the second of which is the main conclusion.\n(E) The first is evidence; the second is a counter-argument.", question_type: 'Boldface — sub-conclusion and subsequent evidence', signals: "First bold: 'Therefore' = conclusion. Second bold: follows from first (stock reaction).", trap: '(B) Swapping roles. (C) Second is evidence, not a further inference from first.', method: "First: sub-conclusion/main conclusion of the argument. Second: evidence (stock rise) that supports/follows from the first.", steps: ["'Therefore' signals first bold = conclusion drawn from premises", 'Stock rise = observed fact supporting the conclusion = evidence', 'Answer: (A) — first is main conclusion, second is evidence supporting it'], difficulty: 'Hard' },
    ]);
    await insertPractice(tid, [
      ["What is the 'two-directional test' in evaluate questions?", 'Conceptual', 'For a valid evaluator: answering YES should strengthen the argument, and answering NO should weaken it (or vice versa). If only one direction matters, it\'s just a strengthen/weaken answer.'],
      ['In a boldface question, how do you identify the main conclusion?', 'Conceptual', "The main conclusion is what the author is ultimately trying to prove. Look for conclusion signal words ('therefore', 'thus', 'so') and the statement that the other claims support."],
      ["What's the difference between a premise and a counter-premise in boldface?", 'Conceptual', "A premise supports the author's conclusion. A counter-premise (or counter-argument) opposes it — the author usually then rebuts it."],
      ["An argument concludes 'Policy X will reduce crime'. Which is a valid evaluator?", 'Evaluate', 'Whether similar policies have reduced crime in comparable cities — answering yes/no changes whether you believe the conclusion.'],
      ['Can an assumption be bolded in a boldface question?', 'Conceptual', "Rarely — an assumption is unstated. If it's bolded (stated), it becomes a premise, not an assumption."],
    ]);
  }

  // 3. RC — Passage Types & Author Tone
  {
    const tid = await insertTopic(verbalSection.id, 'RC — Passage Types & Author Tone', 'Reading strategies for science, business, and humanities passages; identifying author tone and purpose', '🖋️', verbalIdx++);
    await insertEquations(tid, [
      ['Passage types', '$$\\text{Science | Business/Economics | Social Science/Humanities | History}$$', 'Each type has different structure, vocabulary, and common question traps', 'Detail: Science: dense data, experiments, methodology. Look for hypothesis, evidence, conclusion. Business: cause-effect, data-driven, often compares options. Social Science: abstract arguments, multiple viewpoints. History: narrative, often compares interpretations.'],
      ['Author tone spectrum', '$$\\text{Critical} \\leftarrow \\text{Skeptical} \\leftarrow \\text{Neutral} \\leftarrow \\text{Supportive} \\rightarrow \\text{Enthusiastic}$$', "Identify author's attitude toward the subject", "Detail: Signal words: 'unfortunately', 'surprisingly', 'it is clear that', 'some have argued'. GMAT passages rarely have extreme tones. Most common: 'critical but fair', 'cautiously optimistic', 'neutral/analytical.'"],
      ['Primary purpose question', '$$\\text{Purpose = what is the author DOING, not what the passage SAYS}$$', 'Action words: argue, describe, compare, challenge, illustrate, advocate', "Detail: Purpose answer starts with a verb: 'to argue', 'to describe', 'to compare', 'to challenge'. Wrong answers: too specific (one paragraph), too broad, use the wrong verb ('to prove' when author is 'suggesting')."],
      ['Passage structure map', '$$\\text{P1: Main point | P2-3: Support/Evidence | Last P: Conclusion/Implication}$$', "Map each paragraph's function, not its content", "Detail: Don't memorize details on first read. Know WHERE each detail lives. 'What does paragraph 2 primarily discuss?' — your map answers instantly."],
    ]);
    await insertRules(tid, [
      ["Map, Don't Memorize", "Read for structure, not content. Note: what does each paragraph do? Evidence? Counter-argument? Conclusion? Find details only when a question asks for them."],
      ['Tone is Usually Moderate', "GMAT passages rarely express extreme enthusiasm or strong condemnation. Wrong answers often overstate tone ('scathingly critical' vs 'mildly skeptical')."],
      ['Primary Purpose: Verb Matters', "The verb in the purpose answer must match what the author actually does. 'Argue' = takes a position. 'Describe' = neutral explanation. 'Compare' = two things side by side. Mismatched verb = wrong answer."],
      ['Science Passages: Follow the Methodology', 'For science passages: identify the hypothesis, the experiment, the result, and the author\'s interpretation. Questions often test whether you understand what the experiment actually showed.'],
      ['Multi-Viewpoint Passages: Track Whose Voice', "Some passages present multiple theories. Track which view belongs to whom. 'Some scientists believe... however, others argue...' — wrong answer often attributes one group's view to another."],
    ]);
    await insertMethods(tid, [
      { name: 'Passage Mapping', when_to_use: 'Every RC passage', steps: ["Read P1: identify main topic and author's stance", 'Each subsequent paragraph: one-word label (evidence, counter, example, conclusion)', 'Note WHERE details are without memorizing them', 'Answer questions by returning to the passage'], tip: 'Invest 3-4 minutes in reading and mapping; save time on questions.' },
      { name: 'Tone Identification', when_to_use: "Author's tone, attitude, or 'would most likely agree' questions", steps: ["Find language that reveals the author's feelings (adjectives, adverbs, qualifiers)", 'Is it positive, negative, or neutral?', "Calibrate intensity: 'somewhat concerned' vs 'strongly opposed'", 'Match to answer choice with same direction and intensity'], tip: "Read the first and last paragraph most carefully for tone — that's where authors are most opinionated." },
      { name: 'Primary Purpose Method', when_to_use: 'Primary purpose / main idea questions', steps: ["Identify the author's main claim from P1 or thesis", 'Identify what the rest of the passage does (support, compare, challenge?)', 'Choose answer with matching verb and appropriate scope'], tip: 'Eliminate answers that are too narrow (describe one example) or too broad (discuss all aspects of X).' },
    ]);
    await insertQuestions(tid, [
      { subtype: 'Primary Purpose: Action Verb Match', q_text: "[Science passage about a study showing that plants exposed to classical music grew faster than those in silence]\n\nThe primary purpose of the passage is to:\n\n(A) Prove conclusively that music improves plant growth\n(B) Describe a study and discuss its potential implications for agricultural science\n(C) Argue that all farmers should play classical music to their crops\n(D) Compare the effects of different music genres on plant growth\n(E) Challenge the assumption that plants are unresponsive to their environment", question_type: 'Primary purpose — match verb and scope', signals: 'Passage describes a study with implications. No strong conclusion drawn.', trap: "(A) 'Prove conclusively' — too strong; science passages are cautious. (C) Specific recommendation not in passage.", method: "(B) 'Describe + discuss implications' — neutral verb matching a typical science passage structure.", steps: ['The passage describes a study (verb: describe)', 'It then discusses what this means for agriculture (scope: implications)', '(B) matches both the action and scope appropriately', 'Answer: (B)'], difficulty: 'Easy' },
      { subtype: "Author's Tone: Moderate vs Extreme", q_text: "The author of the passage would most likely describe early critics of the theory as:\n\n(A) Completely misguided and intellectually dishonest\n(B) Somewhat hasty in dismissing evidence that later proved significant\n(C) Rigorous scientists who correctly identified the theory's flaws\n(D) Indifferent to the scientific evidence available at the time\n(E) Visionary thinkers whose skepticism advanced scientific debate", question_type: 'Author tone — moderate calibration', signals: 'Author likely presents critics as partially wrong but not villains. Look for moderate language.', trap: "(A) 'Completely misguided, dishonest' — extreme negative. (C) 'Correctly identified flaws' — positive when author likely disagreed. (E) Overly flattering.", method: "(B) Moderate criticism: 'somewhat hasty' — acknowledges their error without condemning them.", steps: ['Locate passage text about critics', "Author likely uses measured language: 'failed to appreciate', 'overlooked', 'too quickly dismissed'", "(B) 'somewhat hasty' — moderate, matches typical GMAT passage tone", 'Answer: (B)'], difficulty: 'Medium' },
      { subtype: 'Multi-Viewpoint: Attribution', q_text: "Passage presents Theory A (humans caused megafauna extinction) and Theory B (climate change caused it). The author concludes that both factors likely played a role.\n\nWhich of the following is most strongly supported by the passage?\n\n(A) Theory A proponents have conclusively proven their case.\n(B) Theory B has been largely abandoned by scientists.\n(C) The evidence is insufficient to completely rule out either explanation.\n(D) Human hunting was the primary cause of megafauna extinction.\n(E) Climate change had no significant impact on megafauna.", question_type: 'Inference from multi-viewpoint passage', signals: "Author takes a 'both matter' position — conservative conclusion follows.", trap: '(A) or (D) — overstating Theory A. (E) Contradicts stated conclusion.', method: "(C) directly follows from 'both likely played a role' — neither is ruled out.", steps: ["Author's conclusion: both factors likely played a role", '(C) follows: neither can be completely ruled out', '(A)(D)(E) all overstate one side', 'Answer: (C)'], difficulty: 'Medium' },
    ]);
    await insertPractice(tid, [
      ['How should you read an RC passage on your first pass?', 'Strategy', "Read for structure and main idea, not details. Note each paragraph's function (evidence, counter, conclusion). Don't memorize specifics."],
      ['What tone words signal the author is critical?', 'Tone identification', "'Unfortunately', 'failed to', 'overlooked', 'mistakenly', 'despite', 'neglected' — indicate criticism or disappointment."],
      ["What's the difference between 'the author argues' and 'the author suggests'?", 'Conceptual', "'Argues' implies a stronger, more explicit stance. 'Suggests' indicates a more tentative or implicit position. Match the intensity to what's in the passage."],
      ["A passage describes two competing theories without taking a side. What's the primary purpose?", 'Primary purpose', "'To compare/contrast two theories' or 'to present opposing views on X' — neutral verb, no strong position taken."],
      ["What does 'according to the passage' mean in a question?", 'Question type', 'The answer must be directly stated or closely paraphrased in the passage — not an inference. Find the explicit evidence.'],
    ]);
  }

  // 4. RC — Inference & Application Questions
  {
    const tid = await insertTopic(verbalSection.id, 'RC — Inference & Application Questions', 'Inferring unstated conclusions and applying passage logic to new scenarios', '🧩', verbalIdx++);
    await insertEquations(tid, [
      ['RC inference definition', '$$\\text{What must be true based on the passage?}$$', "Must follow from what's stated — don't add outside knowledge", "Detail: RC inference ≠ CR inference. In RC, the inference must follow from the passage (not real-world knowledge). Still must be 'must be true' not 'could be true'. Common: combining two statements from different paragraphs."],
      ['Application question', '$$\\text{Apply passage logic to a NEW situation}$$', "Author's principle or argument → applied to a new example", "Detail: Application questions give a new scenario and ask what the author would conclude, recommend, or how their argument applies. Requires understanding the author's reasoning, not just the facts."],
      ['Inference scope for RC', '$$\\text{Valid: stays within passage statements}\\quad\\text{Invalid: uses outside knowledge or over-extrapolates}$$', 'No outside knowledge — everything must come from the passage text', "Detail: Trap: using real-world knowledge about the topic. The passage might say something that contradicts common knowledge — go with the passage, not your knowledge."],
      ['Author agreement questions', "$$\\text{'Author would most likely agree that...' = RC inference about author's views}$$", "Find evidence in passage supporting the author's view on that topic", "Detail: These are inference questions about the author's position. The answer must be supported by explicit text. 'Most likely' = not certain, but strongly suggested."],
    ]);
    await insertRules(tid, [
      ['Passage Over Knowledge', 'In RC inference, always prioritize what the passage says over real-world knowledge. If the passage implies X, even if you know X is false in real life, X is the answer.'],
      ['Application: Identify the Principle', "For application questions: first extract the principle/rule from the passage. Then apply it to the new situation. The answer mirrors the passage's logic in a new context."],
      ['Author Agreement: Find the Quote', "For 'author would agree' questions: mentally match each answer choice to a specific passage sentence. If you can't find it, it's probably not the answer."],
      ['RC Inference: Stay Close to Text', 'Unlike CR inference (which combines premises), RC inference often requires noticing an implication of a single statement. Stay close to the original text.'],
      ["Beware 'Could be true' Traps", "GMAT inference answers must 'must be true' or 'strongly supported', not 'could be true'. If an answer is merely possible, it's likely wrong."],
    ]);
    await insertMethods(tid, [
      { name: 'Find the Textual Support', when_to_use: "Any RC inference or 'author agrees' question", steps: ["Rephrase the question as: 'where in the passage would this be supported?'", 'Scan for relevant paragraph(s)', 'Match the answer to specific text (paraphrase OK, fabrication not)', "If you can't point to a line, eliminate"], tip: "Hold the answer choice up next to the passage text. If you need to stretch to make them match, it's wrong." },
      { name: 'Application: Extract then Apply', when_to_use: "Application questions ('which scenario would the author find most analogous?')", steps: ['Extract the core principle from the passage example', 'State it in abstract terms (X leads to Y when Z)', 'Apply to each answer choice', 'Choose the one where the abstract principle holds'], tip: 'Paraphrase the principle in your own words before looking at answers.' },
      { name: 'Eliminate by Scope', when_to_use: 'Stuck on inference or application', steps: ['Eliminate: uses information not in the passage', 'Eliminate: contradicts the passage', 'Eliminate: too extreme/absolute', 'Choose: directly supported, appropriately hedged'], tip: 'Two answers are usually eliminated quickly by these rules. Spend time on the final two.' },
    ]);
    await insertQuestions(tid, [
      { subtype: 'RC Inference: Combine Paragraphs', q_text: "[Passage: P1 says coffee consumption has increased in urban areas. P2 says areas with higher coffee consumption show lower rates of afternoon productivity dips.]\n\nWhich of the following is most strongly supported by the passage?\n\n(A) Coffee consumption causes increased productivity.\n(B) Urban workers have higher productivity than rural workers.\n(C) Areas with increasing coffee consumption may have fewer afternoon productivity dips.\n(D) All productivity problems can be solved by increasing coffee consumption.\n(E) Coffee consumption has no effect on morning productivity.", question_type: 'RC inference — combine two paragraphs, stay conservative', signals: 'Two facts: urban coffee rising + high coffee = less afternoon dip. Combine carefully.', trap: "(A) 'Causes' — passage only shows correlation. (D) 'All productivity problems' — over-extrapolates.", method: '(C) Combines both paragraphs conservatively: urban areas (rising coffee) → may see less afternoon dip.', steps: ['P1: urban coffee consumption rising', 'P2: high coffee consumption areas = fewer afternoon dips', 'Combine: urban areas may have fewer afternoon dips', "(C) hedged with 'may' — appropriate scope", 'Answer: (C)'], difficulty: 'Medium' },
      { subtype: "Application: Author's Principle to New Scenario", q_text: "[Passage argues: companies that invest in employee training during economic downturns emerge stronger because competitors cut such investments, creating a talent advantage.]\n\nWhich of the following scenarios is most analogous to the argument in the passage?\n\n(A) A restaurant that raises prices during a recession to maintain profit margins.\n(B) A tech company that increases R&D spending when competitors are cutting back, positioning itself for future product advantages.\n(C) A retailer that reduces inventory during slow seasons to minimize holding costs.\n(D) A bank that lowers interest rates to attract more borrowers during economic growth.\n(E) A company that matches competitor spending exactly to avoid falling behind.", question_type: 'Application — identify analogous scenario', signals: "Extract principle: invest counter-cyclically when others cut → gain advantage. Apply to new context.", trap: '(A) Raises prices — not analogous (no counter-cyclical investment logic). (E) Matches spending — no differentiation.', method: '(B) R&D when competitors cut = exact same logic: invest counter-cyclically → future advantage.', steps: ['Principle: invest in X when competitors cut X → emerge with advantage', '(B) R&D spending up while competitors cut → future product advantage', "Directly mirrors the passage's logic in a new domain", 'Answer: (B)'], difficulty: 'Hard' },
      { subtype: 'Author Would Agree', q_text: "[Passage: argues that standardized testing overemphasizes memorization and undervalues critical thinking, and that college admissions should weigh extracurriculars and project-based learning more heavily.]\n\nWith which of the following would the author most likely agree?\n\n(A) Standardized tests should be eliminated entirely from all educational systems.\n(B) Extracurricular achievements are a more reliable predictor of success than test scores.\n(C) College admissions criteria that incorporate non-test measures can better assess student potential.\n(D) Students who perform poorly on standardized tests are less intelligent.\n(E) Project-based learning should replace all traditional classroom instruction.", question_type: "Author agreement — find textual support for each option", signals: "Author criticizes standardized tests and advocates for broader criteria. Find what's directly stated.", trap: "(A) 'Eliminated entirely' — too extreme; passage says 'weigh less', not 'eliminate'. (D) Contradicts author's premise.", method: "(C) mirrors the author's stated recommendation: admissions that incorporate non-test measures (extracurriculars, project learning).", steps: ["Author's position: standardized tests overemphasize memorization; more weight to extracurriculars/projects", "(C) 'incorporate non-test measures' = directly stated preference", "(A)(E) too extreme — author says 'weight more', not 'replace all'", 'Answer: (C)'], difficulty: 'Medium' },
    ]);
    await insertPractice(tid, [
      ['What makes an RC inference different from an RC application question?', 'Conceptual', 'Inference: what must be true based on the passage. Application: take the passage\'s principle and apply it to a new scenario.'],
      ['Author agrees question: should you use outside knowledge?', 'Strategy', 'No. Only use what\'s in the passage. Your outside knowledge might contradict the passage — always go with the passage.'],
      ['How do you extract a principle for application questions?', 'Strategy', "Find the causal/logical pattern in the passage. State it abstractly: 'when X happens under Y conditions, Z results.' Then find the answer that shows the same X→Z relationship."],
      ["Passage says 'studies suggest a link between X and Y.' Can you infer X causes Y?", 'Inference scope', "No. 'Suggests a link' indicates correlation or association, not causation. Cannot infer causation."],
      ["An answer choice for an inference question says 'X is always true.' The passage says 'X is usually true.' Is this answer correct?", 'Scope', "No. 'Always' is stronger than 'usually'. The answer over-extrapolates. Look for 'generally' or 'tends to' instead."],
    ]);
  }

  // ========== DI TOPICS ==========
  console.log('\n=== DI TOPICS ===');

  // 1. Two-Part Analysis — Logic & Verbal Type
  {
    const tid = await insertTopic(diSection.id, 'Two-Part Analysis — Logic & Verbal Type', 'Verbal and logical Two-Part Analysis: evaluate two interdependent conclusions from non-quantitative data', '🔀', diIdx++);
    await insertEquations(tid, [
      ['TPA structure', '$$\\text{Column 1 requirement} \\perp \\text{Column 2 requirement}$$', 'Two answers must be chosen — usually from the same pool of options', "Detail: TPA presents a scenario, a requirement for Column 1, a requirement for Column 2, and a set of options. You select one option for each column. The trick: they must BOTH work simultaneously — and often the same option CAN'T fill both columns."],
      ['Logical TPA format', '$$\\text{If [condition], what satisfies [Col 1] and [Col 2]?}$$', 'Often: find two things that jointly satisfy a system of logical constraints', "Detail: Logical/verbal TPA might ask: 'which two actions would together achieve X and Y?' or 'identify the assumption that supports the first argument and the assumption that supports the second argument.' Each column has its own specific logical task."],
      ['Verbal TPA: independent evaluation', '$$\\text{Evaluate each column\'s answer independently, then verify compatibility}$$', "Column 1 and Column 2 may draw from the same pool but have different criteria", "Detail: Don't assume the same answer works for both — it often can't. But do check: can your two chosen answers coexist given the passage constraints? Sometimes choosing A for Col 1 forces a particular answer for Col 2."],
    ]);
    await insertRules(tid, [
      ['Two Constraints, One Selection Each', "Each column has its own constraint. An answer that works for Column 1 might not work for Column 2. Solve them somewhat independently, then verify."],
      ['Watch for Mutual Exclusivity', "Sometimes the passage states that the two columns can't use the same option. Read for this constraint — it narrows choices fast."],
      ['Logic TPA: Map the Argument', 'For logic/verbal TPA, map the argument structure before looking at options. Know what the conclusion and premise are for each column\'s requirement.'],
      ['Numbers TPA vs Logic TPA', 'Quant TPA: set up equations, solve algebraically. Logic TPA: understand the argument or scenario deeply before applying to each column. Different skills required.'],
      ['Verify Both Together', 'After selecting Column 1 and Column 2 answers, verify they both hold under the same scenario. Joint consistency matters.'],
    ]);
    await insertMethods(tid, [
      { name: "Label Each Column's Constraint", when_to_use: 'All Two-Part Analysis questions', steps: ["Read and restate Column 1's requirement in your own words", "Read and restate Column 2's requirement", 'Note any constraints linking the two columns', 'Evaluate each option against each column independently', 'Verify your two picks are jointly consistent'], tip: 'Write C1 and C2 requirements as single sentences before looking at the options table.' },
      { name: 'Logic TPA: Argument Mapping', when_to_use: 'Verbal/logic TPA with arguments', steps: ["Identify the argument for Column 1's question (premises + conclusion)", "Identify the argument for Column 2's question", 'Apply standard CR techniques: assumption, strengthen, inference', "Select the option that addresses each column's specific requirement"], tip: 'Logic TPA is essentially two simultaneous CR mini-questions. Use CR skills.' },
      { name: 'Elimination + Verification', when_to_use: 'Stuck or uncertain on TPA', steps: ["Eliminate options that clearly fail Column 1's constraint", 'From remaining, find the best for Column 1', 'For Column 2: eliminate options that clearly fail', "Verify that chosen C1 and C2 don't contradict each other"], tip: 'If time-pressured: solve the easier column first, then use that to narrow Column 2.' },
    ]);
    await insertQuestions(tid, [
      { subtype: 'Logic TPA: Two Independent Arguments', q_text: "Two researchers study employee motivation:\nResearcher A concludes: Financial incentives increase short-term productivity.\nResearcher B concludes: Autonomy increases long-term retention.\n\nIn the table, identify one statement that strengthens Researcher A's conclusion and one that strengthens Researcher B's conclusion.\n\nOptions:\n(i) A company that increased bonuses saw 30% higher output for one quarter.\n(ii) Companies offering remote work have lower 5-year turnover.\n(iii) High salaries correlate with longer average tenure.\n(iv) Employees given flexible hours reported 40% higher job satisfaction.\n(v) Financial incentives were found ineffective in creative industries.", question_type: 'Logic TPA — strengthen two separate arguments', signals: 'Two separate arguments. Need one strengthener for each from the same pool.', trap: "(iii) for Researcher B — salary is financial, not autonomy. (iv) supports B but verify A.", method: 'A (financial+short-term): (i) directly shows financial incentive → short-term productivity spike. B (autonomy+retention): (ii) remote work (autonomy) → lower turnover (retention).', steps: ['Researcher A needs: financial incentive → short-term productivity', '(i) matches: bonuses → 30% output increase for one quarter ✓', 'Researcher B needs: autonomy → long-term retention', '(ii) matches: remote work → lower 5-year turnover ✓', 'C1: (i), C2: (ii)'], difficulty: 'Medium' },
      { subtype: 'Logic TPA: Identify Assumptions', q_text: "Argument 1: Company profits increased after the new CEO took over. Therefore, the new CEO caused the profit increase.\nArgument 2: Students at elite universities earn more after graduation. Therefore, attending an elite university causes higher earnings.\n\nIdentify one assumption for Argument 1 and one assumption for Argument 2:\n\n(i) No other factors contributed to the profit increase during that period.\n(ii) Elite university students would not have earned more regardless of where they attended.\n(iii) The CEO's specific decisions directly impacted revenue streams.\n(iv) University prestige is the only driver of post-graduation earnings.\n(v) Profit increases always follow CEO changes.", question_type: 'TPA — identify unstated assumption for each argument', signals: 'Two arguments with causal claims. Each needs its key assumption (the gap).', trap: "(iv) 'Only driver' — too strong for Arg 2; the assumption needn't be that extreme.", method: 'Arg 1: assumes correlation→causation (no other cause). (i) is the assumption. Arg 2: assumes selection bias doesn\'t explain it. (ii) is the assumption.', steps: ['Argument 1 gap: correlation ≠ causation; needs (i) no other factors', 'Argument 2 gap: selection bias — elite students may be high achievers regardless; needs (ii)', 'C1: (i), C2: (ii)'], difficulty: 'Hard' },
      { subtype: 'Scenario TPA: Two Compatible Conclusions', q_text: "A company can allocate its remaining budget to: Marketing, R&D, Hiring, Training, or Infrastructure. It must choose one use for 'maximum short-term revenue impact' and one for 'maximum long-term competitive advantage'.\n\n(i) Marketing — immediate sales boost\n(ii) R&D — new products in 3-5 years\n(iii) Hiring — adds talent now, competes short and long term\n(iv) Training — improves existing staff over 12 months\n(v) Infrastructure — reduces costs over 10-year horizon\n\nWhich satisfies SHORT-TERM revenue [C1] and LONG-TERM competitive advantage [C2]?", question_type: 'Scenario TPA — two criteria, two different answers', signals: "Two distinct criteria (short-term vs long-term). Unlikely the same option serves both.", trap: "(iii) Hiring — 'competes short and long term' makes it tempting for both, but you need to pick one per column.", method: 'Short-term revenue: (i) Marketing — immediate impact. Long-term advantage: (ii) R&D — new products in 3-5 years.', steps: ['C1 (short-term revenue): need immediate impact → (i) Marketing', 'C2 (long-term advantage): need sustained competitive edge → (ii) R&D', 'Verify: different options, both consistent with scenario', 'C1: (i), C2: (ii)'], difficulty: 'Medium' },
    ]);
    await insertPractice(tid, [
      ['What makes TPA different from a regular multiple-choice question?', 'Conceptual', 'You must choose one answer for each of two columns — two selections from the same pool. Both must be correct simultaneously.'],
      ['In a verbal TPA, what CR skills are most useful?', 'Conceptual', "Assumption identification, strengthen/weaken, and inference — applied independently to each column's argument."],
      ['Can you use the same option for both columns in a TPA?', 'Conceptual', 'Sometimes yes, sometimes the question prohibits it. Always read for this constraint. Usually the two columns have different enough criteria that the same option rarely works for both.'],
      ['How do you handle a TPA with 6 options and limited time?', 'Strategy', 'Solve the easier column first. Eliminate options clearly wrong for that column. Use process of elimination for the harder column.'],
      ["TPA logic question: Argument has a correlation-causation flaw. What's typically the assumption?", 'Application', 'That no confounding factors explain the correlation — i.e., the relationship is truly causal and not coincidental.'],
    ]);
  }

  // 2. Complex Data Interpretation
  {
    const tid = await insertTopic(diSection.id, 'Complex Data Interpretation', 'Reading multi-axis graphs, scatter plots, histograms, bubble charts, and mixed-data tables', '📡', diIdx++);
    await insertEquations(tid, [
      ['Scatter plot reading', '$$\\text{X-axis} = \\text{independent variable} \\quad \\text{Y-axis} = \\text{dependent variable}$$', 'Each point = one data entity; look for trend direction and outliers', "Detail: Positive correlation: points slope up-right. Negative: down-right. No correlation: random scatter. Outliers: points far from the trend. Line of best fit: shows overall trend. GMAT won't ask you to calculate correlation coefficient — just interpret visually."],
      ['Histogram reading', '$$\\text{Bar height = frequency; bar width = range of that class}$$', 'Area = frequency; bars are adjacent (no gaps)', 'Detail: Different from bar chart! Histogram bars touch because they represent continuous ranges. X-axis = value ranges (bins), Y-axis = frequency or count. Skewed right: long tail on right. Skewed left: long tail on left. Normal: bell curve.'],
      ['Bubble chart', '$$\\text{X = first variable} \\quad \\text{Y = second variable} \\quad \\text{Size = third variable}$$', "Three variables in one chart — don't miss the size dimension", 'Detail: Common GMAT trap: reading a bubble chart and ignoring bubble size. The size encodes a third variable (often revenue, population, or volume). Always check what each dimension represents in the legend.'],
      ['Dual-axis chart', '$$\\text{Left Y = first metric} \\quad \\text{Right Y = second metric (different scale)}$$', "Two scales — don't compare absolute heights across different axes", "Detail: Major trap: comparing bar heights when they're on different scales. Always check which axis each series uses. GMAT loves asking 'in which year was X greater than Y' — requires checking values against the correct axes."],
      ['Percent vs absolute value', '$$\\text{Percent change} = \\frac{\\text{new}-\\text{old}}{\\text{old}} \\times 100$$', 'Large percent change ≠ large absolute change (depends on base)', "Detail: A 50% increase on a small base may be less than a 10% increase on a large base. GMAT tests this distinction: 'which showed the greatest percent increase?' vs 'which showed the greatest absolute increase?' — these can have different answers."],
    ]);
    await insertRules(tid, [
      ['Read All Labels First', "Before looking at the data, read: chart title, axis labels, legend, units, any footnotes. You need to know what you're measuring."],
      ['Dual Axis: Check Which Scale', 'In dual-axis charts, always verify which metric uses which axis before comparing values or trends.'],
      ['Bubble Size is Data', 'In bubble charts, the size of each bubble represents a third variable. Missing this dimension means missing part of the question.'],
      ['Percent vs Absolute: Know Which is Asked', 'Greatest percent change ≠ greatest absolute change. The question will specify — read it carefully.'],
      ['Correlation ≠ Causation in Graphs', 'A scatter plot showing correlation does NOT prove causation. GMAT tests whether you know the difference.'],
    ]);
    await insertMethods(tid, [
      { name: 'Label-First Reading', when_to_use: 'Any data visualization question', steps: ['Read the title', 'Read axis labels (both axes, both units)', 'Read the legend if present', 'Identify number of data series', 'THEN look at the data and answer the question'], tip: '60 seconds spent reading labels saves 90 seconds of confusion on questions.' },
      { name: 'Calculation from Graph', when_to_use: 'When numerical answer needed from chart', steps: ['Identify which variable to read off (which axis)', 'Read the value as precisely as possible', 'Perform the required calculation (%, change, ratio)', "Estimate if values aren't exact — GMAT answer choices are usually spread out enough"], tip: "Round aggressively and use quick mental math — you don't need 3 decimal places." },
      { name: 'Trend Identification', when_to_use: 'Questions about direction or pattern', steps: ['Look for overall direction (increasing, decreasing, fluctuating)', 'Note any exceptions or reversals', 'For scatter plots: positive/negative/no correlation', 'Identify outliers if relevant'], tip: "Don't memorize specific values — describe the trend in words, then match to the answer." },
    ]);
    await insertQuestions(tid, [
      { subtype: 'Dual-Axis: Avoid Scale Confusion', q_text: "[Dual-axis chart: bars show revenue (left Y, $M), line shows employee count (right Y, thousands). Year 1-5 shown.]\n\nIn which year was revenue per employee highest?\n\n(A) Year 1\n(B) Year 2\n(C) Year 3\n(D) Year 4\n(E) Year 5", question_type: 'Dual-axis reading — calculate ratio from two series', signals: 'Two different scales. Revenue per employee = revenue / employees. Need to read both series for each year.', trap: 'Reading only the bars (revenue) and picking the tallest bar, ignoring employee count.', method: 'Read revenue AND employee count for each year. Compute ratio. Highest ratio = answer.', steps: ['For each year: read revenue (left axis) and employees (right axis)', 'Compute revenue/employee for each year', 'Year with highest ratio = answer (depends on actual chart values)', 'Key: both axes must be read before dividing'], difficulty: 'Hard' },
      { subtype: 'Scatter Plot: Outlier Identification', q_text: "[Scatter plot: X = advertising spend, Y = sales revenue, ~15 data points with an upward trend. One point is far above the trend line.]\n\nWhich of the following best describes the outlier shown in the scatter plot?\n\n(A) A data point with the highest advertising spend\n(B) A data point with lower-than-expected sales given its advertising spend\n(C) A data point with much higher sales than expected given its advertising spend\n(D) A data point that represents average performance\n(E) The data point that defines the line of best fit", question_type: 'Scatter plot — outlier interpretation', signals: 'Point far above trend line. Sales much higher than trend predicts for that level of advertising.', trap: '(B) Lower than expected — that would be below the trend line, not above.', method: 'Outlier above trend line: actual Y > predicted Y → higher sales than advertising spend would predict.', steps: ['Outlier is above the trend/line of best fit', 'Being above = actual sales GREATER than predicted by advertising spend', "(C) 'much higher sales than expected' matches", 'Answer: (C)'], difficulty: 'Medium' },
      { subtype: 'Histogram: Distribution Shape', q_text: "[Histogram showing customer ages: most customers are between 25-40, with frequencies tapering off sharply on the left (below 25) and slowly on the right (50+).]\n\nWhich best describes the distribution of customer ages?\n\n(A) Symmetric and bell-shaped\n(B) Skewed left with most customers over 40\n(C) Skewed right with a longer tail of older customers\n(D) Bimodal with peaks at 20 and 50\n(E) Uniform across all age groups", question_type: 'Histogram — distribution shape identification', signals: 'Most values concentrated on left, long tail on right. Skew direction matches tail direction.', trap: '(B) Skewed left — skew direction = direction of the TAIL, not the peak. Long tail on right = right-skewed.', method: 'Long tail on the right side of the histogram = right-skewed (positively skewed).', steps: ['Peak is on the left (25-40)', 'Long tapering tail extends to the right (older customers)', 'Right tail = right-skewed distribution', 'Answer: (C)'], difficulty: 'Medium' },
    ]);
    await insertPractice(tid, [
      ['What does a scatter plot with all points tightly clustered around an upward-sloping line indicate?', 'Interpretation', 'Strong positive correlation between X and Y variables.'],
      ['A histogram has bars of equal height across all bins. What type of distribution is this?', 'Interpretation', 'Uniform distribution — all values equally likely.'],
      ['Why is it wrong to compare bar heights in a dual-axis chart directly?', 'Conceptual', "The two axes have different scales/units. A taller bar for Series A doesn't mean it's larger than Series B if they're on different axes."],
      ["Chart shows Company A: +5% revenue growth; Company B: +20% revenue growth. A's absolute revenue is $1B, B's is $100M. Which grew more in absolute terms?", 'Percent vs absolute', 'Company A: 0.05×1B=$50M. Company B: 0.20×100M=$20M. Company A grew more in absolute terms.'],
      ['What are three things to read before analyzing a chart?', 'Strategy', 'Title, axis labels (with units), and legend. Also check footnotes if present.'],
    ]);
  }

  // Print final counts
  console.log('\n=== FINAL COUNTS ===');
  for (const section of [mathSection, verbalSection, diSection]) {
    const topics = await sb('topics', 'GET', null, `?section_id=eq.${section.id}`);
    console.log(`${section.title || section.slug}: ${topics.length} topics`);
  }

  console.log('\nDone! All content inserted successfully.');
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
