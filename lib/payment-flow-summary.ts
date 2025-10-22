// 課金プロバイダフロー総まとめ

export const paymentFlowSummary = {
  // 現在の状況
  currentStatus: {
    stripe: {
      status: "審査落ち",
      reason: "占い・スピリチュアル系サービスのため",
      alternatives: "他の決済手段が必要",
    },
    development: {
      status: "完成済み",
      features: ["姓名判断", "六星占術", "運気運行表", "PDF出力"],
      readiness: "マネタイズ準備完了",
    },
  },

  // 実装可能な課金フロー（優先順）
  implementableFlows: {
    // 1. 最優先：GMOペイメント
    gmoPayment: {
      priority: 1,
      timeline: "2-4週間",
      setup: {
        step1: "GMOペイメントゲートウェイ申込み",
        step2: "審査通過（占い系比較的寛容）",
        step3: "API統合（既存コード活用）",
        step4: "テスト決済実施",
        step5: "本番運用開始",
      },
      features: ["クレジットカード", "コンビニ決済", "銀行振込", "定期課金"],
      fees: "3.24% + 月額基本料",
      pros: ["占い系に比較的寛容", "多様な決済手段", "定期課金対応"],
      cons: ["審査期間", "初期費用"],
    },

    // 2. 次点：Square + コンビニ決済
    squareKonbini: {
      priority: 2,
      timeline: "1-2週間",
      setup: {
        step1: "Square申込み（比較的審査緩い）",
        step2: "コンビニ決済API統合",
        step3: "プリペイド方式実装",
        step4: "テスト運用",
        step5: "本番開始",
      },
      features: ["クレジットカード", "コンビニ決済"],
      fees: "3.25%",
      pros: ["審査が比較的緩い", "実装が簡単"],
      cons: ["定期課金なし", "機能制限"],
    },

    // 3. 代替案：PayPal
    paypal: {
      priority: 3,
      timeline: "1週間",
      setup: {
        step1: "PayPalビジネスアカウント作成",
        step2: "API統合",
        step3: "テスト決済",
        step4: "本番運用",
      },
      features: ["クレジットカード", "PayPal残高"],
      fees: "3.6% + 40円",
      pros: ["審査が緩い", "グローバル対応"],
      cons: ["手数料高め", "日本での普及率"],
    },
  },

  // 課金モデル（推奨）
  recommendedPricingModel: {
    structure: "3段階プラン",
    plans: {
      free: {
        price: 0,
        features: ["基本姓名判断（1日5回）", "簡易運勢表示"],
        purpose: "ユーザー獲得・体験",
      },
      basic: {
        price: 220, // 税込
        features: ["詳細鑑定無制限", "六星占術年表", "PDF出力（1日3回）"],
        purpose: "日常利用ユーザー",
      },
      premium: {
        price: 440, // 税込
        features: ["全機能無制限", "運気運行表", "優先サポート"],
        purpose: "本格活用ユーザー",
      },
    },
    billing: {
      monthly: "基本",
      quarterly: "10%OFF",
      annual: "25%OFF",
    },
  },

  // 実装フロー（技術面）
  technicalImplementation: {
    phase1: {
      title: "決済プロバイダ統合",
      tasks: ["GMOペイメントAPI統合", "サブスクリプション管理システム", "Webhook処理実装", "決済状態管理"],
      duration: "2週間",
    },
    phase2: {
      title: "ユーザー管理システム",
      tasks: ["プラン管理機能", "使用制限システム", "アップグレード誘導", "解約・変更処理"],
      duration: "1週間",
    },
    phase3: {
      title: "UI/UX改善",
      tasks: ["料金ページ最適化", "プラン比較表", "決済フロー改善", "ユーザーダッシュボード"],
      duration: "1週間",
    },
  },

  // 収益予測
  revenueProjection: {
    conservative: {
      users: { basic: 100, premium: 30 },
      monthly: 220 * 100 + 440 * 30, // 35,200円
      yearly: 35200 * 12, // 422,400円
    },
    realistic: {
      users: { basic: 300, premium: 100 },
      monthly: 220 * 300 + 440 * 100, // 110,000円
      yearly: 110000 * 12, // 1,320,000円
    },
    optimistic: {
      users: { basic: 500, premium: 200 },
      monthly: 220 * 500 + 440 * 200, // 198,000円
      yearly: 198000 * 12, // 2,376,000円
    },
  },

  // 法的準備
  legalPreparation: {
    required: [
      "特定商取引法に基づく表記（完成済み）",
      "利用規約（完成済み）",
      "プライバシーポリシー（完成済み）",
      "返金ポリシー（完成済み）",
    ],
    status: "準備完了",
  },

  // 次のアクション
  nextActions: {
    immediate: ["GMOペイメントゲートウェイ申込み", "必要書類準備（法人登記簿等）", "審査用サイト準備"],
    parallel: ["Square申込み（バックアップ）", "PayPal統合準備", "ユーザーテスト実施"],
  },
}

// 決済フロー図
export const paymentFlowDiagram = {
  userJourney: {
    step1: "無料プランで体験",
    step2: "制限に達する",
    step3: "アップグレード提案",
    step4: "プラン選択",
    step5: "決済処理",
    step6: "機能解放",
    step7: "継続利用",
  },

  technicalFlow: {
    frontend: "プラン選択 → 決済フォーム → 確認画面",
    backend: "決済API → Webhook → DB更新 → 機能解放",
    monitoring: "決済状況監視 → エラー処理 → ユーザー通知",
  },
}
