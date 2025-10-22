// 現実的な価値に基づく価格設定

export const realisticPricingModel = {
  // 現在の機能レベルに適した価格
  appropriatePricing: {
    フリー: {
      price: 0,
      features: ["基本姓名判断", "月3回まで"],
      value: "お試し・ライトユーザー向け",
    },

    ベーシック: {
      price: 198, // 200円以下に抑制
      features: ["詳細鑑定無制限", "相性診断月10回", "PDF出力無制限", "五行・三才配置分析"],
      value: "日常的に使いたいユーザー向け",
      justification: "コンビニ弁当1個分の価格",
    },

    プレミアム: {
      price: 398, // 400円以下
      features: [
        "全機能無制限",
        "運気運行表・年間カレンダー",
        "六星占術詳細分析",
        "改名候補提案（自動生成）",
        "データエクスポート",
      ],
      value: "本格的に活用したいユーザー向け",
      justification: "ランチ1回分の価格",
    },
  },

  // プロランクを提供するなら必要な機能
  proLevelRequirements: {
    humanElement: {
      required: "人的サービスが必須",
      examples: [
        "月1回の個別相談（Zoom/電話）",
        "手動での詳細鑑定書作成",
        "改名提案の個別カスタマイズ",
        "メール/チャットでの質問対応",
      ],
      cost: "人件費を考慮すると最低3,000円/月は必要",
    },

    advancedFeatures: {
      required: "高度な機能開発が必須",
      examples: [
        "AI による個別アドバイス生成",
        "過去の鑑定履歴からの傾向分析",
        "家族全体の相性マトリックス",
        "企業名・商品名の商標チェック連携",
      ],
      development: "数ヶ月の開発期間が必要",
    },
  },

  // 段階的な価値向上戦略
  valueGrowthStrategy: {
    phase1: {
      focus: "現在の機能を198円/398円で提供",
      goal: "ユーザー数拡大・フィードバック収集",
      timeline: "3ヶ月",
    },

    phase2: {
      focus: "AI機能・高度な分析機能追加",
      pricing: "プレミアム 598円に値上げ",
      timeline: "6ヶ月後",
    },

    phase3: {
      focus: "人的サービス開始",
      pricing: "プロプラン 2,980円で提供",
      requirement: "専門スタッフ雇用",
      timeline: "1年後",
    },
  },
}

// 正直な収益予測
export const honestRevenueProjection = {
  currentLevel: {
    // 現実的な価格での予測
    pricing: { basic: 198, premium: 398 },
    users: { basic: 100, premium: 30 }, // 控えめな予測
    monthly: 198 * 100 + 398 * 30, // 31,740円
    yearly: 31740 * 12, // 380,880円

    pros: ["実現可能", "ユーザー満足度高", "継続率良好"],
    cons: ["収益は控えめ", "急成長は困難"],
  },

  overpriced: {
    // 高すぎる価格での予測
    pricing: { basic: 298, premium: 598, pro: 1298 },
    users: { basic: 20, premium: 5, pro: 1 }, // 大幅減少
    monthly: 298 * 20 + 598 * 5 + 1298 * 1, // 10,248円
    yearly: 10248 * 12, // 122,976円

    pros: ["単価は高い"],
    cons: ["ユーザー数激減", "継続率悪化", "評判リスク"],
  },
}
