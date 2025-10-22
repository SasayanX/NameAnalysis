"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, XCircle, Baby, Search, Download } from "lucide-react"
import { strokeCountData } from "@/lib/name-data-simple"

// 実際の赤ちゃん名付けで使用される包括的な漢字リスト
const COMPREHENSIVE_BABY_NAMES = {
  // 2024年人気男性名前
  popular_male_2024: [
    "蓮",
    "碧",
    "陽翔",
    "湊",
    "蒼",
    "樹",
    "大翔",
    "悠真",
    "結翔",
    "律",
    "陽向",
    "颯",
    "翔",
    "大和",
    "陸",
    "悠",
    "朝陽",
    "奏",
    "廉",
    "凛",
    "翼",
    "海翔",
    "結人",
    "陽太",
    "悠斗",
    "大翔",
    "陽",
    "湊斗",
    "颯太",
    "蒼空",
    "陽斗",
    "結翔",
    "悠人",
    "陽翔",
    "大樹",
    "海斗",
    "陽向",
    "翔太",
    "蒼真",
    "陽大",
    "結斗",
  ],

  // 2024年人気女性名前
  popular_female_2024: [
    "紬",
    "翠",
    "凛",
    "陽葵",
    "芽依",
    "葵",
    "心陽",
    "陽菜",
    "美咲",
    "桜",
    "結愛",
    "莉子",
    "心春",
    "陽花",
    "美月",
    "花音",
    "心音",
    "結月",
    "陽奈",
    "美桜",
    "心結",
    "花",
    "愛",
    "結",
    "心",
    "陽",
    "美",
    "花音",
    "心花",
    "結花",
    "陽音",
    "美花",
    "心愛",
    "結愛",
    "陽愛",
    "美愛",
    "花愛",
    "心菜",
    "結菜",
    "陽菜",
  ],

  // 伝統的な男性名前
  traditional_male: [
    "太郎",
    "一郎",
    "次郎",
    "三郎",
    "四郎",
    "五郎",
    "六郎",
    "七郎",
    "八郎",
    "九郎",
    "十郎",
    "正",
    "誠",
    "実",
    "真",
    "清",
    "明",
    "光",
    "勇",
    "強",
    "健",
    "剛",
    "武",
    "雄",
    "男",
    "孝",
    "忠",
    "信",
    "義",
    "仁",
    "礼",
    "智",
    "勇",
    "進",
    "昇",
    "栄",
    "豊",
    "富",
    "貴",
    "秀",
    "優",
    "良",
    "善",
    "正",
    "直",
    "純",
    "潔",
    "和",
    "平",
    "安",
    "康",
    "幸",
    "福",
  ],

  // 伝統的な女性名前
  traditional_female: [
    "花子",
    "美子",
    "恵子",
    "幸子",
    "和子",
    "洋子",
    "京子",
    "良子",
    "春子",
    "夏子",
    "秋子",
    "冬子",
    "愛子",
    "恵子",
    "美子",
    "幸子",
    "和子",
    "洋子",
    "京子",
    "良子",
    "春子",
    "夏子",
    "秋子",
    "冬子",
    "梅",
    "桜",
    "菊",
    "蘭",
    "椿",
    "牡丹",
    "芍薬",
    "百合",
    "薔薇",
    "菫",
    "桔梗",
    "朝顔",
    "美",
    "愛",
    "恵",
    "幸",
    "和",
    "洋",
    "京",
    "良",
    "春",
    "夏",
    "秋",
    "冬",
    "雪",
    "月",
  ],

  // 現代的な創作名前
  modern_creative: [
    "心愛",
    "結愛",
    "陽愛",
    "美愛",
    "花愛",
    "桜愛",
    "月愛",
    "星愛",
    "空愛",
    "海愛",
    "風愛",
    "光愛",
    "心結",
    "結心",
    "陽結",
    "美結",
    "花結",
    "桜結",
    "月結",
    "星結",
    "空結",
    "海結",
    "風結",
    "光結",
    "心花",
    "結花",
    "陽花",
    "美花",
    "花花",
    "桜花",
    "月花",
    "星花",
    "空花",
    "海花",
    "風花",
    "光花",
    "心音",
    "結音",
    "陽音",
    "美音",
    "花音",
    "桜音",
    "月音",
    "星音",
    "空音",
    "海音",
    "風音",
    "光音",
  ],

  // 季節・自然系
  nature_seasonal: [
    "春",
    "夏",
    "秋",
    "冬",
    "雪",
    "月",
    "星",
    "空",
    "海",
    "山",
    "川",
    "森",
    "林",
    "木",
    "花",
    "草",
    "風",
    "雲",
    "雨",
    "虹",
    "光",
    "陽",
    "陰",
    "朝",
    "夕",
    "夜",
    "昼",
    "暁",
    "黎",
    "曙",
    "暮",
    "桜",
    "梅",
    "菊",
    "蘭",
    "椿",
    "牡丹",
    "芍薬",
    "百合",
    "薔薇",
    "菫",
    "桔梗",
    "朝顔",
    "向日葵",
    "松",
    "竹",
    "梅",
    "桃",
    "李",
    "杏",
    "柿",
    "栗",
    "柚",
    "橘",
    "橙",
    "柑",
    "蜜",
    "柑",
    "葡萄",
  ],

  // 色彩系
  colors: [
    "赤",
    "青",
    "黄",
    "緑",
    "紫",
    "白",
    "黒",
    "灰",
    "茶",
    "金",
    "銀",
    "銅",
    "鉄",
    "鋼",
    "鉛",
    "錫",
    "紅",
    "朱",
    "丹",
    "緋",
    "茜",
    "橙",
    "黄",
    "金",
    "山吹",
    "若草",
    "緑",
    "翠",
    "碧",
    "青",
    "藍",
    "紺",
    "紫",
    "菫",
    "桔梗",
    "白",
    "雪",
    "銀",
    "灰",
    "鼠",
    "黒",
    "墨",
    "漆",
    "茶",
    "褐",
    "栗",
  ],

  // 宝石・貴金属系
  gems_metals: [
    "金",
    "銀",
    "銅",
    "鉄",
    "鋼",
    "鉛",
    "錫",
    "亜鉛",
    "真鍮",
    "青銅",
    "白金",
    "プラチナ",
    "ダイヤ",
    "ルビー",
    "サファイア",
    "エメラルド",
    "トパーズ",
    "アメジスト",
    "ガーネット",
    "珠",
    "玉",
    "宝",
    "貴",
    "宝石",
    "真珠",
    "珊瑚",
    "琥珀",
    "水晶",
    "瑪瑙",
    "翡翠",
    "碧玉",
  ],

  // 動物系
  animals: [
    "龍",
    "虎",
    "鳳",
    "鶴",
    "亀",
    "鹿",
    "馬",
    "牛",
    "羊",
    "猪",
    "犬",
    "猫",
    "兎",
    "鼠",
    "猿",
    "鳥",
    "鷹",
    "鷲",
    "隼",
    "燕",
    "雀",
    "鳩",
    "烏",
    "鶏",
    "鴨",
    "白鳥",
    "孔雀",
    "鸚鵡",
    "魚",
    "鯉",
    "鮭",
    "鯛",
    "鰤",
    "鮪",
    "鰻",
    "鯖",
    "鰯",
    "鰆",
    "鱸",
    "鮎",
    "鱒",
    "鰈",
  ],

  // 抽象概念系
  abstract: [
    "愛",
    "恋",
    "情",
    "心",
    "魂",
    "精",
    "神",
    "意",
    "志",
    "願",
    "望",
    "夢",
    "希",
    "理",
    "想",
    "信",
    "頼",
    "任",
    "責",
    "務",
    "役",
    "位",
    "格",
    "級",
    "段",
    "階",
    "層",
    "次",
    "順",
    "番",
    "和",
    "平",
    "安",
    "康",
    "健",
    "幸",
    "福",
    "喜",
    "楽",
    "悦",
    "歓",
    "慶",
    "祝",
    "賀",
    "寿",
  ],
}

