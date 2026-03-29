/**
 * GMAT Hub — RC Passages Migration
 * Creates passages table, inserts 4 GMAT-style passages, links RC questions
 *
 * Run: node db/rc_passages.js
 */

const { Client } = require('../node_modules/pg');

const c = new Client({
  connectionString: 'postgresql://postgres:jN5uClUJKzThMmfG@db.ykllxaopintikehgtqnj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// ─── Passage texts (verbatim from task spec) ────────────────────────────────

const passages = [
  {
    title: 'The Evolution of Bacterial Resistance',
    source_type: 'Science',
    difficulty: 'Medium',
    text: `The widespread use of antibiotics since the mid-twentieth century has inadvertently accelerated the evolution of antibiotic-resistant bacteria. When a population of bacteria is exposed to an antibiotic, most individuals die, but those carrying random mutations that confer resistance survive and reproduce. This process, a direct application of natural selection, occurs with extraordinary speed in bacterial populations because bacteria reproduce rapidly—sometimes generating a new generation in under twenty minutes.

Resistance mechanisms are diverse. Some bacteria produce enzymes that chemically inactivate the antibiotic; others develop modified cell-wall proteins that no longer bind the drug; still others activate efflux pumps that expel the antibiotic before it can act. Critically, resistance genes can be transferred horizontally between bacterial species through plasmids—circular DNA molecules that pass directly from one cell to another—enabling resistance traits to spread far beyond the original resistant population.

The clinical implications are severe. Infections caused by methicillin-resistant Staphylococcus aureus (MRSA) and carbapenem-resistant Enterobacteriaceae (CRE) are increasingly difficult to treat with existing antibiotics, and few new antibiotic classes have been approved in recent decades. Some researchers argue that the solution lies in developing bacteriophage therapies—viruses that target specific bacteria—while others advocate for stricter controls on antibiotic prescribing to slow the pace of resistance evolution.`
  },
  {
    title: 'Platform Economics and Market Concentration',
    source_type: 'Business',
    difficulty: 'Hard',
    text: `Digital platform businesses—those that facilitate interactions between distinct user groups—exhibit economic properties that differ markedly from traditional firms. The most consequential of these is the presence of network effects: the value each user derives from the platform increases as more users join. Social media networks, payment systems, and ride-sharing applications all exhibit this property, which creates a powerful feedback loop. Early entrants attract users; more users make the platform more valuable; greater value attracts further users. This dynamic can produce winner-take-all outcomes in which a single platform comes to dominate a market.

Proponents of platform consolidation argue that concentration produces efficiency gains. A dominant platform can invest more heavily in infrastructure, reduce transaction costs, and offer users a richer ecosystem of services. Critics counter that concentration stifles innovation by deterring new entrants and allows dominant platforms to extract rents from users and complementors alike. The latter concern is amplified by the data advantage incumbents accumulate: proprietary behavioral data enables continuous refinement of recommendation algorithms, creating a moat that new entrants cannot easily cross.

Regulators in multiple jurisdictions have begun scrutinizing platform dominance, though the appropriate remedy remains contested. Structural separation—forcing platforms to divest subsidiary businesses—would reduce conflicts of interest but might also eliminate the efficiency gains of integration. Interoperability requirements, which would compel platforms to allow data portability and third-party access, represent a less drastic alternative, though enforcing technical standards across rapidly evolving systems poses significant practical challenges.`
  },
  {
    title: 'The Bystander Effect Reconsidered',
    source_type: 'Social Science',
    difficulty: 'Medium',
    text: `The bystander effect—the finding that individuals are less likely to offer help in an emergency when others are present—has been one of social psychology's most influential concepts since its introduction in the 1960s. The original experiments by Darley and Latané demonstrated that as the number of bystanders increased, both the likelihood of intervention and its speed decreased. Two mechanisms were proposed to explain this: diffusion of responsibility, whereby each bystander assumes others will act, and pluralistic ignorance, whereby bystanders look to one another for cues about how serious the situation is and, observing apparent calm, conclude that intervention is unnecessary.

Recent meta-analyses, however, present a more nuanced picture. Researchers reanalyzing hundreds of bystander studies found that in real-world emergencies—as opposed to laboratory simulations—the presence of bystanders actually increases the probability of intervention. This divergence from laboratory findings may reflect the fact that real emergencies are unambiguous and urgent in ways that staged scenarios often are not, leaving little room for the uncertainty that drives pluralistic ignorance. Furthermore, larger groups provide a greater pool of individuals with relevant skills, such as medical training, who are more likely to intervene.

These findings do not entirely discredit the original bystander effect research but suggest that it describes a more context-specific phenomenon than previously assumed. Whether bystander dynamics promote or inhibit helping behavior may depend critically on the clarity of the emergency, the perceived competence of bystanders, and the social relationship between those involved.`
  },
  {
    title: 'The Contested Legacy of Documentary Photography',
    source_type: 'Humanities',
    difficulty: 'Hard',
    text: `Documentary photography occupies an uneasy position in the history of visual representation. Its practitioners have long claimed for it a privileged relationship to truth—the photograph, unlike the painting, records what was actually in front of the lens. Yet this claim has been contested from multiple directions. Critics in the tradition of Roland Barthes have argued that photographs are never merely records; they are constructions shaped by the photographer's choices of angle, framing, lighting, and moment of capture. Every photograph excludes as much as it includes, and what is excluded is no less real than what the frame contains.

The ethical dimensions of documentary photography are equally complex. Dorothea Lange's iconic Depression-era images of migrant workers were widely understood as advocacy for the dispossessed, yet the subjects of these photographs rarely benefited materially from their circulation, and their consent to representation was often assumed rather than explicitly sought. More recent practitioners have grappled with the power asymmetry inherent in photographing vulnerable communities: the photographer typically controls the image's meaning, distribution, and commercial value, while subjects have little recourse.

Defenders of the documentary tradition contend that these critiques risk paralyzing a practice with genuine social utility. Photographs of famine, atrocity, and environmental destruction have demonstrably influenced public opinion and policy. The question, on this view, is not whether documentary photography is impure—all representation involves selection and framing—but whether its practitioners exercise their craft with sufficient reflexivity about their own positionality and the interests of those they depict.`
  }
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  await c.connect();
  console.log('Connected to Supabase PostgreSQL\n');

  // Step 1: Create passages table
  await c.query(`
    CREATE TABLE IF NOT EXISTS passages (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      source_type TEXT NOT NULL,
      word_count INT,
      difficulty TEXT DEFAULT 'Medium',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('Step 1: passages table created');

  // Enable RLS + public read (match existing pattern)
  await c.query(`ALTER TABLE passages ENABLE ROW LEVEL SECURITY`);
  await c.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'passages' AND policyname = 'public_read_passages') THEN
        CREATE POLICY "public_read_passages" ON passages FOR SELECT USING (true);
      END IF;
    END $$;
  `);
  console.log('  RLS + public read policy set');

  // Step 2: Add passage_id to questions
  await c.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS passage_id INT REFERENCES passages(id)`);
  console.log('Step 2: passage_id column added to questions\n');

  // Step 3: Insert passages
  const passageIds = {};
  for (const p of passages) {
    const wordCount = p.text.split(/\s+/).length;
    const res = await c.query(
      `INSERT INTO passages (title, text, source_type, word_count, difficulty)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [p.title, p.text, p.source_type, wordCount, p.difficulty]
    );
    passageIds[p.source_type] = res.rows[0].id;
    console.log(`Step 3: Inserted passage ${res.rows[0].id} — "${p.title}" (${p.source_type}, ${wordCount} words)`);
  }
  console.log('  Passage IDs:', passageIds);

  // Step 4: Look up RC topic IDs
  const rcTopics = await c.query(`
    SELECT t.id, t.title FROM topics t
    JOIN sections s ON s.id = t.section_id
    WHERE s.slug = 'verbal' AND t.title LIKE 'RC%'
    ORDER BY t.order_idx
  `);
  console.log('\nStep 4: RC topics found:');
  const topicMap = {};
  for (const row of rcTopics.rows) {
    topicMap[row.title] = row.id;
    console.log(`  ${row.id}: ${row.title}`);
  }

  // Step 5: Link RC questions to passages
  console.log('\nStep 5: Linking questions to passages...');

  const pScience = passageIds['Science'];
  const pBusiness = passageIds['Business'];
  const pSocSci = passageIds['Social Science'];
  const pHumanities = passageIds['Humanities'];

  // Helper: update questions by topic + subtype patterns
  async function linkBySubtype(topicTitle, subtypePatterns, passageId) {
    const topicId = topicMap[topicTitle];
    if (!topicId) {
      console.log(`  WARNING: Topic "${topicTitle}" not found, skipping`);
      return 0;
    }
    const conditions = subtypePatterns.map((_, i) => `subtype ILIKE $${i + 3}`).join(' OR ');
    const res = await c.query(
      `UPDATE questions SET passage_id = $1 WHERE topic_id = $2 AND (${conditions})`,
      [passageId, topicId, ...subtypePatterns]
    );
    return res.rowCount;
  }

  async function linkAllInTopic(topicTitle, passageId) {
    const topicId = topicMap[topicTitle];
    if (!topicId) {
      console.log(`  WARNING: Topic "${topicTitle}" not found, skipping`);
      return 0;
    }
    const res = await c.query(
      `UPDATE questions SET passage_id = $1 WHERE topic_id = $2`,
      [passageId, topicId]
    );
    return res.rowCount;
  }

  // RC Strategy: Humanities for Main Idea, Inference, Author's Purpose; Science for the rest
  const strategyTitle = Object.keys(topicMap).find(t => t.includes('Strategy'));
  if (strategyTitle) {
    let n = await linkBySubtype(strategyTitle, ['%Main Idea%', '%Inference%', "%Author%Purpose%"], pHumanities);
    console.log(`  ${strategyTitle} → Humanities (Main Idea/Inference/Author Purpose): ${n} rows`);
    // Remaining questions in this topic → Science
    const topicId = topicMap[strategyTitle];
    const res = await c.query(
      `UPDATE questions SET passage_id = $1 WHERE topic_id = $2 AND passage_id IS NULL`,
      [pScience, topicId]
    );
    console.log(`  ${strategyTitle} → Science (remaining): ${res.rowCount} rows`);
  }

  // RC Question Types: Business for Function/Purpose, Tone, EXCEPT/NOT; Science for rest
  const qTypesTitle = Object.keys(topicMap).find(t => t.includes('Question Types'));
  if (qTypesTitle) {
    let n = await linkBySubtype(qTypesTitle, ['%Function%', '%Purpose%', '%Tone%', '%EXCEPT%', '%NOT%'], pBusiness);
    console.log(`  ${qTypesTitle} → Business (Function/Tone/EXCEPT): ${n} rows`);
    const topicId = topicMap[qTypesTitle];
    const res = await c.query(
      `UPDATE questions SET passage_id = $1 WHERE topic_id = $2 AND passage_id IS NULL`,
      [pScience, topicId]
    );
    console.log(`  ${qTypesTitle} → Science (remaining): ${res.rowCount} rows`);
  }

  // RC Passage Types & Author Tone: Humanities for Tone/Attribution/Expository/Argumentative; Business for rest
  const passageTypesTitle = Object.keys(topicMap).find(t => t.includes('Passage Types'));
  if (passageTypesTitle) {
    let n = await linkBySubtype(passageTypesTitle, ['%Tone%', '%Attribution%', '%Expository%', '%Argumentative%'], pHumanities);
    console.log(`  ${passageTypesTitle} → Humanities (Tone/Attribution/Expository/Argumentative): ${n} rows`);
    const topicId = topicMap[passageTypesTitle];
    const res = await c.query(
      `UPDATE questions SET passage_id = $1 WHERE topic_id = $2 AND passage_id IS NULL`,
      [pBusiness, topicId]
    );
    console.log(`  ${passageTypesTitle} → Business (remaining): ${res.rowCount} rows`);
  }

  // RC Inference & Application: all → Social Science
  const inferenceTitle = Object.keys(topicMap).find(t => t.includes('Inference'));
  if (inferenceTitle) {
    let n = await linkAllInTopic(inferenceTitle, pSocSci);
    console.log(`  ${inferenceTitle} → Social Science (all): ${n} rows`);
  }

  // Step 6: Verification
  console.log('\nStep 6: Verification');
  const verify = await c.query(`
    SELECT t.title, COUNT(*) as total,
      COUNT(q.passage_id) as with_passage,
      COUNT(*) - COUNT(q.passage_id) as without_passage
    FROM topics t
    JOIN questions q ON q.topic_id = t.id
    JOIN sections s ON s.id = t.section_id
    WHERE s.slug = 'verbal' AND t.title LIKE 'RC%'
    GROUP BY t.title
    ORDER BY t.title
  `);
  console.log('  Topic                              | Total | With | Without');
  console.log('  -----------------------------------|-------|------|--------');
  let allLinked = true;
  for (const row of verify.rows) {
    const pad = row.title.padEnd(35);
    console.log(`  ${pad} | ${String(row.total).padStart(5)} | ${String(row.with_passage).padStart(4)} | ${String(row.without_passage).padStart(7)}`);
    if (parseInt(row.without_passage) > 0) allLinked = false;
  }
  console.log(allLinked ? '\n  ALL RC questions have passage_id assigned!' : '\n  WARNING: Some questions missing passage_id');

  await c.end();
  console.log('\nDone.');
}

run().catch(err => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
