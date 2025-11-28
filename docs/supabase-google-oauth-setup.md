# Supabase Google OAuth 設定ガイド

このガイドでは、SupabaseでGoogle OAuth認証を設定する手順を説明します。

## 🔧 設定手順

### Step 1: Google Cloud ConsoleでOAuth 2.0クライアントを作成

1. **Google Cloud Console** にアクセス
   - https://console.cloud.google.com/apis/credentials

2. **プロジェクトを選択**
   - プロジェクト: `mainichi-ai-seimei`（または適切なプロジェクト）

3. **OAuth同意画面を設定**（初回のみ）
   - 左メニュー → 「OAuth同意画面」
   - ユーザータイプ: **外部** を選択
   - アプリ名: 「まいにちAI姓名判断」（または適切な名前）
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先情報: あなたのメールアドレス
   - 「保存して次へ」をクリック
   - スコープ: デフォルトのままでOK → 「保存して次へ」
   - テストユーザー: 必要に応じて追加 → 「保存して次へ」
   - 概要を確認して「ダッシュボードに戻る」

4. **OAuth 2.0クライアントIDを作成**
   - 左メニュー → 「認証情報」
   - 上部の「+ 認証情報を作成」→ 「OAuth クライアント ID」
   - アプリケーションの種類: **ウェブ アプリケーション**
   - 名前: 「Supabase Google OAuth」（または適切な名前）
   - **承認済みの JavaScript 生成元** に以下を追加（オプション、推奨）:
     ```
     https://nameanalysis.jp
     https://nameanalysis216.vercel.app（開発環境用、必要に応じて）
     ```
   - **承認済みのリダイレクト URI** に以下を追加（必須）:
     ```
     https://vchhiqsenoykypfydaon.supabase.co/auth/v1/callback
     ```
   - 「作成」をクリック

5. **Client IDとClient Secretをコピー**
   - 表示された **Client ID** をコピー（例: `123456789-abc...`)
     - 形式: `数字-ランダム文字列.apps.googleusercontent.com`
   - 表示された **Client Secret** をコピー（例: `GOCSPX-abc...`)
     - 形式: `GOCSPX-`で始まる文字列
   - ⚠️ **重要**: Client Secretは一度しか表示されません。必ずコピーしてください！

6. **Client IDを再確認する方法**（後で確認したい場合）
   - Google Cloud Console → 「認証情報」に戻る
   - 作成したOAuth 2.0クライアントIDの名前をクリック（例: 「Supabase Google OAuth」）
   - 「Client ID」欄に表示されている値が正しいClient IDです
   - 形式: `数字-ランダム文字列.apps.googleusercontent.com`
   - 例: `1075164137107-dl53cjj4tqeld14aa2etq0oil52fc2r1.apps.googleusercontent.com`
   
   ⚠️ **注意**: Client Secretはここでは表示されません（一度しか表示されないため）

---

### Step 2: SupabaseダッシュボードでGoogleプロバイダーを有効化

1. **Supabaseダッシュボード** にアクセス
   - https://supabase.com/dashboard/project/vchhiqsenoykypfydaon

2. **Authentication セクションに移動**
   - 左メニューから **Authentication** をクリック

3. **Providers を探す（複数の方法を試してください）**

   **方法A: タブで表示されている場合**
   - 「Authentication」ページの上部に **Providers** というタブがある場合、それをクリック

   **方法B: サブメニューで表示されている場合**
   - 左メニューの「Authentication」を展開すると、以下のようなサブメニューが表示される場合があります：
     - Providers
     - Users
     - Policies
     - URL Configuration
   - 「Providers」をクリック

   **方法C: 直接URLでアクセス**
   - 以下のURLに直接アクセスしてみてください：
     ```
     https://supabase.com/dashboard/project/vchhiqsenoykypfydaon/auth/providers
     ```

   **方法D: 検索ボックスを使用**
   - ダッシュボードの上部にある検索ボックス（🔍）に「Google」や「Providers」と入力してみてください

4. **Google プロバイダーを有効化**
   - 「Providers」ページで「Google」というカードまたはセクションを探す
   - **Enable Google provider** のトグルスイッチをONにする

5. **Client IDとClient Secretを設定**
   - **Client ID (for OAuth)**: Google Cloud ConsoleでコピーしたClient IDを貼り付け
   - **Client Secret (for OAuth)**: Google Cloud ConsoleでコピーしたClient Secretを貼り付け

