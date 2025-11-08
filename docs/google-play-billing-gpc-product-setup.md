# Google Play Console - 商品追加を有効化する手順

## 問題

Google Play Console（GPC）で商品追加ができない場合、アプリ側で先にBillingの設定を行う必要があります。

## 解決方法

アプリ側でDigital Goods APIを初期化するコードを実装し、AABを再ビルドしてアップロードすることで、GPCで商品追加ができるようになります。

## 実装済みの内容

### 1. twa-manifest.jsonの設定 ✅

`twa/twa-manifest.json`に`playBilling`機能を有効化済み：

```json
{
  "features": {
    "playBilling": {
      "enabled": true
    }
  }
}
```

### 2. Digital Goods APIの初期化コード ✅

以下のファイルを作成済み：

- `lib/google-play-billing-detector.ts` - Digital Goods APIの初期化
- `components/google-play-billing-initializer.tsx` - アプリ起動時の自動初期化
- `app/layout.tsx` - 初期化コンポーネントを追加

## 次のステップ

### ステップ1: BubblewrapでAABを再ビルド

```bash
cd twa
bubblewrap update
bubblewrap build
```

または、既存の設定を維持して再ビルド：

```bash
cd twa
bubblewrap build
```

これにより、`playBilling`機能が有効化されたAABが生成されます。

出力ファイル：
- `twa/app-release-bundle.aab`

### ステップ2: Google Play ConsoleにAABをアップロード

1. [Google Play Console](https://play.google.com/console)にログイン
2. **まいにちAI姓名判断** アプリを選択
3. **テスト** → **内部テスト** を選択
4. **新しいリリースを作成** をクリック
5. AABファイルをアップロード：
   - `twa/app-release-bundle.aab`
6. **リリース名**: `v6 - Google Play Billing対応`
7. **リリースノート**: `Google Play Billing対応のため再ビルド`
8. **保存** をクリック

### ステップ3: Google Playの処理を待つ

- AABのアップロード後、Google Playが処理を開始します
- 通常、数分〜数時間かかります
- 処理が完了すると、**収益化** → **商品** → **サブスクリプション** で商品追加が可能になります

### ステップ4: 商品追加が可能になったことを確認

1. Google Play Console → **収益化** → **商品** → **サブスクリプション**
2. **商品を作成** ボタンが有効になっていることを確認
3. 商品を作成（詳細は `docs/google-play-console-subscription-setup.md` を参照）

## 重要なポイント

### なぜ必要か？

Google Playは、アプリにBilling APIの実装が含まれていることを確認してから、商品追加を許可します。これにより：

1. **セキュリティ**: 不正な商品追加を防止
2. **互換性**: アプリがBilling APIに対応していることを確認
3. **品質**: 適切な実装が行われていることを保証

### 最小限の実装で十分

完全な購入機能を実装する必要はありません。以下の最小限の実装で十分です：

- Digital Goods APIの初期化（✅ 実装済み）
- `playBilling`機能の有効化（✅ 実装済み）
- AABのアップロード（⏳ 次のステップ）

### 確認方法

AABをアップロード後、以下のログで初期化が成功しているか確認できます：

```javascript
// ブラウザのコンソール（TWA環境で）
[Google Play Billing] Digital Goods API initialized successfully
```

または、Web版では：

```javascript
[Google Play Billing] Digital Goods API is not available (not in TWA environment)
```

これは正常です（Web版では利用不可）。

## トラブルシューティング

### AABをアップロードしても商品追加ができない

1. **AABの処理が完了しているか確認**
   - Google Play Console → **リリース** → **内部テスト**
   - アップロードしたAABのステータスを確認

2. **数時間待つ**
   - Google Playの処理には時間がかかることがあります
   - 最大24時間程度待つ必要がある場合があります

3. **AABに`playBilling`が含まれているか確認**
   ```bash
   cd twa
   bubblewrap fingerprint
   ```
   `twa-manifest.json`の`features.playBilling`が`true`であることを確認

4. **Bubblewrapのバージョンを確認**
   ```bash
   bubblewrap --version
   ```
   1.8.2以上が推奨です

### Digital Goods APIが初期化されない

- TWA環境（Androidアプリ内）でのみ利用可能です
- Web版では利用不可（これは正常です）
- 実際のAndroidアプリで確認してください

## 参考資料

- [Digital Goods API - Chrome Developers](https://developer.chrome.com/docs/android/trusted-web-activity/receive-payments-play-billing)
- [Bubblewrap - Play Billing](https://github.com/GoogleChromeLabs/bubblewrap)
- [Google Play Billing - Getting Started](https://developer.android.com/google/play/billing/getting-ready)


