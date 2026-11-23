/**
 * 楽天アフィリエイトの検索リンク。
 *
 * 楽天市場は同じ商品でも店ごとに商品ページが分かれるため、型番などで楽天市場を検索したページへ
 * アフィリエイトリンク（hb.afl.rakuten.co.jp/hgc/<アフィリエイトID>/?pc=<URL>）を作る。
 * アフィリエイトIDは site.config.json の rakutenAffiliateId。
 */

const ID_RE = /^[0-9a-f]{8}\.[0-9a-f]{8}\.[0-9a-f]{8}\.[0-9a-f]{8}$/;

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
  const url = new URL(`https://hb.afl.rakuten.co.jp/hgc/${affiliateId}/`);
  url.searchParams.set('pc', target);
  url.searchParams.set('m', target);
  return url.toString();
}

/**
 * 商品に楽天のリンクを付けるか。Amazon の ASIN がある（メーカー品として照合済みの）商品と、
 * 記事 JSON で rakuten: true を付けた商品だけ。rakuten: false で外せる。
 */
export function rakutenUrlFor(product, config) {
  if (product.rakuten === false) return null;
  if (!product.asin && product.rakuten !== true) return null;
  return buildRakutenSearchUrl({ affiliateId: config.rakutenAffiliateId, keyword: rakutenKeyword(product) });
}
