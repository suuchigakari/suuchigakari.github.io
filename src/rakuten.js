/**
 * 楽天アフィリエイトの検索リンク。
 *
 * 楽天市場は同じ商品でも店ごとに商品ページが分かれるため、型番などで楽天市場を検索したページへ
 * アフィリエイトリンク（hb.afl.rakuten.co.jp/hgc/<アフィリエイトID>/?pc=<URL>）を作る。
 * アフィリエイトIDは site.config.json の rakutenAffiliateId（「URLを入力してリンクを作成」で発行される hgc 用の ID。
 * 商品リンクの ichiba 用の ID とは別の値）。
 *
 * 楽天市場の公式ショップ（メーカー・ブランドの持ち主が出店している店）で商品ページを確かめた商品は、
 * 記事 JSON の rakutenUrl に商品ページ（https://item.rakuten.co.jp/<店>/<商品>/）を書くと、
 * 検索ページではなくその商品ページへの同じ形式のリンク（「楽天市場で見る」）になる。
 * rakutenUrl がある商品は Amazon の ASIN がなくてもリンクを出す。
 */

const ID_RE = /^[0-9a-f]{8}\.[0-9a-f]{8}\.[0-9a-f]{8}\.[0-9a-f]{8}$/;

/** 公式のテキストリンクに付く ut（{"page":"url","type":"text","col":1} を Base64 にしたもの）。 */
const TEXT_LINK_UT = 'eyJwYWdlIjoidXJsIiwidHlwZSI6InRleHQiLCJjb2wiOjF9';

export function isValidRakutenId(id) {
  return typeof id === 'string' && ID_RE.test(id);
}

/** 商品名から検索語を作る。かっこ書き（色・型番の補足など）を外し、空白を詰める。 */
export function rakutenKeyword(product) {
  if (product.rakutenQuery) return product.rakutenQuery;
  return String(product.name ?? '')
    .replace(/（[^）]*）|\([^)]*\)|【[^】]*】/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 楽天市場の検索結果へのアフィリエイトリンク。ID か検索語がなければ null。 */
export function buildRakutenSearchUrl({ affiliateId, keyword }) {
  if (!isValidRakutenId(affiliateId) || !keyword) return null;
  const target = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
  // 楽天アフィリエイトの「URLを入力してリンクを作成」（テキストリンク）が出力する形と同じにする
  // （2026-11-23 に運営者が公式の画面で作ったリンクと1文字ずつ一致することをテストで確認）。
  const url = new URL(`https://hb.afl.rakuten.co.jp/hgc/${affiliateId}/`);
  url.searchParams.set('pc', target);
  url.searchParams.set('link_type', 'text');
  url.searchParams.set('ut', TEXT_LINK_UT);
  return url.toString();
}

/**
 * 商品に楽天のリンクを付けるか。Amazon の ASIN がある（メーカー品として照合済みの）商品と、
 * 記事 JSON で rakuten: true を付けた商品だけ。rakuten: false で外せる。
 */
const ITEM_URL_RE = /^https:\/\/item\.rakuten\.co\.jp\/[a-z0-9_-]+\/[A-Za-z0-9_.-]+\/$/;

/** 楽天市場の商品ページの URL（https://item.rakuten.co.jp/<店>/<商品>/）か。 */
export function isRakutenItemUrl(url) {
  return typeof url === 'string' && ITEM_URL_RE.test(url);
}

/** 任意の楽天市場のページへのアフィリエイトリンク（公式の「URLを入力してリンクを作成」と同じ形式）。 */
export function buildRakutenLink({ affiliateId, target }) {
  if (!isValidRakutenId(affiliateId) || !target) return null;
  const url = new URL(`https://hb.afl.rakuten.co.jp/hgc/${affiliateId}/`);
  url.searchParams.set('pc', target);
  url.searchParams.set('link_type', 'text');
  url.searchParams.set('ut', TEXT_LINK_UT);
  return url.toString();
}

/**
 * 商品の楽天リンクとボタンの文言。商品ページが分かっていれば「楽天市場で見る」、
 * そうでなければ検索ページへの「楽天市場で探す」。出さないときは null。
 */
export function rakutenLinkFor(product, config) {
  if (product.rakuten === false) return null;
  if (product.rakutenUrl !== undefined) {
    if (!isRakutenItemUrl(product.rakutenUrl)) throw new Error(`rakutenUrl が楽天市場の商品ページの形式ではありません: ${product.name}`);
    const url = buildRakutenLink({ affiliateId: config.rakutenAffiliateId, target: product.rakutenUrl });
    return url ? { url, label: config.rakutenItemCtaLabel ?? '楽天市場で見る' } : null;
  }
  const url = rakutenUrlFor(product, config);
  return url ? { url, label: config.rakutenCtaLabel ?? '楽天市場で探す' } : null;
}

export function rakutenUrlFor(product, config) {
  if (product.rakuten === false) return null;
  if (!product.asin && product.rakuten !== true) return null;
  return buildRakutenSearchUrl({ affiliateId: config.rakutenAffiliateId, keyword: rakutenKeyword(product) });
}
