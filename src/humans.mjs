// Pofuduk — insan parçaları.
// Yüz katmanları (ageLines, eyes, eyebrows, nose, mouth, facialHair, glasses) varsayılan
// yüz merkezi (128,120) için çizilir; head.faceAnchor farklıysa birleştirici taşır.
import {
  INK, WHITE, SCLERA, TONGUE,
  e, c, p, s, rect, g, rot, mirror, clayE, clayP, clayCircles,
  backgrounds, backgroundColors,
} from './shared.mjs';

const SK = '{{skin}}', SKD = '{{skinDark}}', SKL = '{{skinLight}}';
const H = '{{hair}}', HD = '{{hairDark}}', HL = '{{hairLight}}';
const C = '{{clothes}}', CD = '{{clothesDark}}', CL = '{{clothesLight}}';
const SC = '{{scarf}}', SCD = '{{scarfDark}}', SCL = '{{scarfLight}}';
const AC = '{{accent}}';
const A_ = (x, y, scale = 1) => ({ x, y, scale });
const trio = (prefix) => (id, b, d, l, extra = {}) => ({ id, ...extra, [prefix]: b, [prefix + 'Dark']: d, [prefix + 'Light']: l });
const skinT = trio('skin'), hairT = trio('hair'), clothesT = trio('clothes');
const part = (id, svg, meta = {}) => ({ id, svg, ...meta });
const none = (id, meta = {}) => ({ id, svg: '', ...meta });
const pair = (d, fill, extra = '') => p(d, fill, extra) + p(mirror(d), fill, extra);
const hairP = (d) => p(d, HD, 'transform="translate(3 4)"') + p(d, H);
const hairShine = (x = 100, y = 58) => e(x, y, 16, 6, HL, `opacity="0.7" ${rot(-25, x, y)}`);

// ---------------------------------------------------------------------------
// GÖVDE (boyun dahil; boyun uzun saçın önünde kalsın diye gövde katmanında)
// ---------------------------------------------------------------------------
const SH = 'M18 256C18 222 44 198 84 192C98 190 110 189 128 189C146 189 158 190 172 192C212 198 238 222 238 256Z';
const shoulders = (b = C, d = CD, l = CL) =>
  p(SH, d, 'transform="translate(5 3)"') + p(SH, b) + e(62, 226, 26, 9, l, `opacity="0.55" ${rot(-28, 62, 226)}`);
const NECK = p('M106 140L106 190C114 200 142 200 150 190L150 140Z', SK) + p('M106 140L106 176C116 190 140 190 150 176L150 140Z', SKD);
const COAT = '#F3F0EA', COAT_D = '#D8D2C8', COAT_L = '#FFFFFF', COAT_LAPEL = '#E4DFD6';
const SCRUBS = ['sage-scrubs', 'navy-scrubs', 'teal-scrubs'];

