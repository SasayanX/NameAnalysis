// 決済プロバイダ選択マトリックス

export const providerDecisionMatrix = {
  // 評価基準
  criteria: {
    審査通過率: { weight: 30, description: "占い系サービスでの審査通過可能性" },
    実装難易度: { weight: 20, description: "技術的な実装の容易さ" },
    手数料: { weight: 25, description: "決済手数料の安さ" },
    機能性: { weight: 15, description: "定期課金等の機能充実度" },
    信頼性: { weight: 10, description: "サービスの安定性・信頼性" },
  },

  // プロバイダ評価（10点満点）
  providers: {
    gmoPayment: {
      審査通過率: 8, // 占い系に比較的寛容
      実装難易度: 6, // 既存コードあり
      手数料: 7, // 3.24%
      機能性: 9, // 定期課金・多様な決済手段
      信頼性: 9, // 老舗企業
      総合点: 7.7,
      recommendation: "最優先候補",
    },

    square: {
      審査通過率: 9, // 占い系でも高い通過率
      実装難易度: 9, // 最も簡単
      手数料: 8, // 3.25%（優秀）
      機能性: 7, // 基本機能充実
      信頼性: 9, // 世界的企業
      総合点: 8.4,
      recommendation: "🏆 最優先推奨",
    },

    paypal: {
      審査通過率: 9, // 最も緩い
      実装難易度: 9, // 最も簡単
      手数料: 5, // 3.6% + 40円
      機能性: 7, // 基本的な定期課金
      信頼性: 8, // グローバル企業
      総合点: 7.4,
      recommendation: "バックアップ候補",
    },

    stripe: {
      審査通過率: 2, // 占い系NG
      実装難易度: 9, // 最も簡単
      手数料: 8, // 3.6%
      機能性: 10, // 最高機能
      信頼性: 10, // 最高
      総合点: 5.9,
      recommendation: "利用不可",
    },
  },

  // 推奨戦略
  recommendedStrategy: {
    primary: "Square（最優先）",
    secondary: "コンビニ決済（補完）",
    backup: "GMOペイメント",
    timeline: "Square申込み最優先、並行してコンビニ決済準備",
  },
}
