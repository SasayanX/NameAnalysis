# メモリエラー対策付きビルドスクリプト

Write-Host "=== TWA APKビルド（メモリエラー対策版） ===" -ForegroundColor Cyan
Write-Host ""

# 1. 既存のGradleデーモンを停止
Write-Host "既存のGradleデーモンを停止中..." -ForegroundColor Yellow
& .\gradlew.bat --stop 2>&1 | Out-Null

# 2. 環境変数を設定（gradle.propertiesより優先される）
Write-Host "Gradleメモリ設定を環境変数で設定..." -ForegroundColor Yellow
$env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
Write-Host "  GRADLE_OPTS = $env:GRADLE_OPTS" -ForegroundColor Gray

# 3. gradle.propertiesの確認
Write-Host ""
Write-Host "gradle.propertiesの設定を確認..." -ForegroundColor Cyan
$gradleProps = Get-Content gradle.properties | Select-String "jvmargs"
Write-Host "  $gradleProps" -ForegroundColor Gray

Write-Host ""
Write-Host "ビルドを開始します..." -ForegroundColor Green
Write-Host "パスワード入力が必要な場合は、以下のパスワードを使用してください:" -ForegroundColor Yellow
Write-Host "  Key Store Password: P@ssword" -ForegroundColor White
Write-Host "  Key Password: P@ssword" -ForegroundColor White
Write-Host ""

# 4. ビルド実行
bubblewrap build --skipPwaValidation