const body = [
  part('body-tshirt', g(shoulders(), NECK, s('M102 192C110 206 146 206 154 192', CD, 8)), { role: 'customer', weight: 3 }),
  part('body-sweater', g(shoulders(), NECK, s('M100 193C108 210 148 210 156 193', CL, 12), s('M100 193C108 210 148 210 156 193', CD, 3, 'opacity="0.5"')), { role: 'customer', weight: 2 }),
  part('body-vneck', g(shoulders(), NECK, p('M108 186L128 222L148 186Z', SK), s('M104 188L128 226L152 188', CD, 7)), { role: 'customer', weight: 2 }),
  part('body-shirt', g(shoulders(), NECK, p('M110 188L128 212L146 188Z', SK),
    pair('M104 186L94 212L122 210Z', CL, `stroke="${CL}" stroke-width="6" stroke-linejoin="round"`),
    s('M128 214L128 256', CD, 4), c(128, 232, 3, CD), c(128, 248, 3, CD)), { role: 'customer', weight: 2 }),
  part('body-jacket', g(shoulders(), p('M100 192L128 256L156 192Z', '#F4F1EC'), NECK,
    pair('M98 190L84 216L106 226L126 256L102 200Z', CD, `stroke="${CD}" stroke-width="4" stroke-linejoin="round"`)), { role: 'customer', weight: 1 }),
  part('body-cardigan', g(shoulders(), p('M104 192L128 256L152 192Z', CL), NECK, s('M104 192L128 256M152 192L128 256', CD, 7), c(118, 228, 4, CD), c(122, 244, 4, CD)), { role: 'customer', weight: 2 }),
  part('body-hoodie', g(shoulders(), p('M78 202C80 176 100 166 128 166C156 166 176 176 178 202Z', CD), NECK, s('M102 194C110 206 146 206 154 194', CD, 8),
    s('M116 208L114 236M140 208L142 236', CL, 5), c(114, 239, 4, CL), c(142, 239, 4, CL)), { role: 'customer', weight: 1 }),
  part('body-turtleneck', g(shoulders(), NECK, p('M104 166L152 166L156 198C142 208 114 208 100 198Z', C), s('M104 180L152 180M103 190L153 190', CD, 4, 'opacity="0.6"')), { role: 'customer', weight: 1 }),
  // personel
  part('body-vet-coat', g(shoulders(COAT, COAT_D, COAT_L), p('M100 192L128 240L156 192Z', C), NECK, s('M104 190L128 232L152 190', CD, 6),
    pair('M98 190L84 218L104 226L128 256L104 196Z', COAT_LAPEL, `stroke="${COAT_LAPEL}" stroke-width="4" stroke-linejoin="round"`),
    rect(54, 222, 32, 24, 5, COAT_LAPEL), rect(62, 212, 5, 16, 2.5, '#5E9C94')), { role: 'staff', weight: 3, palettes: SCRUBS }),
  part('body-scrubs', g(shoulders(), NECK, p('M108 186L128 220L148 186Z', SK), s('M104 188L128 224L152 188', CD, 7), rect(156, 214, 30, 22, 5, CD, 'opacity="0.6"')),
    { role: 'staff', weight: 2, palettes: SCRUBS }),
];

// ---------------------------------------------------------------------------
// KAFA ve KULAK
// ---------------------------------------------------------------------------
const blush = e(100, 140, 10, 6, '#E58C7A', 'opacity="0.22"') + e(156, 140, 10, 6, '#E58C7A', 'opacity="0.22"');
const headE = (cx, cy, rx, ry) => {
  const base = e(cx, cy, rx, ry, SKD) + e(cx - 3, cy - 4, rx - 4, ry - 4, SK);
  const hx = cx - rx * 0.55, hy = cy - ry * 0.2;
  return base + e(hx, hy, rx * 0.2, rx * 0.1, SKL, `opacity="0.7" ${rot(-55, hx, hy)}`) + blush;
};
const SQUARE = 'M74 96C74 68 98 56 128 56C158 56 182 68 182 96L182 136C182 164 160 180 128 180C96 180 74 164 74 136Z';
const head = [
  part('head-round', g(headE(128, 118, 58, 60)), { weight: 3 }),
  part('head-oval', g(headE(128, 116, 54, 66)), { weight: 3 }),
  part('head-square', g(p(SQUARE, SKD, 'transform="translate(3 4)"'), p(SQUARE, SK), e(90, 96, 11, 5.5, SKL, `opacity="0.7" ${rot(-55, 90, 96)}`), blush), { weight: 2 }),
  part('head-long', g(headE(128, 116, 50, 70)), { weight: 1, faceAnchor: A_(128, 118, 0.96) }),
];
const ears = [
  part('ears-round', g(c(72, 124, 13, SKD), c(70, 122, 12, SK), e(69, 123, 5, 7, SKD, 'opacity="0.6"'),
    c(186, 124, 13, SKD), c(185, 122, 12, SK), e(187, 123, 5, 7, SKD, 'opacity="0.6"'))),
  part('ears-small', g(e(73, 124, 9, 12, SKD), e(71, 122, 9, 12, SK), e(71, 123, 3.5, 6, SKD, 'opacity="0.6"'),
    e(186, 124, 9, 12, SKD), e(185, 122, 9, 12, SK), e(186, 123, 3.5, 6, SKD, 'opacity="0.6"'))),
];

