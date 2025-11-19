# 直接Gradleを使用してビルド（bubblewrapを回避）

Write-Host "=== 直接Gradleビルド（メモリエラー対策） ===" -ForegroundColor Cyan
Write-Host ""

# 1. Gradleデーモンを停止
Write-Host "[1/4] Gradleデーモンを停止..." -ForegroundColor Yellow
& .\gradlew.bat --stop 2>&1 | Out-Null
Start-Sleep -Seconds 3

# 2. gradle.propertiesを確実に修正
Write-Host "[2/4] gradle.propertiesを修正..." -ForegroundColor Yellow
$gradleProps = @"
# Project-wide Gradle settings.
# IDE (e.g. Android Studio) users:
# Gradle settings configured through the IDE *will override*
# any settings specified in this file.
# For more details on how to configure your build environment visit
# http://www.gradle.org/docs/current/userguide/build_environment.html
# Specifies the JVM arguments used for the daemon process.
# The setting is particularly useful for tweaking memory settings.
org.gradle.jvmargs=-Xmx512m -XX:MaxMetaspaceSize=512m
# When configured, Gradle will run in incubating parallel mode.
# This option should only be used with decoupled projects. More details, visit
# http://www.gradle.org/docs/current/userguide/multi_project_builds.html#sec:decoupled_projects
# org.gradle.parallel=true
android.useAndroidX=true
"@
Set-Content -Path "gradle.properties" -Value $gradleProps
Write-Host "  ✅ gradle.propertiesを修正しました" -ForegroundColor Green

# 3. 環境変数を設定
Write-Host "[3/4] 環境変数を設定..." -ForegroundColor Yellow
$env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
$env:ORG_GRADLE_DAEMON_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
Write-Host "  GRADLE_OPTS = $env:GRADLE_OPTS" -ForegroundColor Gray

# 4. グローバルGradle設定も確認
Write-Host "[4/4] グローバルGradle設定を確認..." -ForegroundColor Yellow
$globalGradleDir = "$env:USERPROFILE\.gradle"
$globalGradleProps = "$globalGradleDir\gradle.properties"
if (Test-Path $globalGradleProps) {
    $globalContent = Get-Content $globalGradleProps -Raw
    if ($globalContent -match "org\.gradle\.jvmargs=-Xmx1536m") {
        Write-Host "  ⚠️ グローバル設定に-Xmx1536mが見つかりました" -ForegroundColor Yellow
        Write-Host "  手動で修正してください: $globalGradleProps" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ グローバル設定は問題ありません" -ForegroundColor Green
    }
} else {
    Write-Host "  ℹ️ グローバル設定ファイルが存在しません（問題ありません）" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "bubblewrap buildを実行します..." -ForegroundColor Green
Write-Host "パスワード: P@ssword" -ForegroundColor Yellow
Write-Host "バージョン名: 13" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 5. bubblewrap buildを実行
bubblewrap build --skipPwaValidation


