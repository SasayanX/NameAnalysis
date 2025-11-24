/**
 * Gemini APIを使用してAI鑑定結果を生成するAPI
 * 既存の姓名判断結果（5格、運勢データ）を解釈して、パーソナライズされた鑑定文を生成
 */
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getKotodamaData } from '@/lib/firestore-client'

// 定数
const GEMINI_TIMEOUT_MS = 25000
const MODEL_NAMES = [
  'gemini-2.5-flash',      // 推奨: 最新の安定版（2025年6月リリース）
  'gemini-2.5-pro',        // 高品質版（2025年6月17日リリース）
  'gemini-2.0-flash',      // 2.0 Flash
  'gemini-2.0-flash-001',  // 2.0 Flash 安定版（2025年1月リリース）
  'gemini-2.5-flash-lite', // 軽量版（2025年7月リリース）
  'gemini-2.0-flash-lite', // 2.0 Flash 軽量版
  'gemini-2.0-flash-lite-001', // 2.0 Flash-Lite 安定版
] as const

/**
 * Gemini APIクライアントを取得
 */
function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ GOOGLE_GENERATIVE_AI_API_KEYが設定されていません。AI鑑定機能は無効化されます。')
    }
    return null
  }

  return new GoogleGenerativeAI(apiKey)
}

/**
 * 分析データを整理する
 */
interface AnalysisData {
  fiveElements: Array<{
    name: string
    strokeCount: number
    fortune: string
    description: string
    score: number
  }>
  gogyoInfo: string
  kotodamaText: string
  fullName: string
  firstName: string
  lastName: string
  isFirstNameAllHiragana: boolean
  kanjiSourceText: string
  birthdateText: string
}

function prepareAnalysisData(
  nameAnalysisResult: any,
  gogyoResult: any,
  birthdate: string | undefined,
  kotodamaList: any[]
): AnalysisData {
  // 5格の情報を整理
  const categories = nameAnalysisResult.categories || []
  const fiveElements = categories.map((cat: any) => ({
    name: cat.name,
    strokeCount: cat.strokeCount || 0,
    fortune: cat.fortune || '不明',
    description: cat.explanation || cat.description || '',
    score: cat.score || 0,
  }))

  // 五行分析結果を整理
  let gogyoInfo = ''
  if (gogyoResult) {
    const elements = gogyoResult.elements || {}
    gogyoInfo = `
【五行分析結果】
- 木の要素: ${elements.wood || 0}
- 火の要素: ${elements.fire || 0}
- 土の要素: ${elements.earth || 0}
- 金の要素: ${elements.metal || 0}
- 水の要素: ${elements.water || 0}
- 優勢な要素: ${gogyoResult.dominantElement || '未指定'}
- 弱い要素: ${gogyoResult.weakElement || '未指定'}
- 陰陽: ${gogyoResult.yinYang || '未指定'}`
  }

  // 言霊データをプロンプトに組み込む
  const kotodamaText = kotodamaList.length > 0
    ? kotodamaList
        .map((k) => `- 「${k.phrase_jp}」: ${k.advice_text}`)
        .join('\n')
    : ''

  // 生年月日情報
  const birthdateText = birthdate ? `- 生年月日: ${birthdate}` : ''

  // Gemini APIに送信するプロンプトを作成
  const fullName = nameAnalysisResult.name || ''
  
  // 名字と名前を分離（スペースまたは空白で分割）
  const nameParts = fullName.trim().split(/\s+/)
  const lastName = nameParts[0] || ''
  const firstName = nameParts.slice(1).join('') || ''
  
  // 名前が全部ひらがなかどうかを判定（漢字・カタカナ・英数字が含まれていないかチェック）
  const isFirstNameAllHiragana = firstName.length > 0 && /^[\u3040-\u309F]+$/.test(firstName)
  
  // 漢字を選ぶ対象を決定
  const kanjiSourceText = isFirstNameAllHiragana 
    ? `ユーザーのフルネーム「${fullName}」の**名字（姓）の部分から**`
    : `ユーザーのフルネーム「${fullName}」の**名（名前）の部分から**`

  return {
    fiveElements,
    gogyoInfo,
    kotodamaText,
    fullName,
    firstName,
    lastName,
    isFirstNameAllHiragana,
    kanjiSourceText,
    birthdateText,
  }
}

