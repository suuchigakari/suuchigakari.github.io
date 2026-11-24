import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRakutenSearchUrl, rakutenKeyword, rakutenUrlFor, rakutenLinkFor, isValidRakutenId } from '../src/rakuten.js';

const ID = '0bc71f59.f8a1bcec.0bc71f5a.c364cce5';

test('楽天の公式の「URLを入力してリンクを作成」と1文字も違わないリンクを作る', () => {
  // 2026-11-23 に運営者が楽天アフィリエイトの画面で作ったテキストリンク（href）
  const official = 'https://hb.afl.rakuten.co.jp/hgc/0bc71f59.f8a1bcec.0bc71f5a.c364cce5/?pc=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%25E3%2582%25A2%25E3%2583%25AB%25E3%2582%25A4%25E3%2583%25B3%25E3%2582%25B3%2520MR150W%2F&link_type=text&ut=eyJwYWdlIjoidXJsIiwidHlwZSI6InRleHQiLCJjb2wiOjF9';
  assert.equal(buildRakutenSearchUrl({ affiliateId: ID, keyword: 'アルインコ MR150W' }), official);
});

test('ID の形式が違うとリンクを作らない', () => {
  assert.equal(isValidRakutenId('abc'), false);
  assert.equal(buildRakutenSearchUrl({ affiliateId: 'abc', keyword: 'x' }), null);
});

test('検索語はかっこ書きを外す', () => {
  assert.equal(rakutenKeyword({ name: 'アルインコ KUR150（ブラック）' }), 'アルインコ KUR150');
  assert.equal(rakutenKeyword({ name: 'x', rakutenQuery: '指定語' }), '指定語');
});

test('ASIN がある商品か rakuten: true の商品だけに付ける', () => {
  const config = { rakutenAffiliateId: ID };
  assert.ok(rakutenUrlFor({ name: 'A', asin: 'B000000000' }, config));
  assert.equal(rakutenUrlFor({ name: 'B' }, config), null);
  assert.ok(rakutenUrlFor({ name: 'C', rakuten: true }, config));
  assert.equal(rakutenUrlFor({ name: 'D', asin: 'B000000000', rakuten: false }, config), null);
});

test('rakutenUrl（公式ショップの商品ページ）があれば商品ページへのリンクにし、ASIN がなくても出す', () => {
  const config = { rakutenAffiliateId: ID };
  const link = rakutenLinkFor({ name: 'X', rakutenUrl: 'https://item.rakuten.co.jp/mujirushi-ryohin/4550512345678/' }, config);
  assert.equal(link.label, '楽天市場で見る');
  assert.equal(link.url, `https://hb.afl.rakuten.co.jp/hgc/${ID}/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmujirushi-ryohin%2F4550512345678%2F&link_type=text&ut=eyJwYWdlIjoidXJsIiwidHlwZSI6InRleHQiLCJjb2wiOjF9`);
  assert.equal(rakutenLinkFor({ name: 'Y', asin: 'B000000000' }, config).label, '楽天市場で探す');
  assert.equal(rakutenLinkFor({ name: 'Z', rakutenUrl: 'https://item.rakuten.co.jp/a/b/', rakuten: false }, config), null);
});

test('rakutenUrl が商品ページの形式でなければビルドを止める', () => {
  const config = { rakutenAffiliateId: ID };
  assert.throws(() => rakutenLinkFor({ name: 'X', rakutenUrl: 'https://search.rakuten.co.jp/search/mall/x/' }, config));
  assert.throws(() => rakutenLinkFor({ name: 'X', rakutenUrl: 'https://example.com/' }, config));
});

test('楽天のリンクは公式のテキストリンクと同じ属性の <a> にする（属性の追加・削除をしない）', async () => {
  const { rakutenAnchorHtml } = await import('../src/rakuten.js');
  const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  const html = rakutenAnchorHtml({ url: 'https://hb.afl.rakuten.co.jp/hgc/x/?pc=y&link_type=text', label: '楽天市場で見る' }, esc);
  const anchor = html.match(/<a [^>]*>/)[0];
  assert.equal(anchor, '<a href="https://hb.afl.rakuten.co.jp/hgc/x/?pc=y&amp;link_type=text" target="_blank" rel="nofollow sponsored noopener" style="word-wrap:break-word;">');
});

test('楽天の商品リンクは、その商品の rakutenUrl へのリンクで価格なしのものだけを通す', async () => {
  const { validateItemLinkHtml } = await import('../src/rakuten.js');
  const target = 'https://item.rakuten.co.jp/keyuca/s10000191/';
  const ut = (o) => Buffer.from(JSON.stringify(o)).toString('base64');
  const make = (pc, opts) => `<table><tr><td><div><a href="https://hb.afl.rakuten.co.jp/ichiba/x/?pc=${encodeURIComponent(pc)}&link_type=picttext&ut=${encodeURIComponent(ut(opts))}" target="_blank"><img src="https://hbb.afl.rakuten.co.jp/hgb/x/?s=64x64" border="0"></a></div></td></tr></table>`;
  assert.deepEqual(validateItemLinkHtml(make(target, { type: 'picttext', price: 0 }), target), []);
  assert.ok(validateItemLinkHtml(make(target, { type: 'picttext', price: 1 }), target).some((p) => p.includes('価格')));
  assert.ok(validateItemLinkHtml(make('https://item.rakuten.co.jp/other/1/', { type: 'picttext', price: 0 }), target).some((p) => p.includes('rakutenUrl')));
  assert.ok(validateItemLinkHtml(make(target, { type: 'picttext', price: 0 }).replace('<div>', '<div><script>x</script>'), target).length > 0);
});

test('data/rakuten-item-links.json の商品リンクは、どれも記事の商品の rakutenUrl に対応し、検査を通る', async () => {
  const { readFile, readdir } = await import('node:fs/promises');
  const { validateItemLinkHtml } = await import('../src/rakuten.js');
  const links = JSON.parse(await readFile(new URL('../data/rakuten-item-links.json', import.meta.url), 'utf8')).links;
  const dir = new URL('../data/articles/', import.meta.url);
  const urls = new Set();
  for (const f of (await readdir(dir)).filter((n) => n.endsWith('.json'))) {
    for (const p of JSON.parse(await readFile(new URL(f, dir), 'utf8')).products) if (p.rakutenUrl) urls.add(p.rakutenUrl);
  }
  for (const [url, entry] of Object.entries(links)) {
    assert.ok(urls.has(url), `記事にない rakutenUrl: ${url}`);
    assert.deepEqual(validateItemLinkHtml(entry.html, url), [], url);
  }
});
