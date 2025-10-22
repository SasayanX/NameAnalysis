// 実装ロードマップ

export const implementationRoadmap = {
  // Week 1: 申込み・準備
  week1: {
    title: "決済プロバイダ申込み",
    tasks: [
      {
        task: "GMOペイメント申込み",
        owner: "事業者",
        status: "pending",
        priority: "high",
      },
      {
        task: "Square申込み（バックアップ）",
        owner: "事業者",
        status: "pending",
        priority: "medium",
      },
      {
        task: "必要書類準備",
        owner: "事業者",
        status: "pending",
        priority: "high",
      },
      {
        task: "PayPal統合開始",
        owner: "開発者",
        status: "ready",
        priority: "low",
      },
    ],
  },

  // Week 2-3: 審査・開発
  week2_3: {
    title: "審査待ち・並行開発",
    tasks: [
      {
        task: "GMO審査対応",
        owner: "事業者",
        status: "waiting",
        priority: "high",
      },
      {
        task: "決済API統合開発",
        owner: "開発者",
        status: "ready",
        priority: "high",
      },
      {
        task: "サブスクリプション管理実装",
        owner: "開発者",
        status: "ready",
        priority: "high",
      },
      {
        task: "テスト環境構築",
        owner: "開発者",
        status: "ready",
        priority: "medium",
      },
    ],
  },

  // Week 4: テスト・リリース
  week4: {
    title: "テスト・本番リリース",
    tasks: [
      {
        task: "決済テスト実施",
        owner: "開発者",
        status: "ready",
        priority: "high",
      },
      {
        task: "ユーザーテスト",
        owner: "事業者",
        status: "ready",
        priority: "medium",
      },
      {
        task: "本番環境デプロイ",
        owner: "開発者",
        status: "ready",
        priority: "high",
      },
      {
        task: "マネタイズ開始",
        owner: "事業者",
        status: "ready",
        priority: "high",
      },
    ],
  },

  // リスク対策
  riskMitigation: {
    gmo審査落ち: {
      probability: "低",
      impact: "中",
      mitigation: "Square・PayPalで代替",
    },
    技術的問題: {
      probability: "低",
      impact: "中",
      mitigation: "既存コードベース活用",
    },
    ユーザー受容性: {
      probability: "中",
      impact: "高",
      mitigation: "段階的価格設定・無料期間",
    },
  },
}
