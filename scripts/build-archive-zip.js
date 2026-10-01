/**
 * Archive Packaging Script for WDIII Tech Vault
 * Creates comprehensive zip archives of the website:
 * 1. Clean full source archive (all code, assets, datasets, FA-01 submissions, archives, tests)
 * 2. Large complete bundle (includes all dependencies in node_modules)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
const version = pkg.version || '6.1.1';

console.log(`\n📦 Packaging WDIII Tech Vault v${version} zip archives...`);

const pythonScript = `
import os, sys, zipfile

root = sys.argv[1]
version = sys.argv[2]
os.chdir(root)

# 1. Clean full archive (all assets, research archives, datasets, code, tests, docs)
clean_name = f"wdiii-tech-vault-v{version}-full.zip"
clean_exclude = {'node_modules', '.git', 'dist', 'build', '.firebase'}

with zipfile.ZipFile(clean_name, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for r, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in clean_exclude and not d.startswith('.git')]
        for f in files:
            if f.endswith('.zip'):
                continue
            p = os.path.join(r, f)
            arcname = os.path.relpath(p, '.')
            z.write(p, arcname)

clean_size = os.path.getsize(clean_name)
with zipfile.ZipFile(clean_name, 'r') as z:
    clean_count = len(z.namelist())

print(f"  ✓ Created {clean_name}")
print(f"    - Files: {clean_count}")
print(f"    - Compressed Size: {clean_size / (1024*1024):.2f} MB ({clean_size:,} bytes)")

# 2. Large all-inclusive archive (includes node_modules dependencies)
large_name = f"wdiii-tech-vault-v{version}-complete-with-dependencies.zip"
large_exclude = {'.git', 'dist', 'build', '.firebase'}

with zipfile.ZipFile(large_name, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for r, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in large_exclude and not d.startswith('.git')]
        for f in files:
            if f.endswith('.zip'):
                continue
            p = os.path.join(r, f)
            arcname = os.path.relpath(p, '.')
            z.write(p, arcname)

large_size = os.path.getsize(large_name)
with zipfile.ZipFile(large_name, 'r') as z:
    large_count = len(z.namelist())

print(f"  ✓ Created {large_name}")
print(f"    - Files: {large_count}")
print(f"    - Compressed Size: {large_size / (1024*1024):.2f} MB ({large_size:,} bytes)")
`;

const res = spawnSync('python3', ['-c', pythonScript, ROOT_DIR, version], { stdio: 'inherit' });

if (res.status !== 0) {
  console.error('❌ Failed to create zip archives.');
  process.exit(1);
} else {
  console.log('\n✅ Zip archives created successfully!\n');
}
