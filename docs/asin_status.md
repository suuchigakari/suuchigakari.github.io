# ASIN の設定状況

最終確認: 2026-10-19（2回目）。記事データ（`data/articles/*.json`）とキャリーケースのデータ（`data/luggage-products.json`）の `asin` 欄。

## 決め方

- Amazon.co.jp を**お届け先=日本**（郵便番号100-0001）に設定した状態で検索する。お届け先が海外だと国内専用の商品が検索結果から消える
- 商品ページで「ブランド」と「型番欄（型番・メーカー型番・品番）またはタイトル」の両方が一致したものだけ採用する
- 対応ケース・ケーブル・マウントなどのアクセサリー、まとめ買いセットは採用しない
- 色違いは代表の1色（検索で最初に一致したもの）。記事の仕様は型番単位なので、色で仕様は変わらない前提
- 検索結果に出るのが親の出品（色・サイズ違いをまとめたもの）のときは、バリエーションの子 ASIN を開き、子の「メーカー型番」で一致を確かめる（例：CSシャルマンの UE-88 / UE-87、エクスプローラーの EX-036D は子 ASIN で見つかった）
- 型番で見つからないときは、メーカー公式に載っている JAN コード（13桁）で検索する。量販店の出品はタイトルや型番欄に自社の管理番号を入れていることがあり、JAN でしか当たらない（例：KS-825 はコジマの出品で型番欄が B8115538）
- 最後に人の目でタイトル全文を確認する。型番が一致しても旧型・別バリエーションのことがある（例：バロウバッグ #5 の旧型）

## 未設定（22件）

バイク用ETC（3件）は記事ごと削除した（2026-10-19）。

| 記事 | 商品 | 理由 |
|---|---|---|
| pressure-cooker | ワンダーシェフ オースプラス 5.0L（BODB50） | 2026-10-21 の点検で、設定していた B01AUM4THC が「現在お取り扱いできません」。BODB50 の別の出品（JAN 4970840670076 / 670106）も見つからずリンクを外した |
| lcc-backpack | キャビンゼロ クラシック 44L | Amazon の44Lの出品は外寸が55×40×20cmと書かれており、公式の現行仕様（51×36×18cm）と一致しない |
| lcc-backpack | tomtoc Navigator-T66 40L（T66M1D1） | 単品の出品は軽量版（Liteway、T66M1D2）で、公式に外寸・重量の記載がない。T66M1D1 は2個セットの出品のみ |
| baby-gate | 日本育児 ベビーズゲイト | 検索で出るのは別製品（ベビーズゲイト ローステップtype）と専用拡張パネルのみ |
| luggage-scale | ナカバヤシ ラゲッジスケール グリップタイプ MBL-06BK | 型番・ブランドが一致する出品が検索結果に見つからない |
| luggage-scale | ナカバヤシ 超小型ラゲッジスケール MBL-08BK | 型番・ブランドが一致する出品が検索結果に見つからない |
| mobile-battery | エレコム DE-C76-10000WH（10000mAh/22.5W） | 型番・ブランドが一致する出品が検索結果に見つからない |
| mobile-battery | Anker Power Bank (10000mAh, 30W)（A1256） | 出たのは Zolo・Fusion・20000mAh など別型番 |
| monitor-arm | サンワサプライ CR-24（クランプ固定式） | ブランド一致の出品は多いが CR-24 がない |
| outdoor-chair | キャプテンスタッグ エクスギア ロースタイル リクライニングチェア（UC-1502） | 型番・ブランドが一致する出品が検索結果に見つからない |
| pressure-cooker | ワンダーシェフ カルーナ 3.0L（640758） | 型番・ブランドが一致する出品が検索結果に見つからない |
| pressure-cooker | ワンダーシェフ フルーム 片手圧力鍋 3.0L（YCSA30F） | 出たのは別シリーズ（エリユム YCSA30E） |
| pressure-cooker | ワンダーシェフ フルーム 片手圧力鍋 4.0L（YCSA40F） | 型番・ブランドが一致する出品が検索結果に見つからない |
| sleeping-bag | モンベル シームレス バロウバッグ #5 | 出たのは #0（1121423）と旧型 #5（非シームレス、1121274）。品番 1121427 では0件 |
| dust-mask | トーヨー No.1709-C／No.1709 | 品番で検索しても出品が見つからない（2026-10-24） |
| dust-mask | トーヨー No.1717／No.1717-A | 品番で検索しても出品が見つからない（2026-10-24） |
| dust-mask | トーヨー No.1795（N95） | 品番で検索しても出品が見つからない（2026-10-24） |
| dust-mask | トーヨー No.1550（塵埃用） | 品番で検索しても出品が見つからない（2026-10-24） |
| dust-mask | 山本光学 3200V-A | 品番で検索しても出品が見つからない（2026-10-24） |
| dust-mask | 山本光学 3700-A | 品番で検索しても出品が見つからない（2026-10-24） |
| safety-glasses | 山本光学 SN-900 | 本体の出品が見つからない。出たのはスペアレンズ（B08WRQDFMT）だけ（2026-10-24） |
| work-helmet | 谷沢製作所 ST#1830-JZⅡ | 見つかった出品（B09QHRHV4F）はブランド欄が「ノーブランド品」で、谷沢製作所はメーカー名だけ。ブランドが一致しないため採用しない（2026-10-23） |

