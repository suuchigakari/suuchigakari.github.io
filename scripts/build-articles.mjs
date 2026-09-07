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
import { FIT, bulkRatio, evaluateProduct, formatSpec, verifiedProducts } from '../src/fit.js';

/** 列の値を仕様から計算する場合の関数。JSON からは名前で参照する。 */
const COMPUTED = {
  bulkRatio: (product) => bulkRatio(product.specs?.outerCm, product.specs?.capacityL),
};

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

function renderSections(sections) {
  return sections
    .map(
      (section) => `      <section>
        <h2>${escapeHtml(section.heading)}</h2>
        ${(section.paragraphs ?? []).map((text) => `<p>${escapeHtml(text)}</p>`).join('\n        ')}
        ${list(section.list)}
      </section>`,
    )
    .join('\n\n');
}

function renderExclusions(excludeReaders) {
  const items = excludeReaders
    .map(
      (reader) =>
        `<li><strong>${escapeHtml(reader.who)}</strong> — ${escapeHtml(reader.why)}</li>`,
    )
    .join('\n          ');
  return `      <section class="callout" aria-label="この記事の対象外">
        <h2>この記事が向かない人</h2>
        <ul>
          ${items}
        </ul>
      </section>`;
}

function renderProductRow(product, columns, config, verdict) {
  const name = product.asin
    ? `<a href="${escapeHtml(
        buildAffiliateUrl({
          asin: product.asin,
          tag: config.associateTag,
          domain: config.marketplace,
        }),
      )}" target="_blank" rel="nofollow sponsored noopener">${escapeHtml(product.name)}</a>`
    : escapeHtml(product.name);

  const cells = columns
    .map((column) => {
      const raw = column.computed
        ? COMPUTED[column.computed](product)
        : product.specs?.[column.key];
      const value = formatSpec(raw, column.unit ?? '');
      const className = value === '公式に明記なし' ? 'unknown' : 'num';
      return `<td class="${className}">${escapeHtml(value)}</td>`;
    })
    .join('');

  const note = product.note
    ? `\n          <tr class="note-row"><td class="row-note" colspan="${columns.length + 2}">${escapeHtml(
        product.note,
      )}</td></tr>`
    : '';

  const failed = verdict.results.find((result) => result.status !== FIT.OK);
  const detail = (failed ?? verdict.results[0])?.detail ?? '';
  return `          <tr data-product="${escapeHtml(product.name)}">
            <th scope="row">${name}</th>
            <td class="verdict ${verdict.status}">${STATUS_LABEL[verdict.status]}<span class="reason">${escapeHtml(
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
        <table id="products-table">
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
            <input type="number" id="filter-number-${index}" step="${input.step ?? 0.5}" min="${input.min}" max="${input.max}" value="${input.default}" />
          </label>`,
    )
    .join('\n');
  return `      <section>
        <h2>${escapeHtml(filter.heading)}</h2>
        <p class="small">${escapeHtml(filter.note)}</p>
        <form class="checker" id="filter">
${inputs}
          <label class="checkbox">
            <input type="checkbox" id="filter-flag" />${escapeHtml(flagInput.label)}
          </label>
        </form>
        <p class="small" id="filter-summary" aria-live="polite"></p>
      </section>`;
}

function renderSources(products, sources) {
  const items = products
    .filter((product) => product.source)
    .map((product) => `${product.name}：${product.source}`)
    .concat((sources ?? []).map((source) => `${source.label}：${source.url}`));
  return `      <section class="notes">
        <h3>仕様の出典</h3>
        ${list(items)}
      </section>`;
}

