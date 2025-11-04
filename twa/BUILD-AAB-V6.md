# サイン入りAABビルド手順（バージョン6）

## 前提条件

- `bubblewrap`がインストールされていること
- `android.keystore`が`twa`ディレクトリに存在すること
- キーストアのパスワード: `P@ssword`

## ビルド手順

### 1. バージョン確認

以下のファイルがバージョン6に更新されていることを確認：
- `twa/app/build.gradle`: `versionCode 6`, `versionName "6"`
- `twa/twa-manifest.json`: `appVersionCode: 6`, `appVersionName: "6"`

### 2. 環境変数の設定

PowerShellで以下を実行：

```powershell
cd twa
$env:KEYSTORE_PASSWORD = "P@ssword"
$env:KEY_PASSWORD = "P@ssword"
```

### 3. AABビルド実行

```powershell
bubblewrap build --skipPwaValidation
```

### 4. 対話形式の入力

ビルド中に以下の質問が表示される場合があります：

1. **twa-manifest.jsonに変更がありますか？**
   - `Y` を入力（またはEnter）

2. **新しいアプリバージョンのversionName:**
   - `6` を入力（またはEnter）

3. **キーストアのパスワード:**
   - `P@ssword` を入力

4. **キーのパスワード:**
   - `P@ssword` を入力

### 5. ビルド完了確認

ビルドが成功すると、以下のファイルが生成されます：

- `twa/app-release-bundle.aab` - サイン入りAABファイル

### 6. ビルドファイルの場所

AABファイルは以下の場所に生成されます：
```
twa/app-release-bundle.aab
```

または

```
twa/app/build/outputs/bundle/release/app-release.aab
```

## トラブルシューティング

### Android SDKが見つからないエラー

`local.properties`ファイルを作成：

```properties
sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

または、`ANDROID_HOME`環境変数を設定：

```powershell
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
```

### メモリ不足エラー

`gradle.properties`を確認：

```properties
org.gradle.jvmargs=-Xmx512m -XX:MaxMetaspaceSize=512m
```

## 現在の設定

- **バージョンコード**: 6
- **バージョン名**: "6"
- **パッケージ名**: com.nameanalysis.ai
- **ホスト名**: seimei.app
- **キーストア**: android.keystore
- **エイリアス**: android