## 2026-10-19 に追加した13件

| 記事 | 商品 | ASIN | 確認した点 |
|---|---|---|---|
| luggage | レジェンドウォーカー 5122-48 SS | B0B7M1YXQ6 | 子 ASIN（SS／バイオレット）。メーカー型番 5122-48 VL |
| baby-gate | 日本育児 スマートゲイトⅡ | B004EHLS3S | タイトル「スマートゲイトII」（プラスではない）。型番 001710 |
| baby-gate | 日本育児 シーズフリー ローステップゲイト | B09P4WD7RK | メーカー名 日本育児。幅69×高さ73.5cm・4.5kg が記事の仕様と一致 |
| cooler-box | キャプテンスタッグ シャルマン 25（UE-88） | B0BYS5LKQJ | 子 ASIN（ベージュ／25L）。メーカー型番 UE-88 |
| cooler-box | キャプテンスタッグ シャルマン 14（UE-87） | B0BYRLL1WP | 子 ASIN（ベージュ／14L）。メーカー型番 UE-87 |
| cooler-box | コールマン エクストリームクーラー/28QT | B09HBVWH68 | 子 ASIN（ホイール無し／28QT）。メーカー型番 2000037321（公式ページの商品コードと一致） |
| food-container | ジップロック コンテナー 長方形 480ml | B074H7H7PW | ブランド Ziploc の通常品（2個入＝店頭と同じ入数）。2026-10-19 時点で出品者なし |
| kitchen-scale | ドリテック KS-834 | B0C9SPQWTF | メーカー型番 KS-834WT |
| led-lantern | コールマン クアッドマルチパネルランタンplus | B0DMVCXD39 | 型番 2218364（公式ページの商品コードと一致） |
| led-lantern | ジェントス EX-036D | B07PC3NYSR | 子 ASIN。型番 EX-036D（単品。電池セットではない）。2026-10-19 時点で一時的に在庫切れ |
| outdoor-chair | コールマン ヒーリングチェアNX | B0BJKDHPZJ | 型番 2190857（公式ページの商品コードと一致。Amazon上の名称は「ヒーリングチェアネクスト」） |
| pressure-cooker | ワンダーシェフ オースプラス 3.5L | B01BXV6ZYO | 品番 670014＝公式の BODB35-BK |
| pressure-cooker | ワンダーシェフ オースプラス 5.0L | B01AUM4THC | JAN 4970840670076＝公式品番 670076（BODB50-BK） |

## 2026-10-19（2回目）に追加した3件

