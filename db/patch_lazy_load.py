"""
Patches index.html, verbal.html, di.html to use lazy topic loading.
Changes:
1. renderTopics() renders slim cards (header only, no tab content)
2. Extracts buildTopicContent(topic, i) for rendering tabs from full data
3. toggleCard(i) fetches full data on first expand (mobile)
4. dtSelectTopic(i) fetches full data on click (desktop)
"""
import re, pathlib

ROOT = pathlib.Path(__file__).parent.parent

TOPIC_CONTENT_BUILDER = r"""
// ── Build full tab content from topic detail data ──────────────────────────
window.buildTopicContent = function(topic, i) {
  const eqItems = (topic.equations || []).map(eq => {
    const textOnlyMatch = eq.formula ? eq.formula.match(/^\$\$\\text\{([^\\{}]+)\}\$\$$/) : null;
    const rendered = textOnlyMatch
      ? `<span class="eq-plain-text">${textOnlyMatch[1]}</span>`
      : (eq.formula || '');
    return `
    <div class="eq-item">
      <div class="eq-label">${eq.label}<span class="eq-chevron">▼</span></div>
      <div class="eq-formula">${rendered}</div>
      ${eq.note ? `<div class="eq-note">${eq.note}</div>` : ''}
      ${eq.detail ? `<div class="eq-detail"><div class="eq-detail-inner">${eq.detail}</div></div>` : ''}
    </div>`;
  }).join('');

  let detailHTML = '<div class="rule-list">';
  const details = topic.details || topic.rules || [];
  details.forEach(d => {
    if (d.type === 'title' && !d.content) {
      detailHTML += `<div class="section-title">${d.text || d.title || ''}</div>`;
    } else if (d.title && d.content) {
      detailHTML += `<div class="rule-item"><strong class="rule-title">${d.title}</strong><p class="rule-body">${d.content}</p></div>`;
    } else {
      detailHTML += `<div class="rule-item">${d.text || d.content || ''}</div>`;
    }
  });
  detailHTML += '</div>';

  const practiceHTML = (topic.practice || []).map((p, j) => `
    <div class="practice-item" id="prac-${i}-${j}">
      <div class="practice-q" onclick="toggleAnswer(${i},${j})">
        <div class="q-num">${j+1}</div>
        <div class="q-text">${p.q || p.question || ''}</div>
        <div class="q-toggle">▼</div>
      </div>
      <div class="practice-ans">
        <div class="ans-label">Solution</div>
        ${p.steps ? p.steps.map(s => `<div class="step">${s}</div>`).join('') : (p.a ? `<div class="step">${p.a}</div>` : '')}
      </div>
    </div>
  `).join('');

  const methodsHTML = (topic.methods || []).map(m => `
    <div class="method-item">
      <div class="method-name">${m.name}</div>
      <div class="method-when"><em>Use when:</em> ${m.when || m.when_to_use || ''}</div>
      <ol class="method-steps">
        ${(m.steps || []).map(s => `<li>${s}</li>`).join('')}
      </ol>
      ${m.tip ? `<div class="method-tip">💡 ${m.tip}</div>` : ''}
    </div>
  `).join('');

  const tqHTML = (topic.typicalQuestions || []).map((tq, j) => `
    <div class="tq-item" id="tq-${i}-${j}">
      <div class="tq-header" onclick="toggleTQ1('tq-${i}-${j}')">
        <div class="tq-type-badge">${tq.subtype}</div>
        <div class="tq-question">${tq.q}</div>
        <div class="tq-cta-1">▼ Analyze this question</div>
      </div>
      <div class="tq-layer1">
        <div class="tq-analysis">
          <div class="tq-a-row"><span class="tq-a-label">Type:</span> ${tq.type}</div>
          <div class="tq-a-row"><span class="tq-a-label">Signals:</span> ${tq.signals}</div>
          <div class="tq-a-row"><span class="tq-a-label">Trap:</span> ${tq.trap}</div>
          <div class="tq-a-row"><span class="tq-a-label">Method:</span> ${tq.method}</div>
        </div>
        <button class="tq-sol-btn" onclick="toggleTQ2(event,'tq-${i}-${j}')">Show Solution ▼</button>
        <div class="tq-layer2">
          <ol class="tq-steps">
            ${(tq.steps || []).map(s => `<li>${s}</li>`).join('')}
          </ol>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div class="detail-tabs">
      <button class="tab-btn active" onclick="switchTab(event,${i},'eq')">📐 Equations</button>
      <button class="tab-btn" onclick="switchTab(event,${i},'detail')">📖 Rules</button>
      <button class="tab-btn" onclick="switchTab(event,${i},'methods')">🔧 Key Methods</button>
      <button class="tab-btn" onclick="switchTab(event,${i},'tq')">❓ Typical Questions</button>
      <button class="tab-btn" onclick="switchTab(event,${i},'practice')">✏️ Practice</button>
    </div>
    <div class="tab-content active" id="tab-eq-${i}">
      <div class="eq-list">${eqItems}</div>
    </div>
    <div class="tab-content" id="tab-detail-${i}">
      ${detailHTML}
    </div>
    <div class="tab-content" id="tab-methods-${i}">
      <div class="method-list">${methodsHTML}</div>
    </div>
    <div class="tab-content" id="tab-tq-${i}">
      <div class="tq-list">${tqHTML}</div>
    </div>
    <div class="tab-content" id="tab-practice-${i}">
      <div class="practice-list">${practiceHTML}</div>
    </div>`;
};
"""

