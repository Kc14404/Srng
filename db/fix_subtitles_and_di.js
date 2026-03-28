const { Client } = require('../node_modules/pg');
const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await c.connect();

  // ── 1. ADD SUBTITLES TO ALL ORIGINAL TOPICS ──────────────────────────────
  const subtitles = [
    // Math
    ['Fractions & Operations',       'Simplifying, comparing, and operating on fractions, decimals, and mixed numbers'],
    ['Linear & Quadratic Equations',  'Solving equations, factoring, the quadratic formula, and systems of equations'],
    ['Number Properties',             'Integers, odd/even, positive/negative, consecutive integers, and prime numbers'],
    ['Divisibility Rules',            'Divisibility tests, remainders, trailing zeros, and terminating decimals'],
    ['Factors, Multiples, LCM & GCF', 'Prime factorization, factor counting, GCF, LCM, and real-world applications'],
    ['Roots & Radicals',              'Simplifying radicals, radical arithmetic, rationalizing, and solving radical equations'],
    ['Exponents',                     'Exponent rules, units digit patterns, exponential equations, and scientific notation'],
    ['PEMDAS',                        'Order of operations, distributing negatives, and simplifying algebraic expressions'],
    // Verbal
    ['Argument Structure',            'Identifying conclusions, premises, and assumptions in CR arguments'],
    ['CR — Weaken',                   'Finding evidence that undermines the argument\'s causal or logical link'],
    ['CR — Strengthen & Assumption',  'Supporting the conclusion and identifying the unstated bridge premise'],
    ['CR — Other Types',              'Inference, paradox, evaluate, and fill-in-the-blank CR question types'],
    ['RC — Strategy',                 'Active reading, passage mapping, and time management for RC passages'],
    ['RC — Question Types',           'Main idea, detail, inference, function, and tone question strategies'],
    // DI
    ['DS Framework',                  'The 5-answer format, sufficiency vs value questions, and the AD/BCE decision tree'],
    ['DS Advanced Traps',             'Hidden sufficiency, boundary values, integer constraints, and common DS traps'],
    ['Multi-Source Reasoning',        'Synthesizing data across multiple tabs — text, tables, and emails'],
    ['Table Analysis',                'Sorting and filtering spreadsheet data to evaluate true/false statements'],
    ['Graphics Interpretation',       'Interpreting line charts, bar graphs, and scatter plots with fill-in statements'],
    ['Two-Part Analysis',             'Selecting two answers that jointly satisfy quantitative or logical constraints'],
  ];

  let subFixed = 0;
  for (const [title, subtitle] of subtitles) {
    const r = await c.query('UPDATE topics SET subtitle = $1 WHERE title = $2 AND (subtitle IS NULL OR subtitle = \'\')', [subtitle, title]);
    if (r.rowCount > 0) { subFixed++; process.stdout.write('.'); }
  }
  console.log(`\n✅ Fixed subtitles: ${subFixed}/20`);

  // ── 2. EMBED DATA INTO MSR QUESTIONS ─────────────────────────────────────
  const msrData = `
<div class="tq-scenario">
  <p><strong>Scenario: Digital Marketing Campaign Analysis</strong></p>
  <p><strong>Tab 1 — Campaign Performance</strong></p>
  <table class="tq-data-table">
    <thead><tr><th>Campaign</th><th>Total Budget ($K)</th><th>Conversions</th></tr></thead>
    <tbody>
      <tr><td>Alpha</td><td>120</td><td>480</td></tr>
      <tr><td>Bravo</td><td>90</td><td>270</td></tr>
      <tr><td>Charlie</td><td>150</td><td>750</td></tr>
    </tbody>
  </table>
  <p><strong>Tab 2 — Regional Budget Split (%)</strong></p>
  <table class="tq-data-table">
    <thead><tr><th>Campaign</th><th>North</th><th>South</th><th>East</th></tr></thead>
    <tbody>
      <tr><td>Alpha</td><td>40%</td><td>35%</td><td>25%</td></tr>
      <tr><td>Bravo</td><td>50%</td><td>30%</td><td>20%</td></tr>
      <tr><td>Charlie</td><td>30%</td><td>40%</td><td>30%</td></tr>
    </tbody>
  </table>
  <p><em>Note: Tab 2 shows how each campaign's budget was split across regions. Conversion data by region is not available.</em></p>
</div>`;

  await c.query(`UPDATE questions SET q_text = $1 || '\n\n' || q_text WHERE id = 49`,
    [msrData + '\n\n**Question 1 of 3:** Based on Tab 1, which campaign had the lowest cost per conversion?\n\n(A) Alpha  (B) Bravo  (C) Charlie  (D) All three were equal  (E) Cannot be determined from the given data']);
  await c.query(`UPDATE questions SET q_text = $1 || '\n\n' || q_text WHERE id = 50`,
    [msrData + '\n\n**Question 2 of 3:** Based on both tabs, which region received the highest total budget allocation across all three campaigns?\n\n(A) North  (B) South  (C) East  (D) North and South were tied  (E) Cannot be determined']);
  await c.query(`UPDATE questions SET q_text = $1 WHERE id = 51`,
    [msrData + '\n\n**Question 3 of 3:** What was Campaign Bravo\'s conversion count in the North region?\n\n(A) 135  (B) 108  (C) 54  (D) 270  (E) Cannot be determined from the given data']);

  // Fix MSR steps too
  await c.query(`UPDATE questions SET steps = $1, method = $2 WHERE id = 49`, [
    JSON.stringify(['From Tab 1: Alpha cost/conv = 120K/480 = $250; Bravo = 90K/270 = $333; Charlie = 150K/750 = $200', 'Charlie has lowest cost per conversion at $200', 'Answer: (C) Charlie']),
    'Calculate cost per conversion = Budget ÷ Conversions for each campaign from Tab 1.'
  ]);
  await c.query(`UPDATE questions SET steps = $1, method = $2 WHERE id = 50`, [
    JSON.stringify(['North: Alpha 40%×120=$48K + Bravo 50%×90=$45K + Charlie 30%×150=$45K = $138K', 'South: Alpha 35%×120=$42K + Bravo 30%×90=$27K + Charlie 40%×150=$60K = $129K', 'East: Alpha 25%×120=$30K + Bravo 20%×90=$18K + Charlie 30%×150=$45K = $93K', 'North received the most at $138K', 'Answer: (A) North']),
    'For each region: multiply each campaign\'s budget by its regional % from Tab 2, sum all three campaigns.'
  ]);
  await c.query(`UPDATE questions SET steps = $1, method = $2 WHERE id = 51`, [
    JSON.stringify(['Tab 2 shows how BUDGET is split by region — NOT conversions', 'There is no data on how conversions are distributed by region', 'Cannot apply the budget regional split to conversion counts without assuming uniform conversion rates', 'Answer: (E) Cannot be determined']),
    'Check what each tab actually provides. Tab 2 = budget split only. Conversion distribution by region is not given.'
  ]);

  console.log('✅ MSR questions updated with campaign data tables');

  // ── 3. EMBED DATA INTO TABLE ANALYSIS QUESTIONS ───────────────────────────
  const tableData = `
<div class="tq-scenario">
  <p><strong>Scenario: Product Sales & Ratings Dataset</strong></p>
  <p>The table below shows 8 products across two categories. Use sort and filter to answer each question.</p>
  <table class="tq-data-table">
    <thead><tr><th>Product</th><th>Category</th><th>Launch Year</th><th>Q1 Sales</th><th>Q2 Sales</th><th>Rating (/ 5.0)</th></tr></thead>
    <tbody>
      <tr><td>Apex</td><td>Electronics</td><td>2018</td><td>850</td><td>920</td><td>4.2</td></tr>
      <tr><td>Bolt</td><td>Electronics</td><td>2021</td><td>1,200</td><td>1,150</td><td>3.8</td></tr>
      <tr><td>Crest</td><td>Apparel</td><td>2019</td><td>430</td><td>510</td><td>4.5</td></tr>
      <tr><td>Dash</td><td>Apparel</td><td>2022</td><td>1,100</td><td>1,250</td><td>4.1</td></tr>
      <tr><td>Echo</td><td>Electronics</td><td>2017</td><td>760</td><td>800</td><td>3.9</td></tr>
      <tr><td>Flow</td><td>Apparel</td><td>2020</td><td>320</td><td>290</td><td>4.3</td></tr>
      <tr><td>Grid</td><td>Electronics</td><td>2023</td><td>1,500</td><td>1,680</td><td>4.2</td></tr>
      <tr><td>Halo</td><td>Apparel</td><td>2019</td><td>1,050</td><td>980</td><td>4.6</td></tr>
    </tbody>
  </table>
</div>`;

  const taQ = [
    [52, 'True or False: The product with the highest Q1 Sales also has a customer rating above 4.0.', 'Grid has the highest Q1 Sales (1,500). Grid\'s rating is 4.2, which is above 4.0.',
      JSON.stringify(['Sort by Q1 Sales descending → Grid is highest at 1,500', 'Grid\'s rating = 4.2', '4.2 > 4.0 → condition is met', 'Answer: TRUE'])],
    [53, 'True or False: More than half of the products launched before 2020 have higher Q2 Sales than Q1 Sales.', 'Filter Launch Year < 2020: Apex(✓ 920>850), Echo(✓ 800>760), Crest(✓ 510>430), Halo(✗ 980<1050). 3 out of 4 = 75% > 50%.',
      JSON.stringify(['Filter: Launch Year < 2020 → Apex(2018), Echo(2017), Crest(2019), Halo(2019) = 4 products', 'Check Q2 > Q1: Apex 920>850 ✓, Echo 800>760 ✓, Crest 510>430 ✓, Halo 980<1050 ✗', '3 out of 4 = 75% > 50%', 'Answer: TRUE'])],
    [54, 'True or False: The category with the highest average customer rating has at least 2 products with Q1 Sales above 1,000.', 'Apparel avg: (4.5+4.1+4.3+4.6)/4 = 4.375. Electronics avg: (4.2+3.8+3.9+4.2)/4 = 4.025. Apparel wins. Apparel Q1>1000: Dash(1,100) and Halo(1,050) = 2 products.',
      JSON.stringify(['Calc avg rating: Electronics=(4.2+3.8+3.9+4.2)/4=4.025; Apparel=(4.5+4.1+4.3+4.6)/4=4.375', 'Apparel has higher avg rating', 'Filter Apparel + Q1>1000: Dash(1,100) ✓, Halo(1,050) ✓ → 2 products', 'Answer: TRUE'])],
  ];
  for (const [id, q, method, steps] of taQ) {
    await c.query('UPDATE questions SET q_text = $1, method = $2, steps = $3 WHERE id = $4',
      [tableData + '\n\n**Statement:** ' + q, method, steps, id]);
  }
  console.log('✅ Table Analysis questions updated with product data table');

  // ── 4. EMBED DATA INTO GRAPHICS INTERPRETATION QUESTIONS ─────────────────
  const chartData = `
<div class="tq-scenario">
  <p><strong>Scenario: Annual Revenue Comparison</strong></p>
  <p>The line chart below shows annual revenue (in $M) for Company A and Company B from 2018 to 2023.</p>
  <table class="tq-data-table">
    <thead><tr><th>Year</th><th>Company A ($M)</th><th>Company B ($M)</th><th>B as % more than A</th></tr></thead>
    <tbody>
      <tr><td>2018</td><td>80</td><td>110</td><td>+37.5%</td></tr>
      <tr><td>2019</td><td>100</td><td>130</td><td>+30.0%</td></tr>
      <tr><td>2020</td><td>95</td><td>120</td><td>+26.3%</td></tr>
      <tr><td>2021</td><td>130</td><td>155</td><td>+19.2%</td></tr>
      <tr><td>2022</td><td>160</td><td>180</td><td>+12.5%</td></tr>
      <tr><td>2023</td><td>200</td><td>210</td><td>+5.0%</td></tr>
    </tbody>
  </table>
</div>`;

  const giUpdates = [
    [55, 'In which year did Company A show the greatest percentage increase in revenue compared to the previous year?\n\n(A) 2019  (B) 2020  (C) 2021  (D) 2022  (E) 2023',
      'Calculate % change for A each year: 2019: (100-80)/80=25%; 2020: (95-100)/100=−5%; 2021: (130-95)/95=36.8%; 2022: (160-130)/130=23.1%; 2023: (200-160)/160=25%. Greatest = 2021.',
      JSON.stringify(['2018→2019: (100-80)/80 = 25%', '2019→2020: (95-100)/100 = −5% (decline)', '2020→2021: (130-95)/95 = 36.8% ← greatest', '2021→2022: (160-130)/130 = 23.1%', '2022→2023: (200-160)/160 = 25%', 'Answer: (C) 2021'])],
    [56, 'For approximately how many years was Company B\'s revenue more than 20% greater than Company A\'s revenue?\n\n(A) 1 year  (B) 2 years  (C) 3 years  (D) 4 years  (E) 5 years',
      'Check the "B as % more than A" column: 2018=+37.5% ✓, 2019=+30.0% ✓, 2020=+26.3% ✓, 2021=+19.2% ✗. 3 years meet the >20% threshold.',
      JSON.stringify(['2018: B is 37.5% > A ✓', '2019: B is 30.0% > A ✓', '2020: B is 26.3% > A ✓', '2021: B is 19.2% > A — just under 20% ✗', '2022 & 2023: gap narrowed further ✗', 'Answer: (C) 3 years'])],
    [57, 'Between 2019 and 2023, Company A\'s revenue grew by approximately ___%, and Company B\'s revenue grew by approximately ___%. Select the answer that correctly fills both blanks.\n\n(A) A: 75%, B: 50%\n(B) A: 100%, B: 62%\n(C) A: 100%, B: 75%\n(D) A: 125%, B: 62%\n(E) A: 80%, B: 55%',
      'A: (200-100)/100=100%. B: (210-130)/130=80/130≈62%. Answer: (B).',
      JSON.stringify(['Company A: (200-100)/100 × 100 = 100% growth', 'Company B: (210-130)/130 × 100 = 80/130 ≈ 61.5% ≈ 62% growth', 'Match to answer: A=100%, B=62%', 'Answer: (B)'])],
  ];
  for (const [id, q, method, steps] of giUpdates) {
    await c.query('UPDATE questions SET q_text = $1, method = $2, steps = $3 WHERE id = $4',
      [chartData + '\n\n' + q, method, steps, id]);
  }
  console.log('✅ Graphics Interpretation questions updated with revenue chart data');

  // ── 5. REPLACE BRACKET DESCRIPTIONS IN COMPLEX DATA INTERPRETATION ────────
  const dualAxisData = `
<div class="tq-scenario">
  <p><strong>Scenario: Revenue & Headcount (Dual-Axis Chart)</strong></p>
  <p>The chart uses two Y-axes. <strong>Bars = Revenue (left axis, $M). Line = Employee count (right axis, thousands).</strong></p>
  <table class="tq-data-table">
    <thead><tr><th>Year</th><th>Revenue ($M) [Left axis]</th><th>Employees (000s) [Right axis]</th></tr></thead>
    <tbody>
      <tr><td>Year 1</td><td>45</td><td>8</td></tr>
      <tr><td>Year 2</td><td>50</td><td>9</td></tr>
      <tr><td>Year 3</td><td>52</td><td>12</td></tr>
      <tr><td>Year 4</td><td>70</td><td>13</td></tr>
      <tr><td>Year 5</td><td>90</td><td>15</td></tr>
    </tbody>
  </table>
  <p><em>⚠️ Trap: Do not compare bar heights to line heights — they use different scales.</em></p>
</div>`;

  await c.query('UPDATE questions SET q_text = $1, method = $2, steps = $3 WHERE id = 169', [
    dualAxisData + '\n\nIn which year was revenue per employee highest?\n\n(A) Year 1  (B) Year 2  (C) Year 3  (D) Year 4  (E) Year 5',
    'Calculate Revenue ÷ Employees for each year. Year 5: 90/15=6.0 is highest.',
    JSON.stringify(['Year 1: 45/8 = 5.63', 'Year 2: 50/9 = 5.56', 'Year 3: 52/12 = 4.33', 'Year 4: 70/13 = 5.38', 'Year 5: 90/15 = 6.00 ← highest', 'Answer: (E) Year 5'])
  ]);

  const scatterData = `
<div class="tq-scenario">
  <p><strong>Scenario: Advertising Spend vs. Sales Revenue (Scatter Plot)</strong></p>
  <p>Each point represents one company. The trend line slopes upward (positive correlation).</p>
  <table class="tq-data-table">
    <thead><tr><th>Company</th><th>Ad Spend ($K)</th><th>Sales ($M)</th><th>Note</th></tr></thead>
    <tbody>
      <tr><td>A</td><td>20</td><td>1.5</td><td></td></tr>
      <tr><td>B</td><td>30</td><td>2.2</td><td></td></tr>
      <tr><td>C</td><td>40</td><td>3.0</td><td></td></tr>
      <tr><td>D</td><td>50</td><td>3.5</td><td></td></tr>
      <tr><td>E</td><td>35</td><td>5.8</td><td>⬆ Far above trend line</td></tr>
      <tr><td>F</td><td>60</td><td>4.4</td><td></td></tr>
      <tr><td>G</td><td>70</td><td>5.1</td><td></td></tr>
      <tr><td>H</td><td>80</td><td>5.9</td><td></td></tr>
    </tbody>
  </table>
  <p><em>The trend line predicts ~$3.2M sales for $35K ad spend. Company E achieves $5.8M — well above the trend.</em></p>
</div>`;

  await c.query('UPDATE questions SET q_text = $1 WHERE id = 170', [
    scatterData + '\n\nWhich of the following best describes Company E in the scatter plot?\n\n(A) The company with the highest advertising spend\n(B) A company with lower-than-expected sales given its advertising spend\n(C) A company with much higher sales than expected given its advertising spend\n(D) A company that represents average performance\n(E) The company that defines the line of best fit'
  ]);

  const histData = `
<div class="tq-scenario">
  <p><strong>Scenario: Customer Age Distribution (Histogram)</strong></p>
  <p>Each bar represents the number of customers in that age range.</p>
  <table class="tq-data-table">
    <thead><tr><th>Age Range</th><th>Number of Customers</th></tr></thead>
    <tbody>
      <tr><td>Under 20</td><td>45</td></tr>
      <tr><td>20–29</td><td>210</td></tr>
      <tr><td>25–34</td><td>380</td></tr>
      <tr><td>30–39</td><td>420</td></tr>
      <tr><td>35–44</td><td>290</td></tr>
      <tr><td>45–54</td><td>185</td></tr>
      <tr><td>55–64</td><td>110</td></tr>
      <tr><td>65+</td><td>60</td></tr>
    </tbody>
  </table>
  <p><em>Peak is at 30–39. The distribution tapers off sharply below 25 and slowly to the right (older ages).</em></p>
</div>`;

  await c.query('UPDATE questions SET q_text = $1 WHERE id = 171', [
    histData + '\n\nWhich of the following best describes the distribution of customer ages?\n\n(A) Symmetric and bell-shaped\n(B) Skewed left, with most customers over 40\n(C) Skewed right, with a longer tail toward older customers\n(D) Bimodal with peaks at 20–29 and 55–64\n(E) Uniform across all age groups'
  ]);

  console.log('✅ Complex Data Interpretation questions updated with actual data tables');

  // ── FINAL CHECK ───────────────────────────────────────────────────────────
  const nullSubs = await c.query("SELECT COUNT(*) FROM topics WHERE subtitle IS NULL");
  console.log(`\n📊 Topics still missing subtitle: ${nullSubs.rows[0].count}`);
  console.log('✅ All fixes complete!');
  await c.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
