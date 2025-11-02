# APK動作確認用クイックテストスクリプト

Write-Host "=== APK動作確認テスト ===" -ForegroundColor Cyan
Write-Host ""

# 1. Asset Linksファイルの確認
Write-Host "1. Digital Asset Linksファイルの確認..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://seimei.app/.well-known/assetlinks.json" -UseBasicParsing
    Write-Host "   OK Asset Linksファイルにアクセスできました" -ForegroundColor Green
    Write-Host "   Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Gray
    
    $content = $response.Content | ConvertFrom-Json
    $packageName = $content[0].target.package_name
    $fingerprint = $content[0].target.sha256_cert_fingerprints[0]
    
    Write-Host "   Package Name: $packageName" -ForegroundColor Gray
    Write-Host "   SHA256 Fingerprint: $fingerprint" -ForegroundColor Gray
    
    if ($packageName -eq "com.nameanalysis.ai") {
        Write-Host "   OK Package Nameが正しいです" -ForegroundColor Green
    } else {
        Write-Host "   NG Package Nameが一致しません" -ForegroundColor Red
    }
} catch {
    Write-Host "   NG Asset Linksファイルにアクセスできません: $_" -ForegroundColor Red
}

Write-Host ""

# 2. Google検証ツールでの確認
Write-Host "2. Google Digital Asset Links検証ツールでの確認..." -ForegroundColor Yellow
try {
    $verifyUrl = "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://seimei.app" + [char]0x26 + "relation=delegate_permission/common.handle_all_urls"
    $verifyResponse = Invoke-WebRequest -Uri $verifyUrl -UseBasicParsing
    $verifyContent = $verifyResponse.Content | ConvertFrom-Json
    
    if ($verifyContent.statements.Count -gt 0) {
        Write-Host "   OK 検証が成功しました" -ForegroundColor Green
        Write-Host "   検証されたステートメント数: $($verifyContent.statements.Count)" -ForegroundColor Gray
    } else {
        Write-Host "   WARNING 検証済みステートメントが見つかりませんでした" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   WARNING 検証ツールにアクセスできません: $_" -ForegroundColor Yellow
}

Write-Host ""

# 3. Webサイトのアクセシビリティ確認
Write-Host "3. Webサイト（seimei.app）のアクセシビリティ確認..." -ForegroundColor Yellow
try {
    $siteResponse = Invoke-WebRequest -Uri "https://seimei.app/" -UseBasicParsing
    if ($siteResponse.StatusCode -eq 200) {
        Write-Host "   OK Webサイトにアクセスできました (HTTP $($siteResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "   WARNING HTTP $($siteResponse.StatusCode) が返されました" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   NG Webサイトにアクセスできません: $_" -ForegroundColor Red
}

Write-Host ""

# 4. APKファイルの確認
Write-Host "4. APKファイルの確認..." -ForegroundColor Yellow
$apkFile = "app-release-signed.apk"
if (Test-Path $apkFile) {
    $fileInfo = Get-Item $apkFile
    Write-Host "   OK APKファイルが見つかりました" -ForegroundColor Green
    Write-Host "   ファイル名: $($fileInfo.Name)" -ForegroundColor Gray
    Write-Host "   サイズ: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray
    Write-Host "   更新日時: $($fileInfo.LastWriteTime)" -ForegroundColor Gray
} else {
    Write-Host "   NG APKファイルが見つかりません: $apkFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== テスト完了 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "次のステップ:" -ForegroundColor Yellow
Write-Host "1. APKファイルをAndroidデバイスに転送" -ForegroundColor White
Write-Host "2. デバイスでインストールと動作確認" -ForegroundColor White
Write-Host "3. APK-TEST-CHECKLIST.md に従って詳細テストを実施" -ForegroundColor White