| 記事 | 商品 | ASIN | 確認した点 |
|---|---|---|---|
| food-container | ジップロック コンテナー 長方形 1,100ml | B01B61J7Y6 | 「長方形 1100ml 1個入」の単品。Amazon.co.jp 販売 |
| kitchen-scale | ドリテック ブロート KS-825 | B0CDWWH61V | 公式の JAN（KS-825WT：4536117038323）で検索して唯一ヒット。タイトル「ブロート 3kg」。型番欄は販売店（コジマ）の管理番号 B8115538 |
| pressure-cooker | ワンダーシェフ フルーム 両手 5.5L | B0H5JW7XLZ | 公式の JAN 4970840630667 で検索してヒット。品番 YCDA55F、幅36cm が公式（360mm）と一致。容量欄の「3.6L」は出品側の誤記とみられる（記事は公式の数値を使う） |

2回目は、残っていた17件をメーカー公式の JAN コードと別の検索語でも探した。上の3件以外は見つからなかった。

## 2026-10-23 安全靴・セーフティスニーカー（safety-sneaker）に設定した28件

運営者が Claude in Chrome で確認（お届け先＝日本）。全件の記録は `docs/sources/safety_shoes_amazon_2026-10-23.csv`。

- 採用した28件は、すべてカテゴリが「ファッション › メンズ › シューズ › 安全靴・作業靴」（紹介料率 8%）
- 同じ型番でも、カテゴリが「ファッション › … › スポーツ › ゴルフ」（アシックス CP306 BOA の B0BN62B8YY）や「アウトドア › ハイキング・トレッキングシューズ」（タルテックス AZ-51649 の B07QVNDZV8、AZ-51651 の B07R22BJCM）の子 ASIN がある。採用しない
- アシックスは同じ製品名で品番違いの出品がある（CP306 BOA：公式 1273A029 のほか 1273A087・MAGMA 1273A060、CP304 BOA：MARBLE 1273A053）。公式で仕様を確認した品番の出品を採用
- 静電タイプ（G4690 静電・8918 静電など）は別品番のため採用しない。タルテックス AZ-51622 は製品自体が「耐油・静電」
- シモン NS911・SC217T（厨房向け）は掲載しない（NS911 は出品なし）

| 記事 | 商品 | ASIN | 確認した点 |
|---|---|---|---|
| safety-sneaker | アシックス CP229 BOA | B0F6MXLPZP | 型番 1273A123 |
| safety-sneaker | アシックス CP306 BOA | B081JRB4LS | 型番 1273A029 |
| safety-sneaker | アシックス CP304 BOA | B0957NN86Y | 型番・メーカー型番 1271A030 |
| safety-sneaker | アシックス CP221 | B0DPWRXWPX | 型番 1273A118 |
| safety-sneaker | アシックス CP112 | B0957N8HC5 | 型番 1273A056 |
| safety-sneaker | アシックス CP120 | B0BN61LWCG | 型番・メーカー型番 1273A062 |
| safety-sneaker | ミズノ オールマイティ LSⅡ 11L | B08NPNNH7T | 型番 F1GA2100 |
| safety-sneaker | ミズノ オールマイティ LSⅢ 11L | B0G76XH8N7 | 型番 F1GA2600 |
| safety-sneaker | ミズノ オールマイティ LSⅢ 53L BOA | B0G772CSHM | 型番 F1GA2602 |
| safety-sneaker | ミズノ オールマイティ LC 11L | B0H65LJT8Y | 型番 f1ga261014。タイトルに「SOLVステッカー付」 |
| safety-sneaker | ミドリ安全 G3690 | B003XDWRFC | 型番・メーカー型番 G3690 |
| safety-sneaker | ミドリ安全 G4690 | B0DDK1DH31 | 型番 G4690 |
| safety-sneaker | ミドリ安全 G4695 | B0DDK138CW | 型番 G4695 |
| safety-sneaker | ミドリ安全 G4590 | B0DNM6L3KJ | 型番 G4590 |
| safety-sneaker | ミドリ安全 G4550 | B0DNM5RWXN | 型番 G4550 |
| safety-sneaker | ミドリ安全 PF-110 | B00CR4EHS8 | メーカー型番 PF-110-BK-27.0 |
| safety-sneaker | ミドリ安全 PF-117Boa | B07SVGXDBY | 型番 PF-117 Boa |
| safety-sneaker | シモン KN717 | B0D8PNV5TS | メーカー型番 KN717、型番欄 2313930（公式の製品コードと一致） |
| safety-sneaker | シモン KN117 | B0CGDGCRCW | 型番 KN117 ブラック |
| safety-sneaker | シモン KN111 | B0CGDCNRYW | 型番 KN111 ブラック |
| safety-sneaker | シモン KN118 | B0CGDBW62H | 型番 KN118 ブラック |
| safety-sneaker | シモン LA12 | B0G38HFZB3 | 型番欄 1190000（公式の製品コードと一致）、タイトルに LA12 |
| safety-sneaker | シモン 8911 | B096FLYJL4 | 型番 8911 |
| safety-sneaker | シモン 8918 | B096FLT2FP | 型番 8918 |
| safety-sneaker | シモン SL12RE | B0DZ5KLL76 | 型番欄 1709361（公式の製品コードと一致）、タイトルに SL12RE |
| safety-sneaker | タルテックス AZ-51622 | B004OCQI92 | 型番 AZ-51622 |
| safety-sneaker | タルテックス AZ-51649 | B073GZ7TS7 | 型番 AZ51649-010-24.5 |
| safety-sneaker | タルテックス AZ-51651 | B07873TBKL | 型番 51651 |

