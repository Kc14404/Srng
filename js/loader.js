/**
 * GMAT Hub — Topics Loader
 * Always fetches fresh from /api/topics?section=<slug>
 * No localStorage caching — content changes reflect immediately
 */

async function loadTopics(section) {
  // Clear any old cache keys from previous versions
  ['v1','v2','v3','v4'].forEach(v => {
    localStorage.removeItem(`gmat_topics_${v}_${section}`);
  });
  localStorage.removeItem(`gmat_topics_${section}`);

  console.log(`[loader] Fetching /api/topics?section=${section}`);
  const res = await fetch(`/api/topics?section=${section}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// Main entry — call this from each page
window.initPage = async function(section) {
  const grid = document.querySelector('.topics-grid');
  if (!grid) return;

  // Show skeleton
  grid.innerHTML = `
    <div style="padding:40px;text-align:center;color:var(--muted)">
      <div style="font-size:2rem;margin-bottom:12px">⏳</div>
      <div>Loading topics…</div>
    </div>`;

  try {
    const topics = await loadTopics(section);
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
