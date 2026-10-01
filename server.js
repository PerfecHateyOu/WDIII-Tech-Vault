import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { OFFICIAL_EXPERIMENTS } from './src/data/official-experiments.js';
import { OFFICIAL_DEVICES } from './src/data/official-devices.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000; // Cloud Run injects PORT (8080)
const HOST = '0.0.0.0';

app.set('trust proxy', true); // Behind Firebase Hosting / Cloud Run: use X-Forwarded-For for client IP

app.use(express.json({ limit: '1mb' }));

// ===== Universal CORS Middleware: External Tools, Fetchers & Scripts =====
// Enables external tools, scripts, and AI agents to fetch, view, and summarize data
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, User-Agent');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type, ETag, Date, X-Total-Count');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// ===== Security Middleware: Deny Access to Private & Sensitive Files =====
// ===== FA-01 raw AI submissions =====
// Raw HTML exactly as each AI model returned it, served for readers to inspect.
// Only /fa01/round-<n>/<lowercase-name>.html is served, always inside a sandbox:
// no allow-same-origin, so a submission's scripts run in an opaque origin and
// cannot read this site's cookies, storage or signed-in session.
const FA01_SUBMISSION_PATH = /^\/fa01\/round-\d{1,2}\/[a-z0-9][a-z0-9-]{0,40}\.html$/;
const FA01_SUBMISSION_HEADERS = {
  'Content-Security-Policy': "sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow'
};

const SENSITIVE_PATTERNS = [
  /\/\./,                          // Dotfiles/dotdirs (.env, .git, etc.)
  /\.lock(\.json)?$/i,             // bun.lock, package-lock.json
  /package(-lock)?\.json$/i,       // package.json
  /tsconfig.*\.json$/i,            // tsconfig
  /server\.js$/i,                  // Backend server source
  /firebase.*\.json$/i,            // Direct access to firebase credentials/configs
  /metadata\.json$/i,              // Platform metadata
  /\.rules$/i,                     // firestore.rules, storage.rules
  /\.ya?ml$/i,                     // Config YAMLs
  /LICENSE|README/i,               // Repository docs
  /\.(bak|backup|old|tmp)$/i       // Backups
];

app.use((req, res, next) => {
  const decodedPath = decodeURIComponent(req.path);

  // 1. Prevent directory traversal attacks
  if (decodedPath.includes('..') || decodedPath.includes('\\')) {
    return res.status(404).send('Not found');
  }

  // 2. Block requests targeting private project or development files
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(decodedPath)) {
      return res.status(404).send('Not found');
    }
  }

  // 3. Prevent direct public access to unrouted HTML backup files
  if (decodedPath.endsWith('.html') || decodedPath.endsWith('.htm')) {
    const allowedHtmlPaths = new Set([
      '/',
      '/index.html',
      '/consumer-tech-documentation',
      '/consumer-tech-documentation.html',
      '/Consumer_Tech_Documentation_V5_5_5.html',
      '/Consumer_Tech_Documentation_V5_5_5',
      '/Consumer_Tech_Documentation_V5_6_1.html',
      '/Consumer_Tech_Documentation_V5_6_1',
      '/Consumer_Tech_Documentation_V5_6_2.html',
      '/Consumer_Tech_Documentation_V5_6_2',
      '/experiment-12',
      '/experiment-12.html'
    ]);
    if (!allowedHtmlPaths.has(decodedPath) && !FA01_SUBMISSION_PATH.test(decodedPath)) {
      return res.status(404).send('Not found');
    }
  }

  next();
});

// ===== Public Client Firebase Configuration Route =====
// Supplies strictly the public client identifiers needed for browser Firebase SDK
app.get('/api/firebase-config', (req, res) => {
  try {
    const configPath = path.join(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const fullConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const safePublicConfig = {
        apiKey: fullConfig.apiKey || '',
        authDomain: fullConfig.authDomain || '',
        projectId: fullConfig.projectId || '',
        storageBucket: fullConfig.storageBucket || '',
        messagingSenderId: fullConfig.messagingSenderId || '',
        appId: fullConfig.appId || '',
        firestoreDatabaseId: fullConfig.firestoreDatabaseId || '(default)'
      };
      return res.json(safePublicConfig);
    }
  } catch (err) {
    console.error('Error reading firebase-applet-config.json:', err);
  }
  res.status(404).json({ error: 'Config not found' });
});

