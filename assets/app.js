import { buildAffiliateUrl, isValidTag } from '../src/affiliate.js';

const state = {
  config: null,
  products: [],
  query: '',
  category: '',
  sort: 'score',
  compare: new Set(),
};

const el = (id) => document.getElementById(id);

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`${path} を読み込めませんでした (HTTP ${response.status})`);
  }
  return response.json();
}

function affiliateUrlFor(product) {
  return buildAffiliateUrl({
    asin: product.asin,
    tag: state.config.associateTag,
    domain: state.config.marketplace,
  });
}

function matches(product) {
  if (state.category && product.category !== state.category) return false;
  if (!state.query) return true;
  const haystack = [
    product.name,
    product.brand,
    product.category,
    product.summary,
    product.recommendedFor,
    ...(product.pros ?? []),
    ...(product.cons ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return state.query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function sorted(products) {
  const copy = [...products];
  if (state.sort === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  } else if (state.sort === 'category') {
    copy.sort(
      (a, b) =>
        a.category.localeCompare(b.category, 'ja') || (b.score ?? 0) - (a.score ?? 0),
    );
  } else {
    copy.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }
  return copy;
}

function createCard(product) {
  const card = document.createElement('article');
  card.className = 'card';

  const title = document.createElement('h2');
  title.textContent = product.name;
  card.append(title);

  const meta = document.createElement('p');
  meta.className = 'meta';
  for (const text of [product.category, product.brand, product.priceRange].filter(Boolean)) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = text;
    meta.append(badge);
  }
  if (typeof product.score === 'number') {
    const score = document.createElement('span');
    score.className = 'score';
    score.textContent = `★ ${product.score.toFixed(1)}`;
    meta.append(score);
  }
  card.append(meta);

  const summary = document.createElement('p');
  summary.className = 'summary';
  summary.textContent = product.summary ?? '';
  card.append(summary);

  const points = document.createElement('ul');
  points.className = 'points';
  for (const [items, className] of [
    [product.pros ?? [], 'pro'],
    [product.cons ?? [], 'con'],
  ]) {
    for (const item of items) {
      const li = document.createElement('li');
      li.className = className;
      li.textContent = item;
      points.append(li);
    }
  }
  if (points.childElementCount > 0) card.append(points);

  const specs = Object.entries(product.specs ?? {});
  if (specs.length > 0) {
    const list = document.createElement('dl');
    list.className = 'specs';
    for (const [key, value] of specs) {
      const dt = document.createElement('dt');
      dt.textContent = key;
      const dd = document.createElement('dd');
      dd.textContent = value;
      list.append(dt, dd);
    }
    card.append(list);
  }

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const cta = document.createElement('a');
  cta.className = 'cta';
  cta.href = affiliateUrlFor(product);
  cta.target = '_blank';
  cta.rel = 'nofollow sponsored noopener';
  cta.textContent = state.config.ctaLabel ?? 'Amazonで見る';
  footer.append(cta);

  const toggle = document.createElement('label');
  toggle.className = 'compare-toggle';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = state.compare.has(product.asin);
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) state.compare.add(product.asin);
    else state.compare.delete(product.asin);
    renderCompare();
  });
  toggle.append(checkbox, document.createTextNode('比較する'));
  footer.append(toggle);

  card.append(footer);
  return card;
}

function renderProducts() {
  const visible = sorted(state.products.filter(matches));
  const container = el('products');
  container.replaceChildren(...visible.map(createCard));
  el('empty').hidden = visible.length > 0;
  el('count').textContent = `${visible.length} / ${state.products.length} 件`;
}

/** 比較表の行定義。値の取り出し方だけを差し替える。 */
const COMPARE_ROWS = [
  ['カテゴリ', (p) => p.category],
  ['価格帯', (p) => p.priceRange],
  ['評価', (p) => (typeof p.score === 'number' ? `★ ${p.score.toFixed(1)}` : '')],
  ['良い点', (p) => (p.pros ?? []).join(' / ')],
  ['気になる点', (p) => (p.cons ?? []).join(' / ')],
  ['向いている人', (p) => p.recommendedFor],
];

