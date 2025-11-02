# TWAプロジェクト - まいにちAI姓名判断

このディレクトリには、Android Trusted Web Activity (TWA) アプリのビルド設定が含まれています。

## セットアップ手順

### 1. TWAプロジェクトを初期化（初回のみ）

```bash
cd twa
bubblewrap init --manifest=https://seimei.app/manifest.json
```

**対話形式で入力する情報:**
- Domain: `seimei.app`
- URL path: `/`
- Application name: `まいにちAI姓名判断`
- Short name: `まいにちAI姓名判断`
- Package ID: `com.nameanalysis.ai`
- Signing key: `y` (新しいキーを作成)

### 2. SHA256フィンガープリントを取得

```bash
bubblewrap fingerprint
```

出力されたSHA256フィンガープリントをコピーしてください。
**重要**: コロン区切り（`AA:BB:CC:...`）を64文字の16進数（`AABBCC...`）に変換してください。

### 3. Digital Asset Linksファイルを更新

`../public/.well-known/assetlinks.json`を開き、取得したSHA256フィンガープリント（コロンなし）を設定：

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

### 4. Android APKをビルド

```bash
bubblewrap build
```

成功すると`app-release.apk`が生成されます。

### 5. テストインストール

```bash
# USBデバッグ有効化が必要
adb install app-release.apk
```

または、APKファイルを直接デバイスに転送してインストール。

## ファイル構成

- `twa-manifest.json` - TWA設定ファイル
- `package.json` - プロジェクト設定
- `.gitignore` - Git除外設定

## トラブルシューティング

### Digital Asset Linksが認識されない

1. HTTPSであることを確認（`https://seimei.app`）
2. JSON形式が正しいか確認（コロンなしの64文字）
3. Content-Typeが `application/json` であることを確認
4. デプロイ後に `https://seimei.app/.well-known/assetlinks.json` がアクセス可能か確認

### APKビルドエラー

1. Java JDKがインストールされているか確認: `java -version`
2. Android SDKのパスが正しいか確認: `bubblewrap doctor`
3. `twa-manifest.json`の設定を確認

## 参考資料

- [TWAセットアップガイド](../docs/twa-setup-manual.md)
- [TWA実装計画](../docs/pwa-twa-implementation-plan.md)
- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)

