import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AffiliateLinkError,
  buildAffiliateUrl,
  buildHtmlSnippet,
  buildMarkdownSnippet,
  isAmazonHost,
  isValidTag,
  parseAmazonInput,
  toAffiliateLink,
} from '../src/affiliate.js';

const TAG = 'example-22';

test('/dp/ 形式のURLから ASIN を取り出す', () => {
  const { asin, domain } = parseAmazonInput('https://www.amazon.co.jp/dp/B0CGXXXX12');
  assert.equal(asin, 'B0CGXXXX12');
  assert.equal(domain, 'amazon.co.jp');
});

test('商品名付き・追跡パラメータ付きのURLでも ASIN を取り出す', () => {
  const input =
    'https://www.amazon.co.jp/%E5%95%86%E5%93%81%E5%90%8D/dp/b0cgxxxx12/ref=sr_1_3?keywords=x&qid=17&sr=8-3&th=1';
  assert.equal(parseAmazonInput(input).asin, 'B0CGXXXX12');
});

test('/gp/product/ ・ /gp/aw/d/ ・ /exec/obidos/ASIN/ 形式に対応する', () => {
  for (const path of [
    '/gp/product/B0CGXXXX12',
    '/gp/aw/d/B0CGXXXX12/',
    '/exec/obidos/ASIN/B0CGXXXX12/ref=nosim',
    '/gp/offer-listing/B0CGXXXX12',
  ]) {
    assert.equal(parseAmazonInput(`https://www.amazon.co.jp${path}`).asin, 'B0CGXXXX12', path);
  }
});

test('クエリの asin パラメータからも取り出す', () => {
  assert.equal(
    parseAmazonInput('https://www.amazon.co.jp/gp/aws/cart/add.html?ASIN=B0CGXXXX12').asin,
    'B0CGXXXX12',
  );
});

test('smile. / m. / スキームなしの入力を受け付ける', () => {
  assert.equal(parseAmazonInput('smile.amazon.com/dp/B0CGXXXX12').domain, 'amazon.com');
  assert.equal(parseAmazonInput('m.amazon.co.jp/dp/B0CGXXXX12').domain, 'amazon.co.jp');
});

test('ASIN 単体の入力は既定のマーケットプレイスとして扱う', () => {
  assert.deepEqual(parseAmazonInput('b0cgxxxx12'), {
    asin: 'B0CGXXXX12',
    domain: 'amazon.co.jp',
  });
  assert.equal(
    parseAmazonInput('B0CGXXXX12', { defaultDomain: 'amazon.com' }).domain,
    'amazon.com',
  );
});

test('短縮URLは専用のエラーコードで拒否する', () => {
  assert.throws(() => parseAmazonInput('https://amzn.to/3xyzabc'), (error) => {
    assert.ok(error instanceof AffiliateLinkError);
    assert.equal(error.code, 'SHORT_LINK');
    return true;
  });
});

test('Amazon 以外・ASIN なしのURLを拒否する', () => {
  assert.throws(() => parseAmazonInput('https://example.com/dp/B0CGXXXX12'), { code: 'NOT_AMAZON' });
  assert.throws(() => parseAmazonInput('https://www.amazon.co.jp/s?k=keyboard'), { code: 'NO_ASIN' });
  assert.throws(() => parseAmazonInput('   '), { code: 'EMPTY' });
});

test('アフィリエイトURLは /dp/{ASIN}?tag= の最小形になる', () => {
  assert.equal(
    buildAffiliateUrl({ asin: 'B0CGXXXX12', tag: TAG }),
    'https://www.amazon.co.jp/dp/B0CGXXXX12?tag=example-22',
  );
  assert.equal(
    buildAffiliateUrl({ asin: 'B0CGXXXX12', tag: TAG, domain: 'amazon.com' }),
    'https://www.amazon.com/dp/B0CGXXXX12?tag=example-22',
  );
});

test('既存の追跡パラメータと元のタグを引き継がない', () => {
  const { url } = toAffiliateLink(
    'https://www.amazon.co.jp/dp/B0CGXXXX12?tag=someoneelse-22&linkCode=ll1&pd_rd_w=zzz',
    { tag: TAG },
  );
  assert.equal(url, 'https://www.amazon.co.jp/dp/B0CGXXXX12?tag=example-22');
  assert.ok(!url.includes('someoneelse-22'));
});

test('forceDomain で送客先マーケットプレイスを固定できる', () => {
  const { url } = toAffiliateLink('https://www.amazon.com/dp/B0CGXXXX12', {
    tag: TAG,
    forceDomain: 'amazon.co.jp',
  });
  assert.equal(url, 'https://www.amazon.co.jp/dp/B0CGXXXX12?tag=example-22');
});

test('タグの形式を検証する', () => {
  assert.ok(isValidTag('example-22'));
  assert.ok(isValidTag('my.shop-20'));
  assert.ok(!isValidTag('example'));
  assert.ok(!isValidTag('example-2'));
  assert.ok(!isValidTag(''));
  assert.throws(() => buildAffiliateUrl({ asin: 'B0CGXXXX12', tag: 'example' }), {
    code: 'INVALID_TAG',
  });
});

test('不正な ASIN・未対応ドメインを拒否する', () => {
  assert.throws(() => buildAffiliateUrl({ asin: 'SHORT', tag: TAG }), { code: 'NO_ASIN' });
  assert.throws(() => buildAffiliateUrl({ asin: 'B0CGXXXX12', tag: TAG, domain: 'rakuten.co.jp' }), {
    code: 'NOT_AMAZON',
  });
});

test('isAmazonHost は www./smile. の有無を問わない', () => {
  assert.ok(isAmazonHost('www.amazon.co.jp'));
  assert.ok(isAmazonHost('AMAZON.COM'));
  assert.ok(!isAmazonHost('amazon.example.com'));
});

test('スニペットは sponsored / nofollow 付きでエスケープされる', () => {
  const html = buildHtmlSnippet({
    url: 'https://www.amazon.co.jp/dp/B0CGXXXX12?tag=example-22',
    label: '<商品名> & "レビュー"',
  });
  assert.match(html, /rel="nofollow sponsored noopener"/);
  assert.match(html, /&lt;商品名&gt; &amp; &quot;レビュー&quot;/);
  assert.ok(!html.includes('<商品名>'));

  assert.equal(
    buildMarkdownSnippet({ url: 'https://example.com', label: '[PR] 商品' }),
    '[\\[PR\\] 商品](https://example.com)',
  );
});
