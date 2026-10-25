import test from 'node:test';
import assert from 'node:assert/strict';

import { activeSaleNotice, renderSaleNotice, saleNoticeText, todayIso } from '../src/sale.js';

const notice = {
  name: 'Amazon ブラックフライデー',
  start: '2026-11-20',
  end: '2026-11-30',
  source: 'https://www.amazon.co.jp/',
  checkedOn: '2026-11-10',
};

test('期間中と開始前は表示し、終了日の翌日からは出さない', () => {
  assert.equal(activeSaleNotice(notice, '2026-11-10'), notice);
  assert.equal(activeSaleNotice(notice, '2026-11-30'), notice);
  assert.equal(activeSaleNotice(notice, '2026-12-01'), null);
});

test('設定がない・欠けている・日付が逆のものは出さない', () => {
  assert.equal(activeSaleNotice(null, '2026-11-10'), null);
  assert.equal(activeSaleNotice({ ...notice, source: '' }, '2026-11-10'), null);
  assert.equal(activeSaleNotice({ ...notice, checkedOn: undefined }, '2026-11-10'), null);
  assert.equal(activeSaleNotice({ ...notice, start: '2026-12-01' }, '2026-11-10'), null);
  assert.equal(activeSaleNotice({ ...notice, end: '11/30' }, '2026-11-10'), null);
});

test('文言に期間と確認日が入り、価格は入らない', () => {
  const text = saleNoticeText(notice);
  assert.match(text, /11月20日〜11月30日/);
  assert.match(text, /2026-11-10 確認/);
  assert.doesNotMatch(text, /円|%|％/);
});

test('HTML は終了日を data-end に持ち、表示しないときは空', () => {
  assert.match(renderSaleNotice(notice, '2026-11-10', '../assets/sale-notice.js'), /data-end="2026-11-30"/);
  assert.equal(renderSaleNotice(notice, '2026-12-01', '../assets/sale-notice.js'), '');
});

test('todayIso はローカル日付を YYYY-MM-DD で返す', () => {
  assert.equal(todayIso(new Date(2026, 0, 5)), '2026-01-05');
});
