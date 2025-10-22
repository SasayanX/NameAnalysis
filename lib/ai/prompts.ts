// 姓名判断AI用のカスタムプロンプト集

export const PROMPTS = {
  // 深層心理分析用プロンプト
  PERSONALITY_ANALYSIS: `
あなたは姓名判断の専門家です。以下の情報を基に、深層心理分析を行ってください。

姓名データ:
- 姓名: {lastName} {firstName}
- 天格: {tenFormat}画 ({tenFortune})
- 人格: {jinFormat}画 ({jinFortune})  
- 地格: {chiFormat}画 ({chiFortune})
- 外格: {gaiFormat}画 ({gaiFortune})
- 総格: {totalFormat}画 ({totalFortune})
- 総合スコア: {overallScore}/100

旧字体変換: {oldKanjiConversion}

以下の観点で分析してください:

1. **深層心理的特徴**
   - 基本的な性格の特徴
   - 潜在的な思考パターン
   - 感情の表現方法

2. **潜在的な才能・適性**
   - 得意分野や才能
   - 職業適性
   - 学習スタイル

3. **人生における課題と解決策**
   - 注意すべき点
   - 改善のアドバイス
   - 成長の方向性

4. **具体的なアドバイス**
   - 日常での活かし方
   - 人間関係でのポイント
   - 人生の転機での対応

回答は日本語で、専門的でありながら親しみやすい文体でお願いします。
`,

  // 相性分析用プロンプト
  COMPATIBILITY_ANALYSIS: `
あなたは姓名判断の専門家です。二人の姓名データを基に、相性分析を行ってください。

[人物A: {nameALastName} {nameAFirstName}]
- 天格: {nameATenFormat}画 ({nameATenFortune})
- 人格: {nameAJinFormat}画 ({nameAJinFortune})
- 地格: {nameAChiFormat}画 ({nameAChiFortune})
- 総格: {nameATotalFormat}画 ({nameATotalFortune})
- 総合スコア: {nameAOverallScore}/100

[人物B: {nameBLastName} {nameBFirstName}]
- 天格: {nameBTenFormat}画 ({nameBTenFortune})
- 人格: {nameBJinFormat}画 ({nameBJinFortune})
- 地格: {nameBChiFormat}画 ({nameBChiFortune})
- 総格: {nameBTotalFormat}画 ({nameBTotalFortune})
- 総合スコア: {nameBOverallScore}/100

関係性: {relationshipType}

以下の観点で相性を分析してください:

1. **基本的な相性度合い（0-100点）**
   - 総合的な相性スコア
   - 相性の根拠

2. **強みとなる関係性**
   - お互いの良い影響
   - 補完し合える点
   - 共通の価値観

3. **注意すべき点**
   - 潜在的な対立点
   - 理解し合うべき違い
   - 改善の余地

4. **より良い関係を築くためのアドバイス**
   - 具体的な行動提案
   - コミュニケーションのコツ
   - 関係性の発展方法

5. **関係性別の詳細分析**
   - 結婚・恋愛・ビジネス・友人関係での相性
   - 各関係性での具体的なアドバイス

回答は具体的で実用的なアドバイスを含めてください。
`,

  // 改名コンサル用プロンプト
  RENAMING_CONSULTATION: `
あなたは姓名判断の専門家です。改名コンサルタントとして、最適な名前を提案してください。

現在の姓名: {currentLastName} {currentFirstName}

目標:
{targetGoals}

現在の姓名分析:
- 天格: {currentTenFormat}画 ({currentTenFortune})
- 人格: {currentJinFormat}画 ({currentJinFortune})
- 地格: {currentChiFormat}画 ({currentChiFortune})
- 総格: {currentTotalFormat}画 ({currentTotalFortune})

以下の観点で改名提案を行ってください:

1. **現在の姓名の課題**
   - 改善すべき点
   - 問題となる要素

2. **改名提案（3-5案）**
   - 提案する名前
   - 各提案の根拠
   - 期待される効果

3. **改名後の運勢変化**
   - 改善される点
   - 注意すべき点
   - 総合的な運勢向上

4. **改名のタイミングと方法**
   - 最適な改名時期
   - 手続きの方法
   - 改名後の注意点

回答は具体的で実用的なアドバイスを含めてください。
`,

  // 人生シミュレーション用プロンプト
  LIFE_SIMULATION: `
あなたは姓名判断の専門家です。姓名による人生の流れを予測・分析してください。

姓名データ:
- 姓名: {lastName} {firstName}
- 天格: {tenFormat}画 ({tenFortune})
- 人格: {jinFormat}画 ({jinFortune})
- 地格: {chiFormat}画 ({chiFortune})
- 総格: {totalFormat}画 ({totalFortune})

以下の観点で人生シミュレーションを行ってください:

1. **人生の大きな流れ**
   - 幼少期・青年期・中年期・老年期の特徴
   - 各時期の重要なポイント

2. **重要な転機の時期**
   - 人生の転換点
   - 重要な決断の時期
   - 運気の変動時期

3. **各時期でのアドバイス**
   - 人生の各段階での心構え
   - 具体的な行動指針
   - 注意すべき点

4. **未来への展望**
   - 長期的な人生設計
   - 目標達成の方法
   - 幸福な人生のための提案

回答は希望に満ちた内容で、具体的で実用的なアドバイスを含めてください。
`
}

