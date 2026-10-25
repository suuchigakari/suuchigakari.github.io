import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

import { ARTICLE_CATEGORY, CATEGORIES, categoryOf, highlightNumbers } from '../src/theme.js';
import { chartRows, chartSpec } from '../src/chart.js';

test('すべての記事にカテゴリがある', () => {
  const slugs = readdirSync(new URL('../data/articles/', import.meta.url))
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace(/\.json$/, ''));
  const manual = JSON.parse(readFileSync(new URL('../data/article-list.json', import.meta.url), 'utf8'));
  for (const slug of [...slugs, ...manual.articles.map((entry) => entry.slug)]) {
    assert.ok(categoryOf(slug), slug);
  }
  for (const key of Object.values(ARTICLE_CATEGORY)) assert.ok(CATEGORIES[key], key);
});

test('数字＋単位だけを強調し、HTML はエスケープする', () => {
  assert.equal(
    highlightNumbers('表面が乾く時間は6分から10時間まで'),
    '表面が乾く時間は<strong class="hl">6分</strong>から<strong class="hl">10時間</strong>まで',
  );
  assert.equal(highlightNumbers('24時間〜7日（23℃）'), '<strong class="hl">24時間</strong>〜<strong class="hl">7日</strong>（<strong class="hl">23℃</strong>）');
  assert.equal(highlightNumbers('-40〜150℃'), '<strong class="hl">-40〜150℃</strong>');
  assert.equal(highlightNumbers('<b>&"\'1'), '&lt;b&gt;&amp;&quot;&#39;1');
  assert.equal(highlightNumbers('JIS A 5758 の区分'), 'JIS A 5758 の区分');
});

test('棒グラフは数値のある商品だけを並べ、向きは入力の種類で決まる', () => {
  const article = {
    filter: { numberInputs: [{ key: 'w', type: 'atMost', label: '重さ (g)', unit: 'g' }] },
    columns: [{ key: 'w', label: '重さ', unit: 'g' }],
    products: [],
  };
  const spec = chartSpec(article);
  assert.deepEqual([spec.label, spec.unit, spec.order], ['重さ', 'g', 'asc']);
  const { rows, missing } = chartRows(
    [{ name: 'a', specs: { w: 200 } }, { name: 'b', specs: { w: 100 } }, { name: 'c', specs: { w: null } }],
    spec,
  );
  assert.deepEqual(rows.map((row) => [row.name, row.percent]), [['b', 50], ['a', 100]]);
  assert.equal(missing, 1);
  assert.equal(chartSpec({ ...article, chart: false }), null);
});

test('すべての記事・商品に種類のイラストがある', async () => {
  const { illustration, illustrationKey } = await import('../src/illustrations.js');
  const dir = new URL('../data/articles/', import.meta.url);
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.json'))) {
    const article = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
    for (const product of article.products) {
      assert.match(illustration(illustrationKey(article.slug, product.specs)), /^<svg/, `${article.slug} ${product.name}`);
    }
  }
  assert.equal(illustrationKey('caulking', { volume: '50mL・100mL（チューブ）、333mL（カートリッジ）' }), 'tube');
  assert.equal(illustrationKey('caulking', { volume: '330mL（カートリッジ）' }), 'cartridge');
  assert.equal(illustrationKey('adhesive', { type: 'エポキシ系（2液混合）' }), 'twin-tube');
  assert.equal(illustrationKey('stepladder', { type: 'はしご兼用脚立' }), 'ladder-combo');
});
