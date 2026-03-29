/**
 * GET /api/topics?section=math  → slim topic list [{id,title,subtitle,icon,order_idx}]
 * GET /api/topics?id=5          → full data for one topic (lazy load on click)
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

async function sbGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${path}`);
  return res.json();
}

async function fetchFullTopic(topicId) {
  const [topic, equations, rules, methods, questions, practice] = await Promise.all([
    sbGet(`topics?id=eq.${topicId}&select=id,title,subtitle,icon,order_idx&limit=1`),
    sbGet(`equations?topic_id=eq.${topicId}&order=order_idx`),
    sbGet(`rules?topic_id=eq.${topicId}&order=order_idx`),
    sbGet(`methods?topic_id=eq.${topicId}&order=order_idx`),
    sbGet(`questions?topic_id=eq.${topicId}&order=order_idx`),
    sbGet(`practice_items?topic_id=eq.${topicId}&order=order_idx`),
  ]);
  if (!topic.length) return null;
  const t = topic[0];
  return {
    id: t.id,
    title: t.title,
    subtitle: t.subtitle,
    icon: t.icon || '',
    equations,
    rules,
    methods: methods.map(m => ({
      ...m,
      steps: Array.isArray(m.steps) ? m.steps : JSON.parse(m.steps || '[]')
    })),
    typicalQuestions: questions.map(q => ({
      id: q.id,
      subtype: q.subtype,
      q: q.q_text,
      type: q.question_type,
      signals: q.signals,
      trap: q.trap,
      method: q.method,
      steps: Array.isArray(q.steps) ? q.steps : JSON.parse(q.steps || '[]'),
      difficulty: q.difficulty,
    })),
    practice: practice.map(p => ({
      q: p.question,
      type: p.question_type,
      a: p.answer,
    })),
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const { section, id } = req.query;

  // ── Single topic (full data) ──────────────────────────────────────────────
  if (id) {
    try {
      const topic = await fetchFullTopic(parseInt(id));
      if (!topic) return res.status(404).json({ error: 'Topic not found' });
      return res.status(200).json(topic);
    } catch (err) {
      console.error('topic detail error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Section slim list ─────────────────────────────────────────────────────
  if (!section) return res.status(400).json({ error: 'section or id param required' });

  try {
    const sections = await sbGet(`sections?slug=eq.${section}&select=id,slug,title`);
    if (!sections.length) return res.status(404).json({ error: `Section "${section}" not found` });
    const sectionId = sections[0].id;

    const topics = await sbGet(
      `topics?section_id=eq.${sectionId}&order=order_idx&select=id,title,subtitle,icon,order_idx`
    );

    return res.status(200).json(topics);
  } catch (err) {
    console.error('topics list error:', err);
    return res.status(500).json({ error: err.message });
  }
}
