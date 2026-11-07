// Pofuduk — hayvan parçaları.
// Yüz katmanları (eyes, nose, mouth, whiskers) varsayılan yüz merkezi (128,150) için çizilir.
// Kafa parçası faceAnchor / muzzleAnchor taşırsa birleştirici bu katmanları oraya taşır.
// Kafa parçasındaki "half" ve "muzzle" yolları, desenlerdeki {{half}} ve {{muzzle}} yerine konur.
import {
  INK, WHITE, SCLERA, PINK_NOSE, TONGUE,
  e, c, p, s, rect, g, rot, mirror, clayE, clayP, clayC, clayCircles, ellipsePath, spikes,
  backgrounds, backgroundColors,
} from './shared.mjs';

const F = '{{fur}}', D = '{{furDark}}', L = '{{furLight}}', A = '{{accent}}';
const A_ = (x, y, scale = 1) => ({ x, y, scale });
const pal = (id, fur, furDark, furLight, extra = {}) => ({ id, fur, furDark, furLight, ...extra });
const none = (id, weight = 1) => ({ id, svg: '', weight });

// ---------------------------------------------------------------------------
// ORTAK YÜZ PARÇALARI
// ---------------------------------------------------------------------------
const hl = (x, y, r = 3.5) => c(x, y, r, WHITE);
export const eyes = {
  'eyes-dot': g(c(98, 140, 11, INK), c(158, 140, 11, INK), hl(101.5, 136.5), hl(161.5, 136.5)),
  'eyes-round': g(c(98, 140, 16, SCLERA), c(158, 140, 16, SCLERA), c(100, 141, 10, INK), c(160, 141, 10, INK), hl(103.5, 137.5), hl(163.5, 137.5)),
  'eyes-almond': g(
    p('M80 142C88 128 108 128 116 142C108 153 88 153 80 142Z', '#F4E7BF'),
    p('M140 142C148 128 168 128 176 142C168 153 148 153 140 142Z', '#F4E7BF'),
    e(98, 141, 5.5, 10, INK), e(158, 141, 5.5, 10, INK)),
  'eyes-sleepy': g(p('M84 138A14 14 0 0 0 112 138Z', INK), p('M144 138A14 14 0 0 0 172 138Z', INK)),
  'eyes-wink': g(c(98, 140, 11, INK), hl(101.5, 136.5), s('M146 144Q158 130 170 144', INK, 9)),
  'eyes-happy': g(s('M86 144Q98 130 110 144M146 144Q158 130 170 144', INK, 9)),
  'eyes-calm': g(s('M86 138Q98 150 110 138M146 138Q158 150 170 138', INK, 9)),
  'eyes-big': g(c(98, 138, 19, SCLERA), c(158, 138, 19, SCLERA), c(100, 140, 13, INK), c(160, 140, 13, INK), hl(104, 135, 5), hl(164, 135, 5), hl(96, 145, 2.5), hl(156, 145, 2.5)),
};
const SCLERA_EYES = new Set(['eyes-round', 'eyes-almond', 'eyes-big']);

export const noses = {
  'nose-button': g(e(128, 160, 10, 7, PINK_NOSE)),
  'nose-dot': g(e(128, 160, 9, 6.5, INK)),
  'nose-bunny': g(p('M119 156C119 151 137 151 137 156C137 161 132 165 128 165C124 165 119 161 119 156Z', PINK_NOSE), s('M128 165L128 172', INK, 4, 'opacity="0.6"')),
  'nose-round': g(e(128, 160, 13, 9.5, INK), e(123, 157, 4, 2.5, WHITE, 'opacity="0.35"')),
  'nose-nostrils': g(c(120, 160, 3.5, INK, 'opacity="0.7"'), c(136, 160, 3.5, INK, 'opacity="0.7"')),
  // kedi
  'nose-cat-pink': g(p('M117 158C117 152 139 152 139 158C139 165 132 170 128 170C124 170 117 165 117 158Z', PINK_NOSE)),
  'nose-cat-rose': g(p('M117 158C117 152 139 152 139 158C139 165 132 170 128 170C124 170 117 165 117 158Z', '#B9727A')),
  'nose-cat-ink': g(p('M117 158C117 152 139 152 139 158C139 165 132 170 128 170C124 170 117 165 117 158Z', INK)),
  'nose-cat-small': g(p('M121 158C121 154 135 154 135 158C135 163 131 166 128 166C125 166 121 163 121 158Z', PINK_NOSE)),
  // köpek
  'nose-dog': g(p('M110 158C110 147 146 147 146 158C146 168 136 172 128 172C120 172 110 168 110 158Z', INK), e(121, 154, 6, 3.5, WHITE, 'opacity="0.35"')),
  'nose-dog-wide': g(p('M106 158C106 146 150 146 150 158C150 169 138 174 128 174C118 174 106 169 106 158Z', INK), e(119, 154, 7, 3.5, WHITE, 'opacity="0.35"')),
  'nose-dog-small': g(p('M116 158C116 151 140 151 140 158C140 165 133 168 128 168C123 168 116 165 116 158Z', INK), e(123, 155, 4.5, 2.5, WHITE, 'opacity="0.35"')),
  'nose-dog-liver': g(p('M110 158C110 147 146 147 146 158C146 168 136 172 128 172C120 172 110 168 110 158Z', '#7A5245'), e(121, 154, 6, 3.5, WHITE, 'opacity="0.3"')),
  // kuş gagaları
  'beak-short': g(p('M114 158C114 148 142 148 142 158C142 170 134 182 128 184C122 182 114 170 114 158Z', '#E7B27C'), e(128, 149, 12, 5, '#BFC8DA')),
  'beak-hook': g(p('M106 156C106 138 150 138 152 158C154 180 142 200 126 202C132 192 134 182 126 176C114 172 106 166 106 156Z', '#6B6460'), e(126, 178, 11, 7, '#55504D')),
  'beak-thin': g(p('M117 158C119 151 137 151 139 158L128 180Z', '#E9A65A', 'stroke="#E9A65A" stroke-width="6" stroke-linejoin="round"')),
  // çiftlik
  'nose-farm-wide': g(c(112, 160, 6, INK, 'opacity="0.6"'), c(144, 160, 6, INK, 'opacity="0.6"')),
};

export const mouths = {
  'mouth-smile': g(s('M114 180Q128 194 142 180', INK, 7)),
  'mouth-w': g(s('M110 176Q119 190 128 177Q137 190 146 176', INK, 7)),
  'mouth-neutral': g(s('M118 186L138 186', INK, 7)),
  'mouth-open': g(p('M112 178Q128 208 144 178Q128 184 112 178Z', INK), e(128, 195, 9, 5.5, TONGUE)),
  'mouth-tongue': g(p('M119 182C119 200 123 206 128 206C133 206 137 200 137 182Z', TONGUE), s('M110 176Q119 190 128 177Q137 190 146 176', INK, 7)),
  'mouth-surprised': g(e(128, 188, 8, 10, INK)),
  // tür ağızları
  'turtle-mouth-smile': g(s('M98 176Q128 196 158 176', INK, 7)),
  'turtle-mouth-flat': g(s('M104 182Q128 188 152 182', INK, 7)),
  'lizard-mouth-wide': g(s('M76 172Q128 200 180 172', INK, 6)),
  'lizard-mouth-flat': g(s('M84 180Q128 190 172 180', INK, 6)),
  'snake-mouth-smile': g(s('M100 176Q128 192 156 176', INK, 6)),
  'snake-mouth-tongue': g(s('M128 186L128 204M128 204L119 214M128 204L137 214', '#D9775B', 6), s('M100 176Q128 192 156 176', INK, 6)),
  'fish-mouth-o': g(e(40, 146, 7, 9, INK)),
  'fish-mouth-smile': g(s('M34 140Q42 152 56 148', INK, 6)),
  'fish-mouth-kiss': g(e(36, 144, 9, 11, TONGUE), e(36, 144, 3.5, 5.5, INK)),
};

