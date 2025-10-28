// メール通知システム（開発用簡易版）
// import nodemailer from 'nodemailer'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface ShareableResult {
  name: string
  result: any
  shareContent: any
  hashtags: string[]
  tweetUrl: string
}

export class EmailNotificationManager {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
    console.log('📧 メール通知マネージャー初期化完了（開発モード）')
  }

  // ハッシュタグ生成
  generateHashtags(result: any, nameData: any): string[] {
    const baseTags = ['#姓名判断', '#占い', '#運勢', '#名前', '#画数', '#旧字体', '#無料占い']
    
    // 運勢別タグ
    const fortuneTags: Record<string, string[]> = {
      '大吉': ['#大吉', '#最高運', '#開運', '#幸運', '#ラッキー'],
      '中吉': ['#中吉', '#良好運', '#安定運', '#順調'],
      '吉': ['#吉', '#平穏運', '#標準運'],
      '凶': ['#凶', '#注意運', '#改善運'],
      '大凶': ['#大凶', '#転換運', '#変化運']
    }
    
    // 性別タグ
    const genderTags = nameData.gender === 'male' 
      ? ['#男性の運勢', '#男の子の名前', '#男性占い']
      : ['#女性の運勢', '#女の子の名前', '#女性占い']
    
    // スコア別タグ
    const scoreTags = result.totalScore >= 80 
      ? ['#高得点', '#優秀な名前', '#素晴らしい運勢']
      : result.totalScore >= 60
      ? ['#標準的', '#安定した名前', '#良好な運勢']
      : ['#改善可能', '#成長運', '#変化運']
    
    // 五格別タグ
    const formatTags = []
    if (result.tenFormat >= 15) formatTags.push('#天格良好')
    if (result.jinFormat >= 15) formatTags.push('#人格良好')
    if (result.chiFormat >= 15) formatTags.push('#地格良好')
    if (result.totalFormat >= 25) formatTags.push('#総格良好')
    
    // 季節・トレンドタグ
    const currentMonth = new Date().getMonth() + 1
    const seasonalTags = []
    if (currentMonth >= 3 && currentMonth <= 5) seasonalTags.push('#春の運勢', '#新学期')
    if (currentMonth >= 6 && currentMonth <= 8) seasonalTags.push('#夏の運勢', '#夏休み')
    if (currentMonth >= 9 && currentMonth <= 11) seasonalTags.push('#秋の運勢', '#秋の運気')
    if (currentMonth === 12 || currentMonth <= 2) seasonalTags.push('#冬の運勢', '#新年運勢')
    
    // 有名人タグ
    const celebrityTags = this.isCelebrity(nameData.name) 
      ? ['#有名人の名前', '#芸能人', '#話題の名前']
      : []
    
    return [
      ...baseTags,
      ...(fortuneTags[result.fortune] || []),
      ...genderTags,
      ...scoreTags,
      ...formatTags,
      ...seasonalTags,
      ...celebrityTags
    ].slice(0, 15) // 最大15個に制限
  }

  // 有名人判定
  private isCelebrity(name: string): boolean {
    const celebrities = [
      '横浜流星', '新垣結衣', '石原さとみ', '菅田将暉', '有村架純',
      '山田孝之', '長澤まさみ', '松本潤', '上野樹里', '小栗旬',
      '佐藤健', '吉沢亮', '福士蒼汰', '山崎賢人', '菅田将暉'
    ]
    return celebrities.includes(name)
  }

  // ツイートURL生成
  generateTweetUrl(content: any, hashtags: string[]): string {
    const text = `${content.title}\n\n${content.description}\n\n${hashtags.join(' ')}\n\n${content.url}\n\n@kanaukiryu`
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
  }

  // メール送信（開発用：コンソール出力のみ）
  async sendShareNotification(shareableResult: ShareableResult): Promise<void> {
    const { name, result, shareContent, hashtags, tweetUrl } = shareableResult
    
    console.log('📧 メール通知（開発モード）')
    console.log('='.repeat(50))
    console.log(`件名: 【自動姓名判断】投稿準備完了 - ${name}さん`)
    console.log('')
    console.log('📊 鑑定結果')
    console.log(`総合スコア: ${result.totalScore}点`)
    console.log(`運勢: ${result.fortune}`)
    console.log(`五格: 天格${result.tenFormat}画, 人格${result.jinFormat}画, 地格${result.chiFormat}画, 外格${result.gaiFormat}画, 総格${result.totalFormat}画`)
    console.log('')
    console.log('📝 投稿内容')
    console.log(`${shareContent.title}`)
    console.log(`${shareContent.description}`)
    console.log('')
    console.log('🏷️ ハッシュタグ')
    console.log(hashtags.join(' '))
    console.log('')
    console.log('🐦 投稿リンク')
    console.log(tweetUrl)
    console.log('='.repeat(50))
    
    console.log(`✅ メール通知完了（開発モード）: ${name}さん`)
  }

  // テスト送信
  async sendTestEmail(): Promise<void> {
    const testResult: ShareableResult = {
      name: '横浜流星',
      result: {
        totalScore: 85,
        fortune: '大吉',
        tenFormat: 18,
        jinFormat: 15,
        chiFormat: 13,
        gaiFormat: 16,
        totalFormat: 31
      },
      shareContent: {
        title: '横浜流星さんの姓名判断結果',
        description: '総合スコア85点の大吉運勢！天格18画、人格15画、地格13画、外格16画、総格31画の素晴らしい名前です。',
        url: 'https://mainichi-ai-name-analysis.vercel.app'
      },
      hashtags: this.generateHashtags({
        totalScore: 85,
        fortune: '大吉',
        tenFormat: 18,
        jinFormat: 15,
        chiFormat: 13,
        gaiFormat: 16,
        totalFormat: 31
      }, { gender: 'male', name: '横浜流星' }),
      tweetUrl: ''
    }
    
    testResult.tweetUrl = this.generateTweetUrl(testResult.shareContent, testResult.hashtags)
    
    await this.sendShareNotification(testResult)
  }
}

// デフォルト設定（Gmail用）
export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'kanaukiryu@gmail.com',
    pass: process.env.EMAIL_PASS || ''
  }
}

// グローバルインスタンス
let emailManager: EmailNotificationManager | null = null

export function getEmailManager(): EmailNotificationManager {
  if (!emailManager) {
    emailManager = new EmailNotificationManager(DEFAULT_EMAIL_CONFIG)
  }
  return emailManager
}

// 簡単な送信関数
export async function sendShareNotification(name: string, result: any, shareContent: any): Promise<void> {
  const manager = getEmailManager()
  const hashtags = manager.generateHashtags(result, { name, gender: 'male' })
  const tweetUrl = manager.generateTweetUrl(shareContent, hashtags)
  
  const shareableResult: ShareableResult = {
    name,
    result,
    shareContent,
    hashtags,
    tweetUrl
  }
  
  await manager.sendShareNotification(shareableResult)
}