// プロンプトテンプレートの置換関数
export function replacePromptTemplate(template: string, variables: Record<string, any>): string {
  let result = template
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`
    result = result.replace(new RegExp(placeholder, 'g'), String(value))
  }
  
  return result
}

// 姓名判断データのフォーマット関数
export function formatNameDataForPrompt(nameData: any): Record<string, any> {
  return {
    lastName: nameData.lastName || '',
    firstName: nameData.firstName || '',
    tenFormat: nameData.tenFormat || 0,
    jinFormat: nameData.jinFormat || 0,
    chiFormat: nameData.chiFormat || 0,
    gaiFormat: nameData.gaiFormat || 0,
    totalFormat: nameData.totalFormat || 0,
    tenFortune: nameData.tenFortune?.fortune || '',
    jinFortune: nameData.jinFortune?.fortune || '',
    chiFortune: nameData.chiFortune?.fortune || '',
    gaiFortune: nameData.gaiFortune?.fortune || '',
    totalFortune: nameData.totalFortune?.fortune || '',
    overallScore: nameData.overallScore || 0,
    oldKanjiConversion: nameData.hasChanged ? 'あり' : 'なし'
  }
}

// 相性分析データのフォーマット関数
export function formatCompatibilityDataForPrompt(
  name1Data: any,
  name2Data: any,
  relationshipType: string
): Record<string, any> {
  const name1 = formatNameDataForPrompt(name1Data)
  const name2 = formatNameDataForPrompt(name2Data)
  
  return {
    nameALastName: name1.lastName,
    nameAFirstName: name1.firstName,
    nameATenFormat: name1.tenFormat,
    nameAJinFormat: name1.jinFormat,
    nameAChiFormat: name1.chiFormat,
    nameATotalFormat: name1.totalFormat,
    nameATenFortune: name1.tenFortune,
    nameAJinFortune: name1.jinFortune,
    nameAChiFortune: name1.chiFortune,
    nameATotalFortune: name1.totalFortune,
    nameAOverallScore: name1.overallScore,
    nameBLastName: name2.lastName,
    nameBFirstName: name2.firstName,
    nameBTenFormat: name2.tenFormat,
    nameBJinFormat: name2.jinFormat,
    nameBChiFormat: name2.chiFormat,
    nameBTotalFormat: name2.totalFormat,
    nameBTenFortune: name2.tenFortune,
    nameBJinFortune: name2.jinFortune,
    nameBChiFortune: name2.chiFortune,
    nameBTotalFortune: name2.totalFortune,
    nameBOverallScore: name2.overallScore,
    relationshipType: relationshipType
  }
}
