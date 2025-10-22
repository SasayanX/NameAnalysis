// 推奨価格設定

export const recommendedPricing = {
  // 最も推奨：期間制パス
  bestOption: {
    model: "期間制パス",
    reasons: ["価格が分かりやすい", "ユーザーストレスが少ない", "実装が最もシンプル", "収益予測しやすい"],

    pricing: {
      "1日お試し": 100,
      "1週間": 300,
      "1ヶ月": 800,
    },

    strategy: {
      entry: "100円の1日パスで気軽にお試し",
      conversion: "300円の週パスでリピート獲得",
      retention: "800円の月パスで安定収益",
    },
  },

  // 決済方法との組み合わせ
  paymentIntegration: {
    GMOペイメント: {
      suitable: ["期間制パス", "回数券"],
      implementation: "定期課金 + ワンタイム決済",
    },

    コンビニ決済: {
      suitable: ["回数券", "都度課金"],
      implementation: "プリペイド方式",
    },

    ギフトコード: {
      suitable: ["期間制パス"],
      implementation: "Amazon・楽天で販売",
    },
  },
}

// 収益シミュレーション
export const revenueSimulation = {
  timePassModel: {
    users: {
      trial_100yen: 100, // 月100人が1日パス
      weekly_300yen: 30, // 月30人が週パス
      monthly_800yen: 20, // 月20人が月パス
    },
    revenue: {
      trial: 10000, // 100 × 100円
      weekly: 9000, // 30 × 300円
      monthly: 16000, // 20 × 800円
      total: 35000, // 月3.5万円
    },
    conversionRate: {
      "trial → weekly": "30%",
      "weekly → monthly": "50%",
    },
  },
}
