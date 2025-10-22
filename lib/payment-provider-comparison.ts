// 決済プロバイダー手数料完全比較

export interface PaymentProvider {
  name: string
  initialFee: string
  monthlyFee: string
  transactionFees: {
    visa_mastercard: string
    jcb: string
    amex: string
    other?: string
  }
  additionalFees: {
    transferFee: string
    chargebackFee: string
    refundFee: string
    setupFee?: string
  }
  minimumTransaction?: string
  settlementCycle: string
  審査難易度: "易しい" | "普通" | "厳格"
  開業届必要: boolean
  特徴: string[]
  隠れたコスト: string[]
}

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    name: "GMOペイメントゲートウェイ",
    initialFee: "無料",
    monthlyFee: "無料",
    transactionFees: {
      visa_mastercard: "3.25%",
      jcb: "3.45%",
      amex: "3.74%",
    },
    additionalFees: {
      transferFee: "250円/回",
      chargebackFee: "2,500円/件",
      refundFee: "無料",
    },
    settlementCycle: "月2回（15日・月末）",
    審査難易度: "厳格",
    開業届必要: true,
    特徴: ["日本最大手の信頼性", "豊富な決済手段", "充実したセキュリティ", "詳細な管理画面", "24時間サポート"],
    隠れたコスト: ["振込手数料が毎回発生", "チャージバック手数料が高額", "最低振込金額の設定あり"],
  },
  {
    name: "Square",
    initialFee: "無料",
    monthlyFee: "無料",
    transactionFees: {
      visa_mastercard: "3.25%",
      jcb: "3.25%",
      amex: "3.25%",
    },
    additionalFees: {
      transferFee: "無料",
      chargebackFee: "1,500円/件",
      refundFee: "無料",
    },
    settlementCycle: "翌営業日",
    審査難易度: "普通",
    開業届必要: false,
    特徴: ["審査が比較的緩い", "振込手数料無料", "翌営業日入金", "シンプルな料金体系", "占い業界でも利用実績あり"],
    隠れたコスト: ["月間売上が少ないと手数料率が上がる場合あり", "海外カード利用時の為替手数料"],
  },
  {
    name: "PayPal",
    initialFee: "無料",
    monthlyFee: "無料",
    transactionFees: {
      visa_mastercard: "3.6% + 40円",
      jcb: "3.6% + 40円",
      amex: "3.6% + 40円",
    },
    additionalFees: {
      transferFee: "無料（銀行振込）",
      chargebackFee: "1,500円/件",
      refundFee: "手数料返還なし",
    },
    settlementCycle: "即日〜3営業日",
    審査難易度: "易しい",
    開業届必要: false,
    特徴: ["最も審査が緩い", "即日利用開始可能", "グローバル対応", "PayPalアカウント決済可能", "個人でも利用しやすい"],
    隠れたコスト: [
      "固定費40円が毎回発生",
      "返金時の手数料が戻らない",
      "為替手数料（海外取引時）",
      "アカウント凍結リスク",
    ],
  },
  {
    name: "SBペイメントサービス",
    initialFee: "無料",
    monthlyFee: "無料",
    transactionFees: {
      visa_mastercard: "3.24%",
      jcb: "3.24%",
      amex: "3.74%",
    },
    additionalFees: {
      transferFee: "220円/回",
      chargebackFee: "2,000円/件",
      refundFee: "無料",
    },
    settlementCycle: "月2回",
    審査難易度: "普通",
    開業届必要: true,
    特徴: ["ソフトバンク系の安定性", "多様な業種に対応", "コンビニ決済も対応", "比較的審査が通りやすい"],
    隠れたコスト: ["振込手数料", "最低振込金額の制限"],
  },
  {
    name: "Stripe",
    initialFee: "無料",
    monthlyFee: "無料",
    transactionFees: {
      visa_mastercard: "3.6%",
      jcb: "3.6%",
      amex: "3.6%",
    },
    additionalFees: {
      transferFee: "無料",
      chargebackFee: "1,500円/件",
      refundFee: "無料",
    },
    settlementCycle: "7営業日後",
    審査難易度: "厳格",
    開業届必要: true,
    特徴: ["開発者向け機能が豊富", "API が使いやすい", "サブスクリプション機能充実", "グローバル対応"],
    隠れたコスト: ["占い・スピリチュアル系は審査が厳しい", "アカウント停止リスク", "入金サイクルが長い"],
  },
]

// 月間売上別の実質コスト計算
export function calculateMonthlyCost(
  provider: PaymentProvider,
  monthlySales: number,
  transactionCount: number,
): {
  transactionFees: number
  transferFees: number
  totalCost: number
  effectiveRate: number
} {
  // 平均手数料率を計算（Visa/Mastercardを基準）
  const baseRate = Number.parseFloat(provider.transactionFees.visa_mastercard.replace("%", ""))
  const fixedFee = provider.transactionFees.visa_mastercard.includes("円")
    ? Number.parseInt(provider.transactionFees.visa_mastercard.split("+ ")[1].replace("円", ""))
    : 0

  const transactionFees = (monthlySales * baseRate) / 100 + fixedFee * transactionCount

  // 振込手数料の計算
  const transferFeePerTransaction = provider.additionalFees.transferFee.includes("無料")
    ? 0
    : Number.parseInt(provider.additionalFees.transferFee.replace("円/回", ""))

  // 月2回振込と仮定
  const transferFees = provider.settlementCycle.includes("月2回")
    ? transferFeePerTransaction * 2
    : transferFeePerTransaction

  const totalCost = transactionFees + transferFees
  const effectiveRate = (totalCost / monthlySales) * 100

  return {
    transactionFees,
    transferFees,
    totalCost,
    effectiveRate,
  }
}

// 売上規模別推奨プロバイダー
export const RECOMMENDED_BY_SALES = {
  "月売上 1万円未満": {
    推奨: "Square",
    理由: "開業届不要、審査が緩い、振込手数料無料で少額でも有利",
  },
  "月売上 1-5万円": {
    推奨: "Square",
    理由: "振込手数料無料、翌営業日入金、占い系でも審査通過実績多数",
  },
  "月売上 5-20万円": {
    推奨: "Square",
    理由: "手数料3.25%業界最安水準、信頼性とコストのベストバランス",
  },
  "月売上 20万円以上": {
    推奨: "Square + GMO（併用）",
    理由: "Squareメイン、GMOで多様な決済手段を補完",
  },
}
