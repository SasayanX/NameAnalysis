# Android ディープリンク クイック修正ガイド

## 現在の設定

- **ドメイン**: `seimei.kanau-kiryu.com`
- **パッケージ名**: `com.nameanalysis.ai`
- **SHA-256**: `B766698D95C2B3A1E236143DE6DC91343DFBFD5732C8C117F0F30E46F9DC15A9`

## 修正手順（3ステップ）

### ステップ1: SHA-256フィンガープリントを確認

Google Play Consoleで正しいSHA-256を取得：

1. **Google Play Console** → **アプリ** → **リリース** → **設定** → **アプリの署名**
2. **「アプリの署名証明書のSHA-256」**をコピー
3. これを`assetlinks.json`に反映

### ステップ2: assetlinks.jsonを更新

`public/.well-known/assetlinks.json`を以下の形式で更新：

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.nameanalysis.ai",
      "sha256_cert_fingerprints": [
        "ここにGoogle Play Consoleから取得したSHA-256を貼り付け"
      ]
    }
  }
]
```

**重要ポイント**:
- フィンガープリントは**大文字小文字を区別**します
- **コロン（`:`）は不要**、スペースなしで記載
- 複数のフィンガープリントがある場合は、すべて追加

### ステップ3: デプロイと検証

1. **ファイルを保存してデプロイ**
2. **数分待つ**（DNS反映時間）
3. **ブラウザで確認**:
   ```
   https://seimei.kanau-kiryu.com/.well-known/assetlinks.json
   ```
   - JSONが正しく表示されるか確認
   - Content-Typeが`application/json`か確認

4. **Google Play Consoleで再検証**:
   - Google Play Console → **成長** → **ディープリンク**
   - **「検証」**ボタンをクリック

## よくある問題

### 問題: SHA-256が一致しない

**解決方法**:
- Google Play Consoleで**アプリの署名**が有効になっている場合、Google管理の証明書が使用されます
- **必ずGoogle Play Consoleから取得したSHA-256を使用してください**
- ローカルのキーストアのSHA-256は使用しないでください

### 問題: assetlinks.jsonが404エラー

**解決方法**:
- `public/.well-known/assetlinks.json`が正しくデプロイされているか確認
- Netlify/Vercelの設定で`.well-known`ディレクトリが正しく配信されているか確認
- デプロイ後にURLに直接アクセスして確認

### 問題: ドメインが検証されない

**解決方法**:
- HTTPSが正しく設定されているか確認
- リダイレクトが発生していないか確認
- `assetlinks.json`が直接アクセスできるか確認（リダイレクトなし）

## 確認チェックリスト

- [ ] Google Play ConsoleからSHA-256フィンガープリントを取得
- [ ] `assetlinks.json`を更新してデプロイ
- [ ] `https://seimei.kanau-kiryu.com/.well-known/assetlinks.json`にアクセスしてJSONが表示される
- [ ] Content-Typeが`application/json`
- [ ] SHA-256フィンガープリントが正しい
- [ ] `package_name`が`com.nameanalysis.ai`と一致
- [ ] Google Play Consoleで再検証

## 検証ツール

Googleの検証ツールを使用：
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://seimei.kanau-kiryu.com&relation=delegate_permission/common.handle_all_urls
```

このURLにアクセスして、正しいJSONが返ってくるか確認してください。

