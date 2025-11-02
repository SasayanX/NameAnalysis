# Digital Asset Links検証方法

## 🌐 Webサイトでの確認

### 1. Asset Linksファイルにアクセス

ブラウザで以下にアクセス：
```
https://seimei.app/.well-known/assetlinks.json
```

**期待される内容**:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.nameanalysis.ai",
      "sha256_cert_fingerprints": [
        "B766698D95C2B3A1E236143DE6DC91343DFBFD5732C8C117F0F30E46F9DC15A9"
      ]
    }
  }
]
```

### 2. Google Digital Asset Links検証ツール

以下にアクセスして検証：
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://seimei.app&relation=delegate_permission/common.handle_all_urls
```

**期待される応答**:
```json
{
  "statements": [
    {
      "source": {
        "web": {
          "site": "https://seimei.app"
        }
      },
      "relation": "delegate_permission/common.handle_all_urls",
      "target": {
        "android_app": {
          "package_name": "com.nameanalysis.ai",
          "sha256_cert_fingerprints": [
            "B766698D95C2B3A1E236143DE6DC91343DFBFD5732C8C117F0F30E46F9DC15A9"
          ]
        }
      }
    }
  ]
}
```

## 📱 Androidデバイスでの確認

### 方法1: ADBコマンド（開発者向け）

```bash
# デバイスに接続
adb devices

# アプリリンク設定を確認
adb shell pm get-app-links com.nameanalysis.ai

# 期待される出力:
# com.nameanalysis.ai:
#     ID: <random-id>
#     Signatures: [B766698D95C2B3A1E236143DE6DC91343DFBFD5732C8C117F0F30E46F9DC15A9]
#     Domain verification state:
#       seimei.app: verified
```

### 方法2: 設定アプリから確認

1. **設定** → **アプリ** → **まいにちAI姓名判断** を開く
2. **開く** または **詳細** をタップ
3. **サイト設定** または **アプリリンク** を確認
4. 「このサイトがアプリを検証済み」と表示されていることを確認

### 方法3: コマンドラインで確認（詳細）

```bash
# アプリリンクの詳細を確認
adb shell pm get-app-links --user cur com.nameanalysis.ai

# ドメイン検証状態を確認
adb shell pm verify-app-links --re-verify com.nameanalysis.ai
```

## 🔍 検証手順

### ステップ1: WebサイトのAsset Linksファイルを確認

```powershell
# PowerShellで確認
Invoke-WebRequest -Uri "https://seimei.app/.well-known/assetlinks.json" | Select-Object -ExpandProperty Content
```

### ステップ2: 正しいMIMEタイプで配信されているか確認

```powershell
$response = Invoke-WebRequest -Uri "https://seimei.app/.well-known/assetlinks.json"
$response.Headers['Content-Type']
# 期待値: application/json
```

### ステップ3: Androidデバイスで検証

1. APKをインストール
2. アプリを起動
3. 設定アプリでアプリリンクの状態を確認
4. `seimei.app`へのリンクが検証済みになっていることを確認

## ⚠️ よくある問題と解決方法

### 問題1: Asset Linksファイルが見つからない

**症状**: 404エラーが返される

**解決方法**:
1. `public/.well-known/assetlinks.json`が存在するか確認
2. デプロイ後に正しく配置されているか確認
3. サーバーの設定で`.well-known`ディレクトリが正しく配信されているか確認

### 問題2: SHA256フィンガープリントが一致しない

**症状**: アプリリンクが検証されない

**解決方法**:
1. 現在のキーストアからフィンガープリントを再取得:
   ```bash
   keytool -list -v -keystore android.keystore -alias android
   ```
2. `assetlinks.json`のフィンガープリントを更新
3. 再度デプロイ

### 問題3: アプリがTWAモードで起動しない

**症状**: カスタムタブで開かれる

**解決方法**:
1. Digital Asset Linksの検証が完了しているか確認
2. Chromeが最新バージョンか確認
3. アプリを再インストール
4. デバイスの設定でアプリリンクを有効化

## ✅ 検証チェックリスト

- [ ] `https://seimei.app/.well-known/assetlinks.json`にアクセスできる
- [ ] Asset Linksファイルの内容が正しい
- [ ] MIMEタイプが`application/json`である
- [ ] SHA256フィンガープリントが正しい
- [ ] Google検証ツールで検証が成功する
- [ ] Androidデバイスでアプリリンクが検証済みになっている
- [ ] アプリがTWAモード（standalone）で起動する

