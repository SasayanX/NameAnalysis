# APKビルドガイド（メモリエラー対策版）

## 問題

`bubblewrap build`が`bubblewrap update`を内部で実行し、`gradle.properties`を`-Xmx1536m`に上書きしてしまう。

## 解決策

### 方法1: 環境変数を使用（推奨）

```powershell
# 1. 環境変数を設定
$env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"

# 2. ビルド実行
bubblewrap build --skipPwaValidation
```

環境変数`GRADLE_OPTS`は`gradle.properties`より優先されます。

### 方法2: ビルド後に修正（非推奨）

`bubblewrap build`が失敗した場合、`gradle.properties`を修正してから直接`gradlew.bat`を実行する必要がありますが、署名の処理が複雑になります。

## バージョン情報

現在の設定：
- `appVersionName`: "3"
- `appVersionCode`: 3

## ビルド手順

1. **環境変数を設定**:
   ```powershell
   $env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
   ```

2. **ビルド実行**:
   ```powershell
   bubblewrap build --skipPwaValidation
   ```

3. **対話形式の入力**:
   - `There are changes in twa-manifest.json...` → `Y` (またはEnter)
   - `versionName for the new App version:` → `3` (またはEnter)
   - `Password for the Key Store:` → `P@ssword`
   - `Password for the Key:` → `P@ssword`

4. **ビルド完了を確認**:
   - `app-release-signed.apk`が生成される
   - `app-release-bundle.aab`が生成される

## 注意事項

- `bubblewrap update`が実行されると`gradle.properties`が上書きされる可能性があります
- 環境変数`GRADLE_OPTS`を使用することで、この問題を回避できます
- バージョンは対話形式で聞かれた場合、`3`と入力してください