SLIM_RENDER_TOPICS = r"""
// ── Render slim topic cards (header only — content loaded on first click) ──
window.renderTopics = function(topics) {
const hub = document.getElementById('hub');
hub.innerHTML = '';

topics.forEach((topic, i) => {
  const card = document.createElement('div');
  card.className = 'topic-card';
  card.id = `topic-${i}`;
  card.dataset.topicId = topic.id;
  card.dataset.loaded = 'false';

  card.innerHTML = `
    <div class="card-header" onclick="toggleCard(${i})">
      <div class="card-icon">${topic.icon || ''}</div>
      <div class="card-meta">
        <h2>${topic.title}</h2>
        <div class="preview">${topic.subtitle || ''}</div>
      </div>
      <div class="expand-arrow">▼</div>
    </div>
    <div class="detail-panel" id="detail-panel-${i}">
      <div class="loading-dots" style="padding:24px;text-align:center;color:var(--muted)">⏳ Loading…</div>
    </div>`;

  hub.appendChild(card);
});

window._dtTopics = topics;
if (window.innerWidth >= 1024) initDesktopLayout();
if (window.renderMathInElement) {
  renderMathInElement(hub, {
    delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],
    throwOnError: false
  });
}
};
"""

LAZY_TOGGLE_CARD = r"""
async function toggleCard(i) {
  if (window.innerWidth >= 1024) return;
  const card = document.getElementById(`topic-${i}`);
  const panel = document.getElementById(`detail-panel-${i}`);
  const isOpen = card.classList.contains('active');

  // Close all others
  document.querySelectorAll('.topic-card.active').forEach(c => {
    if (c !== card) c.classList.remove('active');
  });

  if (isOpen) {
    card.classList.remove('active');
    return;
  }

  card.classList.add('active');
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Lazy-load content on first open
  if (card.dataset.loaded === 'false') {
    panel.innerHTML = '<div class="loading-dots" style="padding:24px;text-align:center;color:var(--muted)">⏳ Loading…</div>';
    try {
      const topicId = card.dataset.topicId;
      const topic = await window.loadTopicDetail(topicId);
      panel.innerHTML = window.buildTopicContent(topic, i);
      card.dataset.loaded = 'true';
      if (window.renderMathInElement) {
        renderMathInElement(panel, {
          delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],
          throwOnError: false
        });
      }
    } catch(err) {
      panel.innerHTML = `<div style="padding:20px;color:#f87171">Failed to load: ${err.message}</div>`;
    }
  }
}
"""