// ---------------------------------------------------------------------------
// YÜZ
// ---------------------------------------------------------------------------
const hl = (x, y, r = 2.5) => c(x, y, r, WHITE);
const ageLines = [
  none('lines-none', { weightByAge: { young: 1, middle: 3, old: 0.5 } }),
  part('lines-smile', g(s('M106 136Q100 147 106 157M150 136Q156 147 150 157', SKD, 4, 'opacity="0.8"')), { age: ['middle', 'old'], weightByAge: { middle: 1, old: 3 } }),
  part('lines-forehead', g(s('M110 86Q128 81 146 86M114 94Q128 90 142 94', SKD, 3.5, 'opacity="0.8"')), { age: ['old'], weight: 1 }),
  part('lines-eyes', g(s('M90 114L83 110M90 124L83 127M166 114L173 110M166 124L173 127', SKD, 3.5, 'opacity="0.8"')), { age: ['middle', 'old'], weightByAge: { middle: 0.5, old: 2 } }),
];
const eyes = [
  part('eyes-dot', g(c(106, 120, 8, INK), c(150, 120, 8, INK), hl(108.5, 117.5), hl(152.5, 117.5)), { weight: 3 }),
  part('eyes-oval', g(e(106, 121, 6.5, 9, INK), e(150, 121, 6.5, 9, INK), hl(108, 117), hl(152, 117)), { weight: 2 }),
  part('eyes-round', g(c(106, 120, 11, SCLERA), c(150, 120, 11, SCLERA), c(107, 121, 7, INK), c(151, 121, 7, INK), hl(109, 118), hl(153, 118)), { weight: 2, sclera: true }),
  part('eyes-happy', g(s('M97 123Q106 113 115 123M141 123Q150 113 159 123', INK, 6)), { weight: 2 }),
  part('eyes-sleepy', g(p('M96 118A10 10 0 0 0 116 118Z', INK), p('M140 118A10 10 0 0 0 160 118Z', INK))),
  part('eyes-wink', g(c(106, 120, 8, INK), hl(108.5, 117.5), s('M141 123Q150 113 159 123', INK, 6))),
  part('eyes-surprised', g(c(106, 120, 12, SCLERA), c(150, 120, 12, SCLERA), c(106, 120, 5, INK), c(150, 120, 5, INK)), { sclera: true }),
  part('eyes-calm', g(s('M97 118Q106 126 115 118M141 118Q150 126 159 118', INK, 6))),
  part('eyes-big', g(c(106, 119, 13, SCLERA), c(150, 119, 13, SCLERA), c(107, 120, 9, INK), c(151, 120, 9, INK), hl(110, 116, 3.5), hl(154, 116, 3.5), hl(104, 124, 1.8), hl(148, 124, 1.8)), { sclera: true }),
];
const eyebrows = [
  part('brows-flat', g(s('M96 101L116 101M140 101L160 101', HD, 6)), { weight: 2 }),
  part('brows-raised', g(s('M96 100Q106 91 116 97M140 97Q150 91 160 100', HD, 6)), { weight: 2 }),
  part('brows-thick', g(s('M95 102Q106 96 117 100M139 100Q150 96 161 102', HD, 9)), { weight: 1 }),
  part('brows-thin', g(s('M97 101Q106 97 115 100M141 100Q150 97 159 101', HD, 4)), { weight: 1 }),
  part('brows-frown', g(s('M96 97L116 103M140 103L160 97', HD, 6)), { weight: 0.5 }),
  part('brows-soft', g(s('M97 102Q106 98 115 102M141 102Q150 98 159 102', HD, 6)), { weight: 2 }),
];
const nose = [
  part('nose-line', g(s('M128 124Q122 136 131 138', SKD, 5)), { weight: 2 }),
  part('nose-dot', g(e(128, 134, 5, 4, SKD)), { weight: 2 }),
  part('nose-round', g(e(128, 132, 9, 7, SKD, 'opacity="0.55"'))),
  part('nose-button', g(e(128, 131, 8, 6.5, SKL), c(124, 135, 2.5, SKD), c(132, 135, 2.5, SKD))),
];
const mouth = [
  part('mouth-smile', g(s('M116 148Q128 158 140 148', INK, 6)), { weight: 3 }),
  part('mouth-grin', g(p('M112 145Q128 166 144 145Z', INK, `stroke="${INK}" stroke-width="3" stroke-linejoin="round"`), e(128, 156, 7, 3.5, TONGUE)), { weight: 2 }),
  part('mouth-neutral', g(s('M120 152L136 152', INK, 6))),
  part('mouth-o', g(e(128, 152, 5, 6.5, INK)), { weight: 0.5 }),
  part('mouth-smirk', g(s('M117 152Q130 154 140 145', INK, 6))),
  part('mouth-soft', g(s('M121 150Q128 155 135 150', INK, 5.5)), { weight: 2 }),
];
const JAW = 'M76 126C76 166 100 186 128 186C156 186 180 166 180 126C176 146 166 158 154 160C146 162 138 158 128 158C118 158 110 162 102 160C90 158 80 146 76 126Z';
const LONG = 'M76 126C74 178 98 222 128 226C158 222 182 178 180 126C176 146 166 158 154 160C146 162 138 158 128 158C118 158 110 162 102 160C90 158 80 146 76 126Z';
const MUS = 'M108 146C112 136 124 136 128 140C132 136 144 136 148 146C140 145 134 144 128 145C122 144 116 145 108 146Z';
const facialHair = [
  none('beard-none', { gender: 'male', weight: 5 }),
  part('beard-stubble', g(p(JAW, HD, 'opacity="0.22"'), e(128, 142, 16, 5, HD, 'opacity="0.22"')), { gender: 'male', weight: 2 }),
  part('beard-short', g(hairP(JAW), p(MUS, H)), { gender: 'male', weight: 2 }),
  part('beard-long', g(hairP(LONG), p(MUS, H)), { gender: 'male', weightByAge: { young: 0.3, middle: 1, old: 1.5 } }),
  part('beard-mustache', g(p(MUS, HD, 'transform="translate(1 2)"'), p(MUS, H)), { gender: 'male', weightByAge: { young: 0.3, middle: 1, old: 1.5 } }),
  part('beard-goatee', g(e(130, 172, 16, 12, HD), e(128, 170, 16, 12, H), p(MUS, H)), { gender: 'male', weight: 1 }),
];

