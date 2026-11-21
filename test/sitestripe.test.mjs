import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSiteStripe, siteStripeImage } from '../src/sitestripe.js';

const ASIN = 'B0D9YGVP32';
const TAG = 'suuchigakari-22';
const good = `<a href="https://www.amazon.co.jp/dp/${ASIN}?&linkCode=li2&tag=${TAG}&linkId=abc&language=ja_JP&ref_=as_li_ss_il" target="_blank"><img border="0" src="//ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${ASIN}&Format=_SL160_&ID=AsinImage&MarketPlace=JP&ServiceVersion=20070822&WS=1&tag=${TAG}&language=ja_JP" ></a><img src="https://ir-jp.amazon-adsystem.com/e/ir?t=${TAG}&language=ja_JP&l=li2&o=9&a=${ASIN}" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" />`;

test('SiteStripe の画像コードを検証して組み立て直す', () => {
  const p = parseSiteStripe(good, ASIN, TAG);
  assert.ok(p);
  assert.match(p.imgSrc, /^https:\/\/ws-fe\.amazon-adsystem\.com\/widgets\/q\?/);
  assert.match(p.pixelSrc, /ir-jp\.amazon-adsystem\.com/);
  const html = siteStripeImage(p, '商品"A"');
  assert.match(html, /rel="nofollow sponsored noopener"/);
  assert.ok(!html.includes('style='), '貼られた属性はそのまま出さない');
  assert.match(html, /商品&quot;A&quot;/);
});

test('タグ・ASIN・ホストが違うものは使わない', () => {
  assert.equal(parseSiteStripe(good.replaceAll(TAG, 'other-22'), ASIN, TAG), null);
  assert.equal(parseSiteStripe(good, 'B000000000', TAG), null);
  assert.equal(parseSiteStripe(good.replace('ws-fe.amazon-adsystem.com', 'evil.example.com'), ASIN, TAG), null);
  assert.equal(parseSiteStripe(good.replace('https://www.amazon.co.jp', 'https://evil.example.com'), ASIN, TAG), null);
  assert.equal(parseSiteStripe('<script>alert(1)</script>', ASIN, TAG), null);
});
