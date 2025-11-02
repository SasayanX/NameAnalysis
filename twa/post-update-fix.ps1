# bubblewrap update後にgradle.propertiesを修正するスクリプト

Write-Host "gradle.propertiesを修正中..." -ForegroundColor Yellow

$content = Get-Content gradle.properties -Raw
$content = $content -replace "org\.gradle\.jvmargs=-Xmx1536m", "org.gradle.jvmargs=-Xmx512m -XX:MaxMetaspaceSize=512m"
Set-Content gradle.properties -Value $content -NoNewline

Write-Host "OK 修正完了" -ForegroundColor Green
Write-Host ""
Write-Host "修正後の内容:" -ForegroundColor Cyan
Get-Content gradle.properties | Select-String "jvmargs"

