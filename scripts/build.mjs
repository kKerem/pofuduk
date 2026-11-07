// Pofuduk derleme: JSON kütüphaneleri, kural denetimi, önizleme sayfaları ve görsel paftalar.
//   node scripts/build.mjs           → dist/pet-avatars.json, dist/human-avatars.json, dist/preview.html
//   node scripts/build.mjs --sheets  → ayrıca dist/sheets/*.svg (tasarım tuvali için paftalar)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPetLibrary } from '../src/pets.mjs';
import { buildHumanLibrary } from '../src/humans.mjs';
import { selectPetAvatar, composePetAvatar, selectHumanAvatar, composeHumanAvatar } from '../src/render.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });

const pets = buildPetLibrary();
const humans = buildHumanLibrary();

// ---- kural denetimi ---------------------------------------------------------------
const problems = [];
let longest = { id: '', len: 0 };
const checkPart = (where, p) => {
  if (!p.svg) return;
  if (!p.svg.startsWith('<g>') || !p.svg.endsWith('</g>')) problems.push(`${where}/${p.id}: tek <g> değil`);
  const tags = [...p.svg.matchAll(/<(\w+)/g)].map((m) => m[1]);
  const bad = tags.filter((t) => !['g', 'path', 'circle', 'ellipse', 'rect'].includes(t));
  if (bad.length) problems.push(`${where}/${p.id}: izin dışı etiket ${[...new Set(bad)].join(',')}`);
  if (tags.filter((t) => t === 'g').length > 1) problems.push(`${where}/${p.id}: iç içe <g>`);
  if (/class=|style=|url\(/.test(p.svg)) problems.push(`${where}/${p.id}: class/style/url kullanıyor`);
  if (p.svg.length > longest.len) longest = { id: `${where}/${p.id}`, len: p.svg.length };
};
pets.backgrounds.forEach((p) => checkPart('backgrounds', p));
for (const [sid, sp] of Object.entries(pets.species)) for (const [layer, list] of Object.entries(sp)) if (Array.isArray(list) && typeof list[0] === 'object') list.forEach((p) => checkPart(`${sid}.${layer}`, p));
for (const [layer, list] of Object.entries(pets.shared)) list.forEach((p) => checkPart(`shared.${layer}`, p));
for (const [layer, list] of Object.entries(humans.parts)) list.forEach((p) => checkPart(`human.${layer}`, p));
for (const p of humans.parts.hairBack) if (!humans.parts.hairFront.some((f) => f.id === p.pairsWith)) problems.push(`hairBack/${p.id}: pairsWith eşi yok`);

fs.writeFileSync(path.join(dist, 'pet-avatars.json'), JSON.stringify(pets, null, 1));
fs.writeFileSync(path.join(dist, 'human-avatars.json'), JSON.stringify(humans, null, 1));

const count = (lib) => JSON.stringify(lib).match(/"svg":/g).length;
console.log(`hayvan: ${Object.keys(pets.species).length} tür, ${count(pets)} parça · insan: ${count(humans)} parça`);
console.log(`en uzun parça: ${longest.id} (${longest.len} karakter)`);
if (problems.length) {
  console.error('KURAL İHLALİ:\n' + problems.join('\n'));
  process.exit(1);
}

// ---- yardımcılar -----------------------------------------------------------------------
const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const petSeeds = (sp, n) => Array.from({ length: n }, (_, i) => `${sp}-${i + 1}`);
const pet = (seed, sp) => composePetAvatar(selectPetAvatar(seed, sp, pets), pets);
const human = (seed, opts) => composeHumanAvatar(selectHumanAvatar(seed, opts, humans), humans);

// Tek tek seçimle (katalog için) avatar kurmak.
const petWith = (sp, picks, paletteIndex = 0, bg = '#F8F1E5') => {
  const pal = pets.palettes[sp][paletteIndex];
  return composePetAvatar({ kind: 'pet', species: sp, parts: picks, colors: { fur: pal.fur, furDark: pal.furDark, furLight: pal.furLight, accent: pets.accentColors[0], bg } }, pets);
};
const listOf = (sp, layer) => (layer === 'background' ? pets.backgrounds : pets.species[sp][layer] ?? pets.shared[layer] ?? []);
const firstId = (sp, layer, prefer = []) => {
  const list = listOf(sp, layer);
  return (prefer.map((id) => list.find((p) => p.id === id)).find(Boolean) ?? list.find((p) => p.svg) ?? list[0])?.id;
};
const petBase = (sp) => {
  const b = { background: 'bg-plain' };
  for (const layer of pets.species[sp].layers) {
    if (layer === 'background') continue;
    if (['pattern', 'whiskers', 'accessory'].includes(layer)) continue;
    b[layer] = firstId(sp, layer, ['eyes-dot', 'fish-eye-round', 'mouth-smile', 'fish-mouth-smile']);
  }
  return b;
};

const hc = (skin, hair, clothes, scarf) => {
  const P = humans.palettes;
  const t = (list, id, prefix, as) => { const x = list.find((i) => i.id === id); return { [as]: x[prefix], [as + 'Dark']: x[prefix + 'Dark'], [as + 'Light']: x[prefix + 'Light'] }; };
  return { ...t(P.skin, skin, 'skin', 'skin'), ...t(P.hair, hair, 'hair', 'hair'), ...t(P.clothes, clothes, 'clothes', 'clothes'), ...t(P.clothes, scarf, 'clothes', 'scarf'), accent: '#44403C', bg: '#F8F1E5' };
};
const humanBase = (gender) => ({
  background: 'bg-plain', body: 'body-tshirt', head: 'head-round', ears: 'ears-round', eyes: 'eyes-dot', eyebrows: 'brows-soft',
  nose: 'nose-line', mouth: 'mouth-smile',
  ...(gender === 'female' ? { hairFront: 'hair-f-long', hairBack: 'hair-f-long-back' } : { hairFront: 'hair-m-short' }),
});
const humanWith = (picks, colors = hc('light-wheat', 'dark-brown', 'lavender', 'terracotta')) =>
  composeHumanAvatar({ kind: 'human', parts: picks, colors }, humans);

// ---- preview.html (repo içinde tarayıcıda açılan önizleme) ------------------------------
const dataUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
let html = `<!doctype html><html lang="tr"><meta charset="utf-8"><title>Pofuduk önizleme</title>
<style>body{font:14px/1.5 system-ui,sans-serif;margin:32px;color:#1F1C22;background:#fff}h1{font-size:32px;margin:0 0 4px}h2{margin:32px 0 8px}h3{margin:20px 0 6px;font-size:14px}
.row{display:flex;flex-wrap:wrap;gap:10px;margin:6px 0}.row img{border-radius:30%}.c img{border-radius:50%}.dark{background:#0E0D12;padding:12px;border-radius:12px}
.cat{display:flex;flex-wrap:wrap;gap:14px}.cat figure{margin:0;width:96px;font-size:10px;color:#625C69;word-break:break-all}.cat img{width:96px;height:96px;border-radius:30%;display:block;margin-bottom:4px}</style>
<h1>Pofuduk</h1><p>Vetaryo için hayvan ve insan avatarları. Her avatar seed'den deterministik olarak üretilir.</p>`;
const row = (svgs, size, cls = '') => `<div class="row ${cls}">${svgs.map((s) => `<img width="${size}" height="${size}" src="${dataUri(s)}">`).join('')}</div>`;
html += '<h2>Hayvanlar</h2>';
for (const sp of Object.keys(pets.species)) {
  const list = petSeeds(sp, 12).map((s) => pet(s, sp));
  html += `<h3>${pets.species[sp].label} · ${sp}</h3>${row(list, 96)}${row(list, 40, 'c')}${row(list, 24)}<div class="dark">${row(list, 40, 'c')}${row(list, 24)}</div>`;
}
html += '<h2>İnsanlar</h2>';
for (const [label, opts] of [['Kadın', { gender: 'female' }], ['Erkek', { gender: 'male' }]]) {
  const list = Array.from({ length: 24 }, (_, i) => human(`${label}-${i + 1}`, opts));
  html += `<h3>${label}</h3>${row(list, 96)}${row(list, 40, 'c')}${row(list, 24)}<div class="dark">${row(list, 40, 'c')}${row(list, 24)}</div>`;
}
const staffList = Array.from({ length: 6 }, (_, i) => human(`personel-${i + 1}`, { role: 'staff' }));
html += `<h3>Personel</h3>${row(staffList, 96)}<div class="dark">${row(staffList, 40, 'c')}</div>`;
html += '<h2>Parça kataloğu</h2>';
const catalogHtml = (title, items) => `<h3>${esc(title)}</h3><div class="cat">${items.map(([id, svg]) => `<figure><img src="${dataUri(svg)}">${esc(id)}</figure>`).join('')}</div>`;

// Katalog bölümleri (preview.html ve paftalar ortak kullanır)
const petCatalog = (sp) => {
  const base = petBase(sp);
  const sections = [];
  for (const layer of pets.species[sp].layers) {
    if (layer === 'background') continue;
    const list = listOf(sp, layer);
    const items = list.map((p) => {
      const picks = { ...base };
      if (!['eyes', 'nose', 'mouth', 'whiskers', 'accessory'].includes(layer)) {
        for (const l of ['eyes', 'nose', 'mouth']) if (pets.layerOrder.indexOf(l) > pets.layerOrder.indexOf(layer)) delete picks[l];
      }
      picks[layer] = p.id;
      return [p.id, petWith(sp, picks, sp === 'dog' ? 1 : 0)];
    });
    sections.push([`${pets.species[sp].label} · ${layer}`, items]);
  }
  return sections;
};
const sharedCatalog = () => {
  const base = petBase('cat');
  const sections = [['Arka plan · background', pets.backgrounds.map((p) => [p.id, petWith('cat', { background: p.id }, 2)])]];
  for (const [layer, list] of Object.entries(pets.shared)) {
    sections.push([`Ortak · ${layer}`, list.map((p) => [p.id, petWith('cat', { ...base, [layer]: p.id }, 2)])]);
  }
  return sections;
};
const humanCatalog = () => {
  const sections = [];
  const P = humans.parts;
  const ctx = (p, layer) => {
    const gender = p.gender ?? (layer === 'facialHair' ? 'male' : 'female');
    const picks = { ...humanBase(gender) };
    if (layer === 'hairFront') { picks.hairFront = p.id; picks.hairBack = P.hairBack.find((b) => b.pairsWith === p.id)?.id; if (p.id === 'hair-f-hijab') delete picks.ears; }
    else if (layer === 'hairBack') { picks.hairBack = p.id; picks.hairFront = p.pairsWith; }
    else picks[layer] = p.id;
    if (p.id === 'acc-stethoscope') picks.body = 'body-vet-coat';
    if (p.id === 'acc-badge') picks.body = 'body-scrubs';
    const old = layer === 'ageLines';
    const clothes = picks.body === 'body-vet-coat' || picks.body === 'body-scrubs' ? 'sage-scrubs' : 'lavender';
    return humanWith(picks, hc('light-wheat', old ? 'gray' : 'dark-brown', clothes, 'terracotta'));
  };
  const titles = { background: 'Arka plan', body: 'Gövde ve kıyafet', hairBack: 'Arka saç', head: 'Yüz şekli', ears: 'Kulak', ageLines: 'Yaş çizgisi', eyes: 'Göz', eyebrows: 'Kaş', nose: 'Burun', mouth: 'Ağız', facialHair: 'Sakal ve bıyık', hairFront: 'Saç', glasses: 'Gözlük', accessory: 'Aksesuar' };
  for (const layer of humans.layerOrder) {
    const list = P[layer];
    if (layer === 'hairFront') {
      sections.push(['Saç · kadın (hairFront + hairBack)', list.filter((p) => p.gender === 'female').map((p) => [p.id, ctx(p, layer)])]);
      sections.push(['Saç · erkek (hairFront + hairBack)', list.filter((p) => p.gender === 'male').map((p) => [p.id, ctx(p, layer)])]);
      continue;
    }
    sections.push([`${titles[layer]} · ${layer}`, list.map((p) => [p.id, ctx(p, layer)])]);
  }
  return sections;
};

for (const sp of Object.keys(pets.species)) for (const [t, items] of petCatalog(sp)) html += catalogHtml(t, items);
for (const [t, items] of sharedCatalog()) html += catalogHtml(t, items);
for (const [t, items] of humanCatalog()) html += catalogHtml(t, items);
fs.writeFileSync(path.join(dist, 'preview.html'), html);
console.log('dist/preview.html yazıldı');

// ---- paftalar (tasarım tuvalinde görsel olarak kullanılır) ---------------------------------
if (process.argv.includes('--sheets')) {
  const out = path.join(dist, 'sheets');
  fs.mkdirSync(out, { recursive: true });
  const FONT = 'font-family="Inter, Helvetica Neue, Helvetica, Arial, sans-serif"';
  const defs = '<defs><clipPath id="sq"><rect width="256" height="256" rx="77"/></clipPath><clipPath id="ci"><circle cx="128" cy="128" r="128"/></clipPath></defs>';
  const at = (svg, x, y, size, shape = 'sq') =>
    `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 256 256"><g clip-path="url(#${shape})">${inner(svg)}</g></svg>`;
  const doc = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`;
  const write = (name, w, h, body) => { fs.writeFileSync(path.join(out, name), doc(w, h, body)); return { name, w, h }; };
  const sheets = [];

  // 12'li set: 96 px sıra, açık zeminde 40 (daire) + 24, koyu bantta 40 + 24
  const setSheet = (name, list) => {
    const W = 1284;
    let b = list.map((s, i) => at(s, i * 108, 0, 96)).join('');
    const small = (y, dx = 0) => list.map((s, i) => at(s, dx + i * 50, y, 40, 'ci')).join('') + list.map((s, i) => at(s, dx + 640 + i * 32, y + 8, 24)).join('');
    b += small(116);
    b += `<rect x="0" y="176" width="${W}" height="72" rx="16" fill="#0E0D12"/>` + small(192, 16);
    return write(name, W, 248, b);
  };
  for (const sp of Object.keys(pets.species)) sheets.push(setSheet(`pets-${sp}.svg`, petSeeds(sp, 12).map((s) => pet(s, sp))));

  const grid = (name, list, cols, size, gap) => {
    const rows = Math.ceil(list.length / cols);
    const b = list.map((s, i) => at(s, (i % cols) * (size + gap), Math.floor(i / cols) * (size + gap), size)).join('');
    return write(name, cols * (size + gap) - gap, rows * (size + gap) - gap, b);
  };
  const fem = Array.from({ length: 24 }, (_, i) => human(`Kadın-${i + 1}`, { gender: 'female' }));
  const mal = Array.from({ length: 24 }, (_, i) => human(`Erkek-${i + 1}`, { gender: 'male' }));
  const stf = [
    ...Array.from({ length: 6 }, (_, i) => human(`personel-k-${i + 1}`, { gender: 'female', role: 'staff' })),
    ...Array.from({ length: 6 }, (_, i) => human(`personel-e-${i + 1}`, { gender: 'male', role: 'staff' })),
  ];
  sheets.push(grid('humans-female.svg', fem, 12, 96, 12));
  sheets.push(grid('humans-male.svg', mal, 12, 96, 12));
  sheets.push(grid('humans-staff.svg', stf, 12, 96, 12));
  {
    const all = [...fem.slice(0, 12), ...mal.slice(0, 12)];
    const strip = (y, dx) => all.map((s, i) => at(s, dx + i * 50, y, 40, 'ci')).join('');
    const strip24 = (y, dx) => all.map((s, i) => at(s, dx + i * 32, y, 24)).join('');
    let b = strip(0, 0) + strip24(56, 0);
    b += `<rect x="0" y="104" width="1216" height="120" rx="16" fill="#0E0D12"/>` + strip(120, 16) + strip24(176, 16);
    sheets.push(write('humans-sizes.svg', 1216, 224, b));
  }
  // Kapak: 8 hayvan + 8 insan
  {
    const heroPets = [['cat', 'kapak-1'], ['dog', 'kapak-2'], ['cat', 'kapak-7'], ['bird', 'kapak-4'], ['dog', 'kapak-9'], ['rabbit', 'kapak-6'], ['hedgehog', 'kapak-7'], ['fish', 'kapak-8']]
      .map(([sp, s]) => pet(s, sp));
    const heroHumans = [['female', 'customer', 'kapak-a'], ['male', 'staff', 'kapak-b'], ['female', 'customer', 'kapak-c'], ['male', 'customer', 'kapak-d'],
      ['female', 'staff', 'kapak-e'], ['male', 'customer', 'kapak-f'], ['female', 'customer', 'kapak-g'], ['male', 'customer', 'kapak-h']]
      .map(([gender, role, s]) => human(s, { gender, role }));
    sheets.push(grid('hero.svg', [...heroPets, ...heroHumans], 8, 128, 16));
  }

  // Katalog paftaları
  const catalogSheet = (name, sections) => {
    const cols = 10, cell = 96, gx = 20, rowH = 96 + 30, W = cols * (cell + gx) - gx;
    let y = 0, b = '';
    for (const [title, items] of sections) {
      b += `<text x="0" y="${y + 18}" ${FONT} font-size="17" font-weight="600" fill="#1F1C22">${esc(title)}</text>`;
      y += 32;
      items.forEach(([id, svg], i) => {
        const x = (i % cols) * (cell + gx), yy = y + Math.floor(i / cols) * rowH;
        b += at(svg, x, yy, cell) + `<text x="${x}" y="${yy + cell + 16}" ${FONT} font-size="10.5" fill="#625C69">${esc(id)}</text>`;
      });
      y += Math.ceil(items.length / cols) * rowH + 20;
    }
    return write(name, W, y, b);
  };
  for (const sp of Object.keys(pets.species)) sheets.push(catalogSheet(`catalog-pets-${sp}.svg`, petCatalog(sp)));
  sheets.push(catalogSheet('catalog-pets-shared.svg', sharedCatalog()));
  const hcat = humanCatalog();
  const split = hcat.findIndex(([t]) => t.startsWith('Göz'));
  sheets.push(catalogSheet('catalog-humans-1.svg', hcat.slice(0, split)));
  sheets.push(catalogSheet('catalog-humans-2.svg', hcat.slice(split)));

  // Palet paftaları
  const swatchRows = (groups) => {
    let y = 0, b = '';
    const W = 1160;
    for (const [title, list, keys] of groups) {
      b += `<text x="0" y="${y + 18}" ${FONT} font-size="17" font-weight="600" fill="#1F1C22">${esc(title)}</text>`;
      y += 34;
      list.forEach((p, i) => {
        const x = (i % 4) * 290, yy = y + Math.floor(i / 4) * 52;
        keys.forEach((k, j) => {
          b += `<circle cx="${x + 18 + j * 40}" cy="${yy + 18}" r="17" fill="${p[k]}" stroke="#1F1C22" stroke-opacity="0.1"/>`;
        });
        b += `<text x="${x + 136}" y="${yy + 16}" ${FONT} font-size="13" font-weight="600" fill="#1F1C22">${esc(p.id)}</text>`;
        b += `<text x="${x + 136}" y="${yy + 32}" ${FONT} font-size="10.5" fill="#625C69">${keys.map((k) => p[k]).join(' ')}</text>`;
      });
      y += Math.ceil(list.length / 4) * 52 + 20;
    }
    return [W, y, b];
  };
  {
    const groups = Object.entries(pets.palettes).map(([sp, list]) => [`${pets.species[sp].label} · ${sp}`, list, ['fur', 'furDark', 'furLight']]);
    groups.push(['Zemin · backgroundColors', pets.backgroundColors.map((b) => ({ id: b.id, hex: b.hex })), ['hex']]);
    groups.push(['Aksesuar · accentColors', pets.accentColors.map((hex, i) => ({ id: `accent-${i + 1}`, hex })), ['hex']]);
    const [w, h, b] = swatchRows(groups);
    sheets.push(write('palettes-pets.svg', w, h, b));
  }
  {
    const P = humans.palettes;
    const [w, h, b] = swatchRows([
      ['Ten · skin', P.skin, ['skin', 'skinDark', 'skinLight']],
      ['Saç · hair', P.hair, ['hair', 'hairDark', 'hairLight']],
      ['Kıyafet · clothes (son üçü forma)', P.clothes, ['clothes', 'clothesDark', 'clothesLight']],
      ['Gözlük · glasses', P.glasses.map((hex, i) => ({ id: `glasses-${i + 1}`, hex })), ['hex']],
    ]);
    sheets.push(write('palettes-humans.svg', w, h, b));
  }
  fs.writeFileSync(path.join(out, 'sheets.json'), JSON.stringify(sheets, null, 1));
  console.log(sheets.map((s) => `${s.name} ${s.w}×${s.h}`).join('\n'));
}
