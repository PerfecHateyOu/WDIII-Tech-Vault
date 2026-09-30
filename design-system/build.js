/**
 * Design system rebuild for WDIII Tech Vault.
 *
 *   npm run design-system               rebuild design-system/out/
 *   npm run design-system -- --check    also exit 1 if style.css drifted from tokens.base.json
 *   npm run design-system -- --write-base   accept the rebuilt tokens as the new base
 *
 * Colours are read from public/css/style.css (:root = dark, .light-theme = light).
 * Everything the CSS does not declare (usage notes, type, spacing, radius, shadow,
 * legacy tokens) comes from design-system/tokens.base.json, which is the curated copy
 * of the design system's tokens.json. CSS wins where both define a colour.
 *
 * Output (design-system/out/, git-ignored) mirrors the design system's project/ folder:
 *   tokens.json, assets/Logos/*, assets/Icons/*
 * Publishing it needs the Artifact tool and cannot be done from plain Node; see README.md.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const out = path.join(here, 'out');
const args = new Set(process.argv.slice(2));

const CSS_FILE = 'public/css/style.css';
const ASSETS = {
  Logos: ['logo.svg', 'logo.jpg'],
  Icons: ['icon-512.png', 'icon-192.png', 'apple-touch-icon.png'],
};
const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const HEX_RE = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/;

const read = (p) => fs.readFileSync(p, 'utf8');
const git = (...a) => {
  try {
    return execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

/** Declarations (--name: value) inside the first block opened by `selector`. */
function declarations(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`${CSS_FILE}: no "${selector}" block`);
  const end = css.indexOf('}', start);
  const body = css.slice(start, end).replace(/\/\*[\s\S]*?\*\//g, '');
  const decls = {};
  for (const m of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) decls[m[1]] = m[2].trim();
  return decls;
}

/** hex lowercased, var(--x) -> "{x}", anything else the format can't hold is skipped. */
function colour(value) {
  const alias = /^var\(--([\w-]+)\)$/.exec(value);
  if (alias) return `{${alias[1]}}`;
  const v = value.toLowerCase();
  return HEX_RE.test(v) ? v : null;
}

const css = read(path.join(root, CSS_FILE));
const dark = declarations(css, ':root');
const light = declarations(css, '.light-theme');
const base = JSON.parse(read(path.join(here, 'tokens.base.json')));

const skipped = [];
const added = [];
const changed = [];
const colours = new Map(base.color.tokens.map((t) => [t.name, structuredClone(t)]));

for (const name of Object.keys(dark)) {
  if (!NAME_RE.test(name)) { skipped.push(name); continue; }
  const d = colour(dark[name]);
  const l = name in light ? colour(light[name]) : null;
  if (!d || (name in light && !l)) { skipped.push(name); continue; }

  const token = colours.get(name);
  if (!token) {
    colours.set(name, { name, value: l ? { dark: d, light: l } : { dark: d }, usage: '' });
    added.push(name);
    continue;
  }
  const next = l ? { dark: d, light: l } : { ...token.value, dark: d };
  if (JSON.stringify(next) !== JSON.stringify(token.value)) changed.push(name);
  token.value = next;
}
// light-only overrides of a token the dark block never declares
for (const name of Object.keys(light)) {
  if (!(name in dark) && !colours.has(name)) skipped.push(name);
}

const sha = git('rev-parse', '--short=7', 'HEAD');
const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
const remote = git('remote', 'get-url', 'origin').replace(/\.git$/, '');
const repo = /github\.com[/:]([^/]+\/[^/]+)$/.exec(remote)?.[1] ?? 'PerfecHateyOu/WDIII-Tech-Vault';

const tokens = {
  ...base,
  color: { ...base.color, tokens: [...colours.values()] },
  meta: {
    source: 'github',
    repo,
    ref: `${branch === 'HEAD' ? 'detached' : branch}@${sha}`,
    paths: {
      tokens: [CSS_FILE, 'design-system/tokens.base.json'],
      fonts: [],
      assets: Object.values(ASSETS).flat().map((f) => `public/${f}`),
      docs: ['README.md'],
    },
    components: {},
    synced: new Date().toISOString().slice(0, 10),
  },
};

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'tokens.json'), JSON.stringify(tokens, null, 1) + '\n');

let copied = 0;
for (const [group, files] of Object.entries(ASSETS)) {
  fs.mkdirSync(path.join(out, 'assets', group), { recursive: true });
  for (const f of files) {
    fs.copyFileSync(path.join(root, 'public', f), path.join(out, 'assets', group, f));
    copied++;
  }
}

if (args.has('--write-base')) {
  const { meta, ...rest } = tokens;
  fs.writeFileSync(path.join(here, 'tokens.base.json'), JSON.stringify(rest, null, 2) + '\n');
}

const drift = added.length + changed.length;
console.log(`design-system: ${colours.size} colours, ${copied} assets -> ${path.relative(root, out)}/ (${tokens.meta.ref})`);
if (changed.length) console.log(`  changed vs base: ${changed.join(', ')}`);
if (added.length) console.log(`  new in CSS, no usage note yet: ${added.join(', ')}`);
if (skipped.length) console.log(`  skipped (not expressible as colour tokens): ${skipped.join(', ')}`);

if (args.has('--check') && drift && !args.has('--write-base')) {
  console.error('design-system: style.css differs from tokens.base.json. Run with --write-base, add usage notes, commit.');
  process.exit(1);
}
