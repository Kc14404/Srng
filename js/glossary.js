/**
 * GMAT Hub — Math Glossary
 * Auto-detects known notation in rendered content and wraps it with inline tooltips.
 * Uses the existing .ref-term / .ref-tip CSS system.
 *
 * Call: applyGlossary(containerEl) after any content render.
 */

const GLOSSARY = [
  // ── Notation ────────────────────────────────────────────────────────────────
  {
    pattern: /floor\(([^)]+)\)/g,
    label: m => `floor(${m[1]})`,
    tip: 'Floor function: divide, then round DOWN to the nearest whole number.\nfloor(7/2) = floor(3.5) = 3',
  },
  {
    pattern: /ceil(?:ing)?\(([^)]+)\)/gi,
    label: m => `ceil(${m[1]})`,
    tip: 'Ceiling function: divide, then round UP to the nearest whole number.\nceil(7/2) = ceil(3.5) = 4',
  },
  {
    pattern: /\bn!/g,
    label: () => 'n!',
    tip: 'Factorial: n! = n × (n−1) × (n−2) × … × 2 × 1\nExample: 5! = 5×4×3×2×1 = 120',
  },
  {
    pattern: /(\d+)!/g,
    label: m => `${m[1]}!`,
    tip: m => `Factorial: ${m[1]}! = ${m[1]}×${m[1]-1}×…×1\nCount ways to arrange ${m[1]} distinct items.`,
  },
  {
    pattern: /\bGCF\b/g,
    label: () => 'GCF',
    tip: 'Greatest Common Factor: the largest number that divides evenly into two or more numbers.\nGCF(12, 8) = 4',
  },
  {
    pattern: /\bLCM\b/g,
    label: () => 'LCM',
    tip: 'Least Common Multiple: the smallest number that is a multiple of two or more numbers.\nLCM(4, 6) = 12',
  },
  {
    pattern: /\bGCD\b/g,
    label: () => 'GCD',
    tip: 'Greatest Common Divisor — same as GCF. Largest number dividing both values exactly.',
  },
  {
    pattern: /nCr|C\(n,\s*r\)|C_n\^r/g,
    label: () => 'nCr',
    tip: 'Combinations: number of ways to CHOOSE r items from n, order doesn\'t matter.\nnCr = n! / (r! × (n−r)!)',
  },
  {
    pattern: /nPr|P\(n,\s*r\)|P_n\^r/g,
    label: () => 'nPr',
    tip: 'Permutations: number of ways to ARRANGE r items from n, order MATTERS.\nnPr = n! / (n−r)!',
  },
  {
    pattern: /\bmod\b/gi,
    label: () => 'mod',
    tip: 'Modulo: the remainder after division.\n7 mod 3 = 1 (because 7 ÷ 3 = 2 remainder 1)',
  },
  {
    pattern: /\bln\b/g,
    label: () => 'ln',
    tip: 'Natural logarithm: log base e (≈ 2.718).\nln(e) = 1, ln(1) = 0',
  },
  {
    pattern: /\blog_(\d+)/g,
    label: m => `log₍${m[1]}₎`,
    tip: m => `Logarithm base ${m[1]}: answers "what power of ${m[1]} gives this number?"\nlog₂(8) = 3 because 2³ = 8`,
  },
  {
    pattern: /\bsup(set|erset)?\b|\b∪\b/g,
    label: () => '∪',
    tip: 'Union (∪): all elements that are in set A OR set B (or both).',
  },
  {
    pattern: /\b∩\b/g,
    label: () => '∩',
    tip: 'Intersection (∩): only elements that are in BOTH set A and set B.',
  },
  {
    pattern: /\b∈\b/g,
    label: () => '∈',
    tip: '"Is an element of" — x ∈ A means x belongs to set A.',
  },
  {
    pattern: /\b∉\b/g,
    label: () => '∉',
    tip: '"Is NOT an element of" — x ∉ A means x does not belong to set A.',
  },
  {
    pattern: /\b∑\b/g,
    label: () => '∑',
    tip: 'Sigma (∑): summation — add up a series of values.\n∑ from i=1 to n of i = 1+2+3+…+n',
  },
  {
    pattern: /\b∞\b/g,
    label: () => '∞',
    tip: 'Infinity: a value larger than any finite number. Used to describe unbounded ranges.',
  },
  {
    pattern: /\b≡\b/g,
    label: () => '≡',
    tip: '"Congruent to" in modular arithmetic.\n17 ≡ 2 (mod 5) means 17 and 2 have the same remainder when divided by 5.',
  },
  {
    pattern: /\bp_(\d)\^?(\w+)?/g,
    label: m => `p₍${m[1]}₎`,
    tip: 'Prime factor notation: p₁, p₂, p₃ represent distinct prime factors of a number.',
  },
  {
    pattern: /\bESOV\b/g,
    label: () => 'ESOV',
    tip: 'Extra Share of Voice: your SOV minus your SOM. Positive ESOV predicts market share growth.',
  },
  {
    pattern: /\bSOV\b/g,
    label: () => 'SOV',
    tip: 'Share of Voice: your brand\'s ad spend as a % of total category ad spend.',
  },
  {
    pattern: /\bSOM\b/g,
    label: () => 'SOM',
    tip: 'Share of Market: your brand\'s revenue as a % of total category revenue.',
  },
];

/**
 * Wrap matching text in a text node with .ref-term tooltip HTML.
 * Safely skips already-processed nodes and KaTeX elements.
 */
function wrapTextNode(node, pattern, labelFn, tipFn) {
  const text = node.textContent;
  pattern.lastIndex = 0;
  const match = pattern.exec(text);
  if (!match) return false;

  pattern.lastIndex = 0;
  const parent = node.parentNode;
  if (!parent) return false;

  // Don't process inside KaTeX, existing ref-terms, or code elements
  let el = parent;
  while (el) {
    if (el.classList && (
      el.classList.contains('katex') ||
      el.classList.contains('ref-term') ||
      el.tagName === 'CODE' ||
      el.tagName === 'SCRIPT' ||
      el.tagName === 'STYLE'
    )) return false;
    el = el.parentElement;
  }

  const frag = document.createDocumentFragment();
  let lastIndex = 0;
  pattern.lastIndex = 0;
  let m;

  while ((m = pattern.exec(text)) !== null) {
    // Text before match
    if (m.index > lastIndex) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
    }
    // Wrapped term
    const span = document.createElement('span');
    span.className = 'ref-term';
    span.textContent = typeof labelFn === 'function' ? labelFn(m) : m[0];
    const tip = document.createElement('span');
    tip.className = 'ref-tip';
    tip.textContent = typeof tipFn === 'function' ? tipFn(m) : tipFn;
    span.appendChild(tip);
    frag.appendChild(span);
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < text.length) {
    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  parent.replaceChild(frag, node);
  return true;
}

function walkTextNodes(root, callback) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      const tag = p.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE') return NodeFilter.FILTER_REJECT;
      if (p.classList.contains('katex') || p.classList.contains('katex-html')) return NodeFilter.FILTER_REJECT;
      if (p.classList.contains('ref-term') || p.classList.contains('ref-tip')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);
  // Process in reverse order to avoid invalidating the walker
  nodes.forEach(n => callback(n));
}

/**
 * Main entry point — call after rendering any content.
 * @param {Element} container - The DOM element to scan
 */
window.applyGlossary = function(container) {
  if (!container) return;
  GLOSSARY.forEach(({ pattern, label, tip }) => {
    walkTextNodes(container, (node) => {
      wrapTextNode(node, new RegExp(pattern.source, pattern.flags), label, tip);
    });
  });
};
