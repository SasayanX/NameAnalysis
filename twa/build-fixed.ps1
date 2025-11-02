# APKビルドスクリプト（修正版 - メモリエラー対策）

Write-Host "=== APKビルド（修正版） ===" -ForegroundColor Cyan
Write-Host ""

# 1. gradle.propertiesを確認・修正
Write-Host "1. gradle.propertiesを確認..." -ForegroundColor Yellow
$gradleProps = Get-Content gradle.properties -Raw
if ($gradleProps -match "org.gradle.jvmargs=-Xmx1536m") {
    Write-Host "   gradle.propertiesを修正します..." -ForegroundColor Yellow
    $gradleProps = $gradleProps -replace "org.gradle.jvmargs=-Xmx1536m", "org.gradle.jvmargs=-Xmx512m -XX:MaxMetaspaceSize=512m"
    Set-Content gradle.properties -Value $gradleProps -NoNewline
    Write-Host "   OK 修正完了" -ForegroundColor Green
} else {
    Write-Host "   OK 既に修正済み" -ForegroundColor Green
}

Write-Host ""

# 2. Gradleデーモンを停止
Write-Host "2. Gradleデーモンを停止..." -ForegroundColor Yellow
.\gradlew.bat --stop 2>&1 | Out-Null
Write-Host "   OK 停止完了" -ForegroundColor Green

Write-Host ""

# 3. 環境変数を設定
Write-Host "3. メモリ設定を適用..." -ForegroundColor Yellow
$env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
Write-Host "   GRADLE_OPTS = $env:GRADLE_OPTS" -ForegroundColor Gray
Write-Host "   OK 設定完了" -ForegroundColor Green

Write-Host ""

# 4. バージョン情報を確認
Write-Host "4. バージョン情報を確認..." -ForegroundColor Yellow
$manifest = Get-Content twa-manifest.json | ConvertFrom-Json
Write-Host "   appVersionName: $($manifest.appVersionName)" -ForegroundColor Gray
Write-Host "   appVersionCode: $($manifest.appVersionCode)" -ForegroundColor Gray
Write-Host "   OK 確認完了" -ForegroundColor Green

Write-Host ""

# 5. ビルド実行
Write-Host "5. ビルドを開始します..." -ForegroundColor Green
Write-Host "   パスワード入力が必要な場合は、以下のパスワードを使用してください:" -ForegroundColor Yellow
Write-Host "   Key Store Password: P@ssword" -ForegroundColor White
Write-Host "   Key Password: P@ssword" -ForegroundColor White
Write-Host ""

# bubblewrap buildを実行（対話形式で変更適用はスキップ）
# 注意: バージョンは既にtwa-manifest.jsonで設定済み
bubblewrap build --skipPwaValidation

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== ビルド成功！ ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "生成されたファイル:" -ForegroundColor Cyan
    Get-ChildItem -Filter "*.apk","*.aab" | ForEach-Object {
        $sizeMB = [math]::Round($_.Length / 1MB, 2)
        Write-Host "  - $($_.Name) ($sizeMB MB)" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "=== ビルド失敗 ===" -ForegroundColor Red
    Write-Host "エラーコード: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