// 全ての漢字を統合
const ALL_CHARACTERS = new Set<string>()

// 各カテゴリから文字を抽出
Object.values(COMPREHENSIVE_BABY_NAMES).forEach((category) => {
  category.forEach((name) => {
    Array.from(name).forEach((char) => {
      ALL_CHARACTERS.add(char)
    })
  })
})

// 追加の人気漢字（単体）
const ADDITIONAL_POPULAR_CHARS = [
  // 人気の漢字（男性）
  "翔",
  "大",
  "太",
  "陽",
  "海",
  "空",
  "天",
  "地",
  "山",
  "川",
  "森",
  "林",
  "木",
  "火",
  "水",
  "土",
  "金",
  "銀",
  "鉄",
  "石",
  "玉",
  "珠",
  "宝",
  "貴",
  "富",
  "豊",
  "栄",
  "昌",
  "盛",
  "隆",
  "繁",
  "茂",
  "勇",
  "強",
  "剛",
  "武",
  "雄",
  "男",
  "士",
  "侍",
  "将",
  "帥",
  "王",
  "皇",
  "帝",
  "君",
  "公",
  "侯",

  // 人気の漢字（女性）
  "美",
  "麗",
  "華",
  "花",
  "桜",
  "梅",
  "菊",
  "蘭",
  "椿",
  "薔",
  "薇",
  "百",
  "合",
  "菫",
  "桔",
  "梗",
  "愛",
  "恋",
  "情",
  "心",
  "魂",
  "精",
  "神",
  "優",
  "雅",
  "典",
  "淑",
  "賢",
  "智",
  "慧",
  "聡",
  "明",
  "清",
  "純",
  "潔",
  "白",
  "雪",
  "氷",
  "霜",
  "露",
  "雫",
  "滴",
  "泉",
  "湖",
  "池",
  "沼",
  "海",
  "波",

  // 現代人気漢字
  "結",
  "絆",
  "繋",
  "連",
  "結",
  "合",
  "和",
  "協",
  "同",
  "共",
  "友",
  "仲",
  "親",
  "愛",
  "慈",
  "恵",
  "希",
  "望",
  "願",
  "夢",
  "理",
  "想",
  "志",
  "意",
  "念",
  "思",
  "考",
  "想",
  "創",
  "造",
  "作",
  "製",

  // 自然・季節
  "春",
  "夏",
  "秋",
  "冬",
  "雪",
  "霜",
  "氷",
  "雨",
  "雲",
  "風",
  "嵐",
  "雷",
  "電",
  "光",
  "影",
  "陰",
  "朝",
  "昼",
  "夕",
  "夜",
  "暁",
  "黎",
  "曙",
  "暮",
  "宵",
  "深",
  "遅",
  "早",
  "速",
  "急",
  "緩",
  "遅",
]