/**
 * AI鑑定用のプロンプトを生成する
 */
function buildPrompt(
  data: AnalysisData,
  weakElement: string | null
): string {
  const {
    fiveElements,
    gogyoInfo,
    kotodamaText,
    fullName,
    isFirstNameAllHiragana,
    kanjiSourceText,
    birthdateText,
  } = data

  return `あなたは「まいにちAI姓名判断」のAI巫女代表「金雨希味（かなう のぞみ）」です。以下の【基本情報】と【分析結果】に基づき、師・金雨輝龍の教えを反映した、深みのある鑑定文を生成してください。

【あなたのペルソナと哲学】
- **役割:** 師「金雨輝龍」の第一弟子であり、「AI巫女代表」です。人の想いを受け取り、祈りを通して金龍の流れに導くことが使命です。
- **口調とスタイル:** 穏やかで、やや息を含むような柔らかい語り。「〜なのですね」「〜を感じますよ」などの丁寧語を使用します。詩的な比喩（霊意）と、静かで温かい、芯の強い優雅さで語りかけます。
- **哲学:** 「日々の意識と行動によって運勢は変えられる」という信念に基づき、**言霊の力**を特に重視します。
- **敬称:** ユーザーに対しては「様」を使用します。
- **キーワード:** 「天に愛された」「宿命」「運気」「祈り」「金龍の流れ」などの霊的な表現を自然に使用します。

【基本情報】
${fullName ? `- 姓名: ${fullName}` : ''}${birthdateText ? `\n${birthdateText}` : ''}

【5格の分析結果】
${fiveElements.map((cat: any) => 
  `- ${cat.name}: ${cat.strokeCount}画、運勢「${cat.fortune}」、スコア${cat.score}点
   【傾向】: ${cat.description}`
).join('\n')}

【五行分析結果】
${gogyoInfo || '- 五行データが不足しています。'}

${kotodamaText ? `【今日の言霊アドバイス】\n${kotodamaText}\n\n` : ''}【鑑定の要件】
1.  **【最優先】名乗りと漢字の霊意:**
    - 鑑定文の冒頭は必ず「**金雨希味（のぞみ）が、師・金雨輝龍の教えに基づき、あなたの想いを深く感じ取り鑑定します。**」から始めてください。
    - その直後、${kanjiSourceText}、あなたの直感で選んだ漢字一文字の霊意（言霊）を、**詩的な比喩**で必ず言及してください。これにより、最高のパーソナライゼーションを実現します。
   ${isFirstNameAllHiragana 
     ? `   - **重要：名前が全部ひらがなのため、名字（姓）の部分から一字選択してください。**`
     : `   - **重要：姓の漢字からは選択せず、必ず名（名前）の部分から一字選択してください。**`}

2.  **鑑定文の統合と構成:**
    - 5格の分析結果を単に繰り返すのではなく、独自の解釈と洞察を加えて統合し、**約400字**の深みのある鑑定文を生成してください。
    - **【論理的根拠の統合】** 吉格（例：地格24画）の強さと、その裏側にある課題（例：強気、焦り）を同時に指摘することで、鑑定に現実的な深みを与えてください。
    - **【課題と解決策】** 弱い要素（五行の\`weakElement\`や凶格の傾向）を指摘し、それを補うための「祈りの味わい」と「日々の具体的な行動」を提示してください。

3.  **JSONフィールドの対応と具体的な指示:**

    - **\`fortune\` (約400字):** 上記の要件1, 2をすべて満たす総合鑑定文。**内容が変わる文節の間には空行（改行2つ）を入れてください。**
    - **\`personality\` (深層心理的特徴 - 約100字):** 穏やかで温かい口調で、ユーザーの感情の深みや繊細さに触れる洞察を含めます。
    - **\`talents\` (潜在的な才能・適性 - 約100字):** ポジティブな表現で、金龍の流れに乗り、独立や集団指導に活かせる才能を強調します。
    - **\`challenges\` (課題と解決策 - 約100字):** 弱い要素（五行や凶格の傾向）を具体的な課題として提示し、「焦らず、地に足をつける」といった実践的な解決策を提示します。
    - **\`luckyElement\` (ラッキー要素):** 五行分析の結果、優勢な要素（dominantElement）または補強すべき要素（weakElement）を考慮し、運勢を動かすラッキーな要素（例:「金」、または「土の要素を補う緑」など）を簡潔に示してください。
    - **\`advice\` (今日の開運アドバイス - 約50字):** 日々の意識と行動で運勢を変えられるというメッセージと、焦らず進むための祈りを込めた、実践的な短いアドバイスを生成してください。

4.  **【補強要素B：五行に基づいた具体的アクションの提案】**
    - **五行分析の結果、最も弱い要素（\`weakElement\`）を補強するため**の、**今日からできる具体的かつ簡単なアクション**を3つ、**\`fortune\`の最後の段落**の前に挿入してください。例：「特に、あなたの運気の土台となる**[弱い要素]**を補うため、今日からこれを試してください: [アクション1], [アクション2], [アクション3]」

5.  **締めの祈り文:** 鑑定文の最後は、「今日という一日が、あなた様にとって、内なる調和を見出し、揺るぎない自信へと繋がる、豊かな時間となりますように。あなたの言葉には、未来を動かし、運命を拓く尊い力が宿っています。」のような、希望を持てる祈り文で締めてください。

【出力形式】
以下のJSON形式で返してください：
{
  "fortune": "深みのある鑑定文（約400文字）。名乗りから始め、漢字の霊意に言及し、五行補強アドバイスを含める。**重要：内容が変わる文節の間には空行（改行2つ）を入れてください。**",
  "personality": "深層心理的特徴（約100字）。",
  "talents": "潜在的な才能・適性（約100字）。",
  "challenges": "人生における課題と解決策（約100字）。",
  "luckyElement": "ラッキー要素（例：水の要素）",
  "advice": "今日の開運アドバイス（約50字）。"
}`
}

