# Android ディープリンク修正（更新版）

## 問題
`https://seimei.app/.well-known/assetlinks.json` が404エラーを返していました。

## 解決策

### 1. API Route を作成
Next.jsでは`public/.well-known/`が正しく配信されない場合があるため、API Routeで配信するように変更しました。

**作成したファイル**: `app/.well-known/assetlinks.json/route.ts`

このファイルにより、`https://seimei.app/.well-known/assetlinks.json` が正しくJSONを返すようになります。

### 2. ドメインの統一
以下のファイルでドメインを`seimei.app`に統一しました：
- `lib/seo-config.ts`
- `app/layout.tsx`
- `app/sitemap.ts`

### 3. 次のステップ

#### SHA-256フィンガープリントの確認
Google Play Consoleで正しいSHA-256を取得：

1. **Google Play Console** → **アプリ** → **リリース** → **設定** → **アプリの署名**
2. **「アプリの署名証明書のSHA-256」**をコピー
3. `app/.well-known/assetlinks.json/route.ts`の`sha256_cert_fingerprints`を更新

```typescript
sha256_cert_fingerprints: [
  'ここにGoogle Play Consoleから取得したSHA-256を貼り付け'
]
```

### 4. デプロイと検証

1. **デプロイ**
   ```bash
   git add .
   git commit -m "Fix: Android deep link assetlinks.json API route"
   git push
   ```

2. **数分待つ**（DNS反映時間）

3. **ブラウザで確認**
   ```
   https://seimei.app/.well-known/assetlinks.json
   ```
   - JSONが正しく表示されるか確認
   - Content-Typeが`application/json`か確認

4. **Google Play Consoleで再検証**
   - Google Play Console → **成長** → **ディープリンク**
   - **「検証」**ボタンをクリック

### 5. 検証ツール

Googleの検証ツールを使用：
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://seimei.app&relation=delegate_permission/common.handle_all_urls
```

このURLにアクセスして、正しいJSONが返ってくるか確認してください。

## 確認チェックリスト

- [x] API Route (`app/.well-known/assetlinks.json/route.ts`) を作成
- [x] ドメインを`seimei.app`に統一
- [ ] Google Play ConsoleからSHA-256フィンガープリントを取得
- [ ] `assetlinks.json`のSHA-256を更新
- [ ] デプロイして確認
- [ ] `https://seimei.app/.well-known/assetlinks.json`にアクセスしてJSONが表示される
- [ ] Google Play Consoleで再検証

