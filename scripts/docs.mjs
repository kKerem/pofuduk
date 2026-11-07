// README görsellerini üretir: node scripts/docs.mjs → docs/*.svg
// Sabit seed'ler kullanır; aynı kütüphaneyle her seferinde aynı görseller çıkar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPetAvatar, renderHumanAvatar } from '../src/render.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pets = JSON.parse(fs.readFileSync(path.join(root, 'dist/pet-avatars.json'), 'utf8'));
const humans = JSON.parse(fs.readFileSync(path.join(root, 'dist/human-avatars.json'), 'utf8'));
const out = path.join(root, 'docs');
fs.mkdirSync(out, { recursive: true });

const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const place = (svg, x, y, size) =>
  `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 256 256"><g clip-path="url(#r)">${inner(svg)}</g></svg>`;
const doc = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><clipPath id="r"><rect width="256" height="256" rx="72"/></clipPath></defs>${body}</svg>`;
const label = (text, x, y) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="-apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="13" fill="#8A8494">${text}</text>`;
const write = (name, svg) => {
  fs.writeFileSync(path.join(out, name), svg);
  console.log(`docs/${name} ${(svg.length / 1024).toFixed(0)} KB`);
};

const pet = (seed, sp) => renderPetAvatar(seed, sp, pets);
const human = (seed, opts) => renderHumanAvatar(seed, opts, humans);

// Satır satır ızgara: rows = [[svg, …], …]
function grid(name, rows, size, gap) {
  const cols = Math.max(...rows.map((r) => r.length));
  const w = cols * size + (cols - 1) * gap;
  const h = rows.length * size + (rows.length - 1) * gap;
  let b = '';
  rows.forEach((r, j) => r.forEach((svg, i) => (b += place(svg, i * (size + gap), j * (size + gap), size))));
  write(name, doc(w, h, b));
}

const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));

// Kapak: üstte hayvanlar, altta insanlar
const heroSpecies = ['cat', 'dog', 'rabbit', 'bird', 'hedgehog', 'cat', 'dog', 'turtle'];
grid('hero.svg', [
  heroSpecies.map((sp, i) => pet(`hero-${sp}-${i}`, sp)),
  range(8, (i) => human(`hero-human-${i}`, { gender: i % 2 ? 'male' : 'female' })),
], 112, 16);

// 13 tür, altında Türkçe adı
const names = {
  cat: 'Kedi', dog: 'Köpek', bird: 'Kuş', rabbit: 'Tavşan', rodent: 'Kemirgen', hedgehog: 'Kirpi', ferret: 'Gelincik',
  turtle: 'Kaplumbağa', lizard: 'Kertenkele', snake: 'Yılan', fish: 'Balık', farm: 'Çiftlik', other: 'Genel',
};
{
  const size = 88, gap = 20, sp = Object.keys(pets.species), perRow = 7;
  const rows = [sp.slice(0, perRow), sp.slice(perRow)];
  const w = perRow * size + (perRow - 1) * gap, rowH = size + 30;
  let b = '';
  rows.forEach((r, j) => r.forEach((s, i) => {
    const x = i * (size + gap), y = j * (rowH + gap);
    b += place(pet(`species-${s}`, s), x, y, size) + label(names[s], x + size / 2, y + size + 20);
  }));
  write('species.svg', doc(w, rows.length * rowH + gap, b));
}

grid('cats-dogs.svg', [range(10, (i) => pet(`cat-${i}`, 'cat')), range(10, (i) => pet(`dog-${i}`, 'dog'))], 80, 12);
grid('humans.svg', [
  range(10, (i) => human(`woman-${i}`, { gender: 'female' })),
  range(10, (i) => human(`man-${i}`, { gender: 'male' })),
  range(10, (i) => human(`staff-${i}`, { role: 'staff' })),
], 80, 12);

// README'deki kod örneğinin çıktıları
write('example-pet.svg', doc(128, 128, place(pet('pet_7f3a', 'cat'), 0, 0, 128)));
write('example-owner.svg', doc(128, 128, place(human('owner_19c2', { gender: 'female' }), 0, 0, 128)));
write('example-vet.svg', doc(128, 128, place(human('user_04be', { role: 'staff' }), 0, 0, 128)));
