# assetlinks.json 検証ガイド

## 問題
「ウェブサイトの関連付けを作成できませんでした。JSON ファイルを再公開して、もう一度お試しください。」

## 確認すべきポイント

### 1. JSONの形式チェック

**正しい形式:**
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.nameanalysis.ai",
      "sha256_cert_fingerprints": [
        "B766698D95C2B3A1E236143DE6DC91343DFBFD5732C8C117F0F30E46F9DC15A9",
        "AB6EFC1CC4B1BBB376B4D4F614BAE07AFECC87AFCF64C4FCDFAED2732579AA54"
      ]
    }
  }
]
```

**確認ポイント:**
- ✅ 配列で囲まれている（`[...]`）
- ✅ 各フィールドが正しい（`relation`, `target`, `namespace`, `package_name`, `sha256_cert_fingerprints`）
- ✅ SHA-256フィンガープリントが**コロンなし**の形式
- ✅ 文字列はダブルクォート（`"`）で囲まれている
- ✅ カンマが正しく配置されている

### 2. アクセス確認

**URLに直接アクセス:**
```
https://seimei.app/.well-known/assetlinks.json
```

**確認ポイント:**
- ✅ ステータスコードが200
- ✅ Content-Typeが`application/json`
- ✅ リダイレクトが発生していない
- ✅ JSONが正しく表示される（エラーがない）

### 3. Content-Typeヘッダーの確認

**ブラウザの開発者ツールで確認:**
1. F12で開発者ツールを開く
2. Networkタブを選択
3. `https://seimei.app/.well-known/assetlinks.json`にアクセス
4. Response Headersを確認:
   - `Content-Type: application/json` が設定されているか確認

### 4. Googleの検証ツールで確認

**Digital Asset Links API:**
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

### 5. よくある問題

#### 問題1: JSONの構文エラー

**確認方法:**
- JSON Lintなどで検証: https://jsonlint.com/
- ブラウザで直接アクセスして、エラーが表示されないか確認

#### 問題2: Content-Typeが正しくない

**解決方法:**
- `app/.well-known/assetlinks.json/route.ts`で`Content-Type: application/json`を明示的に設定
- 既に設定済みの場合は、デプロイを確認

#### 問題3: リダイレクトが発生している

**確認方法:**
- HTTPからHTTPSへのリダイレクトは問題ない
- ただし、最終的なURLが正しくJSONを返す必要がある

#### 問題4: SHA-256フィンガープリントの形式

**正しい形式:**
- コロンなし: `AB6EFC1CC4B1BBB376B4D4F614BAE07AFECC87AFCF64C4FCDFAED2732579AA54`

**間違った形式:**
- コロンあり: `AB:6E:FC:1C:C4:B1:BB:B3:76:B4:D4:F6:14:BA:E0:7A:FE:CC:87:AF:CF:64:C4:FC:DF:AE:D2:73:25:79:AA:54`

#### 問題5: キャッシュの問題

**解決方法:**
- ブラウザのキャッシュをクリア
- シークレットモードでアクセス
- `Cache-Control`ヘッダーを確認（`max-age=3600`など）

### 6. デバッグ手順

1. **JSON形式を確認:**
   ```bash
   curl https://seimei.app/.well-known/assetlinks.json
   ```

2. **Content-Typeを確認:**
   ```bash
   curl -I https://seimei.app/.well-known/assetlinks.json
   ```

3. **Googleの検証ツールで確認:**
   ```
   https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://seimei.app&relation=delegate_permission/common.handle_all_urls
   ```

4. **JSON Lintで検証:**
   - https://jsonlint.com/ にJSONを貼り付けて検証

## トラブルシューティングチェックリスト

- [ ] JSONの形式が正しい（配列で囲まれている）
- [ ] SHA-256フィンガープリントがコロンなしの形式
- [ ] `package_name`が`com.nameanalysis.ai`と一致
- [ ] `https://seimei.app/.well-known/assetlinks.json`にアクセスできる
- [ ] Content-Typeが`application/json`
- [ ] ステータスコードが200
- [ ] リダイレクトが発生していない
- [ ] Googleの検証ツールで確認済み
- [ ] JSON Lintで構文エラーがない

## 次のステップ

1. **JSON形式を再確認**
2. **デプロイを確認**
3. **数分待つ**（DNS反映時間）
4. **ブラウザで直接アクセスして確認**
5. **Googleの検証ツールで確認**
6. **Google Play Consoleで再検証**