function renderCompare() {
  const selected = state.products.filter((p) => state.compare.has(p.asin));
  const section = el('compare-section');
  section.hidden = selected.length === 0;
  if (selected.length === 0) return;

  const specKeys = [...new Set(selected.flatMap((p) => Object.keys(p.specs ?? {})))];
  const table = el('compare-table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.append(document.createElement('th'));
  for (const product of selected) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = product.name;
    headRow.append(th);
  }
  thead.append(headRow);

  const tbody = document.createElement('tbody');
  const rows = [...COMPARE_ROWS, ...specKeys.map((key) => [key, (p) => p.specs?.[key]])];
  for (const [label, valueOf] of rows) {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = label;
    tr.append(th);
    for (const product of selected) {
      const td = document.createElement('td');
      td.textContent = valueOf(product) ?? '—';
      tr.append(td);
    }
    tbody.append(tr);
  }

  const linkRow = document.createElement('tr');
  const linkHead = document.createElement('th');
  linkHead.scope = 'row';
  linkHead.textContent = 'リンク';
  linkRow.append(linkHead);
  for (const product of selected) {
    const td = document.createElement('td');
    const link = document.createElement('a');
    link.href = affiliateUrlFor(product);
    link.target = '_blank';
    link.rel = 'nofollow sponsored noopener';
    link.textContent = state.config.ctaLabel ?? 'Amazonで見る';
    td.append(link);
    linkRow.append(td);
  }
  tbody.append(linkRow);

  table.replaceChildren(thead, tbody);
}

function renderChrome() {
  const { siteName, tagline, disclosure, priceNote, associateTag } = state.config;
  document.title = siteName;
  el('site-name').textContent = siteName;
  el('site-tagline').textContent = tagline ?? '';
  el('disclosure').textContent = disclosure ?? '';
  el('footer-disclosure').textContent = disclosure ?? '';
  el('price-note').textContent = priceNote ?? '';
  el('year').textContent = String(new Date().getFullYear());
  for (const node of document.querySelectorAll('.footer-name')) node.textContent = siteName;

  const warning = el('tag-warning');
  if (!isValidTag(associateTag)) {
    warning.hidden = false;
    warning.textContent =
      'site.config.json の associateTag が未設定、または形式が不正です（例: example-22）。';
  } else if (associateTag === 'example-22') {
    warning.hidden = false;
    warning.textContent =
      'site.config.json の associateTag がサンプルのままです。公開前に自分のアソシエイトタグへ変更してください。';
  }

  const categories = [...new Set(state.products.map((p) => p.category))].sort((a, b) =>
    a.localeCompare(b, 'ja'),
  );
  const select = el('category');
  for (const category of categories) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.append(option);
  }
}

function bindControls() {
  el('q').addEventListener('input', (event) => {
    state.query = event.target.value.trim();
    renderProducts();
  });
  el('category').addEventListener('change', (event) => {
    state.category = event.target.value;
    renderProducts();
  });
  el('sort').addEventListener('change', (event) => {
    state.sort = event.target.value;
    renderProducts();
  });
  el('clear-compare').addEventListener('click', () => {
    state.compare.clear();
    renderProducts();
    renderCompare();
  });
}

async function main() {
  try {
    const [config, products] = await Promise.all([
      loadJson('./site.config.json'),
      loadJson('./data/products.json'),
    ]);
    state.config = config;
    state.products = products;
    renderChrome();
    bindControls();
    renderProducts();
  } catch (error) {
    const warning = el('tag-warning');
    warning.hidden = false;
    warning.textContent = `読み込みに失敗しました: ${error.message}（file:// ではなく npm start で開いてください）`;
  }
}

main();
