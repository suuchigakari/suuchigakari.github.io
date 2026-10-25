/**
 * data/articles/*.json から記事HTMLを生成する。
 *
 * 生成物は articles/<slug>.html。本文も比較表も静的HTMLとして書き出すので、
 * JavaScript を切っても、検索エンジンから見ても中身がある状態になる。
 * 絞り込みだけは assets/article-filter.js が後から有効にする（付加機能）。
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { buildAffiliateUrl, escapeHtml } from '../src/affiliate.js';
import {
  CHECKER_DEFAULTS,
  renderAirlines,
  renderBodyGap,
  renderChecker,
  renderConclusion,
  renderConflict,
  renderProducts,
  verifiedLuggage,
} from '../src/lcc-render.js';
import { fittingAirlines, totalCm } from '../src/luggage.js';
import { renderSaleNotice, todayIso } from '../src/sale.js';
import { categoryIcon, categoryOf, highlightNumbers, CATEGORIES } from '../src/theme.js';
import { chartRows, chartSpec } from '../src/chart.js';
import {
  FIT,
  applyTransform,
  bulkRatio,
  evaluateProduct,
  filledWeightKg,
  formatSpec,
  pairWeightG,
  verifiedProducts,
} from '../src/fit.js';

/** 列の値を仕様から計算する場合の関数。JSON からは名前で参照する。 */
const COMPUTED = {
  bulkRatio: (product) => bulkRatio(product.specs?.outerCm, product.specs?.capacityL),
};

/**
 * 仕様から計算して specs に足す値。記事 JSON の derivedSpecs に名前を書くと有効になる。
 * 絞り込み（ブラウザ側）でも使えるよう、表示用の列ではなく specs に入れる。
 */
const DERIVED_SPECS = {
  filledWeightKg: (specs) => filledWeightKg(specs.capacityL, specs.weightKg),
  pairWeightG: (specs) => pairWeightG(specs.weightG, specs.weightBasis),
};

function withDerivedSpecs(article) {
  if (!article.derivedSpecs) return article;
  const products = article.products.map((product) => {
    const specs = { ...product.specs };
    for (const key of article.derivedSpecs) {
      if (!DERIVED_SPECS[key]) throw new Error(`未定義の derivedSpecs: ${key}`);
      specs[key] = DERIVED_SPECS[key](specs);
    }
    return { ...product, specs };
  });
  return { ...article, products };
}

/**
 * airlineFit を持つ記事（リュックなど）は、外寸 specs.outerCm（高さ・幅・奥行）と重量から
 * 各社の機内持ち込み規定に収まるかを計算して specs に足す。判定は src/luggage.js に任せる。
 */
function withAirlineFit(article, airlines) {
  if (!article.airlineFit) return article;
  const targets = airlines.filter((airline) => airline.group === article.airlineFit.group);
  const products = article.products.map((product) => {
    const [heightCm, widthCm, depthCm] = product.specs?.outerCm ?? [];
    const item = { heightCm, widthCm, depthCm, weightKg: product.specs?.weightKg };
    const ok = fittingAirlines(item, targets);
    const fitAirlines =
      ok.length === targets.length
        ? `全${targets.length}社`
        : ok.length === 0
          ? 'なし'
          : ok.map((airline) => airline.name).join('・');
    return {
      ...product,
      specs: {
        ...product.specs,
        totalCm: totalCm(item),
        fitAirlines,
        fitAllAirlines: ok.length === targets.length,
      },
    };
  });
  return { ...article, products };
}

const root = new URL('..', import.meta.url);
const articlesDir = new URL('data/articles/', root);

/** filter は numberInput 単体でも numberInputs 配列でも書ける。 */
function numberInputsOf(filter) {
  if (!filter) return [];
  return filter.numberInputs ?? (filter.numberInput ? [filter.numberInput] : []);
}

const STATUS_LABEL = {
  [FIT.OK]: '○',
  [FIT.OK_WITH_PARTS]: '△',
  [FIT.NG]: '×',
  [FIT.UNKNOWN]: '?',
};

function list(items, className = '') {
  if (!items || items.length === 0) return '';
  const li = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n          ');
  return `<ul${className ? ` class="${className}"` : ''}>\n          ${li}\n        </ul>`;
}