export const whiskers = {
  'whiskers-none': '',
  'whiskers-short': g(s('M84 180L56 176M84 188L56 192M172 180L200 176M172 188L200 192', INK, 4, 'opacity="0.45"')),
  'whiskers-long': g(s('M80 178L36 170M80 186L34 190M176 178L220 170M176 186L222 190', INK, 4, 'opacity="0.45"')),
  'whiskers-droopy': g(s('M80 180Q56 182 36 194M80 188Q60 194 44 208M176 180Q200 182 220 194M176 188Q196 194 212 208', INK, 4, 'opacity="0.45"')),
};

export const accessories = {
  'acc-none': '',
  'acc-collar': g(p('M58 212Q128 248 198 212L202 228Q128 266 54 228Z', A), c(128, 246, 10, '#E2B85C')),
  'acc-bow': g(p('M128 228L94 210C88 222 88 236 94 248Z', A), p('M128 228L162 210C168 222 168 236 162 248Z', A), c(128, 229, 9, A), c(128, 229, 9, INK, 'opacity="0.12"')),
  'acc-bandana': g(p('M64 206Q128 232 192 206C184 236 160 254 128 258C96 254 72 236 64 206Z', A), c(108, 228, 4, WHITE, 'opacity="0.5"'), c(142, 234, 4, WHITE, 'opacity="0.5"'), c(124, 246, 3, WHITE, 'opacity="0.5"')),
  'acc-scarf': g(p('M54 210Q128 246 202 210L206 232Q128 270 50 232Z', A), p('M150 232L172 228L178 256L148 256Z', A), p('M150 232L172 228L178 256L148 256Z', INK, 'opacity="0.12"'), s('M84 228L88 242M112 236L114 252M144 236L142 252M172 228L168 242', WHITE, 4, 'opacity="0.35"')),
  'acc-cone': g(p('M128 10A132 140 0 1 0 128.01 10ZM128 50A100 100 0 1 1 127.99 50Z', '#D3E2E9', 'opacity="0.72" fill-rule="evenodd"'), e(128, 150, 100, 100, 'none', `stroke="${WHITE}" stroke-width="4" opacity="0.6"`)),
  'acc-bandage': g(rect(146, 88, 44, 16, 8, '#EBCFA6', rot(-18, 168, 96)), rect(161, 88, 14, 16, 0, '#DDBB8C', rot(-18, 168, 96))),
};

// ---------------------------------------------------------------------------
// TÜR PARÇALARI
// ---------------------------------------------------------------------------
const cheeks = (y, dx, rx, ry, cx = 128) => e(cx - dx, y, rx, ry, L) + e(cx + dx, y, rx, ry, L);
const muzzle = (cx, cy, rx, ry) => e(cx + 3, cy + 4, rx + 2, ry + 2, D, 'opacity="0.35"') + e(cx, cy, rx, ry, L);
const head = (id, E, extra, meta = {}) => ({ id, svg: g(...(Array.isArray(extra) ? extra : [extra])), ...meta, half: meta.half ?? E?.half });
const hiLight = (x, y, r = 20) => e(x, y, r, r * 0.5, L, `opacity="0.6" ${rot(-50, x, y)}`);
const pair = (d, fill, extra = '') => p(d, fill, extra) + p(mirror(d), fill, extra);
const clayPair = (d, t = 'fur') => clayP(d, t, 3, 4) + clayP(mirror(d), t, -3, 4);

// ---- KEDİ ----
const catRound = clayE(128, 150, 92, 80);
const catWide = clayE(128, 156, 104, 74);
const catOval = clayE(128, 148, 80, 84);
const catChubby = clayE(128, 154, 100, 80);
const catFluffy = clayE(128, 150, 90, 78);
const HEART = 'M128 230C80 230 40 196 38 150C36 100 76 70 128 70C180 70 220 100 218 150C216 196 176 230 128 230Z';
const fluffRing = (cx, cy, rx, ry, from, to, count, r) =>
  Array.from({ length: count }, (_, i) => {
    const a = ((from + ((to - from) * i) / (count - 1)) * Math.PI) / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a), r];
  });

const cat = {
  label: 'Kedi',
  layers: ['background', 'head', 'ears', 'pattern', 'eyes', 'nose', 'mouth', 'whiskers', 'accessory'],
  head: [
    head('cat-head-round', catRound, [catRound.svg, cheeks(182, 17, 22, 17)], { weight: 3 }),
    head('cat-head-wide', catWide, [catWide.svg, cheeks(186, 20, 26, 18)], { weight: 2, faceAnchor: A_(128, 154) }),
    head('cat-head-oval', catOval, [catOval.svg, cheeks(182, 14, 19, 15)], { faceAnchor: A_(128, 148, 0.94) }),
    head('cat-head-heart', null, [clayP(HEART), hiLight(70, 136), cheeks(180, 16, 20, 16)], { weight: 2, half: 'M128 70C76 70 36 100 38 150C40 196 80 230 128 230Z' }),
    head('cat-head-chubby', catChubby, [catChubby.svg, cheeks(184, 24, 30, 22), e(128, 228, 54, 16, L)], { faceAnchor: A_(128, 154) }),
    head('cat-head-fluffy', catFluffy, [clayCircles(fluffRing(128, 160, 86, 64, 15, 165, 8, 22)), catFluffy.svg, cheeks(182, 17, 22, 17)], { faceAnchor: A_(128, 152, 0.95) }),
  ],
  ears: [
    { id: 'cat-ears-upright', weight: 4, svg: g(
      pair('M46 128C40 84 48 46 60 30C66 22 76 22 84 30C100 46 114 68 120 92Z', F),
      pair('M62 104C58 76 64 52 70 44C74 40 78 40 82 46C92 58 100 74 104 90Z', D)) },
    { id: 'cat-ears-fold', weight: 1, svg: g(
      pair('M68 108C68 84 82 68 102 68C114 68 118 80 110 90C98 96 84 102 76 114Z', D, 'transform="translate(3 5)"'),
      pair('M68 108C68 84 82 68 102 68C114 68 118 80 110 90C98 96 84 102 76 114Z', F)) },
    { id: 'cat-ears-big', weight: 1, svg: g(
      pair('M38 136C22 90 24 40 40 18C48 10 60 12 70 22C94 46 112 70 122 94Z', F),
      pair('M56 116C46 84 48 50 56 36C60 30 66 32 72 38C88 56 100 74 106 92Z', D)) },
    { id: 'cat-ears-tufted', weight: 1, svg: g(
      pair('M46 128C40 84 48 46 60 30C66 22 76 22 84 30C100 46 114 68 120 92Z', F),
      pair('M62 104C58 76 64 52 70 44C74 40 78 40 82 46C92 58 100 74 104 90Z', D),
      pair('M66 96C68 82 74 70 80 64C82 74 84 86 86 98Z', L),
      s('M62 28L56 10M194 28L200 10', D, 8)) },
  ],
  pattern: [
    none('cat-pattern-plain', 3),
    { id: 'cat-pattern-tabby', weight: 3, svg: g(s('M128 80L128 100M106 86L110 104M150 86L146 104M44 150L62 154M46 168L62 168M212 150L194 154M210 168L194 168', D, 10)) },
    { id: 'cat-pattern-blaze', weight: 2, svg: g(p('M128 72C134 100 140 128 150 156C140 166 116 166 106 156C116 128 122 100 128 72Z', L)) },
    { id: 'cat-pattern-eyepatch', svg: g(e(158, 140, 28, 25, D)) },
    { id: 'cat-pattern-spots', svg: g(c(86, 98, 11, D), c(172, 96, 8, D), c(190, 172, 12, D), c(62, 186, 9, D)) },
    { id: 'cat-pattern-half', weight: 2, svg: g(p('{{half}}', D)) },
    { id: 'cat-pattern-point', svg: g(e(128, 176, 50, 40, D, 'opacity="0.75"')) },
  ],
  nose: ['nose-cat-pink', 'nose-cat-rose', 'nose-cat-ink', 'nose-cat-small'],
  mouth: ['mouth-smile', 'mouth-w', 'mouth-neutral', 'mouth-open', 'mouth-tongue', 'mouth-surprised'],
  whiskers: [['whiskers-none', 2], ['whiskers-short', 3], ['whiskers-long', 3], ['whiskers-droopy', 1]],
};