// ---------------------------------------------------------------------------
// SAÇ — ön (hairFront) ve arka (hairBack). Arka parça pairsWith ile ön parçaya bağlıdır.
// ---------------------------------------------------------------------------
const LONG_BACK = 'M62 100C58 54 92 34 128 34C164 34 198 54 194 100L200 226C190 236 168 236 160 226L150 172L106 172L96 226C88 236 66 236 56 226Z';
const WAVY_BACK = 'M60 100C56 54 90 34 128 34C166 34 200 54 196 100C204 130 192 150 204 176C214 200 204 222 186 228C172 232 162 224 156 210L150 172L106 172L100 210C94 224 84 232 70 228C52 222 42 200 52 176C64 150 52 130 60 100Z';
const BOB_BACK = 'M62 100C58 56 92 36 128 36C164 36 198 56 194 100C196 130 196 160 188 172C172 178 160 176 150 170L106 170C96 176 84 178 68 172C60 160 60 130 62 100Z';
const SLICK = 'M66 108C62 64 92 40 128 40C164 40 194 64 190 108C184 90 172 80 158 76C140 72 116 72 98 76C84 80 72 92 66 108Z';
const ring = (pts) => pts;

const curlyFrontF = [[66, 150, 15], [64, 126, 17], [68, 100, 18], [80, 76, 19], [100, 58, 20], [128, 50, 20], [156, 58, 20], [176, 76, 19], [188, 100, 18], [192, 126, 17], [190, 150, 15]];
const curlyBackF = [[54, 170, 24], [50, 140, 26], [56, 108, 28], [70, 80, 28], [96, 58, 28], [128, 50, 28], [160, 58, 28], [186, 80, 28], [200, 108, 28], [206, 140, 26], [202, 170, 24], [76, 190, 22], [180, 190, 22]];
const curlyShort = [[72, 108, 14], [74, 86, 15], [88, 66, 16], [108, 54, 16], [128, 50, 16], [148, 54, 16], [168, 66, 16], [182, 86, 15], [184, 108, 14]];
const curlyM = [[70, 104, 17], [72, 80, 18], [86, 60, 19], [106, 48, 19], [128, 44, 19], [150, 48, 19], [170, 60, 19], [184, 80, 18], [186, 104, 17]];
const CAP_CURLY = 'M74 112C70 72 96 52 128 52C160 52 186 72 182 112C170 94 150 88 128 88C106 88 86 94 74 112Z';
const curls = (list) => p(CAP_CURLY, H) + clayCircles(list, 'hair', 3) + hairShine(98, 54);

