/**
 * GMAT Hub — Verbal RC Content Expansion
 * Adds missing typical questions and methods for the 4 RC-related Verbal topics.
 * New items start at order_idx = 3.
 *
 * Run: node db/expand_verbal_rc.js
 */

const { Client } = require('../node_modules/pg');
const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await c.connect();
  console.log('Connected to Supabase.\n');

  // ── Get Verbal topic IDs ─────────────────────────────────────────────────
  const { rows: topics } = await c.query(`
    SELECT t.id, t.title FROM topics t
    JOIN sections s ON t.section_id = s.id
    WHERE s.slug = 'verbal'
    ORDER BY t.order_idx
  `);
  console.log('Verbal Topics:');
  topics.forEach(t => console.log(`  [${t.id}] ${t.title}`));

  const byTitle = {};
  for (const t of topics) byTitle[t.title] = t.id;

  const tid = {
    rcStrategy:   byTitle['RC — Strategy'],
    rcQTypes:     byTitle['RC — Question Types'],
    rcPassTone:   byTitle['RC — Passage Types & Author Tone'],
    rcInfApp:     byTitle['RC — Inference & Application Questions'],
  };

  console.log('\nTopic ID map:', tid);

  // ── Helpers ────────────────────────────────────────────────────────────────
  let qCount = 0, mCount = 0;

  async function insertQuestions(topicId, questions) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await c.query(
        `INSERT INTO questions (topic_id, subtype, q_text, question_type, signals, trap, method, steps, difficulty, order_idx)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [topicId, q.subtype, q.q_text, q.question_type, q.signals, q.trap, q.method,
         JSON.stringify(q.steps), q.difficulty, 3 + i]
      );
      qCount++;
    }
  }

  async function insertMethods(topicId, methods) {
    for (let i = 0; i < methods.length; i++) {
      const m = methods[i];
      await c.query(
        `INSERT INTO methods (topic_id, name, when_to_use, steps, tip, order_idx)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [topicId, m.name, m.when_to_use, JSON.stringify(m.steps), m.tip, 3 + i]
      );
      mCount++;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. RC — STRATEGY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n── RC — Strategy ──');

  await insertQuestions(tid.rcStrategy, [
    {
      subtype: 'Wrong Answer Pattern: Scope Creep',
      q_text: `The development of high-frequency trading (HFT) has transformed modern securities markets. Proponents argue that HFT increases market liquidity and narrows bid-ask spreads, benefiting all investors. However, recent research suggests that the liquidity provided by HFT firms is often illusory: during periods of market stress, HFT algorithms withdraw from the market precisely when liquidity is most needed. Furthermore, the speed advantage enjoyed by HFT firms may enable practices such as latency arbitrage, which extracts value from slower institutional investors.

Which of the following best expresses the main idea of the passage?

(A) High-frequency trading has fundamentally destabilized global financial systems and should be banned by regulators worldwide.
(B) While high-frequency trading offers some market benefits, its liquidity provision may be unreliable and its speed advantage may harm other investors.
(C) High-frequency trading narrows bid-ask spreads, which is its primary benefit to securities markets.
(D) Latency arbitrage is the most significant problem created by modern electronic trading systems.
(E) Market stress events are caused primarily by the withdrawal of high-frequency trading firms from active trading.`,
      question_type: 'RC',
      signals: '"main idea" — need answer covering full passage scope, not just one paragraph',
      trap: 'Choosing (A) — scope creep beyond the passage, which never mentions banning HFT or "global financial systems."',
      method: 'SCOPE Mapping',
      steps: [
        'Identify passage scope: HFT has benefits (liquidity, spreads) but also problems (illusory liquidity, latency arbitrage).',
        '(A) Too extreme — passage never says HFT should be banned or that it destabilizes global systems. SCOPE CREEP.',
        '(C) Too narrow — only covers the proponent view from the first sentence.',
        '(D) Too narrow — latency arbitrage is one detail, not the main idea.',
        '(E) Distortion — passage says HFT withdraws during stress, not that it causes stress.',
        'Correct answer: (B) — captures both the benefits and the concerns raised in the passage.'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Passage Structure: Signpost Words',
      q_text: `Conventional economic models assume that individuals act as rational agents who maximize utility. Furthermore, these models predict that markets will self-correct through the invisible hand of supply and demand. However, behavioral economists have demonstrated that cognitive biases — such as loss aversion and anchoring — systematically distort decision-making. Nevertheless, proponents of classical economics argue that while individual decisions may be irrational, aggregate market behavior still tends toward efficiency over time.

The word "Nevertheless" in the passage primarily serves to

(A) introduce a concession that undermines the behavioral economists' position entirely
(B) signal that the author is about to present his own original theory
(C) indicate a shift back to a defense of classical economics despite the behavioral critique
(D) suggest that behavioral economics has been thoroughly refuted by new evidence
(E) mark a transition from economic theory to practical policy recommendations`,
      question_type: 'RC',
      signals: '"serves to" — function question about a signpost word',
      trap: 'Choosing (A) — "Nevertheless" introduces a counter, but does not say the behavioral view is entirely undermined.',
      method: 'Question Type Routing',
      steps: [
        '"Nevertheless" is a concessive transition: it acknowledges what came before but pivots back.',
        'Before "Nevertheless": behavioral economists challenge rational-agent models.',
        'After "Nevertheless": classical economics proponents argue markets are still efficient in aggregate.',
        '(A) Wrong — "entirely" is too extreme; the passage hedges with "tends toward."',
        '(B) Wrong — the author is presenting others\' arguments, not an original theory.',
        '(D) Wrong — no refutation is mentioned; classical proponents simply argue back.',
        '(E) Wrong — no policy recommendations appear in the passage.',
        'Correct answer: (C) — "Nevertheless" signals a shift back to defending classical economics after the behavioral critique.'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Time Strategy: When to Skim vs. Read Deeply',
      q_text: `Paragraph 1: Coral reefs support approximately 25 percent of all marine species despite covering less than 1 percent of the ocean floor. Their biodiversity rivals that of tropical rainforests, earning them the designation "rainforests of the sea."

Paragraph 2: The primary threat to coral reefs is ocean acidification caused by rising atmospheric CO₂ levels. When CO₂ dissolves in seawater, it forms carbonic acid, which reduces the concentration of carbonate ions that corals need to build their calcium carbonate skeletons. Laboratory studies have shown that a doubling of atmospheric CO₂ could reduce coral calcification rates by 10 to 40 percent.

Paragraph 3: Several conservation strategies have been proposed, including marine protected areas, assisted gene flow to introduce heat-resistant coral genotypes, and large-scale seawater alkalinity enhancement. Each approach has significant cost and feasibility constraints.

According to the passage, a doubling of atmospheric CO₂ would most likely result in which of the following?

(A) A 25 percent decline in the total number of marine species worldwide
(B) The complete dissolution of existing coral calcium carbonate structures
(C) A measurable decrease in the rate at which corals produce their skeletons
(D) The immediate implementation of seawater alkalinity enhancement programs
(E) A shift in coral reef ecosystems from calcium carbonate to silicate-based structures`,
      question_type: 'RC',
      signals: '"According to the passage" + specific detail about CO₂ doubling — detail question pointing to Paragraph 2',
      trap: 'Wasting time re-reading all three paragraphs equally. The CO₂ doubling detail is in Paragraph 2 — read it deeply, skim the rest.',
      method: 'Question Type Routing',
      steps: [
        'Identify: detail question referencing "doubling of atmospheric CO₂" — locate in Paragraph 2.',
        'Paragraph 2 states: doubling CO₂ could reduce coral calcification rates by 10-40%.',
        '(A) Wrong — passage says reefs support 25% of marine species, but doesn\'t say CO₂ doubling eliminates them.',
        '(B) Wrong — "complete dissolution" is too extreme; passage says reduced calcification, not destruction.',
        '(D) Wrong — Paragraph 3 mentions proposals, not implementation triggered by CO₂ doubling.',
        '(E) Wrong — silicate-based structures are never mentioned.',
        'Correct answer: (C) — directly paraphrases "reduce coral calcification rates by 10 to 40 percent."'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'T-S-P Extraction: Topic, Scope, Purpose',
      q_text: `In the decades following World War II, the United States pursued a foreign policy strategy known as containment, which sought to prevent the spread of Soviet influence beyond its existing sphere. George Kennan, widely credited as the architect of this strategy, argued in his famous "Long Telegram" that the Soviet Union was inherently expansionist but could be checked through patient, firm resistance at key geopolitical pressure points. Critics of containment, however, contended that the policy was overly reactive, committing the United States to open-ended military obligations without clearly defining the conditions under which the strategy would succeed.

The primary purpose of the passage is to

(A) argue that George Kennan's containment strategy was ultimately unsuccessful
(B) compare the military capabilities of the United States and the Soviet Union during the Cold War
(C) describe the containment strategy and present both its rationale and a criticism of it
(D) explain why the United States abandoned containment in favor of détente
(E) provide a comprehensive history of U.S. foreign policy from 1945 to the present`,
      question_type: 'RC',
      signals: '"primary purpose" — requires identifying Topic, Scope, and Purpose of the entire passage',
      trap: 'Choosing (A) — the passage does not argue containment was unsuccessful; it presents both sides neutrally.',
      method: 'SCOPE Mapping',
      steps: [
        'T-S-P: Topic = U.S. Cold War foreign policy. Scope = containment strategy specifically. Purpose = describe it and present both supporting rationale and criticism.',
        '(A) Wrong — passage doesn\'t argue containment failed; it presents the debate.',
        '(B) Wrong — military capabilities are never compared.',
        '(D) Wrong — détente is never mentioned.',
        '(E) Wrong — scope creep; passage covers only containment, not all post-1945 foreign policy.',
        'Correct answer: (C) — matches all three T-S-P components: describes containment, gives Kennan\'s rationale, and presents critics\' objections.'
      ],
      difficulty: 'Hard'
    }
  ]);

  await insertMethods(tid.rcStrategy, [
    {
      name: 'Wrong Answer Pattern Recognition',
      when_to_use: 'When eliminating wrong answer choices on any RC question type',
      steps: [
        'Out of Scope: the answer mentions something not discussed in the passage',
        "Too Extreme: uses language like 'always,' 'never,' 'all,' 'none' when passage uses hedging language",
        'Direction Reversal: the answer says the opposite of what the passage states',
        'Too Narrow: covers only one paragraph when the question asks about the whole passage',
        'Half Right / Half Wrong: first half matches passage but second half contradicts it'
      ],
      tip: 'Half Right / Half Wrong is the sneakiest trap — always read the ENTIRE answer choice before selecting.'
    },
    {
      name: 'T-S-P Framework',
      when_to_use: 'At the start of reading any RC passage, before answering questions',
      steps: [
        'Topic: what broad subject is discussed? (e.g., climate change, corporate governance)',
        'Scope: what SPECIFIC aspect of that topic? (e.g., the role of ocean currents in climate feedback loops)',
        'Purpose: WHY did the author write this? (to argue, to describe, to compare, to challenge, to explain)',
        'Record T-S-P mentally or in notes before reading answer choices',
        'Use T-S-P to filter: correct main idea answers must match all three'
      ],
      tip: 'Many wrong answers on Primary Purpose questions get the Topic right but miss the Scope or Purpose.'
    }
  ]);

  console.log(`  ✓ RC Strategy: ${4} questions, ${2} methods`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. RC — QUESTION TYPES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n── RC — Question Types ──');

  await insertQuestions(tid.rcQTypes, [
    {
      subtype: 'Explicit Detail: Direct Retrieval',
      q_text: `A recent study of corporate governance practices in emerging markets found that companies with independent board members outperformed their peers by an average of 3.2 percent annually over a ten-year period. The researchers controlled for industry, company size, and macroeconomic conditions, and attributed the performance difference primarily to improved oversight of executive compensation and capital allocation decisions. Notably, the effect was strongest in countries with weaker legal protections for minority shareholders.

According to the passage, the performance advantage of companies with independent board members was most pronounced in which type of environment?

(A) Countries with the strongest regulatory frameworks for corporate governance
(B) Industries with the highest levels of competition among firms
(C) Markets where legal protections for minority shareholders were relatively weak
(D) Companies that had recently undergone mergers or acquisitions
(E) Economies experiencing rapid GDP growth during the study period`,
      question_type: 'RC',
      signals: '"According to the passage" — explicit detail retrieval; answer is stated directly in the text',
      trap: 'Choosing (A) — reverses the passage\'s claim. The effect was strongest where protections were WEAKER, not stronger.',
      method: 'Reference and Read Method',
      steps: [
        'Locate: "the effect was strongest in countries with weaker legal protections for minority shareholders."',
        '(A) Wrong — direction reversal; passage says weaker protections, not strongest frameworks.',
        '(B) Wrong — competition levels are never discussed.',
        '(D) Wrong — mergers and acquisitions are not mentioned.',
        '(E) Wrong — GDP growth is not mentioned.',
        'Correct answer: (C) — directly paraphrases the final sentence of the passage.'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Main Idea Question Type',
      q_text: `The discovery of high-temperature superconductors in 1986 generated enormous excitement in the physics community, as these materials could conduct electricity with zero resistance at temperatures far above those required by conventional superconductors. Researchers initially hoped that room-temperature superconductivity was within reach, which would revolutionize power transmission, magnetic levitation, and computing. Three decades later, however, the highest confirmed superconducting temperature remains well below room temperature, and the ceramic materials that exhibit high-temperature superconductivity are brittle and difficult to manufacture into useful forms. Despite these setbacks, incremental progress continues: recent experiments with hydrogen-rich compounds under extreme pressure have achieved superconductivity at temperatures approaching 250 kelvin.

Which of the following best describes the main idea of the passage?

(A) Room-temperature superconductivity has been achieved through experiments with hydrogen-rich compounds under extreme pressure.
(B) High-temperature superconductors were discovered in 1986 but have had no practical applications since then.
(C) Although high-temperature superconductors initially promised transformative applications, practical challenges have limited progress, though research continues to advance.
(D) The brittleness of ceramic superconductors is the sole obstacle preventing their widespread commercial adoption.
(E) Conventional superconductors are superior to high-temperature superconductors for most practical applications.`,
      question_type: 'RC',
      signals: '"main idea" — must capture the full arc of the passage: excitement, limitations, continued progress',
      trap: 'Choosing (A) — distortion; the passage says temperatures "approaching 250K," not room temperature. Also too narrow.',
      method: 'SCOPE Mapping',
      steps: [
        'Passage arc: discovery → initial excitement → practical limitations → continued incremental progress.',
        '(A) Wrong — overstates the hydrogen compound result; 250K is not room temperature.',
        '(B) Wrong — "no practical applications" is too extreme; passage discusses ongoing progress.',
        '(D) Wrong — "sole obstacle" is too extreme; passage mentions temperature limits too.',
        '(E) Wrong — this comparison is never made in the passage.',
        'Correct answer: (C) — captures all three elements: initial promise, practical challenges, ongoing advancement.'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'RC Inference Question Type',
      q_text: `Microfinance institutions (MFIs) were originally designed to provide small loans to entrepreneurs in developing countries who lacked access to traditional banking. Early studies reported impressive repayment rates exceeding 95 percent, which attracted significant investment from both development agencies and private capital. More recent evaluations, however, have painted a more complex picture: while repayment rates remain high, evidence suggests that many borrowers use microloans for consumption smoothing — covering daily expenses during lean periods — rather than for entrepreneurial investment. Furthermore, some researchers have found that the pressure to maintain high repayment rates has led certain MFIs to adopt aggressive collection practices.

It can be inferred from the passage that early investors in microfinance institutions most likely assumed that

(A) borrowers would primarily use microloans to fund business ventures rather than daily living expenses
(B) microfinance would completely replace traditional banking in developing countries within a decade
(C) aggressive collection practices were necessary to maintain high repayment rates
(D) consumption smoothing was a more effective use of microloans than entrepreneurial investment
(E) private capital would eventually withdraw from the microfinance sector`,
      question_type: 'RC',
      signals: '"It can be inferred" — inference question; apply 100% rule, stay conservative',
      trap: 'Choosing (B) — too extreme; "completely replace" is never implied. Classic Too Extreme wrong answer.',
      method: '100% Rule',
      steps: [
        'The passage says MFIs were "designed to provide small loans to entrepreneurs" and that high repayment attracted investment.',
        'Later, it reveals borrowers actually use loans for consumption smoothing — implying this was NOT the original expectation.',
        '(B) Wrong — "completely replace" is far too extreme.',
        '(C) Wrong — aggressive practices are presented as a problematic development, not an investor assumption.',
        '(D) Wrong — direction reversal; the passage suggests consumption smoothing was unexpected.',
        '(E) Wrong — no evidence of withdrawal; passage says investment was attracted.',
        'Correct answer: (A) — if MFIs were designed for entrepreneurs, investors who funded them logically assumed loans would be used entrepreneurially.'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'Application/Analogy Question',
      q_text: `Urban planners in the 1960s believed that constructing large-scale highway systems through city centers would alleviate traffic congestion by providing more capacity for vehicles. Instead, the new highways induced additional demand: as driving became more convenient, more residents chose to commute by car, and suburban development accelerated along highway corridors. Within a decade, congestion levels on many urban highways had returned to or exceeded their pre-construction levels, a phenomenon now known as "induced demand."

Which of the following scenarios is most analogous to the phenomenon of induced demand described in the passage?

(A) A hospital expands its emergency department, but patient wait times decrease only temporarily before rising again as more people choose to visit that hospital.
(B) A factory installs new safety equipment, and workplace injuries decline steadily over the following five years.
(C) A school reduces class sizes, and student test scores improve proportionally to the reduction.
(D) A city plants more trees in a neighborhood, and property values increase as a result.
(E) A company raises employee salaries, and productivity increases permanently.`,
      question_type: 'RC',
      signals: '"most analogous to" — application/analogy question; extract the principle, then match it',
      trap: 'Choosing (D) — surface similarity (urban planning) but wrong mechanism. Planting trees doesn\'t create induced demand.',
      method: 'Application: Extract then Apply',
      steps: [
        'Extract the principle: increasing capacity → attracts more users → capacity fills up again → original problem returns.',
        '(A) Hospital expands capacity → more patients come → wait times return. Same pattern: supply induces demand.',
        '(B) Wrong — safety equipment leads to sustained improvement, no induced demand effect.',
        '(C) Wrong — proportional improvement, no reversion to original problem.',
        '(D) Wrong — tree planting increases value; no demand-fills-capacity dynamic.',
        '(E) Wrong — permanent productivity increase, no reversion.',
        'Correct answer: (A) — matches the induced demand pattern: expanded capacity attracts more users, negating the benefit.'
      ],
      difficulty: 'Hard'
    }
  ]);

  await insertMethods(tid.rcQTypes, [
    {
      name: 'Identify Question Type First',
      when_to_use: 'Before reading any RC answer choices — always classify the question first',
      steps: [
        'Read the question stem carefully',
        'Classify: Detail, Main Idea, Inference, Function, Tone, Application, or Except/Not',
        'Detail → go back and find the specific line',
        'Inference → stay conservative, 100% rule',
        'Application → extract principle, find parallel',
        'Main Idea → use T-S-P; answer must cover ALL of passage',
        'Tone → look for hedging/intensifying language in the passage'
      ],
      tip: 'Misidentifying the question type is the root cause of most RC mistakes. Spend 5 extra seconds classifying.'
    },
    {
      name: 'Reference and Read Method',
      when_to_use: 'For Detail and Function questions that reference a specific line or paragraph',
      steps: [
        'Locate the referenced line or paragraph',
        'Read 2–3 sentences BEFORE the reference for context',
        'Read 2–3 sentences AFTER the reference',
        'Answer based only on what is said in that section',
        'For Function questions: ask WHY the author included this, not WHAT it says'
      ],
      tip: 'Never answer a detail question from memory. Always go back to the text. The trap answer is often a plausible-sounding distortion of nearby text.'
    }
  ]);

  console.log(`  ✓ RC Question Types: ${4} questions, ${2} methods`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. RC — PASSAGE TYPES & AUTHOR TONE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n── RC — Passage Types & Author Tone ──');

  await insertQuestions(tid.rcPassTone, [
    {
      subtype: 'Passage Type Identification: Expository vs. Argumentative',
      q_text: `The process of desalination — removing salt and other minerals from seawater to produce fresh water — has been practiced in various forms for centuries. Modern reverse osmosis plants force seawater through semipermeable membranes at high pressure, separating dissolved salts from water molecules. The energy cost of this process has declined significantly over the past two decades due to improvements in membrane technology and energy recovery devices, making desalination increasingly viable for water-scarce coastal regions.

The passage is best characterized as

(A) an argumentative essay advocating for the immediate global adoption of desalination technology
(B) a comparative analysis of reverse osmosis and traditional distillation methods
(C) an expository description of desalination technology and its improving economic viability
(D) a critique of current desalination practices and their environmental impact
(E) a narrative account of one community's experience implementing a desalination plant`,
      question_type: 'RC',
      signals: '"best characterized as" — passage classification question; identify whether author explains, argues, or compares',
      trap: 'Choosing (A) — the passage describes and explains but never advocates or argues for adoption.',
      method: 'Passage Classification System',
      steps: [
        'Check for advocacy language: none found. Author explains what desalination is and how it has improved.',
        '(A) Wrong — no advocacy; "immediate global adoption" is never mentioned.',
        '(B) Wrong — distillation is never discussed; no comparison is made.',
        '(D) Wrong — environmental impact is never mentioned; no criticism is present.',
        '(E) Wrong — no specific community or narrative structure.',
        'Correct answer: (C) — the passage is expository: it describes the technology and explains its improving viability.'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: "Author's Attitude Toward Cited Research",
      q_text: `Professor Elaine Chen's longitudinal study of executive decision-making has been widely cited as evidence that intuitive judgment outperforms analytical deliberation in high-pressure business contexts. While Chen's methodology was rigorous — tracking 200 executives over eight years — her conclusions arguably conflate speed of decision with quality of outcome. Executives who decided quickly may have been drawing on extensive prior experience rather than intuition per se, a distinction that Chen's framework does not adequately address.

The author's attitude toward Chen's research is best described as

(A) enthusiastic endorsement of both the methodology and the conclusions
(B) complete dismissal of the study as fundamentally flawed
(C) qualified respect for the methodology combined with skepticism about the conclusions
(D) indifference toward the study's findings and their implications
(E) agreement with the conclusions but criticism of the methodology`,
      question_type: 'RC',
      signals: '"author\'s attitude" — tone question; look for hedging and qualification language',
      trap: 'Choosing (A) — the author explicitly challenges the conclusions with "arguably conflate" and "does not adequately address."',
      method: 'Attitude Marker Method',
      steps: [
        'Positive markers: "widely cited," "methodology was rigorous" — author respects the method.',
        'Negative markers: "arguably conflate," "does not adequately address" — author is skeptical of conclusions.',
        '(A) Wrong — author does NOT endorse conclusions; challenges them directly.',
        '(B) Wrong — "complete dismissal" is too extreme; author praises the methodology.',
        '(D) Wrong — the detailed critique shows the author is clearly engaged, not indifferent.',
        '(E) Wrong — direction reversal; author respects method but doubts conclusions, not the opposite.',
        'Correct answer: (C) — the author praises the rigor but questions the interpretive leap from data to conclusion.'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'Tone in Scientific Passage: Objective but Critical',
      q_text: `A series of clinical trials conducted between 2015 and 2020 examined the efficacy of a novel gene therapy for sickle cell disease. The therapy successfully corrected the hemoglobin mutation in 85 percent of treated patients, and none of the participants experienced disease relapse during the two-year follow-up period. These results are noteworthy, though the small sample size of 40 patients and the relatively brief follow-up period limit the generalizability of the findings. Longer-term studies with larger cohorts will be necessary before the therapy can be considered a reliable standard of care.

The tone of the passage is best described as

(A) dismissive of the gene therapy's potential to treat sickle cell disease
(B) unreservedly optimistic about the immediate clinical adoption of the therapy
(C) formally objective while noting limitations that temper the positive results
(D) emotionally persuasive in its advocacy for increased research funding
(E) hostile toward the researchers who conducted the clinical trials`,
      question_type: 'RC',
      signals: '"tone" question — identify the author\'s overall stance; look for qualification words',
      trap: 'Choosing (B) — the author presents good results but explicitly adds caveats ("limit the generalizability," "will be necessary").',
      method: 'Tone Identification',
      steps: [
        'Positive elements: "successfully corrected," "noteworthy" — acknowledges good results.',
        'Qualifying elements: "though the small sample size," "limit the generalizability," "will be necessary" — formal caveats.',
        '(A) Wrong — author acknowledges impressive results; not dismissive.',
        '(B) Wrong — "unreservedly" contradicts the explicit caveats.',
        '(D) Wrong — no emotional language or funding advocacy.',
        '(E) Wrong — no hostility; the tone is measured and respectful.',
        'Correct answer: (C) — the passage maintains scientific objectivity while explicitly noting limitations.'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Tone Shift: Before and After a Pivot Word',
      q_text: `For most of the twentieth century, economists treated natural resources as externalities — factors outside the scope of standard economic models. Land, water, and clean air were assumed to be abundant and therefore economically irrelevant. Yet the environmental crises of recent decades have forced a fundamental reassessment of this assumption. Economists now recognize that resource depletion and environmental degradation impose real costs on economic systems, costs that traditional GDP measurements systematically fail to capture.

The author's perspective shifts in the passage primarily from

(A) support for traditional economic models to advocacy for abandoning economics entirely
(B) presenting the historical treatment of natural resources to arguing that this treatment was flawed
(C) describing environmental crises to proposing specific policy solutions
(D) criticizing modern economists to praising their twentieth-century predecessors
(E) neutral scientific reporting to emotional personal testimony`,
      question_type: 'RC',
      signals: '"shifts" — tone shift question; identify the pivot word and what changes before and after it',
      trap: 'Choosing (A) — "abandoning economics entirely" is far too extreme; the passage describes economics evolving, not being abandoned.',
      method: 'Tone Identification',
      steps: [
        'Pivot word: "Yet" — signals the shift from old view to new reassessment.',
        'Before "Yet": economists treated resources as externalities, assumed abundance.',
        'After "Yet": environmental crises forced reassessment; old assumptions were wrong; GDP fails to capture costs.',
        '(A) Wrong — too extreme; no one advocates abandoning economics.',
        '(C) Wrong — no specific policies are proposed.',
        '(D) Wrong — direction reversal; author criticizes the old view, not the modern one.',
        '(E) Wrong — no emotional or personal testimony appears.',
        'Correct answer: (B) — the passage moves from describing the historical treatment to arguing it was inadequate.'
      ],
      difficulty: 'Hard'
    }
  ]);

  await insertMethods(tid.rcPassTone, [
    {
      name: 'Passage Classification System',
      when_to_use: 'When starting a new RC passage — classify the passage type to set expectations',
      steps: [
        'Expository/Descriptive: the author explains, describes, or surveys; no strong advocacy',
        'Argumentative/Persuasive: the author takes a stance, argues, or advocates for a position',
        'Comparative: the author contrasts two views, theories, or entities',
        'Narrative: rare on GMAT; tells a story or historical account',
        'Mixed: describes then argues, or compares then takes a side'
      ],
      tip: 'Knowing the passage type helps you predict what question types will appear: argumentative passages generate more inference and assumption questions; expository passages generate more detail and tone questions.'
    },
    {
      name: 'Attitude Marker Method',
      when_to_use: "When identifying the author's attitude toward cited research, scholars, or theories",
      steps: [
        'Endorsement markers: supports, confirms, demonstrates, validates, shows',
        'Qualified endorsement: while X has merits, it fails to account for...',
        'Neutral presentation: according to X, it has been argued that...',
        'Criticism markers: fails to, overlooks, is flawed by, cannot account for, ignores',
        'Strong opposition: fundamentally misunderstands, is entirely inconsistent with'
      ],
      tip: "The GMAT rarely shows authors with extreme positive or negative tones. Look for hedged criticism ('while X has merit, it nonetheless fails to...') as the most common pattern."
    }
  ]);

  console.log(`  ✓ RC Passage Types & Author Tone: ${4} questions, ${2} methods`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. RC — INFERENCE & APPLICATION QUESTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n── RC — Inference & Application Questions ──');

  await insertQuestions(tid.rcInfApp, [
    {
      subtype: 'Analogical Inference: Find the Parallel Scenario',
      q_text: `When the Indonesian government imposed a sudden ban on nickel ore exports in 2014, it intended to force mining companies to build domestic smelters, thereby capturing more value from the country's mineral resources within its own borders. The policy succeeded in attracting smelter investment, but it also created severe short-term supply disruptions in the global nickel market, causing prices to spike and prompting major importing nations to seek alternative suppliers in the Philippines and New Caledonia.

Which of the following situations is most analogous to the Indonesian nickel export ban as described in the passage?

(A) A country reduces tariffs on all imported goods to encourage free trade and lower consumer prices.
(B) A farming region restricts grain exports to stimulate local food processing industries, but importing countries quickly shift to alternative grain suppliers.
(C) A company increases its advertising budget, which leads to higher sales and greater market share.
(D) A government invests in renewable energy infrastructure, which creates new jobs in the domestic economy.
(E) A university raises tuition fees, causing enrollment to decline steadily over several years.`,
      question_type: 'RC',
      signals: '"most analogous to" — extract structural pattern: export restriction → domestic value capture + supply disruption + substitute seeking',
      trap: 'Choosing (D) — matches on "domestic investment" surface detail but lacks the export restriction and supply disruption mechanism.',
      method: 'Analogy Matching Framework',
      steps: [
        'Pattern: restrict export → force domestic processing → succeed in attracting investment → BUT cause global supply disruption → importers find substitutes.',
        '(A) Wrong — reducing tariffs is the opposite of restricting exports.',
        '(C) Wrong — advertising → sales is a simple cause-effect with no restriction or disruption.',
        '(D) Wrong — government investment creates jobs but involves no export restriction or market disruption.',
        '(E) Wrong — tuition increase → enrollment decline is a price-demand story, not an export restriction story.',
        'Correct answer: (B) — matches the full pattern: restrict exports → stimulate domestic processing → importers find alternatives.'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'Extend: Apply Research Findings to New Context',
      q_text: `Researchers studying workplace productivity found that employees who were given autonomy over their work schedules — choosing when to start and end their workdays — showed a 15 percent increase in output compared to employees on fixed schedules. The researchers attributed this effect to improved alignment between work hours and individual circadian rhythms: employees naturally scheduled their most cognitively demanding tasks during their personal peak alertness periods. The effect was most pronounced among employees performing complex analytical work and least pronounced among those performing routine manual tasks.

Based on the passage's findings, which of the following predictions is most strongly supported?

(A) Allowing flexible scheduling for assembly line workers would increase their output by approximately 15 percent.
(B) Employees who work night shifts would show no productivity benefit from flexible scheduling.
(C) A research laboratory that allows scientists to choose their own work hours would likely see greater productivity gains than a warehouse that offers the same flexibility to its packers.
(D) Flexible scheduling would eliminate all differences in productivity between morning people and evening people.
(E) Companies that mandate fixed schedules will inevitably go bankrupt within five years.`,
      question_type: 'RC',
      signals: '"Based on the passage\'s findings" + "prediction" — extend/apply question; use the passage\'s stated pattern to predict',
      trap: 'Choosing (A) — the passage explicitly states the effect was LEAST pronounced for routine manual tasks; assembly line work is routine.',
      method: 'Application: Extract then Apply',
      steps: [
        'Key finding: flexibility helps most for complex analytical work, least for routine manual tasks.',
        '(A) Wrong — contradicts the passage; routine manual work shows the least benefit.',
        '(B) Wrong — the passage doesn\'t distinguish night vs. day shifts; this goes beyond the text.',
        '(D) Wrong — "eliminate all differences" is too extreme.',
        '(E) Wrong — extreme and unsupported prediction.',
        'Correct answer: (C) — scientists do complex analytical work (most benefit); warehouse packers do routine manual tasks (least benefit). Directly extends the passage\'s finding.'
      ],
      difficulty: 'Medium'
    },
    {
      subtype: 'Inference vs. Interpretation: Stay Conservative',
      q_text: `Archaeological evidence from the ancient city of Mohenjo-daro reveals a remarkably uniform system of weights and measures across the Indus Valley civilization, which flourished from approximately 2600 to 1900 BCE. Standardized brick sizes have been found at sites separated by hundreds of kilometers, and the weights used in trade follow a consistent binary-decimal system. Some scholars have interpreted this uniformity as evidence of a strong central government that enforced standardization across the civilization's territory.

Which of the following can be most reliably inferred from the passage?

(A) The Indus Valley civilization had a powerful centralized government that controlled all aspects of daily life.
(B) The standardization of weights and measures in the Indus Valley was more advanced than that of contemporary Mesopotamia.
(C) Uniform weights and brick sizes were used across geographically dispersed sites in the Indus Valley civilization.
(D) The decline of the Indus Valley civilization in 1900 BCE was caused by the collapse of its standardization system.
(E) All ancient civilizations required centralized government to achieve standardization of trade goods.`,
      question_type: 'RC',
      signals: '"most reliably inferred" — strict inference; resist the temptation to go beyond what the text directly supports',
      trap: 'Choosing (A) — tempting but goes beyond the passage. The passage says "some scholars have interpreted" this as evidence, not that it IS evidence. The inference is not proven.',
      method: 'Find the Textual Support',
      steps: [
        'The passage directly states: standardized bricks at sites hundreds of km apart + consistent weight system.',
        '(A) Wrong — the passage attributes "strong central government" to "some scholars" as an interpretation, not a fact.',
        '(B) Wrong — Mesopotamia is never mentioned; no comparison is made.',
        '(D) Wrong — the cause of decline is never discussed.',
        '(E) Wrong — "all ancient civilizations" is a sweeping generalization with no support.',
        'Correct answer: (C) — this is directly stated in the passage as archaeological fact, not interpretation.'
      ],
      difficulty: 'Hard'
    },
    {
      subtype: 'Application: What Would the Author Predict?',
      q_text: `Economic historians have observed that periods of rapid technological innovation are frequently followed by extended periods of stagnant or declining real wages for workers whose skills are rendered obsolete by the new technologies. During the early Industrial Revolution, for example, skilled hand-loom weavers experienced decades of falling wages as mechanized looms replaced their labor. The author argues that this pattern is not inevitable, however: societies that invest heavily in retraining programs and education during periods of technological disruption can significantly shorten the period of wage stagnation and accelerate the transition to higher-productivity employment.

Based on the author's argument, which of the following would the author most likely predict?

(A) A country that automates its manufacturing sector but provides no worker retraining programs will experience prolonged wage stagnation among displaced workers.
(B) Rapid technological innovation always leads to permanent unemployment for all affected workers.
(C) Education spending has no measurable impact on workers' ability to adapt to new technologies.
(D) The Industrial Revolution ultimately had no long-term negative effects on workers' wages.
(E) Worker retraining programs are too expensive to be implemented by any modern government.`,
      question_type: 'RC',
      signals: '"the author most likely predict" — application question; use the author\'s stated framework to predict a new outcome',
      trap: 'Choosing (B) — too extreme; the author explicitly says the pattern is "not inevitable" and can be shortened with retraining.',
      method: 'Eliminate by Scope',
      steps: [
        'Author\'s framework: tech innovation → wage stagnation, BUT retraining/education → shorter stagnation → faster recovery.',
        'Prediction: without retraining → prolonged stagnation (the default pattern the author describes).',
        '(B) Wrong — "always" and "permanent" are too extreme; author says it\'s not inevitable.',
        '(C) Wrong — directly contradicts the author\'s argument that education helps.',
        '(D) Wrong — passage explicitly describes decades of falling wages during the Industrial Revolution.',
        '(E) Wrong — the passage advocates for retraining; no mention of cost being prohibitive.',
        'Correct answer: (A) — directly applies the author\'s framework: no retraining → prolonged stagnation, exactly as the historical pattern shows.'
      ],
      difficulty: 'Medium'
    }
  ]);

  await insertMethods(tid.rcInfApp, [
    {
      name: 'Analogy Matching Framework',
      when_to_use: 'For Application and Analogy questions asking which scenario parallels the passage',
      steps: [
        'Identify the key structural elements of the passage example: the agent, the action, the mechanism, the outcome',
        "Express it as a pattern: 'Entity X does Y through mechanism Z to achieve outcome W'",
        'For each answer choice: map the new scenario to the same pattern',
        'The correct answer matches the PATTERN, not the surface details',
        'Eliminate answers that match on surface (same industry, same topic) but differ in mechanism'
      ],
      tip: 'The trap answer almost always shares the same domain (e.g., both about medicine or economics) but gets the mechanism or relationship wrong.'
    },
    {
      name: 'Scope Check for Application',
      when_to_use: 'Before selecting any inference or application answer — run a final scope check',
      steps: [
        'Re-read the claim you\'re about to select',
        'Ask: does the passage actually support this, or am I adding an assumption?',
        'Check for scope creep: is this answer broader than what the passage claims?',
        'Check for direction: does the passage support this exact direction, not the opposite?',
        'Check for conditionality: the passage may say "sometimes" but the answer says "always"'
      ],
      tip: 'The hardest inference traps are ones that are TRUE in the real world but not supported BY THIS PASSAGE. Your job is to prove it from the text, not from your knowledge.'
    }
  ]);

  console.log(`  ✓ RC Inference & Application: ${4} questions, ${2} methods`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`\n═══ DONE ═══`);
  console.log(`Total inserted: ${qCount} questions, ${mCount} methods`);
  await c.end();
}

run().catch(err => { console.error(err); process.exit(1); });
