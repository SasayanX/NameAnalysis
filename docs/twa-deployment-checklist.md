# TWAデプロイチェックリスト

## ✅ 完了項目

- [x] Bubblewrap CLI インストール
- [x] TWAプロジェクト初期化
- [x] 署名キー作成
- [x] SHA256フィンガープリント取得
- [x] Digital Asset Linksファイル更新

## 📋 次のステップ

### 1. デプロイ準備

```bash
# 変更を確認
git status

# Digital Asset Linksファイルを追加
git add public/.well-known/assetlinks.json

# コミット
git commit -m "feat(twa): add Digital Asset Links configuration with SHA256 fingerprint"

# プッシュ（デプロイ）
git push origin master
```

### 2. Digital Asset Linksの確認

デプロイ完了後（約1-2分）、以下にアクセスしてJSONが正しく表示されることを確認：

```
https://seimei.app/.well-known/assetlinks.json
```

**期待される表示:**
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

### 3. Android APKビルド

Digital Asset Linksが確認できたら、APKをビルド：

```bash
cd twa
bubblewrap build
```

### 4. テストインストール

```bash
# USBデバッグ有効化が必要
adb install app-release.apk
```

または、APKファイルを直接デバイスに転送してインストール。

---

## 🔍 トラブルシューティング

### assetlinks.jsonが表示されない

1. デプロイが完了しているか確認（Vercelダッシュボードを確認）
2. HTTPSであることを確認
3. ブラウザのキャッシュをクリア
4. 直接URLにアクセスして確認

### APKビルドエラー

1. Java JDKがインストールされているか: `java -version`
2. Android SDKのパスが正しいか: `bubblewrap doctor`
3. `twa-manifest.json`の設定を確認

---

**次のアクション**: `git add public/.well-known/assetlinks.json` を実行してデプロイ準備を完了してください。