const SIDE_L = 'M128 44C98 42 72 60 66 100C64 130 66 160 70 178L84 178C80 150 80 120 84 100C92 82 110 70 128 62Z';
const HIJAB_BACK = 'M52 130C44 70 82 32 128 32C174 32 212 70 204 130C210 166 216 196 208 220C192 236 160 234 128 232C96 234 64 236 48 220C40 196 46 166 52 130Z';
const HIJAB_FRONT = 'M60 120C58 66 90 40 128 40C166 40 198 66 196 120C196 160 176 196 128 206C80 196 60 160 60 120ZM128 70C100 70 82 86 80 110C78 144 98 176 128 180C158 176 178 144 176 110C174 86 156 70 128 70Z';
const BRAID = [[176, 142, 13], [182, 164, 14], [186, 186, 14], [188, 208, 13]];

const hairFront = [
  // kadın
  part('hair-f-long', g(hairP(SIDE_L + mirror(SIDE_L)), hairShine()), { gender: 'female', weight: 3 }),
  part('hair-f-long-wavy', g(hairP('M132 42C96 40 68 60 64 98C60 122 70 138 64 156C60 170 66 182 76 184C82 168 76 152 82 136C86 122 82 110 88 98C100 82 118 72 132 62Z'),
    hairP('M132 42C164 42 192 62 194 100C196 124 186 140 192 158C196 172 190 182 180 184C174 168 180 152 174 136C170 122 172 108 166 98C158 84 146 74 132 62Z'), hairShine()), { gender: 'female', weight: 3 }),
  part('hair-f-bob', g(hairP('M128 42C92 42 66 62 64 100C62 130 64 150 72 164L90 160C84 140 82 120 86 102C96 88 112 82 128 82C144 82 160 88 170 102C174 120 172 140 166 160L184 164C192 150 194 130 192 100C190 62 164 42 128 42Z'), hairShine()), { gender: 'female', weight: 2 }),
  part('hair-f-bangs', g(hairP('M128 40C92 40 64 62 64 104C64 130 66 156 72 174L86 174C82 150 80 124 82 104C82 94 84 90 90 90L166 90C172 90 174 94 174 104C176 124 174 150 170 174L184 174C190 156 192 130 192 104C192 62 164 40 128 40Z'), hairShine()), { gender: 'female', weight: 2 }),
  part('hair-f-ponytail', g(hairP(SLICK), hairShine()), { gender: 'female', weight: 2 }),
  part('hair-f-bun', g(hairP(SLICK), hairShine()), { gender: 'female', weight: 2, weightByAge: { young: 1.5, middle: 2, old: 2.5 } }),
  part('hair-f-curly', g(curls(curlyFrontF)), { gender: 'female', weight: 2 }),
  part('hair-f-pixie', g(hairP('M66 112C60 64 92 38 130 38C166 38 194 62 190 108C186 96 180 88 172 84C160 92 140 96 120 92C104 98 90 104 80 98C74 102 70 106 66 112Z'), hairShine()), { gender: 'female', weight: 1 }),
  part('hair-f-side-swept', g(hairP('M128 40C92 40 64 62 64 104C62 134 66 160 72 180L86 180C82 156 80 128 84 106C100 106 124 96 140 82C152 92 166 98 174 104C176 126 174 156 170 180L184 180C192 156 194 128 192 102C190 62 164 40 128 40Z'), hairShine()), { gender: 'female', weight: 2 }),
  part('hair-f-short-curly', g(curls(curlyShort)), { gender: 'female', weightByAge: { young: 0.3, middle: 1, old: 3 } }),
  part('hair-f-braid', g(hairP(SLICK), clayCircles(BRAID, 'hair', 3), c(188, 224, 6, AC), hairShine()), { gender: 'female', weight: 1 }),
  part('hair-f-hijab', g(p(HIJAB_FRONT, SCD, 'fill-rule="evenodd" transform="translate(3 4)"'), p(HIJAB_FRONT, SC, 'fill-rule="evenodd"'),
    s('M72 150C80 176 100 194 128 200', SCD, 4, 'opacity="0.5"'), e(92, 58, 18, 7, SCL, `opacity="0.7" ${rot(-30, 92, 58)}`)),
    { gender: 'female', weight: 2.5, excludes: ['acc-earrings', 'acc-beanie'] }),
  // erkek
  part('hair-m-short', g(hairP('M70 112C66 66 94 44 128 44C162 44 190 66 186 112C182 94 176 84 166 80C150 86 112 86 92 80C80 86 74 96 70 112Z'), hairShine(98, 56)), { gender: 'male', weight: 3 }),
  part('hair-m-side-part', g(hairP('M68 112C62 62 92 38 132 38C170 40 194 66 188 112C184 92 176 80 164 76C140 70 112 76 96 92C84 92 74 100 68 112Z'), hairShine()), { gender: 'male', weight: 3 }),
  part('hair-m-wavy', g(hairP('M68 112C60 74 76 50 96 46C100 34 120 32 128 40C138 30 160 34 162 46C186 52 196 78 188 112C182 92 170 82 156 84C150 92 106 92 100 84C86 84 74 94 68 112Z'), hairShine()), { gender: 'male', weight: 2 }),
  part('hair-m-curly', g(p('M74 108C70 70 96 50 128 50C160 50 186 70 182 108C170 92 150 86 128 86C106 86 86 92 74 108Z', H), clayCircles(curlyM, 'hair', 3), hairShine(98, 52)), { gender: 'male', weight: 2 }),
  part('hair-m-buzz', g(p('M72 104C70 66 96 50 128 50C160 50 186 66 184 104C176 86 160 76 128 76C96 76 80 86 72 104Z', H, 'opacity="0.85"')), { gender: 'male', weight: 2 }),
  part('hair-m-bald', g(pair('M70 122C68 108 70 96 76 88C80 98 81 110 81 122Z', H)), { gender: 'male', weightByAge: { young: 0.2, middle: 1, old: 3 } }),
  part('hair-m-quiff', g(hairP('M70 110C64 66 84 36 120 30C150 26 180 38 188 70C192 86 190 100 186 112C180 94 170 84 160 80C140 80 110 84 92 82C82 88 74 98 70 110Z'), hairShine(104, 44)), { gender: 'male', weight: 2, weightByAge: { young: 2, middle: 1, old: 0.3 } }),
  part('hair-m-fringe', g(hairP('M68 116C62 66 92 40 128 40C164 40 194 66 188 116C186 104 182 96 176 92C150 98 106 98 80 92C74 96 70 104 68 116Z'), hairShine()), { gender: 'male', weight: 2 }),
  part('hair-m-spiky', g(hairP('M70 110C64 80 70 60 84 52C86 40 100 34 108 40C114 28 132 28 136 38C146 30 162 34 164 46C178 48 190 62 188 80C190 92 188 102 186 110C178 92 162 84 128 84C98 84 80 92 70 110Z'), hairShine(100, 50)), { gender: 'male', weightByAge: { young: 2, middle: 0.5, old: 0 } }),
  part('hair-m-receding', g(pair('M70 112C66 92 70 76 80 68C84 82 82 98 80 112Z', H), p('M106 60C114 52 142 52 150 60C142 66 114 66 106 60Z', H, 'opacity="0.8"')), { gender: 'male', weightByAge: { young: 0.2, middle: 1.5, old: 2.5 } }),
  part('hair-m-long', g(hairP('M128 44C98 42 72 60 68 98C66 116 68 132 72 146L84 144C82 128 82 112 86 100C94 82 110 68 128 62Z' + mirror('M128 44C98 42 72 60 68 98C66 116 68 132 72 146L84 144C82 128 82 112 86 100C94 82 110 68 128 62Z')), hairShine()), { gender: 'male', weight: 1 }),
  part('hair-m-bun', g(hairP('M68 108C64 66 92 42 128 42C164 42 192 66 188 108C182 92 170 82 156 78C140 74 116 74 100 78C86 82 74 92 68 108Z'), hairShine()), { gender: 'male', weight: 1, weightByAge: { young: 1, middle: 0.5, old: 0.1 } }),
];

