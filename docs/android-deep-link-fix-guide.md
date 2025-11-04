# Android ディープリンク設定修正ガイド

## エラーの原因

Google Play Consoleで以下のエラーが表示される場合：
- **1個のドメインが検証されていません**
- **1件のリンクが動作していません**

これは、Android App Links（ディープリンク）の検証が失敗していることを示しています。

## 解決手順

### 1. SHA-256フィンガープリントの確認

現在の`assetlinks.json`には以下のフィンガープリントが設定されています：
```
B766698D95C2B3A1E236143DE6DC91343DFBFD5732C8C117F0F30E46F9DC15A9
```

**このフィンガープリントが、実際のアプリ署名証明書と一致しているか確認してください。**

#### 確認方法

1. **Google Play Console で確認**:
   - Google Play Console → アプリ → リリース → 設定 → アプリの署名
   - 「アプリの署名証明書のSHA-256」をコピー

2. **または、ローカルのキーストアから取得**:
   ```bash
   keytool -list -v -keystore your-keystore.jks -alias your-key-alias
   ```
   「SHA-256」の値をコピー

### 2. assetlinks.jsonの更新

`public/.well-known/assetlinks.json`を確認・更新：

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.nameanalysis.ai",
      "sha256_cert_fingerprints": [
        "ここに実際のSHA-256フィンガープリントを貼り付け"
      ]
    }
  }
]
```

**重要**: フィンガープリントは大文字小文字を区別し、コロン（`:`）ではなくスペースなしで記載してください。

### 3. ドメインの検証

#### ステップ1: assetlinks.jsonが正しく配信されているか確認

ブラウザで以下のURLにアクセスして、JSONが正しく表示されるか確認：
```
https://seimei.kanau-kiryu.com/.well-known/assetlinks.json
```

**確認ポイント**:
- ✅ JSONが正しく表示される（エラーがない）
- ✅ Content-Typeが`application/json`
- ✅ SHA-256フィンガープリントが正しい
- ✅ package_nameが`com.nameanalysis.ai`と一致

#### ステップ2: Googleの検証ツールでテスト

1. **Google Digital Asset Links API**を使用：
   ```
   https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://seimei.kanau-kiryu.com&relation=delegate_permission/common.handle_all_urls
   ```

2. **または、Android Studioで確認**:
   - Android Studio → Tools → App Links Assistant
   - 「Open URL Mapping Editor」を開く
   - 「Verify Android App Links」をクリック

### 4. AndroidManifest.xmlの確認

`twa/app/src/main/AndroidManifest.xml`のintent-filterが正しく設定されているか確認：

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="https"
          android:host="@string/hostName" />
</intent-filter>
```

**確認ポイント**:
- ✅ `android:autoVerify="true"`が設定されている
- ✅ `android:host`が正しいドメイン（`seimei.kanau-kiryu.com`）を指している

### 5. strings.xmlの確認

`twa/app/src/main/res/values/strings.xml`を確認：

```xml
<string name="hostName">seimei.kanau-kiryu.com</string>
```

### 6. デプロイと再検証

1. **assetlinks.jsonを更新**してデプロイ
2. **数分待つ**（DNSの反映時間）
3. **Google Play Consoleで再検証**:
   - Google Play Console → アプリ → 成長 → ディープリンク
   - 「検証」ボタンをクリック

### 7. テスト方法

#### 方法1: ADBでテスト
```bash
adb shell pm get-app-links com.nameanalysis.ai
```

#### 方法2: ブラウザでテスト
1. Androidデバイスでアプリをインストール
2. ブラウザで `https://seimei.kanau-kiryu.com` を開く
3. アプリが自動的に開かれるか確認

#### 方法3: コマンドでテスト
```bash
adb shell am start -a android.intent.action.VIEW -d "https://seimei.kanau-kiryu.com"
```

## よくある問題と解決方法

### 問題1: assetlinks.jsonが404エラー

**原因**: ファイルが正しくデプロイされていない

**解決方法**:
- `public/.well-known/assetlinks.json`が存在するか確認
- デプロイ後にURLにアクセスして確認
- Netlify/Vercelの設定で`.well-known`ディレクトリが正しく配信されているか確認

### 問題2: SHA-256フィンガープリントが一致しない

**原因**: Google Play Consoleでアプリ署名が有効になっている場合、Google管理の証明書が使用される

**解決方法**:
- Google Play Console → リリース → 設定 → アプリの署名
- 「アプリの署名証明書のSHA-256」をコピー
- `assetlinks.json`に貼り付け

### 問題3: ドメインが検証されない

**原因**: HTTPSが正しく設定されていない、またはリダイレクトが発生している

**解決方法**:
- `https://seimei.kanau-kiryu.com/.well-known/assetlinks.json`が直接アクセスできるか確認
- HTTPからHTTPSへのリダイレクトは問題ないが、JSONの内容が正しく返される必要がある

### 問題4: リンクが動作しない

**原因**: intent-filterの設定が不完全

**解決方法**:
- AndroidManifest.xmlの`intent-filter`を確認
- `android:autoVerify="true"`が設定されているか確認
- パスパターン（`android:path`や`android:pathPrefix`）が必要な場合は追加

## 推奨設定

### 完全なintent-filter例

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="https"
          android:host="seimei.kanau-kiryu.com"
          android:pathPrefix="/" />
</intent-filter>
```

### 複数のパスをサポートする場合

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="https"
          android:host="seimei.kanau-kiryu.com" />
</intent-filter>
```

## 確認チェックリスト

- [ ] SHA-256フィンガープリントが正しい
- [ ] `assetlinks.json`が正しく配信されている（`https://seimei.kanau-kiryu.com/.well-known/assetlinks.json`）
- [ ] Content-Typeが`application/json`
- [ ] `package_name`が`com.nameanalysis.ai`と一致
- [ ] AndroidManifest.xmlに`android:autoVerify="true"`が設定されている
- [ ] `android:host`が正しいドメインを指している
- [ ] アプリをビルドして再インストール
- [ ] Google Play Consoleで再検証

## 参考リンク

- [Android App Links の検証](https://developer.android.com/training/app-links/verify-site-associations)
- [Digital Asset Links API](https://developers.google.com/digital-asset-links/v1/getting-started)
- [Google Play Console ディープリンク設定](https://support.google.com/googleplay/android-developer/answer/10144339)

