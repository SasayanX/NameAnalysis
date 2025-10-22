import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { VerticalNameDisplay } from "@/components/vertical-name-display"

interface CompanyNameResultProps {
  result: any
  companyName: string
  useCustomData?: boolean
}

export function CompanyNameResult({ result, companyName, useCustomData = false }: CompanyNameResultProps) {
  console.log("Company result object:", result)

  const getBadgeVariant = (fortune: string) => {
    if (!fortune) return "secondary"
    if (fortune.includes("大吉")) return "destructive" // 赤色
    if (fortune.includes("中吉")) return "dark-pink" // 濃いピンク
    if (fortune.includes("吉")) return "light-pink" // 薄いピンク
    if (fortune.includes("凶") && !fortune.includes("大凶") && !fortune.includes("中凶")) return "white" // 白
    if (fortune.includes("中凶")) return "gray" // グレー
    if (fortune.includes("大凶")) return "dark-gray" // 濃いグレー
    return "outline"
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{companyName}の会社名分析結果</h2>
        {useCustomData && <p className="text-sm text-muted-foreground mt-1">(カスタム吉凶データを使用)</p>}
      </div>
      
      {/* 縦書き表示を追加 */}
      <div className="flex justify-center mb-6">
        <VerticalNameDisplay name={companyName} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>「{companyName}」の画数占い結果</CardTitle>
          <CardDescription>
            社名・商品名の総格による鑑定結果 当占いは、全て旧字体での鑑定となっております。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-4xl font-bold mb-2">
              {(() => {
                const count = result?.companyNameCount || result?.totalStrokes || "0"
                // [object Object]が含まれている場合は数値部分だけを抽出
                if (typeof count === "string" && count.includes("[object Object]")) {
                  const match = count.match(/^(\d+)/)
                  return match ? match[1] : "0"
                }
                return count
              })()}
            </div>
            {result?.fortune && typeof result.fortune === "string" && result.fortune !== "[object Object]" && (
              <Badge
                className={`text-lg px-3 py-1 
    ${getBadgeVariant(result.fortune) === "destructive" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
    ${getBadgeVariant(result.fortune) === "dark-pink" ? "bg-pink-700 hover:bg-pink-800 text-white" : ""}
    ${getBadgeVariant(result.fortune) === "light-pink" ? "bg-pink-200 hover:bg-pink-300 text-pink-800" : ""}
    ${getBadgeVariant(result.fortune) === "white" ? "bg-white hover:bg-gray-50 text-gray-800 border border-gray-300" : ""}
    ${getBadgeVariant(result.fortune) === "gray" ? "bg-gray-400 hover:bg-gray-500 text-white" : ""}
    ${getBadgeVariant(result.fortune) === "dark-gray" ? "bg-gray-700 hover:bg-gray-800 text-white" : ""}
  `}
                variant={getBadgeVariant(result.fortune)}
              >
                {result.fortune}
              </Badge>
            )}
          </div>

          {result?.totalScore !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">運勢スコア</span>
                <span className="font-bold">{result.totalScore}点</span>
              </div>
              <Progress value={Math.min(100, (result.totalScore / 100) * 100)} className="h-2" />
            </div>
          )}

          {result?.explanation && (
            <div className="space-y-2">
              <h3 className="font-medium">総格の意味</h3>
              <p className="text-sm">
                {typeof result?.explanation === "string" && result.explanation !== "[object Object]"
                  ? result.explanation
                  : "この画数の詳細な説明はありません。"}
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <h3 className="font-medium mb-2">ビジネスアドバイス</h3>
            <p className="text-sm">
              {(() => {
                const advice = result?.advice || "ビジネスでの成功を祈願しています。"
                if (typeof advice === "string") {
                  // [object Object]を除去
                  return advice
                    .replace(/\[object Object\]/g, "")
                    .replace(/\s+/g, " ")
                    .trim()
                }
                return "ビジネスでの成功を祈願しています。"
              })()}
            </p>
          </div>

          {result?.kanjiInfo?.hasChanged && (
            <div className="mt-4 pt-4 border-t">
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  <p className="text-sm font-medium">入力された名前には新字体が含まれています。旧字体で占いました。</p>
                  {result.kanjiInfo.oldLastName && <p className="text-sm">旧字体: {result.kanjiInfo.oldLastName}</p>}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
