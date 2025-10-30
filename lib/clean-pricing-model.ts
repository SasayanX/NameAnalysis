// 税込み・キリの良い価格設定

export const cleanPricingModel = {
  // 月額プラン（税込み）
  monthlyPlans: {
    ベーシック: {
      monthly: 330, // 税込み330円
      features: ["詳細鑑定無制限", "相性診断月10回", "PDF出力無制限", "五行・三才配置分析"],
      target: "日常利用ユーザー",
    },

    プレミアム: {
      monthly: 550, // 税込み550円
      features: [
        "全機能無制限",
        "運気運行表・年間カレンダー",
        "六星占術詳細分析",
        "改名候補提案",
        "データエクスポート",
      ],
      target: "本格活用ユーザー",
    },
  },

  // まとめ払い割引（税込み価格）
  bulkDiscounts: {
    ベーシック: {
      monthly: 330,
      quarterly: 594, // 3ヶ月 10%OFF（660円→594円）
      semiannual: 1100, // 6ヶ月 17%OFF（1320円→1100円）
      annual: 1980, // 1年 25%OFF（2640円→1980円）
    },

    プレミアム: {
      monthly: 550,
      quarterly: 1188, // 3ヶ月 10%OFF（1320円→1188円）
      semiannual: 3300, // 6ヶ月想定（割引例）
      annual: 3960, // 1年 25%OFF（5280円→3960円）
    },
  },

  // 価格表示の心理効果
  pricingPsychology: {
    cleanNumbers: "200円、400円など処理しやすい",
    bulkSavings: "年間600円お得！など具体的な節約額",
    popularBadge: "6ヶ月プランに「人気」バッジ",
    bestValue: "年間プランに「最もお得」バッジ",
  },
}

// 収益シミュレーション
export const revenueSimulation = {
  // 保守的予測（まとめ払い効果込み）
  conservative: {
    users: {
      basic_monthly: 60,
      basic_annual: 40, // 年払い選択率40%
      premium_monthly: 15,
      premium_annual: 15, // 年払い選択率50%
    },

    monthlyRevenue:
      60 * 200 + // ベーシック月払い
      (40 * 1800) / 12 + // ベーシック年払い（月割り）
      15 * 400 + // プレミアム月払い
      (15 * 3600) / 12, // プレミアム年払い（月割り）
    // = 12,000 + 6,000 + 6,000 + 4,500 = 28,500円/月

    benefits: ["キャッシュフロー改善（年払い分）", "チャーン率低下（まとめ払いユーザー）", "価格処理の簡素化"],
  },

  // 楽観的予測（1年後）
  optimistic: {
    users: {
      basic_monthly: 150,
      basic_annual: 100,
      premium_monthly: 40,
      premium_annual: 35,
    },

    monthlyRevenue:
      150 * 200 + // 30,000円
      (100 * 1800) / 12 + // 15,000円
      40 * 400 + // 16,000円
      (35 * 3600) / 12, // 10,500円
    // = 71,500円/月 = 年間858,000円
  },
}
