// src/render.ts'ten üretildi (scripts/site.mjs). Elle düzenlemeyin.
// Pofuduk — avatar birleştirici. Bağımlılıksız, deterministik: aynı seed → aynı avatar.
//
//   renderPetAvatar(seed, species, petLib)        → <svg> metni
//   renderHumanAvatar(seed, opts, humanLib)       → <svg> metni
//
// İki adımlı da kullanılabilir: select…() seçimi (parça kimlikleri + renkler) döndürür,
// compose…() bu seçimi çizer. Seçimi saklayıp sonradan elle değiştirmek için kullanışlı.
//
// Kütüphaneler: dist/pet-avatars.json ve dist/human-avatars.json.
// Yalnızca tip silinerek çalışan TypeScript (enum, namespace yok); Node 22+ doğrudan çalıştırır.

                                             
                                       
                                        
                                                                
                                                         
                                                             
                                        
              
           
                      
                        
                                                                         
                                                                      
                                                                             
                                                                    
          
                  
                      
              
                     
                      
                      
                                             
 

                                                                                                               
                                                                                                            
                             
                  
                                       
                       
                       
                         
                                         
                                  
                         
                      
                                      
                                 
 

                                                                                                        
                               
                  
                                       
                       
                       
                                      
             
                 
                 
                    
                              
                      
    
                                
 

/** Bir avatarın tam tarifi: hangi katmanda hangi parça, hangi renkler. JSON olarak saklanabilir. */
                               
                        
                   
                                
                                 
                                
 