## 2026-10-23 ニューバランス5件（safety-sneaker）

運営者が Claude in Chrome で確認（お届け先＝日本）。記録は `docs/sources/safety_shoes_newbalance_amazon_2026-10-23.csv`。5件ともカテゴリは「ファッション › メンズ › シューズ › 安全靴・作業靴」（8%）。

- PO-221 以外は、型番欄が「PL-」「BS-」「NY-」「HB-」とシリーズ名だけで、色番号（331・118 など）はバリエーションの色名にだけ出る。ニューバランスの品番は「シリーズ＋色番号」で、カタログの仕様はシリーズ単位で共通のため、ブランド＋シリーズ名の一致と色名の色番号で採用した
- 開いた子 ASIN と、登録情報欄の ASIN 表記が違う（例：PL-331 は B0BZBRFD28 を開いて、登録情報は B0F3HVG1J6）。記事には開いた子 ASIN を使った
- 出品タイトルの「ハイカット」「面ファスナー」「ベルクロ」はカタログの仕様欄にないため、記事には書かない

| 記事 | 商品 | ASIN | 確認した点 |
|---|---|---|---|
| safety-sneaker | ニューバランス ポートランド PL-331 | B0BZBRFD28 | 子（26.0cm 3E・色 331）。型番欄「PL-」 |
| safety-sneaker | ニューバランス ボストン BS-118 | B0BZBLFWNZ | 子（26.0cm 3E・色 118）。型番欄「BS-」 |
| safety-sneaker | ニューバランス ニューヨーク NY-282 | B0BZBKSK2F | 子（26.0cm 3E・色 282）。型番欄「NY-」 |
| safety-sneaker | ニューバランス ポーツマス PO-221 | B0DHH1VFCW | 子（26.0cm 3E・色 221）。型番欄・メーカー型番 PO-221 で一致 |
| safety-sneaker | ニューバランス ハリスバーグ HB-114 | B0F73ZRK8B | 子（26.0cm 3E・色 114）。型番欄「HB-」 |

## 2026-10-23 作業用ヘルメット（work-helmet）に設定した16件

運営者が Claude in Chrome で確認（お届け先＝日本）。記録は `docs/sources/helmet_amazon_2026-10-23.csv`。

