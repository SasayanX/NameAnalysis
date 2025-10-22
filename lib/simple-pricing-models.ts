// シンプルで分かりやすい課金モデル

export const simplePricingModels = {
  // 1. 期間制パス（最もシンプル）
  timePasses: {
    concept: "期間中は全機能使い放題",
    plans: {
      "1日パス": {
        price: 100,
        duration: "24時間",
        features: "全機能無制限",
        appeal: "お試しに最適",
      },
      "1週間パス": {
        price: 300,
        duration: "7日間",
        features: "全機能無制限",
        appeal: "短期集中利用",
      },
      "1ヶ月パス": {
        price: 800,
        duration: "30日間",
        features: "全機能無制限",
        appeal: "じっくり利用",
      },
    },
    benefits: [
      "価格が明確（100円、300円、800円）",
      "機能制限なし（ストレスフリー）",
      "期限が分かりやすい",
      "実装がシンプル",
    ],
  },

  // 2. 回数券制（使い切り型）
  ticketSystem: {
    concept: "回数分だけ購入、使い切り",
    options: {
      お試し3回券: {
        price: 150,
        uses: 3,
        perUse: 50,
        target: "初回ユーザー",
      },
      標準10回券: {
        price: 400,
        uses: 10,
        perUse: 40,
        target: "定期利用者",
      },
      お得30回券: {
        price: 900,
        uses: 30,
        perUse: 30,
        target: "ヘビーユーザー",
      },
    },
    benefits: ["1回あたりの価格が明確", "使い切りで分かりやすい", "まとめ買い割引で単価下げ", "残高管理不要"],
  },

  // 3. 機能別都度課金（最も直感的）
  payPerUse: {
    concept: "使いたい機能だけその都度購入",
    pricing: {
      基本姓名判断: { price: 0, description: "無料" },
      詳細鑑定: { price: 50, description: "画数・五行・三才配置" },
      相性診断: { price: 80, description: "2人の相性分析" },
      運気運行表: { price: 120, description: "年間運勢カレンダー" },
      PDF出力: { price: 30, description: "結果をPDF保存" },
      改名提案: { price: 200, description: "最適な名前を提案" },
    },
    benefits: ["必要な機能だけ購入", "価格が超明確", "小額から始められる", "無駄がない"],
  },
}

// 実装の簡単さ比較
export const implementationComplexity = {
  timePasses: {
    complexity: "★☆☆☆☆",
    implementation: "localStorage + 期限チェックのみ",
    code: `
      const hasValidPass = () => {
        const passExpiry = localStorage.getItem('passExpiry')
        return passExpiry && new Date() < new Date(passExpiry)
      }
    `,
  },

  ticketSystem: {
    complexity: "★★☆☆☆",
    implementation: "localStorage + 回数カウント",
    code: `
      const useTicket = () => {
        const remaining = parseInt(localStorage.getItem('tickets') || '0')
        if (remaining > 0) {
          localStorage.setItem('tickets', (remaining - 1).toString())
          return true
        }
        return false
      }
    `,
  },

  payPerUse: {
    complexity: "★★★☆☆",
    implementation: "機能ごとの決済処理",
    note: "決済回数が多くなる可能性",
  },
}
