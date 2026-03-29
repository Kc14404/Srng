/**
 * Full taxonomy audit — maps every question to its type, 
 * identifies gaps per topic against the expected complete taxonomy.
 */
const { Client } = require('../node_modules/pg');
const client = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// ─── Expected taxonomy per topic ──────────────────────────────────────────────

const MATH_EXPECTED_TYPES = [
  'PS-Computation',       // direct calculation, apply formula
  'PS-Conceptual',        // understand property without computing
  'PS-WordProblem',       // applied real-world scenario
  'PS-Hard',              // multi-step, requires insight
  'PS-Trap',              // common error / misconception
  'DS-Value',             // find a unique numeric value
  'DS-YesNo',             // determine yes or no
  'DS-HardTrap',          // C-trap, E-trap, or boundary value
  'Comparison',           // which is greater / estimation
];

const CR_EXPECTED_TYPES = [
  'ArgumentStructure',    // identify conclusion, premises, sub-conclusion, roles
  'CausalAssumption',     // necessary assumption for causal arguments
  'SufficientAssumption', // sufficient assumption / formal logic
  'Weaken-AltCause',      // weaken via alternative explanation
  'Weaken-Sample',        // weaken via unrepresentative sample
  'Weaken-Plan',          // weaken a proposal/plan
  'Weaken-Scope',         // weaken via scope overreach
  'Strengthen-Bridge',    // strengthen by bridging evidence to conclusion
  'Strengthen-RuleOut',   // strengthen by ruling out alternatives
  'Inference-MustBeTrue', // must be true from stated facts
  'Inference-ScopeTrap',  // scope error / cannot be inferred trap
  'Paradox',              // resolve apparent contradiction
  'Boldface-Roles',       // identify roles of bolded statements
  'Evaluate',             // what would help assess the argument
  'CompletePassage',      // complete the blank in mid-argument
];

const RC_EXPECTED_TYPES = [
  'MainIdea',             // central argument of entire passage
  'PrimaryPurpose',       // why the author wrote this
  'ExplicitDetail',       // locate directly stated fact
  'Inference',            // must be supported by passage text
  'FunctionPurpose',      // why author included this paragraph/example
  'AuthorTone',           // author's attitude/tone
  'Application',          // apply author's principle to new scenario
  'ExceptNot',            // four answers ARE true, find one that isn't
  'Analogy',              // find parallel scenario
  'Attribution',          // which view belongs to which party
];

const DI_DS_EXPECTED_TYPES = [
  'DS-Value-Basic',
  'DS-Value-Algebraic',
  'DS-YesNo-Basic',
  'DS-YesNo-Divisibility',
  'DS-YesNo-Inequality',
  'DS-Trap-CTrap',
  'DS-Trap-ETrap',
  'DS-Trap-Boundary',
  'DS-Trap-Integer',
];

const DI_DATA_EXPECTED_TYPES = {
  'Multi-Source Reasoning': ['SingleLookup', 'CrossTabCalc', 'CrossTabSynthesis', 'CannotDetermine', 'Contradiction', 'InferenceFromPolicy', 'NumericalCalc'],
  'Table Analysis': ['SortIdentify', 'FilterCount', 'FilterCalculate', 'CategoryAggregate', 'RankComparison', 'TrueFalse-MultiCondition'],
  'Graphics Interpretation': ['ReadValue', 'CalculateChange', 'CompareItems', 'InterpretTrend', 'PercentVsAbsolute', 'MultiGraphSynth'],
  'Two-Part Analysis': ['LogicTPA', 'VerbalTPA', 'ScenarioTPA', 'StrategyTPA'],
  'Two-Part Analysis — Logic & Verbal Type': ['LogicTPA', 'VerbalTPA', 'ScenarioTPA'],
  'Complex Data Interpretation': ['DualAxis', 'ScatterPlot', 'Histogram', 'BubbleChart', 'StackedBar', 'MultiGraphSynth'],
};

// ─── Main audit ────────────────────────────────────────────────────────────────