// ===== Public Vault Summary API for External Tools & Summarizers =====
app.get('/api/summary', (req, res) => {
  const summaryPayload = {
    title: 'Consumer Tech Documentation — WDIII Tech Vault',
    version: 'v6.1.1',
    lastUpdated: 'September 30, 2026',
    updateType: 'patch',
    updateNote: 'v6.1.1 Update: Light theme styling and Experiment 9 verification updates',
    description: 'Empirical experiments, hardware benchmarks, and documented consumer tech findings across repair, customer service, software performance, ecosystem integrations, and mobile AI.',
    author: 'WDIII',
    stats: {
      totalExperiments: OFFICIAL_EXPERIMENTS.length,
      totalDevices: OFFICIAL_DEVICES.length,
      categories: [...new Set(OFFICIAL_EXPERIMENTS.map(e => e.category))]
    },
    experiments: OFFICIAL_EXPERIMENTS.map(exp => ({
      id: exp.id,
      number: exp.experimentNumber,
      title: exp.title,
      category: exp.category,
      status: exp.statusLabel || exp.status,
      objective: exp.objective || exp.researchQuestion,
      verdict: exp.verdict || null,
      observations: exp.observations || [],
      devices: exp.devices || []
    })),
    devices: OFFICIAL_DEVICES.map(dev => ({
      id: dev.id,
      name: dev.model || dev.name,
      model: dev.model,
      brand: dev.brand,
      releaseYear: dev.releaseYear,
      chipset: dev.specifications?.processor || dev.chipset,
      experimentsInvolved: dev.experimentsInvolved || []
    }))
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json(summaryPayload);
});

// ===== Public Experiments API for External Tools =====
app.get('/api/experiments', (req, res) => {
  const { category, status } = req.query;
  let results = OFFICIAL_EXPERIMENTS;
  if (category) {
    results = results.filter(e => (e.category || '').toLowerCase() === String(category).toLowerCase());
  }
  if (status) {
    results = results.filter(e => (e.status || '').toLowerCase() === String(status).toLowerCase());
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Total-Count', String(results.length));
  res.json({ total: results.length, experiments: results });
});

app.get('/api/experiments/:id', (req, res) => {
  const targetId = req.params.id.toLowerCase();
  const exp = OFFICIAL_EXPERIMENTS.find(e => 
    e.id.toLowerCase() === targetId || 
    `exp${e.experimentNumber}`.toLowerCase() === targetId ||
    e.experimentNumber === targetId
  );
  if (!exp) {
    return res.status(404).json({ error: `Experiment '${req.params.id}' not found` });
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(exp);
});

// ===== Public Devices API for External Tools =====
app.get('/api/devices', (req, res) => {
  const { brand } = req.query;
  let results = OFFICIAL_DEVICES;
  if (brand) {
    results = results.filter(d => (d.brand || '').toLowerCase() === String(brand).toLowerCase());
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Total-Count', String(results.length));
  res.json({ total: results.length, devices: results });
});

app.get('/api/devices/:id', (req, res) => {
  const targetId = req.params.id.toLowerCase();
  const dev = OFFICIAL_DEVICES.find(d => d.id.toLowerCase() === targetId);
  if (!dev) {
    return res.status(404).json({ error: `Device '${req.params.id}' not found` });
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(dev);
});

// ===== Simple in-memory rate limiter (per Cloud Run instance) =====
function rateLimit({ windowMs, max, key }) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
  }, windowMs).unref();
  return (req, res, next) => {
    const k = key(req);
    const now = Date.now();
    let entry = hits.get(k);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(k, entry);
    }
    if (++entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.reset - now) / 1000));
      return res.status(429).json({ error: 'Too many requests, slow down' });
    }
    return next();
  };
}

// ===== Contact / General Form Submission =====
// Validates and acknowledges only; nothing is persisted yet. No PII is logged.
app.post(
  '/api/submit',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5, key: (req) => `submit:${req.ip}` }),
  (req, res) => {
    const { email, message, type } = req.body || {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }
    if (email !== undefined && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (message.trim().length > 5000) {
      return res.status(400).json({ error: 'Message exceeds 5000 character limit' });
    }

    const safeType = typeof type === 'string' ? type.replace(/[^a-z_-]/gi, '').slice(0, 32) : 'contact';
    console.log(`[/api/submit] type=${safeType || 'contact'} length=${message.trim().length}`);
    return res.status(202).json({ ok: true, persisted: false, message: 'Submission received' });
  }
);

// ===== Explicit Brand Asset Download Routes =====
app.get(['/download/logo.svg', '/download/wdiii-logo.svg'], (req, res) => {
  const filePath = path.join(__dirname, 'public', 'logo.svg');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', 'attachment; filename="wdiii-logo.svg"');
    return res.sendFile(filePath);
  }
  res.status(404).send('logo.svg not found');
});

app.get(['/download/logo.jpg', '/download/wdiii-logo.jpg'], (req, res) => {
  const filePath = path.join(__dirname, 'public', 'logo.jpg');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="wdiii-logo.jpg"');
    return res.sendFile(filePath);
  }
  res.status(404).send('logo.jpg not found');
});

