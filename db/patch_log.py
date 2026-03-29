"""Patch log.html to use the shared theme system (CSS vars, settings panel, settings JS)."""
import re, pathlib

ROOT = pathlib.Path(__file__).parent.parent
log_path = ROOT / "log.html"
idx_path = ROOT / "index.html"

idx = idx_path.read_text(encoding="utf-8")
log = log_path.read_text(encoding="utf-8")

# ── 1. Extract theme CSS vars block from index.html ──────────────────────────
# From ":root {" to the end of the last [data-theme] card-personality block
# We'll grab lines 20–221 (the theme vars + card overrides)
theme_css_match = re.search(
    r'(\s+:root \{.*?/\* ══ SERIOUS DARK THEMES.*?}\s)',
    idx, re.DOTALL
)
if not theme_css_match:
    raise ValueError("Could not find theme CSS block in index.html")
theme_css = theme_css_match.group(1)

# ── 2. Extract settings panel CSS from index.html ────────────────────────────
settings_css_match = re.search(
    r'(\s+\.settings-overlay \{.*?\.settings-stub \{.*?})',
    idx, re.DOTALL
)
if not settings_css_match:
    raise ValueError("Could not find settings CSS in index.html")
settings_css = settings_css_match.group(1)

# ── 3. Extract settings panel HTML from index.html ───────────────────────────
settings_html_match = re.search(
    r'(<div class="settings-overlay".*?</div>\s*\n\s*<!-- Settings Panel -->.*?</div>\s*\n\s*</div>)',
    idx, re.DOTALL
)
if not settings_html_match:
    raise ValueError("Could not find settings HTML in index.html")
settings_html = settings_html_match.group(1)

# ── 4. Extract theme JS from index.html ──────────────────────────────────────
theme_js_match = re.search(
    r'(<script>\s*\(function\(\) \{\s*const THEMES.*?}\)\(\);\s*</script>)',
    idx, re.DOTALL
)
if not theme_js_match:
    raise ValueError("Could not find theme JS in index.html")
theme_js = theme_js_match.group(1)

# ── 5. Extract KaTeX renderMath JS from index.html ───────────────────────────
katex_js_match = re.search(
    r'(<script>\s*function renderMath\(el\).*?mathObserver\.observe.*?</script>)',
    idx, re.DOTALL
)
katex_js = katex_js_match.group(1) if katex_js_match else ""

print("✓ Extracted theme CSS, settings CSS/HTML/JS from index.html")

# ── 6. Patch log.html ─────────────────────────────────────────────────────────

# 6a. Add data-theme to <html> tag
log = re.sub(r'<html lang="en">', '<html lang="en" data-theme="deep-space">', log)

# 6b. Add Google Fonts preconnect after <head>
fonts_preconnect = """  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>"""
log = re.sub(r'(<head>\s*\n)', r'\1' + fonts_preconnect + '\n', log)

# 6c. Update KaTeX auto-render to include $ delimiters
log = re.sub(
    r"delimiters: \[\s*\{left:'\\$\\$',right:'\\$\\$',display:true\},.*?\]",
    "delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]",
    log, flags=re.DOTALL
)

# 6d. Replace old :root block with theme CSS vars
old_root_match = re.search(r'\s+:root \{[^}]+\}', log)
if old_root_match:
    log = log[:old_root_match.start()] + theme_css + log[old_root_match.end():]
    print("✓ Replaced :root with full theme vars")
else:
    print("⚠ Could not find :root in log.html")

# 6e. Inject settings CSS before </style>
log = log.replace('</style>', settings_css + '\n    </style>', 1)
print("✓ Injected settings CSS")

# 6f. Replace hardcoded nav colors with CSS vars
# site-nav background
log = re.sub(r'\.site-nav \{([^}]*)\}', lambda m: '.site-nav {' + 
    m.group(1)
    .replace('background: #1a1d27', 'background: var(--surface)')
    .replace('border-bottom: 1px solid #2e3248', 'border-bottom: 1px solid var(--border)')
    + '}', log)

# nav-brand color
log = re.sub(r'\.nav-brand \{([^}]*)\}', lambda m: '.nav-brand {' +
    m.group(1)
    .replace('color: #6c63ff', 'color: var(--accent)')
    .replace('border-right: 1px solid #2e3248', 'border-right: 1px solid var(--border)')
    + '}', log)

# nav-link colors
log = re.sub(r'\.nav-link \{([^}]*)\}', lambda m: '.nav-link {' +
    m.group(1)
    .replace('color: #8b90a7', 'color: var(--muted)')
    + '}', log)
log = re.sub(r'\.nav-link:hover \{ color: #e8eaf0; \}', '.nav-link:hover { color: var(--text); }', log)
log = re.sub(r'\.nav-link\.active \{ color: #00d4aa; border-bottom-color: #00d4aa; \}',
             '.nav-link.active { color: var(--accent2); border-bottom-color: var(--accent2); }', log)

