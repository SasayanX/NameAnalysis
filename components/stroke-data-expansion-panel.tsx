"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { runStrokeDataExpansion, type DataExpansionResult } from '@/lib/stroke-data-expansion'
import { Bot, Database, CheckCircle, AlertCircle, Loader2, Rocket, Mail } from 'lucide-react'

export function StrokeDataExpansionPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<DataExpansionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAutopilotRunning, setIsAutopilotRunning] = useState(false)
  const [autopilotResult, setAutopilotResult] = useState<any>(null)

  const handleRunExpansion = async () => {
    setIsRunning(true)
    setError(null)
    setResult(null)

    try {
      const expansionResult = await runStrokeDataExpansion()
      setResult(expansionResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
    } finally {
      setIsRunning(false)
    }
  }

  const handleRunAutopilot = async () => {
    console.log('🚀 オートパイロット実行開始')
    setIsAutopilotRunning(true)
    setError(null)
    setAutopilotResult(null)

    try {
      console.log('📡 API呼び出し中...')
      const response = await fetch('/api/autopilot/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📡 API応答受信:', response.status)
      const result = await response.json()
      console.log('📡 API結果:', result)
      
      if (result.success) {
        setAutopilotResult(result)
        console.log('✅ オートパイロット実行成功')
      } else {
        setError(result.error || 'オートパイロット実行に失敗しました')
        console.error('❌ オートパイロット実行失敗:', result.error)
      }
    } catch (err) {
      console.error('❌ オートパイロット実行エラー:', err)
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
    } finally {
      setIsAutopilotRunning(false)
      console.log('🏁 オートパイロット実行完了')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            自動画数データ拡充システム
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              人名データを自動処理して、不足している漢字の画数データを抽出・追加します。
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleRunExpansion}
                disabled={isRunning || isAutopilotRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    処理中...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    画数データ拡充を実行
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleRunAutopilot}
                disabled={isRunning || isAutopilotRunning}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAutopilotRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    オートパイロット実行中...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    オートパイロット実行（拡充+共有+メール）
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">エラーが発生しました</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {autopilotResult && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Rocket className="h-5 w-5" />
              オートパイロット実行結果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {autopilotResult.expansion.processedNames}
                  </div>
                  <div className="text-sm text-gray-600">処理姓名数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {autopilotResult.expansion.addedKanji}
                  </div>
                  <div className="text-sm text-gray-600">追加漢字数</div>
                </div>
              </div>
              
              {autopilotResult.sharing.sharedName && (
                <div className="space-y-2">
                  {/* X投稿状態 */}
                  <div className={`text-center p-3 rounded-lg ${
                    autopilotResult.sharing.twitter?.sent 
                      ? 'bg-blue-100' 
                      : autopilotResult.sharing.twitter?.error
                      ? 'bg-red-100'
                      : 'bg-gray-100'
                  }`}>
                    {autopilotResult.sharing.twitter?.sent ? (
                      <>
                        <div className="font-semibold text-blue-700">
                          ✅ X投稿成功
                        </div>
                        <div className="text-sm text-blue-600">
                          {autopilotResult.sharing.sharedName}さんの結果をXに投稿しました
                        </div>
                        {autopilotResult.sharing.twitter.tweetId && (
                          <div className="text-xs text-blue-500 mt-1">
                            Tweet ID: {autopilotResult.sharing.twitter.tweetId}
                          </div>
                        )}
                      </>
                    ) : autopilotResult.sharing.twitter?.error ? (
                      <>
                        <div className="font-semibold text-red-700">
                          ❌ X投稿失敗
                        </div>
                        <div className="text-sm text-red-600">
                          {autopilotResult.sharing.sharedName}さんの結果のX投稿に失敗しました
                        </div>
                        <div className="text-xs text-red-500 mt-1">
                          エラー: {autopilotResult.sharing.twitter.error}
                        </div>
                        <div className="text-xs text-red-400 mt-2">
                          💡 Twitter API認証情報（TWITTER_BEARER_TOKEN）を設定してください
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-gray-700">
                          ⏸️ X投稿スキップ
                        </div>
                        <div className="text-sm text-gray-600">
                          X投稿は実行されませんでした
                        </div>
                      </>
                    )}
                  </div>

                  {/* メール送信状態 */}
                  <div className={`text-center p-3 rounded-lg ${
                    autopilotResult.sharing.email?.sent 
                      ? 'bg-green-100' 
                      : autopilotResult.sharing.email?.error
                      ? 'bg-yellow-100'
                      : 'bg-gray-100'
                  }`}>
                    {autopilotResult.sharing.email?.sent ? (
                      <>
                        <Mail className="h-5 w-5 mx-auto text-green-600 mb-2" />
                        <div className="font-semibold text-green-700">
                          📧 メール通知送信完了
                        </div>
                        <div className="text-sm text-green-600">
                          {autopilotResult.sharing.sharedName}さんの結果を送信しました
                        </div>
                      </>
                    ) : autopilotResult.sharing.email?.error ? (
                      <>
                        <Mail className="h-5 w-5 mx-auto text-yellow-600 mb-2" />
                        <div className="font-semibold text-yellow-700">
                          ⚠️ メール通知送信失敗（オートパイロットは成功）
                        </div>
                        <div className="text-sm text-yellow-600">
                          {autopilotResult.sharing.sharedName}さんの結果は処理されましたが、メール送信は失敗しました
                        </div>
                        <div className="text-xs text-yellow-500 mt-1">
                          エラー: {autopilotResult.sharing.email.error}
                        </div>
                      </>
                    ) : (
                      <>
                        <Mail className="h-5 w-5 mx-auto text-gray-600 mb-2" />
                        <div className="font-semibold text-gray-700">
                          ⏸️ メール送信スキップ
                        </div>
                        <div className="text-sm text-gray-600">
                          メール送信は実行されませんでした
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 text-center">
                実行時間: {new Date(autopilotResult.timestamp).toLocaleString('ja-JP')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          {/* 処理結果サマリー */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                画数データ拡充結果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.processedNames}
                  </div>
                  <div className="text-sm text-gray-600">処理姓名数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {result.missingKanji.length}
                  </div>
                  <div className="text-sm text-gray-600">不足漢字</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {result.addedKanji.length}
                  </div>
                  <div className="text-sm text-gray-600">追加漢字</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {result.errors.length}
                  </div>
                  <div className="text-sm text-gray-600">エラー数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 不足漢字一覧 */}
          {result.missingKanji.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>検出された不足漢字</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.missingKanji
                    .sort((a, b) => (b.frequency * b.confidence) - (a.frequency * a.confidence))
                    .map((kanji, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold">{kanji.character}</div>
                          <div>
                            <div className="font-semibold">{kanji.suggestedStroke}画</div>
                            <div className="text-sm text-gray-600">
                              頻度: {kanji.frequency}回
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            信頼度: {(kanji.confidence * 100).toFixed(1)}%
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            ソース: {kanji.sources.join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 追加された漢字 */}
          {result.addedKanji.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>追加された漢字</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.addedKanji.map((character, index) => (
                    <Badge key={index} variant="outline" className="text-lg px-3 py-1">
                      {character}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* エラー一覧 */}
          {result.errors.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">エラー一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 p-2 bg-red-50 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
