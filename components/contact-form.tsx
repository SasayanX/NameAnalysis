"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MessageSquare } from "lucide-react"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // クライアント側バリデーション
    if (!formData.category) {
      setError('お問い合わせ種別を選択してください')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      // レスポンスがJSONでない場合の処理
      let result
      try {
        result = await response.json()
      } catch (jsonError) {
        const text = await response.text()
        console.error('お問い合わせAPI: JSON解析エラー', { status: response.status, text })
        throw new Error(`サーバーエラーが発生しました（ステータス: ${response.status}）。しばらく時間をおいて再度お試しください。`)
      }

      if (!response.ok || !result.success) {
        const errorMessage = result.error || result.message || 'お問い合わせの送信に失敗しました'
        console.error('お問い合わせAPI: エラーレスポンス', { status: response.status, result })
        throw new Error(errorMessage)
      }

      setSubmitted(true)
      // フォームをリセット
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        message: '',
      })
    } catch (error: any) {
      console.error('お問い合わせ送信エラー:', error)
      
      // ネットワークエラーの場合
      if (error.message?.includes('fetch') || error.message?.includes('Network')) {
        setError('ネットワークエラーが発生しました。インターネット接続を確認して、しばらく時間をおいて再度お試しください。')
      } 
      // タイムアウトエラーの場合
      else if (error.message?.includes('timeout') || error.name === 'AbortError') {
        setError('リクエストがタイムアウトしました。しばらく時間をおいて再度お試しください。')
      }
      // その他のエラー
      else {
        setError(error.message || 'お問い合わせの送信に失敗しました。しばらく時間をおいて再度お試しください。')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">お問い合わせありがとうございます</h3>
          <p className="text-gray-600 mb-4">お問い合わせを受け付けました。3営業日以内にご返信いたします。</p>
          <Button onClick={() => setSubmitted(false)} variant="outline">
            新しいお問い合わせ
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 連絡先情報 */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">メール</h3>
            <p className="text-sm text-gray-600">kanaukiryu@gmail.com</p>
            <p className="text-xs text-gray-500 mt-1">24時間受付</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">電話</h3>
            <p className="text-sm text-gray-600">090-6483-3637</p>
            <p className="text-xs text-gray-500 mt-1">平日 10:00-18:00</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">お問い合わせフォーム</h3>
            <p className="text-sm text-gray-600">下記フォームから</p>
            <p className="text-xs text-gray-500 mt-1">3営業日以内に返信</p>
          </CardContent>
        </Card>
      </div>

      {/* お問い合わせフォーム */}
      <Card>
        <CardHeader>
          <CardTitle>お問い合わせフォーム</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">お名前 *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="山田太郎"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">メールアドレス *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">電話番号</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="090-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">お問い合わせ種別 *</label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="お問い合わせの種別を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">一般的なお問い合わせ</SelectItem>
                  <SelectItem value="technical">技術的な問題</SelectItem>
                  <SelectItem value="billing">料金・課金について</SelectItem>
                  <SelectItem value="refund">返金・解約について</SelectItem>
                  <SelectItem value="feature">機能追加の要望</SelectItem>
                  <SelectItem value="bug">バグ報告</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">件名 *</label>
              <Input
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="お問い合わせの件名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">お問い合わせ内容 *</label>
              <Textarea
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="お問い合わせの詳細をご記入ください"
                rows={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">個人情報の取り扱いについて</h4>
              <p className="text-sm text-gray-600">
                お預かりした個人情報は、お問い合わせへの回答のみに使用し、
                適切に管理いたします。第三者への提供は行いません。
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : "お問い合わせを送信"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
