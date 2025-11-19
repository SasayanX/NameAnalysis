# Gemini AI鑑定APIのテストスクリプト（PowerShell版）
# 山田太郎さんの姓名判断結果と五行分析結果を生成し、APIを呼び出す

Write-Host "🧪 Gemini AI鑑定APIテスト開始`n" -ForegroundColor Cyan

# テストデータ
$lastName = "山田"
$firstName = "太郎"
$gender = "male"
$birthdate = "1990-01-01"

Write-Host "📝 テストデータ:" -ForegroundColor Yellow
Write-Host "  姓名: $lastName$firstName"
Write-Host "  性別: $gender"
Write-Host "  生年月日: $birthdate`n"

# 姓名判断結果と五行分析結果を生成するために、Node.jsスクリプトを使用
Write-Host "🔮 姓名判断結果と五行分析結果を生成中..." -ForegroundColor Yellow

# 一時的なNode.jsスクリプトを作成してデータを生成
$tempScript = @"
const { analyzeNameFortune } = require('./lib/name-data-simple-fixed');
const { calculateGogyo } = require('./lib/advanced-gogyo');

const lastName = '山田';
const firstName = '太郎';
const gender = 'male';
const birthdate = '1990-01-01';

const nameAnalysisResult = analyzeNameFortune(lastName, firstName, gender);
nameAnalysisResult.name = \`\${lastName}\${firstName}\`;

const birthdateObj = new Date(birthdate);
const gogyoResult = calculateGogyo(lastName, firstName, birthdateObj);

const requestData = {
  nameAnalysisResult,
  gogyoResult,
  birthdate
};

console.log(JSON.stringify(requestData));
"@

$tempScriptPath = "scripts/temp-generate-data.js"
$tempScript | Out-File -FilePath $tempScriptPath -Encoding UTF8

try {
    # Node.jsでデータを生成
    $jsonData = node $tempScriptPath | Out-String
    
    Write-Host "✅ データ生成完了`n" -ForegroundColor Green
    
    # APIを呼び出し
    Write-Host "🚀 APIを呼び出し中..." -ForegroundColor Yellow
    
    $apiUrl = if ($env:API_URL) { $env:API_URL } else { "http://localhost:3000" }
    $url = "$apiUrl/api/ai/generate-fortune"
    
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $jsonData -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    
    Write-Host "✅ API呼び出し成功`n" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "📦 生のJSONレスポンス:" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    # JSONを整形して出力
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ エラーが発生しました:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "レスポンス: $responseBody" -ForegroundColor Red
    }
    
    Write-Host "`n💡 ヒント: 開発サーバーが起動していることを確認してください (npm run dev)" -ForegroundColor Yellow
} finally {
    # 一時ファイルを削除
    if (Test-Path $tempScriptPath) {
        Remove-Item $tempScriptPath -Force
    }
}

