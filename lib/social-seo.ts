// ソーシャルSEO - SNSからの流入でインデックス促進

export const socialSEOStrategy = {
  // Twitter戦略
  twitter: {
    postFrequency: "1日2-3回",
    contentTypes: ["今日の運勢（毎朝）", "姓名判断の豆知識", "ユーザーの質問への回答", "新機能の紹介"],
    hashtags: ["#姓名判断", "#占い", "#運勢", "#名前", "#画数", "#旧字体", "#無料占い", "#今日の運勢"],
  },

  // Instagram戦略
  instagram: {
    postFrequency: "週3-4回",
    contentTypes: ["運勢カードのデザイン", "姓名判断の解説図", "有名人の名前分析", "ユーザー投稿のリポスト"],
  },

  // YouTube戦略
  youtube: {
    videoIdeas: ["姓名判断の基本的なやり方", "旧字体と新字体の違い", "有名人の姓名判断解説", "視聴者の名前鑑定"],
  },

  // ソーシャルシェア促進
  shareOptimization: {
    ogTags: "実装済み",
    twitterCards: "実装済み",
    shareButtons: "各ページに設置",
    incentives: "シェアで詳細結果表示",
  },
}