LAZY_DT_SELECT = r"""
var _dtCurrentTopic = -1;

async function dtSelectTopic(i) {
  if (window.innerWidth < 1024) return;
  if (i === _dtCurrentTopic) return;
  _dtCurrentTopic = i;

  const detail = document.getElementById('dt-detail');
  const topics = window._dtTopics || [];
  const slimTopic = topics[i];
  if (!slimTopic) return;

  // Sync active states
  document.querySelectorAll('#dt-middle .dt-overview-card').forEach((el, idx) => el.classList.toggle('active', idx === i));
  document.querySelectorAll('.dt-topic-item').forEach((el, idx) => el.classList.toggle('active', idx === i));

  // Show loading state
  detail.innerHTML = `<div style="padding:60px 20px;text-align:center;color:var(--muted)">⏳ Loading ${slimTopic.title}…</div>`;
  detail.scrollTo(0, 0);

  try {
    const topic = await window.loadTopicDetail(slimTopic.id);
    detail.innerHTML = `
      <div class="topic-card active" id="dt-topic-detail">
        <div class="card-header">
          <div class="card-icon">${topic.icon || ''}</div>
          <div class="card-meta">
            <h2>${topic.title}</h2>
            <div class="preview">${topic.subtitle || ''}</div>
          </div>
        </div>
        <div class="detail-panel">
          ${window.buildTopicContent(topic, i)}
        </div>
      </div>`;
    if (window.renderMathInElement) {
      renderMathInElement(detail, {
        delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],
        throwOnError: false
      });
    }
  } catch(err) {
    detail.innerHTML = `<div style="padding:20px;color:#f87171">Failed to load: ${err.message}</div>`;
  }
}
"""

def patch_file(path):
    content = path.read_text(encoding='utf-8')
    original_len = len(content)

    # 1. Replace the entire renderTopics function
    # Find it from "window.renderTopics = function(topics) {" to the closing hub.appendChild + dtTopics + initDesktop block
    rt_pattern = re.compile(
        r'window\.renderTopics = function\(topics\) \{.*?'
        r'window\._dtTopics = topics;\s*'
        r'if \(window\.innerWidth >= 1024\) initDesktopLayout\(\);.*?'
        r'\}\s*;',
        re.DOTALL
    )
    match = rt_pattern.search(content)
    if match:
        content = content[:match.start()] + SLIM_RENDER_TOPICS.strip() + content[match.end():]
        print(f'  ✓ Replaced renderTopics')
    else:
        print(f'  ⚠ Could not find renderTopics to replace — trying alternate pattern')
        # Try without the dtTopics line
        rt_pattern2 = re.compile(
            r'window\.renderTopics = function\(topics\) \{.*?\}\s*;',
            re.DOTALL
        )
        match2 = rt_pattern2.search(content)
        if match2:
            content = content[:match2.start()] + SLIM_RENDER_TOPICS.strip() + content[match2.end():]
            print(f'  ✓ Replaced renderTopics (alt pattern)')
        else:
            print(f'  ✗ FAILED to replace renderTopics')

    # 2. Insert buildTopicContent right before renderTopics
    content = content.replace(
        '// ── Render slim topic cards',
        TOPIC_CONTENT_BUILDER.strip() + '\n\n// ── Render slim topic cards',
        1
    )

    # 3. Replace toggleCard function
    tc_pattern = re.compile(
        r'function toggleCard\(i\) \{.*?\n\}',
        re.DOTALL
    )
    match = tc_pattern.search(content)
    if match:
        content = content[:match.start()] + LAZY_TOGGLE_CARD.strip() + content[match.end():]
        print(f'  ✓ Replaced toggleCard')
    else:
        print(f'  ✗ Could not find toggleCard')

    # 4. Replace dtSelectTopic + _dtCurrentTopic declaration
    ds_pattern = re.compile(
        r'var _dtCurrentTopic = -1;\s*\n\s*function dtSelectTopic\(i\) \{.*?\n\}',
        re.DOTALL
    )
    match = ds_pattern.search(content)
    if match:
        content = content[:match.start()] + LAZY_DT_SELECT.strip() + content[match.end():]
        print(f'  ✓ Replaced dtSelectTopic')
    else:
        print(f'  ✗ Could not find dtSelectTopic with _dtCurrentTopic')
        # Try without the var
        ds_pattern2 = re.compile(
            r'function dtSelectTopic\(i\) \{.*?\n\}',
            re.DOTALL
        )
        match2 = ds_pattern2.search(content)
        if match2:
            content = content[:match2.start()] + LAZY_DT_SELECT.strip() + content[match2.end():]
            print(f'  ✓ Replaced dtSelectTopic (alt pattern)')

    path.write_text(content, encoding='utf-8')
    print(f'  File: {original_len:,} → {len(content):,} bytes')


for fname in ['index.html', 'verbal.html', 'di.html']:
    fpath = ROOT / fname
    print(f'\nPatching {fname}...')
    patch_file(fpath)

print('\nDone!')