const hairBack = [
  part('hair-f-long-back', g(hairP(LONG_BACK)), { gender: 'female', pairsWith: 'hair-f-long' }),
  part('hair-f-long-wavy-back', g(hairP(WAVY_BACK)), { gender: 'female', pairsWith: 'hair-f-long-wavy' }),
  part('hair-f-bob-back', g(hairP(BOB_BACK)), { gender: 'female', pairsWith: 'hair-f-bob' }),
  part('hair-f-bangs-back', g(hairP(LONG_BACK)), { gender: 'female', pairsWith: 'hair-f-bangs' }),
  part('hair-f-ponytail-back', g(hairP('M150 58C190 48 216 80 212 122C208 160 216 190 202 214C192 230 174 224 176 206C180 180 186 150 176 122C170 100 160 84 150 72Z'), e(158, 64, 11, 8, AC, rot(-30, 158, 64))), { gender: 'female', pairsWith: 'hair-f-ponytail' }),
  part('hair-f-bun-back', g(c(131, 39, 26, HD), c(128, 36, 26, H), s('M110 36Q128 26 146 36', HD, 4, 'opacity="0.6"')), { gender: 'female', pairsWith: 'hair-f-bun' }),
  part('hair-f-curly-back', g(clayCircles(curlyBackF, 'hair', 4)), { gender: 'female', pairsWith: 'hair-f-curly' }),
  part('hair-f-side-swept-back', g(hairP(LONG_BACK)), { gender: 'female', pairsWith: 'hair-f-side-swept' }),
  part('hair-f-hijab-back', g(p(HIJAB_BACK, SCD, 'transform="translate(4 4)"'), p(HIJAB_BACK, SC), s('M62 196C70 212 84 222 100 228M194 196C186 212 172 222 156 228', SCD, 4, 'opacity="0.45"')), { gender: 'female', pairsWith: 'hair-f-hijab' }),
  part('hair-m-long-back', g(hairP('M64 100C60 56 92 38 128 38C164 38 196 56 192 100L194 180C182 190 164 188 156 178L150 166L106 166L100 178C92 188 74 190 62 180Z')), { gender: 'male', pairsWith: 'hair-m-long' }),
  part('hair-m-bun-back', g(c(131, 39, 20, HD), c(128, 36, 20, H)), { gender: 'male', pairsWith: 'hair-m-bun' }),
  part('hair-m-curly-back', g(clayCircles([[66, 128, 18], [190, 128, 18], [70, 150, 14], [186, 150, 14]], 'hair', 3)), { gender: 'male', pairsWith: 'hair-m-curly' }),
];

