// 五行三才（天格・人格・地格の五行関係）の判断ロジック

// 画数から五行を取得する関数
export function getGogyoFromStrokes(strokes: number): string {
  const lastDigit = strokes % 10

  if (lastDigit === 1 || lastDigit === 2) return "木"
  if (lastDigit === 3 || lastDigit === 4) return "火"
  if (lastDigit === 5 || lastDigit === 6) return "土"
  if (lastDigit === 7 || lastDigit === 8) return "金"
  if (lastDigit === 9 || lastDigit === 0) return "水"

  return "不明"
}

// 五行の相生・相剋関係を判定する関数
export function getGogyoRelation(from: string, to: string): "相生" | "相剋" | "同行" | "不明" {
  // 相生の関係（生み出し合う）
  const souseiMap: Record<string, string> = {
    木: "火", // 木生火
    火: "土", // 火生土
    土: "金", // 土生金
    金: "水", // 金生水
    水: "木", // 水生木
  }

  // 相剋の関係（打ち消し合う）
  const soukokuMap: Record<string, string> = {
    木: "土", // 木剋土
    火: "金", // 火剋金
    土: "水", // 土剋水
    金: "木", // 金剋木
    水: "火", // 水剋火
  }

  if (from === to) return "同行"
  if (souseiMap[from] === to) return "相生"
  if (soukokuMap[from] === to) return "相剋"

  return "不明"
}

// 三才配置の吉凶を判定する関数（改善版）
export function analyzeSansaiConfiguration(
  tenStrokes: number,
  jinStrokes: number,
  chiStrokes: number,
): {
  tenGogyo: string
  jinGogyo: string
  chiGogyo: string
  tenToJinRelation: string
  jinToChiRelation: string
  overallJudgment: "大吉" | "吉" | "中吉" | "普通" | "凶" | "大凶"
  score: number
  description: string
} {
  const tenGogyo = getGogyoFromStrokes(tenStrokes)
  const jinGogyo = getGogyoFromStrokes(jinStrokes)
  const chiGogyo = getGogyoFromStrokes(chiStrokes)

  const tenToJinRelation = getGogyoRelation(tenGogyo, jinGogyo)
  const jinToChiRelation = getGogyoRelation(jinGogyo, chiGogyo)

  // 基本点を30に変更（より広い範囲でスコアが変動するように）
  let score = 30 // 基本点を50から30に変更
  let overallJudgment: "大吉" | "吉" | "中吉" | "普通" | "凶" | "大凶" = "普通"
  let description = ""

  // デバッグログを追加
  console.log(`=== 三才パワー計算 ===`)
  console.log(`天格: ${tenStrokes}画 → ${tenGogyo}`)
  console.log(`人格: ${jinStrokes}画 → ${jinGogyo}`)
  console.log(`地格: ${chiStrokes}画 → ${chiGogyo}`)
  console.log(`天→人: ${tenToJinRelation}`)
  console.log(`人→地: ${jinToChiRelation}`)

  // 両方が相生の場合
  if (tenToJinRelation === "相生" && jinToChiRelation === "相生") {
    score = 95 // 100から95に調整
    overallJudgment = "大吉"
    description = "天格→人格→地格が全て相生の関係で、最高の三才配置です。運勢が強く発揮されます。"
  }
  // 一方が相生、一方が同行の場合
  else if (
    (tenToJinRelation === "相生" && jinToChiRelation === "同行") ||
    (tenToJinRelation === "同行" && jinToChiRelation === "相生")
  ) {
    score = 80 // 85から80に調整
    overallJudgment = "吉"
    description = "相生と同行の組み合わせで、良好な三才配置です。安定した運勢が期待できます。"
  }
  // 一方が相生、一方が相剋の場合
  else if (
    (tenToJinRelation === "相生" && jinToChiRelation === "相剋") ||
    (tenToJinRelation === "相剋" && jinToChiRelation === "相生")
  ) {
    score = 55 // 60から55に調整
    overallJudgment = "中吉"
    description = "相生と相剋が混在しており、波のある運勢となります。"
  }
  // 両方が同行の場合
  else if (tenToJinRelation === "同行" && jinToChiRelation === "同行") {
    score = 65 // 70から65に調整
    overallJudgment = "吉"
    description = "同じ五行で統一されており、安定感のある三才配置です。"
  }
  // 一方が同行、一方が相剋の場合
  else if (
    (tenToJinRelation === "同行" && jinToChiRelation === "相剋") ||
    (tenToJinRelation === "相剋" && jinToChiRelation === "同行")
  ) {
    score = 35 // 40から35に調整
    overallJudgment = "凶"
    description = "同行と相剋の組み合わせで、やや不安定な運勢となります。"
  }
  // 両方が相剋の場合
  else if (tenToJinRelation === "相剋" && jinToChiRelation === "相剋") {
    score = 15 // 20から15に調整
    overallJudgment = "大凶"
    description = "天格→人格→地格が全て相剋の関係で、困難な三才配置です。注意が必要です。"
  }
  // 一方または両方が「不明」の場合の処理を追加
  else if (tenToJinRelation === "不明" || jinToChiRelation === "不明") {
    score = 45 // 55から45に調整
    overallJudgment = "普通"
    description = "五行の関係が不明確ですが、基本的な運勢は保たれています。"
  }
  // その他の組み合わせ
  else {
    // より細かい判定を追加
    let positiveCount = 0
    let negativeCount = 0

    if (tenToJinRelation === "相生") positiveCount++
    if (jinToChiRelation === "相生") positiveCount++
    if (tenToJinRelation === "同行") positiveCount += 0.5
    if (jinToChiRelation === "同行") positiveCount += 0.5

    if (tenToJinRelation === "相剋") negativeCount++
    if (jinToChiRelation === "相剋") negativeCount++

    if (positiveCount > negativeCount) {
      score = 60 // 65から60に調整
      overallJudgment = "中吉"
      description = "全体的に良好な三才配置です。"
    } else if (negativeCount > positiveCount) {
      score = 25 // 35から25に調整
      overallJudgment = "凶"
      description = "注意が必要な三才配置です。"
    } else {
      score = 40 // 50から40に調整
      overallJudgment = "普通"
      description = "平均的な三才配置です。"
    }
  }

  console.log(`最終スコア: ${score}点 (${overallJudgment})`)
  console.log(`説明: ${description}`)

  return {
    tenGogyo,
    jinGogyo,
    chiGogyo,
    tenToJinRelation,
    jinToChiRelation,
    overallJudgment,
    score,
    description,
  }
}

// デバッグ用のテスト関数を追加して計算過程を確認できるようにします

// テスト用の関数を追加
export function testSansaiCalculation() {
  console.log("=== 三才パワー計算テスト ===")

  // テストケース1: 木→火→土（相生→相生）
  const test1 = analyzeSansaiConfiguration(11, 13, 15) // 木→火→土
  console.log("テスト1 (11-13-15画):", test1)

  // テストケース2: 木→木→木（同行→同行）
  const test2 = analyzeSansaiConfiguration(11, 11, 11) // 木→木→木
  console.log("テスト2 (11-11-11画):", test2)

  // テストケース3: 木→土→火（相剋→相生）
  const test3 = analyzeSansaiConfiguration(11, 15, 13) // 木→土→火
  console.log("テスト3 (11-15-13画):", test3)

  // テストケース4: 木→金→水（相剋→相剋）
  const test4 = analyzeSansaiConfiguration(11, 17, 19) // 木→金→水
  console.log("テスト4 (11-17-19画):", test4)

  return { test1, test2, test3, test4 }
}
