# Twitter API 使用例説明テンプレート

Twitter Developer Account申請時に提出する「X のデータと API の使用例」の回答例です。

## 250文字以上の簡潔版（申請フォーム用）

以下のテキストをそのままコピーして使用できます（約500文字）：

```
姓名判断Webアプリケーション（https://seimei.kanau-kiryu.com）において、ユーザーへのサービス告知とSEO対策を目的として、Twitter API v2を使用して姓名判断の分析結果を自動投稿する機能を実装します。

投稿内容は、公に公開されている人名（ニュース記事、Wikipediaなどから取得）に対して実行した姓名判断の結果サマリーのみです。投稿形式はテキストベースで、総合評価点、天格・人格・総格の運勢、およびハッシュタグ（#姓名判断 #名前診断 #運勢 #占い）を含む280文字以内のツイートです。

投稿頻度は1日2回（朝7時・夜19時 JST）で、自動スケジューラー（Vercel Cron）により実行されます。月間約60件の投稿を予定しており、Twitter API無料プランの制限（1,500件/月）内で運用します。

データ保護の観点から、個人を特定できる情報（メールアドレス、電話番号、住所など）は一切含めません。姓名判断結果のみを投稿し、個人の意見や評価は含めません。また、自動返信、自動フォロー、DM、メンション機能は使用せず、シンプルな投稿のみを行います。

この機能により、定期的なコンテンツ提供によるユーザーエンゲージメント向上と、手動投稿の手間削減、コンテンツの一貫性確保を実現します。
```

## 使用例説明（日本語版 - 詳細版）

```
【プロジェクト名】
姓名判断アプリの自動SNSマーケティング機能

【プロジェクトの概要】
日本語の姓名判断Webアプリケーション（https://seimei.kanau-kiryu.com）において、
ユーザーへのサービス告知とSEO対策を目的とした自動投稿機能を実装します。

【使用例の詳細】

1. 投稿内容
   - 姓名判断の分析結果サマリー（総合評価、天格・人格・総格の運勢）
   - 投稿頻度：1日2回（朝7時・夜19時 JST）
   - 1回の投稿につき1つの姓名判断結果を投稿

2. 投稿形式
   - テキストベースのツイート（画像なし）
   - 文字数：280文字以内
   - ハッシュタグ：#姓名判断 #名前診断 #運勢 #占い

3. 投稿例
   「🔮【山田太郎さんの姓名判断】
   総合評価: 75点（Aランク）
   天格: 吉
   人格: 大吉
   総格: 吉
   #姓名判断 #名前診断 #運勢 #占い」

4. データの使用目的
   - ウェブアプリケーションのサービス告知
   - SEO対策（ブログ記事との連携）
   - ユーザーへの価値提供（姓名判断の知識と実例）

5. ユーザーデータの取り扱い
   - 公に公開されている人名のみを使用（ニュース記事、Wikipediaなど）
   - 実在する個人のプライバシーを尊重し、ポジティブな内容のみ投稿
   - 個人情報（メールアドレス、電話番号など）は一切使用しません
   - 投稿する内容は姓名判断の結果のみで、個人的な情報は含まれません

6. 自動化の理由
   - 定期的なコンテンツ提供によるユーザーエンゲージメント向上
   - 手動投稿の手間削減
   - コンテンツの一貫性確保

7. スケジュール
   - 投稿頻度：1日2回（朝7時、夜19時 JST）
   - 月間投稿数：約60件（無料プランの制限1,500件以内）
   - 投稿は自動スケジューラー（Vercel Cron）により実行

8. データ保護に関する取り組み
   - 投稿する人名は公開情報のみから取得
   - 個人を特定できる情報は一切含めない
   - 姓名判断結果のみを投稿（個人の意見や評価は含めない）
   - 投稿前に内容を自動チェック（不適切な内容は除外）

9. 返信・リプライ機能
   - 自動返信機能は使用しません
   - ユーザーからのリプライには手動で対応します（今後実装予定なし）

10. フォローフォロワー機能
    - 自動フォロー機能は使用しません
    - フォローフォロワー管理機能は使用しません

11. その他の機能
    - メンション機能は使用しません
    - DM（ダイレクトメッセージ）機能は使用しません
    - タイムライン取得機能は使用しません
    - ユーザー情報取得機能は使用しません
```

## 使用例説明（英語版 - 必要に応じて）

```
Project Name:
Automated Social Media Marketing Feature for Name Analysis App

Project Overview:
We are implementing an automated posting feature for a Japanese name analysis 
web application (https://seimei.kanau-kiryu.com) for service announcements 
and SEO purposes.

Detailed Use Cases:

1. Posting Content:
   - Summary of name analysis results (overall score, fortune readings for 
     Tenkaku, Jinkaku, and Soukaku)
   - Posting frequency: 2 times per day (7:00 AM and 7:00 PM JST)
   - One name analysis result per post

2. Post Format:
   - Text-based tweets (no images)
   - Character count: Within 280 characters
   - Hashtags: #姓名判断 #名前診断 #運勢 #占い

3. Example Post:
   "🔮【山田太郎さんの姓名判断】
   総合評価: 75点（Aランク）
   天格: 吉
   人格: 大吉
   総格: 吉
   #姓名判断 #名前診断 #運勢 #占い"

4. Data Usage Purpose:
   - Service announcements for web application
   - SEO optimization (integration with blog articles)
   - Value provision to users (name analysis knowledge and examples)

5. User Data Handling:
   - Only use publicly available names (from news articles, Wikipedia, etc.)
   - Respect privacy of real individuals, post only positive content
   - Never use personal information (email addresses, phone numbers, etc.)
   - Post only name analysis results, no personal information included

6. Automation Rationale:
   - Improve user engagement through regular content delivery
   - Reduce manual posting workload
   - Ensure content consistency

7. Schedule:
   - Posting frequency: 2 times per day (7:00 AM, 7:00 PM JST)
   - Monthly posts: Approximately 60 posts (within free tier limit of 1,500)
   - Posts executed by automated scheduler (Vercel Cron)

8. Data Protection Measures:
   - Only obtain names from public information sources
   - Never include personally identifiable information
   - Post only name analysis results (no personal opinions or evaluations)
   - Automatic content checking before posting (exclude inappropriate content)

9. Reply/Mention Features:
   - Will not use automated reply functionality
   - Will manually respond to user replies (no future automation planned)

10. Follow/Followers Features:
    - Will not use auto-follow functionality
    - Will not use follow/follower management features

11. Other Features:
    - Will not use mention functionality
    - Will not use DM (Direct Message) functionality
    - Will not use timeline retrieval functionality
    - Will not use user information retrieval functionality
```

## ポイント

1. **明確な目的の説明**
   - サービス告知とSEO対策が目的であることを明記

2. **データ使用の透明性**
   - 公開情報のみを使用
   - 個人情報は使用しない

3. **投稿内容の説明**
   - 姓名判断結果のみ（客観的な占い結果）
   - 不適切な内容は含めない

4. **使用しない機能の明記**
   - 自動返信、自動フォロー、DM、メンション機能は使用しない
   - シンプルな投稿のみ

5. **投稿頻度の明記**
   - 1日2回、月間約60件（無料プランで十分）

この回答で、Twitterが求める「データとAPIの使用例」を説明できます。

