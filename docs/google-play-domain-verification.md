# Google Play Console ドメイン所有権証明ガイド

## 問題
Google Play Consoleで「ドメインの問題を解決してください」と表示され、`seimei.app`が不合格になっている。

## 解決手順

### ステップ1: Google Search Consoleでドメインを追加

1. **Google Search Console** にアクセス: https://search.google.com/search-console
2. **プロパティを追加** → **ドメイン** を選択
3. **`seimei.app`** を入力して続行
4. **所有権確認方法を選択**:
   - **推奨**: DNSレコード（最も簡単）
   - **代替**: HTMLファイルまたはHTMLタグ

#### 方法A: DNSレコードで確認（推奨）

1. Google Search Consoleから提供される**TXTレコード**をコピー
2. **ドメイン管理画面**（例: Cloudflare、お名前.comなど）にアクセス
3. **DNSレコード**を追加:
   - **タイプ**: TXT
   - **名前**: `@` または `seimei.app`
   - **値**: Google Search Consoleから提供された値
   - **TTL**: 3600（デフォルト）
4. **保存**して数分待つ
5. Google Search Consoleで**「確認」**をクリック

#### 方法B: HTMLファイルで確認

1. Google Search Consoleから提供される**HTMLファイル**をダウンロード
2. **`public/google1234567890abcdef.html`** に配置
3. **デプロイ**
4. **`https://seimei.app/google1234567890abcdef.html`** にアクセスできることを確認
5. Google Search Consoleで**「確認」**をクリック

#### 方法C: HTMLタグで確認

1. Google Search Consoleから提供される**HTMLタグ**をコピー
2. **`app/layout.tsx`** の`<head>`セクションに追加:
   ```tsx
   <head>
     {/* Google Search Console 所有権確認 */}
     <meta name="google-site-verification" content="your-verification-code-here" />
     {/* ... 他のメタタグ ... */}
   </head>
   ```
3. **デプロイ**
4. Google Search Consoleで**「確認」**をクリック

### ステップ2: assetlinks.jsonの確認

**`https://seimei.app/.well-known/assetlinks.json`** にアクセスして確認:

✅ JSONが正しく表示される
✅ Content-Typeが`application/json`
✅ SHA-256フィンガープリントが正しい

**現在のSHA-256を確認:**
- Google Play Console → リリース → 設定 → アプリの署名
- 「アプリの署名証明書のSHA-256」をコピー
- `app/.well-known/assetlinks.json/route.ts`の値と一致しているか確認

### ステップ3: Google Play Consoleで再検証

1. **Google Play Console** → **アプリを選択**
2. **成長** → **ディープリンク**
3. **「検証」**ボタンをクリック
4. 検証結果を確認

### ステップ4: ドメインの所有権を証明（Google Play Console）

Google Play Consoleでドメインの所有権を証明するには、以下のいずれかが必要です：

#### 方法1: Google Search Consoleで所有権確認済み

- Google Search Consoleで`seimei.app`の所有権を確認済みの場合、Google Play Consoleでも自動的に認識される可能性があります

#### 方法2: Google Play Consoleで直接確認

1. **Google Play Console** → **アプリを選択**
2. **成長** → **ディープリンク**
3. **「ドメインの検証」**または**「所有権を証明」**をクリック
4. 指示に従って所有権を証明

### ステップ5: Digital Asset Linksの検証

**Googleの検証ツールで確認:**
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://seimei.app&relation=delegate_permission/common.handle_all_urls
```

**期待されるレスポンス:**
```json
{
  "statements": [
    {
      "source": {
        "web": {
          "site": "https://seimei.app"
        }
      },
      "relation": "delegate_permission/common.handle_all_urls",
      "target": {
        "android_app": {
          "package_name": "com.nameanalysis.ai",
          "certificate": {
            "sha256_fingerprint": "B766698D95C2B3A1E236143DE6DC91343DFBFD5732C8C117F0F30E46F9DC15A9"
          }
        }
      }
    }
  ]
}
```

## トラブルシューティング

### 問題1: Google Search Consoleで所有権確認できない

**解決方法:**
- DNSレコードの反映を待つ（最大48時間）
- TXTレコードの値が正しいか確認
- ドメイン管理画面でDNSレコードが正しく設定されているか確認

### 問題2: assetlinks.jsonが正しく表示されない

**解決方法:**
1. `https://seimei.app/.well-known/assetlinks.json` に直接アクセス
2. 404エラーの場合: `app/.well-known/assetlinks.json/route.ts`が正しくデプロイされているか確認
3. Content-Typeが正しく設定されているか確認

### 問題3: SHA-256フィンガープリントが一致しない

**解決方法:**
1. Google Play Console → リリース → 設定 → アプリの署名
2. 「アプリの署名証明書のSHA-256」をコピー
3. `app/.well-known/assetlinks.json/route.ts`を更新
4. デプロイ

### 問題4: ドメインの所有権が証明できない

**解決方法:**
1. Google Search Consoleで所有権を確認
2. Google Play Consoleで「ドメインの検証」を実行
3. 数時間から最大48時間待つ（DNSレコードの反映時間）

## 確認チェックリスト

- [ ] Google Search Consoleで`seimei.app`の所有権を確認済み
- [ ] `https://seimei.app/.well-known/assetlinks.json`にアクセスできる
- [ ] JSONが正しく表示される
- [ ] Content-Typeが`application/json`
- [ ] SHA-256フィンガープリントがGoogle Play Consoleの値と一致
- [ ] Googleの検証ツールで確認済み
- [ ] Google Play Consoleで再検証

## 次のステップ

1. **Google Search Consoleで所有権確認**（最重要）
2. **assetlinks.jsonのSHA-256を更新**（必要に応じて）
3. **デプロイ**
4. **Google Play Consoleで再検証**

最も重要なのは、**Google Search Consoleでドメインの所有権を確認すること**です。これが完了すれば、Google Play Consoleでもドメインが認識されるはずです。

