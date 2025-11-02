# 最終ビルドスクリプト

Write-Host "=== 最終ビルド手順 ===" -ForegroundColor Cyan
Write-Host ""

# 1. gradle.propertiesを修正
Write-Host "1. gradle.propertiesを修正..." -ForegroundColor Yellow
$gradleContent = Get-Content gradle.properties -Raw
$gradleContent = $gradleContent -replace "org\.gradle\.jvmargs=-Xmx1536m", "org.gradle.jvmargs=-Xmx512m -XX:MaxMetaspaceSize=512m"
Set-Content gradle.properties -Value $gradleContent -NoNewline
Write-Host "   OK" -ForegroundColor Green

# 2. バージョンを確認
Write-Host "2. バージョンを確認..." -ForegroundColor Yellow
$manifest = Get-Content twa-manifest.json | ConvertFrom-Json
Write-Host "   appVersionName: $($manifest.appVersionName)" -ForegroundColor Gray
Write-Host "   appVersionCode: $($manifest.appVersionCode)" -ForegroundColor Gray

# バージョンが3でない場合は修正
if ($manifest.appVersionCode -ne 3) {
    Write-Host "   バージョンコードを3に修正..." -ForegroundColor Yellow
    $manifest.appVersionCode = 3
    $manifest.appVersionName = "3"
    $manifest.appVersion = "3"
    $manifest | ConvertTo-Json -Depth 10 | Set-Content twa-manifest.json -Encoding UTF8
    Write-Host "   OK 修正完了" -ForegroundColor Green
} else {
    Write-Host "   OK バージョンは正しいです" -ForegroundColor Green
}

Write-Host ""

# 3. Gradleデーモンを停止
Write-Host "3. Gradleデーモンを停止..." -ForegroundColor Yellow
.\gradlew.bat --stop | Out-Null
Write-Host "   OK" -ForegroundColor Green

Write-Host ""

# 4. 環境変数を設定
Write-Host "4. メモリ設定を適用..." -ForegroundColor Yellow
$env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
Write-Host "   GRADLE_OPTS: $env:GRADLE_OPTS" -ForegroundColor Gray
Write-Host "   OK" -ForegroundColor Green

Write-Host ""
Write-Host "=== 準備完了 ===" -ForegroundColor Green
Write-Host ""
Write-Host "次のコマンドを実行してください:" -ForegroundColor Yellow
Write-Host "  bubblewrap build --skipPwaValidation" -ForegroundColor White
Write-Host ""
Write-Host "対話形式での入力:" -ForegroundColor Yellow
Write-Host "  1. 'Y' と入力（またはEnter）" -ForegroundColor White
Write-Host "  2. '3' と入力（バージョン名）" -ForegroundColor White
Write-Host "  3. 'P@ssword' と入力（キーストアパスワード）" -ForegroundColor White
Write-Host "  4. 'P@ssword' と入力（キーパスワード）" -ForegroundColor White