/** 「次に困りそうなこと」。{ text, href } の項目は関連記事へのリンクカードにする。 */
function renderNextProblems(items) {
  if (!items || items.length === 0) return '';
  const li = items
    .map((item) =>
      typeof item === 'string'
        ? `<li class="next-card">${escapeHtml(item)}</li>`
        : `<li><a class="next-card" href="${escapeHtml(item.href)}">${escapeHtml(item.text)}<span class="arrow" aria-hidden="true">→</span></a></li>`,
    )
    .join('\n          ');
  return `<ul class="next-list">\n          ${li}\n        </ul>`;
}

function sectionId(index) {
  return `s${index + 1}`;
}

function renderSections(sections) {
  return sections
    .map(
      (section, index) => `      <section id="${sectionId(index)}">
        <h2 class="numbered"><span class="no" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>${escapeHtml(section.heading)}</h2>
        ${(section.paragraphs ?? []).map((text) => `<p>${highlightNumbers(text)}</p>`).join('\n        ')}
        ${list(section.list)}
      </section>`,
    )
    .join('\n\n');
}

function renderExclusions(excludeReaders) {
  const items = excludeReaders
    .map(
      (reader) =>
        `<li><strong>${escapeHtml(reader.who)}</strong><span>${escapeHtml(reader.why)}</span></li>`,
    )
    .join('\n          ');
  return `      <details class="not-for">
        <summary>この記事が向かない人（${excludeReaders.length}）</summary>
        <ul>
          ${items}
        </ul>
      </details>`;
}

function renderArticleConclusion(conclusion) {
  const items = conclusion
    .map((text, index) => `<li><span class="no" aria-hidden="true">${index + 1}</span><p>${highlightNumbers(text)}</p></li>`)
    .join('\n          ');
  return `      <section id="conclusion" class="conclusion">
        <h2>結論</h2>
        <ol class="conclusion-list">
          ${items}
        </ol>
      </section>`;
}

function renderToc(article, hasChart) {
  const items = [
    ['conclusion', '結論'],
    ...article.sections.map((section, index) => [sectionId(index), section.heading]),
    ...(hasChart ? [['chart', '数字で見る']] : []),
    ['filter-section', article.filter?.heading ?? '絞り込み'],
    ['table', '比較表'],
  ]
    .map(([id, label]) => `<li><a href="#${id}">${escapeHtml(label)}</a></li>`)
    .join('\n            ');
  return `      <nav class="toc" aria-label="目次">
        <p class="toc-title">目次</p>
        <ol>
            ${items}
        </ol>
      </nav>`;
}

function renderHero(article, category, count) {
  return `    <div class="hero">
      <div class="wrap article-wrap">
        <p class="hero-genre">${categoryIcon(category.key, 22)}<span>${escapeHtml(category.label)}</span><span class="sep">／</span><span>${escapeHtml(article.genre)}</span></p>
        <h1>${escapeHtml(article.title)}</h1>
        <ul class="hero-facts">
          <li><strong>${count}</strong>件を比較</li>
          <li><strong>${escapeHtml(article.asOf)}</strong>確認</li>
          <li>数値は<strong>メーカー公式</strong>のみ</li>
        </ul>
      </div>
    </div>`;
}

function formatChartValue(value, unit) {
  return `${Number.isInteger(value) ? value : value.toLocaleString('ja-JP', { maximumFractionDigits: 2 })}${unit}`;
}

function renderChart(article, products) {
  const spec = chartSpec(article);
  if (!spec) return '';
  const { rows, missing } = chartRows(products, spec);
  if (rows.length < 3) return '';
  const bar = (row) =>
    `<li><span class="bar-name">${escapeHtml(row.name)}</span><span class="bar-track"><span class="bar" style="width:${row.percent}%"></span></span><span class="bar-value">${escapeHtml(formatChartValue(row.value, spec.unit))}</span></li>`;
  const SHOWN = 10;
  const rest = rows.slice(SHOWN);
  const bars = `${rows.slice(0, SHOWN).map(bar).join('\n          ')}${
    rest.length > 0
      ? `\n          <li class="bars-more"><details><summary>残りの ${rest.length} 件を表示</summary><ol class="bars">${rest.map(bar).join('')}</ol></details></li>`
      : ''
  }`;
  const orderText = spec.order === 'asc' ? '小さい順' : '大きい順';
  return `      <section id="chart" class="chart">
        <h2>数字で見る：${escapeHtml(spec.label)}</h2>
        <p class="small">メーカー公式の値を${orderText}に並べました。${spec.note ? `${escapeHtml(spec.note)}` : ''}${
          missing > 0 ? `公式に数値がない ${missing} 件は載せていません。` : ''
        }</p>
        <ol class="bars">
          ${bars}
        </ol>
      </section>`;
}

