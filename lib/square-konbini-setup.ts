// Square + コンビニ決済の実装ガイド

export const SQUARE_KONBINI_STRATEGY = {
  // Square（メイン決済）
  square: {
    name: "Square",
    target: "クレジットカード決済",
    advantages: [
      "🏆 開業届不要で審査が通りやすい（最大のメリット）",
      "💰 振込手数料完全無料（他社は250円/回）",
      "⚡ 翌営業日入金で資金繰り良好",
      "💳 手数料3.25%（業界最安水準）",
      "🔮 占い・スピリチュアル業界でも多数の利用実績",
      "🛠️ API が使いやすく実装が簡単",
      "🌍 世界的企業の安定性と信頼性",
      "📞 日本語サポート対応",
    ],
    disadvantages: ["海外企業（日本法人あり）", "サポートが英語ベース（日本語対応あり）"],
    implementation: {
      step1: "Square開発者アカウント作成",
      step2: "サンドボックス環境でテスト",
      step3: "本番環境申請・審査",
      step4: "Webhook設定",
      step5: "サブスクリプション機能実装",
    },
    fees: {
      creditCard: "3.25%",
      transfer: "無料",
      chargeback: "1,500円/件",
      monthly: "無料",
    },
  },

  // コンビニ決済（サブ決済）
  konbini: {
    name: "コンビニ決済",
    target: "クレジットカードを持たない・使いたくないユーザー",
    advantages: [
      "審査なし・即日利用開始",
      "クレジットカード不要",
      "日本人に馴染みがある決済方法",
      "未成年でも利用可能",
      "現金決済の安心感",
    ],
    disadvantages: ["手数料が高い（5-10%）", "入金サイクルが長い", "決済完了まで時間がかかる"],
    providers: [
      {
        name: "GMO後払い",
        fee: "5.5%",
        settlementCycle: "月1回",
        features: ["セブン・ローソン・ファミマ対応", "審査なし"],
      },
      {
        name: "atone（アトネ）",
        fee: "5.5%",
        settlementCycle: "月2回",
        features: ["主要コンビニ対応", "後払い機能", "審査なし"],
      },
      {
        name: "Paidy翌月払い",
        fee: "5.5%",
        settlementCycle: "月1回",
        features: ["コンビニ・銀行振込対応", "分割払い可能"],
      },
    ],
  },

  // 組み合わせ戦略
  strategy: {
    phase1: {
      title: "即日開始フェーズ",
      duration: "今週",
      actions: ["コンビニ決済プロバイダー（atone）に申請", "簡易的な決済フォーム実装", "課金機能の基本動作確認"],
      goal: "最低限の課金機能を稼働させる",
    },
    phase2: {
      title: "Square統合フェーズ",
      duration: "来週",
      actions: ["Square開発者アカウント作成", "サンドボックス環境でテスト実装", "Square審査申請", "決済方法選択UI実装"],
      goal: "メインの決済手段としてSquareを稼働",
    },
    phase3: {
      title: "最適化フェーズ",
      duration: "再来週",
      actions: ["決済成功率の分析", "ユーザー体験の改善", "サブスクリプション機能の充実", "決済データの分析・改善"],
      goal: "決済体験の最適化と売上最大化",
    },
  },

  // 実装優先順位
  implementation_priority: [
    {
      priority: 1,
      task: "atone（コンビニ決済）実装",
      reason: "審査なし、即日開始可能",
      effort: "低",
      impact: "中",
    },
    {
      priority: 2,
      task: "Square審査申請",
      reason: "メイン決済手段、手数料最安",
      effort: "中",
      impact: "高",
    },
    {
      priority: 3,
      task: "決済方法選択UI",
      reason: "ユーザビリティ向上",
      effort: "中",
      impact: "中",
    },
    {
      priority: 4,
      task: "サブスクリプション管理",
      reason: "継続課金の仕組み",
      effort: "高",
      impact: "高",
    },
  ],
}

// 手数料比較（月売上5万円の場合）
export const COST_COMPARISON = {
  square_only: {
    sales: 50000,
    fee_rate: 3.25,
    transaction_fee: 1625,
    transfer_fee: 0,
    total_cost: 1625,
    effective_rate: 3.25,
  },
  konbini_only: {
    sales: 50000,
    fee_rate: 5.5,
    transaction_fee: 2750,
    transfer_fee: 0,
    total_cost: 2750,
    effective_rate: 5.5,
  },
  mixed_strategy: {
    // Square 70%, コンビニ 30% と仮定
    square_sales: 35000,
    konbini_sales: 15000,
    square_fee: 1137,
    konbini_fee: 825,
    total_cost: 1962,
    effective_rate: 3.92,
  },
}
