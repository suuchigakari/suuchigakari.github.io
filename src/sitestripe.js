/**
 * SiteStripe（Amazon アソシエイトの公式ツール）で作った「画像」リンクのコードを、
 * 安全な形に組み立て直して表示する。
 *
 * 商品画像は PA-API か公式のリンクツール経由でしか使えない（CLAUDE.md）。運営者が SiteStripe の
 * 「画像」タブで発行したコードを data/sitestripe.json に貼り、ここで中身を検証してから使う。
 * 貼られた HTML をそのまま出さず、検証済みの URL だけで <a><img> を作り直す。
 */
import { escapeHtml } from './affiliate.js';

const IMG_HOST = 'ws-fe.amazon-adsystem.com';
const PIXEL_HOST = 'ir-jp.amazon-adsystem.com';
const LINK_HOSTS = new Set(['www.amazon.co.jp', 'amazon.co.jp']);

function toUrl(raw) {
  if (!raw) return null;
  const value = raw.replaceAll('&amp;', '&').trim();
  try {
    return new URL(value.startsWith('//') ? `https:${value}` : value);
  } catch {
    return null;
  }
}

/**
 * 商品ページのパスか。/dp/<ASIN>・/<商品名>/dp/<ASIN>・/gp/product/<ASIN> だけを認め、
 * ASIN はパスの1区切りとして完全一致すること（部分一致は認めない）。
 */
function isProductPath(pathname, asin) {
  const parts = pathname.split('/').filter(Boolean);
  const i = parts.findIndex((p, k) => (p === 'dp' && (k === 0 || k === 1)) || (p === 'product' && k === 1 && parts[0] === 'gp'));
  if (i < 0) return false;
  if (parts[i] === 'dp' && i === 1 && parts[0] === 'gp') return false;
  const rest = parts.slice(i + 1);
  return rest[0] === asin && rest.length <= 2;
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return m ? m[2] : null;
}

/**
 * SiteStripe の画像リンクのコードを検証する。
 * 条件：リンク先が amazon.co.jp の同じ ASIN で自分のタグ付き、画像が ws-fe.amazon-adsystem.com の
 * 同じ ASIN・自分のタグ・日本のマーケットプレイス。満たさなければ null。
 * @returns {{ href: string, imgSrc: string, pixelSrc: string|null } | null}
 */
export function parseSiteStripe(html, asin, tag) {
  if (typeof html !== 'string' || !asin || !tag) return null;
  const aTag = html.match(/<a\s[^>]*>/i)?.[0];
  const imgTags = html.match(/<img\s[^>]*>/gi) ?? [];
  const href = toUrl(aTag && attr(aTag, 'href'));
  if (!href || href.protocol !== 'https:' || !LINK_HOSTS.has(href.hostname)) return null;
  if (!isProductPath(href.pathname, asin)) return null;
  if (href.searchParams.get('tag') !== tag) return null;

  let imgSrc = null;
  let pixelSrc = null;
  for (const t of imgTags) {
    const u = toUrl(attr(t, 'src'));
    if (!u) continue;
    if (u.protocol !== 'https:') continue;
    if (u.hostname === IMG_HOST && u.pathname === '/widgets/q') {
      if (u.searchParams.get('ASIN') !== asin || u.searchParams.get('tag') !== tag) return null;
      if (u.searchParams.get('MarketPlace') !== 'JP') return null;
      imgSrc = u.href;
    } else if (u.hostname === PIXEL_HOST && u.pathname === '/e/ir') {
      if (u.searchParams.get('t') === tag && u.searchParams.get('a') === asin) pixelSrc = u.href;
    }
  }
  if (!imgSrc) return null;
  return { href: href.href, imgSrc, pixelSrc };
}

/** データ（data/sitestripe.json）から、その ASIN の検証済み画像リンクを返す。 */
export function siteStripeFor(data, asin, tag) {
  const entry = asin ? data?.asins?.[asin] : null;
  return entry ? parseSiteStripe(entry.html, asin, tag) : null;
}

/** 商品の写真（Amazon の商品画像）を <a><img> で返す。 */
export function siteStripeImage(parsed, alt, size = 48) {
  const pixel = parsed.pixelSrc
    ? `<img class="ss-pixel" src="${escapeHtml(parsed.pixelSrc)}" width="1" height="1" alt="" loading="lazy" />`
    : '';
  return `<a class="ss-photo" href="${escapeHtml(parsed.href)}" target="_blank" rel="nofollow sponsored noopener"><img src="${escapeHtml(parsed.imgSrc)}" alt="${escapeHtml(alt)}（Amazon の商品画像）" width="${size}" height="${size}" loading="lazy" /></a>${pixel}`;
}
