const { Client } = require('../node_modules/pg');

const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// ─── Data ────────────────────────────────────────────────────────────────────

const topicData = {
  'Argument Structure': {
    questions: [
      {
        subtype: 'Conclusion ID: Spotting the Main Claim',
        q_text: `The city council recently approved a 15% increase in parking fees at downtown garages. Council members argued that the fee increase would reduce traffic congestion by discouraging unnecessary car trips into the city center. However, a survey of downtown commuters shows that 85% of them have no viable public transportation alternative for their commute. Therefore, the fee increase is unlikely to reduce traffic congestion and will instead function primarily as a revenue-generating measure.

Which of the following best identifies the main conclusion of the argument above?

(A) The city council approved a 15% increase in parking fees.
(B) The fee increase was intended to reduce traffic congestion.
(C) Most downtown commuters lack viable public transportation alternatives.
(D) The fee increase is unlikely to reduce traffic congestion and will primarily generate revenue.
(E) Downtown parking garages are a significant source of city revenue.`,
        question_type: 'CR',
        signals: '"Which of the following best identifies the main conclusion" — conclusion identification. Look for indicator word "therefore."',
        trap: 'Choosing (A) or (B), which are premises/background, not the conclusion. The word "therefore" directly signals (D).',
        method: 'Indicator Word Method',
        steps: [
          '"Therefore" introduces the main claim: the fee increase won\'t reduce congestion and is mainly a revenue measure.',
          '(A) is background — states a fact about council action. Eliminate.',
          '(B) is the council\'s claim being argued AGAINST. Eliminate.',
          '(C) is evidence supporting the conclusion. Eliminate.',
          '(E) is never stated in the argument. Eliminate.',
          'Correct answer: (D) — It directly follows "therefore" and is supported by the survey evidence.'
        ],
        difficulty: 'Medium',
      },
      {
        subtype: 'Sub-Conclusion: Intermediate Claim',
        q_text: `A pharmaceutical company tested a new drug on 1,000 patients with chronic migraines. Patients who took the drug reported 60% fewer migraine episodes than those who took a placebo. Since the drug demonstrably reduces migraine frequency, doctors should prescribe it as a first-line treatment for chronic migraine sufferers who have not responded to existing medications.

In the argument above, the statement "the drug demonstrably reduces migraine frequency" plays which of the following roles?

(A) It is the main conclusion of the argument.
(B) It is a premise that directly supports another premise.
(C) It is an intermediate conclusion drawn from evidence that in turn supports the main conclusion.
(D) It provides background information about the drug's development.
(E) It acknowledges a potential objection to the main conclusion.`,
        question_type: 'CR',
        signals: '"Plays which of the following roles" — role identification / boldface-style question.',
        trap: 'Choosing (A). The main conclusion is that doctors SHOULD prescribe it. The statement about reducing frequency is derived from evidence but supports the final recommendation.',
        method: 'Sub-Conclusion Detection',
        steps: [
          'Evidence: 60% fewer episodes in trial. Sub-conclusion: drug reduces frequency. Main conclusion: doctors should prescribe it.',
          'The statement is supported BY the trial data AND supports the prescription recommendation.',
          '(A) is wrong — the main conclusion is the prescription recommendation. Eliminate.',
          '(B) is wrong — it supports a conclusion, not another premise. Eliminate.',
          '(D) is wrong — it\'s not background. Eliminate.',
          '(E) is wrong — it doesn\'t acknowledge an objection. Eliminate.',
          'Correct answer: (C) — It is an intermediate conclusion supported by evidence and supporting the main conclusion.'
        ],
        difficulty: 'Hard',
      },
      {
        subtype: 'Background vs. Evidence: Role Classification',
        q_text: `Over the past decade, the global demand for lithium has increased fivefold due to the growth of electric vehicle manufacturing. A mining company recently discovered a large lithium deposit in a remote mountain region. Geological surveys indicate that the deposit contains enough lithium to supply 10% of global demand for the next 20 years. The company's stock price is therefore likely to increase significantly once the discovery is publicly announced.

The statement that global lithium demand has increased fivefold serves which of the following roles in the argument?

(A) It is the main conclusion of the argument.
(B) It is evidence directly supporting the main conclusion.
(C) It provides background context that establishes why the discovery is significant.
(D) It is an intermediate conclusion supported by other evidence.
(E) It contradicts the main conclusion of the argument.`,
        question_type: 'CR',
        signals: '"Serves which of the following roles" — role classification.',
        trap: 'Choosing (B). The demand statement isn\'t direct evidence for the stock price — it\'s context explaining why lithium deposits matter.',
        method: 'Indicator Word Method',
        steps: [
          'Main conclusion (signaled by "therefore"): stock price will increase.',
          'Direct evidence: deposit contains 10% of global supply for 20 years.',
          'The demand statement sets the stage — without knowing demand is high, the discovery wouldn\'t seem important.',
          '(A) is wrong — "therefore" points to the stock price claim. Eliminate.',
          '(B) is wrong — it doesn\'t directly support the stock claim; it explains the context. Eliminate.',
          '(D) is wrong — it\'s stated as fact, not derived from other evidence. Eliminate.',
          '(E) is wrong — it doesn\'t contradict anything. Eliminate.',
          'Correct answer: (C) — It provides background context establishing the significance of the lithium discovery.'
        ],
        difficulty: 'Medium',
      },
      {
        subtype: 'Logical Flaw: Correlation-Causation',
        q_text: `A health magazine reported that people who eat breakfast every day have a 30% lower rate of heart disease than those who skip breakfast. The magazine concluded that eating breakfast prevents heart disease and recommended that all readers adopt a daily breakfast habit to protect their cardiovascular health.

The reasoning in the argument is most vulnerable to which of the following criticisms?

(A) It fails to consider that breakfast foods vary widely in nutritional content.
(B) It assumes that a correlation between breakfast eating and lower heart disease rates establishes a causal relationship.
(C) It does not specify the size of the study sample.
(D) It generalizes from the habits of regular breakfast eaters to the entire population.
(E) It ignores the possibility that some people are allergic to common breakfast foods.`,
        question_type: 'CR',
        signals: '"Most vulnerable to which of the following criticisms" — flaw identification.',
        trap: 'Choosing (A) or (D), which are secondary concerns. The core flaw is assuming correlation equals causation.',
        method: 'Logical Flaw Taxonomy',
        steps: [
          'The argument moves from correlation (breakfast eaters have less heart disease) to causation (breakfast prevents heart disease).',
          'Alternative explanation: health-conscious people both eat breakfast AND exercise, manage stress, etc.',
          '(A) raises a valid concern but doesn\'t identify the core logical flaw. Eliminate.',
          '(C) is about methodology, not the core reasoning error. Eliminate.',
          '(D) is partially relevant but the main issue isn\'t generalization — it\'s causation. Eliminate.',
          '(E) is irrelevant to the logical structure. Eliminate.',
          'Correct answer: (B) — The argument assumes correlation (lower disease rates among breakfast eaters) proves causation (breakfast prevents disease).'
        ],
        difficulty: 'Medium',
      },
      {
        subtype: 'Premise Scope: Overgeneralization',
        q_text: `A survey of 200 software engineers in Silicon Valley found that 78% preferred working remotely to working in an office. Based on this finding, a technology industry analyst concluded that the vast majority of all technology professionals worldwide prefer remote work.

The reasoning in the argument is most vulnerable to criticism on the grounds that it

(A) relies on a sample that may not be representative of the broader population described in the conclusion
(B) fails to define what constitutes "remote work" versus "office work"
(C) ignores the preferences of technology professionals who were not software engineers
(D) assumes that preferences remain constant over time
(E) does not account for the cost savings associated with remote work`,
        question_type: 'CR',
        signals: '"Most vulnerable to criticism on the grounds that" — flaw identification, scope overreach.',
        trap: 'Choosing (C), which is part of the scope issue but too narrow. The real flaw is generalizing from Silicon Valley engineers to ALL tech professionals worldwide.',
        method: 'Logical Flaw Taxonomy',
        steps: [
          'Evidence scope: 200 software engineers in Silicon Valley. Conclusion scope: all technology professionals worldwide.',
          'This is a classic overgeneralization — the sample is narrow (one job title, one region) but the conclusion is global.',
          '(B) is a definitional concern, not the core flaw. Eliminate.',
          '(C) captures part of the scope issue but doesn\'t address the geographic limitation. Eliminate.',
          '(D) is about temporal scope, which isn\'t the main issue here. Eliminate.',
          '(E) is irrelevant to the logical flaw. Eliminate.',
          'Correct answer: (A) — The sample (Silicon Valley software engineers) may not represent all technology professionals worldwide.'
        ],
        difficulty: 'Medium',
      },
    ],
    methods: [
      {
        name: 'Indicator Word Method',
        when_to_use: 'When you need to quickly identify conclusion vs. premise in any CR stimulus',
        steps: [
          'Circle all conclusion indicators (therefore, thus, so, hence, consequently)',
          'Circle all premise indicators (because, since, given that, as evidenced by)',
          'The statement following a conclusion indicator is the conclusion',
          'The statements following premise indicators are evidence',
          "If no indicators: ask 'What is the author trying to prove?'"
        ],
        tip: 'Sub-conclusions often have BOTH a premise indicator before them and a conclusion indicator after them.',
      },
      {
        name: 'Logical Flaw Taxonomy',
        when_to_use: 'When identifying or categorizing the error in flawed-argument questions',
        steps: [
          'Identify claim type: causal, analogical, statistical, or definitional',
          'Causal: check if correlation is mistaken for causation',
          'Statistical: check sample size, representativeness, cherry-picking',
          'Analogical: check for key differences that break the comparison',
          'Definitional: check if terms shift meaning mid-argument'
        ],
        tip: 'Most GMAT flaw questions fall into causal or analogical categories.',
      },
      {
        name: 'Sub-Conclusion Detection',
        when_to_use: 'When an argument has a chain of reasoning with an intermediate claim',
        steps: [
          'Read the entire stimulus',
          'Look for a statement that is BOTH supported by prior evidence AND supports the final conclusion',
          'This is the sub-conclusion',
          "Confirm: can you put 'therefore' before it AND 'because' after it?",
          'Label: Evidence → Sub-Conclusion → Main Conclusion'
        ],
        tip: "Sub-conclusions are common in boldface questions — they're often one of the bolded statements.",
      },
    ],
  },

  'CR — Weaken': {
    questions: [
      {
        subtype: 'Weaken a Plan: Implementation Failure',
        q_text: `To reduce employee turnover, which has cost the company an estimated $2 million annually, the human resources department plans to implement a mentorship program pairing new hires with senior employees. The department expects the program to increase new-hire retention by 40% within the first year.

Which of the following, if true, most seriously weakens the plan described above?

(A) The company's main competitor recently implemented a similar mentorship program with positive results.
(B) Senior employees have indicated in surveys that they are willing to participate in mentorship activities.
(C) Employee turnover is highest among mid-level managers, not new hires.
(D) The human resources department has successfully implemented other retention programs in the past.
(E) New hires who leave typically do so because of salary concerns rather than lack of guidance.`,
        question_type: 'CR',
        signals: '"Most seriously weakens the plan" — weaken a plan/proposal.',
        trap: 'Choosing (E), which weakens through alternative cause but is less devastating than (C), which shows the plan targets the wrong group entirely.',
        method: 'Plan Attack Method',
        steps: [
          'The plan targets new hires with mentorship to reduce turnover.',
          '(A) strengthens — competitor success suggests the approach works. Eliminate.',
          '(B) strengthens — willing mentors means the plan is feasible. Eliminate.',
          '(C) attacks mechanism: if turnover is among mid-level managers, not new hires, the plan targets the wrong group.',
          '(D) strengthens — past success suggests competence. Eliminate.',
          '(E) weakens mechanism somewhat but (C) is more devastating — wrong target entirely.',
          'Correct answer: (C) — If turnover is highest among mid-level managers, a new-hire mentorship program addresses the wrong population.'
        ],
        difficulty: 'Hard',
      },
      {
        subtype: 'Weaken: Scope Overreach',
        q_text: `A study of 500 university students found that those who studied in groups scored an average of 12% higher on final exams than those who studied alone. A national education commission concluded that implementing mandatory group study sessions at all levels of education would improve academic performance nationwide.

Which of the following, if true, most seriously weakens the commission's conclusion?

(A) University students who choose to study in groups tend to be more motivated than those who study alone.
(B) Group study sessions require more institutional resources than individual study.
(C) Some subjects, such as mathematics, benefit more from group study than others.
(D) The study measured performance only in humanities courses at a single university.
(E) Several universities have already adopted group study programs with mixed results.`,
        question_type: 'CR',
        signals: '"Most seriously weakens" — scope overreach from narrow study to broad conclusion.',
        trap: 'Choosing (A), which raises a self-selection concern. But (D) more directly attacks the scope leap from one university\'s humanities courses to all levels and subjects nationwide.',
        method: 'Scope Slide Detection',
        steps: [
          'Evidence scope: 500 university students. Conclusion scope: all levels of education, nationwide.',
          '(A) weakens by suggesting self-selection bias. It\'s relevant but doesn\'t address the scope leap.',
          '(B) is about practicality, not whether the conclusion is logically supported. Eliminate.',
          '(C) partially limits scope but doesn\'t undermine the conclusion entirely. Eliminate.',
          '(D) reveals the evidence is even narrower than presented — one university, humanities only.',
          '(E) provides mixed evidence but doesn\'t directly target the logical flaw. Eliminate.',
          'Correct answer: (D) — If the study only covered humanities at one university, generalizing to all education levels nationwide is unsupported.'
        ],
        difficulty: 'Hard',
      },
      {
        subtype: 'Weaken: Confounding Variable',
        q_text: `A regional health authority observed that towns with fluoridated water supplies have 25% fewer dental cavities per capita than towns without fluoridation. The authority concluded that fluoridating water is the most effective public health measure for reducing dental cavities.

Which of the following, if true, most seriously weakens the authority's conclusion?

(A) Fluoride toothpaste is widely available in all towns in the region, regardless of water fluoridation status.
(B) Towns that have fluoridated their water also tend to have higher average incomes and better access to dental care.
(C) Some individuals are sensitive to fluoride and experience mild side effects.
(D) The cost of fluoridating a town's water supply is relatively low compared to other public health measures.
(E) Dental cavities can be caused by factors other than lack of fluoride, such as diet and oral hygiene habits.`,
        question_type: 'CR',
        signals: '"Most seriously weakens" — confounding variable.',
        trap: 'Choosing (A) or (E). (A) actually slightly weakens but doesn\'t explain the observed difference. (E) is too general. (B) identifies a specific confounding variable.',
        method: 'ACE Method (Assumption, Conclusion, Evidence)',
        steps: [
          'The argument assumes fluoridation CAUSES fewer cavities. But what if another variable explains both?',
          '(A) suggests fluoride toothpaste is universal, which slightly weakens but doesn\'t explain the difference. Eliminate.',
          '(B) introduces income and dental care access as confounders — these could explain lower cavity rates independently.',
          '(C) is about side effects, not effectiveness. Eliminate.',
          '(D) is about cost, not effectiveness. Eliminate.',
          '(E) is too vague to directly weaken. Eliminate.',
          'Correct answer: (B) — Higher incomes and better dental care access in fluoridated towns could explain the lower cavity rates, independent of fluoridation.'
        ],
        difficulty: 'Hard',
      },
      {
        subtype: 'Weaken: General Principle Misapplication',
        q_text: `In manufacturing, reducing the number of steps in a production process typically decreases defect rates because each step introduces a chance for error. The management of a software development firm therefore decided to reduce the number of code review stages in their development pipeline, reasoning that fewer review stages would result in fewer software bugs.

Which of the following, if true, most seriously weakens the management's reasoning?

(A) The software firm's competitors use a similar number of code review stages.
(B) Unlike manufacturing steps that can introduce defects, code review stages are specifically designed to catch and eliminate existing bugs.
(C) The software firm has experienced an increase in bugs over the past year.
(D) Some of the firm's most experienced developers have expressed support for the reduction.
(E) Reducing production steps in manufacturing sometimes leads to initial quality decreases before improvement.`,
        question_type: 'CR',
        signals: '"Most seriously weakens the reasoning" — principle misapplication.',
        trap: 'Choosing (E), which slightly qualifies the manufacturing principle. (B) is far stronger because it shows the principle doesn\'t apply — review stages REMOVE bugs rather than introducing them.',
        method: 'Scope Shift',
        steps: [
          'The argument applies a manufacturing principle (fewer steps = fewer defects) to software reviews.',
          'Key assumption: code review stages are analogous to manufacturing steps that introduce errors.',
          '(A) is irrelevant — competitor practices don\'t address the reasoning. Eliminate.',
          '(B) breaks the analogy: manufacturing steps ADD error chances, but code reviews REMOVE bugs.',
          '(C) provides context but doesn\'t address whether the reasoning is sound. Eliminate.',
          '(D) is an appeal to authority, not a logical critique. Eliminate.',
          '(E) is about manufacturing, not the software analogy. Eliminate.',
          'Correct answer: (B) — Code reviews catch bugs rather than introducing them, so the manufacturing principle does not apply.'
        ],
        difficulty: 'Hard',
      },
    ],
    methods: [
      {
        name: 'Plan Attack Method',
        when_to_use: 'When weakening a proposal or recommendation argument',
        steps: [
          'Identify what the plan is trying to achieve',
          'Attack viability: will the plan actually be implemented as described?',
          'Attack adoption: will the target audience comply?',
          'Attack mechanism: does this action actually cause the desired result?',
          'Attack side effects: does the plan create new problems that offset the benefit?'
        ],
        tip: "For plans, 'alternative causes' are less useful — focus on WHY the plan will fail.",
      },
      {
        name: 'Scope Slide Detection',
        when_to_use: 'When the conclusion extends beyond what the evidence shows',
        steps: [
          'Identify the exact scope of the evidence (who/what/when/where)',
          'Identify the exact scope of the conclusion',
          "If the conclusion covers MORE than the evidence, there's a scope slide",
          'The correct weaken answer will highlight this mismatch',
          "Common slide: study of Group A → conclusion about Group B"
        ],
        tip: "Words like 'all,' 'most,' 'generally,' or 'in all cases' in the conclusion signal potential scope overreach.",
      },
    ],
  },

  'CR — Strengthen & Assumption': {
    questions: [
      {
        subtype: 'Strengthen: Rule Out Alternative Causes',
        q_text: `After a factory installed new air filtration systems, the rate of respiratory illness among workers dropped by 35% over the following year. The factory manager concluded that the new filtration systems were responsible for the improvement in worker health.

Which of the following, if true, most strengthens the manager's conclusion?

(A) The filtration systems were significantly more expensive than the previous models.
(B) During the same year, no other changes were made to the factory's ventilation, safety procedures, or workforce composition.
(C) Workers at nearby factories that did not install new filtration systems experienced a similar decrease in respiratory illness.
(D) The new filtration systems also reduced dust accumulation on factory machinery.
(E) Some workers continued to experience respiratory symptoms despite the new systems.`,
        question_type: 'CR',
        signals: '"Most strengthens" — strengthen by ruling out alternatives.',
        trap: 'Choosing (D), which provides additional benefit but doesn\'t strengthen the CAUSAL claim. (C) actually WEAKENS the argument.',
        method: 'Cause-Elimination Strengthen',
        steps: [
          'The claim: new filtration → fewer respiratory illnesses. Need to rule out other explanations.',
          '(A) is about cost — irrelevant to the causal claim. Eliminate.',
          '(B) rules out confounders: no other changes occurred, isolating the filtration system as the cause.',
          '(C) WEAKENS — if others improved too, something else may explain it. Eliminate.',
          '(D) is an additional effect, not evidence of the causal link to health. Eliminate.',
          '(E) WEAKENS slightly — some workers still sick. Eliminate.',
          'Correct answer: (B) — By confirming no other changes occurred, it isolates the filtration system as the most likely cause.'
        ],
        difficulty: 'Medium',
      },
      {
        subtype: 'Strengthen: Confirm the Causal Chain',
        q_text: `A city implemented a congestion pricing program, charging drivers a fee to enter the downtown core during peak hours. Six months later, average commute times into downtown decreased by 20%. City officials attributed the improvement to the congestion pricing program.

Which of the following, if true, most strengthens the officials' claim?

(A) The revenue from the congestion pricing program has been used to fund public transportation improvements.
(B) Traffic volume in the downtown core during peak hours declined by 30% after the program was implemented.
(C) A neighboring city without congestion pricing has experienced increasing commute times.
(D) Some drivers have shifted their commutes to off-peak hours to avoid the fee.
(E) The congestion pricing program has been politically controversial among downtown business owners.`,
        question_type: 'CR',
        signals: '"Most strengthens" — confirm the causal mechanism.',
        trap: 'Choosing (C), which provides indirect support through comparison. (B) directly confirms the mechanism: pricing → less traffic → shorter commutes.',
        method: 'Cause-Elimination Strengthen',
        steps: [
          'Claim: congestion pricing → shorter commutes. The mechanism should be: fee → fewer cars → less congestion → faster commutes.',
          '(A) mentions revenue use — a separate benefit, not the mechanism. Eliminate.',
          '(B) directly confirms the causal chain: traffic volume dropped 30%, explaining the 20% commute improvement.',
          '(C) provides weak comparative support but doesn\'t confirm the mechanism. Eliminate.',
          '(D) explains behavior change but doesn\'t directly link to commute time improvement. Eliminate.',
          '(E) is about politics, not the causal claim. Eliminate.',
          'Correct answer: (B) — Confirming that peak-hour traffic volume dropped directly supports the causal chain from pricing to reduced commute times.'
        ],
        difficulty: 'Medium',
      },
      {
        subtype: 'Assumption: Formal Logic — Contrapositive',
        q_text: `All employees who complete the advanced certification program are eligible for a management position. Reyes is not eligible for a management position. Therefore, Reyes has not completed the advanced certification program.

The conclusion above follows logically if which of the following is assumed?

(A) Only employees who complete the advanced certification program are eligible for management.
(B) Reyes has not yet applied for a management position.
(C) Some employees who are eligible for management have not completed the certification.
(D) The advanced certification program is the only path to management eligibility.
(E) Reyes is a current employee of the company.`,
        question_type: 'CR',
        signals: '"Follows logically if which is assumed" — sufficient assumption, formal logic.',
        trap: 'Choosing (A) or (D) without seeing that they say the same thing. (A) is the precise restatement: "only" those who complete = completing is NECESSARY. The argument uses the contrapositive correctly with this assumption.',
        method: 'Sufficient Assumption Check',
        steps: [
          'Given: Complete program → Eligible. Reyes is NOT eligible. Conclusion: Reyes has NOT completed.',
          'This uses the contrapositive: NOT eligible → NOT completed. Valid ONLY if the original conditional is correct.',
          'The stated premise says "all who complete ARE eligible" but the argument needs "ONLY those who complete are eligible."',
          '(A) says "only employees who complete...are eligible" — this makes completion NECESSARY for eligibility.',
          '(B) is about applying, not eligibility. Eliminate.',
          '(C) WEAKENS — allows eligibility without certification. Eliminate.',
          '(D) says the same as (A) in different words, but (A) is the more precise formal logic statement.',
          '(E) is background, not the needed assumption. Eliminate.',
          'Correct answer: (A) — It establishes that completing the program is necessary (not just sufficient) for eligibility, making the contrapositive valid.'
        ],
        difficulty: 'Hard',
      },
      {
        subtype: 'Necessary vs. Sufficient: Distinguish the Requirement',
        q_text: `A pharmaceutical company will seek FDA approval for a new drug only if clinical trials demonstrate that the drug is both safe and more effective than existing treatments. The company recently announced that clinical trials have demonstrated the drug's safety.

Which of the following can be properly concluded from the statements above?

(A) The company will seek FDA approval for the drug.
(B) The company will not seek FDA approval for the drug.
(C) If the drug is also shown to be more effective than existing treatments, the company will seek FDA approval.
(D) The drug has not yet been shown to be more effective than existing treatments.
(E) Clinical trials that demonstrate safety are sufficient for FDA approval.`,
        question_type: 'CR',
        signals: '"Can be properly concluded" — inference with conditional logic.',
        trap: 'Choosing (A) — safety alone is not sufficient; both conditions must be met. Choosing (B) — we don\'t know about effectiveness yet.',
        method: 'Formal Logic Deduction',
        steps: [
          'Rule: Seek approval → (safe AND more effective). Contrapositive: NOT (safe AND more effective) → NOT seek approval.',
          'Given: Drug is safe. But we don\'t know about effectiveness.',
          '(A) is wrong — safety alone doesn\'t trigger approval (need both conditions). Eliminate.',
          '(B) is wrong — we can\'t conclude this without knowing about effectiveness. Eliminate.',
          '(C) correctly applies the conditional: if BOTH conditions are met, the company will seek approval.',
          '(D) is not supported — the passage doesn\'t say anything about effectiveness results yet. Eliminate.',
          '(E) misreads the conditional — safety is necessary, not sufficient. Eliminate.',
          'Correct answer: (C) — The conditional requires both safety and superior effectiveness; with safety established, only effectiveness remains.'
        ],
        difficulty: 'Hard',
      },
    ],
    methods: [
      {
        name: 'Cause-Elimination Strengthen',
        when_to_use: 'When the argument claims X caused Y and you need to strengthen it',
        steps: [
          'Identify all plausible alternative causes of Y',
          'Find the answer that rules out one or more alternatives',
          'Or find the answer that confirms the causal mechanism directly',
          'Check: does this answer make it MORE likely that X caused Y?',
          'Avoid: answers that merely restate the conclusion'
        ],
        tip: 'For causal arguments, ruling out alternatives is often stronger than adding new evidence.',
      },
      {
        name: 'Necessary vs. Sufficient Distinction',
        when_to_use: 'When the question asks for a necessary assumption (must be true) vs. a sufficient assumption (guarantees conclusion)',
        steps: [
          "Necessary: use the Negation Test — negate the answer; if it kills the conclusion, it's necessary",
          'Sufficient: check if the answer ALONE guarantees the conclusion is true',
          'Necessary answers are broader and often more conservative',
          'Sufficient answers often contain conditional logic (if...then)',
          "If the question says 'which MUST be assumed' → Necessary; 'which ALLOWS the conclusion to be properly drawn' → Sufficient"
        ],
        tip: 'Most GMAT Assumption questions ask for necessary assumptions. Sufficient assumption questions are rarer but more demanding.',
      },
    ],
  },

  'CR — Other Types': {
    questions: [
      {
        subtype: 'Boldface: Sub-Conclusion + Evidence',
        q_text: `Researchers have long known that regular exercise reduces the risk of cardiovascular disease. **A recent study found that even 15 minutes of daily walking significantly lowers blood pressure in sedentary adults.** Some health policy experts have therefore argued that public health campaigns should focus on promoting minimal daily walking rather than more intensive exercise regimens. **However, the long-term cardiovascular benefits of walking alone have not been studied for periods longer than two years.**

In the argument above, the two bolded statements play which of the following roles?

(A) The first is evidence supporting the experts' recommendation; the second is the main conclusion.
(B) The first is the main conclusion; the second is evidence against that conclusion.
(C) The first is evidence supporting an intermediate conclusion; the second qualifies the scope of that conclusion.
(D) The first provides background information; the second is the main conclusion of the argument.
(E) The first and second both provide evidence for the same conclusion.`,
        question_type: 'CR',
        signals: '"The two bolded statements play which of the following roles" — boldface question.',
        trap: 'Choosing (A) — the second statement is not the main conclusion but a qualification/limitation. Choosing (E) — they don\'t support the same point.',
        method: 'Boldface Role Mapping',
        steps: [
          'Background: exercise reduces cardiovascular disease risk.',
          'Bold 1: study finding about walking and blood pressure — this is EVIDENCE supporting the experts\' recommendation.',
          'Experts\' recommendation (sub/main conclusion): campaigns should promote minimal walking.',
          'Bold 2: long-term benefits not studied beyond 2 years — this QUALIFIES/LIMITS the conclusion.',
          '(A) is wrong — the second statement limits, doesn\'t conclude. Eliminate.',
          '(B) is wrong — the first is evidence, not the conclusion. Eliminate.',
          '(D) is wrong — the first is specific study evidence, not background. Eliminate.',
          '(E) is wrong — they serve different roles. Eliminate.',
          'Correct answer: (C) — The first is evidence for the recommendation; the second qualifies the scope of that recommendation.'
        ],
        difficulty: 'Hard',
      },
      {
        subtype: 'Inference: Cannot Be Inferred (Trap)',
        q_text: `A survey of 1,200 consumers found that 65% of respondents prefer to shop at locally owned stores rather than national chains. However, sales data from the same region shows that national chains account for 80% of total retail revenue. Consumer spending at locally owned stores has remained flat for the past five years, while national chain revenue has grown 15% annually.

If the statements above are true, which of the following CANNOT be properly inferred?

(A) Consumer stated preferences do not always align with actual purchasing behavior.
(B) National chains have experienced revenue growth in the surveyed region.
(C) At least some consumers who stated a preference for local stores also shop at national chains.
(D) Locally owned stores will eventually be driven out of business by national chains.
(E) The majority of retail revenue in the region comes from national chains.`,
        question_type: 'CR',
        signals: '"CANNOT be properly inferred" — identify the answer that goes beyond the evidence.',
        trap: 'Not reading carefully and picking something that CAN be inferred. (D) makes a prediction about the future that the data doesn\'t support.',
        method: 'Inference Ladder',
        steps: [
          '(A) CAN be inferred — 65% prefer local but 80% of revenue goes to chains. Preferences ≠ behavior.',
          '(B) CAN be inferred — "national chain revenue has grown 15% annually" directly states this.',
          '(C) CAN be inferred — 65% prefer local but chains get 80% of revenue, so overlap is inevitable.',
          '(D) CANNOT be inferred — flat local sales doesn\'t mean they\'ll be "driven out of business." This is a prediction beyond the data.',
          '(E) CAN be inferred — "80% of total retail revenue" directly states this.',
          'Correct answer: (D) — The data shows flat sales and growth for chains, but predicting local stores will be "driven out of business" goes beyond what can be inferred.'
        ],
        difficulty: 'Hard',
      },
      {
        subtype: 'Paradox: Specific Cause Explains Both Facts',
        q_text: `A coffee shop chain introduced a loyalty rewards program offering a free drink after every ten purchases. In the six months after the program launched, the chain's total number of transactions increased by 25%, yet average revenue per transaction decreased by 15%.

Which of the following, if true, most helps to explain the apparent discrepancy described above?

(A) The loyalty program was widely advertised on social media platforms.
(B) Many customers began making smaller, more frequent purchases specifically to accumulate rewards points more quickly.
(C) The price of coffee beans increased during the six-month period.
(D) Customer satisfaction scores improved after the loyalty program was introduced.
(E) Some competing coffee shops also introduced loyalty programs during the same period.`,
        question_type: 'CR',
        signals: '"Most helps to explain the apparent discrepancy" — paradox/resolve question.',
        trap: 'Choosing (A) or (D), which explain the increase in transactions but not the decrease in revenue per transaction.',
        method: 'Paradox Resolution Framework',
        steps: [
          'Fact 1: Transactions up 25%. Fact 2: Revenue per transaction down 15%. Paradox: more customers but spending less each time.',
          '(A) explains more transactions but not lower per-transaction revenue. Eliminate.',
          '(B) explains BOTH: smaller purchases → lower revenue per transaction; more frequent purchases → more transactions.',
          '(C) would increase prices, contradicting the revenue decrease. Eliminate.',
          '(D) explains satisfaction but not the revenue pattern. Eliminate.',
          '(E) would likely decrease transactions, not explain the pattern. Eliminate.',
          'Correct answer: (B) — Smaller, more frequent purchases simultaneously explain both the increase in transactions and decrease in per-transaction revenue.'
        ],
        difficulty: 'Medium',
      },
      {
        subtype: 'Boldface: Background + Counter-Premise',
        q_text: `**The global shipping industry accounts for approximately 3% of worldwide greenhouse gas emissions.** Environmental groups have proposed strict emission caps for cargo vessels, arguing that without regulation, shipping emissions will double by 2050. Industry representatives counter that modern cargo ships are already the most fuel-efficient mode of transporting goods per ton-mile. **Nevertheless, satellite data shows that shipping lanes near major ports have measurably higher concentrations of sulfur dioxide and particulate matter than surrounding areas.**

In the argument above, the two bolded statements play which of the following roles?

(A) The first is the main conclusion; the second provides evidence supporting that conclusion.
(B) The first provides background context; the second presents evidence that counters the industry representatives' position.
(C) The first is evidence for the environmental groups' position; the second is the main conclusion.
(D) The first and second both provide evidence for the same conclusion.
(E) The first is a claim that the argument disputes; the second is the main conclusion of the argument.`,
        question_type: 'CR',
        signals: '"The two bolded statements play which of the following roles" — boldface question.',
        trap: 'Choosing (D) — they don\'t serve the same function. The first is neutral background; the second actively counters the industry claim.',
        method: 'Structural Diagram Pre-Reading',
        steps: [
          'Bold 1: "3% of worldwide greenhouse gas emissions" — this is a factual context-setting statement (background).',
          'Environmental groups propose caps. Industry counters that ships are fuel-efficient.',
          'Bold 2 (after "Nevertheless"): satellite data on pollution near ports — this COUNTERS the industry claim of efficiency.',
          '(A) is wrong — neither statement is the main conclusion. Eliminate.',
          '(C) is wrong — the first is neutral background, not advocacy for one side. Eliminate.',
          '(D) is wrong — they serve different functions. Eliminate.',
          '(E) is wrong — the first isn\'t disputed. Eliminate.',
          'Correct answer: (B) — The first provides background (3% of emissions), and the second (pollution data) counters the industry\'s efficiency claim.'
        ],
        difficulty: 'Hard',
      },
    ],
    methods: [
      {
        name: 'Structural Diagram Pre-Reading',
        when_to_use: 'Before reading Boldface answer choices, pre-label every sentence in the stimulus',
        steps: [
          'Read stimulus and label each sentence: BG (background), P (premise), SP (sub-conclusion), C (main conclusion), CP (counter-premise), E (evidence for conclusion)',
          'Then check which labels match the bolded statements',
          'Eliminate answer choices that mislabel either bolded statement',
          'Confirm: does the correct answer accurately describe BOTH bolded roles?'
        ],
        tip: 'Never read the answer choices before pre-labeling. Students who read answers first get led astray.',
      },
      {
        name: 'Paradox Resolution Framework',
        when_to_use: 'When asked to resolve an apparent contradiction between two facts',
        steps: [
          "Restate both facts clearly: 'Fact 1: X. Fact 2: Y. These seem contradictory because...'",
          'The correct answer must make BOTH facts true simultaneously',
          'Wrong answers often make only one fact true',
          'Wrong answers often introduce new contradictions',
          "Ask: 'If this answer is true, can I understand why BOTH facts coexist?'"
        ],
        tip: 'The answer never denies either fact. It explains HOW they can both be true.',
      },
    ],
  },

  'CR — Inference & Complete the Passage': {
    questions: [
      {
        subtype: 'Complete the Passage: Bridge/Assumption Blank',
        q_text: `Organic farming methods avoid synthetic pesticides, relying instead on natural pest control techniques. While organic produce typically costs more to grow, many consumers are willing to pay premium prices for it. This willingness persists because ____________, and so organic farmers can sustain higher production costs without sacrificing profitability.

Which of the following most logically completes the argument?

(A) organic farming is better for the environment than conventional farming
(B) the price premium that consumers pay for organic produce exceeds the additional cost of organic production methods
(C) many consumers believe that organic produce is healthier than conventionally grown produce
(D) organic farming methods have improved significantly over the past decade
(E) some conventional farmers are beginning to adopt organic practices`,
        question_type: 'CR',
        signals: '"Most logically completes the argument" — complete the passage, mid-argument blank (assumption/bridge).',
        trap: 'Choosing (A) or (C) — these explain WHY consumers pay more but don\'t connect to the conclusion about profitability. The blank needs to BRIDGE willingness to pay → sustained profitability.',
        method: 'Complete the Passage: Role Identification',
        steps: [
          'The blank sits between "willingness to pay premium" and "can sustain higher costs without sacrificing profitability."',
          'Need: something that connects consumer willingness to pay MORE with covering production costs.',
          '(A) explains consumer motivation but doesn\'t connect to profitability. Eliminate.',
          '(B) directly bridges: premium > additional cost → profitability sustained.',
          '(C) explains why consumers buy organic but not why profitability is maintained. Eliminate.',
          '(D) is about farming improvement, not the price-cost relationship. Eliminate.',
          '(E) is irrelevant to organic farm profitability. Eliminate.',
          'Correct answer: (B) — The price premium exceeding additional costs is the missing bridge between consumer willingness and farmer profitability.'
        ],
        difficulty: 'Medium',
      },
      {
        subtype: 'Inference: Must-Be-True from Conditional',
        q_text: `At Northfield Corporation, all employees who work in the research division have advanced degrees. No employee with an advanced degree is eligible for the company's tuition reimbursement program. Martinez works in the research division at Northfield Corporation.

If the statements above are true, which of the following must also be true?

(A) Martinez has a doctoral degree.
(B) Martinez is not eligible for the tuition reimbursement program.
(C) All Northfield employees with advanced degrees work in the research division.
(D) Martinez chose to work in research because of the advanced degree requirement.
(E) No one in the research division has ever used the tuition reimbursement program.`,
        question_type: 'CR',
        signals: '"Must also be true" — formal deduction from conditional statements.',
        trap: 'Choosing (A) — "advanced degree" doesn\'t mean doctoral specifically. Choosing (C) — confuses "all research → advanced" with "all advanced → research" (converse error).',
        method: 'Formal Logic Deduction',
        steps: [
          'Premise 1: Research division → advanced degree.',
          'Premise 2: Advanced degree → NOT eligible for tuition reimbursement.',
          'Premise 3: Martinez is in research division.',
          'Chain: Martinez in research → has advanced degree → not eligible for reimbursement.',
          '(A) goes too far — advanced degree ≠ doctoral degree specifically. Eliminate.',
          '(B) follows from the chain: research → advanced degree → not eligible. Must be true.',
          '(C) commits the converse error: all research → advanced ≠ all advanced → research. Eliminate.',
          '(D) introduces motivation, which is not stated anywhere. Eliminate.',
          '(E) says "no one has ever" — too absolute; past usage isn\'t addressed. Eliminate.',
          'Correct answer: (B) — By the logical chain, Martinez must have an advanced degree and therefore cannot be eligible for tuition reimbursement.'
        ],
        difficulty: 'Medium',
      },
      {
        subtype: 'Inference: Cannot-Be-Inferred — Process of Elimination',
        q_text: `A museum's annual report states that attendance increased by 12% this year. The museum added three new permanent exhibits and extended weekend hours by two hours. Ticket prices remained unchanged, and the museum's marketing budget was reduced by 20% compared to the previous year.

Each of the following can be properly inferred from the statements above EXCEPT:

(A) The museum's attendance increase occurred despite reduced marketing spending.
(B) Ticket price increases were not a factor in the museum's attendance change.
(C) The museum made operational changes during the year described in the report.
(D) The new exhibits and extended hours were the primary causes of the attendance increase.
(E) The museum's weekend operating hours this year are longer than they were the previous year.`,
        question_type: 'CR',
        signals: '"Can be properly inferred EXCEPT" — find the one that CANNOT be inferred.',
        trap: 'Not checking each answer carefully against the text. (D) assumes causation that isn\'t stated.',
        method: 'Inference Eliminator',
        steps: [
          '(A) CAN be inferred — attendance up 12% while marketing budget down 20%. Both directly stated.',
          '(B) CAN be inferred — "ticket prices remained unchanged" directly states this.',
          '(C) CAN be inferred — new exhibits and extended hours are operational changes.',
          '(D) CANNOT be inferred — the passage lists changes and attendance increase but never claims the changes CAUSED the increase.',
          '(E) CAN be inferred — "extended weekend hours by two hours" means they\'re longer than before.',
          'Correct answer: (D) — The passage describes correlation between changes and attendance, but does not establish that the exhibits and hours were the PRIMARY causes.'
        ],
        difficulty: 'Medium',
      },
      {
        subtype: 'Complete: Sub-Conclusion Blank',
        q_text: `Electric vehicle sales have tripled in the past five years, and charging infrastructure has expanded accordingly. However, most new charging stations are concentrated in urban areas, while rural regions remain underserved. Since long-distance travel requires reliable charging access along highways, ____________. Consequently, automakers targeting rural consumers should prioritize developing vehicles with significantly longer battery ranges.

Which of the following most logically completes the argument?

(A) electric vehicle adoption in rural areas will likely remain limited until highway charging networks expand
(B) urban consumers are more likely to purchase electric vehicles than rural consumers
(C) the government should subsidize the construction of rural charging stations
(D) electric vehicles are not yet practical for most American drivers
(E) battery technology has not advanced quickly enough to meet consumer demand`,
        question_type: 'CR',
        signals: '"Most logically completes" — the blank is a sub-conclusion between evidence and the main conclusion.',
        trap: 'Choosing (C) — a policy recommendation doesn\'t lead logically to the automaker conclusion. Choosing (B) — it\'s a restatement, not a bridge.',
        method: 'Complete the Passage: Role Identification',
        steps: [
          'Evidence: rural areas lack charging. Long-distance travel needs charging access.',
          'Blank = sub-conclusion that connects to: "automakers should develop longer-range vehicles for rural consumers."',
          'Need: rural EV adoption is limited by charging gaps → so longer range is the solution.',
          '(A) bridges perfectly: rural adoption limited by charging gaps → longer range compensates.',
          '(B) is a restatement, not a logical bridge to the automaker recommendation. Eliminate.',
          '(C) is a policy recommendation about government, not about automakers. Eliminate.',
          '(D) is too broad — overgeneralizes beyond rural areas. Eliminate.',
          '(E) is about technology broadly, not the specific rural-urban gap. Eliminate.',
          'Correct answer: (A) — It serves as the sub-conclusion: limited rural adoption due to charging gaps leads to the recommendation for longer-range vehicles.'
        ],
        difficulty: 'Hard',
      },
    ],
    methods: [
      {
        name: 'Formal Logic Deduction',
        when_to_use: 'When the stimulus contains conditional statements (if/then, all/none/some)',
        steps: [
          'Identify all conditional statements: If A → B',
          'Identify what IS given as true',
          'Apply modus ponens: A is true + A→B → B is true',
          'Apply contrapositive: not B is true + A→B → not A is true',
          'Combine inferences: A→B and B→C → A→C'
        ],
        tip: "Never infer the inverse (not A → not B) or converse (B → A) — those are classic GMAT traps.",
      },
      {
        name: 'Must vs. Could Distinction',
        when_to_use: 'When evaluating inference answers to determine if they MUST be true or merely COULD be true',
        steps: [
          "For each answer choice, ask: 'Is there any scenario where the premises are true BUT this answer is false?'",
          'If yes → it is NOT a must-be-true inference',
          'If no scenario can falsify it → it must be true',
          'Beware of answers that are merely probable or likely',
          'The correct inference is often more conservative and narrower than it seems'
        ],
        tip: "'Most' does not mean 'all.' 'Some' can mean just one. Be precise about quantifiers.",
      },
    ],
  },

  'CR — Evaluate & Boldface': {
    questions: [
      {
        subtype: 'Evaluate: Plan Effectiveness',
        q_text: `To address declining bee populations, which threaten agricultural crop yields, a county government plans to ban the use of neonicotinoid pesticides on all farmland within the county. Officials expect that within three years, local bee populations will recover to levels sufficient to support current agricultural output.

Which of the following would be most useful to know in evaluating the officials' expectation?

(A) Whether neonicotinoid pesticides are more expensive than alternative pesticides
(B) Whether bee populations in the county have declined primarily due to neonicotinoid exposure or due to other factors such as habitat loss
(C) Whether the county's agricultural output has declined in recent years
(D) Whether other counties have considered similar bans on neonicotinoid pesticides
(E) Whether farmers in the county are aware of the proposed ban`,
        question_type: 'CR',
        signals: '"Most useful to know in evaluating" — evaluate question about a plan.',
        trap: 'Choosing (A) or (E), which are about implementation, not whether the plan will achieve its GOAL (bee recovery).',
        method: 'Evaluate Plan vs. Argument',
        steps: [
          'Plan: ban neonicotinoids → bee recovery → support crop yields.',
          'Key assumption: neonicotinoids are the main cause of bee decline.',
          '(A) is about cost — doesn\'t help evaluate whether bees will recover. Eliminate.',
          '(B) is two-directional: if neonicotinoids are the main cause → plan likely works; if habitat loss is the main cause → plan likely fails.',
          '(C) is about past output, not future bee recovery. Eliminate.',
          '(D) is about other counties\' considerations, not this plan\'s effectiveness. Eliminate.',
          '(E) is about awareness, not about whether the ban will restore bees. Eliminate.',
          'Correct answer: (B) — Knowing the primary cause of bee decline directly determines whether eliminating neonicotinoids will achieve the desired recovery.'
        ],
        difficulty: 'Medium',
      },
      {
        subtype: 'Boldface: Three-Role Argument (Background + Counter + Conclusion)',
        q_text: `**Global average temperatures have risen 1.1°C since pre-industrial times.** Some climate scientists argue that current international emission reduction pledges are insufficient to limit warming to 1.5°C. **Critics point out that technological improvements in renewable energy have consistently exceeded expert projections over the past decade.** Nevertheless, recent atmospheric CO2 measurements show that emissions continue to rise despite renewable energy growth, suggesting that **pledges must be strengthened significantly to meet the 1.5°C target.**

In the argument above, the three bolded portions play which of the following roles?

(A) The first is the main conclusion; the second and third provide supporting evidence.
(B) The first provides background; the second offers a counter-position; the third is the main conclusion.
(C) The first is evidence; the second is the main conclusion; the third is supporting evidence.
(D) The first and second are premises that jointly support the third as the conclusion.
(E) The first is a counter-premise; the second provides background; the third is an intermediate conclusion.`,
        question_type: 'CR',
        signals: '"The three bolded portions play which of the following roles" — three-role boldface.',
        trap: 'Choosing (D) — the first and second don\'t jointly support the third; the second actually OPPOSES the conclusion.',
        method: 'Structural Diagram Pre-Reading',
        steps: [
          'Bold 1: "temperatures have risen 1.1°C" — factual background information.',
          'Bold 2: "technological improvements exceeded projections" — this is the CRITICS\' counter-argument (counter-premise).',
          'Bold 3: "pledges must be strengthened" — this is the main conclusion, introduced after "suggesting that."',
          '(A) is wrong — Bold 1 is background, not the conclusion. Eliminate.',
          '(C) is wrong — Bold 2 is a counter-position, not the conclusion. Eliminate.',
          '(D) is wrong — Bold 2 opposes the conclusion rather than supporting it. Eliminate.',
          '(E) is wrong — Bold 1 is background (not counter), and Bold 2 is counter (not background). Eliminate.',
          'Correct answer: (B) — Background (1.1°C rise), counter-position (tech exceeded projections), main conclusion (pledges must be strengthened).'
        ],
        difficulty: 'Hard',
      },
      {
        subtype: 'Evaluate: Statistical/Sample Validity',
        q_text: `A pharmaceutical company conducted a clinical trial of a new allergy medication involving 300 adult volunteers. After eight weeks, 72% of participants reported significant improvement in their allergy symptoms. The company concluded that the medication is effective for the general adult population suffering from allergies.

Which of the following would be most important to know in evaluating the company's conclusion?

(A) Whether the 300 volunteers were representative of the general population of allergy sufferers in terms of age, severity, and allergy type
(B) Whether the company has successfully developed other allergy medications in the past
(C) Whether allergy sufferers prefer taking medication in pill form versus liquid form
(D) How the cost of the new medication compares to existing allergy treatments
(E) Whether the company plans to conduct additional trials in the future`,
        question_type: 'CR',
        signals: '"Most important to know in evaluating" — evaluate statistical validity.',
        trap: 'Choosing (B) or (E), which are about the company rather than the study\'s validity. The key issue is sample representativeness.',
        method: 'Impact Direction Test',
        steps: [
          'The conclusion generalizes from 300 volunteers to the general adult population.',
          '(A) test both ways: if representative → conclusion supported; if NOT representative → conclusion undermined. Two-directional.',
          '(B) past success doesn\'t validate THIS study. Eliminate.',
          '(C) is about delivery preference, not effectiveness. Eliminate.',
          '(D) is about cost, not whether the drug works. Eliminate.',
          '(E) is about future plans, not current conclusion validity. Eliminate.',
          'Correct answer: (A) — Sample representativeness is the key factor: if the volunteers match the general population, the conclusion holds; if not, it fails.'
        ],
        difficulty: 'Medium',
      },
      {
        subtype: 'Evaluate: Analogical Reasoning Validity',
        q_text: `A city transportation planner noted that City X reduced traffic fatalities by 40% after lowering its speed limit on residential streets from 30 mph to 20 mph. The planner recommended that City Y adopt the same speed limit reduction, predicting a similar decrease in traffic fatalities.

Which of the following would be most useful to know in evaluating the planner's prediction?

(A) Whether City Y's residents would support a speed limit reduction
(B) Whether the road layouts, traffic volumes, and driver demographics in City Y are comparable to those in City X
(C) Whether City X's fatality reduction has been sustained over multiple years
(D) Whether speed limit reductions have been proposed in City Y before
(E) Whether City Y has a higher overall population than City X`,
        question_type: 'CR',
        signals: '"Most useful to know in evaluating" — evaluate an analogy between two cities.',
        trap: 'Choosing (A) or (E). (A) is about adoption/politics, not whether the analogy holds. (E) is too narrow — total population alone doesn\'t determine comparability.',
        method: 'Impact Direction Test',
        steps: [
          'The argument uses an analogy: what worked in City X will work in City Y.',
          'Key assumption: the two cities are similar enough for the analogy to hold.',
          '(A) is about political feasibility, not whether the prediction is accurate. Eliminate.',
          '(B) is two-directional: if comparable → prediction supported; if not comparable → prediction undermined.',
          '(C) is about City X\'s long-term results, not the cross-city comparison. Eliminate.',
          '(D) is about past proposals, not the analogy\'s validity. Eliminate.',
          '(E) is one factor but too narrow to be the most useful. Eliminate.',
          'Correct answer: (B) — The validity of the analogy depends on whether the two cities are similar in the factors that affect traffic fatalities.'
        ],
        difficulty: 'Medium',
      },
    ],
    methods: [
      {
        name: 'Evaluate Plan vs. Argument',
        when_to_use: 'When the stimulus is a proposal or plan rather than a descriptive argument',
        steps: [
          'For plans: the key factors are usually feasibility, adoption, mechanism, and cost-benefit',
          "Frame the evaluate question as: 'Would knowing X help me judge whether this plan will work?'",
          'Test each answer both ways: if X is high AND if X is low',
          'The correct answer changes your assessment in BOTH directions',
          "Eliminate answers that are irrelevant to the plan's success"
        ],
        tip: "Plan evaluate questions often have an answer about whether the target audience will actually use or adopt the plan.",
      },
      {
        name: 'Impact Direction Test',
        when_to_use: "For any Evaluate question — confirming the answer is truly two-directional",
        steps: [
          'Take the answer and ask: if this is YES/HIGH, does it strengthen the argument?',
          'Then ask: if this is NO/LOW, does it weaken the argument?',
          'If BOTH are true: this is a valid evaluate answer',
          'If only one direction matters: eliminate — this is a one-way factor',
          'The correct evaluate answer ALWAYS passes both directions'
        ],
        tip: 'This test catches wrong answers that only go one way. Run it on every candidate.',
      },
    ],
  },
};

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  await c.connect();
  console.log('Connected to Supabase.\n');

  // 1. Get topic IDs
  const { rows: topics } = await c.query(`
    SELECT t.id, t.title FROM topics t
    JOIN sections s ON t.section_id = s.id
    WHERE s.slug = 'verbal'
    ORDER BY t.order_idx
  `);
  console.log('Verbal topics found:', topics.map(t => `${t.id}: ${t.title}`).join(', '));

  const topicMap = {};
  for (const t of topics) topicMap[t.title] = t.id;

  let totalQ = 0, totalM = 0;

  for (const [title, data] of Object.entries(topicData)) {
    const topicId = topicMap[title];
    if (!topicId) {
      console.log(`  ⚠ Topic "${title}" not found in DB — skipping.`);
      continue;
    }
    console.log(`\n── ${title} (id=${topicId}) ──`);

    // Insert questions
    if (data.questions) {
      for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];
        await c.query(
          `INSERT INTO questions (topic_id, subtype, q_text, question_type, signals, trap, method, steps, difficulty, order_idx)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [topicId, q.subtype, q.q_text, q.question_type, q.signals, q.trap, q.method, JSON.stringify(q.steps), q.difficulty, 3 + i]
        );
        console.log(`  + Q: ${q.subtype}`);
        totalQ++;
      }
    }

    // Insert methods
    if (data.methods) {
      for (let i = 0; i < data.methods.length; i++) {
        const m = data.methods[i];
        await c.query(
          `INSERT INTO methods (topic_id, name, when_to_use, steps, tip, order_idx)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [topicId, m.name, m.when_to_use, JSON.stringify(m.steps), m.tip, 3 + i]
        );
        console.log(`  + M: ${m.name}`);
        totalM++;
      }
    }
  }

  console.log(`\n✓ Done — inserted ${totalQ} questions and ${totalM} methods.`);
  await c.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
