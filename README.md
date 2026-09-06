# Amazon アフィリエイト サイト & リンク作成ツール

Amazon アソシエイト向けの、**商品紹介サイト**と**アフィリエイトリンク作成ツール**の一式です。
ビルド不要・依存パッケージゼロ（Node.js 20 以上、静的ファイルのみ）で動きます。

## できること

- `data/products.json` に商品を書くだけで、比較サイトが生成される（検索 / カテゴリ絞り込み / 並び替え / 比較表）
- 商品リンクは表示時に `?tag=` 付きで生成されるので、タグ変更は `site.config.json` の 1 か所だけ
- 商品ページ URL を貼るだけで、追跡パラメータを落とした最短形リンク（HTML / Markdown 付き）を作れるツール
- リンク生成ロジックは単体テスト付きのライブラリ（`src/affiliate.js`）として独立

## 使い方

```bash
npm start          # http://localhost:8000/ で表示
npm test           # リンク生成ロジックのテスト
```

ES モジュールを `fetch` で読み込むため、`index.html` を `file://` で直接開くと動きません。必ず `npm start` 経由で開いてください。

### 1. アソシエイトタグを設定する

`site.config.json` の `associateTag` を自分のトラッキング ID（例: `yourname-22`）に変更します。
サンプルのままだとページ上部に警告が出ます。

```json
{
  "siteName": "サイト名",
  "associateTag": "yourname-22",
  "marketplace": "amazon.co.jp",
  "ctaLabel": "Amazonで価格を見る"
}
```

### 2. 商品を追加する

`data/products.json` に追記します（同梱データはすべてサンプルです。公開前に差し替えてください）。

```json
{
  "asin": "B0XXXXXXXX",
  "name": "商品名",
  "category": "カテゴリ",
  "brand": "メーカー",
  "priceRange": "1万円台",
  "score": 4.5,
  "summary": "実際に使った感想",
  "pros": ["良い点"],
  "cons": ["気になる点"],
  "specs": { "接続": "有線" },
  "recommendedFor": "向いている人"
}
```

`asin` 以外は任意です。`specs` のキーはそのまま比較表の行になります。

### 3. リンクを作る

`tools/link.html`（サイト右上「リンク作成ツール」）に商品ページ URL か ASIN を貼ると、

- `https://www.amazon.co.jp/dp/B0XXXXXXXX?tag=yourname-22`
- `<a href="..." rel="nofollow sponsored noopener">…</a>`
- `[…](…)`（Markdown）

を出力します。複数行をまとめて変換できます。

## 構成

| パス | 役割 |
| --- | --- |
| `src/affiliate.js` | ASIN 抽出・リンク生成のライブラリ（ブラウザ / Node 共用） |
| `assets/app.js` | 商品一覧・絞り込み・比較表の描画 |
| `index.html` / `assets/style.css` | サイト本体（ライト / ダーク対応） |
| `tools/link.html` | リンク作成ツール |
| `site.config.json` | サイト名・タグ・開示文などの設定 |
| `data/products.json` | 商品データ |
| `test/affiliate.test.mjs` | 単体テスト（`node --test`） |
| `scripts/serve.mjs` | 依存なしの開発用静的サーバ |

## リンク生成の仕様

- 対応 URL 形式: `/dp/`, `/gp/product/`, `/gp/aw/d/`, `/gp/offer-listing/`, `/exec/obidos/ASIN/`, `?ASIN=`、および ASIN 単体
- `www.` / `smile.` / `m.` の有無、スキームの省略を許容
- 出力は `https://www.{ドメイン}/dp/{ASIN}?tag={タグ}` の最小形。`ref=`, `qid`, `pd_rd_*`, 他人の `tag` などは**引き継がない**
- 短縮 URL（`amzn.to` / `amzn.asia`）はオフラインで展開できないため、専用のエラーで案内する
- 対応マーケットプレイス: 日本・米国・英国・独・仏・伊・西・加・豪・印

## 運用上の注意（重要）

- **開示表記**: Amazon アソシエイト・プログラムの規約上、「Amazon のアソシエイトとして適格販売により収入を得ています」に相当する表示が必要です。`site.config.json` の `disclosure` がヘッダーとフッターに表示されます。
- **ステマ規制（景品表示法）**: 広告であることが分かる表示（例: 「PR」「広告」）を、読者が認識できる位置に置いてください。
- **価格の表示**: 価格・在庫は変動し、規約上も PA-API 以外の手段で取得した価格の掲載は制限されます。本サイトは価格を直接掲載せず「価格帯」と注記のみを表示します。
- **商品画像**: Amazon の商品画像は PA-API または公式ウィジェット経由でのみ利用できます。画像をローカルに保存して貼り付けないでください。
- **リンク属性**: 生成されるリンクには `rel="nofollow sponsored"` が付きます。手書きでリンクを足す場合も同じ属性を付けてください。

## 今後の拡張候補

- PA-API v5 連携（商品名・画像・価格の自動取得。アクセスキーと直近の売上実績が必要）
- 記事ページ（1 商品 1 レビュー）の追加と、カテゴリ別ランキングページ
- クリック計測（`?tag=` とは別に、内部イベントで CTA のクリック率を計測）
