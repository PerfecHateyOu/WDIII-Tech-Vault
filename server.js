import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '10mb' }));

// ===== Security Middleware: Deny Access to Private & Sensitive Files =====
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
      '/Consumer_Tech_Documentation_V5_6_2'
    ]);
    if (!allowedHtmlPaths.has(decodedPath)) {
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

// Serve /uploads statically with dedicated route
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Fallback for unmatched API routes to ensure JSON 404
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
});

// ===== Static Serving: Dedicated Public Assets Directory ONLY =====
app.use(express.static(path.join(__dirname, 'public'), {
  index: false,
  dotfiles: 'ignore',
  fallthrough: true
}));

// ===== Static Serving: Approved Frontend Modules & Images in /src =====
const APPROVED_SRC_EXTS = new Set([
  '.js', '.mjs', '.css', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico'
]);

app.use('/src', (req, res, next) => {
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
    return res.sendFile(absolutePath);
  }
  
  next();
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
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== Final 404 Catch-All Handler =====
app.use((req, res) => {
  res.status(404).type('text/plain').send('Not found');
});

app.listen(PORT, HOST, () => {
  console.log(`Consumer Tech Documentation server listening at http://${HOST}:${PORT}`);
});

