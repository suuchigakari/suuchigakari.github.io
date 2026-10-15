# Amazon アフィリエイト サイト & リンク作成ツール

Amazon アソシエイト向けの、**商品紹介サイト**と**アフィリエイトリンク作成ツール**の一式です。
ビルド不要・依存パッケージゼロ（Node.js 20 以上、静的ファイルのみ）で動きます。

## できること

- `data/articles/*.json` に書いた記事から、静的な記事HTMLとトップページを生成
- 商品リンクは `?tag=` 付きで生成されるので、タグ変更は `site.config.json` の 1 か所だけ
- 商品ページ URL を貼るだけで、追跡パラメータを落とした最短形リンク（HTML / Markdown 付き）を作れるツール
- **機内持ち込みキャリーケースの適合判定**：外寸と本体重量から、LCC 9 社への可否・各辺の余裕・中身に使える重量を自動計算（`src/luggage.js`）
- ジャンル選定の調査結果（31ジャンル・紹介料率・Tier 評価）は `docs/` に格納。運用ルールは `CLAUDE.md`

## ジャンル選定と記事

| ドキュメント | 内容 |
|---|---|
| `docs/amazon_hikaku_master_list_v2.md` | マスターリスト（31ジャンル・料率・Tier S〜E）。**ジャンルの判断はこれが正** |
| `docs/lcc_carrycase_article_plan.md` | Tier S「キャリーケース」（料率8%）の記事構成案 |
| `articles/lcc-carrycase.html` | 上記構成案の実装。規定早見表・両立不可の説明・判定ツール・比較表を生成 |

記事の核である「ピーチ可 / ジェットスター可」の判定列は、手作業の○×ではなく `data/airlines.json` の規定から自動計算します。規定を書き換えれば、結論の推奨サイズ（現在 50 × 36 × 23cm）も比較表も追随します。

## 使い方

```bash
npm run build      # data/articles/*.json から記事HTMLとトップページを生成
npm start          # 生成してから http://localhost:8000/ で表示
npm test           # 判定ロジックのテスト
```

### 記事を追加する

1. `data/articles/<slug>.json` を作る（リード文・外す人・結論・本文・比較表の列・商品データ）
2. 商品の仕様はメーカー公式で確認し、`verified: true` と `source`（URL＋確認日）を書く。確認できないものは `verified: false` のままにする（表に出ない）
3. `npm run build` で `articles/<slug>.html` と `index.html` を生成し、生成物ごとコミットする

本文も比較表も静的HTMLとして出力されるので、JavaScript を切っても読めます。絞り込みだけが `assets/article-filter.js` による付加機能です。

## 公開する（Amazonアソシエイト申請の前提）

アソシエイトの申請には、**誰でも閲覧できる状態のサイト**が必要です。GitHub Pages で公開する場合：

1. リポジトリの Settings → Pages → Source を **GitHub Actions** に変更する
2. `main` に push すると `.github/workflows/pages.yml` がテストを実行し、静的ファイルをそのまま公開する
3. 発行された URL を申請フォームに入力する

申請の要件と手順は `docs/associate_application_checklist.md` にまとめてあります。

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
| `CLAUDE.md` | 運用ルール（料率の扱い、数値の裏取り、開示表記、リライト期限） |
| `pages/about.html` / `pages/privacy.html` | 運営者情報・プライバシーポリシー（申請前に連絡先の記入が必要） |
| `docs/associate_application_checklist.md` | アソシエイト申請の要件と手順 |
| `docs/` | ジャンル選定の調査結果と記事構成案 |
| `src/affiliate.js` | ASIN 抽出・リンク生成のライブラリ（ブラウザ / Node 共用） |
| `src/luggage.js` | 機内持ち込み規定の適合判定（各辺・3辺合計・重量） |
| `templates/lcc-carrycase.html` / `src/lcc-render.js` | LCC 対応キャリーケース記事の本文テンプレートと、結論・表の描画（ビルドで `articles/lcc-carrycase.html` を生成） |
| `data/airlines.json` | 航空会社別の機内持ち込み規定（確認日・根拠つき） |
| `data/luggage-products.json` | 記事用の商品データ（外寸を裏取りしたものだけ掲載される） |
| `scripts/build-articles.mjs` | 記事HTML・トップページの生成 |
| `src/fit.js` | 記事共通の適合判定（レンジ・拡張パーツ・フラグ） |
| `assets/article-filter.js` | 生成された比較表の絞り込み（付加機能） |
| `index.html` / `assets/style.css` | サイト本体（生成物・ライト / ダーク対応） |
| `tools/link.html` | リンク作成ツール |
| `site.config.json` | サイト名・タグ・開示文などの設定 |
| `test/*.test.mjs` | 単体テスト（`node --test`、27件） |
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

## キャリーケース記事のデータ運用

`data/luggage-products.json` の商品は、**外寸を一次情報で確認したものだけ**が比較表に載ります。

```json
{
  "asin": "B0XXXXXXXX",
  "name": "商品名",
  "type": "ハード",
  "heightCm": 50, "widthCm": 36, "depthCm": 23,
  "weightKg": 2.4, "capacityL": 34,
  "dimensionsVerified": true,
  "dimensionSource": "メーカー公式 https://… （2026-09-06 確認）"
}
```

- `dimensionsVerified` が `false`、または寸法が `null` の商品は表に出ず、「外寸が未確認のため未掲載」として件数だけ表示されます
- 寸法はキャスター・ハンドル・前面ポケットを**含んだ**外寸を入れてください。通販の「本体サイズ」表記は含まないことがあります
- 規定を更新するときは `data/airlines.json` の `asOf` と根拠（`sidesConfidence`）も更新してください
- `dimensionSource` は記事末尾に「サイズの出典」として自動で並びます。空欄にしないでください
- 現在の掲載はレジェンドウォーカー(T&S)公式の仕様表で確認した7台のみです。サンコー鞄・無印良品・アジアラゲージの公式サイトは自動取得を拒否したため、手動で確認して追加してください（`data/luggage-products.json` の `todo` 参照）

## 今後の拡張候補

- PA-API v5 連携（商品名・画像・価格の自動取得。アクセスキーと直近の売上実績が必要）
- Tier A ジャンル（ベビーゲート・クーラーボックス・寝袋・アウトドアチェア・LEDランタン／いずれも料率4%）の記事化
- ラゲッジスケール記事（キャリーケース記事からの内部リンク先）
- クリック計測（`?tag=` とは別に、内部イベントで CTA のクリック率を計測）
