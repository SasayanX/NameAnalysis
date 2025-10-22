// Square ≠ atone 判明後の修正戦略

export const REVISED_PAYMENT_STRATEGY = {
  // 現実的な選択肢
  realistic_options: {
    option1: {
      name: "Square単体戦略",
      target: "クレジットカードユーザーのみ",
      pros: [
        "開業届不要で審査通過しやすい",
        "手数料3.25%（最安水準）",
        "振込手数料無料",
        "翌営業日入金",
        "占い系でも利用実績多数",
      ],
      cons: ["コンビニ決済未対応", "クレカ未保有者を取りこぼし", "市場の約30%を逃す可能性"],
      market_coverage: "約70%（クレカ保有者）",
      implementation_difficulty: "低",
      recommendation: "🏆 最優先推奨",
    },

    option2: {
      name: "GMOペイメント戦略",
      target: "全決済手段対応",
      pros: [
        "クレカ + コンビニ決済対応",
        "日本最大手の信頼性",
        "占い系に比較的寛容",
        "豊富な決済手段",
        "充実したサポート",
      ],
      cons: ["開業届必須", "審査が厳格", "振込手数料250円/回", "実装がやや複雑"],
      market_coverage: "約95%（全決済手段）",
      implementation_difficulty: "中",
      recommendation: "将来的な選択肢",
    },

    option3: {
      name: "Square + 専用コンビニ決済",
      target: "全ユーザー対応",
      pros: ["Squareの利点を活かしつつコンビニ対応", "決済方法を選択可能", "リスク分散", "段階的実装可能"],
      cons: ["2つのシステム管理", "実装コストが高い", "手数料体系が複雑"],
      market_coverage: "約90%",
      implementation_difficulty: "高",
      recommendation: "理想的だが複雑",
    },
  },

  // 推奨実装順序
  implementation_roadmap: {
    phase1: {
      title: "Square単体で開始",
      duration: "今週",
      actions: ["Square審査申請", "クレカ決済フォーム実装", "基本的な課金機能稼働"],
      goal: "最低限の収益化開始",
    },

    phase2: {
      title: "市場反応の確認",
      duration: "1-2ヶ月",
      actions: ["ユーザー行動分析", "決済成功率測定", "コンビニ決済需要調査"],
      goal: "データに基づく次の判断",
    },

    phase3: {
      title: "必要に応じて拡張",
      duration: "3ヶ月後",
      actions: ["コンビニ決済需要が高い場合のみ追加実装", "GMOペイメント検討", "決済手段の最適化"],
      goal: "収益最大化",
    },
  },

  // 現実的な収益予測（Square単体）
  revenue_projection_square_only: {
    conservative: {
      monthly_users: 100,
      conversion_rate: 0.03, // 3%
      paying_users: 3,
      average_payment: 500,
      monthly_revenue: 1500,
      fees: 49, // 3.25%
      net_revenue: 1451,
    },
    realistic: {
      monthly_users: 300,
      conversion_rate: 0.05, // 5%
      paying_users: 15,
      average_payment: 500,
      monthly_revenue: 7500,
      fees: 244,
      net_revenue: 7256,
    },
    optimistic: {
      monthly_users: 500,
      conversion_rate: 0.08, // 8%
      paying_users: 40,
      average_payment: 500,
      monthly_revenue: 20000,
      fees: 650,
      net_revenue: 19350,
    },
  },
}

// 決済プロバイダー最終比較
export const FINAL_PROVIDER_COMPARISON = {
  square: {
    審査通過率: "90%（占い系でも高い）",
    開業届: "不要",
    手数料: "3.25%",
    振込手数料: "無料",
    入金サイクル: "翌営業日",
    対応決済: "クレジットカードのみ",
    実装難易度: "低",
    総合評価: "🏆 最優先推奨",
  },

  gmo: {
    審査通過率: "70%（やや厳格）",
    開業届: "必須",
    手数料: "3.24%",
    振込手数料: "250円/回",
    入金サイクル: "月2回",
    対応決済: "クレカ + コンビニ + 多数",
    実装難易度: "中",
    総合評価: "将来的な選択肢",
  },

  paypal: {
    審査通過率: "95%（最も緩い）",
    開業届: "不要",
    手数料: "3.6% + 40円",
    振込手数料: "無料",
    入金サイクル: "即日〜3日",
    対応決済: "クレカ + PayPal",
    実装難易度: "低",
    総合評価: "バックアップ候補",
  },
}
