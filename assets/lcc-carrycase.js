import { buildAffiliateUrl } from '../src/affiliate.js';
import {
  DEFAULT_PERSONAL_ITEM_KG,
  conflictBetween,
  evaluateAll,
  strictestBox,
  totalCm,
} from '../src/luggage.js';

const el = (id) => document.getElementById(id);

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`${path} (HTTP ${response.status})`);
  return response.json();
}

function textCell(value, className) {
  const td = document.createElement('td');
  if (className) td.className = className;
  td.textContent = value;
  return td;
}

function headerRow(labels) {
  const tr = document.createElement('tr');
  for (const label of labels) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = label;
    tr.append(th);
  }
  const thead = document.createElement('thead');
  thead.append(tr);
  return thead;
}

/** 判定結果を ○ / × / ? のセルにする。× のときは理由も添える。 */
function verdictCell(result) {
  const symbols = { ok: '○', ng: '×', unknown: '?' };
  const td = document.createElement('td');
  td.className = result.verdict;
  td.append(document.createTextNode(symbols[result.verdict]));
  if (result.verdict === 'ng' && result.reasons.length > 0) {
    const reason = document.createElement('span');
    reason.className = 'reason';
    reason.textContent = result.reasons[0];
    td.append(reason);
  }
  if (result.verdict === 'ok' && typeof result.tightestMarginCm === 'number') {
    const margin = document.createElement('span');
    margin.className = 'reason';
    margin.textContent =
      result.tightestMarginCm === 0 ? 'ぴったり（余裕なし）' : `余裕 ${result.tightestMarginCm}cm`;
    td.append(margin);
  }
  return td;
}

function renderConclusion(airlines) {
  const lcc = airlines.filter((airline) => airline.group === 'LCC');
  const peach = airlines.find((airline) => airline.id === 'peach');
  const jetstar = airlines.find((airline) => airline.id === 'jetstar');
  const both = strictestBox([peach, jetstar]);
  const all = strictestBox(lcc);

  const box = el('conclusion');
  const lines = [
    [`ピーチ中心なら`, peach.maxSidesCm],
    [`ジェットスター・エアアジア中心なら`, jetstar.maxSidesCm],
    [`両社を使う可能性があるなら`, both.sidesCm],
    [`主要LCCすべてに対応させるなら`, all.sidesCm],
  ];

  const wrapper = document.createElement('div');
  wrapper.className = 'verdict-box';
  for (const [label, sides] of lines) {
    const p = document.createElement('p');
    p.append(document.createTextNode(`${label}：`));
    const strong = document.createElement('span');
    strong.className = 'size';
    strong.textContent = `${sides.join(' × ')} cm 以内`;
    p.append(strong);
    wrapper.append(p);
  }
  const weight = document.createElement('p');
  weight.textContent = `本体重量は2kg台が目安（重量上限 ${all.weightLimitKg}kg は身の回り品との2個合計）。`;
  wrapper.append(weight);
  box.replaceChildren(wrapper);
}

function renderConflict(airlines) {
  const peach = airlines.find((airline) => airline.id === 'peach');
  const jetstar = airlines.find((airline) => airline.id === 'jetstar');
  const { compatible, conflicts, box } = conflictBetween(peach, jetstar);
  const container = el('conflict');

  const intro = document.createElement('p');
  intro.textContent = compatible
    ? '現在の規定では、両社の上限は1台で両立できます。'
    : '両社の各辺上限は、次の点でぶつかります。「LCC対応」と書かれた1台で両方をカバーすることは原理的にできません。';

  const list = document.createElement('ul');
  for (const conflict of conflicts) {
    const li = document.createElement('li');
    li.textContent = conflict;
    list.append(li);
  }

  const answer = document.createElement('p');
  answer.append(document.createTextNode('両方使うなら、両社の厳しいほうを取った '));
  const size = document.createElement('span');
  size.className = 'size';
  size.textContent = `${box.sidesCm.join(' × ')} cm 以内`;
  answer.append(size, document.createTextNode(' を狙うことになります。市場に多いサイズではないので、どちらを主に使うか決めてから買うほうが現実的です。'));

  container.replaceChildren(intro, list, answer);
}

function renderAirlineTable(dataset) {
  el('airlines-asof').textContent = `${dataset.disclaimer}（${dataset.asOf} 時点）`;

  const table = el('airlines-table');
  const tbody = document.createElement('tbody');
  for (const airline of dataset.airlines) {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = airline.name;
    tr.append(
      th,
      textCell(`${airline.maxSidesCm.join(' × ')} cm`, 'num'),
      textCell(airline.maxTotalCm ? `${airline.maxTotalCm} cm` : '規定なし（各辺で判定）', 'num'),
      textCell(
        `${airline.weightLimitKg} kg${airline.weightScope === 'combined2' ? '（2個合計）' : ''}`,
        'num',
      ),
      textCell(airline.sidesConfidence === 'official' ? '公式に明記' : '公式に明記なし'),
    );
    tbody.append(tr);
  }
  table.replaceChildren(headerRow(['航空会社', '各辺の上限', '3辺合計', '重量', '各辺規定の根拠']), tbody);

  const notes = el('airline-notes');
  notes.replaceChildren();
  for (const airline of dataset.airlines.filter((item) => item.notes.length > 0)) {
    const heading = document.createElement('h3');
    heading.textContent = airline.name;
    const list = document.createElement('ul');
    for (const note of airline.notes) {
      const li = document.createElement('li');
      li.textContent = note;
      list.append(li);
    }
    notes.append(heading, list);
  }
  for (const change of dataset.upcomingChanges ?? []) {
    const p = document.createElement('p');
    p.textContent = `【${change.effectiveFrom} 改定予定】${change.summary}`;
    notes.append(p);
  }
}