ADDITIONAL_POPULAR_CHARS.forEach((char) => {
  ALL_CHARACTERS.add(char)
})

const TOTAL_CHARACTERS = Array.from(ALL_CHARACTERS)

interface CharacterValidation {
  character: string
  actualStroke?: number
  isRegistered: boolean
  usageCount: number
  categories: string[]
}

export function BabyNamingStrokeValidator() {
  const [validationResults, setValidationResults] = useState<{
    characters: CharacterValidation[]
    summary: {
      totalCharacters: number
      registeredCharacters: number
      unregisteredCharacters: number
      registrationRate: number
    }
    unregisteredList: string[]
    categoryStats: Record<string, { total: number; registered: number; rate: number }>
  } | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateCharacters = () => {
    setIsValidating(true)

    setTimeout(() => {
      const characterValidations: CharacterValidation[] = []
      const unregisteredList: string[] = []
      const categoryStats: Record<string, { total: number; registered: number; rate: number }> = {}

      // 各カテゴリの統計を初期化
      Object.keys(COMPREHENSIVE_BABY_NAMES).forEach((category) => {
        categoryStats[category] = { total: 0, registered: 0, rate: 0 }
      })

      // 各文字の使用回数とカテゴリを計算
      const characterUsage: Record<string, { count: number; categories: Set<string> }> = {}

      Object.entries(COMPREHENSIVE_BABY_NAMES).forEach(([categoryName, names]) => {
        const categoryChars = new Set<string>()

        names.forEach((name) => {
          Array.from(name).forEach((char) => {
            categoryChars.add(char)

            if (!characterUsage[char]) {
              characterUsage[char] = { count: 0, categories: new Set() }
            }
            characterUsage[char].count++
            characterUsage[char].categories.add(categoryName)
          })
        })

        categoryStats[categoryName].total = categoryChars.size
      })

      // 各文字を検証
      TOTAL_CHARACTERS.forEach((char) => {
        const actualStroke = strokeCountData[char]
        const isRegistered = actualStroke !== undefined
        const usage = characterUsage[char] || { count: 1, categories: new Set(["additional"]) }

        if (!isRegistered) {
          unregisteredList.push(char)
        }

        // カテゴリ統計を更新
        usage.categories.forEach((category) => {
          if (categoryStats[category] && isRegistered) {
            categoryStats[category].registered++
          }
        })

        characterValidations.push({
          character: char,
          actualStroke: actualStroke,
          isRegistered: isRegistered,
          usageCount: usage.count,
          categories: Array.from(usage.categories),
        })
      })

      // カテゴリ統計の率を計算
      Object.keys(categoryStats).forEach((category) => {
        const stats = categoryStats[category]
        stats.rate = stats.total > 0 ? Math.round((stats.registered / stats.total) * 100) : 0
      })

      const summary = {
        totalCharacters: TOTAL_CHARACTERS.length,
        registeredCharacters: TOTAL_CHARACTERS.length - unregisteredList.length,
        unregisteredCharacters: unregisteredList.length,
        registrationRate: Math.round(
          ((TOTAL_CHARACTERS.length - unregisteredList.length) / TOTAL_CHARACTERS.length) * 100,
        ),
      }

      setValidationResults({
        characters: characterValidations.sort((a, b) => b.usageCount - a.usageCount),
        summary,
        unregisteredList,
        categoryStats,
      })
      setIsValidating(false)
    }, 1500)
  }

  const exportUnregisteredList = () => {
    if (!validationResults) return

    const csvContent = validationResults.unregisteredList.map((char) => `"${char}",10`).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "unregistered_characters.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    validateCharacters()
  }, [])

  if (!validationResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            包括的漢字画数データ検証
          </CardTitle>
          <CardDescription>赤ちゃん名付けで使用される{TOTAL_CHARACTERS.length}個の漢字を検証中...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Search className="animate-spin h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const { characters, summary, unregisteredList, categoryStats } = validationResults

  return (
    <div className="space-y-6">
      {/* メイン統計 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            包括的漢字画数データ検証結果
          </CardTitle>
          <CardDescription>赤ちゃん名付けで使用される{summary.totalCharacters}個の漢字を包括的に検証</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
            <div>
              <div className="text-3xl font-bold text-blue-600">{summary.totalCharacters}</div>
              <div className="text-sm text-muted-foreground">総文字数</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{summary.registeredCharacters}</div>
              <div className="text-sm text-muted-foreground">登録済み</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">{summary.unregisteredCharacters}</div>
              <div className="text-sm text-muted-foreground">未登録</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{summary.registrationRate}%</div>
              <div className="text-sm text-muted-foreground">登録率</div>
            </div>
          </div>

          {summary.unregisteredCharacters > 0 && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>🚨 深刻な問題が発見されました！</strong>
                <br />
                <strong>
                  {summary.unregisteredCharacters}個の漢字（{100 - summary.registrationRate}%）
                </strong>
                が画数データに登録されていません。
                <br />
                <strong>これは赤ちゃん名付けツールの信頼性に重大な影響を与えています。</strong>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* カテゴリ別統計 */}
      <Card>
        <CardHeader>
          <CardTitle>カテゴリ別登録状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{category.replace(/_/g, " ")}</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.registered}/{stats.total} 文字
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold">{stats.rate}%</div>
                  <Badge variant={stats.rate === 100 ? "default" : stats.rate >= 90 ? "secondary" : "destructive"}>
                    {stats.rate === 100 ? "完璧" : stats.rate >= 90 ? "良好" : "要修正"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 未登録文字リスト */}
      {unregisteredList.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center justify-between">
              🚨 緊急修正が必要な漢字一覧 ({unregisteredList.length}個)
              <Button onClick={exportUnregisteredList} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                CSVエクスポート
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 md:grid-cols-15 gap-2 mb-4">
              {unregisteredList.slice(0, 120).map((char, index) => (
                <div key={index} className="text-center p-2 bg-red-50 border border-red-200 rounded">
                  <div className="text-lg font-bold text-red-700">{char}</div>
                </div>
              ))}
            </div>
            {unregisteredList.length > 120 && (
              <div className="text-center text-muted-foreground">...他 {unregisteredList.length - 120} 個</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 使用頻度順文字リスト */}
      <Card>
        <CardHeader>
          <CardTitle>使用頻度順文字リスト（上位50個）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 max-h-96 overflow-y-auto">
            {characters.slice(0, 50).map((char, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">{char.character}</span>
                  <span className="text-sm text-muted-foreground">使用回数: {char.usageCount}</span>
                  <span className="text-xs text-muted-foreground">{char.categories.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  {char.isRegistered ? (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {char.actualStroke}画
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      未登録
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={validateCharacters} disabled={isValidating}>
          {isValidating ? "検証中..." : "再検証"}
        </Button>
      </div>
    </div>
  )
}