6. **保存**
   - 「Save」または「保存」ボタンをクリック

---

### ⚠️ 「Providers」が見当たらない場合

もし上記の方法でも「Providers」が見つからない場合：

1. **ブラウザをリフレッシュ**（Ctrl+R / Cmd+R）
2. **別のブラウザで試す**（Chrome、Firefox、Safariなど）
3. **管理者権限があるか確認**
   - プロジェクトのオーナーまたは管理者である必要があります
4. **Supabaseのサポートに問い合わせ**
   - https://supabase.com/support

---

### Step 3: リダイレクトURLの確認（Supabase側）

1. **Authentication → URL Configuration** に移動
   - 左メニュー → **Authentication** → **URL Configuration**

2. **Redirect URLs** を確認
   - 以下が追加されていることを確認:
     ```
     https://nameanalysis.jp/**（本番環境のURL）
     https://nameanalysis216.vercel.app/**（開発環境のURL、必要に応じて）
     ```
   - 必要に応じて追加（ワイルドカード `/**` が自動的に設定されます）

---

## ✅ 確認事項

### Google Cloud Console
- [ ] OAuth同意画面が設定されている
- [ ] OAuth 2.0クライアントIDが作成されている
- [ ] 承認済みの JavaScript 生成元にアプリのドメインが追加されている（推奨）:
  - `https://nameanalysis.jp`
- [ ] 承認済みのリダイレクトURIに以下が追加されている（必須）:
  - `https://vchhiqsenoykypfydaon.supabase.co/auth/v1/callback`

### Supabaseダッシュボード
- [ ] Googleプロバイダーが有効になっている
- [ ] Client IDが正しく設定されている
- [ ] Client Secretが正しく設定されている
- [ ] Redirect URLsにアプリのURLが追加されている

---

## 🧪 テスト方法

1. アプリを開く（TWAまたはブラウザ）
2. ログインページにアクセス
3. 「Googleでログイン」ボタンをクリック
4. Googleアカウントを選択
5. 認証が成功し、アプリに戻ることを確認

---

## 🔴 トラブルシューティング

### エラー: "deleted_client"
- **原因**: OAuth 2.0クライアントが削除されている
- **解決策**: 
  1. Google Cloud Consoleで新しいOAuth 2.0クライアントを作成
  2. Supabaseダッシュボードで新しいClient ID/Secretを設定

### エラー: "redirect_uri_mismatch"
- **原因**: リダイレクトURIが一致していない
- **解決策**: 
  1. Google Cloud Consoleで以下が正しく設定されているか確認:
     - `https://vchhiqsenoykypfydaon.supabase.co/auth/v1/callback`
  2. スペルミスや余分なスラッシュがないか確認

### エラー: "access_denied"
- **原因**: OAuth同意画面が未設定、またはテストユーザーに追加されていない
- **解決策**: 
  1. Google Cloud ConsoleでOAuth同意画面を設定
  2. テストユーザーに自分のGoogleアカウントを追加

---

## 📚 参考リンク

- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2)

---

## 🔄 クライアントを削除してしまった場合

Google Cloud ConsoleでOAuth 2.0クライアントを削除してしまった場合：

1. **新しいクライアントを作成**（Step 1を再実行）
2. **Supabaseで新しいClient ID/Secretを設定**（Step 2を再実行）
3. 数分待ってから再度テスト

---

## 🎯 重要なポイント

1. **リダイレクトURIはSupabase側のURL**を設定（必須）
   - ✅ 正しい: `https://vchhiqsenoykypfydaon.supabase.co/auth/v1/callback`
   - ❌ 間違い: `https://nameanalysis.jp/auth/callback`（アプリ側のURLは不要）

2. **承認済みの JavaScript 生成元はアプリのドメイン**（推奨）
   - ✅ 正しい: `https://nameanalysis.jp`（本番環境のドメイン）
   - 開発環境用にも追加する場合: `https://nameanalysis216.vercel.app`
   - この設定は必須ではないが、セキュリティのため推奨

3. **Client Secretは一度しか表示されない**
   - 必ずコピーして安全な場所に保存

4. **設定変更後は反映に数分かかる場合がある**
   - エラーが続く場合は、しばらく待ってから再試行

---

作成日: 2025年1月
プロジェクトID: `vchhiqsenoykypfydaon`

