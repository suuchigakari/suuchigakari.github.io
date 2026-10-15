/**
 * LCCキャリーケース記事の HTML 断片を組み立てる。
 *
 * ビルド時（Node）に静的HTMLとして書き出し、ブラウザでは判定ツールの
 * 再計算にだけ同じ関数を使う。描画ロジックを1か所にまとめるため、DOM は使わない。
 */
import { buildAffiliateUrl, escapeHtml as e } from './affiliate.js';
import {
  DEFAULT_PERSONAL_ITEM_KG,
  conflictBetween,
  evaluateAll,
  strictestBox,
  totalCm,
} from './luggage.js';

const SYMBOL = { ok: '○', ng: '×', unknown: '?' };
/** 比較表に並べる航空会社（全社だと横に長すぎるため代表を選ぶ）。 */
const PRODUCT_TABLE_AIRLINES = ['peach', 'jetstar', 'zipair', 'ana_jal'];

const byId = (airlines, id) => airlines.find((airline) => airline.id === id);

function head(labels) {
  return `<thead><tr>${labels.map((label) => `<th scope="col">${e(label)}</th>`).join('')}</tr></thead>`;
}

function verdictCell(result) {
  let extra = '';
  if (result.verdict === 'ng' && result.reasons.length > 0) {
    extra = `<span class="reason">${e(result.reasons[0])}</span>`;
  } else if (result.verdict === 'ok' && typeof result.tightestMarginCm === 'number') {
    const margin =
      result.tightestMarginCm === 0 ? 'ぴったり（余裕なし）' : `余裕 ${result.tightestMarginCm}cm`;
    extra = `<span class="reason">${e(margin)}</span>`;
  }
  return `<td class="${result.verdict}">${SYMBOL[result.verdict]}${extra}</td>`;
}

export function renderConclusion(airlines) {
  const lcc = airlines.filter((airline) => airline.group === 'LCC');
  const peach = byId(airlines, 'peach');
  const jetstar = byId(airlines, 'jetstar');
  const lines = [
    ['ピーチ中心なら', peach.maxSidesCm],
    ['ジェットスター・エアアジア中心なら', jetstar.maxSidesCm],
    ['両社を使う可能性があるなら', strictestBox([peach, jetstar]).sidesCm],
    ['主要LCCすべてに対応させるなら', strictestBox(lcc).sidesCm],
  ];
  const weight = strictestBox(lcc).weightLimitKg;
  return `<div class="verdict-box">
          ${lines
            .map(([label, sides]) => `<p>${e(label)}：<span class="size">${sides.join(' × ')} cm 以内</span></p>`)
            .join('\n          ')}
          <p>本体重量は2kg台が目安（重量上限 ${weight}kg は身の回り品との2個合計）。</p>
        </div>`;
}

export function renderConflict(airlines) {
  const { compatible, conflicts, box } = conflictBetween(byId(airlines, 'peach'), byId(airlines, 'jetstar'));
  const intro = compatible
    ? '現在の規定では、両社の上限は1台で両立できます。'
    : '両社の各辺上限は、次の点でぶつかります。「LCC対応」と書かれた1台で両方をカバーすることは原理的にできません。';
  return `<p>${e(intro)}</p>
        <ul>${conflicts.map((conflict) => `<li>${e(conflict)}</li>`).join('')}</ul>
        <p>両方使うなら、両社の厳しいほうを取った <span class="size">${box.sidesCm.join(' × ')} cm 以内</span> を狙うことになります。市場に多いサイズではないので、どちらを主に使うか決めてから買うほうが現実的です。</p>`;
}

/** 本体サイズ表記と全体サイズの差が最も大きい実例を文章にする。 */
export function renderBodyGap(products) {
  const gaps = products
    .filter((product) => typeof product.bodySizeCm === 'string')
    .map((product) => ({
      product,
      gap: Number((product.heightCm - Number.parseFloat(product.bodySizeCm)).toFixed(1)),
    }))
    .filter(({ gap }) => Number.isFinite(gap) && gap > 0)
    .sort((a, b) => b.gap - a.gap);
  if (gaps.length === 0) return '';
  const { product, gap } = gaps[0];
  return e(
    `実例：${product.name} は本体サイズ ${product.bodySizeCm}cm に対し、キャスターとハンドルを含む全体サイズは ` +
      `${product.heightCm}×${product.widthCm}×${product.depthCm}cm です。高さだけで ${gap}cm 増えます。`,
  );
}

export function renderAirlines(dataset) {
  const rows = dataset.airlines
    .map(
      (airline) => `<tr><th scope="row">${e(airline.name)}</th>` +
        `<td class="num">${airline.maxSidesCm.join(' × ')} cm</td>` +
        `<td class="num">${airline.maxTotalCm ? `${airline.maxTotalCm} cm` : '規定なし（各辺で判定）'}</td>` +
        `<td class="num">${airline.weightLimitKg} kg${airline.weightScope === 'combined2' ? '（2個合計）' : ''}</td>` +
        `<td>${airline.sidesConfidence === 'official' ? '公式に明記' : '公式に明記なし'}</td></tr>`,
    )
    .join('\n          ');
  const notes = dataset.airlines
    .filter((airline) => airline.notes.length > 0)
    .map((airline) => `<h3>${e(airline.name)}</h3><ul>${airline.notes.map((note) => `<li>${e(note)}</li>`).join('')}</ul>`)
    .concat((dataset.upcomingChanges ?? []).map((change) => `<p>【${e(change.effectiveFrom)} 改定予定】${e(change.summary)}</p>`))
    .join('\n        ');
  return {
    asOf: `${e(dataset.disclaimer)}（${e(dataset.asOf)} 時点）`,
    table: `${head(['航空会社', '各辺の上限', '3辺合計', '重量', '各辺規定の根拠'])}<tbody>
          ${rows}
        </tbody>`,
    notes,
  };
}

