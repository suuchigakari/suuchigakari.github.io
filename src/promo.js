/**
 * Amazon の特別プログラム（Audible など）の PR 枠。
 *
 * 文面は data/promos.json に、公式ページで確かめた事実だけを書く（料金は書かない）。
 * 出すのは articles に挙げた記事だけで、リンクに自分のトラッキング ID が付いていないものは出さない。
 */
import { escapeHtml } from './affiliate.js';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 記事に出してよい PR 枠を返す。設定が欠けているものは出さない。 */
export function promosFor(slug, promos, tag) {
  return (promos ?? []).filter(
    (promo) =>
      (promo.articles ?? []).includes(slug) &&
      typeof promo.url === 'string' &&
      promo.url.startsWith('https://www.amazon.co.jp/') &&
      new URL(promo.url).searchParams.get('tag') === tag &&
      DATE.test(promo.checkedOn ?? '') &&
      Boolean(promo.source) &&
      (promo.body ?? []).length > 0,
  );
}

/** PR 枠の HTML。出すものがなければ空文字。 */
export function renderPromos(slug, promos, tag) {
  const items = promosFor(slug, promos, tag);
  if (items.length === 0) return '';
  return items
    .map(
      (promo) => `      <aside class="promo" aria-label="広告">
        <p class="promo-label">PR</p>
        <h2>${escapeHtml(promo.title)}</h2>
        ${promo.body.map((text) => `<p>${escapeHtml(text)}</p>`).join('\n        ')}
        <p><a class="cta-small" href="${escapeHtml(promo.url)}" target="_blank" rel="nofollow sponsored noopener">${escapeHtml(promo.cta)}</a></p>
        <p class="small">出典：${escapeHtml(promo.source)}（${escapeHtml(promo.checkedOn)} 確認）。条件は変わることがあります。登録前に公式ページで確認してください。</p>
      </aside>`,
    )
    .join('\n\n');
}