/** 商品名がブランド名で始まらないときだけ、ブランドを小さく添える。 */
function brandChip(product) {
  const brand = (product.brand ?? '').split('（')[0];
  if (!brand || product.name.startsWith(brand)) return '';
  return `<span class="brand-chip">${escapeHtml(brand)}</span>`;
}

function renderProductRow(product, columns, config, verdict) {
  const url = product.asin
    ? buildAffiliateUrl({ asin: product.asin, tag: config.associateTag, domain: config.marketplace })
    : null;
  const name = url
    ? `<a class="product-name" href="${escapeHtml(url)}" target="_blank" rel="nofollow sponsored noopener">${escapeHtml(product.name)}</a>
              <a class="cta-small" href="${escapeHtml(url)}" target="_blank" rel="nofollow sponsored noopener">${escapeHtml(config.ctaLabel ?? 'Amazonで見る')}</a>`
    : `<span class="product-name">${escapeHtml(product.name)}</span>`;

  const cells = columns
    .map((column) => {
      const raw = column.computed
        ? COMPUTED[column.computed](product)
        : product.specs?.[column.key];
      const value = formatSpec(raw, column.unit ?? '');
      const className = value === '公式に明記なし' ? 'unknown' : 'num';
      return `<td class="${className}" data-label="${escapeHtml(column.label)}">${escapeHtml(value)}</td>`;
    })
    .join('');

  const note = product.note
    ? `\n          <tr class="note-row"><td class="row-note" colspan="${columns.length + 2}">${escapeHtml(
        product.note,
      )}</td></tr>`
    : '';

  // ×の理由を最優先で見せ、次に?などの理由。すべて通っていれば最初の条件の判定を出す。
  const failed =
    verdict.results.find((result) => result.status === FIT.NG) ??
    verdict.results.find((result) => result.status !== FIT.OK);
  const detail = (failed ?? verdict.results[0])?.detail ?? '';
  return `          <tr data-product="${escapeHtml(product.name)}"${note ? ' class="has-note"' : ''}>
            <th scope="row">${brandChip(product)}${name}</th>
            <td class="verdict ${verdict.status}" data-label="判定">${STATUS_LABEL[verdict.status]}<span class="reason">${escapeHtml(
              detail,
            )}</span></td>
            ${cells}
          </tr>${note}`;
}

function renderTable(products, columns, config, verdicts) {
  const head = ['商品', '判定', ...columns.map((column) => column.label)]
    .map((label) => `<th scope="col">${escapeHtml(label)}</th>`)
    .join('');
  const rows = products
    .map((product, index) => renderProductRow(product, columns, config, verdicts[index]))
    .join('\n');

  return `      <div class="table-scroll">
        <table id="products-table" class="products">
          <thead><tr>${head}</tr></thead>
          <tbody>
${rows}
          </tbody>
        </table>
      </div>`;
}

function renderFilter(filter) {
  if (!filter) return '';
  const { flagInput } = filter;
  const inputs = numberInputsOf(filter)
    .map(
      (input, index) => `          <label>${escapeHtml(input.label)}
            <input type="number" inputmode="decimal" id="filter-number-${index}" step="${input.step ?? 0.5}" min="${input.min}" max="${input.max}" value="${input.default}" />
          </label>`,
    )
    .join('\n');
  return `      <section id="filter-section" class="filter-panel">
        <h2>${escapeHtml(filter.heading)}</h2>
        <p class="small">${escapeHtml(filter.note)}</p>
        <form class="checker" id="filter">
${inputs}
          <label class="checkbox">
            <input type="checkbox" id="filter-flag" />${escapeHtml(flagInput.label)}
          </label>
        </form>
        <p class="filter-summary" id="filter-summary" aria-live="polite"></p>
      </section>`;
}

