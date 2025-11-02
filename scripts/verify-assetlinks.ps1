# Digital Asset Links 確認スクリプト

$url = "https://seimei.app/.well-known/assetlinks.json"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Digital Asset Links 確認" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url -Method Get
    
    Write-Host "✅ ステータス: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Content-Type:" -ForegroundColor Yellow
    if ($response.Headers.'Content-Type') {
        Write-Host "  $($response.Headers.'Content-Type')" -ForegroundColor White
        if ($response.Headers.'Content-Type' -like "*application/json*") {
            Write-Host "  ✅ JSON形式で配信されています" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Content-Typeがapplication/jsonではありません" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠️ Content-Typeヘッダーが見つかりません" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "JSON内容:" -ForegroundColor Yellow
    Write-Host $response.Content -ForegroundColor White
    
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "✅ Digital Asset Linksファイルは正常にアクセス可能です" -ForegroundColor Green
    Write-Host "===================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ エラーが発生しました:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "確認事項:" -ForegroundColor Yellow
    Write-Host "1. デプロイが完了しているか確認" -ForegroundColor White
    Write-Host "2. URLが正しいか確認" -ForegroundColor White
    Write-Host "3. ネットワーク接続を確認" -ForegroundColor White
}

