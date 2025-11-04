# Android App Links ドメイン検証 解決ガイド

## 問題
Google Play Consoleで「ドメインの問題を解決してください」と表示され、`seimei.app`が不合格になっている。

## 解決手順

### ステップ1: assetlinks.jsonの確認

**URLに直接アクセスして確認:**
```
https://seimei.app/.well-known/assetlinks.json
```

**確認ポイント:**
- ✅ JSONが正しく表示される（エラーがない）
- ✅ Content-Typeが`application/json`
- ✅ ステータスコードが200
- ✅ リダイレクトが発生していない

**期待されるレスポンス:**
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.nameanalysis.ai",
      "sha256_cert_fingerprints": [
        "B766698D95C2B3A1E236143DE6DC91343DFBFD5732C8C117F0F30E46F9DC15A9"
      ]
    }
  }
]
```

### ステップ2: Google Play ConsoleでSHA-256フィンガープリントを取得

1. **Google Play Console** → **アプリを選択**
2. **リリース** → **設定** → **アプリの署名**
3. **「アプリの署名証明書のSHA-256」**をコピー
4. この値が`assetlinks.json`の`sha256_cert_fingerprints`と一致しているか確認

**重要**: 
- Google Play Consoleでアプリの署名が有効になっている場合、**Google管理の証明書**が使用されます
- ローカルのキーストアのSHA-256は使用**しない**でください
- 必ずGoogle Play Consoleから取得したSHA-256を使用してください

### ステップ3: assetlinks.jsonを更新

**`app/.well-known/assetlinks.json/route.ts`を編集:**

```typescript
const assetLinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.nameanalysis.ai',
      sha256_cert_fingerprints: [
        'ここにGoogle Play Consoleから取得したSHA-256を貼り付け'
      ]
    }
  }
]
```

**重要ポイント:**
- フィンガープリントは**大文字小文字を区別**します
- **コロン（`:`）は不要**、スペースなしで記載
- 例: `B766698D95C2B3A1E236143DE6DC91343DFBFD5732C8C117F0F30E46F9DC15A9`

### ステップ4: デプロイと検証

1. **変更をデプロイ**
2. **数分待つ**（DNS反映時間）
3. **Googleの検証ツールで確認:**
   ```
   https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://seimei.app&relation=delegate_permission/common.handle_all_urls
   ```
   このURLにアクセスして、正しいJSONが返ってくるか確認

4. **ブラウザで直接確認:**
   ```
   https://seimei.app/.well-known/assetlinks.json
   ```

### ステップ5: Google Play Consoleで再検証

1. **Google Play Console** → **アプリを選択**
2. **成長** → **ディープリンク**
3. **「検証」**ボタンをクリック
4. 検証結果を確認

### ステップ6: AndroidManifest.xmlの確認

**`twa/app/src/main/AndroidManifest.xml`を確認:**

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="https"
          android:host="@string/hostName" />
</intent-filter>
```

**確認ポイント:**
- ✅ `android:autoVerify="true"`が設定されている
- ✅ `android:host`が`seimei.app`を指している

**`twa/app/src/main/res/values/strings.xml`を確認:**
```xml
<string name="hostName">seimei.app</string>
```

## よくある問題と解決方法

### 問題1: assetlinks.jsonが404エラー

**原因**: ファイルが正しくデプロイされていない、またはパスが間違っている

**解決方法**:
1. `app/.well-known/assetlinks.json/route.ts`が存在するか確認
2. デプロイ後にURLに直接アクセスして確認
3. Next.jsのルーティングが正しく動作しているか確認

### 問題2: SHA-256フィンガープリントが一致しない

**原因**: Google Play Consoleでアプリの署名が有効になっている場合、Google管理の証明書が使用される

**解決方法**:
1. Google Play Console → リリース → 設定 → アプリの署名
2. 「アプリの署名証明書のSHA-256」をコピー
3. `assetlinks.json`に貼り付け

### 問題3: Content-Typeが正しくない

**原因**: サーバーが`text/html`や`text/plain`を返している

**解決方法**:
- `app/.well-known/assetlinks.json/route.ts`で`Content-Type: application/json`を明示的に設定
- 既に設定済みの場合は、デプロイを確認

### 問題4: リダイレクトが発生している

**原因**: HTTPからHTTPSへのリダイレクトが発生している

**解決方法**:
- HTTPSで直接アクセスできることを確認
- リダイレクトは問題ないが、最終的なURLが正しくJSONを返す必要がある

### 問題5: ドメインの所有権が証明できない

**原因**: Google Play Consoleがドメインを検証できない

**解決方法**:
1. **Google Search Consoleで所有権確認**:
   - Google Search Consoleに`seimei.app`を追加
   - 所有権確認方法を実行（HTMLファイル、DNSレコード、HTMLタグなど）

2. **DNSレコードで確認**:
   - DNSレコード（TXT、CNAMEなど）でドメインの所有権を証明

3. **Google Play Consoleでの確認手順:**
   - Google Play Console → 成長 → ディープリンク
   - 「ドメインの検証」をクリック
   - 指示に従って所有権を証明

## 検証チェックリスト

- [ ] `https://seimei.app/.well-known/assetlinks.json`にアクセスできる
- [ ] JSONが正しく表示される（エラーがない）
- [ ] Content-Typeが`application/json`
- [ ] SHA-256フィンガープリントがGoogle Play Consoleの値と一致
- [ ] `package_name`が`com.nameanalysis.ai`と一致
- [ ] `android:autoVerify="true"`が設定されている
- [ ] `android:host`が`seimei.app`を指している
- [ ] Googleの検証ツールで確認済み
- [ ] Google Play Consoleで再検証

## 参考リンク

- [Android App Links の検証](https://developer.android.com/training/app-links/verify-site-associations)
- [Digital Asset Links API](https://developers.google.com/digital-asset-links/v1/getting-started)
- [Google Play Console ディープリンク設定](https://support.google.com/googleplay/android-developer/answer/10144339)

