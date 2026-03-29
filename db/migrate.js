/**
 * GMAT Hub — Data Migration Script
 * Extracts topics data from HTML files and inserts into Supabase
 * 
 * Run: node db/migrate.js
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_KEY env vars (or hardcode below for local run)
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ykllxaopintikehgtqnj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '<SUPABASE_KEY>';

const fs = require('fs');
const path = require('path');

// ─── Supabase REST helpers ────────────────────────────────────────────────────

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
    throw new Error(`Supabase ${method} ${table} failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function insert(table, rows) {
  if (!rows || rows.length === 0) return [];
  return sb(table, 'POST', rows);
}

// ─── Extract topics from an HTML file ────────────────────────────────────────

function extractTopics(htmlFile) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  
  // Find the topics array in the JS — it's assigned as: const topics = [...]
  // or: topics = [...] inside a script tag
  const match = html.match(/(?:const\s+)?topics\s*=\s*(\[[\s\S]*?\]);?\s*(?:\/\/|function|const|let|var|<\/script>)/);
  if (!match) {
    throw new Error(`Could not find topics array in ${htmlFile}`);
  }
  
  // Evaluate the array safely using Function constructor
  let topics;
  try {
    topics = new Function(`return ${match[1]}`)();
  } catch(e) {
    throw new Error(`Failed to parse topics from ${htmlFile}: ${e.message}`);
  }
  
  return topics;
}

// ─── Main migration ───────────────────────────────────────────────────────────

async function migrate() {
  console.log('🚀 Starting GMAT Hub data migration...\n');

  // 1. Fetch section IDs
  const sections = await sb('sections', 'GET', null, '?select=id,slug');
  const sectionMap = {};
  sections.forEach(s => sectionMap[s.slug] = s.id);
  console.log('✅ Sections loaded:', sectionMap);

  const sectionFiles = [
    { slug: 'math',   file: 'index.html'  },
    { slug: 'verbal', file: 'verbal.html' },
    { slug: 'di',     file: 'di.html'     },
  ];

  for (const { slug, file } of sectionFiles) {
    console.log(`\n📄 Processing ${file} (${slug})...`);
    const sectionId = sectionMap[slug];
    if (!sectionId) {
      console.error(`  ❌ No section found for slug "${slug}" — did you run schema.sql?`);
      continue;
    }

    let topics;
    try {
      topics = extractTopics(path.join(__dirname, '..', file));
      console.log(`  Found ${topics.length} topics`);
    } catch(e) {
      console.error(`  ❌ ${e.message}`);
      continue;
    }

    for (let i = 0; i < topics.length; i++) {
      const t = topics[i];
      console.log(`  [${i+1}/${topics.length}] "${t.title}"`);

      // Insert topic
      const [topic] = await insert('topics', [{
        section_id: sectionId,
        title: t.title,
        subtitle: t.subtitle || null,
        order_idx: i
      }]);
      const topicId = topic.id;

      // Insert equations
      if (t.equations && t.equations.length > 0) {
        await insert('equations', t.equations.map((eq, j) => ({
          topic_id: topicId,
          label: eq.label || '',
          formula: eq.formula || null,
          note: eq.note || null,
          detail: eq.detail || null,
          order_idx: j
        })));
        console.log(`    ✅ ${t.equations.length} equations`);
      }

      // Insert rules
      if (t.rules && t.rules.length > 0) {
        await insert('rules', t.rules.map((r, j) => ({
          topic_id: topicId,
          title: r.title || '',
          content: r.content || '',
          order_idx: j
        })));
        console.log(`    ✅ ${t.rules.length} rules`);
      }

      // Insert methods
      if (t.methods && t.methods.length > 0) {
        await insert('methods', t.methods.map((m, j) => ({
          topic_id: topicId,
          name: m.name || '',
          when_to_use: m.when || m.when_to_use || null,
          steps: JSON.stringify(m.steps || []),
          tip: m.tip || null,
          order_idx: j
        })));
        console.log(`    ✅ ${t.methods.length} methods`);
      }

      // Insert typical questions
      if (t.typicalQuestions && t.typicalQuestions.length > 0) {
        await insert('questions', t.typicalQuestions.map((q, j) => ({
          topic_id: topicId,
          subtype: q.subtype || '',
          q_text: q.q || q.q_text || '',
          question_type: q.type || q.question_type || null,
          signals: q.signals || null,
          trap: q.trap || null,
          method: q.method || null,
          steps: JSON.stringify(q.steps || []),
          difficulty: q.difficulty || 'Medium',
          order_idx: j
        })));
        console.log(`    ✅ ${t.typicalQuestions.length} questions`);
      }

      // Insert practice items
      if (t.practice && t.practice.length > 0) {
        await insert('practice_items', t.practice.map((p, j) => ({
          topic_id: topicId,
          question: p.q || p.question || '',
          question_type: p.type || p.question_type || null,
          answer: p.a || p.answer || null,
          order_idx: j
        })));
        console.log(`    ✅ ${t.practice.length} practice items`);
      }
    }
  }

  console.log('\n🎉 Migration complete!');
  
  // Summary
  const [topicsCount] = await sb('topics', 'GET', null, '?select=count');
  const [questionsCount] = await sb('questions', 'GET', null, '?select=count');
  console.log(`\nSummary:`);
  console.log(`  Topics: check Supabase dashboard`);
  console.log(`  Run: SELECT COUNT(*) FROM topics; in SQL Editor to verify`);
}

migrate().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
