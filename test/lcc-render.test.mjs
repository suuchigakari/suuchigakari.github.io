import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  CHECKER_DEFAULTS,
  renderBodyGap,
  renderChecker,
  renderConflict,
  renderProducts,
} from '../src/lcc-render.js';

const airlines = JSON.parse(readFileSync(new URL('../data/airlines.json', import.meta.url))).airlines;
const config = { associateTag: 'example-22', marketplace: 'amazon.co.jp' };

test('判定ツールの初期表示は 50×36×23cm で9社中7社', () => {
  const { summary, table } = renderChecker(airlines, CHECKER_DEFAULTS);
  assert.match(summary, /9社中 7社/);
  assert.equal((table.match(/<tr>/g) ?? []).length, airlines.length + 1);
});

test('両立しない理由はピーチとジェットスターの3辺すべて', () => {
  const html = renderConflict(airlines);
  assert.equal((html.match(/<li>/g) ?? []).length, 3);
  assert.match(html, /50 × 36 × 23 cm 以内/);
});

test('未確認の商品は表に出さず、ASIN があればアフィリエイトリンクになる', () => {
  const data = {
    asOf: '2026-09-06',
    products: [
      { name: '確認済み', asin: 'B0TEST0001', heightCm: 50, widthCm: 35, depthCm: 20, weightKg: 2.3, dimensionsVerified: true, dimensionSource: '公式' },
      { name: '未確認', asin: '', heightCm: null, dimensionsVerified: false },
    ],
  };
  const { status, table, notes } = renderProducts(data, airlines, config);
  assert.match(status, /1 台を掲載/);
  assert.match(table, /dp\/B0TEST0001\?tag=example-22/);
  assert.match(table, /rel="nofollow sponsored noopener"/);
  assert.doesNotMatch(table, /未確認/);
  assert.match(notes, /次の 1 件は掲載していません/);
});

test('商品名はエスケープされる', () => {
  const data = { asOf: 'x', products: [{ name: '<b>x</b>', heightCm: 50, widthCm: 35, depthCm: 20, dimensionsVerified: true }] };
  const { table } = renderProducts(data, airlines, config);
  assert.doesNotMatch(table, /<b>x<\/b>/);
});

test('本体サイズとの差が最も大きい実例を選ぶ', () => {
  const text = renderBodyGap([
    { name: 'A', bodySizeCm: '46×33×19', heightCm: 55, widthCm: 33, depthCm: 24 },
    { name: 'B', bodySizeCm: '42×33×20', heightCm: 50, widthCm: 35, depthCm: 20 },
  ]);
  assert.match(text, /^実例：A/);
  assert.match(text, /9cm 増えます/);
});
