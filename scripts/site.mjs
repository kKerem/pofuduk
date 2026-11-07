// Tanıtım sitesi için tarayıcı dosyalarını hazırlar: node scripts/site.mjs
// docs/render.js  ← src/render.ts (tipler ayıklanır, kod aynı kalır)
// docs/pet-avatars.json, docs/human-avatars.json ← dist/
// Site GitHub Pages'te docs/ klasöründen yayınlanır: docs/index.html
import fs from 'node:fs';
import path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.join(root, 'docs');
fs.mkdirSync(docs, { recursive: true });

const ts = fs.readFileSync(path.join(root, 'src/render.ts'), 'utf8');
const js = stripTypeScriptTypes(ts, { mode: 'strip' });
fs.writeFileSync(path.join(docs, 'render.js'), `// src/render.ts'ten üretildi (scripts/site.mjs). Elle düzenlemeyin.\n${js}`);

for (const f of ['pet-avatars.json', 'human-avatars.json']) {
  fs.copyFileSync(path.join(root, 'dist', f), path.join(docs, f));
}
fs.writeFileSync(path.join(docs, '.nojekyll'), '');
console.log('docs/render.js, docs/pet-avatars.json, docs/human-avatars.json hazır');
