/**
 * Verbal + DI Gap Cleanup
 * Fills 6 missing questions identified in taxonomy audit.
 *
 * Run: node db/expand_verbal_di_cleanup.js
 */

const { Client } = require('../node_modules/pg');

const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function getTopicId(title) {
  const { rows } = await c.query('SELECT id FROM topics WHERE title = $1', [title]);
  if (!rows.length) throw new Error(`Topic not found: ${title}`);
  console.log(`  Topic "${title}" → id=${rows[0].id}`);
  return rows[0].id;
}

async function getMaxOrderIdx(topicId) {
  const { rows } = await c.query(
    'SELECT COALESCE(MAX(order_idx), -1) AS mx FROM questions WHERE topic_id = $1',
    [topicId]
  );
  return rows[0].mx;
}

async function insertQuestion(topicId, q) {
  const maxIdx = await getMaxOrderIdx(topicId);
  const orderIdx = maxIdx + 1;
  await c.query(
    `INSERT INTO questions (topic_id, subtype, q_text, question_type, signals, trap, method, steps, difficulty, order_idx)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [topicId, q.subtype, q.q_text, q.question_type, q.signals, q.trap, q.method, JSON.stringify(q.steps), q.difficulty, orderIdx]
  );
  console.log(`    + [${q.difficulty}] ${q.subtype} (order_idx=${orderIdx})`);
}

// ─── Question Data ──────────────────────────────────────────────────────────

const questions = {
  // Gap 1: CR — Other Types — Missing EVALUATE question
  'CR — Other Types': [
    {
      subtype: 'Evaluate: Which Factor Would Most Help Assess the Argument?',
      question_type: 'CR',
      difficulty: 'Hard',
      q_text: `A city government recently installed motion-activated streetlights in a residential neighborhood, replacing the old always-on lights, in order to reduce electricity costs. After six months, the city reported that electricity usage for streetlighting in the neighborhood had declined by 40 percent. City officials concluded that the motion-activated lights are a cost-effective solution that should be expanded to all neighborhoods citywide.

Which of the following would be MOST useful in evaluating the argument above?

(A) Whether the motion-activated streetlights require more expensive maintenance than the old always-on lights
(B) Whether residents of the neighborhood have expressed satisfaction with the new lighting system
(C) Whether the city has sufficient budget to purchase motion-activated lights for every neighborhood
(D) Whether other cities have experimented with motion-activated streetlights in the past
(E) Whether the residential neighborhood chosen for the pilot program has higher or lower pedestrian traffic than most other neighborhoods in the city`,
      signals: '"would be most useful in evaluating" — classic Evaluate stem. The argument draws a conclusion from a pilot program and generalizes.',
      trap: 'Students often confuse Evaluate with Strengthen. Evaluate answers must work in BOTH directions — knowing the answer either strengthens or weakens depending on what the answer turns out to be.',
      method: 'Evaluate Both Ways',
      steps: [
        'Identify the argument: motion-activated lights cut electricity 40% in one neighborhood → should expand citywide.',
        'Evaluate = find the answer that works BOTH directions (two-directional test).',
        '(A) Two-directional: If maintenance costs are higher, the savings are offset → weakens. If maintenance is the same or cheaper → strengthens. PASSES the test. Keep.',
        '(B) Resident satisfaction is irrelevant to cost-effectiveness. Fails — one direction only (or neither).',
        '(C) Budget feasibility is about implementation, not whether the lights are cost-effective. Out of scope.',
        '(D) What other cities did tells us nothing about whether THIS city\'s program is cost-effective. Irrelevant.',
        '(E) Traffic levels matter (higher traffic = more activation = less savings), but this evaluates representativeness, not cost-effectiveness directly. (A) is more directly tied to the cost-effectiveness conclusion.',
        'Answer: (A)'
      ],
    }
  ],

  // Gap 2: RC — Passage Types & Author Tone — Missing Inference and Application
  'RC — Passage Types & Author Tone': [
    {
      subtype: 'Inference from Author\'s Stated Position',
      question_type: 'RC',
      difficulty: 'Medium',
      q_text: `The recent trend of corporations issuing public statements on social and political matters represents, in this author's view, a fundamental confusion about the role of business in society. Corporations exist to generate value for stakeholders through the production of goods and services — not to serve as arbiters of moral questions that are properly the domain of individuals and democratic institutions. When a corporation takes a political stance, it implicitly claims to speak for thousands of employees who may hold diverse views, thereby undermining the very pluralism it purports to champion.

Which of the following can be most reasonably inferred from the passage?

(A) The author believes corporations should be legally prohibited from making political statements
(B) The author would likely view a corporation's decision to remain neutral on a political controversy as appropriate
(C) The author believes that individual employees are incapable of forming their own political opinions
(D) The author thinks corporations that make political statements are always motivated by profit
(E) The author would argue that democratic institutions should regulate corporate speech`,
      signals: '"most reasonably inferred" — Inference question in a passage with strong authorial voice. Apply the 100% rule: the answer must be fully supported.',
      trap: 'Extreme answers like (A) "legally prohibited" go beyond what the author states. The author criticizes the practice but never calls for legal prohibition.',
      method: '100% Rule — Must Be True',
      steps: [
        'The author says corporations should not serve as "arbiters of moral questions" and that political stances are inappropriate.',
        '(A) "legally prohibited" — too extreme. The author criticizes but never mentions legal action. Eliminate.',
        '(B) If taking a stance is wrong because it\'s outside a corporation\'s role, then staying neutral IS within that role. This follows directly. Keep.',
        '(C) The passage says employees "may hold diverse views" — the author respects their ability to have opinions. Opposite of what\'s stated. Eliminate.',
        '(D) "always motivated by profit" — no mention of profit motive for political statements. Unsupported. Eliminate.',
        '(E) The author says moral questions belong to "individuals and democratic institutions" — but never suggests those institutions should regulate corporations. Eliminate.',
        'Answer: (B)'
      ],
    },
    {
      subtype: 'Application: Extend Author\'s Argument to New Case',
      question_type: 'RC',
      difficulty: 'Hard',
      q_text: `The recent trend of corporations issuing public statements on social and political matters represents, in this author's view, a fundamental confusion about the role of business in society. Corporations exist to generate value for stakeholders through the production of goods and services — not to serve as arbiters of moral questions that are properly the domain of individuals and democratic institutions. When a corporation takes a political stance, it implicitly claims to speak for thousands of employees who may hold diverse views, thereby undermining the very pluralism it purports to champion.

The author would most likely agree that which of the following is also true?

(A) A university that issues a statement on a national political issue is acting within its institutional mission
(B) A nonprofit advocacy organization that takes political stances is behaving similarly to the corporations described
(C) A corporation that donates to a political campaign is fulfilling its obligation to stakeholders
(D) A professional association that polls its members before issuing a political statement has addressed the author's primary concern
(E) A labor union that takes a political stance without consulting members is open to a criticism similar to the one the author makes about corporations`,
      signals: '"author would most likely agree" — Application question. Extract the author\'s underlying principle and apply to a new scenario.',
      trap: 'The principle is not just "corporations shouldn\'t be political" — it\'s about entities claiming to speak for members who hold diverse views. Apply that principle broadly.',
      method: 'Extract Principle → Apply to New Case',
      steps: [
        'Author\'s principle: An organization that takes a political stance implicitly claims to speak for all its members, which undermines pluralism when those members hold diverse views.',
        '(A) Universities have a different mission than corporations. The author\'s argument is specific to the role confusion. Unclear fit. Weak.',
        '(B) Nonprofits exist to advocate — that IS their role. The author\'s critique is about role confusion, so advocacy orgs are exempt. Eliminate.',
        '(C) Donating to political campaigns is even more political than statements. The author would oppose this. Eliminate.',
        '(D) Polling members addresses "diverse views" but the author\'s PRIMARY concern is role confusion (corporations shouldn\'t be moral arbiters), not just the representation issue. Partial fix only.',
        '(E) A labor union speaking politically without consulting members = claiming to speak for diverse members without their input. This matches the author\'s exact criticism. Keep.',
        'Answer: (E)'
      ],
    }
  ],

  // Gap 3: RC — Inference & Application Questions — Missing Main Idea and Explicit Detail
  'RC — Inference & Application Questions': [
    {
      subtype: 'Main Idea: Central Argument of the Passage',
      question_type: 'RC',
      difficulty: 'Medium',
      q_text: `Recent research in behavioral economics has challenged the classical assumption that consumers make purchasing decisions based primarily on rational cost-benefit analysis. Studies show that factors such as default options, framing effects, and social proof can dramatically alter consumer behavior even when the objective value proposition remains unchanged. For instance, organ donation rates vary from 12 percent to over 99 percent across countries with similar cultures, largely because some countries use an opt-out system while others require active opt-in. These findings suggest that the architecture of choice — how options are presented — may be as important as the options themselves in determining outcomes.

Which of the following best describes the main point of the passage?

(A) Organ donation rates are primarily determined by whether a country uses an opt-in or opt-out system
(B) Classical economics has been proven entirely wrong about how consumers make decisions
(C) The way choices are structured and presented significantly influences decision-making, challenging traditional economic models
(D) Behavioral economics is a more accurate discipline than classical economics
(E) Social proof is the most powerful factor influencing consumer purchasing behavior`,
      signals: '"main point of the passage" — Main Idea question. The correct answer must capture ALL key points without being too narrow or too broad.',
      trap: '(A) is too narrow — organ donation is just one example. (B) and (D) are too extreme — the passage says "challenged," not "proven wrong."',
      method: 'Holistic Match — Covers All, Too Narrow for None',
      steps: [
        'Passage structure: (1) behavioral econ challenges classical econ, (2) choice architecture matters, (3) organ donation example, (4) conclusion about how options are presented.',
        '(A) Too narrow — focuses only on the organ donation example, which is supporting evidence, not the main point. Eliminate.',
        '(B) "entirely wrong" is too extreme — the passage says "challenged," not disproven. Eliminate.',
        '(C) Captures both elements: choice architecture matters + challenges traditional models. This is comprehensive without being extreme. Keep.',
        '(D) "more accurate" is a comparison the passage never makes. The passage challenges classical econ but doesn\'t rank the disciplines. Eliminate.',
        '(E) "most powerful factor" — the passage lists social proof as ONE of several factors. Too narrow and unsupported. Eliminate.',
        'Answer: (C)'
      ],
    },
    {
      subtype: 'Detail: Directly Stated Fact',
      question_type: 'RC',
      difficulty: 'Easy',
      q_text: `Recent research in behavioral economics has challenged the classical assumption that consumers make purchasing decisions based primarily on rational cost-benefit analysis. Studies show that factors such as default options, framing effects, and social proof can dramatically alter consumer behavior even when the objective value proposition remains unchanged. For instance, organ donation rates vary from 12 percent to over 99 percent across countries with similar cultures, largely because some countries use an opt-out system while others require active opt-in. These findings suggest that the architecture of choice — how options are presented — may be as important as the options themselves in determining outcomes.

According to the passage, which of the following is stated about organ donation rates?

(A) Countries with opt-out systems have exactly 99 percent donation rates
(B) Organ donation rates are unrelated to cultural factors
(C) The variation in rates across countries is largely attributable to whether registration is opt-in or opt-out
(D) Behavioral economists have successfully increased organ donation rates worldwide
(E) Countries with active opt-in systems have donation rates below 5 percent`,
      signals: '"According to the passage" — Detail question. The answer is directly stated in the text. No inference needed.',
      trap: '(A) distorts "over 99 percent" into "exactly 99 percent." (B) contradicts the passage which says "countries with similar cultures." Always match the passage wording precisely.',
      method: 'Direct Retrieval — Find It in the Text',
      steps: [
        'Locate the relevant sentence: "organ donation rates vary from 12 percent to over 99 percent across countries with similar cultures, largely because some countries use an opt-out system while others require active opt-in."',
        '(A) "exactly 99 percent" — passage says "over 99 percent." Distortion. Eliminate.',
        '(B) "unrelated to cultural factors" — passage says "countries with similar cultures," implying culture is controlled for, not unrelated. Eliminate.',
        '(C) "largely attributable to whether registration is opt-in or opt-out" — this matches "largely because some countries use an opt-out system while others require active opt-in." Direct match. Keep.',
        '(D) "successfully increased" — the passage reports variation, not an intervention by economists. Unsupported. Eliminate.',
        '(E) "below 5 percent" — passage says rates start at "12 percent," not below 5. Distortion. Eliminate.',
        'Answer: (C)'
      ],
    }
  ],

  // Gap 4: Two-Part Analysis — Missing Logic/Verbal TPA
  'Two-Part Analysis': [
    {
      subtype: 'TPA: Verbal — Identify Assumption and Conclusion',
      question_type: 'TPA',
      difficulty: 'Medium',
      q_text: `A pharmaceutical company argues that its new drug, Veritol, should receive expedited regulatory approval. The company points out that Veritol has shown a 30 percent improvement in symptom reduction compared to the current standard treatment in clinical trials involving 500 patients. Furthermore, the company notes that the standard treatment has been on the market for over 15 years without significant updates.

Select one entry for each column. Choose the statement that is an unstated assumption of the argument for Column 1, and the statement that is the main conclusion for Column 2.

Column 1: Unstated Assumption | Column 2: Main Conclusion

(A) Veritol's clinical trial results with 500 patients are sufficient to establish its safety and efficacy for the general population
(B) The current standard treatment is no longer effective for any patients
(C) Veritol should receive expedited regulatory approval
(D) Veritol showed a 30 percent improvement in symptom reduction in clinical trials
(E) Pharmaceutical companies should not be allowed to request expedited approval
(F) The age of the current standard treatment is relevant to whether a new drug should receive expedited approval`,
      signals: 'Two-Part Analysis with verbal/argument content. Column 1 = unstated assumption, Column 2 = main conclusion. Tests logical reasoning in TPA format.',
      trap: 'Students may pick (D) as the conclusion because it\'s a strong factual claim — but it\'s a stated premise, not the conclusion. The conclusion is what the argument is trying to prove.',
      method: 'Identify Conclusion First, Then Find the Gap',
      steps: [
        'Step 1 — Find the conclusion (Column 2): The argument says Veritol "should receive expedited approval." This is the claim being supported. → (C)',
        'Step 2 — Map the premises: (1) 30% improvement in trials with 500 patients, (2) standard treatment is 15+ years old without updates.',
        'Step 3 — Find the unstated assumption (Column 1): The argument uses trial results from 500 patients to justify approval for the general population. This leap requires assuming that 500-patient trials are sufficient. → (A)',
        'Verify (A): It\'s not stated in the argument (the company just "points out" trial results), and it\'s required for the conclusion to follow. ✓',
        'Check others: (B) "no longer effective for any patients" is too extreme — not assumed. (D) is a stated premise, not an assumption. (E) contradicts the argument. (F) is assumed but it\'s less central than (A) — the 15-year point is a secondary premise.',
        'Answer: Column 1 = (A), Column 2 = (C)'
      ],
    }
  ],
};

// ─── Main ───────────────────────────────────────────────────────────────────

async function run() {
  await c.connect();
  console.log('Connected.\n');

  for (const [topicTitle, qs] of Object.entries(questions)) {
    const topicId = await getTopicId(topicTitle);
    for (const q of qs) {
      await insertQuestion(topicId, q);
    }
  }

  console.log('\n✅ All 6 gap questions inserted.');
  await c.end();
}

run().catch(e => { console.error(e); process.exit(1); });