// ---- KÖPEK ----
const dRound = clayE(128, 146, 88, 80), dFlat = clayE(128, 150, 96, 76), dLong = clayE(128, 136, 80, 82);
const dWide = clayE(128, 150, 104, 78), dPuppy = clayE(128, 146, 92, 84), dFluffy = clayE(128, 148, 86, 78);
const NARROW = 'M128 236C100 236 84 210 72 180C56 140 52 96 80 76C100 62 156 62 176 76C204 96 200 140 184 180C172 210 156 236 128 236Z';
const SQUARE = 'M60 80C80 66 176 66 196 80C214 94 218 130 216 170C214 206 196 228 168 230L88 230C60 228 42 206 40 170C38 130 42 94 60 80Z';
const dogHead = (id, E, mz, meta = {}, before = '') =>
  head(id, E, [before, E.svg, muzzle(...mz)], { muzzle: ellipsePath(...mz), ...meta });
const dog = {
  label: 'Köpek',
  layers: ['background', 'head', 'ears', 'pattern', 'eyes', 'nose', 'mouth', 'accessory'],
  head: [
    dogHead('dog-head-round', dRound, [128, 181, 46, 34], { weight: 3 }),
    dogHead('dog-head-flat', dFlat, [128, 179, 52, 28], { weight: 2 }),
    dogHead('dog-head-long', dLong, [128, 186, 38, 42], { weight: 2, faceAnchor: A_(128, 144), muzzleAnchor: A_(128, 156) }),
    dogHead('dog-head-wide', dWide, [128, 184, 56, 36], { weight: 2 }),
    head('dog-head-narrow', null, [clayP(NARROW), hiLight(80, 118, 18), muzzle(128, 190, 30, 40)], {
      half: 'M128 62C100 62 84 66 80 76C52 96 56 140 72 180C84 210 100 236 128 236Z', muzzle: ellipsePath(128, 190, 30, 40),
      faceAnchor: A_(128, 146, 0.9), muzzleAnchor: A_(128, 158, 0.9) }),
    dogHead('dog-head-puppy', dPuppy, [128, 192, 38, 26], { weight: 2, faceAnchor: A_(128, 154), muzzleAnchor: A_(128, 166, 0.9) }),
    head('dog-head-square', null, [clayP(SQUARE), hiLight(66, 124), muzzle(128, 184, 52, 34)], {
      half: 'M128 68C96 68 70 70 60 80C42 94 38 130 40 170C42 206 60 228 88 230L128 230Z', muzzle: ellipsePath(128, 184, 52, 34) }),
    dogHead('dog-head-fluffy', dFluffy, [128, 184, 36, 26], { faceAnchor: A_(128, 150, 0.95), muzzleAnchor: A_(128, 158, 0.85) },
      clayCircles(fluffRing(128, 150, 96, 86, 0, 330, 12, 24))),
  ],
  ears: [
    { id: 'dog-ears-upright', weight: 3, svg: g(
      pair('M44 132C36 92 40 50 56 30C62 22 72 22 80 30C98 48 112 72 118 94Z', F),
      pair('M60 110C56 82 60 56 68 46C72 42 76 42 80 48C90 62 98 78 102 94Z', L)) },
    { id: 'dog-ears-semi', weight: 2, svg: g(
      pair('M48 126C40 92 50 62 74 52C92 46 106 54 108 70C100 76 90 80 84 90C78 102 70 114 62 128Z', F),
      pair('M74 52C92 46 106 54 108 70C100 76 90 78 82 70C78 64 76 58 74 52Z', D)) },
    { id: 'dog-ears-floppy', weight: 4, svg: g(
      pair('M66 84C40 84 24 110 22 150C20 186 30 210 48 212C64 214 72 196 74 170C76 140 82 108 84 90C80 86 72 84 66 84Z', D),
      e(40, 146, 7, 24, F, 'opacity="0.45"')) },
    { id: 'dog-ears-long', weight: 2, svg: g(
      pair('M70 82C40 80 22 108 20 150C18 186 22 214 34 228C46 240 66 238 76 222C84 208 80 190 82 170C84 140 88 110 90 92C86 86 78 82 70 82Z', D),
      e(38, 160, 7, 30, F, 'opacity="0.4"')) },
    { id: 'dog-ears-button', weight: 2, svg: g(
      pair('M60 98C58 78 72 62 96 64C104 66 106 76 100 86C92 96 80 104 70 108C64 108 60 104 60 98Z', D, 'transform="translate(2 4)"'),
      pair('M60 98C58 78 72 62 96 64C104 66 106 76 100 86C92 96 80 104 70 108C64 108 60 104 60 98Z', F)) },
  ],
  pattern: [
    none('dog-pattern-plain', 4),
    { id: 'dog-pattern-blaze', weight: 2, svg: g(p('M128 70C134 98 138 124 146 150C138 160 118 160 110 150C118 124 122 98 128 70Z', L)) },
    { id: 'dog-pattern-eyepatch', weight: 2, svg: g(e(158, 138, 28, 25, D)) },
    { id: 'dog-pattern-spots', svg: g(c(84, 100, 11, D), c(170, 92, 8, D), c(192, 168, 12, D), c(60, 170, 9, D)) },
    { id: 'dog-pattern-half', svg: g(p('{{half}}', D)) },
    { id: 'dog-pattern-mask', svg: g(p('{{muzzle}}', D, 'opacity="0.7"')) },
    { id: 'dog-pattern-points', svg: g(e(100, 116, 11, 7, L), e(156, 116, 11, 7, L)) },
  ],
  nose: [['nose-dog', 4], 'nose-dog-wide', 'nose-dog-small', 'nose-dog-liver'],
  mouth: ['mouth-smile', 'mouth-w', 'mouth-neutral', ['mouth-open', 2], ['mouth-tongue', 2], 'mouth-surprised'],
};

