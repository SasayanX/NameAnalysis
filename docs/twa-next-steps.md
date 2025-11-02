# TWAリリース 次のステップ

## 🎯 現在の状況

**進捗**: 60%完了 ✅

以下が完了しました：
- ✅ Service Worker実装
- ✅ Digital Asset Linksファイルテンプレート作成
- ✅ TWA設定ファイル作成
- ✅ オフラインページ実装
- ✅ セットアップガイド作成

---

## 🚀 次に実行すべきこと（順番通り）

### ステップ1: TWA Builder CLIのインストール（5分）

```bash
npm install -g @bubblewrap/cli
```

### ステップ2: TWAプロジェクトの初期化（10分）

```bash
# プロジェクトルートで実行
bubblewrap init --manifest=https://nameanalysis216.vercel.app/manifest.json
```

これにより`twa`ディレクトリが作成されます。

### ステップ3: SHA256フィンガープリントの取得（5分）

```bash
cd twa
bubblewrap fingerprint
```

出力されたSHA256フィンガープリントをコピーしてください。

**重要**: フィンガープリントの形式変換
- 入力形式: `AA:BB:CC:DD:EE:FF:...` （コロン区切り）
- 使用形式: `AABBCCDDEEFF...` （64文字の16進数、コロンなし）

### ステップ4: Digital Asset Linksファイルの更新（5分）

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

### ステップ5: Vercelにデプロイ（5分）

変更をコミット・プッシュしてVercelにデプロイ：

```bash
git add public/.well-known/assetlinks.json
git commit -m "feat(twa): add Digital Asset Links configuration"
git push origin master
```

### ステップ6: Digital Asset Linksの確認（2分）

デプロイ後、以下にアクセスしてJSONが正しく表示されることを確認：

```
https://nameanalysis216.vercel.app/.well-known/assetlinks.json
```

### ステップ7: Android APKのビルド（10分）

```bash
# twaディレクトリで実行
cd twa
bubblewrap build
```

成功すると`twa/app-release.apk`が生成されます。

### ステップ8: テストインストール（10分）

生成されたAPKをAndroidデバイスにインストールして動作確認：

```bash
# USBデバッグ有効化が必要
adb install twa/app-release.apk
```

または、APKファイルを直接デバイスに転送してインストール。

---

## ✅ チェックリスト

進捗を確認しながら進めてください：

- [ ] TWA Builder CLIインストール済み
- [ ] `bubblewrap init`実行済み
- [ ] SHA256フィンガープリント取得済み
- [ ] `assetlinks.json`更新済み
- [ ] Vercelにデプロイ済み
- [ ] `/.well-known/assetlinks.json`がアクセス可能
- [ ] Android APKビルド成功
- [ ] テストデバイスで動作確認済み

---

## 📚 詳細ドキュメント

- [セットアップガイド](./twa-setup-guide.md) - 詳細な手順
- [進捗状況](./twa-release-progress.md) - 全体の進捗
- [TWA実装計画](./pwa-twa-implementation-plan.md) - 技術仕様

---

## 🆘 問題が発生した場合

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

**次のアクション**: `npm install -g @bubblewrap/cli` から開始！

