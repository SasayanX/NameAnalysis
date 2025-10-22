// PWA対応の代替決済システム

export const alternativePayments = {
  // 1. GMOペイメントゲートウェイ
  gmo: {
    name: "GMOペイメントゲートウェイ",
    supported: true,
    fees: "3.4%",
    features: ["クレカ", "コンビニ決済", "銀行振込", "PayPay"],
    spiritualFriendly: true,
    implementation: "REST API",
    notes: "占い・スピリチュアル系に比較的寛容",
  },

  // 2. SBペイメントサービス
  sbpayment: {
    name: "SBペイメントサービス",
    supported: true,
    fees: "3.24%",
    features: ["クレカ", "キャリア決済", "電子マネー"],
    spiritualFriendly: true,
    implementation: "JavaScript SDK",
    notes: "ソフトバンク系、多様な業種対応",
  },

  // 3. PAY.JP
  payjp: {
    name: "PAY.JP",
    supported: true,
    fees: "3.6%",
    features: ["クレカ", "コンビニ決済"],
    spiritualFriendly: "要確認",
    implementation: "JavaScript SDK",
    notes: "日本のスタートアップ向け",
  },

  // 4. 楽天ペイ
  rakutenpay: {
    name: "楽天ペイ（オンライン決済）",
    supported: true,
    fees: "3.24%",
    features: ["クレカ", "楽天ポイント"],
    spiritualFriendly: true,
    implementation: "REST API",
    notes: "楽天経済圏のユーザーに強い",
  },
}

// プリペイド・ギフトカード方式
export const prepaidSystems = {
  // 1. ポイント購入システム
  pointSystem: {
    concept: "ポイント事前購入 → サービス利用",
    implementation: {
      purchase: "コンビニ決済・銀行振込でポイント購入",
      usage: "ポイント消費でプレミアム機能解放",
      benefits: "決済業者の審査回避、ユーザーの心理的ハードル低下",
    },
    example: {
      "100ポイント": "110円（コンビニ決済）",
      "500ポイント": "550円（5%ボーナス）",
      "1000ポイント": "1000円（10%ボーナス）",
    },
  },

  // 2. ギフトコード方式
  giftCodeSystem: {
    concept: "ギフトコード販売 → コード入力で機能解放",
    channels: ["Amazon ギフトカード販売", "楽天市場での販売", "BASE・STORESでの販売", "note・Brainでの販売"],
    implementation: "コード生成・検証システム",
  },
}

// 暗号通貨決済
export const cryptoPayments = {
  coincheck: {
    name: "Coincheck Payment",
    supported: true,
    fees: "1%",
    currencies: ["BTC", "ETH", "XRP"],
    notes: "日本の主要取引所、法人向けサービス",
  },

  metamask: {
    name: "MetaMask連携",
    supported: true,
    fees: "ガス代のみ",
    implementation: "Web3.js",
    notes: "技術に詳しいユーザー向け",
  },
}
