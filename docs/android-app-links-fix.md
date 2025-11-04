# Android App Links ディープリンク修正ガイド

## 問題

Google Play Consoleで以下のエラーが表示される：
- `/.*`パターンと`com.nameanalysis.ai.LauncherActivity`のディープリンクが無効
- `https://seimei.app`に関連付けられているウェブリンクが無効

## 修正内容

### 1. AndroidManifest.xmlの修正

`twa/app/src/main/AndroidManifest.xml`のintent-filterからパス属性を削除しました。

**修正前：**
```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="https"
        android:host="@string/hostName"
        android:pathPrefix="/" />
</intent-filter>
```

**修正後：**
```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="https"
        android:host="@string/hostName" />
</intent-filter>
```

**理由：**
- Android App Linksで全てのパスをマッチさせる場合は、パス属性を指定しないのが推奨
- `android:pathPrefix`や`android:pathPattern`を指定すると、Google Play Consoleが`/.*`パターンとして解釈し、検証エラーになる可能性がある
- パス属性を指定しない場合、デフォルトで全てのパスがマッチする

## 次のステップ

1. **新しいAABをビルド**
   ```bash
   cd twa
   npm run build
   # または
   ./gradlew bundleRelease
   ```

2. **Google Play Consoleにアップロード**
   - 内部テストトラックまたは新しいリリースにアップロード
   - アップロード後、Google Play Consoleでディープリンクの検証を再実行

3. **assetlinks.jsonの確認**
   - `https://seimei.app/.well-known/assetlinks.json`が正しくアクセス可能か確認
   - SHA-256フィンガープリントが正しいか確認

4. **検証ツールでの確認**
   - GoogleのDigital Asset Links検証ツールで確認：
     ```
     https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://seimei.app&relation=delegate_permission/common.handle_all_urls
     ```

## 現在の設定

- **パッケージ名**: `com.nameanalysis.ai`
- **ホスト名**: `seimei.app`
- **assetlinks.json**: `https://seimei.app/.well-known/assetlinks.json`
- **SHA-256フィンガープリント**: 
  - `B766698D95C2B3A1E236143DE6DC91343DFBFD5732C8C117F0F30E46F9DC15A9`
  - `AB6EFC1CC4B1BBB376B4D4F614BAE07AFECC87AFCF64C4FCDFAED2732579AA54`

## 注意事項

- パス属性を削除したため、`https://seimei.app`の全てのパスがアプリで開かれるようになります
- 特定のパスのみをマッチさせたい場合は、`android:pathPrefix`を使用してください（例：`android:pathPrefix="/articles"`）

