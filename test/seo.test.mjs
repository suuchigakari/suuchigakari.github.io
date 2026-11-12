import test from 'node:test';
import assert from 'node:assert/strict';
import { absoluteUrl, articleSeo, homeSeo, isoDate, lastCheckedFact } from '../src/seo.js';

const config = { siteName: 'テスト', tagline: '説明', siteUrl: 'https://example.github.io/' };

test('絶対URLを作る', () => {
  assert.equal(absoluteUrl('https://example.github.io', 'articles/a.html'), 'https://example.github.io/articles/a.html');
});

test('記事の head に正規URL・OGP・構造化データが入る', () => {
  const html = articleSeo({ title: 'A<B', description: '説明"', slug: 'a', asOf: '2026-11-12', config });
  assert.match(html, /rel="canonical" href="https:\/\/example.github.io\/articles\/a.html"/);
  assert.match(html, /og:title" content="A&lt;B"/);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  assert.equal(blocks[0]['@type'], 'Article');
  assert.equal(blocks[0].dateModified, '2026-11-12');
  assert.equal(blocks[0].headline, 'A<B');
  assert.equal(blocks[1]['@type'], 'BreadcrumbList');
  assert.ok(!/<\/script>.*<B/.test(html), '< は JSON 内でエスケープする');
});

test('月だけの日付は dateModified に使わない', () => {
  assert.equal(isoDate('2026-08'), null);
  const html = articleSeo({ title: 'A', description: 'B', slug: 'a', asOf: '2026-08', config });
  assert.ok(!html.includes('dateModified'));
});

test('トップページは WebSite', () => {
  assert.match(homeSeo(config), /"@type":"WebSite"/);
});

test('最終確認日は time 要素で出す', () => {
  assert.match(lastCheckedFact('2026-11-12'), /<time datetime="2026-11-12">/);
});
