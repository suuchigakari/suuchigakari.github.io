import test from 'node:test';
import assert from 'node:assert/strict';

import { promosFor, renderPromos } from '../src/promo.js';

const promo = {
  id: 'a',
  title: 't',
  body: ['b'],
  cta: 'c',
  url: 'https://www.amazon.co.jp/b?node=1&tag=me-22',
  source: 's',
  checkedOn: '2026-10-27',
  articles: ['x'],
};

test('指定した記事にだけ出す', () => {
  assert.equal(promosFor('x', [promo], 'me-22').length, 1);
  assert.equal(promosFor('y', [promo], 'me-22').length, 0);
});

test('自分のタグがないリンク・確認日や出典がないものは出さない', () => {
  assert.equal(promosFor('x', [{ ...promo, url: 'https://www.amazon.co.jp/b?node=1&tag=other-22' }], 'me-22').length, 0);
  assert.equal(promosFor('x', [{ ...promo, url: 'https://amzn.to/abc' }], 'me-22').length, 0);
  assert.equal(promosFor('x', [{ ...promo, checkedOn: '' }], 'me-22').length, 0);
  assert.equal(promosFor('x', [{ ...promo, source: '' }], 'me-22').length, 0);
});

test('PR 表示と sponsored のリンクを出す', () => {
  const html = renderPromos('x', [promo], 'me-22');
  assert.match(html, /<p class="promo-label">PR<\/p>/);
  assert.match(html, /rel="nofollow sponsored noopener"/);
  assert.equal(renderPromos('y', [promo], 'me-22'), '');
});
