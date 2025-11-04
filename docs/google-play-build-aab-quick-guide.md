# AABファイルビルド - クイックガイド

## 現在の設定

- **パッケージ名**: `com.nameanalysis.ai`
- **バージョンコード**: `5`
- **バージョン名**: `5`
- **ドメイン**: `seimei.app`

## ビルド手順

### 方法1: Bubblewrapを使用（推奨）

```bash
cd twa
bubblewrap build --release
```

**出力ファイル**: `twa/app/build/outputs/bundle/release/app-release.aab`

### 方法2: Gradleを直接使用

```bash
cd twa/app
./gradlew bundleRelease
```

**出力ファイル**: `twa/app/build/outputs/bundle/release/app-release.aab`

## バージョンコードの更新

新しいビルドをアップロードする前に、必ずバージョンコードを増やしてください。

**編集ファイル**: `twa/app/build.gradle`

```gradle
defaultConfig {
    versionCode 6  // 5から6に増やす
    versionName "6"  // 5から6に増やす
}
```

## ビルド前の確認事項

- [ ] 本番環境（`seimei.app`）に最新のコードがデプロイされている
- [ ] `assetlinks.json`が正しく配信されている（`https://seimei.app/.well-known/assetlinks.json`）
- [ ] バージョンコードを更新した
- [ ] すべての変更をコミット・プッシュした

## ビルド後の確認事項

- [ ] AABファイルが生成されている
- [ ] ファイルサイズが100MB以下である
- [ ] ビルドエラーがない

## Google Play Consoleへのアップロード

1. [Google Play Console](https://play.google.com/console) にログイン
2. **アプリを選択** → **テスト** → **内部テスト**
3. **「新しいリリースを作成」** をクリック
4. **「アプリバンドルをアップロード」** をクリック
5. `app-release.aab` を選択してアップロード
6. リリースノートを入力
7. **「レビューを開始」** をクリック

## テストリンクの共有

1. **「テスター」** タブをクリック
2. **「テストリンクをコピー」** をクリック
3. テスターにリンクを共有

テスターはこのリンクからアプリをインストールできます。

