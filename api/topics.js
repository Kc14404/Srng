/**
 * GET /api/topics?section=math
 * Returns all topics for a section with full content (equations, rules, methods, questions, practice)
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
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

export default async function handler(req, res) {
  const { section } = req.query;
  if (!section) return res.status(400).json({ error: 'section param required' });

  try {
    // Get section
    const sections = await sbGet(`sections?slug=eq.${section}&select=id,slug,title`);
    if (!sections.length) return res.status(404).json({ error: `Section "${section}" not found` });
    const sectionId = sections[0].id;

    // Get topics for this section
    const topics = await sbGet(
      `topics?section_id=eq.${sectionId}&order=order_idx&select=id,title,subtitle,icon,order_idx`
    );

    // For each topic, fetch all sub-data in parallel
    const full = await Promise.all(topics.map(async (topic) => {
      const [equations, rules, methods, questions, practice] = await Promise.all([
        sbGet(`equations?topic_id=eq.${topic.id}&order=order_idx`),
        sbGet(`rules?topic_id=eq.${topic.id}&order=order_idx`),
        sbGet(`methods?topic_id=eq.${topic.id}&order=order_idx`),
        sbGet(`questions?topic_id=eq.${topic.id}&order=order_idx`),
        sbGet(`practice_items?topic_id=eq.${topic.id}&order=order_idx`),
      ]);

      return {
        id: topic.id,
        title: topic.title,
        subtitle: topic.subtitle,
        icon: topic.icon || '',
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
    }));

    // No CDN/browser cache — always serve fresh DB content
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(200).json(full);

  } catch (err) {
    console.error('topics API error:', err);
    res.status(500).json({ error: err.message });
  }
}
