// PWA特化のマネタイズ戦略

export const pwaMonetization = {
  // 1. オフライン機能の有料化
  offlineFeatures: {
    free: ["基本的な姓名判断", "簡易結果表示"],
    premium: ["詳細分析", "PDF出力", "履歴保存", "オフライン同期"],
    implementation: "Service Worker + IndexedDB",
  },

  // 2. プッシュ通知の活用
  pushNotifications: {
    free: ["今日の運勢（週1回）"],
    premium: ["毎日の運勢", "ラッキーカラー", "注意事項"],
    monetization: "プレミアム通知で課金誘導",
  },

  // 3. データ同期・バックアップ
  dataSync: {
    free: ["ローカル保存のみ"],
    premium: ["クラウド同期", "デバイス間共有", "バックアップ"],
    value: "データ紛失の不安解消",
  },

  // 4. カスタマイズ機能
  customization: {
    free: ["基本テーマ"],
    premium: ["カスタムテーマ", "フォント選択", "レイアウト変更"],
    appeal: "個人の好みに合わせた体験",
  },
}

// 決済回避戦略
export const paymentAvoidanceStrategies = {
  // 1. 情報商材として販売
  infoProduct: {
    platform: "note, Brain, Kindle",
    concept: "姓名判断の解説書 + アプリ利用権",
    price: "500-2000円",
    benefits: "決済プラットフォームの審査通過",
  },

  // 2. コンサルティングサービス
  consulting: {
    concept: "個別鑑定サービス + アプリ無料利用",
    pricing: "30分 3000円〜",
    platform: "Zoom, Google Meet",
    benefits: "高単価、決済業者の制約回避",
  },

  // 3. 教育・講座サービス
  education: {
    concept: "姓名判断講座 + アプリ利用権",
    format: "動画講座, PDF教材",
    platform: "Udemy, Teachable",
    benefits: "教育サービスとして正当化",
  },
}
