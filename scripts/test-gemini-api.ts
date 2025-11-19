/**
 * Gemini AI鑑定APIのテストスクリプト
 * 山田太郎さんの姓名判断結果と五行分析結果を生成し、APIを呼び出す
 */

// 姓名判断ロジックをインポート
const { analyzeNameFortune } = require('../lib/name-data-simple-fixed')
const { calculateGogyo } = require('../lib/advanced-gogyo')

async function testGeminiAPI() {
  try {
    console.log('🧪 Gemini AI鑑定APIテスト開始\n')

    // テストデータ
    const lastName = '山田'
    const firstName = '太郎'
    const gender = 'male'
    const birthdate = '1990-01-01'

    console.log('📝 テストデータ:')
    console.log(`  姓名: ${lastName}${firstName}`)
    console.log(`  性別: ${gender}`)
    console.log(`  生年月日: ${birthdate}\n`)

    // 姓名判断結果を生成
    console.log('🔮 姓名判断結果を生成中...')
    const nameAnalysisResult = analyzeNameFortune(lastName, firstName, gender)
    
    // nameプロパティを追加
    nameAnalysisResult.name = `${lastName}${firstName}`
    
    console.log('✅ 姓名判断結果生成完了')
    console.log(`  総合スコア: ${nameAnalysisResult.totalScore}点`)
    console.log(`  5格の数: ${nameAnalysisResult.categories?.length || 0}個\n`)

    // 五行分析結果を生成
    console.log('🌿 五行分析結果を生成中...')
    const birthdateObj = new Date(birthdate)
    const gogyoResult = calculateGogyo(lastName, firstName, birthdateObj)
    
    console.log('✅ 五行分析結果生成完了')
    console.log(`  優勢な要素: ${gogyoResult.dominantElement}`)
    console.log(`  弱い要素: ${gogyoResult.weakElement}\n`)

    // APIを呼び出し
    console.log('🚀 APIを呼び出し中...')
    const apiUrl = process.env.API_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/ai/generate-fortune`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nameAnalysisResult,
        gogyoResult,
        birthdate,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API呼び出しエラー:')
      console.error(`  ステータス: ${response.status} ${response.statusText}`)
      console.error(`  エラー内容: ${errorText}`)
      return
    }

    const data = await response.json()
    
    console.log('✅ API呼び出し成功\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 生のJSONレスポンス:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(JSON.stringify(data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // レスポンスの構造を確認
    if (data.success && data.aiFortune) {
      console.log('📊 レスポンス構造:')
      console.log(`  success: ${data.success}`)
      console.log(`  name: ${data.name}`)
      console.log(`  element: ${data.element}`)
      console.log(`  kotodama数: ${data.kotodama?.length || 0}個`)
      console.log(`  aiFortune.fortune: ${data.aiFortune.fortune ? 'あり' : 'なし'}`)
      console.log(`  aiFortune.personality: ${data.aiFortune.personality ? 'あり' : 'なし'}`)
      console.log(`  aiFortune.talents: ${data.aiFortune.talents ? 'あり' : 'なし'}`)
      console.log(`  aiFortune.challenges: ${data.aiFortune.challenges ? 'あり' : 'なし'}`)
    }

  } catch (error: any) {
    console.error('❌ エラーが発生しました:')
    console.error(error)
    if (error.message) {
      console.error(`  エラーメッセージ: ${error.message}`)
    }
  }
}

// スクリプトを実行
testGeminiAPI()

