"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, RefreshCw, CheckSquare, Square } from 'lucide-react'

interface BlogArticle {
  id: string
  slug: string
  title: string
  lastName: string
  firstName: string
  publishedAt: string
  url: string
}

export default function BlogArticlesAdminPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // 記事一覧を取得
  const fetchArticles = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch('/api/blog-articles/list')
      const data = await response.json()
      if (data.success) {
        setArticles(data.articles || [])
      } else {
        setMessage({ type: 'error', text: data.error || '記事の取得に失敗しました' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '記事の取得に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  // 個別チェックボックスの切り替え
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // 全選択/全解除
  const toggleSelectAll = () => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(articles.map(a => a.id)))
    }
  }

  // 選択した記事を削除
  const deleteSelected = async () => {
    if (selectedIds.size === 0) {
      setMessage({ type: 'error', text: '削除する記事を選択してください' })
      return
    }

    if (!confirm(`選択した${selectedIds.size}件の記事を削除しますか？`)) {
      return
    }

    setDeleting(true)
    setMessage(null)

    try {
      // 選択した記事を1件ずつ削除
      const deleteResults = await Promise.allSettled(
        Array.from(selectedIds).map(async (id) => {
          const response = await fetch(`/api/blog-articles/delete?id=${id}`, {
            method: 'DELETE',
          })
          const data = await response.json()
          if (!data.success) {
            throw new Error(data.error || '削除に失敗しました')
          }
          return { id, success: true }
        })
      )

      const successCount = deleteResults.filter(r => r.status === 'fulfilled').length
      const failedCount = deleteResults.filter(r => r.status === 'rejected').length

      if (failedCount > 0) {
        const errors = deleteResults
          .filter(r => r.status === 'rejected')
          .map(r => r.status === 'rejected' ? r.reason.message : '')
          .join(', ')
        setMessage({ 
          type: failedCount === selectedIds.size ? 'error' : 'error', 
          text: `${successCount}件削除成功、${failedCount}件失敗: ${errors}` 
        })
      } else {
        setMessage({ type: 'success', text: `${successCount}件の記事を削除しました` })
        setSelectedIds(new Set())
      }
      
      await fetchArticles() // 一覧を再取得
    } catch (error: any) {
      console.error('削除エラー:', error)
      setMessage({ type: 'error', text: error.message || '削除に失敗しました' })
    } finally {
      setDeleting(false)
    }
  }

  // すべての記事を削除
  const deleteAll = async () => {
    if (articles.length === 0) {
      setMessage({ type: 'error', text: '削除する記事がありません' })
      return
    }

    if (!confirm(`すべての記事（${articles.length}件）を削除しますか？この操作は取り消せません。`)) {
      return
    }

    setDeleting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/blog-articles/delete-all', {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: `すべての記事（${data.deletedCount}件）を削除しました` })
        setSelectedIds(new Set())
        await fetchArticles() // 一覧を再取得
      } else {
        setMessage({ type: 'error', text: data.error || '削除に失敗しました' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '削除に失敗しました' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">ブログ記事管理</h1>
        <p className="text-muted-foreground">
          生成されたブログ記事を管理・削除できます
        </p>
      </div>

      {message && (
        <Alert className={`mb-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-4 flex gap-2">
        <Button
          onClick={fetchArticles}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          一覧を更新
        </Button>
        <Button
          onClick={toggleSelectAll}
          disabled={loading || articles.length === 0}
          variant="outline"
        >
          {selectedIds.size === articles.length && articles.length > 0 ? (
            <>
              <Square className="mr-2 h-4 w-4" />
              すべて解除
            </>
          ) : (
            <>
              <CheckSquare className="mr-2 h-4 w-4" />
              すべて選択
            </>
          )}
        </Button>
        <Button
          onClick={deleteSelected}
          disabled={deleting || selectedIds.size === 0}
          variant="destructive"
        >
          <Trash2 className={`mr-2 h-4 w-4 ${deleting ? 'animate-spin' : ''}`} />
          選択した記事を削除 ({selectedIds.size})
        </Button>
        <Button
          onClick={deleteAll}
          disabled={deleting || articles.length === 0}
          variant="destructive"
          className="ml-auto"
        >
          <Trash2 className={`mr-2 h-4 w-4 ${deleting ? 'animate-spin' : ''}`} />
          すべて削除 ({articles.length}件)
        </Button>
      </div>

      {loading && articles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">読み込み中...</p>
          </CardContent>
        </Card>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">記事がありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <Card 
              key={article.id} 
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                selectedIds.has(article.id) 
                  ? 'bg-blue-50 border-blue-300 border-2 ring-2 ring-blue-200' 
                  : 'border border-gray-200'
              }`}
            >
              <CardContent className="p-0">
                {/* 縦書き画像 */}
                <div className="bg-gradient-to-br from-amber-50 to-blue-50 p-6 flex items-center justify-center min-h-[200px] border-b border-gray-200">
                  <img
                    src={`/api/blog-articles/image?id=${article.id}`}
                    alt={`${article.lastName}${article.firstName}さんの縦書き名前`}
                    className="h-48 w-auto object-contain drop-shadow-lg"
                    loading="lazy"
                    onError={(e) => {
                      // 画像読み込みエラー時のフォールバック
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
                
                {/* 記事情報 */}
                <div className="p-4 space-y-3">
                  {/* チェックボックスとタイトル */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedIds.has(article.id)}
                      onCheckedChange={() => toggleSelection(article.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base leading-tight mb-1 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {article.lastName} {article.firstName}さん
                      </p>
                    </div>
                  </div>

                  {/* メタ情報 */}
                  <div className="space-y-1 text-xs text-gray-500 border-t pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">公開日</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">スラッグ</span>
                      <span className="truncate ml-2 max-w-[120px]" title={article.slug}>
                        {article.slug}
                      </span>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      onClick={() => {
                        window.open(article.url, '_blank')
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      記事を表示
                    </Button>
                    <Button
                      onClick={() => {
                        const newSelected = new Set([article.id])
                        setSelectedIds(newSelected)
                        deleteSelected()
                      }}
                      disabled={deleting}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

