/**
 * GMAT Hub — Topics Loader
 * loadTopicList(section)    → slim list [{id,title,subtitle,icon}] — fast initial load
 * loadTopicDetail(topicId)  → full data for one topic — fetched on demand
 */

// In-memory cache for topic detail (survives tab switching within session)
window._topicDetailCache = {};

async function loadTopicList(section) {
  console.log(`[loader] Fetching topic list for ${section}`);
  const res = await fetch(`/api/topics?section=${section}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

window.loadTopicDetail = async function(topicId) {
  if (window._topicDetailCache[topicId]) {
    return window._topicDetailCache[topicId];
  }
  console.log(`[loader] Fetching topic detail id=${topicId}`);
  const res = await fetch(`/api/topics?id=${topicId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  window._topicDetailCache[topicId] = data;
  return data;
};

// Main entry — call this from each page
window.initPage = async function(section) {
  const grid = document.querySelector('.topics-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="padding:40px;text-align:center;color:var(--muted)">
      <div style="font-size:2rem;margin-bottom:12px">⏳</div>
      <div>Loading topics…</div>
    </div>`;

  try {
    const topics = await loadTopicList(section);
    if (typeof window.renderTopics === 'function') {
      window.renderTopics(topics);
    } else {
      console.error('[loader] window.renderTopics not defined');
    }
  } catch(err) {
    console.error('[loader] Failed to load topics:', err);
    grid.innerHTML = `
      <div style="padding:40px;text-align:center;color:#f87171">
        <div style="font-size:2rem;margin-bottom:12px">⚠️</div>
        <div>Failed to load content. Please refresh.</div>
        <div style="font-size:0.8rem;margin-top:8px;opacity:0.6">${err.message}</div>
      </div>`;
  }
};
