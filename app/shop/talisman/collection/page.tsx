"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Crown,
  Star,
  Sparkles,
  Share2,
  PenTool,
  Zap,
  Gift
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TalismanItem {
  id: string
  name: string
  type: string
  effect_type: string
  effect_value: number
  description: string
  obtained_at: string
  is_used: boolean
}

export default function TalismanCollectionPage() {
  const { user: authUser } = useAuth()
  const [collection, setCollection] = useState<TalismanItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const loadCollection = async () => {
      if (!authUser) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/talisman/collection?userId=${authUser.id}`)
        const result = await response.json()

        if (result.success) {
          setCollection(result.collection || [])
        } else {
          setError(result.error || "コレクションの読み込みに失敗しました")
        }
      } catch (err) {
        console.error("コレクション読み込みエラー:", err)
        setError("コレクションの読み込み中にエラーが発生しました")
      } finally {
        setIsLoading(false)
      }
    }

    loadCollection()
  }, [authUser])

  const handleShare = async (talisman: TalismanItem) => {
    if (typeof window === "undefined") return

    const shareText = `あなたも「${talisman.name}」を授かりました✨\n#カナウ護符 #AI姓名判断 #開運アプリ\nhttps://seimei.app/shop/talisman`
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${talisman.name}を授かりました`,
          text: shareText,
          url: "https://seimei.app/shop/talisman",
        })
      } else {
        await navigator.clipboard.writeText(shareText)
        alert("シェアテキストをクリップボードにコピーしました！")
      }
    } catch (error) {
      console.error("Share failed:", error)
    }
  }

  const getRarityStars = (effectValue: number) => {
    const rarity = Math.floor(effectValue / 10)
    return Math.min(rarity, 5)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <Alert>
              <AlertDescription>
                コレクションを表示するにはログインが必要です。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* ヘッダーセクション */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-6 w-6 animate-pulse" />
            <Badge className="bg-white/20 text-white border-white/30">
              あなたのコレクション
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide">
            🐉 お守りコレクション
          </h1>
          <p className="text-lg text-purple-100">
            獲得した護符: {collection.length} 個
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {collection.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Gift className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">まだお守りを持っていません</h3>
            <p className="text-muted-foreground mb-6">
              ポイントを貯めて、お守りショップで護符を購入しましょう
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <a href="/shop/talisman">お守りショップへ</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* コレクション統計 */}
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">所持数</p>
                  <p className="text-2xl font-bold">{collection.length} 個</p>
                </div>
                <Button asChild variant="outline">
                  <a href="/shop/talisman">
                    <Gift className="h-4 w-4 mr-2" />
                    ショップへ
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collection.map((item) => {
            const rarity = getRarityStars(item.effect_value)
            return (
              <Card key={item.id} className="overflow-hidden border-2 border-purple-200 dark:border-purple-800">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{item.name}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-2 border-yellow-300">
                          {Array(rarity).fill(null).map((_, i) => (
                            <Star key={i} className="h-3 w-3 inline fill-current" />
                          ))}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          効果値: {item.effect_value}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {/* 護符画像プレースホルダー */}
                  <div className="relative aspect-square max-w-xs mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-lg border-4 border-purple-400 dark:from-purple-900/30 dark:to-indigo-900/30 dark:border-purple-600 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Crown className="h-16 w-16 mx-auto text-purple-600 dark:text-purple-400 animate-pulse" />
                        <p className="text-sm text-purple-700 dark:text-purple-300">護符イメージ</p>
                      </div>
                    </div>
                  </div>

                  {/* 説明 */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  {/* 獲得日 */}
                  <div className="text-xs text-muted-foreground">
                    獲得日: {new Date(item.obtained_at).toLocaleDateString("ja-JP")}
                  </div>

                  {/* シェアボタン */}
                  <Button
                    onClick={() => handleShare(item)}
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    シェアする
                  </Button>
                </CardContent>
              </Card>
            )
          })}
          </div>
        </>
      )}
    </div>
  )
}

