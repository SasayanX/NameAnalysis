# APK Basic Test Script

Write-Host "=== APK Basic Test ===" -ForegroundColor Cyan
Write-Host ""

# Check Asset Links
Write-Host "1. Checking Asset Links..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://seimei.app/.well-known/assetlinks.json" -UseBasicParsing
    Write-Host "   OK Asset Links accessible" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Package: $($content[0].target.package_name)" -ForegroundColor Gray
    Write-Host "   Fingerprint: $($content[0].target.sha256_cert_fingerprints[0])" -ForegroundColor Gray
} catch {
    Write-Host "   NG Error: $_" -ForegroundColor Red
}

Write-Host ""

# Check Website
Write-Host "2. Checking Website..." -ForegroundColor Yellow
try {
    $siteResponse = Invoke-WebRequest -Uri "https://seimei.app/" -UseBasicParsing
    Write-Host "   OK Website accessible (HTTP $($siteResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   NG Error: $_" -ForegroundColor Red
}

Write-Host ""

# Check APK File
Write-Host "3. Checking APK File..." -ForegroundColor Yellow
$apkFile = "app-release-signed.apk"
if (Test-Path $apkFile) {
    $fileInfo = Get-Item $apkFile
    Write-Host "   OK APK found" -ForegroundColor Green
    Write-Host "   Name: $($fileInfo.Name)" -ForegroundColor Gray
    Write-Host "   Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "   NG APK not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Transfer APK to Android device" -ForegroundColor White
Write-Host "2. Install and test on device" -ForegroundColor White
Write-Host "3. Follow APK-TEST-CHECKLIST.md for detailed testing" -ForegroundColor White