function renderSources(products, sources) {
  const items = products
    .filter((product) => product.source)
    .map((product) => `${product.name}：${product.source}`)
    .concat((sources ?? []).map((source) => `${source.label}：${source.url}`));
  return `      <details class="notes">
        <summary>仕様の出典（${items.length}件）</summary>
        ${list(items)}
      </details>`;
}

function renderArticle(article, config) {
  const products = verifiedProducts(article.products);
  const pending = article.products.length - products.length;
  const category = categoryOf(article.slug);
  const inputs = numberInputsOf(article.filter);
  const requirements = inputs.map((input) => ({
    key: input.key,
    type: input.type,
    value: applyTransform(input.default, input.transform),
    unit: input.unit ?? '',
    label: input.label,
  }));
  // 初期表示の判定は「幅だけ」で行う（チェックボックスは既定でオフのため）。
  const initial = products.map((product) => evaluateProduct(product, requirements));
  const chart = renderChart(article, products);

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(article.title)}</title>
    <meta name="description" content="${escapeHtml(article.description)}" />
    <link rel="stylesheet" href="../assets/style.css" />
    <link rel="stylesheet" href="../assets/article.css" />
  </head>
  <body class="cat-${category.key}">
    <header class="site-header">
      <div class="wrap">
        <p class="brand"><a href="../index.html">${escapeHtml(config.siteName)}</a></p>
      </div>
    </header>

    <p class="disclosure">${escapeHtml(config.disclosure)}</p>${renderSaleNotice(config.saleNotice, todayIso(), '../assets/sale-notice.js')}

${renderHero(article, category, products.length)}

    <main class="wrap article">
      <p class="lead">${highlightNumbers(article.lead)}</p>

${renderArticleConclusion(article.conclusion)}

${renderToc(article, Boolean(chart))}

${renderExclusions(article.excludeReaders)}

${renderSections(article.sections)}

${chart}

${renderFilter(article.filter)}

      <section id="table">
        <h2>比較表</h2>
        <p class="small">メーカー公式の仕様表で確認できた ${products.length} 件を掲載しています（${escapeHtml(
          article.asOf,
        )} 確認）。${pending > 0 ? `仕様を確認できなかった ${pending} 件は掲載していません。` : ''}</p>
        <p class="legend"><span class="badge-verdict ok">○</span>条件を満たす <span class="badge-verdict ng">×</span>満たさない <span class="badge-verdict unknown">?</span>公式に明記なし</p>
${renderTable(products, article.columns, config, initial)}
        <p class="small">判定は「${escapeHtml(
          inputs.map((input) => `${input.label} ${input.default}`).join('』『'),
        )}」に対する結果です。${escapeHtml(article.verdictLegend ?? '○＝条件を満たす、△＝拡張パーツが必要、×＝満たさない、?＝公式に明記なし。')}</p>
      </section>

${renderSources(products, article.sources)}

      <section class="next">
        <h2>次に困りそうなこと</h2>
        ${renderNextProblems(article.nextProblems)}
      </section>

      <p class="price-note">${escapeHtml(config.priceNote)}</p>
    </main>

    <footer class="site-footer">
      <div class="wrap">
        <p>${escapeHtml(config.disclosure)}</p>
        <p class="small">
          <a href="../pages/about.html">運営者情報</a> ・ <a href="../pages/privacy.html">プライバシーポリシー</a>
        </p>
        <p class="small">&copy; ${new Date().getFullYear()} ${escapeHtml(config.siteName)}</p>
      </div>
    </footer>

    <script type="application/json" id="article-data">
${JSON.stringify({ filter: article.filter, products }, null, 2)}
    </script>
    <script type="module" src="../assets/article-filter.js"></script>
  </body>
