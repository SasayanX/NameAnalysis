"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { GogyoResult } from "@/lib/advanced-gogyo"

interface AdvancedFiveElementsChartProps {
  gogyoResult: GogyoResult
  isPremium?: boolean
  isPro?: boolean
}

export function AdvancedFiveElementsChart({
  gogyoResult,
  isPremium = false,
  isPro = false,
}: AdvancedFiveElementsChartProps) {
  const [activeTab, setActiveTab] = useState("balance")
  // 明示的に会員タイプを管理する状態
  const [membershipType, setMembershipType] = useState<"none" | "pro" | "premium">("none")

  // コンポーネントがマウントされたときに会員タイプを設定
  useEffect(() => {
    if (isPremium === true) {
      setMembershipType("premium")
    } else if (isPro === true) {
      setMembershipType("pro")
    } else {
      setMembershipType("none")
    }
  }, [isPremium, isPro])

  // Add safety checks at the top of the component
  if (!gogyoResult || !gogyoResult.elements) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p>五行データを読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 各要素の最大値を計算
  const maxCount = Math.max(
    gogyoResult.elements.wood,
    gogyoResult.elements.fire,
    gogyoResult.elements.earth,
    gogyoResult.elements.metal,
    gogyoResult.elements.water,
  )

  // 各要素のパーセンテージを計算
  const totalCount =
    gogyoResult.elements.wood +
    gogyoResult.elements.fire +
    gogyoResult.elements.earth +
    gogyoResult.elements.metal +
    gogyoResult.elements.water

  const woodPercent = Math.round((gogyoResult.elements.wood / totalCount) * 100)
  const firePercent = Math.round((gogyoResult.elements.fire / totalCount) * 100)
  const earthPercent = Math.round((gogyoResult.elements.earth / totalCount) * 100)
  const metalPercent = Math.round((gogyoResult.elements.metal / totalCount) * 100)
  const waterPercent = Math.round((gogyoResult.elements.water / totalCount) * 100)

  // Add these safety checks before using the arrays
  const birthStars = gogyoResult.birthStars || []
  const nameStars = gogyoResult.nameStars || []

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>陰陽五行分析</CardTitle>
            <CardDescription>あなたの名前と生年月日から導き出される五行のバランス</CardDescription>
          </div>
          <Badge
            className={`
            ${gogyoResult.dominantElement === "木" ? "bg-green-100 text-green-800" : ""}
            ${gogyoResult.dominantElement === "火" ? "bg-red-100 text-red-800" : ""}
            ${gogyoResult.dominantElement === "土" ? "bg-amber-100 text-amber-800" : ""}
            ${gogyoResult.dominantElement === "金" ? "bg-yellow-100 text-yellow-800" : ""}
            ${gogyoResult.dominantElement === "水" ? "bg-blue-100 text-blue-800" : ""}
          `}
          >
            {gogyoResult.dominantElement}が優勢（{gogyoResult.yinYang}）
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="balance" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="balance">五行バランス</TabsTrigger>
            <TabsTrigger value="stars">導き出された星</TabsTrigger>
          </TabsList>

          <TabsContent value="balance" className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">木 ({gogyoResult.elements.wood})</span>
                </div>
                <span className="text-sm">{woodPercent}%</span>
              </div>
              <Progress
                value={(gogyoResult.elements.wood / maxCount) * 100}
                className="h-2 bg-gray-100 dark:bg-gray-700"
                indicatorClassName="bg-green-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">火 ({gogyoResult.elements.fire})</span>
                </div>
                <span className="text-sm">{firePercent}%</span>
              </div>
              <Progress
                value={(gogyoResult.elements.fire / maxCount) * 100}
                className="h-2 bg-gray-100 dark:bg-gray-700"
                indicatorClassName="bg-red-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="font-medium">土 ({gogyoResult.elements.earth})</span>
                </div>
                <span className="text-sm">{earthPercent}%</span>
              </div>
              <Progress
                value={(gogyoResult.elements.earth / maxCount) * 100}
                className="h-2 bg-gray-100 dark:bg-gray-700"
                indicatorClassName="bg-amber-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">金 ({gogyoResult.elements.metal})</span>
                </div>
                <span className="text-sm">{metalPercent}%</span>
              </div>
              <Progress
                value={(gogyoResult.elements.metal / maxCount) * 100}
                className="h-2 bg-gray-100 dark:bg-gray-700"
                indicatorClassName="bg-yellow-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">水 ({gogyoResult.elements.water})</span>
                </div>
                <span className="text-sm">{waterPercent}%</span>
              </div>
              <Progress
                value={(gogyoResult.elements.water / maxCount) * 100}
                className="h-2 bg-gray-100 dark:bg-gray-700"
                indicatorClassName="bg-blue-500"
              />
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-2">
              <h4 className="font-medium mb-2">五行バランス分析</h4>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                あなたは{gogyoResult.dominantElement}の気が強く、
                {gogyoResult.dominantElement === "木" &&
                  "成長力と発展力に恵まれています。明るく活発で、何事にも意欲的に取り組むことができます。"}
                {gogyoResult.dominantElement === "火" &&
                  "情熱的でエネルギッシュな性質を持っています。美的感覚に優れ、芸術的な才能に恵まれています。"}
                {gogyoResult.dominantElement === "土" &&
                  "穏やかで落ち着いており、誰からも信頼される性質を持っています。思慮深く、辛抱強いので、大きなことを成し遂げることができます。"}
                {gogyoResult.dominantElement === "金" &&
                  "冷静で知的、美的センスに優れ、人を惹きつける魅力があります。社交上手で、人とのコミュニケーションを大切にします。"}
                {gogyoResult.dominantElement === "水" &&
                  "知性的でクール、物事を深く考えることを好みます。感受性が強く、芸術的な才能に恵まれています。"}
                一方で{gogyoResult.weakElement}の気が弱いため、
                {gogyoResult.weakElement === "木" &&
                  "成長力や発展力が不足しがちです。新しいことに挑戦する意欲を高めることが大切です。"}
                {gogyoResult.weakElement === "火" &&
                  "情熱や活力が不足しがちです。自分の感情を表現することを意識すると良いでしょう。"}
                {gogyoResult.weakElement === "土" &&
                  "安定感や忍耐力が不足しがちです。物事を地道に続ける習慣を身につけると良いでしょう。"}
                {gogyoResult.weakElement === "金" &&
                  "冷静さや判断力が不足しがちです。物事を論理的に考える訓練をすると良いでしょう。"}
                {gogyoResult.weakElement === "水" &&
                  "柔軟性や適応力が不足しがちです。新しい知識を吸収する習慣をつけると良いでしょう。"}
              </p>
            </div>

            {/* プレミアム会員向けの詳細アドバイス - プレミアム会員のみ表示 */}
            {membershipType === "premium" && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">
                  {gogyoResult.weakElement}の気を高めるアドバイス
                </h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-3">
                  {gogyoResult.weakElement === "木" &&
                    "木の気は成長、発展、創造性を象徴します。以下の方法で木の気を高めることができます。"}
                  {gogyoResult.weakElement === "火" &&
                    "火の気は情熱、活力、喜びを象徴します。以下の方法で火の気を高めることができます。"}
                  {gogyoResult.weakElement === "土" &&
                    "土の気は安定、調和、思いやりを象徴します。以下の方法で土の気を高めることができます。"}
                  {gogyoResult.weakElement === "金" &&
                    "金の気は明晰さ、精度、決断力を象徴します。以下の方法で金の気を高めることができます。"}
                  {gogyoResult.weakElement === "水" &&
                    "水の気は知恵、柔軟性、内省を象徴します。以下の方法で水の気を高めることができます。"}
                </p>

                <div className="space-y-3">
                  {/* 木のアドバイス */}
                  {gogyoResult.weakElement === "木" && (
                    <>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">食事</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          緑色の野菜（ほうれん草、ブロッコリー、青菜）、酸味のある食品（レモン、酢、ヨーグルト）、新鮮な果物、発酵食品を積極的に摂取しましょう。
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">活動</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          ウォーキング、ジョギング、ストレッチ、ヨガなどの柔軟性を高める運動が効果的です。特に朝の時間帯に行うと良いでしょう。
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">環境</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          東側の空間を整え、観葉植物を置き、緑色や青色を取り入れた空間づくりをしましょう。自然光を多く取り入れることも大切です。
                        </p>
                      </div>
                    </>
                  )}

                  {/* 火のアドバイス */}
                  {gogyoResult.weakElement === "火" && (
                    <>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">食事</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          赤色の食品（トマト、赤唐辛子、赤身肉）、スパイシーな食品、温かい食事、ビタミンが豊富な食品を摂取しましょう。
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">活動</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          有酸素運動、ダンス、太陽の下での活動、社交的な活動が効果的です。特に昼間の活動が火の気を高めます。
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">環境</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          南側の空間を整え、明るい照明や赤色・オレンジ色を取り入れた空間づくりをしましょう。キャンドルや温かみのある照明も効果的です。
                        </p>
                      </div>
                    </>
                  )}

                  {/* 土のアドバイス */}
                  {gogyoResult.weakElement === "土" && (
                    <>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">食事</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          黄色や茶色の食品（かぼちゃ、さつまいも、穀物）、根菜類、甘味のある食品、バランスの取れた食事を心がけましょう。
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">活動</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          ガーデニング、料理、瞑想、太極拳などの穏やかな活動が効果的です。規則正しい生活リズムを保つことも大切です。
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">環境</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          中央や南西の空間を整え、黄色や茶色、アースカラーを取り入れた空間づくりをしましょう。整理整頓された環境も土の気を高めます。
                        </p>
                      </div>
                    </>
                  )}

                  {/* 金のアドバイス */}
                  {gogyoResult.weakElement === "金" && (
                    <>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">食事</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          白色の食品（白米、白身魚、豆腐）、辛味のある食品（生姜、わさび）、ミネラル豊富な食品、乾燥食品を摂取しましょう。
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">活動</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          筋力トレーニング、武道、呼吸法、整理整頓などの活動が効果的です。特に夕方から夜にかけての活動が金の気を高めます。
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">環境</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          西側の空間を整え、白色やメタリックカラーを取り入れた空間づくりをしましょう。シンプルで洗練された環境も金の気を高めます。
                        </p>
                      </div>
                    </>
                  )}

                  {/* 水のアドバイス */}
                  {gogyoResult.weakElement === "水" && (
                    <>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">食事</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          黒や濃紺色の食品（黒豆、海藻、ブルーベリー）、塩味のある食品、水分豊富な食品、魚介類を摂取しましょう。
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">活動</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          水泳、入浴、瞑想、ゆったりとした散歩などの活動が効果的です。特に夜間や早朝の活動が水の気を高めます。
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">環境</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          北側の空間を整え、青色や黒色を取り入れた空間づくりをしましょう。水のある環境（水槽、噴水など）も効果的です。
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-800">
                  <h5 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">季節に合わせたアドバイス</h5>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    {gogyoResult.weakElement === "木" &&
                      "春は木の気が最も強まる季節です。この時期に木の気を高める活動を特に意識すると効果的です。"}
                    {gogyoResult.weakElement === "火" &&
                      "夏は火の気が最も強まる季節です。この時期に火の気を高める活動を特に意識すると効果的です。"}
                    {gogyoResult.weakElement === "土" &&
                      "季節の変わり目は土の気が強まる時期です。特に立夏、立秋、立冬、立春の前後2週間は土の気を高める活動が効果的です。"}
                    {gogyoResult.weakElement === "金" &&
                      "秋は金の気が最も強まる季節です。この時期に金の気を高める活動を特に意識すると効果的です。"}
                    {gogyoResult.weakElement === "水" &&
                      "冬は水の気が最も強まる季節です。この時期に水の気を高める活動を特に意識すると効果的です。"}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-800">
                  <h5 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">バランス調整の基本原則</h5>
                  <ul className="text-sm space-y-2 list-disc pl-5 text-indigo-700 dark:text-indigo-300">
                    <li>一度に全ての要素を調整しようとせず、まずは最も弱い要素を強化することに集中しましょう。</li>
                    <li>日々の小さな習慣の積み重ねが、長期的な五行バランスの改善につながります。</li>
                    <li>季節の変化に合わせて調整方法を変えることで、より効果的にバランスを整えられます。</li>
                    <li>体調や気分に合わせて柔軟に調整方法を選ぶことも大切です。</li>
                    <li>五行バランスの調整は即効性よりも継続性が重要です。無理なく続けられる方法を選びましょう。</li>
                  </ul>
                </div>
              </div>
            )}

            {/* プロ会員向けの表示（プレミアム会員ではない場合） */}
            {membershipType === "pro" && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">五行バランスの基本</h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-3">
                  五行のバランスを整えることで、心身の調和を保つことができます。あなたは{gogyoResult.dominantElement}
                  の気が強く、{gogyoResult.weakElement}の気が弱い傾向があります。
                </p>

                <div className="mt-3 p-2 bg-amber-50 rounded text-center text-xs text-amber-800">
                  プレミアム会員にアップグレードすると、詳細な五行バランスのアドバイスが表示されます
                </div>
              </div>
            )}

            {/* 非会員向けの表示 */}
            {membershipType === "none" && (
              <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg text-center">
                <p className="text-sm font-medium text-amber-800">
                  会員登録すると、詳細な五行相関分析と健康アドバイスが見られます
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  ベーシック(110円/月)から詳細鑑定が使い放題、プレミアム(550円/月)で全機能解放
                </p>
                <Button variant="default" size="sm" className="mt-2 bg-amber-500 hover:bg-amber-600">
                  会員登録する
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stars">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">生年月日から導き出された星</h4>
                {birthStars.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {birthStars.map((star, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`
                        ${star === "木星" ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800" : ""}
                        ${star === "火星" ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800" : ""}
                        ${star === "土星" ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800" : ""}
                        ${star === "金星" ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800" : ""}
                        ${star === "水星" ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800" : ""}
                      `}
                      >
                        {star}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">生年月日が入力されていません</p>
                )}

                {gogyoResult.nineStar && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      九星: <span className="font-medium">{gogyoResult.nineStar}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">姓名判断から導き出された星</h4>
                <div className="grid grid-cols-1 gap-2">
                  {nameStars.map((star, index) => {
                    const formatName =
                      index === 0
                        ? "天格（姓運）"
                        : index === 1
                          ? "人格（社会運）"
                          : index === 2
                            ? "地格（基礎運）"
                            : index === 3
                              ? "外格（仕事周囲運）"
                              : "総格（一生晩年運）"

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatName}</span>
                        <Badge
                          variant="outline"
                          className={`
                          ${star === "木星" ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800" : ""}
                          ${star === "火星" ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800" : ""}
                          ${star === "土星" ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800" : ""}
                          ${star === "金星" ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800" : ""}
                          ${star === "水星" ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800" : ""}
                        `}
                        >
                          {star}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* プレミアム会員向けの星の性質説明 */}
              {membershipType === "premium" && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                  <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">五行の星の性質</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      <span className="font-medium">木星:</span> 春の星。成長力、発展力があり、明るく活発で正直な性格。
                    </p>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      <span className="font-medium">火星:</span>{" "}
                      夏の星。情熱的でエネルギッシュ、美的感覚に優れ芸術的才能がある。
                    </p>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      <span className="font-medium">土星:</span>{" "}
                      季節の変わり目の星。穏やかで落ち着いており、思慮深く辛抱強い。
                    </p>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      <span className="font-medium">金星:</span> 秋の星。冷静で知的、美的センスに優れ、社交上手。
                    </p>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      <span className="font-medium">水星:</span> 冬の星。知性的でクール、感受性が強く芸術的才能がある。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
