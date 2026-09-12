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

// Firebase configuration route
app.get('/api/firebase-config', (req, res) => {
  try {
    const configPath = path.join(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return res.json(config);
    }
  } catch (err) {
    console.error('Error reading firebase-applet-config.json:', err);
  }
  res.status(404).json({ error: 'Config not found' });
});

// Explicit download routes for bun.lock and firebase configuration files
app.get(['/bun.lock', '/download/bun.lock', '/download/bun', '/api/download/bun.lock'], (req, res) => {
  const filePath = path.join(__dirname, 'bun.lock');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bun.lock"');
    return res.sendFile(filePath);
  }
  res.status(404).send('bun.lock not found');
});

app.get(['/bun.lock.json', '/download/bun.lock.json'], (req, res) => {
  const filePath = path.join(__dirname, 'bun.lock.json');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bun.lock.json"');
    return res.sendFile(filePath);
  }
  res.status(404).send('bun.lock.json not found');
});

app.get(['/firebase-applet-config.json', '/download/firebase-applet-config.json', '/download/firebase', '/download/firebase-config', '/download/firebase-config.json'], (req, res) => {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="firebase-applet-config.json"');
    return res.sendFile(configPath);
  }
  res.status(404).json({ error: 'firebase-applet-config.json not found' });
});

app.get(['/firebase-config.json'], (req, res) => {
  const configPath = path.join(__dirname, 'firebase-config.json');
  if (fs.existsSync(configPath)) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="firebase-config.json"');
    return res.sendFile(configPath);
  }
  res.status(404).json({ error: 'firebase-config.json not found' });
});

// Explicit download routes for brand assets
app.get(['/download/logo.svg', '/download/wdiii-logo.svg'], (req, res) => {
  const filePath = path.join(__dirname, 'logo.svg');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', 'attachment; filename="wdiii-logo.svg"');
    return res.sendFile(filePath);
  }
  res.status(404).send('logo.svg not found');
});

app.get(['/download/logo.jpg', '/download/wdiii-logo.jpg'], (req, res) => {
  const filePath = path.join(__dirname, 'logo.jpg');
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

// Serve static assets from the current directory
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Route for root entry point
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route aliases
app.get(['/Document V5.2.3.htm', '/Document%20V5.2.3.htm', '/consumer-tech-documentation', '/consumer-tech-documentation.html', '/Consumer_Tech_Documentation_V5_5_2.html', '/Consumer_Tech_Documentation_V5_5_2', '/Consumer_Tech_Documentation_V5_5_3.html', '/Consumer_Tech_Documentation_V5_5_3', '/Consumer_Tech_Documentation_V5_5_4.html', '/Consumer_Tech_Documentation_V5_5_4', '/Consumer_Tech_Documentation_V5_5_5.html', '/Consumer_Tech_Documentation_V5_5_5'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/fodder-archive', '/fodder-archive.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'fodder-archive.html'));
});

app.get(['/Fodder Archive V2.htm', '/Fodder%20Archive%20V2.htm'], (req, res) => {
  res.sendFile(path.join(__dirname, 'Fodder Archive V2.htm'));
});

app.listen(PORT, HOST, () => {
  console.log(`Consumer Tech Documentation server listening at http://${HOST}:${PORT}`);
});
