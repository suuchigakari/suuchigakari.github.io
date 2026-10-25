/**
 * 商品の種類ごとのイラスト（自前の SVG）。
 *
 * 商品画像は PA-API か公式ウィジェット経由でしか使えないため、商品そのものの絵ではなく
 * 「種類」の図を描く。実物の形・色・ロゴは写さない。記事には「図は種類のイメージ」と書く。
 * 線は .ill の stroke（カテゴリ色）、面は .f（薄いカテゴリ色）と .a（カテゴリ色）で塗る。
 */

/** 64×64 の図。 */
export const ILLUSTRATIONS = {
  sneaker:
    '<path class="f" d="M6 44c0-6 3-10 8-12l6-14h10l2 8c5 1 10 3 14 6 6 2 12 4 12 9v5H6z"/><path class="a" d="M48 36c5 1 9 3 10 7H46c0-3 0-5 2-7z"/><path d="M6 49h52M20 18h10l2 8M23 26l4 2M22 30l5 2"/>',
  helmet:
    '<path class="f" d="M10 42c0-14 10-24 22-24s22 10 22 24z"/><path class="a" d="M28 18h8v24h-8z"/><path d="M4 42h56v5H4zM10 42c0-14 10-24 22-24s22 10 22 24"/>',
  glasses:
    '<path class="f" d="M6 26h22l-2 14c-1 4-4 6-9 6s-9-3-10-7zM36 26h22l-1 13c-1 4-5 7-10 7s-8-2-9-6z"/><path d="M6 26h52M28 30c2-2 6-2 8 0M6 26l-3-4M58 26l3-4"/>',
  mask:
    '<path class="f" d="M12 24c6-8 14-11 20-11s14 3 20 11l-4 18c-4 6-10 9-16 9s-12-3-16-9z"/><circle class="a" cx="32" cy="36" r="6"/><path d="M12 24 4 20M52 24l8-4M12 38l-6 4M52 38l6 4"/>',
  stepladder:
    '<path class="f" d="M22 10h20v5H22z"/><path d="M24 15 12 56M40 15l12 41M20 26h24M17 38h30M14 50h36"/><path class="a" d="M22 10h20v5H22z"/>',
  'step-stool':
    '<path class="f" d="M18 8h24l2 6H16z"/><path d="M20 14 14 56M40 14v42M18 26h22M16 40h24M44 14l6 42"/><path d="M14 8h4v-2M46 8h-4v-2"/>',
  'ladder-combo':
    '<path class="f" d="M22 10h20v5H22z"/><path d="M24 15 14 56M40 15l10 41M21 26h22M18 38h28M15 50h34"/><path class="a" d="M30 12h4v4h-4z"/>',
  tube:
    '<path class="f" d="M4 20h34l10 7v10l-10 7H4l5-12z"/><path class="a" d="M48 28h6v8h-6z"/><path d="M54 32h7M16 28h16M16 36h12"/>',
  cartridge:
    '<rect class="f" x="8" y="22" width="38" height="20" rx="3"/><path class="a" d="M46 26h6v12h-6z"/><path d="M52 32l10-2v4l-10-2M14 28h24M14 34h18M8 26H4v12h4"/>',
  'twin-tube':
    '<rect class="f" x="8" y="14" width="18" height="38" rx="3"/><rect class="f" x="30" y="14" width="18" height="38" rx="3"/><path class="a" d="M12 8h10v6H12zM34 8h10v6H34z"/><path d="M12 24h10M34 24h10M12 30h8M34 30h8M50 44h10v8H50z"/>',
  bottle:
    '<path class="f" d="M20 22h24v32H20z"/><path class="a" d="M26 10h12v12H26z"/><path d="M32 2v8M24 32h16M24 38h12"/>',
  'pressure-cooker':
    '<path class="f" d="M12 28h40v20a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6z"/><path class="a" d="M10 22h44v6H10z"/><path d="M54 25h8M2 25h8M29 16h6v6h-6zM32 10v6"/>',
  'cutting-board':
    '<rect class="f" x="6" y="18" width="48" height="32" rx="4"/><circle cx="46" cy="26" r="3"/><path d="M14 40h20M54 30h6"/>',
  container:
    '<rect class="f" x="8" y="26" width="48" height="24" rx="4"/><path class="a" d="M6 20h52v7H6z"/><path d="M14 18v4M50 18v4M16 36h32"/>',
  'kitchen-scale':
    '<rect class="f" x="8" y="30" width="48" height="20" rx="4"/><path class="a" d="M22 36h20v8H22z"/><path d="M14 24h36v6H14zM10 50v4M54 50v4"/>',
  cooler:
    '<rect class="f" x="8" y="22" width="48" height="30" rx="4"/><path class="a" d="M6 18h52v6H6z"/><path d="M18 18c0-8 28-8 28 0M24 36h16"/>',
  jug:
    '<path class="f" d="M14 16h30v38H14z"/><path class="a" d="M44 40h10v6H44z"/><path d="M22 10h14v6H22zM14 26h30M54 43h6M22 16c0-4 14-4 14 0"/>',
  chair:
    '<path class="f" d="M16 10h28l-4 26H20z"/><path class="a" d="M14 34h32v6H14z"/><path d="M18 40 10 58M42 40l8 18M14 46h-4M46 46h6"/>',
  table:
    '<rect class="a" x="4" y="22" width="56" height="6" rx="2"/><path d="M10 28 6 56M54 28l4 28M14 28l6 28M50 28l-6 28M8 42h48"/>',
  'sleeping-bag':
    '<path class="f" d="M10 16c0-6 6-10 14-10h16c8 0 14 4 14 10v34c0 6-6 10-14 10H24c-8 0-14-4-14-10z"/><ellipse class="a" cx="32" cy="16" rx="12" ry="6"/><path d="M22 28h20M22 38h20M22 48h20"/>',
  lantern:
    '<path class="a" d="M22 12h20v6H22z"/><rect class="f" x="18" y="18" width="28" height="30" rx="6"/><path d="M26 6c0-4 12-4 12 0M18 48h28v6H18zM32 24v18M26 30h12"/>',
  gate:
    '<rect class="f" x="8" y="14" width="48" height="40" rx="3"/><path d="M16 14v40M24 14v40M32 14v40M40 14v40M48 14v40"/><path class="a" d="M4 20h4v8H4zM56 20h4v8h-4z"/>',
  'high-chair':
    '<path class="f" d="M20 6h24v20H20z"/><path class="a" d="M16 26h32v6H16z"/><path d="M20 32 14 58M44 32l6 26M18 46h28M14 26h-4M54 26h-4"/>',
  shelf:
    '<rect class="f" x="8" y="8" width="48" height="48" rx="2"/><path d="M8 24h48M8 40h48M32 24v16"/><path class="a" d="M12 44h18v10H12zM34 44h18v10H34z"/>',
  'kids-table':
    '<rect class="a" x="4" y="26" width="34" height="5" rx="2"/><path d="M8 31v22M34 31v22"/><path class="f" d="M44 34h14v6H44z"/><path d="M44 18h3v16M46 40v13M56 40v13"/>',
  suitcase:
    '<rect class="f" x="14" y="16" width="36" height="40" rx="5"/><path d="M26 16v-6h12v6M24 26v22M40 26v22"/><circle class="a" cx="20" cy="59" r="3"/><circle class="a" cx="44" cy="59" r="3"/>',
  backpack:
    '<path class="f" d="M14 22c0-8 8-14 18-14s18 6 18 14v32H14z"/><path class="a" d="M20 38h24v14H20z"/><path d="M26 8V4h12v4M20 30h24"/>',
  'luggage-scale':
    '<rect class="f" x="18" y="10" width="28" height="24" rx="6"/><path class="a" d="M24 16h16v8H24z"/><path d="M32 34v8M24 50c0-6 16-6 16 0v6H24z"/>',
  'power-bank':
    '<rect class="f" x="16" y="8" width="32" height="48" rx="6"/><path class="a" d="M26 4h12v4H26z"/><path d="M34 22l-6 10h8l-6 10"/>',
  mirror:
    '<rect class="f" x="20" y="4" width="24" height="46" rx="10"/><path d="M26 12l6-4M26 20l12-8M24 50 18 60M40 50l6 10"/>',
  'monitor-arm':
    '<rect class="f" x="26" y="6" width="34" height="22" rx="2"/><path d="M8 58h16M16 58V40l14-10 8 4"/><path class="a" d="M12 54h8v4h-8z"/>',
};