// ---------------------------------------------------------------------------
// GÖZLÜK ve AKSESUAR
// ---------------------------------------------------------------------------
const lens = 'fill="#FFFFFF" fill-opacity="0.18"';
const frame = `stroke="${AC}" stroke-width="5"`;
const glasses = [
  none('glasses-none', { weightByAge: { young: 8, middle: 5, old: 3 } }),
  part('glasses-round', g(`<circle cx="106" cy="120" r="15" ${lens} ${frame}/>`, `<circle cx="150" cy="120" r="15" ${lens} ${frame}/>`, s('M121 119Q128 114 135 119M91 118L74 114M165 118L182 114', AC, 5))),
  part('glasses-square', g(`<rect x="89" y="108" width="34" height="25" rx="8" ${lens} ${frame}/>`, `<rect x="133" y="108" width="34" height="25" rx="8" ${lens} ${frame}/>`, s('M123 118Q128 114 133 118M89 116L74 113M167 116L182 113', AC, 5))),
  part('glasses-thin', g(`<ellipse cx="106" cy="121" rx="16" ry="12" ${lens} stroke="${AC}" stroke-width="3.5"/>`, `<ellipse cx="150" cy="121" rx="16" ry="12" ${lens} stroke="${AC}" stroke-width="3.5"/>`, s('M122 119Q128 115 134 119M90 118L74 114M166 118L182 114', AC, 3.5))),
];
const STETH = '#5A6372';
const accessory = [
  none('acc-none', { weight: 10 }),
  part('acc-earrings', g(c(70, 142, 4.5, '#E2B85C'), c(186, 142, 4.5, '#E2B85C')), { gender: 'female', weight: 2 }),
  part('acc-stethoscope', g(s('M98 194C90 222 104 240 120 238M158 194C166 216 158 230 146 234M120 238Q132 242 140 236', STETH, 6), c(146, 236, 9, '#9AA3AE'), c(146, 236, 5, STETH)), { role: 'staff', weight: 8 }),
  part('acc-beanie', g(p('M66 98C64 58 94 30 128 30C162 30 192 58 190 98Z', SC), rect(62, 86, 132, 20, 10, SCD), c(128, 26, 12, SCL)), { role: 'customer', weight: 1 }),
  part('acc-badge', g(rect(154, 216, 32, 22, 5, WHITE), rect(154, 216, 32, 7, 3.5, AC)), { role: 'staff', weight: 3 }),
];

