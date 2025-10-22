// 代替サブスクリプションモデル

export const alternativeModels = {
  // 1. 月額チケット制
  ticketSystem: {
    concept: "月額でチケット購入 → チケット消費で利用",
    plans: {
      light: { price: 99, tickets: 10, name: "ライトプラン" },
      standard: { price: 299, tickets: 50, name: "スタンダードプラン" },
      premium: { price: 499, tickets: 100, name: "プレミアムプラン" },
    },
    benefits: ["使わない月は繰り越し可能", "心理的負担軽減", "柔軟な利用パターン対応"],
  },

  // 2. 期間限定パス制
  timePassSystem: {
    concept: "期間限定で全機能使い放題",
    options: {
      "1日パス": { price: 50, duration: "24時間" },
      "1週間パス": { price: 200, duration: "7日間" },
      "1ヶ月パス": { price: 500, duration: "30日間" },
    },
    implementation: "localStorage + 期限チェック",
  },

  // 3. 機能別課金
  featureBasedPricing: {
    concept: "使いたい機能だけ個別購入",
    features: {
      詳細鑑定: { price: 30, validity: "1回" },
      相性診断: { price: 50, validity: "1回" },
      運気運行表: { price: 100, validity: "1ヶ月" },
      PDF出力: { price: 20, validity: "1回" },
    },
  },
}

// 実装優先順位
export const implementationPriority = {
  immediate: ["ポイントシステム + コンビニ決済", "ギフトコード販売（Amazon・楽天）", "GMOペイメント統合"],

  shortTerm: ["チケット制サブスクリプション", "期間限定パス", "暗号通貨決済（MetaMask）"],

  longTerm: ["独自決済代行業者との契約", "海外決済サービス検討", "パートナーシップ拡大"],
}
