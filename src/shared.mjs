// Pofuduk — ortak çizim yardımcıları ve ortak arka planlar.
// Her parça 256×256 tuvalde, tek <g> içinde; yalnızca path, circle, ellipse, rect.
// Renkler {{yer tutucu}} ile yazılır, birleştirici sonradan doldurur.

export const INK = '#44403C';
export const WHITE = '#FFFFFF';
export const SCLERA = '#FFFCF7';
export const PINK_NOSE = '#C98579';
export const TONGUE = '#D98A7E';

const n = (v) => +(+v).toFixed(1);
const attr = (extra) => (extra ? ' ' + extra.trim() : '');

export const e = (cx, cy, rx, ry, fill, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${attr(extra)}/>`;
export const c = (cx, cy, r, fill, extra = '') =>
  `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${attr(extra)}/>`;
export const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${attr(extra)}/>`;
export const rect = (x, y, w, h, rx, fill, extra = '') =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rx)}" fill="${fill}"${attr(extra)}/>`;
export const s = (d, color, w, extra = '') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${attr(extra)}/>`;
export const g = (...parts) => `<g>${parts.join('')}</g>`;
export const rot = (deg, x, y) => `transform="rotate(${deg} ${x} ${y})"`;

// Sol yarıyı çizip sağa aynalamak için (yalnızca M L C Q Z, mutlak koordinat).
export function mirror(d) {
  return d.replace(/([MLCQZ])([^MLCQZ]*)/g, (m, cmd, rest) => {
    const nums = rest.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    return cmd + nums.map((v, i) => (i % 2 === 0 ? n(256 - v) : n(v))).join(' ');
  });
}

// Ton üçlüsü: fur → {{fur}} {{furDark}} {{furLight}}
// Açık ton (furLight) ana renk olarak kullanılırsa gölgesi orta ton (fur) olur.
export const tone = (t) =>
  t.endsWith('Light')
    ? { b: `{{${t}}}`, d: `{{${t.slice(0, -5)}}}`, l: '#FFFFFF' }
    : { b: `{{${t}}}`, d: `{{${t}Dark}}`, l: `{{${t}Light}}` };

// Kil hacmi, elips: koyu tam şekil + üstte biraz küçültülüp sol üste kaydırılmış ana renk
// + sol üstte açık ışık lekesi. half = ana elipsin sol yarısı (iki renkli desenler için).
export function clayE(cx, cy, rx, ry, t = 'fur', { light = true, k = 1 } = {}) {
  const T = tone(t);
  const bx = cx - 4 * k, by = cy - 5 * k, brx = rx - 5 * k, bry = ry - 5 * k;
  const hx = cx - rx * 0.6, hy = cy - ry * 0.12;
  const svg =
    e(cx, cy, rx, ry, T.d) +
    e(bx, by, brx, bry, T.b) +
    (light ? e(hx, hy, rx * 0.24, rx * 0.12, T.l, `opacity="0.6" ${rot(-50, n(hx), n(hy))}`) : '');
  const half = `M${n(bx)} ${n(by - bry)}A${n(brx)} ${n(bry)} 0 0 0 ${n(bx)} ${n(by + bry)}Z`;
  return { svg, half };
}

// Kil hacmi, serbest şekil: koyu kopya sağ alta kayık, ana renk üstte.
export const clayP = (d, t = 'fur', dx = 5, dy = 6) => {
  const T = tone(t);
  return p(d, T.d, `transform="translate(${dx} ${dy})"`) + p(d, T.b);
};
export const clayC = (cx, cy, r, t = 'fur', o = 3) => {
  const T = tone(t);
  return c(cx + o, cy + o, r, T.d) + c(cx, cy, r, T.b);
};
// Birden çok daireyi tek kütle gibi: önce tüm koyu kopyalar, sonra tüm ana renkler.
export const clayCircles = (list, t = 'fur', o = 4) => {
  const T = tone(t);
  return list.map(([x, y, r]) => c(x + o, y + o, r, T.d)).join('') + list.map(([x, y, r]) => c(x, y, r, T.b)).join('');
};
export const ellipsePath = (cx, cy, rx, ry) =>
  `M${n(cx - rx)} ${n(cy)}A${n(rx)} ${n(ry)} 0 1 0 ${n(cx + rx)} ${n(cy)}A${n(rx)} ${n(ry)} 0 1 0 ${n(cx - rx)} ${n(cy)}Z`;

// Yumuşak dikenler (kirpi, iguana ibiği, sakallı ejder): uçlar yuvarlak, dipler içeride.
export function spikes(cx, cy, rx, ry, a0, a1, count, depth) {
  const pt = (a, k) => {
    const r = (a * Math.PI) / 180;
    return `${n(cx + (rx - k) * Math.cos(r))} ${n(cy + (ry - k) * Math.sin(r))}`;
  };
  const step = (a1 - a0) / count;
  let d = `M${n(cx)} ${n(cy)}L${pt(a0, depth)}`;
  for (let i = 0; i < count; i++) {
    const tip = a0 + step * (i + 0.5);
    d += `Q${pt(tip, -depth * 0.25)} ${pt(a0 + step * (i + 1), depth)}`;
  }
  return d + 'Z';
}

// ---- ortak arka planlar (hayvan ve insan) --------------------------------------
const BG = '<rect width="256" height="256" fill="{{bg}}"/>';
const GROUND = e(128, 246, 86, 12, INK, 'opacity="0.07"');
export const backgrounds = [
  { id: 'bg-plain', svg: g(BG), weight: 2 },
  { id: 'bg-ground', svg: g(BG, GROUND), weight: 4 },
  { id: 'bg-halo', svg: g(BG, c(128, 132, 108, WHITE, 'opacity="0.32"'), GROUND), weight: 2 },
  { id: 'bg-arch', svg: g(BG, p('M0 256C30 158 226 158 256 256Z', WHITE, 'opacity="0.32"')), weight: 2 },
  { id: 'bg-horizon', svg: g(BG, rect(0, 200, 256, 56, 0, INK, 'opacity="0.04"'), GROUND), weight: 1 },
  { id: 'bg-blobs', svg: g(BG, c(30, 40, 14, WHITE, 'opacity="0.45"'), c(226, 56, 9, WHITE, 'opacity="0.45"'), c(34, 214, 8, WHITE, 'opacity="0.45"'), c(222, 206, 12, WHITE, 'opacity="0.45"')), weight: 1 },
];

// Krem, adaçayı, gök, şeftali ve markanın morundan türeyen üç soluk ton.
export const backgroundColors = [
  { id: 'cream', hex: '#F8F1E5', weight: 3 },
  { id: 'lilac', hex: '#F1E8FD', weight: 2 },
  { id: 'lavender', hex: '#E9DDFB', weight: 1 },
  { id: 'mist', hex: '#F5F1FC', weight: 1 },
  { id: 'sage', hex: '#E5EEDF', weight: 2 },
  { id: 'sky', hex: '#E2ECF4', weight: 2 },
  { id: 'peach', hex: '#F8E4D8', weight: 2 },
  { id: 'sand', hex: '#EFE7DA', weight: 1 },
];

export const trio = (id, b, d, l, extra = {}) => ({ id, ...extra, b, d, l });
