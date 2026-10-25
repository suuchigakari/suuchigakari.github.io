/**
 * 記事の「数字で見る」棒グラフのデータ。描画は静的 HTML（棒の幅を % で持つ）。
 *
 * 既定では絞り込みの最初の数値入力（range 以外）と同じ仕様を並べる。
 * 記事 JSON の chart で key・label・unit・order を上書きできる。
 */

/** 記事から棒グラフの設定を決める。作れないときは null。 */
export function chartSpec(article) {
  const inputs = article.filter?.numberInputs ?? (article.filter?.numberInput ? [article.filter.numberInput] : []);
  const input = inputs.find((item) => item.type !== 'range');
  const override = article.chart ?? {};
  if (override === false) return null;
  const key = override.key ?? input?.key;
  if (!key) return null;
  const column = (article.columns ?? []).find((item) => item.key === key);
  return {
    key,
    label: override.label ?? column?.label ?? input?.label?.replace(/\s*\(.*\)\s*$/, '') ?? key,
    unit: override.unit ?? column?.unit ?? input?.unit ?? '',
    order: override.order ?? (input?.type === 'atMost' ? 'asc' : 'desc'),
    note: override.note ?? '',
  };
}

/** 数値を持つ商品だけを並べ、最大値に対する割合を付ける。数値がない商品は件数だけ返す。 */
export function chartRows(products, spec) {
  const withValue = products
    .map((product) => ({ name: product.name, value: product.specs?.[spec.key] }))
    .filter((row) => typeof row.value === 'number' && Number.isFinite(row.value));
  const sorted = withValue.sort((a, b) => (spec.order === 'asc' ? a.value - b.value : b.value - a.value));
  const max = Math.max(...sorted.map((row) => row.value), 0);
  return {
    rows: sorted.map((row) => ({ ...row, percent: max > 0 ? Math.max(2, Math.round((row.value / max) * 100)) : 0 })),
    missing: products.length - withValue.length,
  };
}
