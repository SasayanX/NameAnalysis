// インデックス促進のための戦略

export const indexingStrategy = {
  // 優先的にインデックスしてもらいたいページ
  priorityPages: [
    {
      url: "/",
      reason: "ホームページ - 最重要",
      keywords: ["姓名判断", "無料", "占い"],
    },
    {
      url: "/name-analyzer",
      reason: "メイン機能ページ",
      keywords: ["姓名判断", "画数計算", "旧字体"],
    },
    {
      url: "/articles/kyujitai-seimeihandan",
      reason: "SEO記事 - 専門性アピール",
      keywords: ["旧字体", "姓名判断", "正確性"],
    },
    {
      url: "/articles/gogyo-five-elements",
      reason: "SEO記事 - 関連知識",
      keywords: ["五行", "陰陽五行", "相性"],
    },
  ],

  // 外部からの言及を促進する方法
  mentionStrategy: [
    "SNSでの定期的な投稿",
    "占い関連コミュニティでの情報提供",
    "ブログやYouTubeでの紹介依頼",
    "プレスリリースの配信",
  ],

  // コンテンツ更新頻度
  updateFrequency: {
    homepage: "毎日",
    articles: "週1-2回",
    fortunePages: "週1回",
    newContent: "月2-3記事",
  },
}

// 検索エンジンへの信号強化
export const searchEngineSignals = {
  // ユーザーエンゲージメント向上
  engagement: [
    "滞在時間の延長（詳細な結果表示）",
    "ページビュー数の増加（関連ページへの誘導）",
    "リピート訪問の促進（毎日の運勢機能）",
    "ソーシャルシェアの促進",
  ],

  // 技術的な信号
  technical: [
    "ページ読み込み速度の最適化",
    "モバイルフレンドリー対応",
    "HTTPS化（既に対応済み）",
    "構造化データの実装（実装済み）",
  ],

  // コンテンツの質の向上
  contentQuality: [
    "専門性の高い記事作成",
    "ユーザーの検索意図に合致したコンテンツ",
    "定期的なコンテンツ更新",
    "内部リンクの最適化",
  ],
}
