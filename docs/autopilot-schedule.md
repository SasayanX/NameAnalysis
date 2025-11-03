# オートパイロット自動実行スケジュール

## 実行時間

オートパイロットは以下の時間に自動実行されます：

1. **7時（JST）** - UTC 22:00（前日）
2. **19時（JST）** - UTC 10:00

## 実行内容

各実行で以下の処理が行われます：

1. **画数データ拡充**
   - CSVインポートデータから新しい漢字を追加

2. **自動SNS共有（X/Twitter）**
   - 有名人・著名人の名前を選択
   - 姓名判断を実行
   - X（旧Twitter）に投稿
   - 重複チェック（既に投稿済みの名前はスキップ）

3. **ブログ記事生成**
   - X投稿された名前からブログ記事を自動生成
   - SEO対策済みのMarkdown形式

4. **メール通知**（オプション）
   - 実行結果をメールで通知（失敗してもオートパイロットは継続）

## デプロイプラットフォーム別設定

### Vercel

`vercel.json`で設定：
```json
{
  "crons": [
    { "path": "/api/autopilot/execute", "schedule": "0 22 * * *" },   // 7時 JST (UTC 22:00 前日)
    { "path": "/api/autopilot/execute", "schedule": "0 10 * * *" }   // 19時 JST (UTC 10:00)
  ]
}
```

### Netlify

`netlify.toml`で設定：
```toml
[[scheduled.functions]]
  name = "autopilot-execute"
  cron = "0 22 * * *"   # 7時 JST (UTC 22:00 前日)

[[scheduled.functions]]
  name = "autopilot-execute"
  cron = "0 10 * * *"   # 19時 JST (UTC 10:00)
```

## 手動実行

自動実行を待たずに手動で実行する場合：

1. **ブラウザから**
   ```
   http://localhost:3000/api/autopilot/execute
   ```
   （POSTリクエストが必要な場合は、管理ページから実行）

2. **管理ページから**
   - `/data-expansion`ページの「オートパイロット実行」ボタン

3. **cURLコマンド**
   ```bash
   curl -X POST http://localhost:3000/api/autopilot/execute
   ```

## 注意事項

- 自動実行はサーバーレス環境（Vercel/Netlify）でのみ動作します
- ローカル開発環境では自動実行されません
- UTC時刻で設定するため、JST（日本標準時）に変換して設定してください
  - JST = UTC + 9時間

## トラブルシューティング

### 自動実行されない場合

1. **Cron設定の確認**
   - Vercel/NetlifyのダッシュボードでCron設定を確認
   - 時刻が正しく設定されているか確認（UTC）

2. **ログの確認**
   - Vercel/Netlifyのログで実行履歴を確認
   - エラーが発生していないか確認

3. **手動実行でテスト**
   - まず手動実行で動作確認
   - エラーがあれば修正してから自動実行を有効化

4. **環境変数の確認**
   - Twitter API認証情報が設定されているか
   - Supabase認証情報が設定されているか

