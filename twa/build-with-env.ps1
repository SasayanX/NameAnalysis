# TWA APKビルドスクリプト（環境変数方式）

# Gradleのメモリ設定を環境変数で指定
# これにより、gradle.propertiesが上書きされても適用される
$env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"

Write-Host "Gradleメモリ設定: $env:GRADLE_OPTS" -ForegroundColor Cyan
Write-Host ""
Write-Host "ビルドを開始します..." -ForegroundColor Green
Write-Host "パスワード入力が必要な場合は、以下のパスワードを使用してください:" -ForegroundColor Yellow
Write-Host "  Key Store Password: P@ssword" -ForegroundColor White
Write-Host "  Key Password: P@ssword" -ForegroundColor White
Write-Host ""

# bubblewrap buildを実行
bubblewrap build --skipPwaValidation

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ビルド成功！" -ForegroundColor Green
    Write-Host "生成されたファイル:" -ForegroundColor Cyan
    Get-ChildItem -Filter "*.apk","*.aab" | ForEach-Object {
        Write-Host "  - $($_.Name) ($([math]::Round($_.Length / 1MB, 2)) MB)" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "❌ ビルド失敗" -ForegroundColor Red
    exit $LASTEXITCODE
}

