# TWA APKビルド成功！

## ✅ ビルド完了

以下のファイルが生成されました：

- `app-release-signed.apk` - 署名済みAndroid APK
- `app-release-bundle.aab` - Android App Bundle

## 🔧 解決した問題

### メモリエラー

**問題**: `bubblewrap build`実行時に以下のエラーが発生：
```
Error occurred during initialization of VM
Could not reserve enough space for 1572864KB object heap
```

**原因**: 
- `gradle.properties`で`-Xmx512m`に設定しても、`bubblewrap`が内部で`-Xmx1536m`を指定していた
- `bubblewrap update`で`gradle.properties`が上書きされる可能性がある

**解決策**: 
環境変数`GRADLE_OPTS`を使用してメモリ設定を指定：

```powershell
$env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
bubblewrap build --skipPwaValidation
```

または、スクリプトを使用：

```powershell
.\build-with-env.ps1
```

## 📝 次のステップ

1. **APKのインストールとテスト**
   - `app-release-signed.apk`をAndroidデバイスに転送
   - インストールして動作確認

2. **Digital Asset Linksの確認**
   - `https://seimei.app/.well-known/assetlinks.json`がアクセス可能か確認
   - SHA256フィンガープリントが正しいか確認

3. **Play Consoleへのアップロード準備**
   - `app-release-bundle.aab`をGoogle Play Consoleにアップロード
   - テストトラックで配布して検証

## ⚠️ 注意事項

- **`bubblewrap update`実行後**は、必ず`GRADLE_OPTS`環境変数を設定するか、`gradle.properties`を確認・修正してください
- ビルドスクリプト`build-with-env.ps1`を使用することで、この問題を回避できます

