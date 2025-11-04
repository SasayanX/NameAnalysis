"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function TestRareCardPage() {
  const [lastName, setLastName] = useState('大谷')
  const [firstName, setFirstName] = useState('翔平')
  const [rank, setRank] = useState<'SSS' | 'SS' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'>('SSS')
  const [totalPoints, setTotalPoints] = useState(480)
  const [powerLevel, setPowerLevel] = useState(10)
  const [baseImagePath, setBaseImagePath] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setImageUrl(null)

    try {
      const params = new URLSearchParams({
        lastName,
        firstName,
        rank,
        totalPoints: totalPoints.toString(),
        powerLevel: powerLevel.toString(),
      })
      
      // ベース画像パスが指定されている場合は追加
      if (baseImagePath.trim()) {
        params.append('baseImagePath', baseImagePath.trim())
      }

      const url = `/api/rare-card/generate?${params.toString()}`
      setImageUrl(url)
    } catch (error) {
      console.error('画像生成エラー:', error)
      alert('画像生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return

    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `rare-card-${lastName}${firstName}-${rank}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            <Label htmlFor="baseImagePath">ベース画像パス（オプション）</Label>
            <Input
              id="baseImagePath"
              value={baseImagePath}
              onChange={(e) => setBaseImagePath(e.target.value)}
              placeholder="images/rare-cards/base-SSS.png"
            />
            <p className="text-xs text-gray-500 mt-1">
              例: images/rare-cards/base-SSS.png（public/からの相対パス）
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? '生成中...' : 'レアカード生成'}
            </Button>
            {imageUrl && (
              <Button onClick={handleDownload} variant="outline">
                ダウンロード
              </Button>
            )}
          </div>

          {imageUrl && (
            <div className="mt-6">
              <Label>生成されたレアカード</Label>
              <div className="mt-2 border rounded-lg p-4 bg-gray-50">
                <img
                  src={imageUrl}
                  alt={`${lastName}${firstName} - ${rank}`}
                  className="mx-auto max-w-full"
                  style={{ maxHeight: '600px' }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

