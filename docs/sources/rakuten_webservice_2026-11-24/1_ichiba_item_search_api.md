# 楽天市場商品検索API（Ichiba Item Search）要点メモ

- 出典: https://webservice.rakuten.co.jp/documentation/ichiba-item-search
- 取得日: 2026-11-24
- バージョン: 2026-07-01

> **注意**
> - これはページの文言どおりの転記ではありません。Webページ取得ツールが抜き出した要点です。
> - URL・パラメータ名・項目名・数値はページの表記どおりです。

## リクエストURL

```
https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701?[parameter]=[value]…
```

## 必須パラメータと渡し方

| パラメータ | 必須 | 渡し方・説明 |
|---|---|---|
| `applicationId` | 必須 | アプリID。`accessKey` と一緒に指定する。 |
| `accessKey` | 必須（新規追加） | **ヘッダーとクエリパラメータのどちらでも指定できる。** `applicationId` と一緒に指定する。 |
| `keyword` / `shopCode` / `itemCode` / `genreId` | いずれか1つが必須 | — |

- `keyword` と `sort` は UTF-8 で URL エンコードする。エンコードするのは値の部分だけで、リクエスト全体ではない。

## itemCode で1商品を指定する

- 形式: `shop:1234`（「店舗:商品」の形）
- Item Search API や Item Ranking API の出力に含まれる値を使う。

例（形式の説明用。値は仮）:

```
https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701?applicationId=xxxx&accessKey=xxxx&itemCode=shop:1234
```

## 画像URLの項目

| 項目 | サイズ | 内容 |
|---|---|---|
| `smallImageUrls` | 64×64 ピクセル | 画像URLを最大3件、配列で返す |
| `mediumImageUrls` | 128×128 ピクセル | 画像URLを最大3件、配列で返す |

- どちらも https で始まるURL。

## affiliateUrl

- 入力パラメータに `affiliateId` を含めたときだけ返る。
- `carrier` の値に関係なく返る。
- https で始まるURL。
- `affiliateId` を含めると、`itemUrl` と `shopUrl` もアフィリエイトURLと同じ値になる（2015/7/1以降）。

## 在庫の項目（availability）

| 種類 | 値 | 意味 |
|---|---|---|
| 出力 | 0 | 在庫切れ |
| 出力 | 1 | 在庫あり |
| 入力パラメータ | 0 | 全商品が対象 |
| 入力パラメータ | 1 | 在庫ありの商品だけが対象（**デフォルト**） |

## 呼び出し回数の制限

- **1秒あたり何回といった具体的な数値は、ページから見つからなかった。**
- 同じURLへのアクセスが短時間に多いと、一定時間応答しなくなることがある。
- リクエスト数の上限を超えると **429エラー** が返る（エラーメッセージ: "number of allowed requests has been exceeded for this API."）。
