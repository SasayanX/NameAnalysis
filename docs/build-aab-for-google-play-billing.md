# AAB再ビルド手順 - Google Play Billing対応

## 概要

Google Play Consoleで商品追加を有効化するために、`playBilling`機能を有効化したAABを再ビルドする必要があります。

## 前提条件

✅ **完了済み**:
- `twa-manifest.json`で`playBilling`機能を有効化
- Digital Goods APIの初期化コードを実装
- アプリレイアウトに初期化コンポーネントを追加

## ビルド手順

### 方法1: 既存設定を維持して再ビルド（推奨）

```bash
cd twa
bubblewrap build
```

これにより、`twa-manifest.json`の設定（`playBilling`を含む）が反映されたAABが生成されます。

### 方法2: 設定を更新してからビルド

```bash
cd twa
bubblewrap update
bubblewrap build
```

`bubblewrap update`は、`twa-manifest.json`の変更を`app/build.gradle`に反映します。

## 出力ファイル

ビルド完了後、以下のファイルが生成されます：

- **AABファイル**: `twa/app-release-bundle.aab`
- **APKファイル**（オプション）: `twa/app-release-signed.apk`

## アップロード準備

### 1. バージョン番号の確認

`twa-manifest.json`を確認：

```json
{
  "appVersionName": "6",
  "appVersionCode": 6
}
```

Google Play Consoleに既にアップロード済みの場合は、バージョン番号を増やす必要があります：

```json
{
  "appVersionName": "7",
  "appVersionCode": 7
}
```

### 2. 署名キーの確認

`twa-manifest.json`で署名キーのパスを確認：

```json
{
  "signingKey": {
    "path": "D:\\project\\NameAnalysis\\twa\\android.keystore",
    "alias": "android"
  }
}
```

既存のキーストアファイルが存在することを確認してください。

## Google Play Consoleへのアップロード

### 1. 内部テストトラックにアップロード

1. [Google Play Console](https://play.google.com/console)にログイン
2. **まいにちAI姓名判断** アプリを選択
3. **テスト** → **内部テスト** を選択
4. **新しいリリースを作成** をクリック
5. AABファイルをアップロード：
   - `twa/app-release-bundle.aab`
6. **リリース名**: `v7 - Google Play Billing対応`
7. **リリースノート**: 
   ```
   Google Play Billing対応のため再ビルド
   - Digital Goods APIの初期化を実装
   - playBilling機能を有効化
   ```
8. **保存** をクリック

### 2. レビューを開始（オプション）

- 内部テストトラックでは、レビューなしで即座に利用可能です
- 本番リリースの場合は、レビューが必要です

## 確認手順

### 1. AABの処理完了を待つ

- Google Play Console → **リリース** → **内部テスト**
- アップロードしたAABのステータスが「完了」になるまで待つ
- 通常、数分〜数時間かかります

### 2. 商品追加が可能になったことを確認

1. Google Play Console → **収益化** → **商品** → **サブスクリプション**
2. **商品を作成** ボタンが有効になっていることを確認
3. 商品作成が可能であれば成功です

### 3. アプリ側での動作確認（オプション）

内部テストトラックからアプリをインストールして、コンソールログを確認：

```javascript
// 正常な場合
[Google Play Billing] Digital Goods API initialized successfully
[Google Play Billing] Initialized - GPCで商品追加が可能になります
```

## トラブルシューティング

### ビルドエラーが発生する

1. **Bubblewrapのバージョンを確認**
   ```bash
   bubblewrap --version
   ```
   1.8.2以上が推奨です

2. **Java開発環境を確認**
   ```bash
   java -version
   ```
   Java 8以上が必要です

3. **Android SDKのパスを確認**
   `twa/local.properties`にAndroid SDKのパスが設定されているか確認

### AABをアップロードできない

1. **バージョン番号を確認**
   - 既存のバージョンより大きい必要があります
   - `appVersionCode`を増やしてください

2. **署名キーを確認**
   - 既存のキーストアを使用している場合、同じキーストアを使用してください
   - 新しいキーストアを使用する場合は、Google Play Consoleでキーを登録する必要があります

### 商品追加がまだできない

1. **AABの処理が完了しているか確認**
   - ステータスが「完了」になっているか確認
   - 最大24時間程度かかる場合があります

2. **数時間待つ**
   - Google Playの内部処理には時間がかかることがあります

3. **別のアプリで確認**
   - 既に別のアプリでBillingを使っている場合、そのアプリで商品追加ができるか確認
   - マーチャントアカウントの設定が完了しているか確認

## 次のステップ

AABをアップロードして商品追加が可能になったら：

1. ✅ サブスクリプション商品を作成（`basic-monthly`, `premium-monthly`）
2. ⏳ 完全な購入フローの実装（Digital Goods API）
3. ⏳ サーバー側での購入検証
4. ⏳ テストとデバッグ

詳細は以下を参照：
- `docs/google-play-console-subscription-setup.md` - 商品追加手順
- `docs/google-play-billing-bubblewrap-implementation.md` - 完全実装ガイド

