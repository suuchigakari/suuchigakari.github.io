/**
 * LCCキャリーケース記事の判定ツール。
 * 本文・比較表はビルド時に静的HTMLとして出力済みで、ここでは入力に応じた再計算だけを行う。
 */
import { renderChecker } from '../src/lcc-render.js';

const { airlines } = JSON.parse(document.getElementById('lcc-data').textContent);
const form = document.getElementById('checker');
const value = (id) => Number(document.getElementById(id).value);

const update = () => {
  const { summary, table } = renderChecker(airlines, {
    heightCm: value('height'),
    widthCm: value('width'),
    depthCm: value('depth'),
    weightKg: value('weight'),
    personalItemKg: value('personal'),
  });
  document.getElementById('checker-summary').innerHTML = summary;
  document.getElementById('checker-table').innerHTML = table;
};

form.addEventListener('input', update);
form.addEventListener('submit', (event) => event.preventDefault());