// ---- KUŞ ----
const birdBody = (rx = 104) => clayE(128, 262, rx, 70).svg;
const bBudgie = clayE(128, 140, 84, 82), bParrot = clayE(128, 136, 92, 88), bCanary = clayE(128, 146, 80, 78), bCrest = clayE(128, 148, 82, 80);
const bird = {
  label: 'Kuş',
  layers: ['background', 'head', 'pattern', 'eyes', 'nose', 'accessory'],
  head: [
    head('bird-head-budgie', bBudgie, [birdBody(), bBudgie.svg, e(128, 154, 60, 60, L)], { weight: 3 }),
    head('bird-head-parrot', bParrot, [birdBody(112), bParrot.svg], { weight: 2 }),
    head('bird-head-canary', bCanary, [birdBody(96), bCanary.svg, e(128, 176, 46, 34, L, 'opacity="0.7"')], { weight: 2 }),
    head('bird-head-crested', bCrest, [birdBody(),
      clayP('M126 80C112 50 118 22 136 8C144 28 142 56 134 80Z', 'fur', 3, 3),
      clayP('M116 82C96 62 92 38 102 22C114 36 122 58 124 80Z', 'fur', 3, 3),
      bCrest.svg], { weight: 2 }),
  ],
  pattern: [
    none('bird-pattern-plain', 3),
    { id: 'bird-pattern-cheeks', weight: 2, svg: g(c(78, 178, 11, D), c(178, 178, 11, D)) },
    { id: 'bird-pattern-bars', weight: 2, svg: g(s('M86 86Q96 80 106 86Q116 92 126 86Q136 80 146 86Q156 92 166 86M74 102Q84 96 94 102M162 102Q172 96 182 102', D, 6)) },
    { id: 'bird-pattern-throat', svg: g(c(108, 206, 5, D), c(128, 210, 5, D), c(148, 206, 5, D)) },
    { id: 'bird-pattern-blush', weight: 2, svg: g(c(80, 172, 15, '#E9A06A'), c(176, 172, 15, '#E9A06A')) },
    { id: 'bird-pattern-mask', svg: g(e(98, 140, 27, 23, '#F3EFE8'), e(158, 140, 27, 23, '#F3EFE8')) },
  ],
  eyes: ['eyes-dot', 'eyes-round', 'eyes-big', 'eyes-happy', 'eyes-sleepy', 'eyes-calm'],
  nose: [['beak-short', 2], 'beak-hook', 'beak-thin'],
  accessory: [['acc-none', 14], 'acc-bow', 'acc-bandage'],
};

// ---- TAVŞAN ----
const rRound = clayE(128, 160, 86, 72), rLop = clayE(128, 164, 94, 70), rLion = clayE(128, 162, 84, 70);
const EAR_UP = 'M84 118C68 80 62 30 76 12C90 -2 108 22 112 60C114 80 112 100 108 116Z';
const EAR_UP_IN = 'M88 104C78 78 74 42 82 28C90 20 100 40 102 64C103 80 102 94 100 104Z';
const EAR_LOP = 'M92 100C60 92 34 118 32 166C30 204 44 226 62 222C78 218 80 196 82 172C84 146 94 122 104 110Z';
const rabbit = {
  label: 'Tavşan',
  layers: ['background', 'head', 'ears', 'pattern', 'eyes', 'nose', 'mouth', 'whiskers', 'accessory'],
  head: [
    head('rabbit-head-round', rRound, [rRound.svg, cheeks(190, 16, 20, 15)], { weight: 3, faceAnchor: A_(128, 160) }),
    head('rabbit-head-wide', rLop, [rLop.svg, cheeks(194, 20, 24, 16)], { weight: 2, faceAnchor: A_(128, 164) }),
    head('rabbit-head-lionhead', rLion, [clayCircles(fluffRing(128, 150, 92, 84, 150, 390, 10, 24), 'furLight'), rLion.svg, cheeks(192, 16, 20, 15)], { faceAnchor: A_(128, 162, 0.95) }),
  ],
  ears: [
    { id: 'rabbit-ears-up', weight: 3, svg: g(clayPair(EAR_UP), pair(EAR_UP_IN, L)) },
    { id: 'rabbit-ears-lop', weight: 2, svg: g(clayPair(EAR_LOP)) },
    { id: 'rabbit-ears-half', svg: g(clayP(EAR_UP, 'fur', 3, 4), p(EAR_UP_IN, L), clayP(mirror(EAR_LOP), 'fur', -3, 4)) },
  ],
  pattern: [
    none('rabbit-pattern-plain', 3),
    { id: 'rabbit-pattern-blaze', weight: 2, svg: g(p('M128 96C134 120 138 140 144 166C136 174 120 174 112 166C118 140 122 120 128 96Z', L)) },
    { id: 'rabbit-pattern-half', svg: g(p('{{half}}', D)) },
    { id: 'rabbit-pattern-spots', svg: g(c(90, 116, 10, D), c(170, 110, 8, D), c(188, 186, 10, D), c(66, 190, 8, D)) },
    { id: 'rabbit-pattern-eyepatch', svg: g(e(158, 150, 26, 23, D)) },
  ],
  nose: [['nose-bunny', 3], 'nose-button'],
  mouth: [['mouth-w', 3], 'mouth-smile', 'mouth-neutral', 'mouth-surprised'],
  whiskers: ['whiskers-none', ['whiskers-short', 2], 'whiskers-long'],
};

// ---- KEMİRGEN ----
const EAR_PINK = '#E7B6AE';
const hHam = clayE(128, 160, 100, 76), hGuinea = clayE(128, 160, 98, 74), hRat = clayE(128, 160, 82, 70);
const rodent = {
  label: 'Küçük kemirgen',
  layers: ['background', 'head', 'pattern', 'eyes', 'nose', 'mouth', 'whiskers', 'accessory'],
  head: [
    head('rodent-head-hamster', hHam, [clayC(66, 98, 22), c(66, 98, 12, EAR_PINK), clayC(190, 98, 22), c(190, 98, 12, EAR_PINK),
      hHam.svg, e(128, 198, 72, 40, L)], { weight: 3, faceAnchor: A_(128, 158, 0.95) }),
    head('rodent-head-guinea', hGuinea, [e(58, 118, 24, 15, D, rot(35, 58, 118)), e(198, 118, 24, 15, D, rot(-35, 198, 118)),
      hGuinea.svg, e(128, 186, 42, 28, L)], { weight: 3, faceAnchor: A_(128, 160) }),
    head('rodent-head-rat', hRat, [clayC(64, 94, 32), c(64, 94, 20, EAR_PINK), clayC(192, 94, 32), c(192, 94, 20, EAR_PINK),
      hRat.svg, e(128, 188, 32, 24, L)], { faceAnchor: A_(128, 160, 0.9) }),
  ],
  pattern: [
    none('rodent-pattern-plain', 3),
    { id: 'rodent-pattern-blaze', weight: 2, svg: g(p('M128 92C134 118 138 140 144 166C136 174 120 174 112 166C118 140 122 118 128 92Z', L)) },
    { id: 'rodent-pattern-half', svg: g(p('{{half}}', D)) },
    { id: 'rodent-pattern-spots', svg: g(c(88, 112, 10, D), c(172, 108, 8, D), c(196, 176, 9, D), c(64, 182, 8, D)) },
    { id: 'rodent-pattern-rosette', svg: g(c(128, 102, 18, L), s('M118 104Q128 90 138 104', D, 5)) },
  ],
  nose: [['nose-button', 3], 'nose-dot'],
  mouth: [['mouth-w', 3], 'mouth-smile', 'mouth-neutral'],
  whiskers: ['whiskers-none', ['whiskers-short', 2], 'whiskers-long'],
};