// ---- deterministik rastgelelik ---------------------------------------------------
// FNV-1a 32 bit karma + mulberry32 üreteci.
export function hash(str        )         {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function rng(seed        )               {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Her çağrı r()'yi tam bir kez tüketir (liste boş olsa da), böylece bir katmandaki
// filtre farkı sonraki katmanların seçimini kaydırmaz.
export function pick                    (list     , r              , weightOf                   )                {
  const x0 = r();
  const w = (x   ) => Math.max(0, weightOf ? weightOf(x) : x.weight ?? 1);
  const total = list.reduce((sum, x) => sum + w(x), 0);
  if (!list.length || total <= 0) return undefined;
  let x = x0 * total;
  for (const item of list) {
    x -= w(item);
    if (x < 0) return item;
  }
  return list[list.length - 1];
}

function anchorTransform(a                    , origin                          )         {
  if (!a) return '';
  const s = a.scale ?? 1;
  if (a.x === origin.x && a.y === origin.y && s === 1) return '';
  const tx = +(a.x - origin.x * s).toFixed(2);
  const ty = +(a.y - origin.y * s).toFixed(2);
  return `translate(${tx} ${ty})${s === 1 ? '' : ` scale(${s})`}`;
}
const wrap = (svg        , t        ) => (t ? `<g transform="${t}">${svg}</g>` : svg);
const fill = (body        , colors                        ) => body.replace(/\{\{(\w+)\}\}/g, (m, k) => colors[k] ?? m);
const svgDoc = (vb        , body        ) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}">${body}</svg>`;

// ---- hayvan ---------------------------------------------------------------------
function petList(lib            , key        , layer        )         {
  if (layer === 'background') return lib.backgrounds;
  return (lib.species[key][layer]                      ) ?? lib.shared[layer] ?? [];
}

export function selectPetAvatar(seed        , species        , lib            )               {
  const key = lib.species[species] ? species : 'other';
  const sp = lib.species[key];
  const r = rng(hash(`${seed}|pet|${key}`));
  const palette = pick(lib.palettes[key] ?? lib.palettes.other, r) ;
  const bg = pick(lib.backgroundColors, r) .hex;
  const accent = lib.accentColors[Math.floor(r() * lib.accentColors.length)];
  const parts                         = {};
  for (const layer of lib.layerOrder) {
    if (!sp.layers.includes(layer)) continue;
    let options = petList(lib, key, layer);
    if (layer === 'eyes' && palette.dark) {
      const withSclera = options.filter((p) => p.sclera);
      if (withSclera.length) options = withSclera;
    }
    const part = pick(options, r);
    if (part) parts[layer] = part.id;
  }
  return {
    kind: 'pet', species: key, parts,
    colors: { fur: palette.fur, furDark: palette.furDark, furLight: palette.furLight, accent, bg },
    meta: { palette: palette.id },
  };
}

export function composePetAvatar(choice              , lib            )         {
  const key = choice.species && lib.species[choice.species] ? choice.species : 'other';
  const find = (layer        , id        ) => petList(lib, key, layer).find((p) => p.id === id);
  const head = choice.parts.head ? find('head', choice.parts.head) : undefined;
  const out           = [];
  for (const layer of lib.layerOrder) {
    const id = choice.parts[layer];
    const part = id ? find(layer, id) : undefined;
    if (!part || !part.svg) continue;
    const isFace = lib.faceLayers.includes(layer);
    if (isFace && head?.faceless) continue;
    const svg = part.svg.replace(/\{\{half\}\}/g, head?.half ?? '').replace(/\{\{muzzle\}\}/g, head?.muzzle ?? '');
    const anchor = lib.muzzleLayers.includes(layer) ? head?.muzzleAnchor ?? head?.faceAnchor : isFace ? head?.faceAnchor : undefined;
    out.push(wrap(svg, anchorTransform(anchor, lib.faceOrigin)));
  }
  return svgDoc(lib.viewBox, fill(out.join(''), choice.colors));
}

export function renderPetAvatar(seed        , species        , lib            )         {
  return composePetAvatar(selectPetAvatar(seed, species, lib), lib);
}

// ---- insan ----------------------------------------------------------------------
                                                                         

const trioColors = (prefix        , as        , t      ) => ({
  [as]: String(t[prefix]), [as + 'Dark']: String(t[prefix + 'Dark']), [as + 'Light']: String(t[prefix + 'Light']),
});

export function selectHumanAvatar(seed        , opts              , lib              )               {
  const r = rng(hash(`${seed}|human`));
  const coin = r();
  const gender         = opts.gender ?? (coin < 0.5 ? 'female' : 'male');
  const role       = opts.role ?? 'customer';
  const agePick = pick(lib.ages, r) .id;
  const age      = opts.age ?? agePick;

  const byAge = (x                                                           ) => x.weightByAge?.[age] ?? x.weight ?? 1;
  const skin = pick(lib.palettes.skin, r) ;
  const hair = pick(lib.palettes.hair, r, byAge) ;
  const scarf = pick(lib.palettes.clothes.filter((c) => !c.scrubs), r) ;
  const bg = pick(lib.palettes.background, r) .hex;
  const accent = lib.palettes.glasses[Math.floor(r() * lib.palettes.glasses.length)];

  const fits = (p      , layer        )          => {
    if (p.gender && p.gender !== gender) return false;
    if (p.age && !p.age.includes(age)) return false;
    if (p.role === 'staff' && role !== 'staff') return false;
    if (p.role === 'customer' && role !== 'customer') return false;
    if (layer === 'body' && role === 'staff' && p.role !== 'staff') return false;
    return true;
  };
  const choose = (layer        , extra                       ) =>
    pick((lib.parts[layer] ?? []).filter((p) => fits(p, layer) && (!extra || extra(p))), r, byAge);

  // Ön saç önce: arka saç onunla eşleşir (pairsWith), başörtüsü bazı aksesuarları dışlar (excludes).
  const front = choose('hairFront');
  const excluded = new Set(front?.excludes ?? []);
  const back = (lib.parts.hairBack ?? []).find((p) => front && p.pairsWith === front.id);

  let clothes = lib.palettes.clothes[0];
  const parts                         = {};
  for (const layer of lib.layerOrder) {
    let part                  ;
    if (layer === 'hairFront') part = front;
    else if (layer === 'hairBack') part = back;
    else if (layer === 'eyes' && skin.dark) part = choose(layer, (p) => !!p.sclera);
    else part = choose(layer, (p) => !excluded.has(p.id));
    if (layer === 'body' && part) {
      const allowed = part.palettes;
      clothes = pick(lib.palettes.clothes.filter((c) => (allowed ? allowed.includes(c.id) : !c.scrubs)), r) ?? clothes;
    }
    if (part) parts[layer] = part.id;
  }
  return {
    kind: 'human', parts,
    colors: {
      ...trioColors('skin', 'skin', skin), ...trioColors('hair', 'hair', hair),
      ...trioColors('clothes', 'clothes', clothes), ...trioColors('clothes', 'scarf', scarf),
      accent, bg,
    },
    meta: { gender, role, age, skin: skin.id, hair: hair.id, clothes: clothes.id },
  };
}

export function composeHumanAvatar(choice              , lib              )         {
  const find = (layer        , id        ) => (lib.parts[layer] ?? []).find((p) => p.id === id);
  const head = choice.parts.head ? find('head', choice.parts.head) : undefined;
  const out           = [];
  for (const layer of lib.layerOrder) {
    const id = choice.parts[layer];
    const part = id ? find(layer, id) : undefined;
    if (!part || !part.svg) continue;
    const t = lib.faceLayers.includes(layer) ? anchorTransform(head?.faceAnchor, lib.faceOrigin) : '';
    out.push(wrap(part.svg, t));
  }
  return svgDoc(lib.viewBox, fill(out.join(''), choice.colors));
}

export function renderHumanAvatar(seed        , opts               = {}, lib              )         {
  return composeHumanAvatar(selectHumanAvatar(seed, opts, lib), lib);
}
