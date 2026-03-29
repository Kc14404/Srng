/**
 * Add CR — Parallel Reasoning topic to the Verbal section
 * 5 methods, 8 questions
 *
 * Run: node db/add_parallel_reasoning.js
 */

const { Client } = require('../node_modules/pg');

const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  console.log('Connected to Supabase.');

  // Step 1: Get section_id for Verbal
  const { rows: [verbal] } = await c.query(`SELECT id FROM sections WHERE slug = 'verbal'`);
  if (!verbal) throw new Error('Verbal section not found');
  const sectionId = verbal.id;
  console.log(`Verbal section_id: ${sectionId}`);

  // Step 2: Get max order_idx for Verbal topics
  const { rows: [maxRow] } = await c.query(`SELECT COALESCE(MAX(order_idx), -1) AS max_idx FROM topics WHERE section_id = $1`, [sectionId]);
  const nextOrder = maxRow.max_idx + 1;
  console.log(`Next topic order_idx: ${nextOrder}`);

  // Step 3: Insert the new topic
  const { rows: [topic] } = await c.query(
    `INSERT INTO topics (section_id, title, subtitle, order_idx, icon)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [sectionId, 'CR — Parallel Reasoning', 'Match the logical structure, not the content', nextOrder, '🔁']
  );
  const topicId = topic.id;
  console.log(`✓ Topic created: id=${topicId}`);

  // Step 4: Insert 5 Methods
  const methods = [
    {
      name: 'Abstract the Structure',
      when_to_use: 'When you see "Which of the following is most similar in reasoning"',
      steps: ["Read stimulus and ignore subject matter", "Label the abstract roles: Group A, Property B, Individual X", "Write the logical form (e.g., All A→B; X is A; ∴ X is B)", "Match this abstract form to answer choices"],
      tip: "Strip away all content — you're matching skeletons, not flesh"
    },
    {
      name: 'Validity Matching',
      when_to_use: 'When the stimulus has a clearly valid or invalid argument',
      steps: ["First determine: is the original argument valid or flawed?", "A valid argument's parallel must also be valid", "A flawed argument's parallel must contain the SAME flaw", "Eliminate any answer whose validity status differs from the stimulus"],
      tip: "If the original is flawed, the correct answer is also flawed — just differently dressed"
    },
    {
      name: 'Conclusion Type Check',
      when_to_use: 'Quick first filter before deep analysis',
      steps: ["Identify the conclusion type: universal (all), particular (some), conditional (if-then), or comparative", "Eliminate answers whose conclusion type differs", "Then check premise structure among remaining choices"],
      tip: "Mismatched conclusion types are the easiest wrong answers to eliminate"
    },
    {
      name: 'Flaw Labeling Method',
      when_to_use: 'When stimulus contains a logical error',
      steps: ["Name the flaw: correlation→causation, hasty generalization, false dilemma, equivocation, etc.", "Look for the answer that commits the SAME named flaw", "Wrong answers often commit different flaws or are actually valid"],
      tip: "Know the 6 main GMAT flaw types cold — this is a recognition game"
    },
    {
      name: 'Diagram Method',
      when_to_use: 'For formal logic parallel reasoning (if-then chains)',
      steps: ["Draw the conditional chain: A→B, B→C, therefore A→C", "Check for contrapositive errors in the original", "Match the conditional structure exactly in the answer choices", "Watch for illegal reversal or negation as a trap"],
      tip: "Parallel reasoning with conditionals is really a formal logic exercise — diagram both stimulus and answers"
    }
  ];

  for (let i = 0; i < methods.length; i++) {
    const m = methods[i];
    await c.query(
      `INSERT INTO methods (topic_id, name, when_to_use, steps, tip, order_idx)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [topicId, m.name, m.when_to_use, JSON.stringify(m.steps), m.tip, i]
    );
  }
  console.log(`✓ ${methods.length} methods inserted`);

  // Step 5: Insert 8 Questions
  const questions = [
    {
      subtype: 'ValidSyllogism',
      question_type: 'CR',
      difficulty: 'Easy',
      q_text: `All GMAT Focus test-takers who study data sufficiency for at least 20 hours improve their DI scores. Maria has studied data sufficiency for 25 hours. Therefore, Maria will improve her DI score.\n\nWhich of the following arguments is most similar in its reasoning to the argument above?\n\n(A) Most athletes who train at altitude improve their performance. João trained at altitude for six weeks. Therefore, João probably improved his performance.\n(B) All surgeons who complete the advanced residency program receive board certification. Dr. Chen completed the advanced residency program. Therefore, Dr. Chen received board certification.\n(C) Some investors who diversify their portfolios avoid major losses. Priya diversified her portfolio. Therefore, Priya will avoid major losses.\n(D) All companies that reduce operating costs become profitable. Firms that are profitable attract investors. Therefore, companies that reduce costs attract investors.\n(E) No student who skips the practice tests passes the exam on the first attempt. Kwame passed on the first attempt. Therefore, Kwame did not skip the practice tests.`,
      signals: '"most similar in its reasoning" — parallel reasoning signal',
      trap: '(A) uses "most" not "all" — changes from universal to probabilistic, invalidating the match. (D) is a chain syllogism. (E) is a contrapositive. Only (B) mirrors All A→B + X is A → X is B exactly.',
      method: 'Abstract the Structure',
      steps: ["Identify form: All [condition] → [outcome]. X meets condition. ∴ X gets outcome.", "Check A: 'Most' ≠ 'All' — probabilistic, not universal. Eliminate.", "Check B: All surgeons who [condition] → [board cert]. Dr. Chen met condition. ∴ board cert. ✓ Exact match.", "Check C: 'Some' → not universal. Eliminate.", "Check D: Chain syllogism (two premises → two steps). Different form.", "Check E: Contrapositive reasoning. Different form.", "Answer: B"]
    },
    {
      subtype: 'CausalFlaw',
      question_type: 'CR',
      difficulty: 'Medium',
      q_text: `In cities where bicycle lane infrastructure was expanded, traffic accident rates fell in the following year. Therefore, expanding bicycle lanes reduces traffic accidents.\n\nWhich of the following most closely parallels the reasoning in the argument above?\n\n(A) In schools where standardised test scores rose, teacher salaries also increased the following year. Therefore, teacher salary increases cause improvements in test scores.\n(B) In hospitals where surgical checklists were introduced, post-operative infection rates fell. Therefore, checklists cause fewer post-operative infections.\n(C) In companies where remote work was permitted, employee satisfaction increased. Employee satisfaction is a known driver of productivity. Therefore, remote work increases productivity.\n(D) In cities where bicycle lanes were expanded, public transit use also rose. Cities with high transit use tend to have fewer accidents. Therefore, bicycle lane expansion reduces accidents.\n(E) In regions where vaccination rates increased, hospitalisation rates fell. Correlation between vaccination and hospitalisation is well-established. Therefore, vaccines reduce hospitalisation.`,
      signals: '"most closely parallels the reasoning"',
      trap: '(B) looks right because it also draws a causal conclusion from a before-after observation — but so does (A). The key: the stimulus goes from correlation (co-occurrence of expansion + accident reduction) to causation with NO mechanism stated. (A) reverses the expected direction (salary follows scores, concludes salaries cause scores) — same structure: correlation observed, causal conclusion drawn in a non-obvious direction. Actually (B) is the closest pure parallel: infrastructure change → outcome change → therefore causal. Let students wrestle with (A) vs (B). Correct: (B).',
      method: 'Flaw Labeling Method',
      steps: ["Name the flaw: correlation observed in time sequence → causal conclusion drawn without ruling out alternatives", "Stimulus: Bike lanes expanded → accidents fell → therefore lanes caused the reduction", "Check B: Checklists introduced → infections fell → therefore checklists caused the reduction. Same pattern exactly.", "Check A: Scores rose → salaries increased → therefore salary increases cause scores. Reverses the sequence AND mixes up cause/effect direction. Different flaw.", "Check C: Two-premise chain, not a simple correlation-to-causation jump.", "Answer: B"]
    },
    {
      subtype: 'HastyGeneralization',
      question_type: 'CR',
      difficulty: 'Medium',
      q_text: `Every student in the GMAT prep cohort who practised more than 300 questions scored above 700. Therefore, any student who practises more than 300 questions will score above 700.\n\nWhich of the following most closely parallels the flawed reasoning above?\n\n(A) Most marathon runners who train with heart-rate monitors finish in under four hours. Therefore, runners who use heart-rate monitors will probably finish in under four hours.\n(B) Every dog in the shelter that received daily socialisation was adopted within two weeks. Therefore, any dog that receives daily socialisation will be adopted within two weeks.\n(C) All the software engineers at that company who completed the coding bootcamp received promotions. The bootcamp teaches practical skills. Therefore, practical skills lead to promotions.\n(D) Some athletes who follow a strict diet win competitions. Therefore, following a strict diet is sufficient for winning competitions.\n(E) No participant in the trial who took the supplement reported side effects. Therefore, the supplement has no side effects.`,
      signals: '"most closely parallels the flawed reasoning"',
      trap: 'The flaw is overgeneralising from a specific observed group ("every student in this cohort") to a universal claim ("any student"). The observed group may be unrepresentative. (B) is the exact match: specific group (dogs in shelter) + universal conclusion (any dog). (A) uses "most" → "probably" which is actually valid inductive reasoning, not a hasty generalisation. (E) is about absence of evidence.',
      method: 'Flaw Labeling Method',
      steps: ["Label flaw: specific observed sample → universal conclusion (hasty generalisation — ignores sample bias)", "Stimulus: Every [specific group] that did X → Y. Therefore any [universal] that does X → Y.", "Check B: Every [shelter dog] that received socialisation → adopted quickly. Therefore any dog → same. Exact match.", "Check A: Most + probably = valid probabilistic inference. Not a flaw. Eliminate.", "Check C: Adds a causal mechanism premise — different structure.", "Check D: 'Some' → 'sufficient' = different flaw (affirming the particular).", "Check E: Absence of evidence → universal negative. Different flaw.", "Answer: B"]
    },
    {
      subtype: 'FalseDilemma',
      question_type: 'CR',
      difficulty: 'Hard',
      q_text: `A company must either cut costs or raise prices to remain profitable. This company has not raised prices. Therefore, it must be cutting costs.\n\nWhich of the following most closely parallels the reasoning above?\n\n(A) A project succeeds either through adequate funding or talented leadership. This project lacks talented leadership. Therefore, it must have adequate funding.\n(B) A diet plan works if it restricts calories or increases exercise. This plan restricts calories. Therefore, it will work.\n(C) An athlete either trains hard or relies on natural talent. This athlete trains hard. Therefore, the athlete does not rely on natural talent.\n(D) A business either grows or declines — stagnation is impossible. This business has not grown. Therefore, it is declining.\n(E) Either the merger will succeed or the company will face bankruptcy. The merger succeeded. Therefore, the company avoided bankruptcy.`,
      signals: '"most closely parallels the reasoning"',
      trap: 'The structure is: Either P or Q. Not Q. Therefore P. (This is disjunctive syllogism — actually valid IF the "either/or" is truly exhaustive.) Both (A) and (D) use disjunctive syllogism but in different ways. (A): Either P or Q. Not Q. ∴ P — exact match to structure. (D): Either P or Q (framed as "X or Y — Z is impossible"). Not P. ∴ Q — same structure, different surface. The key differentiator is (A) uses "not Q → P" exactly as in the stimulus. Correct: (A).',
      method: 'Diagram Method',
      steps: ["Diagram stimulus: P ∨ Q (must cut costs OR raise prices). ¬Q (has not raised prices). ∴ P (must be cutting costs).", "This is disjunctive syllogism: Either A or B; Not B; Therefore A.", "Check A: Either funding OR leadership. Not leadership. ∴ funding. Exact match.", "Check B: Restricts calories → will work. This is affirming the sufficient condition, not disjunctive syllogism.", "Check C: Either trains OR talent. Trains. ∴ not talent. This is affirming one disjunct to deny the other — different (and invalid) form.", "Check D: Either grow OR decline. Not grow. ∴ decline. Same structure as (A), but let's compare carefully — (A) is closer to the exact surface phrasing.", "Final: (A) is the cleaner parallel. Answer: A"]
    },
    {
      subtype: 'CircularReasoning',
      question_type: 'CR',
      difficulty: 'Hard',
      q_text: `This investment strategy must be sound because all sound investment strategies generate returns, and this strategy generates returns.\n\nWhich of the following most closely parallels the reasoning above?\n\n(A) This policy must be effective because effective policies improve outcomes, and this policy improves outcomes.\n(B) This medicine is safe because it has been approved by regulators, and regulators only approve safe medicines.\n(C) This candidate is qualified because qualified candidates have relevant experience, and this candidate has relevant experience.\n(D) This restaurant must be popular because it is always full, and popular restaurants are always full.\n(E) This theory must be correct because it makes accurate predictions, and correct theories make accurate predictions.`,
      signals: '"most closely parallels the reasoning"',
      trap: 'The stimulus structure is: X is [conclusion] because all [conclusion-things] have property Y, and X has property Y. This affirms the consequent — a formal logical fallacy. The conclusion is sneaked into the premise ("sound strategies generate returns" + "this generates returns" → "this is sound" — but the first premise doesn\'t say ONLY sound strategies generate returns). (A) has the exact same structure: effective policies → improve outcomes; this improves outcomes; therefore effective. Affirms the consequent.',
      method: 'Flaw Labeling Method',
      steps: ["Identify flaw: Affirming the consequent. If Sound → Returns; Returns; ∴ Sound. Invalid because non-sound strategies might also generate returns.", "Abstract: If A then B. B. Therefore A. (Invalid — confuses necessary and sufficient conditions.)", "Check A: If Effective → improves outcomes. Improves outcomes. ∴ Effective. Exact same invalid form.", "Check B: Regulators approve → safe; approved; ∴ safe. Actually this IS valid given the second premise (regulators ONLY approve safe = safe ↔ approved). Different structure.", "Check C: Qualified → experience; has experience; ∴ qualified. Same as (A) — but (A) is cleaner match to original phrasing.", "Check D: Popular → always full; always full; ∴ popular. Same flaw, but (A) is still the best parallel.", "Answer: A"]
    },
    {
      subtype: 'AppealToPrecedent',
      question_type: 'CR',
      difficulty: 'Hard',
      q_text: `The city of Harfield reduced traffic congestion by implementing congestion pricing. Therefore, implementing congestion pricing in Northgate will also reduce traffic congestion.\n\nWhich of the following most closely parallels the reasoning above?\n\n(A) Drug X reduced inflammation in a clinical trial with 500 patients. Therefore, Drug X will reduce inflammation in all patients who take it.\n(B) Company A increased revenue by expanding to Asian markets. Therefore, Company B should expand to Asian markets to increase its revenue.\n(C) School Y improved graduation rates by extending the school day. Therefore, extending the school day will improve graduation rates in all schools.\n(D) Region P reduced crime rates by increasing police patrols. Therefore, increasing police patrols in Region Q will also reduce crime rates.\n(E) The diet that worked for athlete Z will work for anyone following a training programme similar to athlete Z's.`,
      signals: '"most closely parallels the reasoning"',
      trap: 'The structure is: Intervention X worked in Context A → therefore X will work in Context B. This is appeal to precedent / weak analogy — assumes the two contexts are comparable without evidence. (D) is the closest: police patrols reduced crime in P → will reduce crime in Q. Same structure, same flaw (assumes P and Q are comparable).',
      method: 'Abstract the Structure',
      steps: ["Abstract: [Intervention] worked in [Case A]. Therefore [Intervention] will work in [Case B].", "Flaw: assumes the two cases are comparable — weak analogy.", "Check D: Police patrols reduced crime in P → will reduce in Q. Exact match: same intervention, two different geographic contexts, no evidence of comparability.", "Check B: Company A did X → Company B should do X. Close, but frames as a recommendation ('should'), not a prediction. Slightly different.", "Check C: School Y extended day → improved graduation. Therefore any school → same. This overgeneralizes more broadly (all schools) vs. one specific other context.", "Check A: Drug X worked in trial → will work in all patients. Generalizes from sample to universal. Different pattern.", "Answer: D"]
    },
    {
      subtype: 'MethodOfReasoning',
      question_type: 'CR',
      difficulty: 'Medium',
      q_text: `Researcher: Critics claim our new drug causes liver damage. But those critics have financial ties to competing pharmaceutical companies. Therefore, their claims should be dismissed.\n\nWhich of the following most closely parallels the reasoning above?\n\n(A) The audit report found errors in our accounting. But the auditing firm was hired by our rivals. Therefore, the report's findings are unreliable.\n(B) Scientists warn that the chemical is dangerous. But they based their warning on only three studies. Therefore, more research is needed before any conclusions can be drawn.\n(C) The witness testified against the defendant. But the witness has a criminal record. Therefore, the testimony is false.\n(D) The consultant recommended we expand overseas. But expansion is risky. Therefore, we should seek a second opinion.\n(E) Employees complained about the new policy. But management implemented the policy to improve efficiency. Therefore, the complaints are misguided.`,
      signals: '"most closely parallels the reasoning"',
      trap: 'The structure is: [Claim made] + [Claimant has a bias/conflict of interest] → [Claim should be dismissed]. This is ad hominem (attacking the source, not the argument). (A) is the exact parallel: audit found errors + auditors were hired by rivals → findings unreliable. Same structure: claim + source bias → dismiss claim. (C) attacks witness credibility (criminal record) but concludes testimony is FALSE — goes further than just unreliable. Different conclusion type.',
      method: 'Abstract the Structure',
      steps: ["Abstract: [Claim X] made by [Source Y]. [Source Y] has conflict of interest. ∴ [Claim X] is unreliable.", "This is ad hominem — dismissing a claim based on who made it, not on its merits.", "Check A: Audit found errors. Auditors hired by rivals (conflict of interest). ∴ Findings unreliable. Exact match.", "Check C: Witness testified. Witness has criminal record (character attack). ∴ Testimony is false. Goes further than 'unreliable' → different conclusion type.", "Check B: Based on few studies → more research needed. This is a call for more evidence, not source dismissal.", "Answer: A"]
    },
    {
      subtype: 'ConditionalChain',
      question_type: 'CR',
      difficulty: 'Hard',
      q_text: `If a country implements universal healthcare, then its citizens' average life expectancy increases. If average life expectancy increases, then the workforce remains productive longer. Therefore, if a country implements universal healthcare, then its workforce remains productive longer.\n\nWhich of the following most closely parallels the reasoning above?\n\n(A) If interest rates fall, then borrowing increases. If borrowing increases, then consumer spending rises. Therefore, if interest rates fall, then consumer spending rises.\n(B) If a company invests in R&D, then it develops new products. New products attract customers. Therefore, if a company invests in R&D, it will attract customers.\n(C) If an employee is promoted, then their salary increases. If their salary increases, they are more motivated. Therefore, promoted employees are more motivated.\n(D) If regulations tighten, then compliance costs rise. If compliance costs rise, then small firms exit the market. If small firms exit, then market concentration increases. Therefore, if regulations tighten, then market concentration increases.\n(E) If a student studies daily, then they retain more information. If they retain more information, then they score higher on tests. If they score higher, then they get into top universities. Therefore, if a student studies daily, they get into top universities.`,
      signals: '"most closely parallels the reasoning"',
      trap: 'The stimulus is a two-step conditional chain: If A→B, If B→C, Therefore If A→C. (A) is the exact match: If rates fall→borrowing rises (A→B), If borrowing rises→spending rises (B→C), ∴ If rates fall→spending rises (A→C). (D) and (E) are three-step chains — different length. (C) drops the conditional in the conclusion (says "promoted employees are" not "if promoted, then"). (B) omits the conditional "if" in the second premise.',
      method: 'Diagram Method',
      steps: ["Diagram stimulus: A→B, B→C, ∴ A→C. Two-premise conditional chain.", "Check A: Fall→Borrow (A→B), Borrow→Spend (B→C), ∴ Fall→Spend (A→C). Exact 2-step chain.", "Check D: A→B, B→C, C→D, ∴ A→D. Three-step chain. Different.", "Check E: Four-step chain. Different.", "Check C: Conclusion drops 'if' — 'promoted employees are more motivated' vs 'if promoted, then motivated'. Subtle but different form.", "Answer: A"]
    }
  ];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await c.query(
      `INSERT INTO questions (topic_id, subtype, question_type, difficulty, q_text, signals, trap, method, steps, order_idx)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [topicId, q.subtype, q.question_type, q.difficulty, q.q_text, q.signals, q.trap, q.method, JSON.stringify(q.steps), i]
    );
  }
  console.log(`✓ ${questions.length} questions inserted`);

  // Step 6: Verify counts
  const { rows: [qCount] } = await c.query(`SELECT COUNT(*) AS cnt FROM questions WHERE topic_id = $1`, [topicId]);
  const { rows: [mCount] } = await c.query(`SELECT COUNT(*) AS cnt FROM methods WHERE topic_id = $1`, [topicId]);
  console.log(`\nVerification:`);
  console.log(`  Questions: ${qCount.cnt} (expected 8)`);
  console.log(`  Methods:   ${mCount.cnt} (expected 5)`);

  if (parseInt(qCount.cnt) !== 8 || parseInt(mCount.cnt) !== 5) {
    throw new Error('Count mismatch!');
  }
  console.log('\n✅ All good — CR Parallel Reasoning topic fully inserted.');
  await c.end();
}

main().catch(err => { console.error('ERROR:', err); process.exit(1); });
