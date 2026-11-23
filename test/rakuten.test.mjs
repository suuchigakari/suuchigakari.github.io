import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRakutenSearchUrl, rakutenKeyword, rakutenUrlFor, isValidRakutenId } from '../src/rakuten.js';

const ID = '59ddc2e6.ad0dd3a7.59ddc2e7.0b154655';

test('楽天市場の検索結果へのアフィリエイトリンクを作る', () => {
  const url = new URL(buildRakutenSearchUrl({ affiliateId: ID, keyword: 'アルインコ MR150W' }));
  assert.equal(url.hostname, 'hb.afl.rakuten.co.jp');
  assert.equal(url.pathname, `/hgc/${ID}/`);
  assert.equal(url.searchParams.get('pc'), 'https://search.rakuten.co.jp/search/mall/%E3%82%A2%E3%83%AB%E3%82%A4%E3%83%B3%E3%82%B3%20MR150W/');
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
