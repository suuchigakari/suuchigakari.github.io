# 楽天ウェブサービス クレジット表示（要点メモ）

- 出典: https://webservice.rakuten.co.jp/guide/credit
- 取得日: 2026-11-24

> **注意**
> - これはページの文言どおりの転記ではありません。Webページ取得ツールが抜き出した要点です。
> - 画像URL・リンク先・サイズ・文言はページの表記どおりです。
> - **HTMLコードの原文は取得できていません。** スニペットは改変禁止なので、実際に貼るコードはページの「HTML source code」の欄からそのままコピーしてください。

## 表示の種類（どれか1つを表示）

| 種類 | サイズ | 画像URL（スニペット内の指定） | リンク先 |
|---|---|---|---|
| 小バナー | 221×21px | `https://webservice.rakuten.co.jp/img/credit/200709/credit_22121.gif` | `https://webservice.rakuten.co.jp/` |
| 大バナー | 311×30px | `https://webservice.rakuten.co.jp/img/credit/200709/credit_31130.gif` | `https://webservice.rakuten.co.jp/` |
| テキスト | — | （画像なし）文言「Supported by Rakuten Developers」 | `https://developers.rakuten.com/` |

- テキストだけ、リンク先がほかの2つと違う。
- ページ本文のプレビュー画像は `.../img/credit_22121.gif`・`.../img/credit_31130.gif` で、スニペット内の画像URLとはパスが違う。

## HTMLの構造（原文ではありません）

- **バナー（小・大で共通）**
  - `<a>` 要素で `<img>` 要素を囲む。リンクは `target="_blank"`（新しいタブで開く）。
  - `<img>` には画像URL、`border="0"`、同じ値の `alt` と `title`（"Rakuten Web Service Center"）、`width` と `height` を指定。
  - 前後に「Attribution Snippet」と書かれたHTMLコメントがある。
- **テキスト**
  - `<a href="https://developers.rakuten.com/" target="_blank">` で「Supported by Rakuten Developers」を囲む。

## 表示場所・表示のしかたの決まり

- 規約上、楽天のAPIを使うアプリでは、バッジによるクレジット表示が必須。
- HTMLスニペットは改変せずにそのまま使う。画像も加工しない。
- 楽天や楽天グループ企業の一部だと利用者に誤解させる表示は禁止。
- 楽天ウェブサービスを使っていないサイトやアプリには表示してはいけない。
- 表示位置は自由。ただし、利用者がそのサイトやアプリが楽天ウェブサービスを使っていると分かる形で表示する。
- スニペットや画像の改変など、要件に違反すると、APIへのアクセスが無効化されることがある。

## 関連
- 規約 第13条（クレジット表示）→「2_楽天ウェブサービス_規約.md」
