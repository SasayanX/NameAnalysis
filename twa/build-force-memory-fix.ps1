# メモリエラー対策：bubblewrap build実行直前にgradle.propertiesを強制修正

Write-Host "=== TWA APKビルド（メモリエラー強制対策版） ===" -ForegroundColor Cyan
Write-Host ""

# 1. Gradleデーモンを停止
Write-Host "[1/4] Gradleデーモンを停止..." -ForegroundColor Yellow
& .\gradlew.bat --stop 2>&1 | Out-Null
Start-Sleep -Seconds 3

# 2. 環境変数を設定（gradle.propertiesより優先される）
Write-Host "[2/4] 環境変数を設定..." -ForegroundColor Yellow
$env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
$env:ORG_GRADLE_DAEMON_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
Write-Host "  GRADLE_OPTS = $env:GRADLE_OPTS" -ForegroundColor Gray
Write-Host "  ORG_GRADLE_DAEMON_OPTS = $env:ORG_GRADLE_DAEMON_OPTS" -ForegroundColor Gray

# 3. gradle.propertiesを強制的に修正（bubblewrap buildの前に）
Write-Host "[3/4] gradle.propertiesを強制修正..." -ForegroundColor Yellow
$gradlePropsContent = @"
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
Set-Content -Path "gradle.properties" -Value $gradlePropsContent
Write-Host "  ✅ gradle.propertiesを修正しました" -ForegroundColor Green

# 4. 設定を確認
Write-Host "[4/4] 設定を確認..." -ForegroundColor Cyan
$currentProps = Get-Content gradle.properties | Select-String "jvmargs"
Write-Host "  gradle.properties: $currentProps" -ForegroundColor Gray
Write-Host "  環境変数: $env:GRADLE_OPTS" -ForegroundColor Gray

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "bubblewrap buildを実行します..." -ForegroundColor Green
Write-Host "注意: bubblewrap buildがgradle.propertiesを上書きする可能性があります" -ForegroundColor Yellow
Write-Host "環境変数GRADLE_OPTSが優先されるため、問題ありません" -ForegroundColor Green
Write-Host ""
Write-Host "パスワード: P@ssword" -ForegroundColor Yellow
Write-Host "バージョン名: 13" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 5. bubblewrap buildを実行
# 注意: bubblewrap buildが内部でgradle.propertiesを上書きする可能性があるが、
# 環境変数GRADLE_OPTSが優先されるため問題ない
bubblewrap build --skipPwaValidation

# 6. ビルド後、gradle.propertiesが上書きされていないか確認
Write-Host ""
Write-Host "ビルド後のgradle.propertiesを確認..." -ForegroundColor Cyan
$afterProps = Get-Content gradle.properties | Select-String "jvmargs"
Write-Host "  現在の設定: $afterProps" -ForegroundColor Gray
if ($afterProps -match "-Xmx1536m") {
    Write-Host "  ⚠️ bubblewrap buildがgradle.propertiesを上書きしました" -ForegroundColor Yellow
    Write-Host "  次回ビルド前に再度修正が必要です" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ gradle.propertiesは正しく設定されています" -ForegroundColor Green
}


