// atone連絡待ち期間の準備タスク

export const ATONE_WAITING_TASKS = {
  // 即座に実行可能なタスク
  immediate_tasks: [
    {
      task: "Square開発者アカウント作成",
      description: "atone待ちの間にSquareも並行準備",
      priority: "高",
      estimated_time: "30分",
      url: "https://squareup.com/jp/ja/developers",
    },
    {
      task: "決済フォームUI設計",
      description: "atone + Square両対応の決済選択画面",
      priority: "高",
      estimated_time: "2時間",
    },
    {
      task: "サブスクリプション管理画面設計",
      description: "ユーザーの課金状態管理UI",
      priority: "中",
      estimated_time: "3時間",
    },
  ],

  // atone承認後のタスク
  post_approval_tasks: [
    {
      task: "atone API統合",
      description: "承認後に提供されるAPI情報で実装",
      priority: "最高",
      estimated_time: "4時間",
    },
    {
      task: "テスト決済実行",
      description: "atoneテスト環境での動作確認",
      priority: "最高",
      estimated_time: "2時間",
    },
    {
      task: "本番環境設定",
      description: "実際の決済処理開始",
      priority: "最高",
      estimated_time: "1時間",
    },
  ],

  // 予想されるatoneからの連絡内容
  expected_communication: {
    approval_time: "1-3営業日",
    provided_info: ["加盟店ID", "API キー", "テスト環境URL", "本番環境URL", "実装ドキュメント", "サポート連絡先"],
    next_steps: ["API統合テスト", "決済フロー確認", "本番環境移行", "運用開始"],
  },

  // 並行して進めるSquare準備
  square_parallel_prep: {
    step1: {
      title: "Square開発者アカウント作成",
      action: "https://squareup.com/jp/ja/developers からアカウント作成",
      note: "atone承認と並行して進められる",
    },
    step2: {
      title: "Square審査申請",
      action: "事業者情報を入力して審査申請",
      note: "atone運用開始後でも問題なし",
    },
    step3: {
      title: "Squareサンドボックステスト",
      action: "テスト環境での決済フロー確認",
      note: "実装スキル向上にも役立つ",
    },
  },
}

// atone統合後の収益予測
export const REVENUE_PROJECTION = {
  // コンビニ決済のみの場合（atone）
  konbini_only: {
    target_users: "クレカ未保有・現金派ユーザー",
    market_share: "日本の決済市場の約30%",
    conversion_rate: "3-5%（クレカより低め）",
    monthly_revenue_estimate: {
      conservative: 20000, // 月2万円
      realistic: 50000, // 月5万円
      optimistic: 100000, // 月10万円
    },
    fee_cost: {
      conservative: 1100, // 5.5%
      realistic: 2750,
      optimistic: 5500,
    },
  },

  // atone + Square併用の場合
  dual_payment: {
    target_users: "全ユーザー（決済方法選択可能）",
    market_coverage: "日本の決済市場の約90%",
    conversion_rate: "5-8%（選択肢があることで向上）",
    payment_split_estimate: {
      square_ratio: 0.6, // 60%がクレカ
      atone_ratio: 0.4, // 40%がコンビニ
    },
    monthly_revenue_estimate: {
      conservative: 40000,
      realistic: 80000,
      optimistic: 150000,
    },
    blended_fee_rate: 4.15, // (3.25% * 0.6) + (5.5% * 0.4)
  },
}
