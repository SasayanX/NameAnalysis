# TWAプロジェクト初期化スクリプト（Windows PowerShell版）
# 注意: このスクリプトは対話形式の入力が必要です

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "TWAプロジェクト初期化" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# twaディレクトリに移動
Set-Location -Path "$PSScriptRoot\..\twa"

Write-Host "以下のコマンドを実行してください:" -ForegroundColor Yellow
Write-Host "bubblewrap init --manifest=https://seimei.app/manifest.json" -ForegroundColor Green
Write-Host ""
Write-Host "対話形式で入力する情報:" -ForegroundColor Yellow
Write-Host "1. Domain: seimei.app" -ForegroundColor White
Write-Host "2. URL path: /" -ForegroundColor White
Write-Host "3. Application name: まいにちAI姓名判断" -ForegroundColor White
Write-Host "4. Short name: まいにちAI姓名判断" -ForegroundColor White
Write-Host "5. Package ID: com.nameanalysis.ai" -ForegroundColor White
Write-Host "6. Signing key: y (新しいキーを作成)" -ForegroundColor White
Write-Host ""

# ユーザーに実行を促す
$response = Read-Host "上記のコマンドを実行しますか？ (y/n)"

if ($response -eq "y") {
    bubblewrap init --manifest=https://seimei.app/manifest.json
} else {
    Write-Host "手動で実行してください。" -ForegroundColor Yellow
}

