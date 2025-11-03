# オートパイロット手動実行ガイド

## 🚀 手動で1回実行する方法

### 方法1: ブラウザから実行（推奨・簡単）

1. ブラウザで以下のURLにアクセス：
   ```
   http://localhost:3000/data-expansion
   ```
   または本番環境の場合：
   ```
   https://your-domain.com/data-expansion
   ```

2. ページを開くと「**オートパイロット実行（拡充+共有+メール）**」ボタンが表示されます

3. ボタンをクリック

4. 実行中は「オートパイロット実行中...」と表示されます

5. 実行が完了すると結果が表示されます：
   - ✅ 処理姓名数
   - ✅ 追加漢字数
   - ✅ 共有実行状況
   - ✅ メール送信状況（成功/失敗）

### 方法2: APIエンドポイントから直接実行

#### curlコマンド
```bash
# 開発環境
curl -X POST http://localhost:3000/api/autopilot/execute

# 本番環境
curl -X POST https://your-domain.com/api/autopilot/execute
```

#### GETリクエストでも実行可能
```bash
# GETでも実行可能（テスト用）
curl http://localhost:3000/api/autopilot/execute
```

#### PowerShell（Windows）
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/autopilot/execute" -Method POST
```

## 📊 実行結果の確認

### 成功時のレスポンス例

```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "expansion": {
    "processedNames": 5,
    "missingKanji": 3,
    "addedKanji": 2,
    "errors": 0
  },
  "sharing": {
    "shareableResults": 1,
    "sharedName": "横浜流星",
    "forcedShare": false,
    "email": {
      "sent": true,
      "error": null
    }
  }
}
```

### メール送信失敗時のレスポンス例

```json
{
  "success": true,  // ← 重要：メール送信失敗でも success: true
  "timestamp": "2024-01-15T10:30:00.000Z",
  "expansion": {
    "processedNames": 5,
    "missingKanji": 3,
    "addedKanji": 2,
    "errors": 0
  },
  "sharing": {
    "shareableResults": 1,
    "sharedName": "横浜流星",
    "forcedShare": false,
    "email": {
      "sent": false,
      "error": "メール送信エラーメッセージ"
    }
  }
}
```

## ⚠️ 注意事項

### メール送信について
- **メール送信に失敗しても、オートパイロット自体は成功します**
- ResendのDNS設定が未完了の場合、メール送信のみ失敗します
- その他の処理（画数データ拡充、X投稿、ブログ記事生成）は正常に実行されます

### 実行時間
- 通常：30秒〜2分程度
- 処理内容によって異なります：
  - 画数データ拡充
  - X（Twitter）投稿
  - ブログ記事生成
  - メール通知送信

## 🔍 実行状況の確認

### ブラウザのコンソールで確認
1. ブラウザの開発者ツールを開く（F12）
2. Consoleタブを開く
3. 以下のようなログが表示されます：
   ```
   🚀 オートパイロット実行開始
   📡 API呼び出し中...
   📊 画数データ拡充開始...
   ✅ 画数データ拡充完了: 2個の漢字を追加
   🐦 Xへの投稿開始: 横浜流星さん
   ✅ X投稿成功: Tweet ID 1234567890
   📝 ブログ記事生成開始: 横浜流星さん
   ✅ ブログ記事保存完了
   📧 メール通知送信完了: 横浜流星さん
   🎉 オートパイロット実行完了
   ```

### Netlifyのログで確認
1. Netlify Dashboard → **Functions** → **autopilot-execute**
2. 実行ログを確認

## ❓ よくある質問

### Q: メール送信が失敗したらどうなる？
**A**: メール送信が失敗しても、オートパイロット自体は`success: true`を返します。画数データ拡充、X投稿、ブログ記事生成は正常に実行されます。

### Q: 何回でも実行できる？
**A**: はい、何回でも実行可能です。ただし、同じデータを繰り返し処理することになります。

### Q: 実行中にページを閉じても大丈夫？
**A**: APIはサーバー側で実行されるため、ページを閉じても処理は継続します。ただし、結果の表示はできなくなります。

## 📝 次のステップ

手動実行が成功したら：
1. Netlifyのスケジュール関数が正常に動作しているか確認
2. 自動実行（1日2回）のログを確認
3. ResendのDNS設定を完了させてメール送信機能を有効化（任意）

