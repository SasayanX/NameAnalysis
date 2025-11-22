"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RareCardWithActions from '@/components/RareCardWithActions'
import { Download, Loader2 } from 'lucide-react'

// ランク別の称号
const rankTitles: Record<string, string> = {
  SSS: '天下無双',
  SS: '無敵',
  S: '最強',
  'A+': '一流',
  A: '優秀',
  'B+': '良好',
  B: '普通',
  C: '平凡',
  D: '苦労',
}

// ランク別のデフォルトポイント
const rankDefaultPoints: Record<string, number> = {
  SSS: 480,
  SS: 420,
  S: 360,
  'A+': 320,
  A: 280,
  'B+': 220,
  B: 180,
  C: 130,
  D: 80,
}

// ランク別のデフォルトパワーレベル
const rankDefaultPowerLevel: Record<string, number> = {
  SSS: 10,
  SS: 9,
  S: 8,
  'A+': 7,
  A: 6,
  'B+': 5,
  B: 4,
  C: 3,
  D: 2,
}

export default function TestRareCardPage() {
  const [lastName, setLastName] = useState('大谷')
  const [firstName, setFirstName] = useState('翔平')
  const [rank, setRank] = useState<'SSS' | 'SS' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'>('SSS')
  const [totalPoints, setTotalPoints] = useState(480)
  const [powerLevel, setPowerLevel] = useState(10)
  const [baseImagePath, setBaseImagePath] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generatedImageBlob, setGeneratedImageBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ランクが変更されたら、デフォルト値を更新
  useEffect(() => {
    setTotalPoints(rankDefaultPoints[rank] || 0)
    setPowerLevel(rankDefaultPowerLevel[rank] || 1)
    // ベース画像パスを自動設定
    setBaseImagePath(`/images/rare-cards/card_base_${rank}_v1.png`)
  }, [rank])

  // API経由で画像を生成
  const handleGenerateImage = async () => {
    setIsGenerating(true)
    setError(null)
    setGeneratedImageUrl(null)
    setGeneratedImageBlob(null)

    try {
      const params = new URLSearchParams({
        lastName,
        firstName,
        rank,
        totalPoints: totalPoints.toString(),
        powerLevel: powerLevel.toString(),
      })
      
      if (baseImagePath) {
        params.append('baseImagePath', baseImagePath)
      }

      const response = await fetch(`/api/rare-card/generate?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      setGeneratedImageUrl(imageUrl)
      setGeneratedImageBlob(blob)
    } catch (err: any) {
      console.error('画像生成エラー:', err)
      setError(err.message || '画像の生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  // 生成された画像をダウンロード
  const handleDownloadGenerated = () => {
    if (!generatedImageBlob) return
    
    try {
      const url = URL.createObjectURL(generatedImageBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `card_${lastName}_${firstName}_${rank}_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // Blob URLをクリーンアップ
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch (err: any) {
      console.error('ダウンロードエラー:', err)
      alert('画像のダウンロードに失敗しました')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>レアカード画像生成テスト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lastName">姓</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="大谷"
              />
            </div>
            <div>
              <Label htmlFor="firstName">名</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="翔平"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="rank">ランク</Label>
            <Select value={rank} onValueChange={(value: any) => setRank(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SSS">SSS - 天下無双</SelectItem>
                <SelectItem value="SS">SS - 無敵</SelectItem>
                <SelectItem value="S">S - 最強</SelectItem>
                <SelectItem value="A+">A+ - 一流</SelectItem>
                <SelectItem value="A">A - 優秀</SelectItem>
                <SelectItem value="B+">B+ - 良好</SelectItem>
                <SelectItem value="B">B - 普通</SelectItem>
                <SelectItem value="C">C - 平凡</SelectItem>
                <SelectItem value="D">D - 苦労</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalPoints">総合ポイント</Label>
              <Input
                id="totalPoints"
                type="number"
                value={totalPoints}
                onChange={(e) => setTotalPoints(parseInt(e.target.value, 10))}
                min="0"
                max="1000"
              />
            </div>
            <div>
              <Label htmlFor="powerLevel">パワーレベル</Label>
              <Input
                id="powerLevel"
                type="number"
                value={powerLevel}
                onChange={(e) => setPowerLevel(parseInt(e.target.value, 10))}
                min="1"
                max="10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="baseImagePath">ベース画像パス（自動設定）</Label>
            <Input
              id="baseImagePath"
              value={baseImagePath}
              onChange={(e) => setBaseImagePath(e.target.value)}
              placeholder="/images/rare-cards/card_base_SSS_v1.png"
            />
            <p className="text-xs text-gray-500 mt-1">
              ランクに応じて自動設定されます。手動で変更も可能です。
            </p>
          </div>

          {/* API経由で画像生成 */}
          <div className="mt-6 pt-4 border-t">
            <Label>API経由で画像生成（サーバーサイド）</Label>
            <div className="mt-2 space-y-2">
              <Button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  '画像を生成（API経由）'
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {generatedImageUrl && (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-300">
                    <img
                      src={generatedImageUrl}
                      alt={`${lastName}${firstName}の${rank}ランクカード`}
                      className="w-full h-auto"
                    />
                  </div>
                  <Button
                    onClick={handleDownloadGenerated}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    生成された画像をダウンロード
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* クライアントサイドプレビュー */}
          <div className="mt-6 pt-4 border-t">
            <Label>クライアントサイドプレビュー（SVG）</Label>
            <div className="mt-4">
              <RareCardWithActions
                lastName={lastName}
                firstName={firstName}
                rank={rank}
                title={rankTitles[rank]}
                score={totalPoints}
                powerLevel={powerLevel}
                baseSrc={baseImagePath || undefined}
                width={1024}
                height={1536}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

