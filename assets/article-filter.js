/**
 * 生成された比較表の絞り込み。
 * 表そのものは静的HTMLとして出力済みで、この読み込みは付加機能。
 */
import { FIT, evaluateProduct } from '../src/fit.js';

const STATUS_LABEL = {
  [FIT.OK]: '○',
  [FIT.OK_WITH_PARTS]: '△',
  [FIT.NG]: '×',
  [FIT.UNKNOWN]: '?',
};

const dataNode = document.getElementById('article-data');
const form = document.getElementById('filter');
if (dataNode && form) {
  const { filter, products } = JSON.parse(dataNode.textContent);
  const numberInputs = filter.numberInputs ?? (filter.numberInput ? [filter.numberInput] : []);
  const numberFields = numberInputs.map((_, index) =>
    document.getElementById(`filter-number-${index}`),
  );
  const flagInput = document.getElementById('filter-flag');
  const summary = document.getElementById('filter-summary');
  const rows = new Map(
    [...document.querySelectorAll('#products-table tbody tr[data-product]')].map((row) => [
      row.dataset.product,
      row,
    ]),
  );

  const render = () => {
    const requirements = numberInputs.map((input, index) => ({
      key: input.key,
      type: input.type,
      value: Number(numberFields[index].value),
      unit: input.unit ?? '',
      label: input.label,
    }));
    if (flagInput.checked) {
      requirements.push({
        key: filter.flagInput.key,
        type: 'flag',
        required: true,
        label: filter.flagInput.label,
      });
    }

    let usable = 0;
    for (const product of products) {
      const { status, results } = evaluateProduct(product, requirements);
      if (status === FIT.OK || status === FIT.OK_WITH_PARTS) usable += 1;

      const row = rows.get(product.name);
      if (!row) continue;
      const cell = row.querySelector('.verdict');
      cell.className = `verdict ${status}`;
      cell.textContent = STATUS_LABEL[status];
      const reason = document.createElement('span');
      reason.className = 'reason';
      // 通らない理由を優先して見せる。すべて通っていれば幅の判定を出す。
      const failed = results.find((result) => result.status !== FIT.OK);
      reason.textContent = (failed ?? results[0])?.detail ?? '';
      cell.append(reason);
    }

    const condition = requirements
      .map((requirement) => `${requirement.label.replace(/\s*\(.*\)/, '')} ${requirement.value}${requirement.unit}`)
      .join('・');
    summary.textContent = flagInput.checked
      ? `${condition}・${filter.flagInput.label}：${products.length} 件中 ${usable} 件が候補`
      : `${condition}：${products.length} 件中 ${usable} 件が候補`;
  };

  form.addEventListener('input', render);
  form.addEventListener('submit', (event) => event.preventDefault());
  render();
}
