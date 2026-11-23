# Claude in Chrome への依頼（楽天ウェブサービスの規約と商品検索APIの仕様の転記、2026-11-23）

楽天ウェブサービスのサイト（webservice.rakuten.co.jp）は、Claude の作業環境からは 503 で読めなかったため、運営者のブラウザで転記してもらう。

以下を Claude in Chrome に貼ってください。

---

楽天ウェブサービスの次のページを開き、指定した部分を**ページの文言のまま**転記してください。要約や言い換えはしないでください。ページを読むだけにし、ログイン・アプリ登録・フォーム送信などの操作はしないでください。

1. 規約：https://webservice.rakuten.co.jp/guide/rule
   - 規約の本文すべて（長い場合は、「クレジット」「画像」「保存」「キャッシュ」「価格」「更新」「禁止」を含む条項を優先し、条番号付きで転記）
2. クレジット表示：https://webservice.rakuten.co.jp/guide/credit
   - 表示しなければならない文言・HTML・画像と、表示する場所の決まり
3. 楽天市場商品検索API：https://webservice.rakuten.co.jp/documentation/ichiba-item-search
   - リクエスト URL（バージョンを含む）
   - 必須パラメータ（applicationId のほか、accessKey など必要なもの）と、その渡し方（URL のパラメータか、ヘッダーか）
   - itemCode（「店舗:商品」の形）で1商品を指定する方法
   - 画像の URL が入る項目（smallImageUrls・mediumImageUrls など）と、画像サイズの説明
   - affiliateId を渡したときの affiliateUrl の説明
   - 在庫・販売状態を表す項目（availability など）
   - 呼び出し回数の制限（1秒あたりの回数など）

ページが開けない・見つからないときは、その旨を書いてください。推測で埋めないでください。

---