export function verifiedLuggage(products) {
  return products.filter((product) => product.dimensionsVerified === true && typeof product.heightCm === 'number');
}

export function renderProducts(productData, airlines, config) {
  const products = productData.products ?? [];
  const listed = verifiedLuggage(products);
  const pending = products.filter((product) => !listed.includes(product));
  const shown = PRODUCT_TABLE_AIRLINES.map((id) => byId(airlines, id));
  const peach = byId(airlines, 'peach');
  const jetstar = byId(airlines, 'jetstar');
  const both = listed.filter((product) => {
    const results = evaluateAll(product, [peach, jetstar]);
    return results.peach.verdict === 'ok' && results.jetstar.verdict === 'ok';
  }).length;

  const status = listed.length > 0
    ? `メーカー公式の仕様表で外寸（キャスター・ハンドル込み）を確認できた ${listed.length} 台を掲載しています（${productData.asOf} 確認）。うちピーチとジェットスターの両方に持ち込めるのは ${both} 台です。`
    : '外寸を一次情報で確認できた商品がまだありません。確認できたものだけをここに掲載します。';

  const rows = listed.map((product) => {
    const results = evaluateAll(product, shown);
    const name = product.asin
      ? `<a href="${e(buildAffiliateUrl({ asin: product.asin, tag: config.associateTag, domain: config.marketplace }))}" target="_blank" rel="nofollow sponsored noopener">${e(product.name)}</a>`
      : e(product.name);
    const cells = [
      `<th scope="row">${name}</th>`,
      `<td>${e(product.type ?? '—')}</td>`,
      `<td class="num">${product.heightCm} × ${product.widthCm} × ${product.depthCm}</td>`,
      `<td class="num">${e(product.bodySizeCm ?? '—')}</td>`,
      `<td class="num">${totalCm(product)}</td>`,
      `<td class="num">${typeof product.weightKg === 'number' ? `${product.weightKg} kg` : '—'}</td>`,
      `<td class="num">${typeof product.capacityL === 'number' ? `${product.capacityL} L` : '—'}</td>`,
      ...shown.map((airline) => verdictCell(results[airline.id])),
    ].join('');
    const note = product.note
      ? `<tr><td class="row-note" colspan="${7 + shown.length}">${e(product.note)}</td></tr>`
      : '';
    return `<tr>${cells}</tr>${note}`;
  });

  const table = listed.length === 0 ? '' : `${head([
    '商品', 'タイプ', '外寸 (cm・キャスター込み)', '本体サイズ表記 (cm)', '3辺合計', '本体重量', '容量',
    ...shown.map((airline) => `${airline.name}可`),
  ])}<tbody>
          ${rows.join('\n          ')}
        </tbody>`;

  const sources = listed.filter((product) => product.dimensionSource);
  let notes = '';
  if (sources.length > 0) {
    notes += `<h3>サイズの出典</h3><ul>${sources.map((product) => `<li>${e(product.name)}：${e(product.dimensionSource)}</li>`).join('')}</ul>`;
  }
  if (pending.length > 0) {
    notes += `<p>外寸が未確認のため、次の ${pending.length} 件は掲載していません。</p><ul>${pending
      .map((product) => `<li>${e(product.note ? `${product.name}（${product.note}）` : product.name)}</li>`)
      .join('')}</ul>`;
  }
  return { status, table, notes };
}

/** 判定ツール。入力値（外寸・重量）に対して全社の可否を表にする。 */
export function renderChecker(airlines, input) {
  const item = {
    heightCm: input.heightCm,
    widthCm: input.widthCm,
    depthCm: input.depthCm,
    weightKg: input.weightKg,
    dimensionsVerified: true,
  };
  const personalItemKg = input.personalItemKg ?? DEFAULT_PERSONAL_ITEM_KG;
  const results = evaluateAll(item, airlines, { personalItemKg });
  const total = totalCm(item);
  const passing = airlines.filter((airline) => results[airline.id].verdict === 'ok').length;
  const summary = total
    ? `3辺合計 ${total}cm ／ ${airlines.length}社中 ${passing}社で持ち込み可`
    : '外寸を入力してください。';
  const rows = airlines.map((airline) => {
    const result = results[airline.id];
    return `<tr><th scope="row">${e(airline.name)}</th>${verdictCell(result)}` +
      `<td class="num">${result.margins ? result.margins.join(' / ') : '—'}</td>` +
      `<td class="num">${typeof result.usableWeightKg === 'number' ? `${result.usableWeightKg} kg` : '—'}</td></tr>`;
  });
  return {
    summary: e(summary),
    table: `${head(['航空会社', '判定', '各辺の余裕 (cm・長辺から順)', '中身に使える重量'])}<tbody>${rows.join('')}</tbody>`,
  };
}

/** 判定ツールの初期値（HTMLのフォームの value と一致させる）。 */
export const CHECKER_DEFAULTS = { heightCm: 50, widthCm: 36, depthCm: 23, weightKg: 2.4, personalItemKg: 1.0 };
