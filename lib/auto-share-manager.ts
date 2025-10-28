// 自動SNS共有機能
import { analyzeNameFortune } from './name-data-simple-fixed'
import { generateNameAnalysisShareContent } from '../components/share-buttons'

export interface AutoShareConfig {
  // 共有設定
  platforms: {
    twitter: boolean
    facebook: boolean
    line: boolean
    instagram: boolean
  }
  
  // 共有条件
  conditions: {
    minScore: number        // 最低スコア
    minFortune: string      // 最低運勢（'吉'以上など）
    excludeNames: string[]  // 除外する姓名
    includeCelebrities: boolean // 有名人を含むか
  }
  
  // 共有内容
  content: {
    includeImage: boolean   // 画像を含むか
    includeHashtags: boolean // ハッシュタグを含むか
    customMessage?: string  // カスタムメッセージ
  }
  
  // 実行設定
  execution: {
    enabled: boolean
    maxSharesPerRun: number // 1回の実行で最大何件共有するか
    shareInterval: number   // 共有間隔（秒）
  }
}

export interface ShareableNameResult {
  name: string
  result: any
  shareContent: any
  platform: string
  sharedAt: Date
}

export class AutoShareManager {
  private config: AutoShareConfig
  private sharedResults: ShareableNameResult[] = []
  private sharedNames: Set<string> = new Set() // 重複防止用

  constructor(config: AutoShareConfig) {
    this.config = config
  }

  // 姓名判断結果から共有可能なものを抽出
  async extractShareableResults(nameDataList: any[]): Promise<ShareableNameResult[]> {
    const shareableResults: ShareableNameResult[] = []

    for (const nameData of nameDataList) {
      try {
        // 姓名判断実行
        const result = await analyzeNameFortune({
          lastName: nameData.lastName,
          firstName: nameData.firstName,
          gender: nameData.gender || 'male'
        })

        // 共有条件をチェック
        const fullName = `${nameData.lastName}${nameData.firstName}`
        
        if (this.isShareable(result, nameData) && !this.sharedNames.has(fullName)) {
          // 共有コンテンツ生成
          const shareContent = generateNameAnalysisShareContent(result)
          
          // 1件のみ追加（重複防止）
          const platform = this.getEnabledPlatforms()[0] // 最初のプラットフォームのみ
          shareableResults.push({
            name: fullName,
            result,
            shareContent,
            platform,
            sharedAt: new Date()
          })
          
          // 重複防止用に記録
          this.sharedNames.add(fullName)
        }
      } catch (error) {
        console.error(`姓名判断エラー: ${nameData.lastName} ${nameData.firstName}`, error)
      }
    }

    return shareableResults
  }

  // 共有条件をチェック
  private isShareable(result: any, nameData: any): boolean {
    const { conditions } = this.config

    // スコアチェック
    if (result.totalScore < conditions.minScore) {
      return false
    }

    // 運勢チェック
    if (!this.isFortuneGoodEnough(result.fortune, conditions.minFortune)) {
      return false
    }

    // 除外姓名チェック
    const fullName = `${nameData.lastName}${nameData.firstName}`
    if (conditions.excludeNames.includes(fullName)) {
      return false
    }

    // 有名人チェック（実装例）
    if (!conditions.includeCelebrities && this.isCelebrity(nameData)) {
      return false
    }

    return true
  }

  // 運勢の良さをチェック
  private isFortuneGoodEnough(fortune: string, minFortune: string): boolean {
    const fortuneLevels = ['大凶', '凶', '中凶', '吉', '中吉', '大吉']
    const currentLevel = fortuneLevels.indexOf(fortune)
    const minLevel = fortuneLevels.indexOf(minFortune)
    
    return currentLevel >= minLevel
  }

  // 有名人判定（簡易版）
  private isCelebrity(nameData: any): boolean {
    // 実際の実装では、有名人データベースと照合
    const celebrityNames = [
      '横浜流星', '新垣結衣', '石原さとみ', '菅田将暉', '有村架純',
      '山田孝之', '長澤まさみ', '松本潤', '上野樹里', '小栗旬'
    ]
    
    const fullName = `${nameData.lastName}${nameData.firstName}`
    return celebrityNames.includes(fullName)
  }

  // 有効なプラットフォームを取得
  private getEnabledPlatforms(): string[] {
    const platforms: string[] = []
    
    if (this.config.platforms.twitter) platforms.push('twitter')
    if (this.config.platforms.facebook) platforms.push('facebook')
    if (this.config.platforms.line) platforms.push('line')
    if (this.config.platforms.instagram) platforms.push('instagram')
    
    return platforms
  }

