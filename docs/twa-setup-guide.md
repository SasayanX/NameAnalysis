# TWAリリース セットアップガイド

## 📋 概要

このガイドでは、TWA（Trusted Web Activity）を使ってAndroidアプリとしてGoogle Play Storeにリリースする手順を説明します。

---

## 🔧 事前準備

### 1. 必要なツールのインストール

```bash
# TWA Builder CLI (Bubblewrap) のインストール
npm install -g @bubblewrap/cli

# Java JDK 8以上（Androidビルドに必要）
# https://www.oracle.com/java/technologies/downloads/ からダウンロード
```

### 2. 開発環境の確認

- Node.js 16以上
- npm または yarn
- Android Studio（オプション、デバッグ用）

---

## 📝 ステップ1: Digital Asset Links設定

### 1.1 TWAプロジェクトの初期化

```bash
# プロジェクトルートで実行
bubblewrap init --manifest=https://nameanalysis216.vercel.app/manifest.json
```

### 1.2 SHA256フィンガープリントの取得

初期化後、`twa`ディレクトリが作成されます。以下のコマンドでSHA256フィンガープリントを取得：

```bash
cd twa
bubblewrap fingerprint
```

出力例：
```
SHA256 Fingerprint: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
```

### 1.3 Digital Asset Linksファイルの更新

取得したSHA256フィンガープリントを `public/.well-known/assetlinks.json` に設定：

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.nameanalysis.ai",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
      ]
    }
  }
]
```

**注意**: フィンガープリントのコロン（:）を削除して64文字の16進数文字列にする必要があります。

### 1.4 Digital Asset Linksのデプロイ

Vercelにデプロイ後、以下のURLでアクセスできることを確認：

```
https://nameanalysis216.vercel.app/.well-known/assetlinks.json
```

**重要**: 
- HTTPS必須
- Content-Type: `application/json`
- 正しいJSON形式であること

---

## 📱 ステップ2: Android APKビルド

### 2.1 TWA設定の確認

`twa-config.json` または `twa/twa-manifest.json` を確認・編集：

```json
{
  "packageId": "com.nameanalysis.ai",
  "host": "nameanalysis216.vercel.app",
  "name": "まいにちAI姓名判断",
  "version": "1.0.0"
}
```

### 2.2 APKビルド

```bash
# プロジェクトルートで実行
cd twa
bubblewrap build
```

ビルドが成功すると、`twa/app-release.apk` が生成されます。

### 2.3 テストインストール

```bash
# Android デバイスでテスト（USBデバッグ有効化が必要）
adb install twa/app-release.apk
```

または、APKファイルを直接デバイスに転送してインストール。

---

## 🏪 ステップ3: Google Play Console準備

### 3.1 Google Play Consoleアカウント作成

1. [Google Play Console](https://play.google.com/console) にアクセス
2. 開発者アカウント作成（$25の登録料が必要）
3. アプリ作成

### 3.2 アプリ情報の準備

以下の情報を準備：

- **アプリ名**: まいにちAI姓名判断
- **短い説明**: 完全旧字体対応のAI姓名判断アプリ
- **完全な説明**: 
  ```
  完全旧字体対応とAI分析で、あなたの運命を詳しく鑑定します。
  毎日の運勢チェック、深層心理分析、相性診断、改名コンサルまで。
  旧字体による正確な画数計算で、信頼性の高い姓名判断を提供します。
  ```
- **アプリアイコン**: 512x512 PNG
- **機能画像**: 1080x500 PNG（最大8枚）
- **スクリーンショット**: 
  - 電話: 16:9または9:16、最小320px
  - タブレット: 16:9または9:16、最小320px
  - TV: 1280x720（必須）、1920x1080（推奨）

### 3.3 コンテンツレーティング

- 年齢制限: 13歳以上推奨
- カテゴリ: ライフスタイル

### 3.4 プライバシーポリシー

既存のプライバシーポリシーページURLを設定：
```
https://nameanalysis216.vercel.app/privacy
```

---

## 🚀 ステップ4: アプリ申請

### 4.1 内部テスト

1. Google Play Consoleで「内部テスト」トラックを作成
2. APKをアップロード
3. テスターを追加
4. 動作確認

### 4.2 クローズドベータテスト

1. 「クローズドベータテスト」トラックを作成
2. 限定ユーザーでテスト
3. フィードバック収集

### 4.3 本番リリース

1. 「本番」トラックに移行
2. アプリ情報を完成させる
3. レビュー提出
4. 承認待ち（通常1-3営業日）

---

## ✅ チェックリスト

### Digital Asset Links
- [ ] `bubblewrap init` 実行済み
- [ ] SHA256フィンガープリント取得済み
- [ ] `assetlinks.json` 更新済み
- [ ] Vercelにデプロイ済み
- [ ] `/.well-known/assetlinks.json` がアクセス可能

### TWAアプリ
- [ ] `twa-config.json` 設定完了
- [ ] APKビルド成功
- [ ] テストデバイスで動作確認済み
- [ ] オフライン動作確認（オプション）

### Google Play Console
- [ ] 開発者アカウント作成済み
- [ ] アプリ説明文作成済み
- [ ] スクリーンショット準備済み
- [ ] プライバシーポリシー設定済み
- [ ] コンテンツレーティング完了

---

## 🐛 トラブルシューティング

### Digital Asset Linksが認識されない

1. HTTPSであることを確認
2. JSON形式が正しいか確認（コロンのない64文字のSHA256）
3. Content-Typeが `application/json` であることを確認
4. キャッシュをクリアして再確認

### APKビルドエラー

1. Java JDKがインストールされているか確認
2. Android SDKのパスが正しいか確認
3. `twa-manifest.json` の設定を確認

### Google Play申請が拒否された

1. プライバシーポリシーが設定されているか確認
2. アプリ説明が十分に詳しいか確認
3. スクリーンショットが要件を満たしているか確認

---

## 📚 参考リソース

- [TWA実装計画](./pwa-twa-implementation-plan.md)
- [TWA進捗状況](./twa-release-progress.md)
- [Google TWA Documentation](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)

---

**次のステップ**: `bubblewrap init` から開始してください。

