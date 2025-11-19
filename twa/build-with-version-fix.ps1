# バージョンコード自動インクリメント対策付きビルドスクリプト

Write-Host "=== TWA APKビルド（バージョン固定版） ===" -ForegroundColor Cyan
Write-Host ""

# 1. 現在のバージョンを確認
Write-Host "[1/5] 現在のバージョンを確認..." -ForegroundColor Yellow
$manifest = Get-Content "twa-manifest.json" | ConvertFrom-Json
$currentVersion = $manifest.appVersionCode
$currentVersionName = $manifest.appVersionName
Write-Host "  現在のバージョンコード: $currentVersion" -ForegroundColor Gray
Write-Host "  現在のバージョン名: $currentVersionName" -ForegroundColor Gray

# 2. Gradleデーモンを停止
Write-Host "[2/5] Gradleデーモンを停止..." -ForegroundColor Yellow
& .\gradlew.bat --stop 2>&1 | Out-Null
Start-Sleep -Seconds 3

# 3. gradle.propertiesを修正
Write-Host "[3/5] gradle.propertiesを修正..." -ForegroundColor Yellow
$gradlePropsContent = @"
# Project-wide Gradle settings.
org.gradle.jvmargs=-Xmx512m -XX:MaxMetaspaceSize=512m
android.useAndroidX=true
"@
Set-Content -Path "gradle.properties" -Value $gradlePropsContent
Write-Host "  ✅ gradle.propertiesを修正しました" -ForegroundColor Green

# 4. 環境変数を設定
Write-Host "[4/5] 環境変数を設定..." -ForegroundColor Yellow
$env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
$env:ORG_GRADLE_DAEMON_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"
Write-Host "  GRADLE_OPTS = $env:GRADLE_OPTS" -ForegroundColor Gray

# 5. app/build.gradleのバージョンを確認・修正
Write-Host "[5/5] app/build.gradleのバージョンを確認..." -ForegroundColor Yellow
$buildGradle = Get-Content "app\build.gradle" -Raw
if ($buildGradle -match "versionCode\s+(\d+)") {
    $gradleVersionCode = [int]$Matches[1]
    if ($gradleVersionCode -ne $currentVersion) {
        Write-Host "  ⚠️ build.gradleのバージョンコードが不一致: $gradleVersionCode → $currentVersion に修正" -ForegroundColor Yellow
        $buildGradle = $buildGradle -replace "versionCode\s+\d+", "versionCode $currentVersion"
        $buildGradle = $buildGradle -replace 'versionName\s+"[^"]+"', "versionName `"$currentVersionName`""
        Set-Content -Path "app\build.gradle" -Value $buildGradle -NoNewline
        Write-Host "  ✅ build.gradleを修正しました" -ForegroundColor Green
    } else {
        Write-Host "  ✅ build.gradleのバージョンは一致しています" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "bubblewrap buildを実行します..." -ForegroundColor Green
Write-Host ""
Write-Host "⚠️ 重要: 対話形式でバージョン名を聞かれた場合" -ForegroundColor Yellow
Write-Host "  現在のバージョン名 ($currentVersionName) を入力してください" -ForegroundColor Yellow
Write-Host "  自動インクリメントを防ぐため、必ず現在のバージョンを入力！" -ForegroundColor Yellow
Write-Host ""
Write-Host "パスワード: P@ssword" -ForegroundColor White
Write-Host "バージョン名: $currentVersionName" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 6. bubblewrap buildを実行
bubblewrap build --skipPwaValidation

# 7. ビルド後のバージョンを確認
Write-Host ""
Write-Host "ビルド後のバージョンを確認..." -ForegroundColor Cyan
$manifestAfter = Get-Content "twa-manifest.json" | ConvertFrom-Json
$versionAfter = $manifestAfter.appVersionCode
if ($versionAfter -ne $currentVersion) {
    Write-Host "  ⚠️ バージョンコードが変更されました: $currentVersion → $versionAfter" -ForegroundColor Yellow
    Write-Host "  bubblewrap buildが自動的にインクリメントした可能性があります" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ バージョンコードは変更されていません: $currentVersion" -ForegroundColor Green
}