- 15件はカテゴリが「産業・研究開発用品 › 安全・保護用品 › ヘルメット」（紹介料率 4.00%。Amazon アソシエイトの紹介料率表で確認）
- トーヨー No.80（ケーボー）は「ドラッグストア › シニアサポート・介護 › … › 頭部ヘッドカバー」の出品（5.00%）と「産業・研究開発用品」の出品がある。型番欄が NO.80 と一致する B0HJWNXWCQ（ドラッグストア）を採用。産業・研究開発用品の B01CZJ4E64 は型番欄が「md1493_01」で一致しない
- ブランド欄が販売店名（「まもる君」「国光社」）の出品があり、採用しない。谷沢 ST#144-EPA の「まもる君」出品は「耳あご紐セット」
- 型番欄の末尾に色コードが付く出品が多い（谷沢「-W1-J」「-B1-J」、トーヨー「シロ」、No.390F-OT の「-SS」は公式の品番一覧の No.390F-OTSS と同じ色の組み合わせ）
- ミドリ安全 SC-11BV は型番欄が「SC11BV」だけで、RA・KP の違いはタイトル（「KPなし」「KP付」）で判断した。色違いの子に「(× 4)」「(× 5)」の複数個入りがあるため、1個の子 ASIN を採用
- 谷沢 ST#103B-JPZ は白の子が見当たらず、ブルーの子を採用

| 記事 | 商品 | ASIN | 確認した点 |
|---|---|---|---|
| work-helmet | トーヨー No.170 | B001QU387K | 型番 NO.170（白） |
| work-helmet | トーヨー No.170F-OT | B004ATOU3U | 型番 NO.170F-OT（白） |
| work-helmet | トーヨー No.110F | B002WYK31I | 型番 NO.110F（白） |
| work-helmet | トーヨー No.170LF-OT | B00E195S5I | 型番 NO.170LF-OT シロ |
| work-helmet | トーヨー No.170SF-OT | B00E195QUU | 型番 NO.170SF-OT シロ |
| work-helmet | トーヨー No.390F-OT | B003JKRJ4S | 型番 NO.390F-OT-SS（白／スモーク） |
| work-helmet | トーヨー No.260F | B004ATOUHG | 部品番号 NO.260F（白）。ブランド欄なし、メーカー欄がトーヨー |
| work-helmet | トーヨー No.80（ケーボー） | B0HJWNXWCQ | 型番 NO.80（白）。ドラッグストアのカテゴリ |
| work-helmet | 谷沢 ST#0169-EZ | B009O53J1E | メーカー型番 st0169ez、タイトルに ST#0169-EZ |
| work-helmet | 谷沢 ST#0123-JZ | B09PZRJ53S | メーカー型番 ST#0123-JZ(EPA) |
| work-helmet | 谷沢 ST#01230-JZ | B0BQ264B3K | 型番 01230-JZ W-1 |
| work-helmet | 谷沢 ST#103B-JPZ | B0BHYT2G6R | 型番 103B-JPZ-B1-J（ブルー） |
| work-helmet | 谷沢 ST#0169L-FZ | B00GH1L5EG | 型番 ST#0169L-FZ。タイトルに「※廃番予定」（公式ページには記載なし） |
| work-helmet | 谷沢 ST#144-EPA | B009L2Z2YC | 型番 144-EPA |
| work-helmet | ミドリ安全 SC-11BV RA | B002SOLK64 | 型番 SC11BV、タイトル「SC11BV RA KPなし」 |
| work-helmet | ミドリ安全 SC-11BV RA KP | B002SOP8NK | 型番 SC11BV、タイトル「SC11BV RA KP付」 |

## 2026-10-24 保護メガネ（safety-glasses）に設定した16件

運営者が Claude in Chrome で確認（お届け先＝日本）。記録は `docs/sources/safety_glasses_amazon_2026-10-24.csv`。