// ---------------------------------------------------------------------------
// PALETLER
// ---------------------------------------------------------------------------
const palettes = {
  skin: [
    skinT('porcelain', '#F5D9C5', '#E0BBA3', '#FBE8DB', { weight: 1 }),
    skinT('light', '#EFC9AA', '#D9AC8A', '#F7DCC4', { weight: 3 }),
    skinT('light-wheat', '#E8BB96', '#CF9C76', '#F3D3B6', { weight: 4 }),
    skinT('wheat', '#DDA77F', '#C28A62', '#EDC3A2', { weight: 4 }),
    skinT('tan', '#C88D63', '#AB704A', '#DEAD88', { weight: 2 }),
    skinT('brown', '#A0694A', '#835237', '#BE8B6C', { weight: 1 }),
    skinT('deep', '#7A4E36', '#603B27', '#98694F', { weight: 1, dark: true }),
    skinT('dark', '#5C3A28', '#472C1E', '#7A5440', { weight: 0.7, dark: true }),
  ],
  hair: [
    hairT('black', '#2F2A28', '#1F1B1A', '#4A4340', { weightByAge: { young: 3, middle: 2, old: 0.3 } }),
    hairT('dark-brown', '#4A3226', '#33221A', '#6B4A39', { weightByAge: { young: 4, middle: 3, old: 0.3 } }),
    hairT('brown', '#7A5236', '#5C3C26', '#9B7052', { weightByAge: { young: 3, middle: 2, old: 0.3 } }),
    hairT('chestnut', '#9C7350', '#7B5739', '#BA9271', { weightByAge: { young: 2, middle: 1.5, old: 0.2 } }),
    hairT('blonde', '#D9B571', '#B9954F', '#EBD29A', { weightByAge: { young: 1, middle: 0.7, old: 0.1 } }),
    hairT('auburn', '#B9653F', '#97502F', '#D3865F', { weightByAge: { young: 1, middle: 0.7, old: 0.1 } }),
    hairT('gray', '#9E9A96', '#7F7B77', '#BDBAB6', { weightByAge: { young: 0, middle: 0.8, old: 4 } }),
    hairT('white', '#E3E0DC', '#C6C2BD', '#F2F0ED', { weightByAge: { young: 0, middle: 0, old: 3 } }),
  ],
  clothes: [
    clothesT('lavender', '#9793BD', '#7C78A3', '#B3AFD6'),
    clothesT('terracotta', '#D99277', '#BC765D', '#EBB5A0'),
    clothesT('mustard', '#E0BD6A', '#C29E4C', '#EFD69A'),
    clothesT('sage', '#8BA06B', '#6F8453', '#AFC195'),
    clothesT('sky', '#8FB3D1', '#7096B5', '#B5CEE3'),
    clothesT('cream', '#EAD9BF', '#CFBC9E', '#F5EBDB'),
    clothesT('navy', '#4D5B7C', '#3A4664', '#6F7D9E'),
    clothesT('burgundy', '#9C5560', '#7E414B', '#BF7B85'),
    clothesT('charcoal', '#6B6870', '#535058', '#8E8B93'),
    clothesT('rose', '#D8A3A6', '#BC8689', '#ECC4C6'),
    clothesT('sage-scrubs', '#9DB08A', '#7E916C', '#C1CFB2', { scrubs: true }),
    clothesT('navy-scrubs', '#4F5D7E', '#3C4865', '#71809F', { scrubs: true }),
    clothesT('teal-scrubs', '#6E9F9A', '#557F7B', '#9CC1BC', { scrubs: true }),
  ],
  background: backgroundColors,
  glasses: ['#44403C', '#7A5236', '#5A6D8C', '#9C5560', '#B9955A'],
};

export function buildHumanLibrary() {
  return {
    name: 'pofuduk/humans',
    version: '1.0.0',
    viewBox: 256,
    faceOrigin: { x: 128, y: 120 },
    layerOrder: ['background', 'body', 'hairBack', 'head', 'ears', 'ageLines', 'eyes', 'eyebrows', 'nose', 'mouth', 'facialHair', 'hairFront', 'glasses', 'accessory'],
    faceLayers: ['ageLines', 'eyes', 'eyebrows', 'nose', 'mouth', 'facialHair', 'glasses'],
    ages: [{ id: 'young', weight: 4 }, { id: 'middle', weight: 4 }, { id: 'old', weight: 2 }],
    palettes,
    parts: { background: backgrounds, body, hairBack, head, ears, ageLines, eyes, eyebrows, nose, mouth, facialHair, hairFront, glasses, accessory },
  };
}
