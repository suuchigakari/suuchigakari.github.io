import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FIT,
  bulkRatio,
  evaluateAtLeast,
  evaluateAtMost,
  outerVolumeL,
  evaluateFlag,
  evaluateProduct,
  evaluateRange,
  formatSpec,
  inRange,
  verifiedProducts,
} from '../src/fit.js';

const gate = {
  name: 'テストゲート',
  verified: true,
  specs: {
    openingWidthCm: { base: [67, 91], expanded: [91, 187], partsNote: 'ワイドパネル' },
    stairTop: null,
  },
};

test('単純なレンジ判定', () => {
  assert.equal(inRange(80, [67, 91]), true);
  assert.equal(inRange(95, [67, 91]), false);
  assert.equal(evaluateRange(80, [67, 91]).status, FIT.OK);
  assert.equal(evaluateRange(95, [67, 91]).status, FIT.NG);
  // 単位は呼び出し側が渡す（cm 固定にしない）
  assert.match(evaluateRange(80, [67, 91], 'cm').detail, /67〜91cm/);
  assert.match(evaluateRange(25, [8, 20], 'kg').detail, /対応範囲は 8〜20kg/);
});

test('拡張パーツが必要な範囲は ok-with-parts になる', () => {
  const spec = gate.specs.openingWidthCm;
  assert.equal(evaluateRange(80, spec).status, FIT.OK);
  assert.equal(evaluateRange(120, spec).status, FIT.OK_WITH_PARTS);
  assert.match(evaluateRange(120, spec).detail, /ワイドパネル/);
  assert.equal(evaluateRange(200, spec).status, FIT.NG);
  assert.match(evaluateRange(200, spec, 'cm').detail, /最大 187cm/);
});

test('仕様が無いレンジは unknown', () => {
  assert.equal(evaluateRange(80, undefined).status, FIT.UNKNOWN);
});

test('安全に関わるフラグは、明記がなければ ok にしない', () => {
  assert.equal(evaluateFlag(null).status, FIT.UNKNOWN);
  assert.equal(evaluateFlag(true).status, FIT.OK);
  assert.equal(evaluateFlag(false).status, FIT.NG);
  // 必須でない条件なら、false でも「非対応」として ok を返す（絞り込みに使わない）
  assert.equal(evaluateFlag(false, { required: false }).status, FIT.OK);
});

test('商品全体の判定は、最も厳しい結果を採用する', () => {
  const requirements = [
    { key: 'openingWidthCm', type: 'range', value: 80, unit: 'cm', label: '開口幅' },
    { key: 'stairTop', type: 'flag', required: true, label: '階段上' },
  ];
  const result = evaluateProduct(gate, requirements);
  assert.equal(result.status, FIT.UNKNOWN);
  assert.equal(result.results[0].status, FIT.OK);

  const stairOk = { ...gate, specs: { ...gate.specs, stairTop: true } };
  assert.equal(evaluateProduct(stairOk, requirements).status, FIT.OK);

  const tooWide = { ...gate, specs: { ...gate.specs, stairTop: true } };
  const wideResult = evaluateProduct(tooWide, [
    { key: 'openingWidthCm', type: 'range', value: 200, label: '開口幅' },
  ]);
  assert.equal(wideResult.status, FIT.NG);

  const needsParts = evaluateProduct(stairOk, [
    { key: 'openingWidthCm', type: 'range', value: 120, label: '開口幅' },
  ]);
  assert.equal(needsParts.status, FIT.OK_WITH_PARTS);
});

test('未確認の商品は掲載対象から外れる', () => {
  const products = [gate, { name: '未確認', verified: false }, { name: '未指定' }];
  assert.deepEqual(
    verifiedProducts(products).map((product) => product.name),
    ['テストゲート'],
  );
});

test('仕様の表示形式', () => {
  assert.equal(formatSpec([67, 91], 'cm'), '67〜91cm');
  assert.equal(formatSpec(gate.specs.openingWidthCm, 'cm'), '67〜91cm（拡張時 〜187cm）');
  assert.equal(formatSpec(null), '公式に明記なし');
  assert.equal(formatSpec(true), '○');
  assert.equal(formatSpec(4.5, 'kg'), '4.5kg');
  assert.equal(formatSpec('つっぱり式'), 'つっぱり式');
  assert.equal(formatSpec([46, 36, 31.5]), '46 × 36 × 31.5');
});

test('「この値以上」の判定', () => {
  assert.equal(evaluateAtLeast(25, 28, 'L').status, FIT.OK);
  assert.equal(evaluateAtLeast(25, 21, 'L').status, FIT.NG);
  assert.match(evaluateAtLeast(25, 21, 'L').detail, /25L に届かない/);
  assert.equal(evaluateAtLeast(25, null).status, FIT.UNKNOWN);
});

test('外寸体積と嵩張り率', () => {
  assert.equal(outerVolumeL([55, 34, 40]), 74.8);
  assert.equal(outerVolumeL([46]), null);
  // 同じ25Lでも、壁が厚いほど嵩張り率が大きくなる
  assert.equal(bulkRatio([55, 34, 40], 25), 2.99);
  assert.equal(bulkRatio([44.5, 30, 36.5], 25), 1.95);
  assert.equal(bulkRatio([55, 34, 40], 0), null);
});

test('atLeast も商品判定に使える', () => {
  const cooler = { verified: true, specs: { capacityL: 26 } };
  const requirements = [{ key: 'capacityL', type: 'atLeast', value: 25, unit: 'L', label: '容量' }];
  assert.equal(evaluateProduct(cooler, requirements).status, FIT.OK);
  assert.equal(
    evaluateProduct({ verified: true, specs: { capacityL: 14 } }, requirements).status,
    FIT.NG,
  );
});

test('「この値以下」の判定（温度など、小さいほど強い仕様）', () => {
  assert.equal(evaluateAtMost(5, 3, '℃').status, FIT.OK);
  assert.equal(evaluateAtMost(5, 7, '℃').status, FIT.NG);
  assert.match(evaluateAtMost(5, 7, '℃').detail, /5℃ には足りない/);
  assert.equal(evaluateAtMost(5, null).status, FIT.UNKNOWN);
  assert.equal(
    evaluateProduct({ specs: { comfortC: 7 } }, [
      { key: 'comfortC', type: 'atMost', value: 5, unit: '℃', label: '快適温度' },
    ]).status,
    FIT.NG,
  );
});