function renderArticle(article, config) {
  const products = verifiedProducts(article.products);
  const pending = article.products.length - products.length;
  const inputs = numberInputsOf(article.filter);
  const requirements = inputs.map((input) => ({
    key: input.key,
    type: input.type,
    value: input.default,
    unit: input.unit ?? '',
    label: input.label,
  }));
  // 初期表示の判定は「幅だけ」で行う（チェックボックスは既定でオフのため）。
  const initial = products.map((product) => evaluateProduct(product, requirements));

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
  <body>
    <header class="site-header">
      <div class="wrap">
        <p class="brand"><a href="../index.html">${escapeHtml(config.siteName)}</a></p>
        <p class="tagline">${escapeHtml(article.genre)}</p>
      </div>
    </header>

    <p class="disclosure">${escapeHtml(config.disclosure)}</p>

    <main class="wrap article">
      <h1>${escapeHtml(article.title)}</h1>
      <p class="lead">${escapeHtml(article.lead)}</p>

${renderExclusions(article.excludeReaders)}

      <section>
        <h2>結論</h2>
        <div class="verdict-box">
          ${article.conclusion.map((text) => `<p>${escapeHtml(text)}</p>`).join('\n          ')}
        </div>
      </section>

${renderSections(article.sections)}

${renderFilter(article.filter)}

      <section>
        <h2>比較表</h2>
        <p class="small">メーカー公式の仕様表で確認できた ${products.length} 件を掲載しています（${escapeHtml(
          article.asOf,
        )} 確認）。${pending > 0 ? `仕様を確認できなかった ${pending} 件は掲載していません。` : ''}</p>
${renderTable(products, article.columns, config, initial)}
        <p class="small">判定は「${escapeHtml(
          inputs.map((input) => `${input.label} ${input.default}`).join('』『'),
        )}」に対する結果です。${escapeHtml(article.verdictLegend ?? '○＝条件を満たす、△＝拡張パーツが必要、×＝満たさない、?＝公式に明記なし。')}</p>
      </section>

${renderSources(products, article.sources)}

      <section>
        <h2>次に困りそうなこと</h2>
        ${list(article.nextProblems)}
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

/** トップページ（記事一覧）を生成する。 */
function renderIndex(entries, config) {
  const cards = entries
    .map(
      (entry) => `        <article class="card">
          <p class="meta">
            <span class="badge">${escapeHtml(entry.genre)}</span>
            <span class="badge">紹介料率 ${escapeHtml(entry.commissionRate)}</span>
            <span class="badge">${escapeHtml(entry.asOf)} 確認</span>
          </p>
          <h2><a href="./articles/${escapeHtml(entry.slug)}.html">${escapeHtml(entry.title)}</a></h2>
          <p class="summary">${escapeHtml(entry.description)}</p>
          <p class="small">掲載 ${entry.productCount} 件（メーカー公式の仕様で確認したものだけ）</p>
        </article>`,
    )
    .join('\n');

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(config.siteName)}</title>
    <meta name="description" content="${escapeHtml(config.tagline)}" />
    <link rel="stylesheet" href="./assets/style.css" />
    <link rel="stylesheet" href="./assets/article.css" />
  </head>
  <body>
    <header class="site-header">
      <div class="wrap">
        <p class="brand">${escapeHtml(config.siteName)}</p>
        <p class="tagline">${escapeHtml(config.tagline)}</p>
        <nav class="nav"><a href="./tools/link.html">リンク作成ツール</a></nav>
      </div>
    </header>

    <p class="disclosure">${escapeHtml(config.disclosure)}</p>

    <main class="wrap">
      <section class="callout" aria-label="このサイトの方針">
        <h2>数値で比べられるものだけを扱います</h2>
        <ul>
          <li>スペックはメーカー公式または航空会社公式で確認した数値のみを掲載し、確認日と出典を残しています。</li>
          <li>確認できなかった商品は掲載しません（件数だけ表示します）。</li>
          <li>価格は掲載していません。変動するため、リンク先の Amazon.co.jp でご確認ください。</li>
        </ul>
      </section>

      <section class="grid" aria-label="記事一覧">
${cards}
      </section>

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

const configPath = fileURLToPath(new URL('site.config.json', root));
const config = JSON.parse(await readFile(configPath, 'utf8'));

const files = (await readdir(fileURLToPath(articlesDir))).filter((file) => file.endsWith('.json'));
const entries = [];

for (const file of files) {
  const article = JSON.parse(await readFile(fileURLToPath(new URL(file, articlesDir)), 'utf8'));
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

// 手書き記事（ビルダーの対象外）も一覧に混ぜる
const manual = JSON.parse(
  await readFile(fileURLToPath(new URL('data/article-list.json', root)), 'utf8'),
);
for (const entry of manual.articles) {
  entries.push({ ...entry, productCount: entry.productCount ?? 7 });
}

entries.sort((a, b) => Number.parseFloat(b.commissionRate) - Number.parseFloat(a.commissionRate));
await writeFile(fileURLToPath(new URL('index.html', root)), renderIndex(entries, config));
console.log(`生成: index.html （記事 ${entries.length} 件）`);
