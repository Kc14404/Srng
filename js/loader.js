/**
 * GMAT Hub — Topics Loader
 * Fetches topics from /api/topics?section=<slug>
 * Falls back to localStorage cache (1hr TTL)
 * Calls window.renderTopics(topics) when data is ready
 */

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const CACHE_VERSION = 'v3'; // bump to bust cache on content updates

async function loadTopics(section) {
  const cacheKey = `gmat_topics_${CACHE_VERSION}_${section}`;
  // Clear old cache keys
  ['v1','v2'].forEach(v => localStorage.removeItem(`gmat_topics_${v}_${section}`));
  localStorage.removeItem(`gmat_topics_${section}`);
  const cached = localStorage.getItem(cacheKey);

  // Try cache first
  if (cached) {
    try {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL && Array.isArray(data) && data.length > 0) {
        console.log(`[loader] Cache hit for ${section}`);
        return data;
      }
    } catch(e) {}
  }

  // Fetch from API
  console.log(`[loader] Fetching /api/topics?section=${section}`);
  const res = await fetch(`/api/topics?section=${section}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();

  // Cache it
  localStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
  return data;
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

// Cache busting helper — call to force refresh
window.clearTopicsCache = function(section) {
  if (section) {
    localStorage.removeItem(`gmat_topics_${section}`);
  } else {
    ['math','verbal','di'].forEach(s => localStorage.removeItem(`gmat_topics_${s}`));
  }
  location.reload();
};
