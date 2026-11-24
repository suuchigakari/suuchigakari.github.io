# Claude in Chrome への依頼（楽天の画像付き商品リンクを19商品分作る、2026-11-24）

楽天にログインした状態の Chrome で、以下を Claude in Chrome に貼ってください。

---

楽天アフィリエイト（https://affiliate.rakuten.co.jp/）の商品リンク作成で、下の19商品の「商品リンク」（画像とテキストのリンク）を作り、生成された HTML をそのまま教えてください。

やってよいこと・いけないこと：
- リンク作成の画面で設定を選び、HTML をコピーするところまでにしてください。購入・カートへの追加・登録情報の変更・サイト登録の変更などはしないでください。
- 生成された HTML は**1文字も変えずに**貼ってください。

設定（19商品すべて同じ）：
- リンクの種類：画像とテキストのもの（前回と同じ）
- 画像サイズ：64x64
- **商品名：表示しない**（前回は表示していたが、今回はオフ）
- 価格：表示しない
- コメント：表示しない
- 「楽天で購入する」ボタン：表示しない
- 枠：表示する

商品（商品ページの URL）：
1. https://item.rakuten.co.jp/keyuca/s10000191/
2. https://item.rakuten.co.jp/keyuca/3300236/
3. https://item.rakuten.co.jp/keyuca/3300582/
4. https://item.rakuten.co.jp/keyuca/s3300977/
5. https://item.rakuten.co.jp/keyuca/s10000245/
6. https://item.rakuten.co.jp/keyuca/4401776/
7. https://item.rakuten.co.jp/daiso-officialshop/sp0112/
8. https://item.rakuten.co.jp/nitori/8090788-/
9. https://item.rakuten.co.jp/nitori/2116100017904s/
10. https://item.rakuten.co.jp/nitori/2116100017911s/
11. https://item.rakuten.co.jp/nitori/8542047/
12. https://item.rakuten.co.jp/mujirushi-ryohin/4550584865374/
13. https://item.rakuten.co.jp/tomtoc/t66/
14. https://item.rakuten.co.jp/elecom/4549550396653/
15. https://item.rakuten.co.jp/libera-nihonikuji/5994006001/
16. https://item.rakuten.co.jp/low-ya/f502-g1024-100/
17. https://item.rakuten.co.jp/low-ya/xt9l2/
18. https://item.rakuten.co.jp/low-ya/vg-pieni/
19. https://item.rakuten.co.jp/low-ya/f502-g1022-100/

回答の形：
- 商品ごとに、番号と商品ページの URL を書き、その下に HTML をコードブロックで1つずつ貼ってください。
- 商品名をオフにできなかった、商品が見つからない、リンクが作れないなどの場合は、その番号にその旨を書いてください（推測で埋めないでください）。
- 長くなる場合は、Markdown のファイルにまとめてください。

---
