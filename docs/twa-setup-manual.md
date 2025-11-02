# TWA手動セットアップ手順

## 現在の状況
- ✅ Bubblewrap CLI インストール済み
- ✅ `twa/twa-manifest.json` 作成済み
- ⚠️ 対話形式の初期化が必要

## 次のステップ

### 1. 対話形式でTWAプロジェクトを初期化

```bash
cd twa
bubblewrap init --manifest=https://seimei.app/manifest.json
```

**入力が必要な情報:**
- **Domain**: `seimei.app`
- **URL path**: `/`
- **Application name**: `まいにちAI姓名判断`
- **Short name**: `まいにちAI姓名判断`
- **Package ID**: `com.nameanalysis.ai`
- **Signing key**: 新しいキーを作成する場合は `y` → Enter → Enter

### 2. SHA256フィンガープリントを取得

```bash
cd twa
bubblewrap fingerprint
```

出力されたSHA256フィンガープリントをコピーしてください。
**重要**: コロン区切りの形式（`AA:BB:CC:...`）を64文字の16進数（`AABBCC...`）に変換してください。

### 3. Digital Asset Linksファイルを更新

`public/.well-known/assetlinks.json`を開き、取得したSHA256フィンガープリント（コロンなし）を設定：

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.nameanalysis.ai",
      "sha256_cert_fingerprints": [
        "ここに64文字のSHA256フィンガープリント（コロンなし）を入力"
      ]
    }
  }
]
```

### 4. Vercelにデプロイ

変更をコミット・プッシュ：

```bash
git add public/.well-known/assetlinks.json
git commit -m "feat(twa): add Digital Asset Links configuration"
git push origin master
```

### 5. Digital Asset Linksの確認

デプロイ後、以下にアクセスしてJSONが正しく表示されることを確認：

```
https://seimei.app/.well-known/assetlinks.json
```

### 6. Android APKのビルド

```bash
cd twa
bubblewrap build
```

成功すると`twa/app-release.apk`が生成されます。

### 7. テストインストール

生成されたAPKをAndroidデバイスにインストールして動作確認：

```bash
# USBデバッグ有効化が必要
adb install twa/app-release.apk
```

または、APKファイルを直接デバイスに転送してインストール。

---

## トラブルシューティング

### bubblewrap initが対話形式になる

対話形式は正常です。上記の情報を入力してください。

### Digital Asset Linksが認識されない

1. HTTPSであることを確認
2. JSON形式が正しいか確認（コロンなしの64文字）
3. Content-Typeが `application/json` であることを確認
4. ブラウザキャッシュをクリア

### APKビルドエラー

1. Java JDKがインストールされているか確認
2. Android SDKのパスが正しいか確認
3. `twa-manifest.json`の設定を確認

---

**次のアクション**: `cd twa && bubblewrap init --manifest=https://seimei.app/manifest.json` を実行し、対話形式で情報を入力してください。