// ---- KİRPİ ----
const hhFace = clayE(128, 172, 74, 62);
const HH_POINTY = 'M128 232C100 232 62 210 56 172C50 134 86 108 128 108C170 108 206 134 200 172C194 210 156 232 128 232Z';
const quills = (rx, ry) => p(spikes(128, 160, rx, ry, 150, 390, 14, 22), D) + p(spikes(128, 160, rx - 14, ry - 14, 160, 380, 12, 18), INK, 'opacity="0.12"');
const hedgehog = {
  label: 'Kirpi',
  layers: ['background', 'head', 'eyes', 'nose', 'mouth', 'accessory'],
  head: [
    head('hedgehog-head-round', hhFace, [quills(116, 108), clayC(84, 120, 12), clayC(172, 120, 12), hhFace.svg, e(128, 194, 32, 22, L)],
      { weight: 2, faceAnchor: A_(128, 168, 0.82) }),
    head('hedgehog-head-pointy', null, [quills(112, 104), clayC(86, 124, 11), clayC(170, 124, 11), clayP(HH_POINTY), hiLight(76, 160, 16), e(128, 204, 26, 20, L)],
      { faceAnchor: A_(128, 172, 0.8) }),
  ],
  eyes: ['eyes-dot', 'eyes-round', 'eyes-sleepy', 'eyes-happy', 'eyes-calm'],
  nose: [['nose-round', 2], 'nose-dot'],
  mouth: ['mouth-smile', 'mouth-neutral', 'mouth-w'],
  accessory: [['acc-none', 14], 'acc-bow', 'acc-scarf', 'acc-bandage'],
};

// ---- GELİNCİK ----
const fRound = clayE(128, 152, 86, 74), fSlim = clayE(128, 150, 74, 80);
const fEars = (x) => clayC(x, 96, 20) + c(x, 96, 10, L) + clayC(256 - x, 96, 20) + c(256 - x, 96, 10, L);
const ferret = {
  label: 'Gelincik',
  layers: ['background', 'head', 'pattern', 'eyes', 'nose', 'mouth', 'whiskers', 'accessory'],
  head: [
    head('ferret-head-round', fRound, [fEars(70), fRound.svg, e(128, 188, 40, 28, L)], { weight: 2 }),
    head('ferret-head-slim', fSlim, [fEars(76), fSlim.svg, e(128, 190, 32, 30, L)], { faceAnchor: A_(128, 150, 0.9) }),
  ],
  pattern: [
    none('ferret-pattern-plain', 2),
    { id: 'ferret-pattern-mask', weight: 3, svg: g(p('M52 140C60 116 100 116 128 130C156 116 196 116 204 140C200 162 160 166 128 152C96 166 56 162 52 140Z', D)) },
    { id: 'ferret-pattern-blaze', svg: g(p('M128 74C134 100 136 120 140 144C134 150 122 150 116 144C120 120 122 100 128 74Z', L)) },
    { id: 'ferret-pattern-panda', svg: g(p('M52 140C60 116 100 116 128 130C156 116 196 116 204 140C200 162 160 166 128 152C96 166 56 162 52 140Z', D), p('M128 74C134 100 136 120 140 144C134 150 122 150 116 144C120 120 122 100 128 74Z', L)) },
  ],
  eyes: ['eyes-dot', 'eyes-round', 'eyes-sleepy', 'eyes-happy', 'eyes-wink'],
  nose: [['nose-button', 2], 'nose-dot'],
  mouth: [['mouth-w', 2], 'mouth-smile', 'mouth-neutral'],
  whiskers: [['whiskers-short', 2], 'whiskers-long', 'whiskers-none'],
};

// ---- KAPLUMBAĞA ----
const SHELL = 'M8 256C8 196 60 168 128 168C196 168 248 196 248 256Z';
const shell = () => p('M100 136L100 196C112 204 144 204 156 196L156 136Z', F) +
  p(SHELL, D, 'transform="translate(4 5)"') + p(SHELL, D) + p(SHELL, INK, 'opacity="0.12" transform="translate(5 6)"') +
  e(128, 212, 32, 18, L, 'opacity="0.4"') + e(66, 230, 24, 15, L, 'opacity="0.4"') + e(190, 230, 24, 15, L, 'opacity="0.4"');
const tRound = clayE(128, 128, 72, 66), tLong = clayE(128, 124, 62, 72);
const turtle = {
  label: 'Kaplumbağa',
  layers: ['background', 'head', 'pattern', 'eyes', 'nose', 'mouth', 'accessory'],
  head: [
    head('turtle-head-round', tRound, [shell(), tRound.svg], { weight: 2, faceAnchor: A_(128, 132, 0.85) }),
    head('turtle-head-long', tLong, [shell(), tLong.svg], { faceAnchor: A_(128, 130, 0.8) }),
  ],
  pattern: [
    none('turtle-pattern-plain', 2),
    { id: 'turtle-pattern-spots', svg: g(c(98, 92, 7, L), c(160, 88, 6, L), c(84, 150, 5, L), c(172, 152, 6, L)) },
    { id: 'turtle-pattern-stripes', svg: g(s('M72 118Q78 148 96 174M184 118Q178 148 160 174M128 66L128 86', L, 7)) },
    { id: 'turtle-pattern-redear', svg: g(e(72, 126, 13, 8, '#D9775B'), e(184, 126, 13, 8, '#D9775B')) },
  ],
  eyes: ['eyes-dot', 'eyes-round', 'eyes-sleepy', 'eyes-calm', 'eyes-happy'],
  nose: ['nose-nostrils'],
  mouth: [['turtle-mouth-smile', 2], 'turtle-mouth-flat'],
  accessory: [['acc-none', 14], 'acc-bow', 'acc-bandage'],
};

// ---- KERTENKELE ----
const lIg = clayE(128, 140, 82, 70);
const BEARDED = 'M128 220C82 220 40 196 38 156C36 112 76 76 128 76C180 76 220 112 218 156C216 196 174 220 128 220Z';
const lizard = {
  label: 'Kertenkele',
  layers: ['background', 'head', 'pattern', 'eyes', 'nose', 'mouth', 'accessory'],
  head: [
    head('lizard-head-iguana', lIg, [p(spikes(128, 150, 96, 96, 215, 325, 6, 18), D),
      clayP('M96 190C92 232 120 252 132 252C150 250 164 228 160 192Z', 'furLight', 3, 3), lIg.svg,
      c(64, 160, 12, L), c(192, 160, 12, L)], { weight: 2, faceAnchor: A_(128, 140, 0.9) }),
    head('lizard-head-bearded', null, [p(spikes(128, 160, 112, 92, 10, 170, 9, 20), D), p(spikes(128, 120, 104, 70, 190, 350, 7, 14), D),
      clayP(BEARDED), hiLight(70, 130, 18)], { faceAnchor: A_(128, 146, 0.95), half: 'M128 76C76 76 36 112 38 156C40 196 82 220 128 220Z' }),
  ],
  pattern: [
    none('lizard-pattern-plain', 2),
    { id: 'lizard-pattern-spots', svg: g(c(92, 100, 8, D), c(164, 96, 7, D), c(70, 140, 6, D), c(186, 142, 7, D), c(128, 92, 5, D)) },
    { id: 'lizard-pattern-bands', svg: g(s('M84 100Q128 84 172 100M74 122Q90 116 96 118M160 118Q166 116 182 122', D, 8)) },
    { id: 'lizard-pattern-cheeks', svg: g(c(76, 172, 10, '#D9775B', 'opacity="0.8"'), c(180, 172, 10, '#D9775B', 'opacity="0.8"')) },
  ],
  eyes: ['eyes-dot', 'eyes-round', 'eyes-sleepy', 'eyes-calm', 'eyes-happy'],
  nose: ['nose-nostrils'],
  mouth: [['lizard-mouth-wide', 2], 'lizard-mouth-flat'],
  accessory: [['acc-none', 14], 'acc-bow', 'acc-bandage'],
};

// ---- YILAN ----
const SPADE = 'M128 178C100 178 64 162 56 128C48 92 82 62 128 62C174 62 208 92 200 128C192 162 156 178 128 178Z';
const coil = () => clayE(128, 236, 114, 34, 'fur', { light: false }).svg + clayE(128, 206, 88, 28, 'fur', { light: false }).svg +
  p('M102 130C100 170 104 190 108 206L148 206C152 190 156 170 154 130Z', F);
