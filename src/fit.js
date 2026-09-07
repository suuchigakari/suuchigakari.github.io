/**
 * 「読者の条件」と「製品の仕様」を突き合わせる汎用の判定。
 *
 * 記事ごとに判定の中身を書かずに済むよう、仕様側は次の形で持つ。
 *   - レンジ:   [最小, 最大]（例: 取り付け可能幅 67〜91cm）
 *   - 拡張レンジ: { base: [67, 91], expanded: [91, 187], partsNote: "ワイドパネル使用時" }
 *   - フラグ:   true / false / null（null は「公式に明記なし」）
 */

export const FIT = {
  OK: 'ok',
  OK_WITH_PARTS: 'ok-with-parts',
  NG: 'ng',
  UNKNOWN: 'unknown',
};

function isRange(value) {
  return Array.isArray(value) && value.length === 2 && value.every((n) => typeof n === 'number');
}

/** 値がレンジに収まるか。 */
export function inRange(value, range) {
  return isRange(range) && value >= range[0] && value <= range[1];
}

/**
 * 拡張パーツを考慮したレンジ判定。
 * @param {number} value 読者の条件（例: 実測した開口幅）
 * @param {number[]|{base:number[], expanded?:number[], partsNote?:string}} spec
 * @returns {{ status: string, detail: string }}
 */
export function evaluateRange(value, spec) {
  if (spec == null) {
    return { status: FIT.UNKNOWN, detail: '公式に明記なし' };
  }
  if (isRange(spec)) {
    return inRange(value, spec)
      ? { status: FIT.OK, detail: `${spec[0]}〜${spec[1]}cm に収まる` }
      : { status: FIT.NG, detail: `対応幅は ${spec[0]}〜${spec[1]}cm` };
  }
  if (inRange(value, spec.base)) {
    return { status: FIT.OK, detail: `本体のみで対応（${spec.base[0]}〜${spec.base[1]}cm）` };
  }
  if (spec.expanded && inRange(value, spec.expanded)) {
    return {
      status: FIT.OK_WITH_PARTS,
      detail: spec.partsNote
        ? `${spec.partsNote}で対応（〜${spec.expanded[1]}cm）`
        : `拡張パーツで対応（〜${spec.expanded[1]}cm）`,
    };
  }
  const max = spec.expanded ? spec.expanded[1] : spec.base[1];
  return { status: FIT.NG, detail: `対応幅は最大 ${max}cm` };
}

/**
 * 「この値以上あること」を求める判定（例: 必要な容量 25L 以上）。
 */
export function evaluateAtLeast(value, spec, unit = '') {
  if (typeof spec !== 'number') {
    return { status: FIT.UNKNOWN, detail: '公式に明記なし' };
  }
  return spec >= value
    ? { status: FIT.OK, detail: `${spec}${unit}` }
    : { status: FIT.NG, detail: `${spec}${unit}（${value}${unit} に届かない）` };
}

/**
 * 「この値以下であること」を求める判定（例: 想定する最低気温 5℃ 以下で快適に使える）。
 */
export function evaluateAtMost(value, spec, unit = '') {
  if (typeof spec !== 'number') {
    return { status: FIT.UNKNOWN, detail: '公式に明記なし' };
  }
  return spec <= value
    ? { status: FIT.OK, detail: `${spec}${unit}` }
    : { status: FIT.NG, detail: `${spec}${unit}（${value}${unit} には足りない）` };
}

/**
 * 真偽値の仕様。null は「公式に明記なし」として unknown を返す。
 * 安全に関わる項目（階段上に設置できるか等）は、明記がないものを ok にしない。
 */
export function evaluateFlag(spec, { required = true } = {}) {
  if (spec === null || spec === undefined) {
    return { status: FIT.UNKNOWN, detail: '公式に明記なし' };
  }
  if (!required) {
    return { status: FIT.OK, detail: spec ? '対応' : '非対応' };
  }
  return spec
    ? { status: FIT.OK, detail: '公式に対応と明記' }
    : { status: FIT.NG, detail: '公式に非対応と明記' };
}

/**
 * 1商品を、記事が定義する要件すべてで判定する。
 * @param {object} product products[] の1件（specs を持つ）
 * @param {Array<{key:string,type:'range'|'flag',value?:number,required?:boolean,label:string}>} requirements
 */
export function evaluateProduct(product, requirements) {
  const results = requirements.map((requirement) => {
    const spec = product.specs?.[requirement.key];
    let result;
    if (requirement.type === 'range') {
      result = evaluateRange(requirement.value, spec);
    } else if (requirement.type === 'atLeast') {
      result = evaluateAtLeast(requirement.value, spec, requirement.unit ?? '');
    } else if (requirement.type === 'atMost') {
      result = evaluateAtMost(requirement.value, spec, requirement.unit ?? '');
    } else {
      result = evaluateFlag(spec, { required: requirement.required });
    }
    return { ...requirement, ...result };
  });

  const status = results.some((result) => result.status === FIT.NG)
    ? FIT.NG
    : results.some((result) => result.status === FIT.UNKNOWN)
      ? FIT.UNKNOWN
      : results.some((result) => result.status === FIT.OK_WITH_PARTS)
        ? FIT.OK_WITH_PARTS
        : FIT.OK;

  return { status, results };
}

/** 掲載してよい商品（仕様を一次情報で確認済み）だけに絞る。 */
export function verifiedProducts(products) {
  return products.filter((product) => product.verified === true);
}

/** レンジ・フラグを表のセル用の文字列にする。 */
export function formatSpec(spec, unit = '') {
  if (spec === null || spec === undefined) return '公式に明記なし';
  if (typeof spec === 'boolean') return spec ? '○' : '×';
  if (typeof spec === 'number') return `${spec}${unit}`;
  if (isRange(spec)) return `${spec[0]}〜${spec[1]}${unit}`;
  // 3辺の寸法は「幅 × 奥行 × 高さ」として表示する
  if (Array.isArray(spec) && spec.length === 3 && spec.every((n) => typeof n === 'number')) {
    return `${spec.join(' × ')}${unit}`;
  }
  if (typeof spec === 'object' && isRange(spec.base)) {
    const base = `${spec.base[0]}〜${spec.base[1]}${unit}`;
    return spec.expanded ? `${base}（拡張時 〜${spec.expanded[1]}${unit}）` : base;
  }
  return String(spec);
}

/** 外寸（cm の3辺）から体積(L)を出す。 */
export function outerVolumeL(sidesCm) {
  if (!Array.isArray(sidesCm) || sidesCm.length !== 3) return null;
  return Number((sidesCm.reduce((product, side) => product * side, 1) / 1000).toFixed(1));
}

/**
 * 「外寸体積 ÷ 内容量」。断熱材の厚みぶんだけ大きくなるので、
 * 同じ容量なら数値が大きいほど嵩張る（＝壁が厚い）。
 */
export function bulkRatio(sidesCm, capacityL) {
  const outer = outerVolumeL(sidesCm);
  if (outer === null || typeof capacityL !== 'number' || capacityL <= 0) return null;
  return Number((outer / capacityL).toFixed(2));
}
