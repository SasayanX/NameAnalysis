# APKビルドスクリプト（パスワード付き）

$password = "P@ssword"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Android APKビルド開始" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# パスワードを環境変数に設定してビルド
$env:KEYSTORE_PASSWORD = $password
$env:KEY_PASSWORD = $password

Write-Host "署名キーのパスワードを設定しました" -ForegroundColor Green
Write-Host ""

# bubblewrap buildを実行
# 注意: パスワードは対話形式で入力が必要な場合があります
bubblewrap build