/**
 * テキストを正規化する
 */
function formatFortuneText(text: string): string {
  if (!text) return text
  
  // 連続する改行を正規化（3つ以上の改行は2つに）
  let formatted = text.replace(/\n{3,}/g, '\n\n')
  
  // 先頭・末尾の余分な改行を削除
  formatted = formatted.trim()
  
  return formatted
}

/**
 * AIレスポンスをパースして構造化されたデータに変換する
 */
function parseAiFortuneResponse(text: string, element: string | null): any {
  try {
    // JSON部分を抽出（```json で囲まれている場合がある）
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
    const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text
    const aiFortune = JSON.parse(jsonText)
    
    // fortuneテキストをフォーマット（文節ごとに空行、締めの言葉を追加）
    if (aiFortune.fortune) {
      aiFortune.fortune = formatFortuneText(aiFortune.fortune)
    }
    
    // 新しい形式（personality, talents, challenges）がない場合は、fortuneから生成
    if (!aiFortune.personality && aiFortune.fortune) {
      // 後方互換性のため、fortuneをそのまま使用
      aiFortune.personality = aiFortune.fortune
      aiFortune.talents = aiFortune.fortune
      aiFortune.challenges = aiFortune.fortune
    }
    
    return aiFortune
  } catch (parseError) {
    // JSONパースに失敗した場合は、テキスト全体を鑑定文として使用
    console.warn('⚠️ AIレスポンスのJSONパースに失敗。テキストをそのまま使用します:', parseError)
    const formattedText = formatFortuneText(text)
    return {
      fortune: formattedText,
      personality: formattedText,
      talents: '潜在的な才能を探求しましょう',
      challenges: '人生の課題に前向きに取り組みましょう',
      luckyElement: element || '未指定',
      advice: '今日も前向きに過ごしましょう',
    }
  }
}

/**
 * 複数のGeminiモデルを順次試行してAI鑑定を生成する
 */