  // 自動共有実行
  async executeAutoShare(shareableResults: ShareableNameResult[]): Promise<void> {
    if (!this.config.execution.enabled) {
      console.log('📱 自動SNS共有は無効です')
      return
    }

    // 1件のみ処理
    if (shareableResults.length === 0) {
      console.log('📱 共有可能な結果がありません')
      return
    }

    const shareResult = shareableResults[0] // 最初の1件のみ
    
    console.log(`📱 自動SNS共有開始: ${shareResult.name}`)

    try {
      await this.shareToPlatform(shareResult)
      this.sharedResults.push(shareResult)
      
      console.log(`✅ 共有完了: ${shareResult.name} → ${shareResult.platform}`)
      
    } catch (error) {
      console.error(`❌ 共有エラー: ${shareResult.name} → ${shareResult.platform}`, error)
    }

    console.log(`📱 自動SNS共有完了: ${shareResult.name}`)
  }

  // プラットフォーム別共有
  private async shareToPlatform(shareResult: ShareableNameResult): Promise<void> {
    const { shareContent, platform } = shareResult
    
    switch (platform) {
      case 'twitter':
        await this.shareToTwitter(shareContent)
        break
      case 'facebook':
        await this.shareToFacebook(shareContent)
        break
      case 'line':
        await this.shareToLine(shareContent)
        break
      case 'instagram':
        await this.shareToInstagram(shareContent)
        break
    }
  }

  // Twitter共有
  private async shareToTwitter(content: any): Promise<void> {
    const text = `${content.title}\n\n${content.description}\n\n${content.hashtags.map((tag: string) => `#${tag}`).join(' ')}\n\n${content.url}\n\n@kanaukiryu`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    
    // 実際の実装では、Twitter APIを使用
    console.log(`🐦 Twitter共有: ${text}`)
  }

  // Facebook共有
  private async shareToFacebook(content: any): Promise<void> {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url)}`
    
    // 実際の実装では、Facebook APIを使用
    console.log(`📘 Facebook共有: ${content.url}`)
  }

  // LINE共有
  private async shareToLine(content: any): Promise<void> {
    const text = `${content.title}\n${content.description}\n${content.url}`
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(content.url)}&text=${encodeURIComponent(text)}`
    
    // 実際の実装では、LINE APIを使用
    console.log(`💬 LINE共有: ${text}`)
  }

  // Instagram共有
  private async shareToInstagram(content: any): Promise<void> {
    const text = `${content.title}\n\n${content.description}\n\n${content.hashtags.map((tag: string) => `#${tag}`).join(' ')}\n\n${content.url}`
    
    // Instagramは直接シェアできないため、テキストを生成
    console.log(`📷 Instagram共有用テキスト: ${text}`)
  }

  // 遅延実行
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 共有履歴取得
  getSharedResults(): ShareableNameResult[] {
    return this.sharedResults
  }

  // 共有統計
  getShareStats(): {
    totalShares: number
    platformStats: Record<string, number>
    recentShares: ShareableNameResult[]
  } {
    const platformStats: Record<string, number> = {}
    
    this.sharedResults.forEach(result => {
      platformStats[result.platform] = (platformStats[result.platform] || 0) + 1
    })

    return {
      totalShares: this.sharedResults.length,
      platformStats,
      recentShares: this.sharedResults.slice(-10) // 最近の10件
    }
  }
}

// デフォルト設定
export const DEFAULT_AUTO_SHARE_CONFIG: AutoShareConfig = {
  platforms: {
    twitter: true,
    facebook: false,
    line: false,
    instagram: false
  },
  
  conditions: {
    minScore: 70,           // 70点以上
    minFortune: '吉',        // 吉以上
    excludeNames: [],       // 除外姓名なし
    includeCelebrities: true // 有名人を含む
  },
  
  content: {
    includeImage: true,
    includeHashtags: true,
    customMessage: '自動姓名判断結果をお知らせします！'
  },
  
  execution: {
    enabled: true,
    maxSharesPerRun: 1,     // 1回で1件のみ
    shareInterval: 0        // 間隔なし
  }
}

// 横浜流星さんの姓名判断例
export async function analyzeYokohamaRyusei(): Promise<any> {
  const result = await analyzeNameFortune({
    lastName: '横浜',
    firstName: '流星',
    gender: 'male'
  })
  
  console.log('🌟 横浜流星さんの姓名判断結果:')
  console.log(`総合スコア: ${result.totalScore}点`)
  console.log(`運勢: ${result.fortune}`)
  console.log(`五格: 天格${result.tenFormat}画, 人格${result.jinFormat}画, 地格${result.chiFormat}画, 外格${result.gaiFormat}画, 総格${result.totalFormat}画`)
  
  return result
}
