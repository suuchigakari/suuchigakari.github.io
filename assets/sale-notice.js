// セールの帯を、終了日を過ぎたら隠す（ビルドし直す前の古いページ向け）。
for (const el of document.querySelectorAll('.sale-notice[data-end]')) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  if (today > el.dataset.end) el.hidden = true;
}