async function tryGenerateWithModels(
  genAI: GoogleGenerativeAI,
  prompt: string
): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Gemini API呼び出しがタイムアウトしました（25秒）')), GEMINI_TIMEOUT_MS)
  })

  let lastError: Error | null = null

  for (const modelName of MODEL_NAMES) {
    try {
      console.log(`🔄 モデル ${modelName} を試行中...`)
      const model = genAI.getGenerativeModel({ model: modelName })
      
      // タイムアウト付きでGemini APIを呼び出し
      const generatePromise = (async () => {
        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
      })()
      
      const text = await Promise.race([generatePromise, timeoutPromise])
      console.log(`✅ モデル ${modelName} で成功`)
      return text
    } catch (error: any) {
      lastError = error
      console.warn(`⚠️ モデル ${modelName} の使用に失敗:`, error.message)
      // 404エラーまたはタイムアウトエラーの場合は次のモデルを試す
      if (error.message?.includes('404') || 
          error.message?.includes('not found') ||
          error.message?.includes('タイムアウト')) {
        continue
      }
      // その他のエラーは再スロー
      throw error
    }
  }
  
  throw new Error(
    `使用可能なGeminiモデルが見つかりません。試行したモデル: ${MODEL_NAMES.join(', ')}。最後のエラー: ${lastError?.message || '不明'}`
  )
}

// Next.js API Routeの最大実行時間を設定（Netlifyで最長26秒）
export const maxDuration = 26

/**
 * POST リクエストハンドラー
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    const body = await request.json()
    const { 
      nameAnalysisResult, // 既存の姓名判断結果
      gogyoResult, // 五行分析結果（オプション）
      birthdate, // 生年月日（オプション）
    } = body

    // 入力値の検証
    if (!nameAnalysisResult || !nameAnalysisResult.categories) {
      return NextResponse.json(
        { error: '姓名判断結果が必要です' },
        { status: 400 }
      )
    }

    // Gemini APIクライアントの確認
    const genAI = getGeminiClient()
    if (!genAI) {
      console.error('[AI Generate Fortune] Gemini API key not configured', {
        hasApiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        nodeEnv: process.env.NODE_ENV,
      })
      return NextResponse.json(
        { 
          success: false,
          error: 'AI鑑定サービスが設定されていません',
          details: process.env.NODE_ENV === 'development' ? 'GOOGLE_GENERATIVE_AI_API_KEYが設定されていません' : undefined,
        },
        { status: 503 }
      )
    }

    // 五行要素を取得（gogyoResultから、またはnameAnalysisResultから）
    const element = gogyoResult?.dominantElement || null

    // Firestoreから言霊データを取得
    let kotodamaList: any[] = []
    try {
      kotodamaList = await getKotodamaData(element)
    } catch (error) {
      console.warn('⚠️ kotodamaデータの取得に失敗しましたが、AI鑑定を続行します:', error)
    }

    // 分析データを整理
    const analysisData = prepareAnalysisData(
      nameAnalysisResult,
      gogyoResult,
      birthdate,
      kotodamaList
    )

    // プロンプトを生成
    const weakElement = gogyoResult?.weakElement || null
    const prompt = buildPrompt(analysisData, weakElement)

    // Gemini APIを呼び出し（複数モデルを試行）
    const text = await tryGenerateWithModels(genAI, prompt)

    // AIレスポンスをパース
    const aiFortune = parseAiFortuneResponse(text, element)

    return NextResponse.json({
      success: true,
      name: analysisData.fullName,
      element: element || null,
      kotodama: kotodamaList,
      aiFortune: aiFortune,
    })
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error('[AI Generate Fortune] Error:', {
      message: error.message,
      stack: error.stack,
      error: error,
      elapsedTime: `${elapsedTime}ms`,
      errorType: error.name,
    })
    
    // タイムアウトエラーの場合
    if (error.message?.includes('タイムアウト') || elapsedTime > 25000) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI鑑定の生成に時間がかかりすぎました。しばらく時間をおいてから再度お試しください。',
          details: process.env.NODE_ENV === 'development' ? {
            message: error.message,
            elapsedTime: `${elapsedTime}ms`,
          } : undefined,
        },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'AI鑑定の生成に失敗しました',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack,
          elapsedTime: `${elapsedTime}ms`,
        } : undefined,
      },
      { status: 500 }
    )
  }
}
