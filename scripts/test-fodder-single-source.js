/**
 * Fodder Archive single-source audit (static).
 * FA entries are rendered from src/data/official-experiments.js `sections`.
 * This fails if a hand-written builder comes back, or if an entry's content drifts
 * (TOC links to missing sections, unknown block types, links to missing entries).
 */
import fs from 'fs';
import { OFFICIAL_EXPERIMENTS as E } from '../src/data/official-experiments.js';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

const KNOWN = new Set(['heading', 'paragraph', 'notice', 'meta', 'table', 'ranking', 'insight', 'keyFinding',
  'conclusion', 'timeline', 'related', 'group', 'code', 'callout', 'checklist', 'footnote']);
const html = fs.readFileSync('index.html', 'utf8');

console.log('\n=== FODDER ARCHIVE SINGLE-SOURCE AUDIT ===');
check('no hand-written FA builders in index.html', !/function buildFa\d/.test(html));
check('index.html imports the experiment data', html.includes('import { OFFICIAL_EXPERIMENTS } from "/src/data/official-experiments.js"'));
check('Fodder page is rendered from data', html.includes('document.getElementById("fodderContent").innerHTML = renderFodderArchive();'));

const fa = E.filter((e) => /^FA-\d+$/.test(e.experimentNumber));
check('at least one FA entry exists', fa.length > 0, `found ${fa.length}`);
const ids = new Set(E.map((e) => e.id));

for (const e of fa) {
  check(`${e.id}: has sections`, Array.isArray(e.sections) && e.sections.length > 0);
  const anchors = new Set(), types = [], badLinks = [];
  const walk = (blocks) => (blocks || []).forEach((b) => {
    types.push(b.type);
    if (b.type === 'heading') anchors.add(b.id);
    if (b.type === 'checklist' && b.id) anchors.add(b.id);
    if (b.type === 'group') {
      if (!['stack', 'cards'].includes(b.layout)) types.push(`group:${b.layout}`);
      walk(b.children);
    }
    if (b.type === 'related') (b.items || []).forEach((it) => {
      if (it.id && !ids.has(it.id)) badLinks.push(it.id);
      const m = /^#\/experiments\/(.+)$/.exec(it.to || '');
      if (m && !ids.has(m[1])) badLinks.push(m[1]);
    });
  });
  walk(e.sections);
  const unknown = types.filter((t) => !KNOWN.has(t));
  check(`${e.id}: only known block types`, unknown.length === 0, unknown.join(', '));
  const missing = (e.toc || []).map((t) => t.id).filter((id) => !anchors.has(id));
  check(`${e.id}: every TOC entry has a matching section`, missing.length === 0, missing.join(', '));
  check(`${e.id}: related links point to existing entries`, badLinks.length === 0, badLinks.join(', '));
  check(`${e.id}: page metadata present (tags, search, toc)`, Array.isArray(e.tags) && e.tags.length > 0 && typeof e.search === 'string' && Array.isArray(e.toc));
}

console.log(`\n   FODDER SINGLE-SOURCE AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
