# TWA APKビルドガイド

## ビルドコマンド

```bash
cd twa
bubblewrap build
```

## ビルド時の入力

パスワードの入力が必要です：

1. **Keystore password**: `P@ssword` と入力してEnter
2. **Key password** (alias `android`): `P@ssword` と入力してEnter

## 出力先

ビルド成功後、APKファイルは以下の場所に生成されます：

```
twa/app/build/outputs/apk/release/app-release.apk
```

または

```
twa/app-release.apk
```

## ビルド後の確認

ビルドが完了したら、以下のコマンドでAPKファイルの場所を確認：

```bash
# Windows PowerShell
Get-ChildItem -Path . -Filter "*.apk" -Recurse

# または
dir app\build\outputs\apk\release\*.apk
```

## インストール方法

### 方法1: ADBを使用（USBデバッグ有効化が必要）

```bash
adb install app/build/outputs/apk/release/app-release.apk
```

### 方法2: 直接インストール

1. APKファイルをAndroidデバイスに転送（USB、メール、クラウドストレージなど）
2. デバイス上でAPKファイルをタップしてインストール
3. 「不明なソースからのアプリのインストール」を許可（必要な場合）

## トラブルシューティング

### ビルドエラー: Java JDKが見つからない

```bash
# Javaバージョンを確認
java -version

# インストールされていない場合、JDK 17以上をインストール
```

### ビルドエラー: Android SDKが見つからない

```bash
# Android SDKのパスを設定
bubblewrap updateConfig --jdkPath="C:\Program Files\Java\jdk-17" --androidSdkPath="C:\Users\YourName\AppData\Local\Android\Sdk"
```

### ビルドエラー: 署名エラー

- キーストアのパスワードが正しいか確認
- `android.keystore`ファイルが存在するか確認
- エイリアス名が`android`であることを確認

---

**次のアクション**: `bubblewrap build`を実行し、パスワードを入力してください。