const sRound = clayE(128, 118, 74, 58);
const snakeEyes = {
  'snake-eyes-slit': g(c(98, 140, 16, '#EBD58C'), c(158, 140, 16, '#EBD58C'), e(98, 140, 4, 12, INK), e(158, 140, 4, 12, INK)),
};
const snake = {
  label: 'Yılan',
  layers: ['background', 'head', 'pattern', 'eyes', 'nose', 'mouth', 'accessory'],
  head: [
    head('snake-head-round', sRound, [coil(), sRound.svg], { weight: 2, faceAnchor: A_(128, 118, 0.85) }),
    head('snake-head-spade', null, [coil(), clayP(SPADE), hiLight(76, 108, 16)], { faceAnchor: A_(128, 116, 0.85), half: 'M128 62C82 62 48 92 56 128C64 162 100 178 128 178Z' }),
  ],
  pattern: [
    none('snake-pattern-plain', 2),
    { id: 'snake-pattern-bands', weight: 2, svg: g(e(56, 234, 8, 18, D, rot(-20, 56, 234)), e(100, 240, 8, 20, D, rot(-8, 100, 240)), e(156, 240, 8, 20, D, rot(8, 156, 240)), e(200, 234, 8, 18, D, rot(20, 200, 234)), e(82, 204, 7, 15, D, rot(-14, 82, 204)), e(174, 204, 7, 15, D, rot(14, 174, 204)), e(128, 160, 22, 7, D)) },
    { id: 'snake-pattern-spots', svg: g(c(100, 84, 7, D), c(158, 82, 6, D), c(72, 232, 8, D), c(128, 244, 8, D), c(184, 232, 8, D), c(110, 204, 6, D), c(150, 206, 6, D)) },
    { id: 'snake-pattern-diamond', svg: g(p('M128 70L148 88L128 106L108 88Z', D, `stroke="${D}" stroke-width="8" stroke-linejoin="round"`)) },
    { id: 'snake-pattern-belly', svg: g(e(128, 246, 74, 10, L), e(128, 216, 54, 8, L), rect(116, 150, 24, 56, 12, L)) },
  ],
  eyes: [['snake-eyes-slit', 3], 'eyes-dot', 'eyes-round', 'eyes-happy', 'eyes-calm'],
  nose: ['nose-nostrils'],
  mouth: [['snake-mouth-smile', 2], ['snake-mouth-tongue', 2]],
  accessory: [['acc-none', 14], 'acc-bow', 'acc-bandage'],
};

// ---- BALIK (yandan; göz ve ağız türe özel, sabit konumda) ----
const fishEyes = {
  'fish-eye-round': g(c(76, 120, 19, SCLERA), c(72, 121, 12, INK), hl(68, 117, 4)),
  'fish-eye-dot': g(c(76, 120, 11, INK), hl(73, 117, 3.5)),
  'fish-eye-big': g(c(78, 118, 24, SCLERA), c(74, 120, 16, INK), hl(69, 114, 5.5), hl(78, 126, 2.5)),
  'fish-eye-happy': g(s('M62 124Q76 106 90 124', INK, 8)),
};
const fiRound = clayE(122, 136, 96, 78), fiLong = clayE(124, 136, 104, 56), fiBetta = clayE(116, 136, 84, 60);
const fish = {
  label: 'Balık',
  layers: ['background', 'head', 'pattern', 'eyes', 'mouth'],
  head: [
    head('fish-head-round', fiRound, [
      clayP('M196 136C220 100 244 84 250 90C254 110 246 130 236 136C246 142 254 162 250 182C244 188 220 172 196 136Z', 'fur', 3, 4),
      clayP('M96 74C116 40 160 40 178 78Z', 'fur', 3, 4), fiRound.svg,
      e(140, 170, 24, 12, D, `opacity="0.7" ${rot(-20, 140, 170)}`)], { weight: 3 }),
    head('fish-head-long', fiLong, [
      clayP('M204 136C226 108 246 92 252 98C246 114 240 126 236 136C240 146 246 158 252 174C246 180 226 164 204 136Z', 'fur', 3, 4),
      clayP('M108 90C124 70 156 70 170 92Z', 'fur', 3, 3), fiLong.svg,
      e(140, 160, 20, 9, D, `opacity="0.7" ${rot(-20, 140, 160)}`)], { weight: 2 }),
    head('fish-head-betta', fiBetta, [
      clayP('M176 136C210 70 256 56 256 100C256 120 240 128 250 140C258 162 250 204 224 212C200 216 188 172 176 136Z', 'fur', 3, 4),
      clayP('M84 88C96 34 160 26 188 62C196 74 186 90 176 96Z', 'fur', 3, 4),
      clayP('M100 184C110 230 160 244 180 220C186 210 176 196 166 190Z', 'fur', 3, 4), fiBetta.svg], { weight: 2 }),
  ],
  pattern: [
    none('fish-pattern-plain', 2),
    { id: 'fish-pattern-spots', svg: g(c(130, 110, 8, L), c(156, 130, 6, L), c(118, 160, 7, L), c(150, 158, 5, L), c(102, 132, 5, L)) },
    { id: 'fish-pattern-stripes', weight: 2, svg: g(s('M112 98L112 174M152 100L152 170', L, 14)) },
    { id: 'fish-pattern-belly', weight: 2, svg: g(e(118, 166, 64, 16, L)) },
    { id: 'fish-pattern-scales', svg: g(s('M110 112Q118 124 126 112M130 112Q138 124 146 112M150 112Q158 124 166 112M120 134Q128 146 136 134M140 134Q148 146 156 134', D, 5, 'opacity="0.55"')) },
  ],
  eyes: [['fish-eye-round', 3], 'fish-eye-dot', 'fish-eye-big', 'fish-eye-happy'],
  mouth: [['fish-mouth-smile', 2], 'fish-mouth-o', 'fish-mouth-kiss'],
};

// ---- ÇİFTLİK (keçi, koyun, at) ----
const HORN = '#CFC1AA';
const goatFace = clayE(128, 150, 70, 84), sheepFace = clayE(128, 162, 58, 70);
const sideEars = (x, y, rx, ry, deg) =>
  e(x + 3, y + 4, rx, ry, D, rot(deg, x + 3, y + 4)) + e(x, y, rx, ry, F, rot(deg, x, y)) +
  e(256 - x - 3, y + 4, rx, ry, D, rot(-deg, 256 - x - 3, y + 4)) + e(256 - x, y, rx, ry, F, rot(-deg, 256 - x, y)) +
  e(x + 4, y, rx * 0.55, ry * 0.45, L, rot(deg, x + 4, y)) + e(252 - x, y, rx * 0.55, ry * 0.45, L, rot(-deg, 252 - x, y));
