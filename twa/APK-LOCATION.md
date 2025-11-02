# APKファイルの場所

## 📍 ファイルパス

生成されたAPKファイルは以下の場所にあります：

```
D:\project\NameAnalysis\twa\
```

## 📦 生成されたファイル

1. **`app-release-signed.apk`** (4.41 MB)
   - **フルパス**: `D:\project\NameAnalysis\twa\app-release-signed.apk`
   - **説明**: 署名済みAndroid APK（インストール可能）
   - **用途**: Androidデバイスに直接インストール

2. **`app-release-bundle.aab`** (4.53 MB)
   - **フルパス**: `D:\project\NameAnalysis\twa\app-release-bundle.aab`
   - **説明**: Android App Bundle
   - **用途**: Google Play Consoleにアップロード

3. **`app-release-unsigned-aligned.apk`** (4.37 MB)
   - **フルパス**: `D:\project\NameAnalysis\twa\app-release-unsigned-aligned.apk`
   - **説明**: 署名前のアライン済みAPK
   - **用途**: 開発・デバッグ用（通常は使用しない）

## 🚀 使用方法

### Androidデバイスにインストールする場合

1. `app-release-signed.apk`をAndroidデバイスに転送（USB経由、またはクラウド経由）
2. デバイス側で「不明なソースからのアプリのインストール」を許可
3. APKファイルをタップしてインストール

### Google Play Consoleにアップロードする場合

1. `app-release-bundle.aab`を使用
2. Play Console → アプリ → リリース → 内部テスト/クローズドテスト/オープンテスト
3. バンドルをアップロード

## 📂 ファイル検索コマンド

PowerShellで検索する場合：

```powershell
cd D:\project\NameAnalysis\twa
Get-ChildItem *.apk,*.aab | Select-Object FullName
```

または、エクスプローラーで開く場合：

```
エクスプローラーで以下のパスを開く:
D:\project\NameAnalysis\twa
```