</html>
`;
}

/** トップページ（記事一覧）を生成する。カテゴリごとに色とアイコンを付けて並べる。 */
function renderIndex(entries, config) {
  const card = (entry, key) => `          <article class="card cat-${key}">
            <a class="card-link" href="./articles/${escapeHtml(entry.slug)}.html">
              <span class="card-icon">${categoryIcon(key, 22)}</span>
              <span class="card-genre">${escapeHtml(entry.genre)}</span>
              <h3>${escapeHtml(entry.title)}</h3>
              <p class="summary">${escapeHtml(entry.description)}</p>
              <span class="card-meta"><strong>${entry.productCount}</strong>件を比較 ・ ${escapeHtml(entry.asOf)} 確認</span>
            </a>
          </article>`;
  const groups = Object.entries(CATEGORIES)
    .map(([key, category]) => {
      const items = entries.filter((entry) => categoryOf(entry.slug).key === key);
      if (items.length === 0) return '';
      return `      <section class="cat-group cat-${key}" id="cat-${key}" aria-label="${escapeHtml(category.label)}">
        <h2 class="cat-heading">${categoryIcon(key, 26)}${escapeHtml(category.label)}<span class="cat-count">${items.length}記事</span></h2>
        <div class="grid">
${items.map((entry) => card(entry, key)).join('\n')}
        </div>
      </section>`;
    })
    .filter(Boolean)
    .join('\n\n');
  const jump = Object.entries(CATEGORIES)
    .filter(([key]) => entries.some((entry) => categoryOf(entry.slug).key === key))
    .map(([key, category]) => `<a class="chip cat-${key}" href="#cat-${key}">${categoryIcon(key, 18)}${escapeHtml(category.label)}</a>`)
    .join('\n          ');
  const cards = `      <nav class="chips" aria-label="カテゴリ">
          ${jump}
      </nav>

${groups}`;

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(config.siteName)}</title>
    <meta name="description" content="${escapeHtml(config.tagline)}" />${
      config.googleSiteVerification
        ? `\n    <meta name="google-site-verification" content="${escapeHtml(config.googleSiteVerification)}" />`
        : ''
    }
    <link rel="stylesheet" href="./assets/style.css" />
    <link rel="stylesheet" href="./assets/article.css" />
  </head>
  <body class="home-page">
    <header class="site-header">
      <div class="wrap">
        <p class="brand">${escapeHtml(config.siteName)}</p>
      </div>
    </header>

    <p class="disclosure">${escapeHtml(config.disclosure)}</p>${renderSaleNotice(config.saleNotice, todayIso(), './assets/sale-notice.js')}

    <div class="hero home-hero">
      <div class="wrap">
        <h1>迷いやすい道具を、<br />メーカー公式の数字で比べる</h1>
        <p class="hero-lead">${escapeHtml(config.tagline)}</p>
        <ul class="policy">
          <li><strong>公式の数値だけ</strong>メーカー・航空会社の公式で確認し、確認日と出典を残しています</li>
          <li><strong>分からないものは載せない</strong>確認できなかった商品は件数だけ表示します</li>
          <li><strong>価格は載せない</strong>変動するため、リンク先の Amazon.co.jp で確認してください</li>
        </ul>
      </div>
    </div>

    <main class="wrap">
${cards}

      <p class="price-note">${escapeHtml(config.priceNote)}</p>
    </main>

    <footer class="site-footer">
      <div class="wrap">
        <p>${escapeHtml(config.disclosure)}</p>
        <p class="small">
          <a href="./pages/about.html">運営者情報</a> ・ <a href="./pages/privacy.html">プライバシーポリシー</a>
        </p>
        <p class="small">&copy; ${new Date().getFullYear()} ${escapeHtml(config.siteName)}</p>
      </div>
    </footer>
  </body>
</html>
`;
}

/** LCC記事のテンプレートの {{名前}} を埋める。 */
function renderLccPage(template, airlineData, luggageData, config) {
  const airlines = airlineData.airlines;
  const airlineParts = renderAirlines(airlineData);
  const productParts = renderProducts(luggageData, airlines, config);
  const checker = renderChecker(airlines, CHECKER_DEFAULTS);
  const values = {
    siteName: escapeHtml(config.siteName),
    disclosure: escapeHtml(config.disclosure),
    priceNote: escapeHtml(config.priceNote),
    saleNotice: renderSaleNotice(config.saleNotice, todayIso(), '../assets/sale-notice.js'),
    categoryIcon: categoryIcon('travel', 22),
    year: String(new Date().getFullYear()),
    conclusion: renderConclusion(airlines),
    conflict: renderConflict(airlines),
    bodyGap: renderBodyGap(verifiedLuggage(luggageData.products)),
    checkerSummary: checker.summary,
    checkerTable: checker.table,
    airlinesAsOf: airlineParts.asOf,
    airlinesTable: airlineParts.table,
    airlineNotes: airlineParts.notes,
    productsStatus: escapeHtml(productParts.status),
    productsTable: productParts.table,
    productsNotes: productParts.notes,
    // </script> を含めないよう < をエスケープして埋め込む
    data: JSON.stringify({ airlines }).replaceAll('<', '\\u003c'),
  };
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in values)) throw new Error(`テンプレートの未定義の値: ${key}`);
    return values[key];
  });
}

