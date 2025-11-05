# 開発サーバー再起動ガイド

## 問題

Next.jsの静的ファイル（`_next/static/chunks/*.js`）が見つからないエラーが発生し、ボタンが押せない状態になっています。

## 解決方法

### 1. 開発サーバーを完全に停止

現在実行中の開発サーバーを停止してください：
- ターミナルで `Ctrl + C` を押す
- または、タスクマネージャーでNode.jsプロセスを終了

### 2. `.next`フォルダを削除

```powershell
# PowerShellで実行
Remove-Item -Recurse -Force .next
```

または手動で `.next` フォルダを削除

### 3. 開発サーバーを再起動

```bash
npm run dev
```

### 4. ブラウザをハードリフレッシュ

- Windows: `Ctrl + Shift + R` または `Ctrl + F5`
- Mac: `Cmd + Shift + R`

## 確認事項

再起動後、以下を確認してください：

1. ターミナルにエラーが出ていないか
2. `http://localhost:3000` にアクセスできるか
3. コンソールエラー（F12）が消えているか
4. 「姓名判断を実行」ボタンが押せるか

## それでも解決しない場合

1. **Node.jsのバージョンを確認**
   ```bash
   node --version
   ```
   Next.js 14以上には Node.js 18以上が必要です

2. **依存関係を再インストール**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **ポート3000が使用中でないか確認**
   ```powershell
   netstat -ano | findstr :3000
   ```