const HORSE = 'M128 246C98 246 84 226 84 200C84 170 78 140 80 110C82 76 102 58 128 58C154 58 174 76 176 110C178 140 172 170 172 200C172 226 158 246 128 246Z';
const WOOL = [[78, 100, 26], [100, 76, 26], [128, 66, 26], [156, 76, 26], [178, 100, 26], [68, 130, 22], [188, 130, 22]];
const farm = {
  label: 'Çiftlik hayvanı',
  layers: ['background', 'head', 'pattern', 'eyes', 'nose', 'mouth', 'accessory'],
  head: [
    head('farm-head-goat', goatFace, [pair('M98 74C92 50 98 34 110 28C108 44 110 58 114 72Z', HORN), sideEars(52, 118, 30, 13, 18),
      goatFace.svg, clayP('M114 222C114 244 124 252 128 252C132 252 142 244 142 222Z', 'furLight', 2, 3)],
      { weight: 2, faceAnchor: A_(128, 144, 0.9), muzzleAnchor: A_(128, 170, 0.9) }),
    head('farm-head-sheep', sheepFace, [sideEars(58, 128, 30, 12, 14), sheepFace.svg,
      WOOL.map(([x, y, r]) => c(x + 3, y + 4, r, D, 'opacity="0.5"')).join(''), WOOL.map(([x, y, r]) => c(x, y, r, L)).join('')],
      { weight: 2, faceAnchor: A_(128, 162, 0.85), muzzleAnchor: A_(128, 172, 0.85) }),
    head('farm-head-horse', null, [clayPair('M84 70C80 46 88 24 98 16C106 30 108 52 104 72Z'), clayP(HORSE), hiLight(92, 112, 16),
      e(128, 214, 44, 32, L), p('M100 62C110 46 146 46 156 62C150 80 138 92 128 98C118 92 106 80 100 62Z', D)],
      { weight: 2, faceAnchor: A_(128, 130, 0.95), muzzleAnchor: A_(128, 194, 0.9), half: 'M128 58C102 58 82 76 80 110C78 140 84 170 84 200C84 226 98 246 128 246Z' }),
  ],
  pattern: [
    none('farm-pattern-plain', 3),
    { id: 'farm-pattern-blaze', weight: 2, svg: g(p('M128 92C134 120 136 150 140 196C134 204 122 204 116 196C120 150 122 120 128 92Z', L)) },
    { id: 'farm-pattern-spots', svg: g(c(98, 110, 9, D), c(160, 168, 10, D), c(94, 190, 7, D)) },
  ],
  eyes: ['eyes-dot', 'eyes-round', 'eyes-sleepy', 'eyes-calm', 'eyes-happy', 'eyes-big'],
  nose: [['nose-nostrils', 2], 'nose-farm-wide'],
  mouth: [['mouth-smile', 2], 'mouth-neutral', 'mouth-w'],
  accessory: [['acc-none', 14], 'acc-collar', 'acc-bow', 'acc-bandana', 'acc-bandage'],
};

// ---- GENEL (türü bilinmeyen) ----
const oBear = clayE(128, 152, 90, 80), oBlob = clayE(128, 146, 96, 90);
const toe = (x, y, rx, ry, deg) => e(x + 4, y + 5, rx, ry, D, rot(deg, x + 4, y + 5)) + e(x, y, rx, ry, F, rot(deg, x, y)) + e(x - rx * 0.3, y - ry * 0.35, rx * 0.35, ry * 0.2, L, `opacity="0.6" ${rot(deg - 30, x - rx * 0.3, y - ry * 0.35)}`);
const other = {
  label: 'Genel',
  layers: ['background', 'head', 'eyes', 'nose', 'mouth', 'accessory'],
  head: [
    head('other-head-bear', oBear, [clayC(62, 88, 26), c(62, 88, 14, L), clayC(194, 88, 26), c(194, 88, 14, L), oBear.svg, e(128, 186, 40, 30, L)], { weight: 3 }),
    head('other-head-blob', oBlob, [oBlob.svg, cheeks(184, 30, 22, 14)], { weight: 2 }),
    head('other-head-paw', null, [clayP('M128 236C96 236 68 220 68 192C68 166 98 148 128 148C158 148 188 166 188 192C188 220 160 236 128 236Z'),
      hiLight(94, 172, 14), toe(64, 118, 22, 28, -22), toe(104, 78, 22, 30, -6), toe(152, 78, 22, 30, 6), toe(192, 118, 22, 28, 22)],
      { weight: 2, faceless: true }),
  ],
  eyes: ['eyes-dot', 'eyes-round', 'eyes-happy', 'eyes-calm', 'eyes-sleepy', 'eyes-big'],
  nose: [['nose-round', 2], 'nose-dot', 'nose-button'],
  mouth: [['mouth-smile', 2], 'mouth-w', 'mouth-neutral'],
};

