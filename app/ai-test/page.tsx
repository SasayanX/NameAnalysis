'use client'

import { useState } from 'react'

export default function AITestPage() {
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const testPersonalityAnalysis = async () => {
    if (!lastName || !firstName) {
      setError('姓と名を入力してください')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/ai/analyze-personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastName,
          firstName
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'AI分析に失敗しました')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            AI姓名判断テスト
          </h1>

          <div className="space-y-6">
            {/* 入力フォーム */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 田中"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 太郎"
                />
              </div>
            </div>

            {/* テストボタン */}
            <div className="text-center">
              <button
                onClick={testPersonalityAnalysis}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'AI分析中...' : 'AI深層心理分析を実行'}
              </button>
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* 結果表示 */}
            {result && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    ✅ AI分析成功！
                  </h3>
                  <p className="text-green-700">
                    分析品質: {result.analysisQuality}/100点
                  </p>
                </div>

                {/* 従来の姓名判断結果 */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
                  <h3 className="text-xl font-semibold text-blue-800 mb-4">
                    従来の姓名判断結果
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="font-medium">天格</p>
                      <p className="text-blue-600">{result.traditionalAnalysis.tenFormat}画</p>
                    </div>
                    <div>
                      <p className="font-medium">人格</p>
                      <p className="text-blue-600">{result.traditionalAnalysis.jinFormat}画</p>
                    </div>
                    <div>
                      <p className="font-medium">地格</p>
                      <p className="text-blue-600">{result.traditionalAnalysis.chiFormat}画</p>
                    </div>
                    <div>
                      <p className="font-medium">外格</p>
                      <p className="text-blue-600">{result.traditionalAnalysis.gaiFormat}画</p>
                    </div>
                    <div>
                      <p className="font-medium">総格</p>
                      <p className="text-blue-600">{result.traditionalAnalysis.totalFormat}画</p>
                    </div>
                  </div>
                  <p className="mt-4 text-blue-700">
                    総合スコア: {result.traditionalAnalysis.overallScore}/100
                  </p>
                </div>

                {/* AI分析結果 */}
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-md p-6">
                    <h3 className="text-xl font-semibold text-purple-800 mb-4">
                      🤖 深層心理的特徴
                    </h3>
                    <p className="text-purple-700 whitespace-pre-wrap">
                      {result.aiAnalysis.personality}
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
                    <h3 className="text-xl font-semibold text-yellow-800 mb-4">
                      ✨ 潜在的な才能・適性
                    </h3>
                    <p className="text-yellow-700 whitespace-pre-wrap">
                      {result.aiAnalysis.talents}
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-md p-6">
                    <h3 className="text-xl font-semibold text-orange-800 mb-4">
                      💡 人生における課題と解決策
                    </h3>
                    <p className="text-orange-700 whitespace-pre-wrap">
                      {result.aiAnalysis.challenges}
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-md p-6">
                    <h3 className="text-xl font-semibold text-green-800 mb-4">
                      🎯 具体的なアドバイス
                    </h3>
                    <p className="text-green-700 whitespace-pre-wrap">
                      {result.aiAnalysis.advice}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
