// サブスク管理UI

export const subscriptionUI = {
  // プラン選択画面
  planSelection: {
    layout: "3カラム比較表",
    emphasis: "プレミアムプランを中央で強調",
    features: ["無料お試し期間（7日間）", "いつでも解約可能", "プラン変更自由", "返金保証（初月のみ）"],
    cta: "今すぐ始める（7日間無料）",
  },

  // サブスク管理画面
  managementDashboard: {
    sections: [
      "現在のプラン・次回課金日",
      "利用状況・制限残量",
      "プラン変更・解約",
      "支払い履歴・領収書",
      "自動更新設定",
    ],
  },

  // 解約防止
  churnPrevention: {
    exitIntent: "解約理由アンケート + 割引オファー",
    pauseOption: "一時停止機能（最大3ヶ月）",
    downgrade: "下位プランへの変更提案",
    winback: "解約後のウィンバックキャンペーン",
  },
}
