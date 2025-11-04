"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import RareCardWithActions from '@/components/RareCardWithActions'

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

export default function TestRareCardPage() {
  const [lastName, setLastName] = useState('大谷')
  const [firstName, setFirstName] = useState('翔平')
  const [rank, setRank] = useState<'SSS' | 'SS' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'>('SSS')
  const [totalPoints, setTotalPoints] = useState(480)
  const [powerLevel, setPowerLevel] = useState(10)
  const [baseImagePath, setBaseImagePath] = useState<string>('')

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

          <div className="mt-6">
            <Label>レアカードプレビュー</Label>
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