# body font/background
log = re.sub(r"font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;", 
             'font-family: var(--font);', log)
log = re.sub(r'background: var\(--bg\);', 'background-color: var(--body-bg); background-image: var(--body-bg-image);', log)

# header background
log = re.sub(r'background: linear-gradient\(135deg, #1a1d27 0%, #0f1117 100%\);',
             'background: var(--header-bg);', log)

# filter-bar background
log = re.sub(r'background: var\(--bg\);(\s*\n\s*border-bottom: 1px solid var\(--border\);)',
             'background: var(--body-bg);\n      border-bottom: 1px solid var(--border);', log)

# Desktop sidebar — replace all hardcoded colors
log = re.sub(r'background: #0e0f1a;', 'background: var(--surface);', log)
log = re.sub(r'border-right: 1px solid rgba\(255,255,255,0\.07\);', 'border-right: 1px solid var(--border);', log)
log = re.sub(r'border-bottom: 1px solid rgba\(255,255,255,0\.07\);', 'border-bottom: 1px solid var(--border);', log)
log = re.sub(r'border-top: 1px solid rgba\(255,255,255,0\.07\);', 'border-top: 1px solid var(--border);', log)
log = re.sub(r"color: #e0e4f0;", 'color: var(--text);', log)
log = re.sub(r"color: rgba\(255,255,255,0\.55\);", 'color: var(--muted);', log)
log = re.sub(r"color: rgba\(255,255,255,0\.3\);", 'color: var(--muted);', log)
log = re.sub(r'\.dt-nav-item:hover \{ background: rgba\(255,255,255,0\.06\); color: #e0e4f0; \}',
             '.dt-nav-item:hover { background: var(--card); color: var(--text); }', log)
log = re.sub(r'\.dt-nav-item\.dt-active \{ background: rgba\(108,99,255,0\.18\); color: #a78bfa; font-weight: 600; \}',
             '.dt-nav-item.dt-active { background: rgba(108,99,255,0.18); color: var(--accent); font-weight: 600; }', log)
log = re.sub(r'\.dt-footer-btn \{ width: 100%; padding: 9px; background: rgba\(108,99,255,0\.12\);.*?cursor: pointer; transition: background 0\.15s; \}',
             '.dt-footer-btn { width: 100%; padding: 9px; background: rgba(108,99,255,0.12); border: 1px solid var(--border); border-radius: 8px; color: var(--accent); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }',
             log, flags=re.DOTALL)
log = re.sub(r'\.dt-footer-btn:hover \{ background: rgba\(108,99,255,0\.22\); \}',
             '.dt-footer-btn:hover { background: var(--card); }', log)

print("✓ Replaced hardcoded colors with CSS vars")

# 6g. Add settings button to nav (before </nav>)
log = re.sub(
    r'(<a class="nav-link active" href="log\.html">📋 Log</a>\s*\n\s*</nav>)',
    r'\1'.replace('</nav>', '<button class="nav-settings-btn" id="settingsBtn" title="Settings">⚙</button>\n</nav>'),
    log
)
# Also add nav-settings-btn CSS (reuse from main pages)
nav_settings_css = """
    .nav-settings-btn {
      background: none;
      border: none;
      color: var(--muted);
      font-size: 1.1rem;
      padding: 12px 14px;
      cursor: pointer;
      margin-left: auto;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      transition: color 0.2s;
      font-family: inherit;
    }
    .nav-settings-btn:hover { color: var(--accent); }
"""
log = log.replace('</style>', nav_settings_css + '\n    </style>', 1)

print("✓ Added settings button to nav")

# 6h. Add settings panel HTML before </body>
log = log.replace('</body>', '\n' + settings_html + '\n\n' + theme_js + '\n' + katex_js + '\n</body>', 1)
print("✓ Injected settings panel HTML + theme JS + KaTeX JS")

# 6i. Also add gear icon to the desktop sidebar's nav area
log = re.sub(
    r"'<div class=\"dt-logo\"><span class=\"dt-logo-icon\">\\uD83C\\uDF93</span><span class=\"dt-logo-text\">GMAT Hub</span></div>'",
    "'<div class=\"dt-logo\" style=\"display:flex;align-items:center;justify-content:space-between;\"><div style=\"display:flex;align-items:center;gap:10px;\"><span class=\"dt-logo-icon\">🎓</span><span class=\"dt-logo-text\">GMAT Hub</span></div><button onclick=\"document.getElementById(\\\"settingsBtn\\\").click()\" style=\"background:none;border:none;color:var(--muted);font-size:1rem;cursor:pointer;padding:4px 6px;border-radius:6px;\" title=\"Settings\">⚙</button></div>'",
    log
)

# Write output
log_path.write_text(log, encoding="utf-8")
print("\n✅ log.html patched successfully!")
print(f"   File size: {len(log):,} bytes")
