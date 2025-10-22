// PWA対応サブスクリプションモデル

export const subscriptionModels = {
  // 1. 従来型サブスク（最も安定）
  traditionalSubscription: {
    concept: "月額固定料金で全機能利用",
    tiers: {
      ベーシック: {
        price: 298,
        features: ["詳細鑑定無制限", "相性診断月10回", "PDF出力無制限"],
        target: "一般ユーザー",
        expectedUsers: 100,
      },
      プレミアム: {
        price: 598,
        features: ["全機能無制限", "運気運行表", "改名提案月3回", "優先サポート"],
        target: "ヘビーユーザー",
        expectedUsers: 50,
      },
      プロ: {
        price: 1298,
        features: ["全機能無制限", "個別コンサル月1回", "カスタムレポート", "API利用"],
        target: "プロ・事業者",
        expectedUsers: 10,
      },
    },
    monthlyRevenue: 298 * 100 + 598 * 50 + 1298 * 10, // 72,680円
  },

  // 2. 使用量ベースサブスク（柔軟性重視）
  usageBasedSubscription: {
    concept: "基本料金 + 使用量課金",
    structure: {
      基本料金: 198, // 月額基本料
      従量課金: {
        詳細鑑定: 30, // 1回30円
        相性診断: 50, // 1回50円
        運気運行表: 100, // 1回100円
      },
      無料枠: {
        詳細鑑定: 3, // 月3回まで無料
        相性診断: 1, // 月1回まで無料
      },
    },
    benefits: ["使わない月は安い", "ヘビーユーザーからは多く徴収", "心理的ハードル低い"],
  },

  // 3. ティア制サブスク（段階的成長）
  tieredSubscription: {
    concept: "利用に応じて自動アップグレード",
    progression: {
      スターター: {
        price: 0,
        limits: { 詳細鑑定: 3, 相性診断: 1, PDF出力: 1 },
        upgradeCondition: "月10回利用で自動提案",
      },
      レギュラー: {
        price: 398,
        limits: { 詳細鑑定: 30, 相性診断: 10, PDF出力: 10 },
        upgradeCondition: "月50回利用で自動提案",
      },
      アンリミテッド: {
        price: 798,
        limits: "無制限",
        features: ["運気運行表", "改名提案", "優先サポート"],
      },
    },
  },
}

// Stripe以外での実装方法
export const alternativeImplementations = {
  // 1. GMOペイメント + 定期課金
  gmoRecurring: {
    provider: "GMOペイメントゲートウェイ",
    features: ["定期課金対応", "多様な決済手段", "占い系比較的寛容"],
    implementation: {
      setup: "GMO定期課金API連携",
      billing: "月次自動課金",
      management: "ユーザー管理画面",
      cancellation: "いつでも解約可能",
    },
    cost: "決済手数料 3.24% + 月額基本料",
  },

  // 2. 銀行振込 + 自動管理
  bankTransferSubscription: {
    concept: "銀行振込での月額課金",
    workflow: {
      signup: "ユーザー登録 + 振込先案内",
      payment: "毎月指定日までに振込",
      verification: "入金確認（API or 手動）",
      activation: "サービス有効化",
      reminder: "未入金時の自動リマインド",
    },
    pros: ["決済手数料最安", "審査不要", "確実な入金"],
    cons: ["手動確認必要", "ユーザー手間", "未払いリスク"],
  },

  // 3. 疑似サブスク（月額パス自動更新）
  pseudoSubscription: {
    concept: "月額パスの自動購入システム",
    mechanism: {
      userConsent: "自動更新に同意",
      paymentMethod: "クレカ情報保存（PCI準拠）",
      autoRenewal: "期限前に自動決済",
      notification: "更新前の事前通知",
      cancellation: "いつでも自動更新停止",
    },
    implementation: "既存の期間制パス + 自動更新ロジック",
  },
}