// ---------------------------------------------------------------------------
// PALETLER (fur, furDark, furLight). dark: true → koyu tüy; birleştirici göz akı olan gözleri seçer.
// ---------------------------------------------------------------------------
export const palettes = {
  cat: [
    pal('orange', '#E3A066', '#C27B45', '#F5DCC0', { weight: 3 }),
    pal('cream', '#EAD9BF', '#CDB596', '#F7EEDF', { weight: 2 }),
    pal('gray', '#A9AAB0', '#7F8188', '#DADBDF', { weight: 2 }),
    pal('black', '#57525A', '#3A363D', '#8E8992', { weight: 2, dark: true }),
    pal('black-white', '#4F4B4E', '#36333A', '#F3EFEA', { weight: 2, dark: true }),
    pal('white', '#F3EFE9', '#D6CEC3', '#FFFFFF', { weight: 2 }),
    pal('brown-tabby', '#A88464', '#7D5F45', '#DCC6AB', { weight: 2 }),
    pal('blue-gray', '#8E98A6', '#6D7684', '#C7CED8', { weight: 1 }),
    pal('hairless', '#E8C6B4', '#C79C88', '#F5E2D7', { weight: 0.5 }),
  ],
  dog: [
    pal('cream', '#E8D3AE', '#C9AF86', '#F6EBD7', { weight: 2 }),
    pal('golden', '#DDA65F', '#B37F3E', '#F2D5A8', { weight: 3 }),
    pal('fawn', '#DCC3A0', '#8E7458', '#F0E2CC', { weight: 2 }),
    pal('brown', '#9A6B4B', '#714B32', '#CDA88A', { weight: 2 }),
    pal('black', '#4A4646', '#302D2E', '#C19C76', { weight: 2, dark: true }),
    pal('white-brown', '#F1EAE0', '#A87652', '#FFFFFF', { weight: 2 }),
    pal('red', '#D99A62', '#B0713C', '#F7E6D2', { weight: 2 }),
    pal('gray', '#A3A9B0', '#7A818A', '#D7DBDF', { weight: 1 }),
  ],
  bird: [
    pal('green', '#8DBE6E', '#6A9A50', '#EFE08A', { weight: 3 }),
    pal('blue', '#7FA9D6', '#5D86B3', '#F2F0EA', { weight: 3 }),
    pal('yellow', '#EBD27A', '#C9AE52', '#F7EDBD', { weight: 2 }),
    pal('gray', '#A8A6A6', '#7F7C7C', '#E7E4E0', { weight: 2 }),
    pal('cockatiel', '#C9C4BC', '#9E988F', '#F2E2A0', { weight: 2 }),
    pal('peach', '#E8B48A', '#C98E62', '#F6E0C8', { weight: 1 }),
  ],
  rabbit: [
    pal('white', '#F3EFE9', '#D6CEC3', '#FFFFFF', { weight: 2 }),
    pal('gray', '#B5B1AE', '#8D8885', '#E0DDDA', { weight: 2 }),
    pal('brown', '#B08A6A', '#87654A', '#E1CDB8', { weight: 2 }),
    pal('cream', '#E9D6B8', '#CBB492', '#F6ECDC', { weight: 2 }),
    pal('orange', '#DDAA7A', '#B98552', '#F3DCC2', { weight: 1 }),
    pal('black', '#55504F', '#3A3636', '#9A9391', { weight: 1, dark: true }),
  ],
  rodent: [
    pal('golden', '#E2B47A', '#C08E55', '#F7E7CF', { weight: 3 }),
    pal('cream', '#EAD9BF', '#CDB596', '#F8F0E2', { weight: 2 }),
    pal('gray', '#B9B3AE', '#8F8984', '#E4E0DC', { weight: 2 }),
    pal('white', '#F4F0EA', '#D8D0C5', '#FFFFFF', { weight: 2 }),
    pal('brown', '#A57C5C', '#7E5C42', '#DCC7B0', { weight: 2 }),
    pal('black', '#5A5452', '#3E3937', '#B9AEA6', { weight: 1, dark: true }),
  ],
  hedgehog: [
    pal('brown', '#E6CFAE', '#8A6B52', '#F4E6D2', { weight: 3 }),
    pal('dark', '#DCC5A6', '#5E5048', '#EFE2CF', { weight: 2 }),
    pal('pale', '#F2E6D8', '#C7B39C', '#FBF4EB', { weight: 1 }),
    pal('cinnamon', '#EBCFAE', '#B07E55', '#F7E8D6', { weight: 1 }),
  ],
  ferret: [
    pal('sable', '#E8D7BC', '#6E5644', '#F7EEDF', { weight: 3 }),
    pal('albino', '#F4EEE2', '#D9CDBB', '#FFFFFF', { weight: 2 }),
    pal('champagne', '#E3C9A3', '#B08F6A', '#F4E6CF', { weight: 2 }),
    pal('black-sable', '#D8C7AE', '#4F443D', '#F2E9DA', { weight: 1 }),
    pal('silver', '#DCDAD6', '#76716D', '#F4F2EF', { weight: 1 }),
  ],
  turtle: [
    pal('green', '#A3B67F', '#71874F', '#D3DDB6', { weight: 3 }),
    pal('olive', '#B4AE7A', '#857F4E', '#DEDAB5', { weight: 2 }),
    pal('tortoise', '#C7AE85', '#8C6E4A', '#E6D7BB', { weight: 2 }),
    pal('slate', '#8FA393', '#62786A', '#C8D4C9', { weight: 1 }),
  ],
  lizard: [
    pal('green', '#9CBF7E', '#6E9455', '#D6E5BF', { weight: 3 }),
    pal('sand', '#DDB98A', '#B08B5E', '#F2DFC2', { weight: 3 }),
    pal('orange', '#E2A46C', '#B87A45', '#F4D7B6', { weight: 1 }),
    pal('gray-green', '#A6AE98', '#7A8270', '#D6DACB', { weight: 1 }),
  ],
  snake: [
    pal('green', '#9FC08A', '#729561', '#D5E5C9', { weight: 2 }),
    pal('corn', '#E3A27A', '#C0784F', '#F3D2B8', { weight: 2 }),
    pal('python', '#B59A74', '#6F5A43', '#E6D7BE', { weight: 2 }),
    pal('gray', '#A9A9A4', '#7B7B76', '#D8D8D3', { weight: 1 }),
    pal('banana', '#EAD58C', '#C9B062', '#F6EBC4', { weight: 1 }),
  ],
  fish: [
    pal('goldfish', '#EBA066', '#C9783F', '#F7D7B3', { weight: 3 }),
    pal('blue', '#86AACB', '#5E84A9', '#D3E2EE', { weight: 2 }),
    pal('yellow', '#EDD177', '#C8AA4E', '#F7EBC0', { weight: 2 }),
    pal('coral', '#E58E7E', '#C26A5A', '#F6CFC5', { weight: 2 }),
    pal('teal', '#7DB5AC', '#56908A', '#CFE5E1', { weight: 2 }),
    pal('koi', '#F4EDE4', '#E0945A', '#FFFFFF', { weight: 1 }),
  ],
  farm: [
    pal('white', '#F1ECE4', '#D3C9BB', '#FFFFFF', { weight: 3 }),
    pal('cream', '#E8D8BE', '#C9B493', '#F6EEDF', { weight: 2 }),
    pal('brown', '#A47B5A', '#7A5539', '#D9C4AA', { weight: 2 }),
    pal('chestnut', '#B5703F', '#8A5029', '#E3C3A3', { weight: 2 }),
    pal('black', '#565150', '#3B3736', '#E9E1D5', { weight: 1, dark: true }),
    pal('gray', '#ABA8A4', '#84817D', '#DDDAD6', { weight: 1 }),
  ],
  other: [
    pal('warm-gray', '#B9AFA6', '#958A80', '#DDD5CD', { weight: 2 }),
    pal('sand', '#D9BF98', '#B89C73', '#EEDFC6', { weight: 2 }),
    pal('cocoa', '#9C7A62', '#775A46', '#C9AE97', { weight: 2 }),
    pal('cream', '#EADCC8', '#CDBBA3', '#F6EEE2', { weight: 2 }),
    pal('sage', '#AAB59A', '#86926F', '#D2DAC6', { weight: 1 }),
    pal('slate', '#9AA3AE', '#77818D', '#C9CFD6', { weight: 1 }),
  ],
};

export const accentColors = ['#5E9C94', '#D9775B', '#45597A', '#D3A13F', '#C96F7E', '#8BA06B'];

// ---------------------------------------------------------------------------
// JSON'a dönüştürme: türlerde id ile anılan ortak parçalar tam nesneye açılır.
// ---------------------------------------------------------------------------
const POOLS = { eyes: { ...eyes, ...snakeEyes, ...fishEyes }, nose: noses, mouth: mouths, whiskers, accessory: accessories };
const SHARED = {
  eyes: Object.keys(eyes),
  nose: ['nose-button', 'nose-dot', 'nose-bunny', 'nose-round', 'nose-nostrils'],
  mouth: ['mouth-smile', 'mouth-w', 'mouth-neutral', 'mouth-open', 'mouth-tongue', 'mouth-surprised'],
  accessory: [['acc-none', 14], 'acc-collar', 'acc-bow', 'acc-bandana', 'acc-scarf', 'acc-cone', 'acc-bandage'],
};
const expand = (layer, list) => list.map((item) => {
  const [id, weight] = Array.isArray(item) ? item : [item, undefined];
  const svg = POOLS[layer][id];
  if (svg === undefined) throw new Error(`bilinmeyen parça ${layer}/${id}`);
  const part = { id, svg };
  if (weight !== undefined) part.weight = weight;
  if (layer === 'eyes' && SCLERA_EYES.has(id)) part.sclera = true;
  if (layer === 'eyes' && (id === 'snake-eyes-slit' || id === 'fish-eye-round' || id === 'fish-eye-big')) part.sclera = true;
  return part;
});

export function buildPetLibrary() {
  const speciesSrc = { cat, dog, bird, rabbit, rodent, hedgehog, ferret, turtle, lizard, snake, fish, farm, other };
  const species = {};
  for (const [key, sp] of Object.entries(speciesSrc)) {
    const out = { label: sp.label, layers: sp.layers };
    for (const layer of sp.layers) {
      if (layer === 'background') continue;
      const list = sp[layer];
      if (!list) continue;
      out[layer] = typeof list[0] === 'object' && !Array.isArray(list[0]) ? list.map((pt) => {
        const o = { ...pt };
        if (!o.half) delete o.half;
        if (o.weight === undefined) delete o.weight;
        return o;
      }) : expand(layer, list);
    }
    species[key] = out;
  }
  const shared = {};
  for (const [layer, list] of Object.entries(SHARED)) shared[layer] = expand(layer, list);
  return {
    name: 'pofuduk/pets',
    version: '1.0.0',
    viewBox: 256,
    faceOrigin: { x: 128, y: 150 },
    layerOrder: ['background', 'head', 'ears', 'pattern', 'eyes', 'nose', 'mouth', 'whiskers', 'accessory'],
    faceLayers: ['eyes', 'nose', 'mouth', 'whiskers'],
    muzzleLayers: ['nose', 'mouth', 'whiskers'],
    palettes,
    backgroundColors,
    accentColors,
    backgrounds,
    species,
    shared,
  };
}
