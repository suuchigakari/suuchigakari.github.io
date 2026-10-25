/**
 * 記事のカテゴリ（色とアイコン）と、本文の数字の強調。
 *
 * 商品画像は PA-API か公式ウィジェット経由でしか使えないため、ページの見た目は
 * カテゴリごとの色と、自前で描いた線画アイコン（SVG）で付ける。
 */
import { escapeHtml } from './affiliate.js';

/** カテゴリごとの表示名・色（CSS の変数名）・アイコン（24×24 の線画）。 */
export const CATEGORIES = {
  diy: {
    label: 'DIY・作業',
    icon: '<path d="M14.5 5.5a4 4 0 0 0-5 5L3.5 16.5a1.8 1.8 0 0 0 2.5 2.5l6-6a4 4 0 0 0 5-5l-2.4 2.4-2.1-.5-.5-2.1z"/>',
  },
  kitchen: {
    label: 'キッチン',
    icon: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 10h2M20 10h2M9 7c0-1 1-1.5 1-2.5M14 7c0-1 1-1.5 1-2.5"/>',
  },
  outdoor: {
    label: 'アウトドア',
    icon: '<path d="M3 20 12 4l9 16z"/><path d="M12 4v16M9.5 20 12 15l2.5 5"/>',
  },
  kids: {
    label: 'ベビー・キッズ',
    icon: '<circle cx="12" cy="12" r="8"/><path d="M9 10.5h.01M15 10.5h.01M9.5 14.5a3.5 3.5 0 0 0 5 0M12 4c1 1 1 2.2 0 3"/>',
  },
  travel: {
    label: '旅行・持ち歩き',
    icon: '<rect x="5" y="7" width="14" height="12" rx="2"/><path d="M9 7V4.5h6V7M9 11v4M15 11v4M8 19v1.5M16 19v1.5"/>',
  },
  home: {
    label: '住まい・デスク',
    icon: '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
  },
};

/** 記事の slug → カテゴリ。新しい記事を足したらここにも足す（テストで確認）。 */
export const ARTICLE_CATEGORY = {
  'safety-sneaker': 'diy',
  'work-helmet': 'diy',
  'safety-glasses': 'diy',
  'dust-mask': 'diy',
  stepladder: 'diy',
  caulking: 'diy',
  adhesive: 'diy',
  'pressure-cooker': 'kitchen',
  'cutting-board': 'kitchen',
  'food-container': 'kitchen',
  'kitchen-scale': 'kitchen',
  'cooler-box': 'outdoor',
  'water-jug': 'outdoor',
  'outdoor-chair': 'outdoor',
  'outdoor-table': 'outdoor',
  'sleeping-bag': 'outdoor',
  'led-lantern': 'outdoor',
  'baby-gate': 'kids',
  'baby-high-chair': 'kids',
  'kids-storage': 'kids',
  'kids-table-chair': 'kids',
  'lcc-carrycase': 'travel',
  'lcc-backpack': 'travel',
  'luggage-scale': 'travel',
  'mobile-battery': 'travel',
  'full-length-mirror': 'home',
  'monitor-arm': 'home',
};

export function categoryOf(slug) {
  const key = ARTICLE_CATEGORY[slug];
  if (!key) throw new Error(`カテゴリが未設定の記事: ${slug}（src/theme.js の ARTICLE_CATEGORY に足す）`);
  return { key, ...CATEGORIES[key] };
}

/** カテゴリのアイコンを SVG で返す。装飾なので読み上げない。 */
export function categoryIcon(key, size = 24) {
  return `<svg class="cat-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CATEGORIES[key].icon}</svg>`;
}

// 数字＋単位（範囲・小数・カンマを含む）。長い単位から並べる。
const UNITS = [
  'ルーメン', 'kgf/cm²', 'kgf', 'mAh', 'Wh', 'mm', 'cm', 'mL', 'ml', 'kg', '時間', '製品', 'm', 'g', 'L', 'W', '分', '日', '℃', '%', '％', '件', '本', '台', '足', '倍', '社', '個', '枚', '才', '歳', 'か月',
];
const NUMBER_WITH_UNIT = new RegExp(
  `[-−]?\\d[\\d,.]*(?:\\s?[〜~～-]\\s?[-−]?\\d[\\d,.]*)?\\s?(?:${UNITS.map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  'g',
);

/** 文をエスケープし、数字＋単位を <strong class="hl"> で囲む。 */
export function highlightNumbers(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(NUMBER_WITH_UNIT, (match) => `<strong class="hl">${match}</strong>`);
}
