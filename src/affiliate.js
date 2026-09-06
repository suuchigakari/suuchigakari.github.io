/**
 * Amazon アフィリエイト（アソシエイト）リンクのユーティリティ。
 *
 * ブラウザからは `<script type="module">` で、Node.js からは import して使う。
 * 依存パッケージなし。
 */

/** 対応マーケットプレイス（ホスト名 → 既定の表示名）。 */
export const MARKETPLACES = {
  'amazon.co.jp': '日本',
  'amazon.com': '米国',
  'amazon.co.uk': '英国',
  'amazon.de': 'ドイツ',
  'amazon.fr': 'フランス',
  'amazon.it': 'イタリア',
  'amazon.es': 'スペイン',
  'amazon.ca': 'カナダ',
  'amazon.com.au': 'オーストラリア',
  'amazon.in': 'インド',
};

/** 短縮URLのホスト。オフラインでは展開できないので個別にエラーにする。 */
const SHORT_HOSTS = new Set(['amzn.to', 'amzn.asia', 'a.co']);

const ASIN_RE = /^[A-Z0-9]{10}$/;

/**
 * 商品ページのパスから ASIN を取り出すパターン。
 * /dp/, /gp/product/, /gp/aw/d/, /exec/obidos/ASIN/ などの表記ゆれに対応する。
 */
const ASIN_PATH_RE =
  /\/(?:dp|gp\/product|gp\/aw\/d|gp\/offer-listing|gp\/aw\/ol|exec\/obidos\/asin|exec\/obidos\/tg\/detail\/-|o\/asin|product)\/([0-9A-Za-z]{10})(?:[/?#]|$)/i;

/** アソシエイトタグの形式（例: example-22）。 */
const TAG_RE = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,48}[A-Za-z0-9])?-\d{2}$/;

export class AffiliateLinkError extends Error {
  /**
   * @param {string} code 機械的に分岐するためのコード
   * @param {string} message 利用者に見せる日本語メッセージ
   */
  constructor(code, message) {
    super(message);
    this.name = 'AffiliateLinkError';
    this.code = code;
  }
}

/** 末尾の www. を除いたホスト名を返す。 */
function baseHost(hostname) {
  return hostname.toLowerCase().replace(/^(?:www|smile|m)\./, '');
}

/** 対応マーケットプレイスのホストかどうか。 */
export function isAmazonHost(hostname) {
  return Object.hasOwn(MARKETPLACES, baseHost(hostname));
}

/** アソシエイトタグとして妥当な文字列かどうか。 */
export function isValidTag(tag) {
  return typeof tag === 'string' && TAG_RE.test(tag);
}

/**
 * 入力から ASIN とマーケットプレイスを取り出す。
 *
 * URL のほか、ASIN 単体（例: `B0CGXXXXXX`）も受け付ける。
 * @param {string} input
 * @param {{ defaultDomain?: string }} [options]
 * @returns {{ asin: string, domain: string }}
 */
export function parseAmazonInput(input, options = {}) {
  const defaultDomain = options.defaultDomain ?? 'amazon.co.jp';
  const raw = String(input ?? '').trim();

  if (!raw) {
    throw new AffiliateLinkError('EMPTY', 'URL または ASIN を入力してください。');
  }

  // ASIN 単体の入力。
  if (ASIN_RE.test(raw.toUpperCase()) && !raw.includes('/')) {
    return { asin: raw.toUpperCase(), domain: baseHost(defaultDomain) };
  }

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    throw new AffiliateLinkError('INVALID_URL', 'URL として解釈できませんでした。');
  }

  const host = baseHost(url.hostname);

  if (SHORT_HOSTS.has(host)) {
    throw new AffiliateLinkError(
      'SHORT_LINK',
      '短縮URL（amzn.to / amzn.asia）は展開できません。ブラウザで開いて、表示された商品ページのURLを貼り付けてください。',
    );
  }

  if (!isAmazonHost(host)) {
    throw new AffiliateLinkError('NOT_AMAZON', 'Amazon の商品ページURLではありません。');
  }

  const fromPath = ASIN_PATH_RE.exec(url.pathname);
  const fromQuery = url.searchParams.get('asin') ?? url.searchParams.get('ASIN');
  const candidate = (fromPath?.[1] ?? fromQuery ?? '').toUpperCase();

  if (!ASIN_RE.test(candidate)) {
    throw new AffiliateLinkError(
      'NO_ASIN',
      'URL から ASIN を取得できませんでした。商品ページ（/dp/ を含むURL）を指定してください。',
    );
  }

  return { asin: candidate, domain: host };
}

/**
 * ASIN からアフィリエイトリンクを組み立てる。
 * 追跡用パラメータは一切引き継がず、`/dp/{ASIN}?tag=` の最小形にそろえる。
 *
 * @param {{ asin: string, tag: string, domain?: string, extraParams?: Record<string, string> }} options
 * @returns {string}
 */
export function buildAffiliateUrl({ asin, tag, domain = 'amazon.co.jp', extraParams = {} }) {
  const normalizedAsin = String(asin ?? '').toUpperCase();
  if (!ASIN_RE.test(normalizedAsin)) {
    throw new AffiliateLinkError('NO_ASIN', 'ASIN は英数字10桁で指定してください。');
  }
  if (!isValidTag(tag)) {
    throw new AffiliateLinkError(
      'INVALID_TAG',
      'アソシエイトタグの形式が正しくありません（例: example-22）。',
    );
  }

  const host = baseHost(domain);
  if (!isAmazonHost(host)) {
    throw new AffiliateLinkError('NOT_AMAZON', `未対応のマーケットプレイスです: ${domain}`);
  }

  const url = new URL(`https://www.${host}/dp/${normalizedAsin}`);
  url.searchParams.set('tag', tag);
  for (const [key, value] of Object.entries(extraParams)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * URL / ASIN を受け取り、追跡パラメータを落としたアフィリエイトリンクを返す。
 *
 * @param {string} input 商品ページURL、または ASIN
 * @param {{ tag: string, defaultDomain?: string, forceDomain?: string }} options
 * @returns {{ url: string, asin: string, domain: string }}
 */
export function toAffiliateLink(input, options) {
  const { tag, defaultDomain = 'amazon.co.jp', forceDomain } = options ?? {};
  const { asin, domain } = parseAmazonInput(input, { defaultDomain });
  const target = forceDomain ? baseHost(forceDomain) : domain;
  return { url: buildAffiliateUrl({ asin, tag, domain: target }), asin, domain: target };
}

/** 外部リンクとして安全な属性を付けた <a> タグを組み立てる。 */
export function buildHtmlSnippet({ url, label }) {
  const text = escapeHtml(label ?? url);
  return `<a href="${escapeHtml(url)}" target="_blank" rel="nofollow sponsored noopener">${text}</a>`;
}

/** Markdown 形式のリンクを組み立てる。 */
export function buildMarkdownSnippet({ url, label }) {
  const text = String(label ?? url).replace(/([\[\]])/g, '\\$1');
  return `[${text}](${url})`;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