/** 記事ごとの既定の図と、仕様から図を選び分ける規則。 */
const BY_ARTICLE = {
  'safety-sneaker': () => 'sneaker',
  'work-helmet': () => 'helmet',
  'safety-glasses': () => 'glasses',
  'dust-mask': () => 'mask',
  stepladder: (specs) => {
    const type = specs?.type ?? '';
    if (/はしご兼用/.test(type)) return 'ladder-combo';
    if (/踏み台|ステップ/.test(type)) return 'step-stool';
    return 'stepladder';
  },
  caulking: (specs) => (/^[^、]*チューブ/.test(specs?.volume ?? '') ? 'tube' : 'cartridge'),
  adhesive: (specs) => {
    const type = specs?.type ?? '';
    if (/2液/.test(type)) return 'twin-tube';
    if (/瞬間/.test(type)) return 'bottle';
    return 'tube';
  },
  'pressure-cooker': () => 'pressure-cooker',
  'cutting-board': () => 'cutting-board',
  'food-container': () => 'container',
  'kitchen-scale': () => 'kitchen-scale',
  'cooler-box': () => 'cooler',
  'water-jug': () => 'jug',
  'outdoor-chair': () => 'chair',
  'outdoor-table': () => 'table',
  'sleeping-bag': () => 'sleeping-bag',
  'led-lantern': () => 'lantern',
  'baby-gate': () => 'gate',
  'baby-high-chair': () => 'high-chair',
  'kids-storage': () => 'shelf',
  'kids-table-chair': () => 'kids-table',
  'lcc-carrycase': () => 'suitcase',
  'lcc-backpack': () => 'backpack',
  'luggage-scale': () => 'luggage-scale',
  'mobile-battery': () => 'power-bank',
  'full-length-mirror': () => 'mirror',
  'monitor-arm': () => 'monitor-arm',
};

/** 記事と商品の仕様から、図の名前を決める。 */
export function illustrationKey(slug, specs) {
  const rule = BY_ARTICLE[slug];
  if (!rule) throw new Error(`イラストが未設定の記事: ${slug}（src/illustrations.js の BY_ARTICLE に足す）`);
  return rule(specs);
}

/** 図を SVG で返す。装飾なので読み上げない。 */
export function illustration(key, size = 56) {
  const body = ILLUSTRATIONS[key];
  if (!body) throw new Error(`未定義のイラスト: ${key}`);
  return `<svg class="ill" width="${size}" height="${size}" viewBox="0 0 64 64" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
