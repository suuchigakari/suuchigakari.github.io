import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRakutenSearchUrl, rakutenKeyword, rakutenUrlFor, isValidRakutenId } from '../src/rakuten.js';

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
