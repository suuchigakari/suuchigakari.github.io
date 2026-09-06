/** 固定ページ共通の描画（開示文・フッター・サイト名）。 */
const el = (id) => document.getElementById(id);

const response = await fetch('../site.config.json', { cache: 'no-cache' });
const config = await response.json();

for (const id of ['disclosure', 'footer-disclosure']) {
  const node = el(id);
  if (node) node.textContent = config.disclosure ?? '';
}
el('year').textContent = String(new Date().getFullYear());
for (const node of document.querySelectorAll('.footer-name')) node.textContent = config.siteName;
for (const node of document.querySelectorAll('.site-name')) node.textContent = config.siteName;