const configPath = fileURLToPath(new URL('site.config.json', root));
const config = JSON.parse(await readFile(configPath, 'utf8'));

const readJson = async (path) =>
  JSON.parse(await readFile(fileURLToPath(new URL(path, root)), 'utf8'));
const airlineData = await readJson('data/airlines.json');

const files = (await readdir(fileURLToPath(articlesDir))).filter((file) => file.endsWith('.json'));
const entries = [];

for (const file of files) {
  const article = withDerivedSpecs(
    withAirlineFit(
      JSON.parse(await readFile(fileURLToPath(new URL(file, articlesDir)), 'utf8')),
      airlineData.airlines,
    ),
  );
  const products = verifiedProducts(article.products);
  await writeFile(
    fileURLToPath(new URL(`articles/${article.slug}.html`, root)),
    renderArticle(article, config),
  );
  entries.push({
    slug: article.slug,
    genre: article.genre,
    commissionRate: article.commissionRate,
    title: article.title,
    description: article.description,
    asOf: article.asOf,
    productCount: products.length,
  });
  console.log(`生成: articles/${article.slug}.html （掲載 ${products.length} 件）`);
}

// LCCキャリーケース記事はテンプレート＋航空会社規定データから生成する
const luggageData = await readJson('data/luggage-products.json');
const luggageListed = verifiedLuggage(luggageData.products);
await writeFile(
  fileURLToPath(new URL('articles/lcc-carrycase.html', root)),
  renderLccPage(
    await readFile(fileURLToPath(new URL('templates/lcc-carrycase.html', root)), 'utf8'),
    airlineData,
    luggageData,
    config,
  ),
);
console.log(`生成: articles/lcc-carrycase.html （掲載 ${luggageListed.length} 件）`);

// テンプレート記事の一覧情報（タイトル・説明）は data/article-list.json から読む
const manual = await readJson('data/article-list.json');
for (const entry of manual.articles) {
  const productCount = entry.slug === 'lcc-carrycase' ? luggageListed.length : entry.productCount;
  entries.push({ ...entry, productCount });
}

/**
 * 検索エンジン向けの sitemap.xml。記事・トップ・固定ページを載せる。
 * 運営者用の tools/ は載せない（robots.txt でもクロール対象外にしている）。
 */
function renderSitemap(entries, siteUrl) {
  const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
  const urls = [
    { loc: base },
    ...entries.map((entry) => ({
      loc: `${base}articles/${entry.slug}.html`,
      // 確認日が日付まで分かる記事だけ lastmod を付ける（月単位の値は付けない）
      lastmod: /^\d{4}-\d{2}-\d{2}$/.test(entry.asOf ?? '') ? entry.asOf : null,
    })),
    { loc: `${base}pages/about.html` },
    { loc: `${base}pages/privacy.html` },
  ];
  const body = urls
    .map(
      (url) =>
        `  <url>\n    <loc>${escapeHtml(url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}\n  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function renderRobots(siteUrl) {
  const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
  return `User-agent: *\nDisallow: /tools/\n\nSitemap: ${base}sitemap.xml\n`;
}

entries.sort((a, b) => Number.parseFloat(b.commissionRate) - Number.parseFloat(a.commissionRate));
await writeFile(fileURLToPath(new URL('index.html', root)), renderIndex(entries, config));
console.log(`生成: index.html （記事 ${entries.length} 件）`);

await writeFile(fileURLToPath(new URL('sitemap.xml', root)), renderSitemap(entries, config.siteUrl));
await writeFile(fileURLToPath(new URL('robots.txt', root)), renderRobots(config.siteUrl));
console.log(`生成: sitemap.xml （${entries.length + 3} URL）・robots.txt`);
