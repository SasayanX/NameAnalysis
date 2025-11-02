# Digital Asset Links 確認方法

## 確認URL

```
https://seimei.app/.well-known/assetlinks.json
```

## 確認手順

### 1. ブラウザで直接アクセス

上記のURLにアクセスして、以下のJSONが表示されることを確認してください。

### 2. 期待される表示

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

### 3. 確認ポイント

- ✅ JSONが正しく表示される
- ✅ Content-Typeが `application/json` であること（ブラウザの開発者ツールで確認）
- ✅ HTTPSでアクセス可能であること
- ✅ 404エラーや500エラーが表示されない

### 4. Googleの検証ツールを使用（オプション）

以下のツールでも確認できます：

```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://seimei.app&relation=delegate_permission/common.handle_all_urls
```

## トラブルシューティング

### 404エラーが表示される

1. デプロイが完了しているか確認（Vercelダッシュボードで確認）
2. ファイルパスが正しいか確認（`public/.well-known/assetlinks.json`）
3. Vercelの設定で`.well-known`ディレクトリが正しく処理されているか確認

### JSONが表示されない

1. ブラウザのキャッシュをクリア
2. シークレットモードでアクセス
3. 直接URLにアクセス（リダイレクトされていないか確認）

### Content-Typeが正しくない

Next.jsの設定で、`.well-known`ディレクトリのJSONファイルが正しく配信されるように設定されているか確認してください。

---

**次のアクション**: ブラウザで `https://seimei.app/.well-known/assetlinks.json` にアクセスして、上記のJSONが表示されることを確認してください。

