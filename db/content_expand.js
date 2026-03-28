/**
 * GMAT Hub — Content Expansion Script
 * Inserts 5 new Quant topics + full content into Supabase
 *
 * Run: node db/content_expand.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ykllxaopintikehgtqnj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbGx4YW9waW50aWtlaGd0cW5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY5MzgyNywiZXhwIjoyMDkwMjY5ODI3fQ.8tJ5-hfDRiFSv9_AF-Dqf1fP6R96yBY23LXALylR62Q';

async function sb(table, method = 'GET', body = null, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params}`;
  const res = await fetch(url, {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : '',
    },
    body: body ? JSON.stringify(body) : null
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${method} ${table}: ${res.status} ${err}`);
  }
  return res.json();
}

// ─── Topic Data ─────────────────────────────────────────────────────────────

const newTopics = [
  {
    title: 'Ratios & Proportions',
    subtitle: 'Part-to-part, part-to-whole, scaling, and proportion equations',
    icon: '🔀',
    equations: [
      { label: 'Ratio definition', formula: '$$a:b = \\frac{a}{b}$$', note: 'Ratio a:b means for every a units, b of another', detail: "Definition: A ratio compares two quantities. Signal words: 'ratio of', 'for every', 'per'. Key: ratios are multiplicative — a:b = 2a:2b. Example: Ratio 3:5 → total parts = 8; first part = 3/8 of total. Mistake: confusing part:part (3:5) with part:whole (3:8). Strategy: always find total parts first." },
      { label: 'Part-to-whole from ratio', formula: '$$\\text{part} = \\frac{\\text{ratio part}}{\\text{sum of parts}} \\times \\text{total}$$', note: 'Find actual amounts from a ratio using the total', detail: "Rule: sum ratio parts to get denominator, multiply by total. Example: ratio 3:4:5, total = 60 → parts = 15, 20, 25. Signal: 'distributed in ratio', 'split in ratio'. Mistake: using ratio numbers as actual amounts. Strategy: let parts = 3x, 4x, 5x; use total to solve for x." },
      { label: 'Cross-multiplication', formula: '$$\\frac{a}{b} = \\frac{c}{d} \\Rightarrow ad = bc$$', note: 'Solve proportion equations by cross-multiplying', detail: 'Method: cross-multiply ad = bc to find unknown. Example: x/12 = 5/8 → 8x = 60 → x = 7.5. Mistake: subtracting instead of cross-multiplying. Strategy: always set up as fraction = fraction first.' },
      { label: 'Scaling rule', formula: '$$a:b = ka:kb \\text{ (multiply only)}$$', note: 'Multiply both parts by k to scale; adding k changes the ratio', detail: "Rule: only multiplication preserves ratio. Adding constants changes it. Example: 2:3 ≠ 3:4, but 2:3 = 4:6. GMAT trap: 'if 5 people join each group, does ratio change?' Yes it does." },
      { label: 'Ratio chain', formula: '$$A:B = m:n,\\ B:C = p:q \\Rightarrow A:B:C = mp:np:nq$$', note: 'Bridge two ratios by making the common term equal', detail: 'Method: find LCM of B values, scale each ratio accordingly. Example: A:B = 2:3 and B:C = 4:5 → make B = 12: A:B = 8:12, B:C = 12:15 → A:B:C = 8:12:15. Mistake: adding ratios directly.' },
    ],
    rules: [
      { title: 'Part vs Whole', content: 'Ratio a:b is part-to-part. Fraction a/(a+b) is part-to-whole. Know which you need before solving.' },
      { title: 'Unknown Multiplier', content: 'If ratio is a:b, let actual values = ax and bx. Use any given constraint to solve for x.' },
      { title: "Scaling Preserves, Adding Doesn't", content: 'Multiplying both ratio terms by k preserves the ratio. Adding k to both DOES NOT.' },
      { title: 'Three-Way Ratio', content: 'For a:b:c, total parts = a+b+c. Each actual value = (ratio part / total parts) × total.' },
      { title: 'Cross-Multiplication', content: 'For a/b = c/d: ad = bc. The only reliable method for proportion equations.' },
    ],
    methods: [
      { name: 'Unknown Multiplier', when_to_use: 'Ratio given, need actual values or total', steps: ['Write ratio parts as ax, bx (or ax, bx, cx)', 'Use given constraint (sum, difference, one actual value) to find x', 'Compute required value using x'], tip: 'This is the default method for 90% of ratio problems.' },
      { name: 'Part-to-Whole Conversion', when_to_use: 'Need fraction or percent from ratio', steps: ['Add all ratio parts for total parts', "Each part's fraction = part / total parts", 'Multiply by 100 for percent or by total for actual amount'], tip: 'Always convert part:part to part:whole before computing percentages.' },
      { name: 'Ratio Chain Bridge', when_to_use: 'Two ratios share a common term (A:B and B:C)', steps: ['Find LCM of the two values for the shared term', 'Scale each ratio so shared term equals the LCM', 'Combine into A:B:C'], tip: "The bridge term must be identical — LCM is your friend here." },
    ],
    questions: [
      { subtype: 'Unknown Multiplier: Find Total', q_text: "Tickets for a show are sold in three price tiers in the ratio 5:3:2. If 120 tickets were sold at the highest tier, how many total tickets were sold?\n\n(A) 200\n(B) 240\n(C) 300\n(D) 360\n(E) 400", question_type: 'Part-to-whole ratio with given anchor', signals: 'Ratio 5:3:2 given; one tier\'s count given (120). Highest tier = 5 parts. Total parts = 10.', trap: 'Choosing (B) 240 by doubling 120, or (A) 200 by adding ratio parts directly.', method: 'Unknown multiplier: 5x = 120 → x = 24. Total = (5+3+2) × 24 = 240.', steps: ['Identify: highest tier = 5 parts, 120 tickets → 5x = 120', 'Solve: x = 24', 'Total = 10 × 24 = 240', 'Answer: (B) 240'], difficulty: 'Medium' },
      { subtype: 'Ratio Chain: Three-Term Bridge', q_text: "In a company, the ratio of managers to analysts is 2:5, and the ratio of analysts to interns is 3:8. What is the ratio of managers to interns?\n\n(A) 1:10\n(B) 3:20\n(C) 6:40\n(D) 2:8\n(E) 6:20", question_type: 'Ratio chain — bridge via common term', signals: "Two separate ratios sharing 'analysts'. Need to combine into single M:I ratio.", trap: 'Using M:A = 2:5 and A:I = 3:8 directly without scaling the common term (analysts).', method: 'Scale so analysts match: M:A = 6:15, A:I = 15:40 → M:I = 6:40 = 3:20.', steps: ['LCM of analysts: 5 and 3 → LCM = 15', 'Scale M:A = 2:5 → ×3 → 6:15', 'Scale A:I = 3:8 → ×5 → 15:40', 'M:I = 6:40 = 3:20', 'Answer: (B) 3:20'], difficulty: 'Hard' },
      { subtype: 'DS: Is the Ratio Determinable?', q_text: "The ratio of red to blue marbles in a jar is r:b. Is r > b?\n\n(1) r + b = 30\n(2) r − b = 6\n\n(A) Statement (1) ALONE is sufficient\n(B) Statement (2) ALONE is sufficient\n(C) BOTH statements TOGETHER are sufficient\n(D) EACH statement ALONE is sufficient\n(E) Statements (1) and (2) TOGETHER are NOT sufficient", question_type: 'DS — determine inequality from system of equations', signals: 'Asking if r > b — need the actual values or a ratio. Each statement gives one linear equation.', trap: '(A) Statement 1 alone: r+b=30 gives infinite solutions. Statement 2: r-b=6 tells us r > b directly.', method: 'Statement 2: r - b = 6 > 0 → r > b. Sufficient alone. Statement 1 insufficient.', steps: ['Statement (1): r+b=30 → could be r=16, b=14 (yes) or r=14, b=16 (no) → Insufficient', 'Statement (2): r−b=6 → r = b+6, so r > b always → Sufficient', 'Answer: (B)'], difficulty: 'Medium' },
    ],
    practice_items: [
      { question: 'If A:B = 4:7, what fraction of the total is B?', question_type: 'Conceptual', answer: '7/11 — total parts = 4+7 = 11; B = 7/11 of total.' },
      { question: 'A recipe uses flour and sugar in ratio 5:2. If you use 35g of flour, how much sugar do you need?', question_type: 'Word Problem', answer: '14g — 5x = 35 → x = 7; sugar = 2×7 = 14g.' },
      { question: 'Ratio of A:B = 3:4 and B:C = 8:5. Find A:C.', question_type: 'Ratio Chain', answer: 'A:C = 6:5 — scale B to LCM(4,8)=8: A:B=6:8, B:C=8:5 → A:C=6:5.' },
      { question: 'If 3/x = 7/21, what is x?', question_type: 'Computation', answer: 'x = 9 — cross multiply: 63 = 7x → x = 9.' },
      { question: 'A sum of $240 is split between P and Q in ratio 3:5. How much does Q receive?', question_type: 'Word Problem', answer: '$150 — total parts = 8; Q = (5/8) × 240 = $150.' },
    ],
  },
  {
    title: 'Percentages & Markups',
    subtitle: 'Percent change, markup, discount, successive percent changes, and percent of',
    icon: '💯',
    equations: [
      { label: 'Percent formula', formula: '$$\\% = \\frac{\\text{part}}{\\text{whole}} \\times 100$$', note: 'Find percent: divide part by whole, multiply by 100', detail: "Always identify: what is the 'whole' (base)? The base is what you're taking a percent OF. Mistake: using the wrong base — especially after a change, the new amount becomes the new base." },
      { label: 'Percent change', formula: '$$\\%\\text{ change} = \\frac{\\text{new} - \\text{old}}{\\text{old}} \\times 100$$', note: 'Always divide by the ORIGINAL value, not the new one', detail: "Signal: 'increased/decreased by what percent?' Base = original. Example: price went from $80 to $100 → change = 20/80 × 100 = 25% increase. Trap: using 20/100 = 20%." },
      { label: 'Percent of percent', formula: '$$x\\%\\text{ of }y = \\frac{x \\cdot y}{100}$$', note: 'Convert percent to decimal and multiply', detail: "Example: 30% of 150 = 0.30 × 150 = 45. For 'percent of percent': 20% of 30% of 200 = 0.20 × 0.30 × 200 = 12." },
      { label: 'Successive percent change', formula: '$$\\text{Net} = (1 \\pm r_1)(1 \\pm r_2) - 1$$', note: 'Apply multipliers sequentially; NOT additive', detail: "Example: +20% then −20% → 1.2 × 0.8 = 0.96 → net −4%. Trap: thinking +20% and −20% cancel out. They don't — you always lose a bit because the decrease applies to a higher base. GMAT loves this trap." },
      { label: 'Markup and selling price', formula: '$$\\text{SP} = \\text{CP} \\times (1 + \\text{markup}\\%)$$', note: 'Selling price = cost price × (1 + markup fraction)', detail: 'Example: cost = $60, markup = 25% → SP = 60 × 1.25 = $75. For discount: SP = MP × (1 − discount%). Chain: CP → markup → MP → discount → final SP.' },
      { label: 'Reverse percent', formula: '$$\\text{original} = \\frac{\\text{new value}}{1 \\pm \\%}$$', note: 'Work backward from new value to find original', detail: "Example: after 20% increase, price is $120. Original = 120/1.20 = $100. Trap: subtracting 20% from $120 (gives $96, not $100). Always divide by the multiplier." },
    ],
    rules: [
      { title: 'Base is Always the Original', content: 'Percent change uses the ORIGINAL value as the denominator, not the new value. After a change, the new value becomes the base for the next change.' },
      { title: 'Successive Changes Multiply', content: 'Apply percent changes as multipliers: +20% = ×1.20; −15% = ×0.85. Multiply them — do NOT add.' },
      { title: 'Reverse Percent Trap', content: "To find the original before a percent increase, divide by (1 + rate), don't subtract the percent from the current value." },
      { title: 'Percent vs Percentage Points', content: "'Increased by 5%' means multiply by 1.05. 'Increased by 5 percentage points' means add 5 to the percent figure." },
      { title: 'Markup vs Discount Chain', content: "Markup is applied to cost price. Discount is applied to marked/list price. These are different bases — don't apply both to the same number." },
    ],
    methods: [
      { name: 'Multiplier Method', when_to_use: 'Percent increase, decrease, or chain of changes', steps: ['Convert each percent change to a multiplier (+r% → ×(1+r/100))', 'Multiply all multipliers together', 'Subtract 1 and ×100 for net percent change'], tip: 'This is the only reliable method for successive percent changes. Never add percents.' },
      { name: 'Reverse Percent', when_to_use: 'Given final value after a percent change, find original', steps: ['Write: final = original × multiplier', 'Divide: original = final / multiplier', 'Example: final = 84, after 40% decrease → original = 84 / 0.60 = 140'], tip: "NEVER subtract the percent from the final value — that's the #1 percent trap." },
      { name: 'Smart Number for Percent Problems', when_to_use: 'Unspecified base, need to find percent relationship', steps: ['Pick base = 100 (makes percent arithmetic trivial)', 'Apply all operations', 'Read off the percent directly from the result'], tip: 'Works when the actual base is unknown — pick 100 every time.' },
    ],
    questions: [
      { subtype: 'Successive Percent: Net Change', q_text: "A store increases the price of a jacket by 30%, then offers a 20% discount on the new price. What is the net percent change from the original price?\n\n(A) −10%\n(B) −4%\n(C) +4%\n(D) +10%\n(E) +14%", question_type: 'Successive percent changes', signals: "Two sequential percent changes. Don't add: +30% and −20% ≠ +10%.", trap: "(A) adding +30 and −20 = +10, then thinking it's symmetric so net = −10%. Or (D) just adding +30 − 20 = +10%.", method: 'Multiplier: 1.30 × 0.80 = 1.04 → net +4%.', steps: ['Multiplier 1: +30% → ×1.30', 'Multiplier 2: −20% → ×0.80', 'Net: 1.30 × 0.80 = 1.04', 'Net change = +4%', 'Answer: (C) +4%'], difficulty: 'Medium' },
      { subtype: 'Reverse Percent: Find Original', q_text: "After a 40% increase, a product's price is $168. What was the original price?\n\n(A) $100.80\n(B) $112\n(C) $120\n(D) $128\n(E) $134", question_type: 'Reverse percent — find original from final', signals: 'Given final value after percent increase. Need to reverse.', trap: "Subtracting 40% from $168 = $168 × 0.60 = $100.80 → (A). That's wrong.", method: 'Divide by multiplier: 168 / 1.40 = $120.', steps: ['Set up: 168 = original × 1.40', 'Solve: original = 168 / 1.40 = 120', 'Answer: (C) $120'], difficulty: 'Easy' },
      { subtype: 'Markup Chain: Cost to Final Price', q_text: "A retailer buys a watch for $200, marks it up 50%, then offers a 20% discount. What is the final selling price?\n\n(A) $220\n(B) $230\n(C) $240\n(D) $250\n(E) $260", question_type: 'Markup then discount chain', signals: 'Cost price → markup → marked price → discount → selling price. Two steps, different bases.', trap: 'Applying 50% − 20% = 30% to original: 200 × 1.30 = $260 (E).', method: 'Markup: 200 × 1.50 = $300. Discount: 300 × 0.80 = $240.', steps: ['Step 1: Markup 50% → 200 × 1.50 = $300', 'Step 2: Discount 20% → 300 × 0.80 = $240', 'Answer: (C) $240'], difficulty: 'Medium' },
    ],
    practice_items: [
      { question: 'A shirt costs $40. After a 25% markup, what is the selling price?', question_type: 'Computation', answer: '$50 — 40 × 1.25 = $50.' },
      { question: 'A price dropped from $250 to $200. What is the percent decrease?', question_type: 'Percent change', answer: '20% — (250−200)/250 × 100 = 20%.' },
      { question: 'After a 15% discount, a book costs $51. What was the original price?', question_type: 'Reverse percent', answer: '$60 — 51 / 0.85 = $60.' },
      { question: 'A stock rises 10% Monday, falls 10% Tuesday. What is the net change?', question_type: 'Successive percent', answer: '−1% — 1.10 × 0.90 = 0.99 → −1%.' },
      { question: 'What is 35% of 80?', question_type: 'Computation', answer: '28 — 0.35 × 80 = 28.' },
    ],
  },
  {
    title: 'Word Problems — Rate, Work & Mixture',
    subtitle: 'Distance-rate-time, work rates, combined work, and mixture problems',
    icon: '⚗️',
    equations: [
      { label: 'Distance formula', formula: '$$d = r \\times t$$', note: 'Distance = rate × time (works for any uniform motion)', detail: "The foundation of all motion problems. If two objects move: draw a table with columns d, r, t for each. Constraint types: same distance, total distance, meet in middle. Always label who is who." },
      { label: 'Relative speed (same direction)', formula: '$$r_{\\text{rel}} = |r_1 - r_2|$$', note: 'Catching up: relative speed = difference of speeds', detail: 'Use when one object chases another. Time to close gap = gap / relative speed. Example: A at 60mph, B at 40mph, B has 50mi head start → time = 50/(60−40) = 2.5 hours.' },
      { label: 'Relative speed (opposite direction)', formula: '$$r_{\\text{rel}} = r_1 + r_2$$', note: 'Approaching each other: add speeds', detail: 'Time to meet = total gap / sum of speeds. Example: two trains 300mi apart, 60mph and 40mph toward each other → meet in 300/100 = 3 hours.' },
      { label: 'Work rate formula', formula: '$$\\text{Work} = \\text{Rate} \\times \\text{Time}$$', note: 'Rate = 1/T where T is time to complete alone', detail: "If A completes a job in 4 hours: A's rate = 1/4 job/hour. Combined rate = sum of individual rates. Time together = 1 / (sum of rates)." },
      { label: 'Combined work rate', formula: '$$\\frac{1}{T_{\\text{together}}} = \\frac{1}{T_A} + \\frac{1}{T_B}$$', note: 'Add rates, not times', detail: 'Example: A takes 3hr, B takes 6hr → combined = 1/3 + 1/6 = 1/2 → together = 2hr. Trap: averaging times. Never average — add RATES.' },
      { label: 'Mixture formula', formula: '$$C_1 V_1 + C_2 V_2 = C_f (V_1 + V_2)$$', note: 'Total solute before = total solute after', detail: "C = concentration (as decimal or fraction), V = volume. Set up: (concentration₁)(amount₁) + (concentration₂)(amount₂) = (final concentration)(total amount). Works for any mixture: acid, salt, alcohol." },
    ],
    rules: [
      { title: 'Rate × Time = Work/Distance', content: 'The single most important formula in quantitative reasoning. Build a table: label each entity, fill in d/r/t, use the relationship to find the unknown.' },
      { title: 'Add Rates, Not Times', content: "For combined work: add RATES (1/T₁ + 1/T₂), then take the reciprocal. Never average times — that's always wrong." },
      { title: 'Relative Speed Depends on Direction', content: 'Same direction → subtract speeds (chasing). Opposite direction → add speeds (approaching). Head-on or back-to-back — add.' },
      { title: 'Mixture: Solute is Conserved', content: "Total amount of the substance being mixed doesn't change. Set up: concentration × volume for each component, sum equals final." },
      { title: 'Partial Work', content: 'If A works for 2 hours, then A+B together finish: first compute what A does in 2hr = 2/T_A. Remaining = 1 − 2/T_A. Then solve for time at combined rate.' },
    ],
    methods: [
      { name: 'RTD Table', when_to_use: 'Any rate-time-distance or rate-time-work problem', steps: ['Draw table: | Entity | Rate | Time | Distance/Work |', 'Fill in two of three columns for each row', 'Use d=rt (or work=rate×time) to fill the third', 'Use the story constraint to write an equation'], tip: 'Always set up the table first — it forces you to organize information before solving.' },
      { name: 'Add Work Rates', when_to_use: 'Two or more people/machines working together', steps: ["Find each entity's rate = 1/T (fraction of job per unit time)", 'Add all rates for combined rate', 'Time together = 1 / combined rate'], tip: "If they work for different amounts of time, use: rate × time for each, set sum = 1 full job." },
      { name: 'Mixture Setup', when_to_use: 'Mixing two substances of different concentrations', steps: ['Identify: concentration and amount of each component', 'Set up: C₁V₁ + C₂V₂ = C_f(V₁+V₂)', 'Solve for the unknown (usually amount of one component)'], tip: 'A common shortcut: use alligation (diagonal method) for quick mental calculation.' },
    ],
    questions: [
      { subtype: 'Catch-Up: Relative Speed', q_text: "Train A leaves City X at 9:00 AM traveling at 60 mph. Train B leaves City X at 11:00 AM traveling in the same direction at 90 mph. At what time will Train B catch Train A?\n\n(A) 1:00 PM\n(B) 2:00 PM\n(C) 3:00 PM\n(D) 4:00 PM\n(E) 5:00 PM", question_type: 'Catch-up problem — relative speed', signals: 'Same direction, same start point, different departure times and speeds. B starts 2hr later.', trap: 'Setting distances equal without accounting for 2hr head start. Or using average of 60 and 90.', method: "Head start = 60×2 = 120 miles. Relative speed = 90−60 = 30 mph. Time = 120/30 = 4 hrs after 11AM = 3PM.", steps: ["A's head start = 60 mph × 2 hr = 120 miles", 'Relative speed = 90 − 60 = 30 mph', 'Time for B to close gap = 120/30 = 4 hours', 'B leaves at 11 AM + 4 hr = 3:00 PM', 'Answer: (C) 3:00 PM'], difficulty: 'Medium' },
      { subtype: 'Combined Work: Partial Work First', q_text: "Pipe A fills a tank in 6 hours. Pipe B fills it in 4 hours. Pipe A runs alone for 2 hours, then both pipes run together until the tank is full. How long do both pipes run together?\n\n(A) 1 hr 12 min\n(B) 1 hr 20 min\n(C) 1 hr 36 min\n(D) 2 hr\n(E) 2 hr 24 min", question_type: 'Partial work + combined work', signals: 'A works alone first, then both work together. Work done in phase 1 reduces remaining work.', trap: "Computing combined rate for both phases: 1/6 + 1/4 × total time = 1. Ignores that A works alone first.", method: 'Phase 1: A fills 2/6 = 1/3. Remaining = 2/3. Combined rate = 1/6+1/4 = 5/12. Time = (2/3)/(5/12) = 8/5 = 1.6 hr = 1 hr 36 min.', steps: ['Phase 1: A alone for 2hr → fills 2/6 = 1/3 of tank', 'Remaining: 1 − 1/3 = 2/3', 'Combined rate: 1/6 + 1/4 = 2/12 + 3/12 = 5/12', 'Time = (2/3) ÷ (5/12) = (2/3) × (12/5) = 8/5 = 1.6 hr', '1.6 hr = 1 hr 36 min → Answer: (C)'], difficulty: 'Hard' },
      { subtype: 'Mixture: Find Amount to Add', q_text: "How many liters of pure water must be added to 20 liters of a 30% salt solution to produce a 20% salt solution?\n\n(A) 5\n(B) 8\n(C) 10\n(D) 12\n(E) 15", question_type: 'Mixture — dilution', signals: 'Adding pure water (0% salt) to dilute a solution. Final concentration given.', trap: 'Setting up as 20% of 20 = new amount of salt (ignoring that water adds volume).', method: 'Salt stays constant: 0.30×20 = 0.20×(20+x) → 6 = 0.20(20+x) → 30 = 20+x → x = 10.', steps: ['Salt in original: 0.30 × 20 = 6 liters', 'Final: 0.20 × (20+x) = 6', '20+x = 30 → x = 10', 'Answer: (C) 10 liters'], difficulty: 'Medium' },
    ],
    practice_items: [
      { question: 'A car travels 150 miles in 3 hours. What is its speed?', question_type: 'Computation', answer: '50 mph — r = d/t = 150/3 = 50.' },
      { question: 'Worker A takes 8 hrs to complete a job, Worker B takes 4 hrs. How long do they take together?', question_type: 'Combined work', answer: '8/3 hrs ≈ 2 hr 40 min — combined rate = 1/8+1/4 = 3/8; time = 8/3.' },
      { question: 'Two cyclists start from the same point going opposite directions at 15 mph and 20 mph. How far apart are they after 3 hours?', question_type: 'Relative speed', answer: '105 miles — relative speed = 35 mph × 3 hr = 105 miles.' },
      { question: 'A 50L mixture is 40% alcohol. How much pure alcohol must be added to make it 50% alcohol?', question_type: 'Mixture', answer: '10L — 0.40×50=20; 20+x = 0.50×(50+x) → x=10.' },
      { question: 'Train travels 240 miles. First half at 60 mph, second half at 80 mph. Total time?', question_type: 'Average speed trap', answer: '3.5 hr — time1 = 120/60=2hr; time2=120/80=1.5hr; total=3.5hr.' },
    ],
  },
  {
    title: 'Statistics & Probability',
    subtitle: 'Mean, median, mode, range, standard deviation, and basic probability',
    icon: '📉',
    equations: [
      { label: 'Arithmetic mean', formula: '$$\\bar{x} = \\frac{\\sum x_i}{n}$$', note: 'Mean = sum of values ÷ number of values', detail: 'Key: Mean × n = Sum. This lets you find missing values. If average of 5 numbers is 12, sum = 60. Trap: adding a new value changes both sum and n.' },
      { label: 'Weighted mean', formula: '$$\\bar{x} = \\frac{\\sum w_i x_i}{\\sum w_i}$$', note: 'Weighted mean accounts for different group sizes', detail: 'Example: 30 students average 80 and 20 students average 90 → combined = (30×80 + 20×90)/50 = 84. Trap: simply averaging 80 and 90 = 85 (ignores group sizes).' },
      { label: 'Median', formula: '$$\\text{Median} = \\begin{cases} x_{(n+1)/2} & n \\text{ odd} \\\\ \\frac{x_{n/2} + x_{n/2+1}}{2} & n \\text{ even} \\end{cases}$$', note: 'Middle value of sorted data; unaffected by extreme values', detail: 'Sort first. Median is robust to outliers; mean is not. GMAT tests: which measure changes when an extreme value is added/removed.' },
      { label: 'Standard deviation concept', formula: '$$\\sigma = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n}}$$', note: 'Measures spread around the mean — GMAT tests concept, not calculation', detail: "You will NOT calculate standard deviation on GMAT Focus. You need to know: larger spread = larger SD; shifting all values by constant doesn't change SD; multiplying all values by k multiplies SD by k." },
      { label: 'Range', formula: '$$\\text{Range} = \\max - \\min$$', note: 'Simplest measure of spread', detail: 'Only uses two values. Highly sensitive to outliers. GMAT: often paired with median/mean comparison questions.' },
      { label: 'Basic probability', formula: '$$P(A) = \\frac{\\text{favorable outcomes}}{\\text{total outcomes}}$$', note: 'Probability = favorable / total (all outcomes equally likely)', detail: 'Range: 0 ≤ P ≤ 1. Complement: P(not A) = 1 − P(A). Independent events: P(A and B) = P(A) × P(B). Mutually exclusive: P(A or B) = P(A) + P(B).' },
      { label: 'Compound probability', formula: '$$P(A \\cap B) = P(A) \\cdot P(B) \\text{ (if independent)}$$', note: 'Multiply for AND (independent); add for OR (mutually exclusive)', detail: "Independent AND: multiply probabilities. Mutually exclusive OR: add. Non-exclusive OR: P(A∪B) = P(A)+P(B)−P(A∩B). GMAT Focus: mostly tests conceptual understanding." },
    ],
    rules: [
      { title: 'Mean × n = Sum', content: 'The most useful mean identity on GMAT. If mean = 8 and n = 6, sum = 48. Use to find missing values when mean and count are given.' },
      { title: 'Median vs Mean: Effect of Outliers', content: 'Mean changes with outliers; median does not (much). Adding a very large value increases mean more than median. GMAT tests this conceptually.' },
      { title: 'SD: Shift vs Scale', content: 'Adding a constant to all values → mean shifts, SD stays the same. Multiplying all values by k → mean and SD both multiply by k.' },
      { title: 'Probability Complement', content: 'P(at least one) = 1 − P(none). This is almost always easier than counting all favorable outcomes directly.' },
      { title: 'Independent vs Mutually Exclusive', content: "Independent: one event doesn't affect the other. P(A and B) = P(A)×P(B). Mutually exclusive: cannot both happen. P(A and B) = 0. Do NOT confuse these." },
    ],
    methods: [
      { name: 'Mean-Sum Identity', when_to_use: 'Find missing value when mean and count are given', steps: ['Compute total sum = mean × n', 'Sum all known values', 'Subtract from total sum to find missing value'], tip: "Works for any 'average' problem where one value is unknown." },
      { name: 'Complement Probability', when_to_use: 'P(at least one) type questions', steps: ['Compute P(none of the events happen)', 'Answer = 1 − P(none)'], tip: "Dramatically simpler than counting all ways 'at least one' can happen." },
      { name: 'Sort First for Median/Range', when_to_use: 'Any question about median, range, or percentile', steps: ['Sort the data set in ascending order', 'Identify the middle value(s) for median', 'For range: max − min'], tip: "Never compute median from unsorted data — you'll get the wrong value." },
    ],
    questions: [
      { subtype: 'Mean: Find Missing Value', q_text: "The average (arithmetic mean) of 6 numbers is 14. If 5 of the numbers are 8, 11, 15, 17, and 19, what is the sixth number?\n\n(A) 10\n(B) 12\n(C) 14\n(D) 16\n(E) 18", question_type: 'Mean — find missing value using sum identity', signals: 'Mean and count given → sum = 84. Five values given. Find 6th.', trap: 'Thinking the 6th number must equal the mean (14).', method: 'Sum = 6×14 = 84. Known sum = 8+11+15+17+19 = 70. Missing = 84−70 = 14.', steps: ['Total sum = 14 × 6 = 84', 'Sum of known values = 8+11+15+17+19 = 70', '6th number = 84 − 70 = 14', 'Answer: (C) 14'], difficulty: 'Easy' },
      { subtype: 'Standard Deviation: Conceptual Shift', q_text: "Set S = {3, 7, 11, 15, 19} has mean 11 and standard deviation d. Set T is formed by adding 6 to every element of S. Which of the following is true about Set T?\n\n(A) Mean = 11, SD = d\n(B) Mean = 17, SD = d\n(C) Mean = 17, SD = d + 6\n(D) Mean = 11, SD = d + 6\n(E) Mean = 17, SD = 6d", question_type: 'SD conceptual — effect of adding constant', signals: "Every element shifts by +6. Tests SD concept: shift doesn't change spread.", trap: '(C) adding 6 to SD, or (E) multiplying SD by 6.', method: 'Adding constant → mean increases by 6 (to 17), SD unchanged (still d).', steps: ['Adding 6 to all values shifts the mean: 11+6 = 17', 'Spread around mean is unchanged: SD = d', 'Answer: (B)'], difficulty: 'Medium' },
      { subtype: 'Probability: Complement Method', q_text: "A bag has 4 red and 6 blue marbles. Two marbles are drawn without replacement. What is the probability of getting at least one red marble?\n\n(A) 2/3\n(B) 7/15\n(C) 8/15\n(D) 11/15\n(E) 13/15", question_type: 'Probability — at least one using complement', signals: "'At least one red' → use complement: P(no red) = P(both blue).", trap: "Adding P(exactly 1 red) + P(exactly 2 red) directly — messy calculation.", method: 'P(no red) = (6/10)×(5/9) = 30/90 = 1/3. P(at least one red) = 1 − 1/3 = 2/3.', steps: ['P(no red) = P(1st blue) × P(2nd blue | 1st blue)', '= 6/10 × 5/9 = 30/90 = 1/3', 'P(at least 1 red) = 1 − 1/3 = 2/3', 'Answer: (A) 2/3'], difficulty: 'Medium' },
    ],
    practice_items: [
      { question: 'Mean of {4, 8, 12, x} = 9. Find x.', question_type: 'Computation', answer: 'x = 12 — sum = 36; 4+8+12+x = 36 → x = 12.' },
      { question: 'Range of {3, 7, 2, 15, 9} = ?', question_type: 'Computation', answer: '13 — max=15, min=2; 15−2=13.' },
      { question: 'P(rolling a 4 or 5 on a fair die) = ?', question_type: 'Probability', answer: '1/3 — 2 favorable out of 6 total.' },
      { question: 'Set {5,10,15,20,25} — if 5 is added to each value, what happens to mean and SD?', question_type: 'Conceptual', answer: 'Mean increases by 5, SD stays the same.' },
      { question: 'Coin flipped 3 times. P(at least one head) = ?', question_type: 'Complement probability', answer: '7/8 — P(no heads) = (1/2)³ = 1/8; P(at least one) = 1 − 1/8 = 7/8.' },
    ],
  },
  {
    title: 'Geometry',
    subtitle: 'Lines, angles, triangles, circles, and coordinate geometry',
    icon: '📐',
    equations: [
      { label: 'Triangle angle sum', formula: '$$\\angle A + \\angle B + \\angle C = 180°$$', note: 'Angles in any triangle sum to 180°', detail: 'Key consequence: exterior angle = sum of two non-adjacent interior angles. Isosceles triangle: two equal angles opposite equal sides.' },
      { label: 'Pythagorean theorem', formula: '$$a^2 + b^2 = c^2$$', note: 'Right triangle: legs a,b and hypotenuse c', detail: 'Common triples: 3-4-5, 5-12-13, 8-15-17. Multiples also work: 6-8-10, 9-12-15. If a²+b² > c²: acute triangle. If a²+b² < c²: obtuse triangle.' },
      { label: 'Special right triangles', formula: '$$45-45-90: s : s : s\\sqrt{2}$$\\n$$30-60-90: s : s\\sqrt{3} : 2s$$', note: 'Memorize these — they appear constantly on GMAT', detail: 'If hypotenuse = 10 in 30-60-90: short leg = 5, long leg = 5√3. 45-45-90 from square diagonal. 30-60-90 from equilateral triangle bisected.' },
      { label: 'Circle formulas', formula: '$$C = 2\\pi r, \\quad A = \\pi r^2$$', note: 'Circumference and area of a circle', detail: 'Arc length = (θ/360) × 2πr. Sector area = (θ/360) × πr². Central angle = inscribed angle × 2 (same arc). Diameter = longest chord.' },
      { label: 'Area formulas', formula: '$$\\text{Triangle: } \\frac{1}{2}bh, \\quad \\text{Rect: } lw, \\quad \\text{Trap: } \\frac{(b_1+b_2)h}{2}$$', note: 'Common area formulas to memorize', detail: 'For triangles, height must be perpendicular to base. Parallelogram: base × height (not side length). For a triangle inside a circle, or vice versa — look for shared bases or heights.' },
      { label: 'Coordinate distance', formula: '$$d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$$', note: 'Distance between two points in the coordinate plane', detail: 'Derived from Pythagorean theorem. Midpoint: ((x₁+x₂)/2, (y₁+y₂)/2). Slope: (y₂−y₁)/(x₂−x₁).' },
      { label: 'Line equation', formula: '$$y = mx + b$$', note: 'Slope-intercept form: m = slope, b = y-intercept', detail: 'Parallel lines: same slope, different intercept. Perpendicular lines: slopes are negative reciprocals (m₁ × m₂ = −1). Horizontal: m=0. Vertical: undefined slope.' },
      { label: 'Polygon angle sums', formula: '$$\\text{Sum of interior angles} = (n-2) \\times 180°$$', note: 'For any polygon with n sides', detail: "Triangle: 180°. Quadrilateral: 360°. Pentagon: 540°. Regular polygon: each interior angle = (n−2)×180°/n. Exterior angles always sum to 360° regardless of n." },
    ],
    rules: [
      { title: 'Pythagorean Triples', content: "Memorize 3-4-5 and 5-12-13 (and their multiples). When you see a right triangle with two known sides, check if it's a multiple of a known triple before using the theorem." },
      { title: 'Special Triangles Save Time', content: '45-45-90 and 30-60-90 triangles appear in ~30% of GMAT geometry. Memorize the side ratios — they cut calculation time in half.' },
      { title: 'Circle Arc/Sector Fraction', content: 'Arc length and sector area are both the same fraction of the whole: θ/360. Set up the fraction first, then multiply by circumference or area.' },
      { title: 'Slope of Perpendicular Lines', content: 'If slope of line 1 = m, slope of perpendicular line = −1/m (negative reciprocal). This appears frequently in coordinate geometry.' },
      { title: 'Exterior Angle Theorem', content: 'Exterior angle of a triangle = sum of the two non-adjacent interior angles. Faster than computing all three angles.' },
    ],
    methods: [
      { name: 'Draw and Label', when_to_use: 'Any geometry problem', steps: ['Draw the figure (or redraw given figure adding all known info)', 'Label all sides, angles, and coordinates explicitly', 'Identify which formula applies', 'Solve — check if answer is geometrically reasonable'], tip: 'Most GMAT geometry errors happen because students skip drawing. Always draw.' },
      { name: 'Pythagorean Triple Check', when_to_use: 'Right triangle with two known sides', steps: ['Check if sides are multiples of 3-4-5 or 5-12-13', 'If yes: read off third side directly', 'If no: apply a²+b²=c²'], tip: 'Check triples first — saves 30 seconds on calculation-heavy problems.' },
      { name: 'Coordinate Slope-Intercept', when_to_use: 'Line equations, intersections, parallel/perpendicular', steps: ['Write both lines in y=mx+b form', 'For parallel: slopes equal, b different', 'For perpendicular: m₁ × m₂ = −1', 'For intersection: set equal and solve'], tip: 'Always convert to slope-intercept form before comparing lines.' },
    ],
    questions: [
      { subtype: 'Special Triangle: 30-60-90 Application', q_text: "An equilateral triangle has a side length of 6. What is its area?\n\n(A) 9\n(B) 9√2\n(C) 9√3\n(D) 18\n(E) 18√3", question_type: 'Special triangle — equilateral → 30-60-90', signals: 'Equilateral triangle → all sides equal, all angles 60°. Drop altitude to split into two 30-60-90 triangles.', trap: 'Using Area = ½ × 6 × 6 = 18 (forgetting height ≠ side).', method: 'Altitude = 6 × (√3/2) = 3√3. Area = ½ × 6 × 3√3 = 9√3.', steps: ['Altitude splits equilateral into two 30-60-90 triangles', 'In 30-60-90 with hypotenuse=6: short leg=3, long leg=3√3', 'Altitude = 3√3', 'Area = ½ × base × height = ½ × 6 × 3√3 = 9√3', 'Answer: (C) 9√3'], difficulty: 'Medium' },
      { subtype: 'Circle: Arc Length Fraction', q_text: "A circle has radius 9. What is the length of an arc subtended by a central angle of 80°?\n\n(A) 2π\n(B) 3π\n(C) 4π\n(D) 5π\n(E) 6π", question_type: 'Circle arc — fraction of circumference', signals: 'Central angle given (80°). Arc = fraction of full circle.', trap: 'Using area formula instead of circumference for arc length.', method: 'Arc = (80/360) × 2π(9) = (2/9) × 18π = 4π.', steps: ['Fraction of circle = 80/360 = 2/9', 'Full circumference = 2π × 9 = 18π', 'Arc = 2/9 × 18π = 4π', 'Answer: (C) 4π'], difficulty: 'Easy' },
      { subtype: 'Coordinate: Perpendicular Line', q_text: "Line l passes through (0, 4) and has slope 3. Line m is perpendicular to l and passes through (6, 2). What is the y-intercept of line m?\n\n(A) −4\n(B) 0\n(C) 2\n(D) 4\n(E) 6", question_type: 'Coordinate geometry — perpendicular slope and intercept', signals: 'Perpendicular: slopes are negative reciprocals. Given point on line m to find intercept.', trap: 'Using slope −3 instead of −1/3 for the perpendicular.', method: 'Slope of m = −1/3. Through (6,2): 2 = −1/3(6) + b → 2 = −2 + b → b = 4.', steps: ['Slope of l = 3 → slope of m = −1/3 (negative reciprocal)', 'Use point-slope: y − 2 = −1/3(x − 6)', 'y = −x/3 + 2 + 2 = −x/3 + 4', 'y-intercept = 4', 'Answer: (D) 4'], difficulty: 'Medium' },
    ],
    practice_items: [
      { question: 'A right triangle has legs 5 and 12. What is the hypotenuse?', question_type: 'Pythagorean theorem', answer: '13 — recognize 5-12-13 triple.' },
      { question: 'A circle has diameter 10. What is its area?', question_type: 'Computation', answer: '25π — r=5; A=π(5²)=25π.' },
      { question: 'Angles in a triangle are 40°, 75°, and x°. Find x.', question_type: 'Computation', answer: '65° — 180−40−75=65.' },
      { question: 'What is the slope of a line perpendicular to y = 4x − 3?', question_type: 'Computation', answer: '−1/4 — negative reciprocal of 4.' },
      { question: 'Rectangle has length 8 and diagonal 10. Find the width and area.', question_type: 'Pythagorean theorem', answer: 'Width = 6 (from 6-8-10 triple); Area = 8×6 = 48.' },
    ],
  },
];

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Content Expansion: 5 New Quant Topics ===\n');

  // Step 1: Get math section ID
  const sections = await sb('sections', 'GET', null, '?slug=eq.math&select=id');
  if (!sections.length) throw new Error('Math section not found');
  const mathSectionId = sections[0].id;
  console.log(`Math section ID: ${mathSectionId}`);

  // Step 2: Get current max order_idx
  const existing = await sb('topics', 'GET', null, `?section_id=eq.${mathSectionId}&select=order_idx&order=order_idx.desc&limit=1`);
  let nextOrder = (existing[0]?.order_idx ?? 7) + 1;
  console.log(`Starting order_idx: ${nextOrder}\n`);

  // Step 3: Insert each topic with all content
  for (const topic of newTopics) {
    console.log(`--- Inserting: ${topic.title} (order_idx=${nextOrder}) ---`);

    // Insert topic
    const [inserted] = await sb('topics', 'POST', [{
      section_id: mathSectionId,
      title: topic.title,
      subtitle: topic.subtitle,
      icon: topic.icon,
      order_idx: nextOrder,
    }]);
    const topicId = inserted.id;
    console.log(`  Topic created: id=${topicId}`);

    // Insert equations
    const eqRows = topic.equations.map((eq, i) => ({
      topic_id: topicId,
      label: eq.label,
      formula: eq.formula,
      note: eq.note,
      detail: eq.detail,
      order_idx: i + 1,
    }));
    await sb('equations', 'POST', eqRows);
    console.log(`  Equations: ${eqRows.length} inserted`);

    // Insert rules
    const ruleRows = topic.rules.map((r, i) => ({
      topic_id: topicId,
      title: r.title,
      content: r.content,
      order_idx: i + 1,
    }));
    await sb('rules', 'POST', ruleRows);
    console.log(`  Rules: ${ruleRows.length} inserted`);

    // Insert methods
    const methodRows = topic.methods.map((m, i) => ({
      topic_id: topicId,
      name: m.name,
      when_to_use: m.when_to_use,
      steps: m.steps,
      tip: m.tip,
      order_idx: i + 1,
    }));
    await sb('methods', 'POST', methodRows);
    console.log(`  Methods: ${methodRows.length} inserted`);

    // Insert questions
    const qRows = topic.questions.map((q, i) => ({
      topic_id: topicId,
      subtype: q.subtype,
      q_text: q.q_text,
      question_type: q.question_type,
      signals: q.signals,
      trap: q.trap,
      method: q.method,
      steps: q.steps,
      difficulty: q.difficulty,
      order_idx: i + 1,
    }));
    await sb('questions', 'POST', qRows);
    console.log(`  Questions: ${qRows.length} inserted`);

    // Insert practice items
    const pRows = topic.practice_items.map((p, i) => ({
      topic_id: topicId,
      question: p.question,
      question_type: p.question_type,
      answer: p.answer,
      order_idx: i + 1,
    }));
    await sb('practice_items', 'POST', pRows);
    console.log(`  Practice items: ${pRows.length} inserted`);

    nextOrder++;
    console.log('');
  }

  // Step 4: Verify
  console.log('=== Verification ===');
  const allTopics = await sb('topics', 'GET', null, `?section_id=eq.${mathSectionId}&select=title,order_idx&order=order_idx`);
  console.log(`Total math topics: ${allTopics.length}`);
  allTopics.forEach(t => console.log(`  [${t.order_idx}] ${t.title}`));
  console.log('\nDone!');
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
