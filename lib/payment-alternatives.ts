// 代替決済サービスの設定
export const paymentProviders = {
  // 日本国内向け
  paypay: {
    name: "PayPay",
    supported: true,
    fees: "3.45%",
    notes: "日本で広く利用されている",
  },

  square: {
    name: "Square",
    supported: true,
    fees: "3.25%",
    notes: "占い・スピリチュアル系に比較的寛容",
  },

  paypal: {
    name: "PayPal",
    supported: true,
    fees: "3.6% + 40円",
    notes: "グローバル対応、審査が比較的緩い",
  },

  // 日本の銀行系
  gmopayment: {
    name: "GMOペイメントゲートウェイ",
    supported: true,
    fees: "3.4%",
    notes: "日本の老舗決済代行会社",
  },

  sbpayment: {
    name: "SBペイメントサービス",
    supported: true,
    fees: "3.24%",
    notes: "ソフトバンク系、多様な業種に対応",
  },
}

// 無料プランの拡充案
export const freeFeatures = {
  basic: ["基本的な姓名判断", "三才配置の分析", "基本的な運勢表示", "簡易相性診断"],

  enhanced: ["詳細な五行分析", "年間運勢カレンダー（簡易版）", "基本的な改名提案", "PDF出力（基本版）"],
}
