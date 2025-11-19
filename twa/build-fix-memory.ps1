# メモリエラー対策付きビルドスクリプト（強化版）

Write-Host "=== TWA APKビルド（メモリエラー対策版 v2） ===" -ForegroundColor Cyan
Write-Host ""

# 1. 既存のGradleデーモンを停止
Write-Host "[1/5] 既存のGradleデーモンを停止中..." -ForegroundColor Yellow
& .\gradlew.bat --stop 2>&1 | Out-Null
Start-Sleep -Seconds 2

# 2. gradle.propertiesを確認・修正
Write-Host "[2/5] gradle.propertiesを確認..." -ForegroundColor Yellow
$gradlePropsPath = "gradle.properties"
if (Test-Path $gradlePropsPath) {
    $content = Get-Content $gradlePropsPath -Raw
    if ($content -match "org\.gradle\.jvmargs=-Xmx1536m") {
        Write-Host "  gradle.propertiesのメモリ設定を修正中..." -ForegroundColor Gray
        $content = $content -replace "org\.gradle\.jvmargs=-Xmx1536m", "org.gradle.jvmargs=-Xmx512m -XX:MaxMetaspaceSize=512m"
        Set-Content -Path $gradlePropsPath -Value $content -NoNewline
        Write-Host "  ✅ 修正完了" -ForegroundColor Green
    } else {
        Write-Host "  ✅ 既に適切な設定です" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️ gradle.propertiesが見つかりません" -ForegroundColor Yellow
}

# 3. 環境変数を設定（gradle.propertiesより優先される）
Write-Host "[3/5] Gradleメモリ設定を環境変数で設定..." -ForegroundColor Yellow
$env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
Write-Host "  GRADLE_OPTS = $env:GRADLE_OPTS" -ForegroundColor Gray

# 4. グローバルGradle設定も確認
Write-Host "[4/5] グローバルGradle設定を確認..." -ForegroundColor Yellow
$globalGradleProps = "$env:USERPROFILE\.gradle\gradle.properties"
if (Test-Path $globalGradleProps) {
    $globalContent = Get-Content $globalGradleProps -Raw
    if ($globalContent -match "org\.gradle\.jvmargs=-Xmx1536m") {
        Write-Host "  グローバル設定も修正が必要です: $globalGradleProps" -ForegroundColor Yellow
    }
}

# 5. 現在の設定を表示
Write-Host "[5/5] 現在の設定を確認..." -ForegroundColor Cyan
$currentProps = Get-Content gradle.properties | Select-String "jvmargs"
Write-Host "  gradle.properties: $currentProps" -ForegroundColor Gray
Write-Host "  環境変数 GRADLE_OPTS: $env:GRADLE_OPTS" -ForegroundColor Gray

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ビルドを開始します..." -ForegroundColor Green
Write-Host "パスワード入力が必要な場合は、以下のパスワードを使用してください:" -ForegroundColor Yellow
Write-Host "  Key Store Password: P@ssword" -ForegroundColor White
Write-Host "  Key Password: P@ssword" -ForegroundColor White
Write-Host "  バージョン名: 13" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 6. ビルド実行
bubblewrap build --skipPwaValidation

