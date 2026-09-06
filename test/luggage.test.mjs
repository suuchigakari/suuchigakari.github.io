import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  conflictBetween,
  evaluateAirline,
  evaluateAll,
  fitsSides,
  strictestBox,
  totalCm,
} from '../src/luggage.js';

const dataset = JSON.parse(readFileSync(new URL('../data/airlines.json', import.meta.url)));
const byId = Object.fromEntries(dataset.airlines.map((airline) => [airline.id, airline]));
const peach = byId.peach;
const jetstar = byId.jetstar;

/** 一般的な国内線向けサイズ（JAL/ANA基準）。 */
const standard = { heightCm: 55, widthCm: 40, depthCm: 25, weightKg: 3.2, dimensionsVerified: true };
/** 両社を両立できる厳しめサイズ。 */
const strict = { heightCm: 50, widthCm: 36, depthCm: 23, weightKg: 2.4, dimensionsVerified: true };

test('3辺合計を計算する', () => {
  assert.equal(totalCm(standard), 120);
  assert.equal(totalCm({ heightCm: 50 }), null);
});

test('向きを入れ替えれば入る場合は収まると判定する', () => {
  assert.equal(fitsSides([40, 50, 25], [50, 40, 25]).ok, true);
  assert.deepEqual(fitsSides([48, 38, 22], [50, 40, 25]).margins, [2, 2, 3]);
  assert.equal(fitsSides([52, 38, 22], [50, 40, 25]).ok, false);
});

test('一般的な55×40×25cmはピーチもジェットスターも通らない', () => {
  const peachResult = evaluateAirline(standard, peach);
  assert.equal(peachResult.verdict, 'ng');
  assert.match(peachResult.reasons.join(), /各辺の上限/);

  const jetstarResult = evaluateAirline(standard, jetstar);
  assert.equal(jetstarResult.verdict, 'ng');
});

test('ANA・JALは各辺を満たしても3辺合計で落ちる組み合わせがある', () => {
  // 55×40×25cm は各辺の上限ぴったりだが、合計120cmで115cm規定を超える。
  const result = evaluateAirline(standard, byId.ana_jal);
  assert.equal(result.verdict, 'ng');
  assert.match(result.reasons.join(), /3辺合計/);

  // 合計115cmに収めれば通る。
  const fits = { heightCm: 55, widthCm: 40, depthCm: 20, weightKg: 3.2, dimensionsVerified: true };
  assert.equal(evaluateAirline(fits, byId.ana_jal).verdict, 'ok');
});

test('50×36×23cmなら主要LCC2社を両立する', () => {
  assert.equal(evaluateAirline(strict, peach).verdict, 'ok');
  assert.equal(evaluateAirline(strict, jetstar).verdict, 'ok');
});

test('3辺合計の上限だけで落ちるケースを検出する', () => {
  // 各辺はZIPAIRの55×40×25以内だが、合計121cmで120cmを超える。
  const item = { heightCm: 55, widthCm: 40, depthCm: 26, weightKg: 3, dimensionsVerified: true };
  const result = evaluateAirline(item, byId.zipair);
  assert.equal(result.verdict, 'ng');
  assert.match(result.reasons.join(), /3辺合計/);
});

test('7kgは2個合計なので、本体重量から持ち込める中身が決まる', () => {
  const heavy = { ...strict, weightKg: 3.5 };
  const result = evaluateAirline(heavy, jetstar, { personalItemKg: 1.0 });
  assert.equal(result.usableWeightKg, 2.5);
  assert.equal(result.verdict, 'ok');

  const tooHeavy = { ...strict, weightKg: 6.5 };
  const overweight = evaluateAirline(tooHeavy, jetstar, { personalItemKg: 1.0 });
  assert.equal(overweight.verdict, 'ng');
  assert.match(overweight.reasons.join(), /重量上限/);
});

test('外寸が未確認・未記載の商品は ng ではなく unknown にする', () => {
  assert.equal(evaluateAirline({ ...strict, dimensionsVerified: false }, peach).verdict, 'unknown');
  assert.equal(evaluateAirline({ weightKg: 2 }, peach).verdict, 'unknown');
});

test('軸を固定した判定は別フラグで持つ', () => {
  const rotated = { heightCm: 36, widthCm: 50, depthCm: 23, weightKg: 2.4, dimensionsVerified: true };
  const result = evaluateAirline(rotated, jetstar);
  assert.equal(result.verdict, 'ok');
  assert.equal(result.axisAligned, false);
});

test('全社まとめて判定できる', () => {
  const results = evaluateAll(strict, dataset.airlines);
  assert.equal(Object.keys(results).length, dataset.airlines.length);
  // 奥行20cm規定の韓国系2社は23cmのケースを通さない。
  assert.equal(results.jejuair.verdict, 'ng');
  assert.equal(results.tway.verdict, 'ng');
});

test('ピーチとジェットスターは1台で両立しないことを検出する', () => {
  const { compatible, conflicts, box } = conflictBetween(peach, jetstar);
  assert.equal(compatible, false);
  // 高さ(56>50)・幅(40>36)・奥行(25>23)の3辺すべてでぶつかる。
  assert.equal(conflicts.length, 3);
  assert.match(conflicts.join(), /56cm/);
  assert.match(conflicts.join(), /40cm/);
  assert.match(conflicts.join(), /25cm/);
  assert.deepEqual(box.sidesCm, [50, 36, 23]);
});

test('主要LCC全社の共通サイズを求められる', () => {
  const lcc = dataset.airlines.filter((airline) => airline.group === 'LCC');
  const box = strictestBox(lcc);
  assert.deepEqual(box.sidesCm, [50, 36, 20]);
  assert.equal(box.weightLimitKg, 7);
  assert.equal(box.maxTotalCm, 115);
});
