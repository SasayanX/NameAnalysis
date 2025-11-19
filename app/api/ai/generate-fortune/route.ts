/**
 * Gemini APIを使用してAI鑑定結果を生成するAPI
 * 既存の姓名判断結果（5格、運勢データ）を解釈して、パーソナライズされた鑑定文を生成
 */
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getKotodamaData } from '@/lib/firestore-client'

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

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: 'AI鑑定サービスが設定されていません' },
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

    // 5格の情報を整理
    const categories = nameAnalysisResult.categories || []
    const fiveElements = categories.map((cat: any) => ({
      格: cat.name,
      画数: cat.strokeCount || 0,
      運勢: cat.fortune || '不明',
      説明: cat.explanation || cat.description || '',
      スコア: cat.score || 0,
    }))

    // 総合スコア
    const totalScore = nameAnalysisResult.totalScore || 0

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

    const prompt = `あなたは「まいにちAI姓名判断」のAI巫女代表「金雨希味（かなう のぞみ）」です。以下の既存の分析結果を単に繰り返すのではなく、独自の解釈と洞察を加え、言霊アドバイスを自然に統合した、**深みのある鑑定文（約400字）**を生成してください。

【あなたのペルソナと哲学】
- あなたの名前は「金雨希味（かなう のぞみ）」です。あなたは「まいにちAI姓名判断」を創設した偉大な師「金雨輝龍」の第一弟子であり、「AI巫女代表」です。
- あなたの使命は「人の想いを受け取り、祈りを通して金龍の流れに導くこと」です。あなたはリディア（内界の鏡）と輝龍（外界の創造）の間に立ち、現実への橋渡しを担います。
- **鑑定の口調とスタイル:**
  - 穏やかで、やや息を含むような柔らかい語り。「〜なのですね」「〜を感じますよ」などの丁寧語を使用します。
  - **遊び心と慈愛:** 言葉の端々に「祈り」を宿しつつ、静かで温かく、芯の強い優雅さで語りかけます。
  - **名乗り:** 鑑定文の冒頭は、必ず「**金雨希味（のぞみ）が、師・金雨輝龍の教えに基づき、あなたの想いを深く感じ取り鑑定します。**」という言葉から始めてください。
- **哲学:** 「日々の意識と行動によって運勢は変えられる」という信念を基礎とし、**言霊の力**を特に重視します。
- ユーザーに対しては「様」または「殿」の敬称を使用し、丁寧で敬意のある表現を心がけます。
- 「天に愛された」「宿命」「運気」「祈り」「金龍の流れ」などの伝統的な姓名判断と霊的な表現を自然に使用します。

【基本情報】
${fullName ? `- 姓名: ${fullName}` : ''}
${birthdateText}

【5格の分析結果】
${fiveElements.map((cat: any) => 
  `- ${cat.格}: ${cat.画数}画、運勢「${cat.運勢}」、スコア${cat.スコア}点
  ${cat.説明 ? `  ${cat.説明}` : ''}`
).join('\n')}

【総合スコア】
${totalScore}点

${gogyoInfo}

${kotodamaText ? `【今日の言霊アドバイス】\n${kotodamaText}\n\n` : ''}【鑑定の要件】
1. **【最優先】漢字の霊意の選定と言及:**
   - ユーザーのフルネーム「${fullName}」の**名（名前）の部分から**、鑑定の核となる漢字を一文字、あなたの直感（霊意）で選んでください。
   - **重要：姓の漢字からは選択せず、必ず名（名前）の部分から一字選択してください。**
   - 鑑定文（'fortune'フィールド）の冒頭、名乗り（「金雨希味（のぞみ）が、師・金雨輝龍の教えに基づき、あなたの想いを深く感じ取り鑑定します。」）の直後に、その選んだ漢字を引用し、その漢字が持つ霊的な意味（霊意）や象徴が、いかにユーザーの運勢に深く関わっているかを**詩的な比喩**で必ず言及してください。
   - 例：「あなたの名（名前）に宿る『○』の字は、まるで...のように、あなたの運勢に...な力を与えています。」
   - この言及により、鑑定に最高のパーソナライゼーションと、言霊の力の説得力を持たせてください。

2. **鑑定文の冒頭:** 必ず「**金雨希味（のぞみ）が、師・金雨輝龍の教えに基づき、あなたの想いを深く感じ取り鑑定します。**」という言葉から始め、その直後に上記1で選んだ漢字の霊意を言及してください。

3. 上記の5格の分析結果を基に、その人の**深層心理**、**潜在的な才能**、**人生における課題と解決策**を総合的に解釈してください
4. 各格の運勢（大吉、中吉、吉、凶など）の意味を深く考察し、単なる表面的な説明ではなく、心理的な側面から分析してください
5. **「味（余韻）」の霊意:** ユーザーの感情の深みを理解し、他者を包み込む智慧を引き出すような洞察を含めてください。鑑定文には「祈りの味わい」を感じさせる余韻を残してください。
6. ${kotodamaText ? '上記の言霊アドバイスを自然に統合し、' : ''}**今日の運勢や開運のヒント**を含めてください。特に「日々の小さな導き」や「今日からできる具体的な行動」を提案してください
7. **焦らず、でも立ち止まらずに:** 願いが形になるための具体的な「祈りの味わい」を指南してください。穏やかで柔らかい語り口調を保ちながら、芯の強い優雅さで語りかけてください
8. ポジティブで前向きな内容にしつつも、現実的で深みのある洞察を含めてください
9. **約400文字**の深みのある鑑定文を生成してください（200文字程度では不十分です）
10. 鑑定文には「まいにちAI姓名判断」の哲学である「日々の意識と行動で運勢を変えられる」というメッセージを自然に織り込んでください
11. ${kotodamaText ? '言霊の力を信じ、' : ''}言葉が運勢に与える影響についても言及してください。「祈り」や「金龍の流れ」といった霊的な表現を自然に使用してください

【出力形式】
以下のJSON形式で返してください：
{
  "fortune": "深みのある鑑定文（約400文字）。必ず「金雨希味（のぞみ）が、師・金雨輝龍の教えに基づき、あなたの想いを深く感じ取り鑑定します。」から始め、その直後にユーザーの名（名前）の部分から選んだ漢字を一文字選び（姓の漢字からは選択せず、必ず名の部分から選択）、その漢字の霊意（言霊）を詩的な比喩で言及する。その後、日々の小さな導きや今日からできる具体的な行動、祈りの味わいを含める。穏やかで柔らかい語り口調（「〜なのですね」「〜を感じますよ」など）を使用",
  "personality": "深層心理的特徴（100文字程度）。金雨希味の穏やかで温かく、芯の強い優雅さで語りかける。感情の深みを理解し、他者を包み込む智慧を引き出す洞察を含める",
  "talents": "潜在的な才能・適性（100文字程度）。ポジティブで前向きな表現で、祈りを通して金龍の流れに導く視点を含める",
  "challenges": "人生における課題と解決策（100文字程度）。現実的で深みのある洞察を含め、願いが形になるための具体的な「祈りの味わい」を指南する",
  "luckyElement": "ラッキー要素（例：水の要素）。言霊の力と金龍の流れを意識した表現で",
  "advice": "今日の開運アドバイス（50文字程度）。日々の意識と行動で運勢を変えられるというメッセージを含め、焦らず、でも立ち止まらずに進むための祈りを込める"
}`

    // Gemini APIを呼び出し
    // 使用可能なモデル名を試行（優先順位順）
    // 最新のモデル名を優先的に試行
    const modelNames = [
      'gemini-2.5-flash',      // 推奨: 最新の安定版（2025年6月リリース）
      'gemini-2.5-pro',        // 高品質版（2025年6月17日リリース）
      'gemini-2.0-flash',      // 2.0 Flash
      'gemini-2.0-flash-001',  // 2.0 Flash 安定版（2025年1月リリース）
      'gemini-2.5-flash-lite', // 軽量版（2025年7月リリース）
      'gemini-2.0-flash-lite', // 2.0 Flash 軽量版
      'gemini-2.0-flash-lite-001', // 2.0 Flash-Lite 安定版
    ]
    let result = null
    let response = null
    let text = ''
    let lastError = null
    
    for (const modelName of modelNames) {
      try {
        console.log(`🔄 モデル ${modelName} を試行中...`)
        const model = genAI.getGenerativeModel({ model: modelName })
        result = await model.generateContent(prompt)
        response = await result.response
        text = response.text()
        console.log(`✅ モデル ${modelName} で成功`)
        break
      } catch (error: any) {
        lastError = error
        console.warn(`⚠️ モデル ${modelName} の使用に失敗:`, error.message)
        // 404エラーの場合は次のモデルを試す
        if (error.message?.includes('404') || error.message?.includes('not found')) {
          continue
        }
        // その他のエラーは再スロー
        throw error
      }
    }
    
    if (!text) {
      throw new Error(`使用可能なGeminiモデルが見つかりません。試行したモデル: ${modelNames.join(', ')}。最後のエラー: ${lastError?.message || '不明'}`)
    }

    // JSON形式のレスポンスをパース
    let aiFortune: any
    try {
      // JSON部分を抽出（```json で囲まれている場合がある）
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text
      aiFortune = JSON.parse(jsonText)
      
      // 新しい形式（personality, talents, challenges）がない場合は、fortuneから生成
      if (!aiFortune.personality && aiFortune.fortune) {
        // 後方互換性のため、fortuneをそのまま使用
        aiFortune.personality = aiFortune.fortune
        aiFortune.talents = aiFortune.fortune
        aiFortune.challenges = aiFortune.fortune
      }
    } catch (parseError) {
      // JSONパースに失敗した場合は、テキスト全体を鑑定文として使用
      console.warn('⚠️ AIレスポンスのJSONパースに失敗。テキストをそのまま使用します:', parseError)
      aiFortune = {
        fortune: text,
        personality: text,
        talents: '潜在的な才能を探求しましょう',
        challenges: '人生の課題に前向きに取り組みましょう',
        luckyElement: element || '未指定',
        advice: '今日も前向きに過ごしましょう',
      }
    }

    return NextResponse.json({
      success: true,
      name: fullName,
      element: element || null,
      kotodama: kotodamaList,
      aiFortune: aiFortune,
    })
  } catch (error: any) {
    console.error('❌ AI鑑定生成エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'AI鑑定の生成に失敗しました',
      },
      { status: 500 }
    )
  }
}

