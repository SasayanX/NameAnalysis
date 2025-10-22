// 課金機能実装準備チェックリスト

export const monetizationPreparation = {
  // 🚨 最優先：法的・規制対応（必須）
  legalCompliance: {
    priority: "CRITICAL",
    timeline: "実装前に必須",
    items: [
      {
        task: "特定商取引法に基づく表記",
        status: "未対応",
        urgency: "HIGH",
        description: "事業者名、住所、電話番号、責任者名、返品・交換条件等",
        action: "専用ページ作成 + 各決済ページからリンク",
      },
      {
        task: "プライバシーポリシー更新",
        status: "部分対応",
        urgency: "HIGH",
        description: "決済情報の取り扱い、第三者提供について追記",
        action: "決済関連条項を追加",
      },
      {
        task: "利用規約更新",
        status: "部分対応",
        urgency: "HIGH",
        description: "有料プラン、自動更新、解約条件を明記",
        action: "サブスクリプション条項を追加",
      },
      {
        task: "返金・キャンセルポリシー",
        status: "未対応",
        urgency: "HIGH",
        description: "クーリングオフ、中途解約の条件を明確化",
        action: "返金ポリシーページ作成",
      },
    ],
  },

  // 🔧 技術的準備
  technicalPreparation: {
    priority: "HIGH",
    timeline: "法的準備と並行",
    items: [
      {
        task: "決済プロバイダー選定・契約",
        status: "検討中",
        urgency: "HIGH",
        options: [
          "GMOペイメント（占い系に比較的寛容）",
          "Square（審査が比較的緩い）",
          "PayPal（グローバル対応）",
          "コンビニ決済（審査不要）",
        ],
        recommendation: "GMOペイメント + コンビニ決済の併用",
      },
      {
        task: "テスト環境構築",
        status: "未対応",
        urgency: "MEDIUM",
        description: "サンドボックス環境での決済テスト",
        action: "選定した決済プロバイダーのテスト環境設定",
      },
      {
        task: "SSL証明書・セキュリティ強化",
        status: "対応済み",
        urgency: "LOW",
        description: "Vercelで自動対応済み",
      },
      {
        task: "データベース設計",
        status: "部分対応",
        urgency: "MEDIUM",
        description: "サブスクリプション、決済履歴のテーブル設計",
        action: "Supabase or ローカルストレージ拡張",
      },
    ],
  },

  // 💰 ビジネス準備
  businessPreparation: {
    priority: "MEDIUM",
    timeline: "技術準備と並行",
    items: [
      {
        task: "最終価格設定",
        status: "検討中",
        urgency: "MEDIUM",
        currentProposal: "無料/220円/440円（税込）",
        action: "市場調査 + 競合分析で最終決定",
      },
      {
        task: "プラン機能の最終調整",
        status: "ほぼ完了",
        urgency: "LOW",
        description: "既存のプラン比較表を微調整",
      },
      {
        task: "顧客サポート体制",
        status: "未対応",
        urgency: "MEDIUM",
        description: "問い合わせ対応、返金処理の手順書作成",
        action: "サポートページ + FAQ充実",
      },
    ],
  },

  // 📋 実装準備
  implementationPreparation: {
    priority: "MEDIUM",
    timeline: "上記完了後",
    items: [
      {
        task: "決済API統合",
        status: "準備中",
        urgency: "MEDIUM",
        description: "選定したプロバイダーのAPI実装",
      },
      {
        task: "サブスクリプション管理UI",
        status: "部分対応",
        urgency: "MEDIUM",
        description: "既存のプラン選択モーダルを本格実装に変更",
      },
      {
        task: "使用量制限の実装",
        status: "対応済み",
        urgency: "LOW",
        description: "UsageTracker、UsageLimitsで実装済み",
      },
    ],
  },
}

// 今週やるべきこと（最優先）
export const thisWeekTasks = [
  {
    task: "特定商取引法ページ作成",
    timeEstimate: "2-3時間",
    description: "法的に必須。事業者情報を正確に記載",
  },
  {
    task: "決済プロバイダー比較・選定",
    timeEstimate: "4-6時間",
    description: "GMO、Square、PayPalの審査条件・手数料を詳細比較",
  },
  {
    task: "利用規約・プライバシーポリシー更新",
    timeEstimate: "3-4時間",
    description: "サブスクリプション関連条項を追加",
  },
  {
    task: "返金ポリシー策定",
    timeEstimate: "2-3時間",
    description: "明確な返金条件・手続きを定義",
  },
]

// 来週以降のタスク
export const upcomingTasks = [
  {
    week: "来週",
    tasks: ["選定した決済プロバイダーへの申込み・審査", "テスト環境での決済フロー構築", "顧客サポートFAQ作成"],
  },
  {
    week: "再来週",
    tasks: ["本番環境での決済API統合", "サブスクリプション管理機能実装", "決済テスト・品質確認"],
  },
  {
    week: "3週目",
    tasks: ["ベータテスト実施", "最終調整・バグ修正", "課金機能リリース"],
  },
]