- 15件はカテゴリが「産業・研究開発用品 › 安全・保護用品 › 保護メガネ・防災面 › 保護メガネ」（4.00%）。山本光学 SN-711（B000UYPVKK）だけ「ホーム＆キッチン › 生活雑貨」（3.00%）
- 山本光学は、同じ品番でレンズのコート違い（PET／PET-AF）や色違いが同じ親の出品にまとまっている。型番欄にコートの種類が入らないことが多く、PET-AF・PAF はタイトルかバリエーション名で確認した
- ブランド欄が販売店（アズワン）や GENERIC の出品、「(× 3)」「(× 5)」などの複数個入り、スペアレンズは採用しない
- 山本光学 YS-210（B0874LJCMY）とトーヨー No.1340-S（B0047MFJHQ）は「すべての出品を見るのみ」

| 記事 | 商品 | ASIN | 確認した点 |
|---|---|---|---|
| safety-glasses | 山本光学 LF-101 | B007628JA8 | メーカー型番 LF-101 |
| safety-glasses | 山本光学 LF-103 | B007628JOO | メーカー型番 LF-103 |
| safety-glasses | 山本光学 SN-610 PAF | B0D5YGFY1J | メーカー型番 SN-610、タイトルに【PAF(パフ)】 |
| safety-glasses | 山本光学 SN-610 SMK PAF | B0GSZ4DKMP | メーカー型番 SN-610 SMK |
| safety-glasses | 山本光学 SN-711 | B000UYPVKK | メーカー型番 SN711。カテゴリはホーム＆キッチン（3%） |
| safety-glasses | 山本光学 SN-730 | B002P98IHQ | 型番 SN-730（クリア） |
| safety-glasses | 山本光学 YS-210 | B0874LJCMY | メーカー型番 YS-210 |
| safety-glasses | 山本光学 YS-390 | B00Q4T7YSC | メーカー型番 YS390PETAFBLK |
| safety-glasses | 山本光学 YS-390G | B09SZ9V4HX | メーカー型番 YS-390G |
| safety-glasses | 山本光学 NO.337 PET-AF | B00IK8EOV0 | 型番 NO.337、バリエーション名に PET-AF |
| safety-glasses | 山本光学 NO.338（ノンコート） | B000TGFHQM | 型番欄なし、タイトルに「NO.338 … クリア ノンコート」 |
| safety-glasses | 山本光学 NO.340 PET-AF | B005GDX9FE | 型番 NO.340、タイトルに PET-AF |
| safety-glasses | 山本光学 NO.360 PET-AF | B00IK8ESDO | 型番 NO.360、タイトルに PET-AF |
| safety-glasses | 山本光学 SN-737 | B00IK8ESDY | 型番 SN-737 |
| safety-glasses | トーヨー No.1340-C | B0016V69MA | メーカー型番 NO.1340-C |
| safety-glasses | トーヨー No.1340-S | B0047MFJHQ | メーカー型番 NO.1340-S |

## 2026-10-24 防じんマスク（dust-mask）に設定した7件

運営者が Claude in Chrome で確認（お届け先＝日本）。記録は `docs/sources/dust_mask_amazon_2026-10-24.csv`。6件ともカテゴリは「産業・研究開発用品 › 安全・保護用品 › 産業用マスク › …」（4.00%）。末尾の階層は「使い捨てカップ型防塵マスク」「フィルター式防塵・防毒マスク」など出品ごとに違う。

- トーヨーは入数違いが別品番（No.1700 は5枚入り、No.1700-A は20枚入り）。仕様は同じなので、購入可能な20枚入りの「-A」を採用
- 13品番のうち6品番は Amazon に出品がない（上の未設定の表）。山本光学 3200-A は出品がなく、同じシリーズの 3200-CF に差し替えた