function readCheckerInput() {
  const number = (id) => Number(el(id).value);
  return {
    item: {
      heightCm: number('height'),
      widthCm: number('width'),
      depthCm: number('depth'),
      weightKg: number('weight'),
      dimensionsVerified: true,
    },
    personalItemKg: Number(el('personal').value) || 0,
  };
}

function renderChecker(airlines) {
  const { item, personalItemKg } = readCheckerInput();
  const results = evaluateAll(item, airlines, { personalItemKg });
  const total = totalCm(item);
  const passing = airlines.filter((airline) => results[airline.id].verdict === 'ok');

  el('checker-summary').textContent = total
    ? `3辺合計 ${total}cm ／ ${airlines.length}社中 ${passing.length}社で持ち込み可`
    : '外寸を入力してください。';

  const tbody = document.createElement('tbody');
  for (const airline of airlines) {
    const result = results[airline.id];
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = airline.name;
    tr.append(
      th,
      verdictCell(result),
      textCell(
        result.margins ? result.margins.map((margin) => `${margin}`).join(' / ') : '—',
        'num',
      ),
      textCell(
        typeof result.usableWeightKg === 'number' ? `${result.usableWeightKg} kg` : '—',
        'num',
      ),
    );
    tbody.append(tr);
  }
  el('checker-table').replaceChildren(
    headerRow(['航空会社', '判定', '各辺の余裕 (cm・長辺から順)', '中身に使える重量']),
    tbody,
  );
}

function renderProducts(dataset, airlines, config) {
  const products = dataset.products ?? [];
  const listed = products.filter(
    (product) => product.dimensionsVerified === true && typeof product.heightCm === 'number',
  );
  const pending = products.filter((product) => !listed.includes(product));
  const shown = airlines.filter((airline) => ['peach', 'jetstar', 'zipair', 'ana_jal'].includes(airline.id));

  el('products-status').textContent =
    listed.length > 0
      ? `外寸を一次情報で確認できた ${listed.length} 件を掲載しています（${dataset.asOf} 時点）。`
      : '外寸を一次情報で確認できた商品がまだありません。確認できたものだけをここに掲載します。';

  const table = el('products-table');
  if (listed.length === 0) {
    table.replaceChildren();
  } else {
    const tbody = document.createElement('tbody');
    for (const product of listed) {
      const results = evaluateAll(product, shown, {});
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.scope = 'row';
      if (product.asin && config.associateTag) {
        const link = document.createElement('a');
        link.href = buildAffiliateUrl({
          asin: product.asin,
          tag: config.associateTag,
          domain: config.marketplace,
        });
        link.target = '_blank';
        link.rel = 'nofollow sponsored noopener';
        link.textContent = product.name;
        th.append(link);
      } else {
        th.textContent = product.name;
      }
      tr.append(
        th,
        textCell(product.type ?? '—'),
        textCell(`${product.heightCm} × ${product.widthCm} × ${product.depthCm}`, 'num'),
        textCell(`${totalCm(product)}`, 'num'),
        textCell(typeof product.weightKg === 'number' ? `${product.weightKg} kg` : '—', 'num'),
        textCell(typeof product.capacityL === 'number' ? `${product.capacityL} L` : '—', 'num'),
        ...shown.map((airline) => verdictCell(results[airline.id])),
      );
      tbody.append(tr);
    }
    table.replaceChildren(
      headerRow([
        '商品',
        'タイプ',
        '外寸 (cm)',
        '3辺合計',
        '本体重量',
        '容量',
        ...shown.map((airline) => `${airline.name}可`),
      ]),
      tbody,
    );
  }

  const pendingBox = el('products-pending');
  pendingBox.replaceChildren();
  if (pending.length === 0) return;

  const heading = document.createElement('p');
  heading.textContent = `外寸が未確認のため、次の ${pending.length} 件は掲載していません。`;
  const list = document.createElement('ul');
  for (const product of pending) {
    const li = document.createElement('li');
    li.textContent = product.note ? `${product.name}（${product.note}）` : product.name;
    list.append(li);
  }
  pendingBox.append(heading, list);
}

async function main() {
  const [config, airlineData, productData] = await Promise.all([
    loadJson('../site.config.json'),
    loadJson('../data/airlines.json'),
    loadJson('../data/luggage-products.json'),
  ]);
  const airlines = airlineData.airlines;

  el('disclosure').textContent = config.disclosure ?? '';
  el('footer-disclosure').textContent = config.disclosure ?? '';
  el('price-note').textContent = config.priceNote ?? '';
  el('year').textContent = String(new Date().getFullYear());
  for (const node of document.querySelectorAll('.footer-name')) node.textContent = config.siteName;
  el('lead').textContent =
    '「3辺合計115cm以内」を満たしていても、LCCでは各辺の上限で弾かれます。しかもピーチとジェットスターの規定は、1台では両立しません。手持ちのケースが何社で通るかをこのページで判定できます。';
  el('personal').value = String(DEFAULT_PERSONAL_ITEM_KG);

  renderConclusion(airlines);
  renderConflict(airlines);
  renderAirlineTable(airlineData);
  renderProducts(productData, airlines, config);
  renderChecker(airlines);

  el('checker').addEventListener('input', () => renderChecker(airlines));
  el('checker').addEventListener('submit', (event) => event.preventDefault());
}

main().catch((error) => {
  el('checker-summary').textContent = `読み込みに失敗しました: ${error.message}（npm start 経由で開いてください）`;
});
