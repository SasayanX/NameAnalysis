# APK再ビルド手順（詳細鑑定制限修正版）

## 修正内容

無料プランで詳細鑑定の内容が全部見れてしまう問題を修正しました。

### 修正ファイル
- `components/name-analysis-result.tsx` - プラン判定と表示制御の強化
- `app/ClientPage.tsx` - `currentPlan`の初期化処理の強化

## ビルド手順

### 1. バージョンアップ

`twa-manifest.json`のバージョンが既に更新されています：
- `appVersionName`: "3"
- `appVersionCode`: 3

### 2. ビルド実行

ターミナルで以下のコマンドを実行：

```powershell
$env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
bubblewrap build --skipPwaValidation
```

### 3. 対話形式の入力

プロンプトが表示されたら：

```
? There are changes in twa-manifest.json. Would you like to apply them to the project before building? (Y/n)
```

**入力**: `Y` と入力してEnter（または単にEnterキーを押す）

⚠️ **注意**: `q`を入力しないでください！

### 4. パスワード入力

パスワードの入力プロンプトが2回表示されます：

1. **Key Store Password**: `P@ssword` と入力してEnter
2. **Key Password**: `P@ssword` と入力してEnter

パスワードは画面に表示されませんが、正常に入力されています。

### 5. ビルド完了

以下のファイルが生成されます：
- `app-release-signed.apk` - 署名済みAPK（新しいバージョン）
- `app-release-bundle.aab` - Android App Bundle

## テスト確認

新しいAPKをインストール後、以下を確認してください：

1. 無料プランで詳細鑑定タブを開く
2. 以下が非表示になっていることを確認：
   - カテゴリーの詳細説明（`description`/`explanation`）
   - 詳細分析セクション
   - 文字別画数
   - 霊数情報
   - 詳細アドバイス
   - AI開運アドバイス
3. 以下が表示されていることを確認：
   - 五格の数値と運勢
   - 「詳細な解説は有料プランでご覧いただけます」メッセージ
   - アップグレード誘導カード

## ファイル場所

ビルド完了後、新しいAPKは以下にあります：
```
D:\project\NameAnalysis\twa\app-release-signed.apk
```

