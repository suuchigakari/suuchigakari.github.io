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

/**
 * 楽天のリンクの HTML。楽天アフィリエイトのリンク作成（テキストリンク）が出力する <a> を
 * 属性も含めてそのまま出す（ガイドライン「リンクタグ（aタグ）…の属性を追加・削除・変更する行為」の禁止）。
 * 編集してよいのはリンクの文字だけ。見た目は外側の <span class="cta-small cta-rakuten"> で付け、<a> には触れない。
 */
export function rakutenAnchorHtml(link, escape) {
  return `<span class="cta-small cta-rakuten"><a href="${escape(link.url)}" target="_blank" rel="nofollow sponsored noopener" style="word-wrap:break-word;">${escape(link.label)}</a></span>`;
}

/**
 * 楽天アフィリエイトの「商品リンク」（画像＋テキスト）の HTML。
 * 運営者がリンク作成で作った HTML を data/rakuten-item-links.json に1文字も変えずに入れ、そのまま出す
 * （ガイドライン：生成された HTML の変更・画像サイズの変更の禁止）。
 * 入れてよいのは、その商品の rakutenUrl へのリンクで、価格を表示しない設定（ut の price:0）のものだけ。
 * 形が違えばビルドを止める。
 */
const ALLOWED_TAGS = new Set(['table', 'tr', 'td', 'div', 'a', 'img', 'p']);

export function validateItemLinkHtml(html, rakutenUrl) {
  const problems = [];
  if (typeof html !== 'string' || !/^<table[\s\S]*<\/table>$/.test(html.trim())) problems.push('table で始まり table で終わる形ではない');
  if (/<script|javascript:|\son[a-z]+\s*=/i.test(html)) problems.push('スクリプトを含む');
  for (const [, tag] of html.matchAll(/<\/?([a-zA-Z0-9]+)/g)) {
    if (!ALLOWED_TAGS.has(tag.toLowerCase())) problems.push(`想定外のタグ <${tag}>`);
  }
  const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1].replaceAll('&amp;', '&'));
  if (hrefs.length === 0) problems.push('リンクがない');
  for (const href of hrefs) {
    let url;
    try { url = new URL(href); } catch { problems.push(`URL として読めない: ${href}`); continue; }
    if (url.origin !== 'https://hb.afl.rakuten.co.jp' || !url.pathname.startsWith('/ichiba/')) problems.push(`楽天アフィリエイトのリンクではない: ${href}`);
    if (url.searchParams.get('pc') !== rakutenUrl) problems.push(`リンク先が rakutenUrl と違う: ${url.searchParams.get('pc')}`);
    let ut = null;
    try { ut = JSON.parse(Buffer.from(url.searchParams.get('ut') ?? '', 'base64').toString('utf8')); } catch { /* 下で扱う */ }
    if (!ut || ut.type !== 'picttext') problems.push('画像＋テキストの商品リンクではない');
    else if (ut.price !== 0) problems.push('価格を表示する設定になっている（price:0 で作り直す）');
  }
  for (const [, src] of html.matchAll(/<img[^>]*src="([^"]*)"/g)) {
    if (!src.startsWith('https://hbb.afl.rakuten.co.jp/')) problems.push(`画像が楽天アフィリエイトの配信ではない: ${src}`);
  }
  return problems;
}

/** 商品の商品リンク（なければ空文字）。外側の div だけがこのサイトのもの。 */
export function rakutenItemWidget(product, itemLinks) {
  if (!product.rakutenUrl || product.rakuten === false) return '';
  const entry = itemLinks?.[product.rakutenUrl];
  if (!entry) return '';
  const problems = validateItemLinkHtml(entry.html, product.rakutenUrl);
  if (problems.length) throw new Error(`楽天の商品リンクが使えません（${product.name}）: ${problems.join(' / ')}`);
  return `<div class="rk-item">${entry.html.trim()}</div>`;
}