| 記事 | 商品 | ASIN | 確認した点 |
|---|---|---|---|
| dust-mask | トーヨー No.1700（リンク先は No.1700-A） | B001RS4USW | 型番 NO.1700-A 20PC |
| dust-mask | トーヨー No.1702（リンク先は No.1702-A） | B000W9FTO6 | 型番 NO.1702-A20PCS |
| dust-mask | トーヨー No.1732（リンク先は No.1732-A） | B001SX84GU | 型番 NO.1732-A20PCS |
| dust-mask | トーヨー No.1733（リンク先は No.1733-A） | B001SXANF0 | 型番 NO.1733-A20PCS |
| dust-mask | トーヨー No.1520 | B09GV2RGHX | 型番 No.1520（ミディアムグレー） |
| dust-mask | 山本光学 7700 | B077SCCQC5 | 型番 7700（20枚入り、排気弁なし） |
| dust-mask | 山本光学 3200-CF | B0BHKD8MN1 | 型番・メーカー型番 3200-CF、20枚入り。出品がない 3200-A の代わりに掲載（2026-10-24 追加確認、`docs/sources/dust_mask_amazon_3200-CF_2026-10-24.csv`） |

## 2026-10-24 脚立（stepladder）に設定した16件

運営者が Claude in Chrome で確認（お届け先＝日本）。記録は `docs/sources/stepladder_amazon_2026-10-24.csv`。16件ともカテゴリは「産業・研究開発用品 › 物流・保管用品 › はしご・脚立 › …」（4.00%）。末尾は「脚立」「はしご兼用脚立」「踏み台」と出品ごとに違う。

- 同じ型式の「（法人限定）」出品は、ブランド欄が「ノーブランド品」なので採用しない
- アルインコの MR-W・MSS-FX・KUR はカインズでも売られているが、アルインコ公式に載っていることを確認した（ホームセンター限定の型番ではない）

| 記事 | 商品 | ASIN | 確認した点 |
|---|---|---|---|
| stepladder | 長谷川工業 RM-50a | B0DZN3DJBZ | メーカー型番 RM-50a |
| stepladder | 長谷川工業 RM-75a | B0DZNH4B9F | メーカー型番 RM-75a |
| stepladder | 長谷川工業 RZ-06c | B085J1WJR6 | 型番 RZ-06c（カテゴリ「脚立」の出品。「踏み台」の B07Z5SPXQZ は採用しない） |
| stepladder | 長谷川工業 RZ-09c | B085J2GLDP | 型番 RZ-09c |
| stepladder | 長谷川工業 RZ-12c | B085J2LY8S | 型番 RZ-12c |
| stepladder | 長谷川工業 RS-09c | B09TSZGBCK | 型番 RS-09c |
| stepladder | 長谷川工業 RS-12c | B09TSZ8ZDB | 型番 RS-12c |
| stepladder | 長谷川工業 RD-09c | B09Q5MX279 | 型番 RD-09c |
| stepladder | 長谷川工業 RD-12c | B09Q5W7GV8 | 型番 RD-12c |
| stepladder | アルインコ MR60W | B07DRDMM1S | メーカー型番 MR-60W（公式は MR60W、ハイフンの有無だけ違う） |
| stepladder | アルインコ MR90W | B00ME6MIQC | 型番 MR90W |
| stepladder | アルインコ MR120W | B00ME6PT9K | 型番 MR120W |
| stepladder | アルインコ MSS90FX | B014K5FNY8 | 型番 MSS90FX |
| stepladder | アルインコ MSS120FX | B014K5FN02 | 型番 MSS120FX。確認時「すべての出品を見るのみ」 |
| stepladder | アルインコ KUR90 | B0CHM7QWPS | メーカー型番 KUR90 |
| stepladder | アルインコ KUR120 | B0CHMC56TJ | 型番 KUR120 |

## 点検の記録

| 日付 | 内容 |
|---|---|
| 2026-10-21 | 全123件の Amazon 商品ページを確認。122件は表示・出品あり（カート表示がなくても「すべての出品を見る」から買える状態を含む）。B01AUM4THC（オースプラス5.0L）のみ取り扱い終了でリンクを外した。出典の公式ページ124件はすべて表示できた（curl で 403/429/503 になるサイトはブラウザで確認） |
