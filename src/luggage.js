/**
 * 機内持ち込みキャリーケースの適合判定。
 *
 * 空港の測定ゲージは向きを問わず「入るかどうか」で判定されるため、
 * 商品の外寸と各社の各辺上限をどちらも降順に並べてから突き合わせる。
 * 軸を固定した判定結果が必要な場合は戻り値の `axisAligned` を見る。
 */

/** 手荷物2個合計の規定で、キャリーケース以外に見込む重量の既定値(kg)。 */
export const DEFAULT_PERSONAL_ITEM_KG = 1.0;

const VERDICT = { OK: 'ok', NG: 'ng', UNKNOWN: 'unknown' };
export { VERDICT };

function sortedDesc(values) {
  return [...values].sort((a, b) => b - a);
}

/** 有効な3辺の寸法（cm）を取り出す。欠けている場合は null。 */
export function dimensionsOf(item) {
  const sides = [item?.heightCm, item?.widthCm, item?.depthCm];
  if (sides.some((value) => typeof value !== 'number' || !Number.isFinite(value) || value <= 0)) {
    return null;
  }
  return sides;
}

/** 3辺合計(cm)。寸法が不明なら null。 */
export function totalCm(item) {
  const sides = dimensionsOf(item);
  return sides ? Number(sides.reduce((sum, value) => sum + value, 0).toFixed(1)) : null;
}

/**
 * 外寸が各辺の上限に収まるか。向きの入れ替えを許して判定する。
 * @returns {{ ok: boolean, margins: number[] }} margins は上限 - 実寸（降順並び）
 */
export function fitsSides(sides, maxSidesCm) {
  const item = sortedDesc(sides);
  const limit = sortedDesc(maxSidesCm);
  const margins = limit.map((max, index) => Number((max - item[index]).toFixed(1)));
  return { ok: margins.every((margin) => margin >= 0), margins };
}

/** 軸を固定した（高さ・幅・奥行をそのまま突き合わせた）判定。 */
function fitsAxisAligned(sides, maxSidesCm) {
  return sides.every((value, index) => value <= maxSidesCm[index]);
}

/**
 * キャリーケース1台を1社の規定で判定する。
 *
 * @param {object} item 商品（heightCm/widthCm/depthCm/weightKg/dimensionsVerified）
 * @param {object} airline data/airlines.json の1社分
 * @param {{ personalItemKg?: number }} [options]
 * @returns {{
 *   verdict: 'ok'|'ng'|'unknown',
 *   reasons: string[],
 *   margins: number[]|null,
 *   tightestMarginCm: number|null,
 *   axisAligned: boolean|null,
 *   usableWeightKg: number|null
 * }}
 */
export function evaluateAirline(item, airline, options = {}) {
  const personalItemKg = options.personalItemKg ?? DEFAULT_PERSONAL_ITEM_KG;
  const sides = dimensionsOf(item);
  const reasons = [];

  if (!sides) {
    return {
      verdict: VERDICT.UNKNOWN,
      reasons: ['外寸(キャスター・ハンドルを含む)が不明'],
      margins: null,
      tightestMarginCm: null,
      axisAligned: null,
      usableWeightKg: null,
    };
  }
  if (item.dimensionsVerified === false) {
    return {
      verdict: VERDICT.UNKNOWN,
      reasons: ['外寸が一次情報で未確認'],
      margins: null,
      tightestMarginCm: null,
      axisAligned: null,
      usableWeightKg: null,
    };
  }

  const { ok: sidesOk, margins } = fitsSides(sides, airline.maxSidesCm);
  if (!sidesOk) {
    const limit = sortedDesc(airline.maxSidesCm).join('×');
    reasons.push(`各辺の上限(${limit}cm)を超える`);
  }

  const total = totalCm(item);
  if (typeof airline.maxTotalCm === 'number' && total > airline.maxTotalCm) {
    reasons.push(`3辺合計 ${total}cm が上限 ${airline.maxTotalCm}cm を超える`);
  }

  let usableWeightKg = null;
  if (typeof item.weightKg === 'number' && typeof airline.weightLimitKg === 'number') {
    const reserved = airline.weightScope === 'combined2' ? personalItemKg : 0;
    usableWeightKg = Number((airline.weightLimitKg - item.weightKg - reserved).toFixed(1));
    if (usableWeightKg < 0) {
      reasons.push(`本体${item.weightKg}kgで重量上限${airline.weightLimitKg}kgを使い切る`);
    }
  }

  return {
    verdict: reasons.length === 0 ? VERDICT.OK : VERDICT.NG,
    reasons,
    margins,
    tightestMarginCm: Math.min(...margins),
    axisAligned: fitsAxisAligned(sides, airline.maxSidesCm),
    usableWeightKg,
  };
}

/**
 * 全社ぶんまとめて判定する。
 * @returns {Record<string, ReturnType<typeof evaluateAirline>>} 航空会社 id をキーにした結果
 */
export function evaluateAll(item, airlines, options = {}) {
  return Object.fromEntries(
    airlines.map((airline) => [airline.id, evaluateAirline(item, airline, options)]),
  );
}

/**
 * 指定した航空会社すべてに持ち込める「最も厳しい寸法」を求める。
 * 各辺を降順に並べたうえで、位置ごとの最小値を取る。
 *
 * @returns {{ sidesCm: number[], maxTotalCm: number|null, weightLimitKg: number|null }}
 */
export function strictestBox(airlines) {
  if (airlines.length === 0) {
    throw new Error('航空会社を1社以上指定してください。');
  }
  const sidesCm = sortedDesc(airlines[0].maxSidesCm).map((_, index) =>
    Math.min(...airlines.map((airline) => sortedDesc(airline.maxSidesCm)[index])),
  );
  const totals = airlines
    .map((airline) => airline.maxTotalCm)
    .filter((value) => typeof value === 'number');
  const weights = airlines
    .map((airline) => airline.weightLimitKg)
    .filter((value) => typeof value === 'number');

  return {
    sidesCm,
    maxTotalCm: totals.length > 0 ? Math.min(...totals) : null,
    weightLimitKg: weights.length > 0 ? Math.min(...weights) : null,
  };
}

/**
 * 2社の規定が1台で両立するかを調べる。
 * 両立しない場合は、どちらの上限がぶつかっているかを返す。
 */
export function conflictBetween(a, b) {
  const box = strictestBox([a, b]);
  const conflicts = [];
  for (const [first, second] of [
    [a, b],
    [b, a],
  ]) {
    const firstSides = sortedDesc(first.maxSidesCm);
    const secondSides = sortedDesc(second.maxSidesCm);
    firstSides.forEach((value, index) => {
      if (value > secondSides[index]) {
        conflicts.push(
          `${first.name}の${value}cmは${second.name}の${secondSides[index]}cm制限を超える`,
        );
      }
    });
  }
  return { compatible: conflicts.length === 0, conflicts, box };
}