// Fallback for unmatched API routes to ensure JSON 404
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
});

// ===== Static Serving: Dedicated Public Assets Directory ONLY =====
// File names aren't content-hashed, so scripts and styles must revalidate on
// every load (cheap 304s via ETag) or visitors keep stale code after deploys.
const REVALIDATE_EXTS = new Set(['.html', '.js', '.mjs', '.css']);
function setCacheHeaders(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  } else if (REVALIDATE_EXTS.has(ext)) {
    res.setHeader('Cache-Control', 'no-cache');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}

const staticOptions = {
  index: false,
  dotfiles: 'ignore',
  fallthrough: true,
  setHeaders: setCacheHeaders
};

// FA-01 submissions: strict path, sandbox headers, nothing else under /fa01 is served
app.use('/fa01', (req, res, next) => {
  let decodedPath;
  try { decodedPath = decodeURIComponent(req.originalUrl.split('?')[0]); } catch { return res.status(404).send('Not found'); }
  if (!FA01_SUBMISSION_PATH.test(decodedPath)) return res.status(404).send('Not found');
  const filePath = path.join(__dirname, 'public', decodedPath);
  if (!filePath.startsWith(path.join(__dirname, 'public', 'fa01') + path.sep) || !fs.existsSync(filePath)) {
    return res.status(404).send('Not found');
  }
  for (const [key, value] of Object.entries(FA01_SUBMISSION_HEADERS)) res.setHeader(key, value);
  res.setHeader('Cache-Control', 'no-cache');
  res.type('html');
  return res.sendFile(filePath, { cacheControl: false, dotfiles: 'deny' });
});

app.use(express.static(path.join(__dirname, 'public'), staticOptions));

// Versioned aliases (/v/<version>/js/..., /v/<version>/src/...) used by the import map
// in index.html. A new URL per release bypasses copies cached under the old
// year-long "immutable" header.
const VERSION_SEGMENT = /^[\w.-]{1,32}$/;
function checkVersion(req, res, next) {
  if (!VERSION_SEGMENT.test(req.params.version)) return res.status(404).send('Not found');
  next();
}
app.use('/v/:version/js', checkVersion, express.static(path.join(__dirname, 'public', 'js'), staticOptions));

// ===== Static Serving: Approved Frontend Modules & Images in /src =====
const APPROVED_SRC_EXTS = new Set([
  '.js', '.mjs', '.css', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico'
]);

function serveSrc(req, res, next) {
  const ext = path.extname(req.path).toLowerCase();
  if (!APPROVED_SRC_EXTS.has(ext)) {
    return res.status(404).send('Not found');
  }
  
  const safeRelativePath = path.normalize(req.path).replace(/^(\.\.[\/\\])+/, '');
  const absolutePath = path.join(__dirname, 'src', safeRelativePath);
  
  if (!absolutePath.startsWith(path.join(__dirname, 'src'))) {
    return res.status(404).send('Not found');
  }

  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
    setCacheHeaders(res, absolutePath);
    return res.sendFile(absolutePath, { cacheControl: false });
  }
  
  next();
}

app.use('/src', serveSrc);
app.use('/v/:version/src', checkVersion, serveSrc);

// ===== LLMs / AI Summary Plaintext Route =====
app.get('/llms.txt', (req, res) => {
  const llmsPath = path.join(__dirname, 'public', 'llms.txt');
  if (fs.existsSync(llmsPath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.sendFile(llmsPath);
  }
  res.status(404).send('llms.txt not found');
});

// ===== Experiment 12 Standalone Route =====
app.get(['/experiment-12', '/experiment-12.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'experiment-12.html'));
});

// ===== Root SPA Route & Approved Legacy Aliases =====
app.get([
  '/',
  '/index.html',
  '/consumer-tech-documentation',
  '/consumer-tech-documentation.html',
  '/Consumer_Tech_Documentation_V5_5_5.html',
  '/Consumer_Tech_Documentation_V5_5_5',
  '/Consumer_Tech_Documentation_V5_6_1.html',
  '/Consumer_Tech_Documentation_V5_6_1',
  '/Consumer_Tech_Documentation_V5_6_2.html',
  '/Consumer_Tech_Documentation_V5_6_2'
], (req, res) => {
  // index.html carries the import map, so it must always be revalidated.
  setCacheHeaders(res, 'index.html');
  res.sendFile(path.join(__dirname, 'index.html'), { cacheControl: false });
});

// ===== Final 404 Catch-All Handler =====
app.use((req, res) => {
  res.status(404).type('text/plain').send('Not found');
});

app.listen(PORT, HOST, () => {
  console.log(`Consumer Tech Documentation server listening at http://${HOST}:${PORT}`);
});

