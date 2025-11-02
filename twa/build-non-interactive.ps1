# 非対話形式でビルドを実行するスクリプト

# パスワードを環境変数に設定
$env:KEYSTORE_PASSWORD = "P@ssword"
$env:KEY_PASSWORD = "P@ssword"

# Gradleのメモリ設定を確認
Write-Host "Gradle設定を確認..." -ForegroundColor Cyan
Get-Content gradle.properties | Select-String "jvmargs"

Write-Host ""
Write-Host "ビルドを開始します..." -ForegroundColor Green
Write-Host "パスワード入力が必要な場合は、以下のパスワードを使用してください:" -ForegroundColor Yellow
Write-Host "  Key Store Password: P@ssword" -ForegroundColor White
Write-Host "  Key Password: P@ssword" -ForegroundColor White
Write-Host ""

# bubblewrap buildを実行
# 注意: パスワードは対話形式で入力が必要な場合があります
bubblewrap build

