/**
 * 記事冒頭の「数字で選ぶ早見表」。
 *
 * 比較表の数値（メーカー公式の仕様）から、条件ごとに一番の製品を選んで並べる。
 * 「おすすめ」は書かず、「重さが最も軽い」のように数値で決まる事実だけを出す。
 *
 * 項目は記事 JSON の "quickPicks" に書く（書かなければ出さない）。
 *   { "title": "重さが最も軽い", "key": "weightG", "order": "asc", "unit": "g",
 *     "where": { "certified": true, "type": { "excludes": "スタンド" }, "capacityText": { "includes": "10000mAh" } } }
 * where は対象を絞る条件（値の一致・文字列を含む／含まない）。
 */

const MAX_NAMES = 2;

function isNum(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function matches(product, where) {
  if (!where) return true;
  return Object.entries(where).every(([key, cond]) => {
    const value = product.specs?.[key];
    if (cond && typeof cond === 'object') {
      if ('includes' in cond) return typeof value === 'string' && value.includes(cond.includes);
      if ('excludes' in cond) return typeof value !== 'string' || !value.includes(cond.excludes);
      return false;
    }
    return value === cond;
  });
}

function formatValue(value, unit) {
  const text = Number.isInteger(value)
    ? value.toLocaleString('ja-JP')
    : value.toLocaleString('ja-JP', { maximumFractionDigits: 2 });
  return `${text}${unit ?? ''}`;
}

/**
 * 早見表の行。数値を持つ製品が2つ以上ある項目だけを出す。
 * 同じ値の製品が複数あるときは最大2つまで名前を出し、残りは件数で示す。
 * @returns {Array<{ title: string, valueText: string, products: object[], others: number }>}
 */
export function quickPicks(article, products) {
  if (!Array.isArray(article.quickPicks)) return [];
  return article.quickPicks
    .map((spec) => {
      const pool = products.filter((product) => matches(product, spec.where) && isNum(product.specs?.[spec.key]));
      if (pool.length < 2) return null;
      const values = pool.map((product) => product.specs[spec.key]);
      const best = spec.order === 'asc' ? Math.min(...values) : Math.max(...values);
      const top = pool.filter((product) => product.specs[spec.key] === best);
      return {
        title: spec.title,
        valueText: formatValue(best, spec.unit),
        products: top.slice(0, MAX_NAMES),
        others: Math.max(0, top.length - MAX_NAMES),
      };
    })
    .filter(Boolean)
    // 絞り込みの有無だけが違って同じ製品・同じ値になった項目は、先のものだけ残す
    .filter((pick, index, all) => !all.slice(0, index).some((prev) =>
      prev.valueText === pick.valueText &&
      prev.products.map((p) => p.name).join('|') === pick.products.map((p) => p.name).join('|')));
}
