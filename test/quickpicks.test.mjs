import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { quickPicks } from '../src/quickpicks.js';

const products = [
  { name: 'A', specs: { loadKg: 5, weightG: 300, type: 'ジャッキ', ok: true } },
  { name: 'B', specs: { loadKg: 7, weightG: 500, type: 'ジャッキスタンド', ok: false } },
  { name: 'C', specs: { loadKg: 7, weightG: null, type: 'ジャッキ', ok: true } },
  { name: 'D', specs: { loadKg: 7, weightG: 300, type: 'ジャッキ', ok: true } },
];

test('一番の製品を選び、同じ値は2つまで名前を出して残りは件数', () => {
  const [pick] = quickPicks({ quickPicks: [{ title: '耐荷重が最も大きい', key: 'loadKg', order: 'desc', unit: 'kg' }] }, products);
  assert.equal(pick.valueText, '7kg');
  assert.deepEqual(pick.products.map((p) => p.name), ['B', 'C']);
  assert.equal(pick.others, 1);
});

test('where で対象を絞る（一致・含む・含まない）', () => {
  const a = { quickPicks: [
    { title: 't1', key: 'loadKg', order: 'desc', where: { type: { excludes: 'スタンド' } } },
    { title: 't2', key: 'weightG', order: 'asc', where: { ok: true } },
    { title: 't3', key: 'loadKg', order: 'asc', where: { type: { includes: 'スタンド' } } },
  ] };
  const picks = quickPicks(a, products);
  assert.deepEqual(picks[0].products.map((p) => p.name), ['C', 'D']);
  assert.deepEqual(picks[1].products.map((p) => p.name), ['A', 'D']);
  assert.equal(picks.length, 2, '対象が1つ以下の項目は出さない');
});

test('quickPicks を書いていない記事は出さない', () => {
  assert.equal(quickPicks({}, products).length, 0);
});

test('各記事の quickPicks の key は、その記事の製品の仕様にある', () => {
  const dir = new URL('../data/articles/', import.meta.url);
  for (const file of readdirSync(dir)) {
    const article = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
    for (const pick of article.quickPicks ?? []) {
      assert.ok(pick.title && pick.key && ['asc', 'desc'].includes(pick.order), `${article.slug}: title・key・order が必要`);
      assert.ok(!/おすすめ|人気|No\.1/.test(pick.title), `${article.slug}: 早見表の見出しに書いてはいけない表現`);
    }
  }
});

test('同じ製品・同じ値になった項目は重ねて出さない', () => {
  const a = { quickPicks: [
    { title: 'a', key: 'weightG', order: 'asc' },
    { title: 'b', key: 'weightG', order: 'asc', where: { ok: true } },
  ] };
  assert.equal(quickPicks(a, products).length, 1);
});
