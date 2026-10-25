/**
 * Amazon のセールの開催期間の帯。
 *
 * site.config.json の saleNotice に、Amazon 公式の告知で確かめた期間だけを書く。
 * 価格・割引率・対象商品は書かない（価格は掲載しない方針のため）。
 * 終了日を過ぎたら、ビルドで帯を出さない。ビルドし直す前の古いページは
 * assets/sale-notice.js が閲覧時に隠す。
 */
import { escapeHtml } from './affiliate.js';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 今日（YYYY-MM-DD、ローカル時刻）。 */
export function todayIso(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** 表示してよいセール情報を返す。設定が欠けている・終了日を過ぎたものは null。 */
export function activeSaleNotice(notice, today) {
  if (!notice) return null;
  const { name, start, end, source, checkedOn } = notice;
  if (!name || !source || ![start, end, checkedOn].every((d) => DATE.test(d ?? ''))) return null;
  if (start > end || today > end) return null;
  return notice;
}

/** 「2026-11-20」→「11月20日」 */
function monthDay(iso) {
  const [, m, d] = iso.split('-');
  return `${Number(m)}月${Number(d)}日`;
}

/** 帯の文言。 */
export function saleNoticeText(notice) {
  return `${notice.name}：${monthDay(notice.start)}〜${monthDay(notice.end)}（Amazon 公式の告知による、${notice.checkedOn} 確認）。セール期間中は価格が変わることがあります。購入前に Amazon の商品ページで確認してください。`;
}

/** 帯の HTML（先頭に改行を含む）。表示しない場合は空文字。scriptPath は sale-notice.js への相対パス。 */
export function renderSaleNotice(notice, today, scriptPath) {
  const active = activeSaleNotice(notice, today);
  if (!active) return '';
  return `\n    <p class="sale-notice" data-end="${escapeHtml(active.end)}">${escapeHtml(saleNoticeText(active))}</p>
    <script src="${escapeHtml(scriptPath)}" defer></script>`;
}