client.connect().then(async () => {
  const sections = await client.query(`SELECT id, slug, title FROM sections ORDER BY order_idx`);

  for (const section of sections.rows) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`SECTION: ${section.title} (${section.slug})`);
    console.log(`${'='.repeat(70)}`);

    const topics = await client.query(
      `SELECT id, title FROM topics WHERE section_id = $1 ORDER BY order_idx`,
      [section.id]
    );

    for (const topic of topics.rows) {
      const methods = await client.query(
        `SELECT name FROM methods WHERE topic_id = $1 ORDER BY order_idx`,
        [topic.id]
      );
      const questions = await client.query(
        `SELECT subtype, question_type, difficulty FROM questions WHERE topic_id = $1 ORDER BY order_idx`,
        [topic.id]
      );

      console.log(`\n  ── ${topic.title} ──`);
      console.log(`  Methods (${methods.rows.length}): ${methods.rows.map(m => m.name).join(' | ')}`);
      console.log(`  Questions (${questions.rows.length}):`);
      for (const q of questions.rows) {
        console.log(`    [${q.question_type}/${q.difficulty}] ${q.subtype}`);
      }

      // Gap analysis for math
      if (section.slug === 'math') {
        const qtypes = questions.rows.map(q => `${q.question_type}/${q.difficulty}`);
        const hasPS_Med = questions.rows.some(q => q.question_type === 'PS' && q.difficulty === 'Medium');
        const hasPS_Hard = questions.rows.some(q => q.question_type === 'PS' && q.difficulty === 'Hard');
        const hasDS_Med = questions.rows.some(q => q.question_type === 'DS' && q.difficulty === 'Medium');
        const hasDS_Hard = questions.rows.some(q => q.question_type === 'DS' && q.difficulty === 'Hard');
        const subtypes = questions.rows.map(q => (q.subtype || '').toLowerCase());
        const hasWordProblem = subtypes.some(s => s.includes('word') || s.includes('rate') || s.includes('mixture') || s.includes('work'));
        const hasTrap = subtypes.some(s => s.includes('trap') || s.includes('error') || s.includes('common') || s.includes('disguised') || s.includes('hidden'));
        const hasComparison = subtypes.some(s => s.includes('comparison') || s.includes('compare') || s.includes('greater') || s.includes('which'));
        const gaps = [];
        if (!hasPS_Med) gaps.push('MISSING: PS/Medium');
        if (!hasPS_Hard) gaps.push('MISSING: PS/Hard');
        if (!hasDS_Med) gaps.push('MISSING: DS/Medium');
        if (!hasDS_Hard) gaps.push('MISSING: DS/Hard');
        if (!hasWordProblem) gaps.push('MISSING: Word Problem variant');
        if (!hasTrap) gaps.push('MISSING: Trap/Common Error question');
        if (!hasComparison) gaps.push('MISSING: Comparison/Estimation question');
        if (gaps.length > 0) {
          console.log(`  ⚠️  GAPS: ${gaps.join(', ')}`);
        } else {
          console.log(`  ✅ Basic type coverage OK`);
        }
      }

      // Gap analysis for verbal
      if (section.slug === 'verbal') {
        const isCR = topic.title.toLowerCase().includes('cr') || topic.title.toLowerCase().includes('argument');
        const isRC = topic.title.toLowerCase().includes('rc');
        const subtypes = questions.rows.map(q => (q.subtype || '').toLowerCase());
        
        if (isCR) {
          const gaps = [];
          // Check for key CR types based on the topic
          const title = topic.title.toLowerCase();
          if (title.includes('argument structure')) {
            if (!subtypes.some(s => s.includes('conclusion') || s.includes('sub-conclusion') || s.includes('claim'))) gaps.push('MISSING: Conclusion identification');
            if (!subtypes.some(s => s.includes('circular') || s.includes('flaw') || s.includes('correlation'))) gaps.push('MISSING: Flaw identification');
            if (!subtypes.some(s => s.includes('boldface') || s.includes('counter') || s.includes('role'))) gaps.push('MISSING: Role identification');
          }
          if (title.includes('weaken')) {
            if (!subtypes.some(s => s.includes('alternative') || s.includes('cause'))) gaps.push('MISSING: Alternative cause weaken');
            if (!subtypes.some(s => s.includes('sample') || s.includes('representative'))) gaps.push('MISSING: Sample weaken');
            if (!subtypes.some(s => s.includes('plan') || s.includes('implementation') || s.includes('feasibility'))) gaps.push('MISSING: Plan weaken');
            if (!subtypes.some(s => s.includes('scope') || s.includes('analogy'))) gaps.push('MISSING: Scope/Analogy weaken');
          }
          if (title.includes('strengthen') || title.includes('assumption')) {
            if (!subtypes.some(s => s.includes('negation') || s.includes('necessary'))) gaps.push('MISSING: Necessary assumption');
            if (!subtypes.some(s => s.includes('sufficient') || s.includes('categorical'))) gaps.push('MISSING: Sufficient assumption');
            if (!subtypes.some(s => s.includes('bridge') || s.includes('gap'))) gaps.push('MISSING: Strengthen bridge');
            if (!subtypes.some(s => s.includes('rule out') || s.includes('alternative') || s.includes('cause'))) gaps.push('MISSING: Rule out alternatives strengthen');
          }
          if (title.includes('other') || title.includes('inference') || title.includes('evaluate') || title.includes('boldface')) {
            if (!subtypes.some(s => s.includes('inference') || s.includes('must'))) gaps.push('MISSING: Inference/Must-Be-True');
            if (!subtypes.some(s => s.includes('paradox') || s.includes('discrepancy') || s.includes('resolve'))) gaps.push('MISSING: Paradox');
            if (!subtypes.some(s => s.includes('boldface'))) gaps.push('MISSING: Boldface');
            if (!subtypes.some(s => s.includes('evaluate'))) gaps.push('MISSING: Evaluate');
          }
          if (gaps.length > 0) {
            console.log(`  ⚠️  GAPS: ${gaps.join(', ')}`);
          } else {
            console.log(`  ✅ CR type coverage OK`);
          }
        }

        if (isRC) {
          const gaps = [];
          const subtypesStr = subtypes.join(' ');
          if (!subtypesStr.match(/main idea|primary purpose/)) gaps.push('MISSING: Main Idea/Primary Purpose');
          if (!subtypesStr.match(/detail|explicit|stated/)) gaps.push('MISSING: Explicit Detail');
          if (!subtypesStr.match(/inference|must|supported/)) gaps.push('MISSING: Inference');
          if (!subtypesStr.match(/function|purpose|why|role|paragraph/)) gaps.push('MISSING: Function/Purpose');
          if (!subtypesStr.match(/tone|attitude|author/)) gaps.push('MISSING: Author Tone/Attitude');
          if (!subtypesStr.match(/application|analogy|principle|predict|extend/)) gaps.push('MISSING: Application/Analogy');
          if (gaps.length > 0) {
            console.log(`  ⚠️  GAPS: ${gaps.join(', ')}`);
          } else {
            console.log(`  ✅ RC type coverage OK`);
          }
        }
      }

      // Gap analysis for DI
      if (section.slug === 'di') {
        const subtypes = questions.rows.map(q => (q.subtype || '').toLowerCase());
        const title = topic.title;
        const gaps = [];

        if (title.includes('DS Framework') || title.includes('DS Advanced')) {
          if (!subtypes.some(s => s.includes('value'))) gaps.push('MISSING: DS Value question');
          if (!subtypes.some(s => s.includes('yes') || s.includes('no') || s.includes('divisib') || s.includes('even') || s.includes('odd'))) gaps.push('MISSING: DS Yes/No question');
          if (!subtypes.some(s => s.includes('trap') || s.includes('c-trap') || s.includes('e-trap') || s.includes('boundary') || s.includes('integer'))) gaps.push('MISSING: DS Trap question');
          if (!subtypes.some(s => s.includes('algebraic') || s.includes('system') || s.includes('equation'))) gaps.push('MISSING: DS Algebraic question');
        }

        if (title.includes('Multi-Source')) {
          if (!subtypes.some(s => s.includes('lookup'))) gaps.push('MISSING: Single-tab lookup');
          if (!subtypes.some(s => s.includes('cross') || s.includes('calculation'))) gaps.push('MISSING: Cross-tab calculation');
          if (!subtypes.some(s => s.includes('cannot') || s.includes('determine'))) gaps.push('MISSING: Cannot-determine question');
          if (!subtypes.some(s => s.includes('contradiction'))) gaps.push('MISSING: Contradiction detection');
          if (!subtypes.some(s => s.includes('inference') || s.includes('policy'))) gaps.push('MISSING: Inference question');
        }

        if (title.includes('Table')) {
          if (!subtypes.some(s => s.includes('sort'))) gaps.push('MISSING: Sort question');
          if (!subtypes.some(s => s.includes('filter'))) gaps.push('MISSING: Filter question');
          if (!subtypes.some(s => s.includes('true') || s.includes('false'))) gaps.push('MISSING: True/False question');
          if (!subtypes.some(s => s.includes('rank') || s.includes('aggregate') || s.includes('average') || s.includes('category'))) gaps.push('MISSING: Rank/Aggregate question');
        }

        if (title.includes('Graphics')) {
          if (!subtypes.some(s => s.includes('read') || s.includes('value') || s.includes('identify'))) gaps.push('MISSING: Read value question');
          if (!subtypes.some(s => s.includes('trend') || s.includes('change'))) gaps.push('MISSING: Trend/Change question');
          if (!subtypes.some(s => s.includes('compare') || s.includes('ratio'))) gaps.push('MISSING: Comparison question');
          if (!subtypes.some(s => s.includes('percent') || s.includes('absolute'))) gaps.push('MISSING: Percent vs Absolute question');
        }

        if (title.includes('Two-Part')) {
          if (!subtypes.some(s => s.includes('logic'))) gaps.push('MISSING: Logic TPA');
          if (!subtypes.some(s => s.includes('verbal') || s.includes('role'))) gaps.push('MISSING: Verbal TPA');
          if (!subtypes.some(s => s.includes('scenario') || s.includes('strategy') || s.includes('action'))) gaps.push('MISSING: Scenario/Strategy TPA');
          if (!subtypes.some(s => s.includes('assumption') || s.includes('strengthen'))) gaps.push('MISSING: Assumption/Strengthen TPA');
        }

        if (gaps.length > 0) {
          console.log(`  ⚠️  GAPS: ${gaps.join(', ')}`);
        } else {
          console.log(`  ✅ DI type coverage OK`);
        }
      }
    }
  }

  await client.end();
});
