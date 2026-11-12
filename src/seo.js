/**
 * 検索エンジン・SNS 向けの <head> 内タグ（正規URL・OGP・構造化データ）。
 *
 * 画像は PA-API か公式ウィジェット経由でしか使えないため、og:image は出さない
 * （twitter:card も画像なしの summary）。
 */
import { escapeHtml } from './affiliate.js';

/** siteUrl（末尾スラッシュ付き）と相対パスから絶対URLを作る。 */
export function absoluteUrl(siteUrl, path = '') {
  return new URL(path, siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`).href;
}

/** JSON-LD を <script> に埋め込む。</script> で閉じないよう < をエスケープする。 */
function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`;
}

/** YYYY-MM-DD だけを日付として扱う（「2026-08」のような月だけの値は使わない）。 */
export function isoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') ? value : null;
}

function metaTags({ title, description, url, type, siteName }) {
  return [
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    '<meta property="og:locale" content="ja_JP" />',
    '<meta name="twitter:card" content="summary" />',
  ];
}

/** 記事ページの head タグ。dateModified は記事の確認日（asOf）。 */
export function articleSeo({ title, description, slug, asOf, config }) {
  const url = absoluteUrl(config.siteUrl, `articles/${slug}.html`);
  const home = absoluteUrl(config.siteUrl);
  const site = { '@type': 'Organization', name: config.siteName, url: home };
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    inLanguage: 'ja',
    mainEntityOfPage: url,
    author: site,
    publisher: site,
  };
  const modified = isoDate(asOf);
  if (modified) article.dateModified = modified;
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: config.siteName, item: home },
      { '@type': 'ListItem', position: 2, name: title, item: url },
    ],
  };
  return [
    ...metaTags({ title, description, url, type: 'article', siteName: config.siteName }),
    jsonLd(article),
    jsonLd(breadcrumb),
  ].join('\n    ');
}

/** トップページの head タグ。 */
export function homeSeo(config) {
  const url = absoluteUrl(config.siteUrl);
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteName,
    description: config.tagline,
    url,
    inLanguage: 'ja',
  };
  return [
    ...metaTags({ title: config.siteName, description: config.tagline, url, type: 'website', siteName: config.siteName }),
    jsonLd(website),
  ].join('\n    ');
}

/** ページ上部に出す「最終確認日」。機械可読な <time> で囲む。 */
export function lastCheckedFact(asOf) {
  const date = isoDate(asOf);
  if (!date) return `<li>最終確認 <strong>${escapeHtml(asOf ?? '')}</strong></li>`;
  return `<li>最終確認 <strong><time datetime="${date}">${date}</time></strong></li>`;
}
