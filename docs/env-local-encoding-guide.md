# .env.local ファイルの文字コード（エンコーディング）設定ガイド

## ⚠️ 問題: 環境変数が読み込まれない

`.env.local`ファイルをエディタで編集している場合、**文字コード（エンコーディング）の問題**で環境変数が正しく読み込まれないことがあります。

## ✅ 正しい設定

### 文字コード（エンコーディング）
- **UTF-8（BOMなし）** で保存する必要があります
- Windowsのメモ帳などは、デフォルトで **UTF-8 with BOM** や **Shift-JIS** で保存することがあります

### 改行コード
- **LF（`\n`）** または **CRLF（`\r\n`）** のどちらでも動作します
- ただし、値の中に改行が含まれている場合は問題になります

## 🔧 解決方法

### 方法1: VS Codeで設定

1. VS Codeで `.env.local` を開く
2. 右下のエンコーディング表示をクリック（例: "UTF-8 with BOM" や "Shift-JIS"）
3. **"Save with Encoding"** を選択
4. **"UTF-8"** を選択（**"UTF-8 with BOM" ではない**）

### 方法2: PowerShellで自動修正

以下のコマンドを実行すると、自動的にUTF-8（BOMなし）で再保存されます：

```powershell
$content = Get-Content .env.local -Raw -Encoding UTF8
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText(".env.local", $content, $utf8NoBom)
```

### 方法3: ファイルを再作成

1. 現在の `.env.local` の内容をコピー
2. ファイルを削除
3. VS Codeで新規ファイルを作成
4. 右下のエンコーディングを **"UTF-8"** に設定
5. 内容を貼り付け
6. 保存

## 🔍 確認方法

### PowerShellで確認

```powershell
# BOMの有無を確認
$bytes = [System.IO.File]::ReadAllBytes(".env.local")
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    Write-Host "⚠️ UTF-8 with BOM（BOMあり）"
} else {
    Write-Host "✅ BOMなし"
}
```

### VS Codeで確認

1. `.env.local` を開く
2. 右下のステータスバーを確認
   - **"UTF-8"** → ✅ 正しい
   - **"UTF-8 with BOM"** → ⚠️ BOMを削除する必要がある
   - **"Shift-JIS"** や **"EUC-JP"** → ⚠️ UTF-8に変換する必要がある

## ⚠️ よくある問題

### 問題1: UTF-8 with BOM

**症状**: 環境変数が読み込まれない、または値が正しくない

**原因**: BOM（Byte Order Mark）がファイルの先頭に含まれている

**解決**: UTF-8（BOMなし）で再保存

### 問題2: Shift-JISやEUC-JP

**症状**: 日本語コメントが文字化けする、環境変数が読み込まれない

**原因**: 日本語環境のエディタが自動的にShift-JISで保存している

**解決**: UTF-8で明示的に保存

### 問題3: 値の中に改行が含まれている

**症状**: 環境変数の値が途中で切れる、複数行に分かれる

**原因**: 長い値（JWTトークンなど）が複数行に分かれている

**解決**: 値を1行で記述する（改行を削除）

## 📝 正しい .env.local の例

```env
# Square Sandbox環境
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw
SQUARE_ACCESS_TOKEN=EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe
SQUARE_LOCATION_ID=LYGVDVHKBNYZC

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vchhiqsenoykypfydaon.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjaGhpcXNlbm95a3lwZnlkYW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Njk1ODYsImV4cCI6MjA3NzM0NTU4Nn0.B-G93izxuT_GVjo9NGyPYJXdzDh-4uHDGMNlFN6EgLw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjaGhpcXNlbm95a3lwZnlkYW9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc2OTU4NiwiZXhwIjoyMDc3MzQ1NTg2fQ.uRbZbpXYpv-L5dgRoxLiDSJfEn0yOPeCtCuZIWDm7Js
```

**重要**: 
- すべての値は1行で記述する
- 長いJWTトークンも改行せずに1行で記述する
- ファイルはUTF-8（BOMなし）で保存する

## 🛠️ 設定後の確認

1. ファイルをUTF-8（BOMなし）で保存
2. **開発サーバーを再起動**（重要！）
3. ターミナルのログで環境変数が読み込まれているか確認

```bash
# 開発サーバーを再起動
npm run dev
```

## 📚 参考

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [VS Code Encoding](https://code.visualstudio.com/docs/editor/codebasics#_file-encoding)



