/**
 * Build Script for WDIII Tech Vault (Consumer Tech Documentation)
 * Generates verified production build artifacts in /dist (and mirrors to /build).
 * Ensures artifact upload packaging succeeds for deployment.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const BUILD_DIR = path.resolve(ROOT_DIR, 'build');

console.log('🚀 Starting WDIII Tech Vault production build...');

// Helper: copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      count += copyDirSync(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

// Helper: copy single file if exists
function copyFileSync(src, dest) {
  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    return 1;
  }
  return 0;
}

// 1. Prepare clean directories
console.log('📦 Cleaning artifact directories...');
fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.rmSync(BUILD_DIR, { recursive: true, force: true });
fs.mkdirSync(DIST_DIR, { recursive: true });
fs.mkdirSync(BUILD_DIR, { recursive: true });

let fileCount = 0;

// 2. Core HTML Entrypoints & Documents
const coreFiles = [
  'index.html',
  'experiment-12.html',
  'consumer-tech-documentation.html',
  'Consumer_Tech_Documentation.html',
  'bases_tech_archive.htm',
  'fodder-archive.html',
  'manifest.json',
  'llms.txt',
  'favicon.ico',
  'icon.png',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'logo.svg',
  'logo.jpg',
  'server.js',
  'package.json',
  'firebase-applet-config.json',
  'firebase-blueprint.json',
  'firestore.rules',
  'storage.rules'
];

console.log('📄 Copying application entries and configuration...');
for (const file of coreFiles) {
  const src = path.join(ROOT_DIR, file);
  if (fs.existsSync(src)) {
    copyFileSync(src, path.join(DIST_DIR, file));
    copyFileSync(src, path.join(BUILD_DIR, file));
    fileCount++;
  }
}

// 3. Asset & Code Directories
const directories = ['css', 'js', 'src', 'public'];

console.log('📁 Copying code modules and asset directories...');
for (const dir of directories) {
  const src = path.join(ROOT_DIR, dir);
  if (fs.existsSync(src)) {
    const distTarget = path.join(DIST_DIR, dir);
    const buildTarget = path.join(BUILD_DIR, dir);
    fileCount += copyDirSync(src, distTarget);
    copyDirSync(src, buildTarget);
  }
}

// 4. Flatten public assets to root of dist as well (for static host root serving)
const publicDir = path.join(ROOT_DIR, 'public');
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir, { withFileTypes: true });
  for (const entry of publicFiles) {
    if (entry.isFile()) {
      const src = path.join(publicDir, entry.name);
      copyFileSync(src, path.join(DIST_DIR, entry.name));
      copyFileSync(src, path.join(BUILD_DIR, entry.name));
    }
  }
}

// 5. Calculate total artifact footprint
function getDirFootprint(dir) {
  let bytes = 0;
  let count = 0;
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(current, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.isFile()) {
        bytes += fs.statSync(full).size;
        count++;
      }
    }
  }
  walk(dir);
  return { bytes, count };
}

const distStats = getDirFootprint(DIST_DIR);

console.log(`\n======================================================`);
console.log(`✅ Build completed successfully!`);
console.log(`📦 Artifact Directory: ${DIST_DIR}`);
console.log(`📊 Output Artifacts: ${distStats.count} files (${(distStats.bytes / 1024).toFixed(1)} KB)`);
console.log(`   - index.html: ${fs.existsSync(path.join(DIST_DIR, 'index.html')) ? 'OK' : 'MISSING'}`);
console.log(`   - server.js: ${fs.existsSync(path.join(DIST_DIR, 'server.js')) ? 'OK' : 'MISSING'}`);
console.log(`   - public assets: ${fs.existsSync(path.join(DIST_DIR, 'public')) ? 'OK' : 'MISSING'}`);
console.log(`======================================================\n`);

if (distStats.count === 0 || distStats.bytes === 0) {
  console.error('❌ Build failed: output artifacts are empty.');
  process.exit(1);
}
