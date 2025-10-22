"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldIcon, AlertTriangleIcon } from "lucide-react"
import { DATA_POLICY } from "@/lib/data-policy"

export default function DataPolicyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">データポリシー管理</h1>

      <Alert className="mb-6">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertTitle>重要なお知らせ</AlertTitle>
        <AlertDescription>
          このアプリケーションでは、データの整合性と信頼性を確保するために厳格なデータポリシーを設けています。
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>データポリシー設定</CardTitle>
            <CardDescription>現在のデータポリシー設定状況</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ポリシー</TableHead>
                  <TableHead>状態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>自動生成禁止</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {DATA_POLICY.AUTO_GENERATION_PROHIBITED ? "有効" : "無効"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ウェブスクレイピング禁止</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {DATA_POLICY.WEB_SCRAPING_PROHIBITED ? "有効" : "無効"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ユーザー承認必須</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {DATA_POLICY.USER_APPROVAL_REQUIRED ? "有効" : "無効"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>データソースの種類</CardTitle>
            <CardDescription>システムで認識されるデータソース</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ソース</TableHead>
                  <TableHead>説明</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>ユーザー提供</TableCell>
                  <TableCell>ユーザーが明示的に提供したデータ</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>エディタ編集</TableCell>
                  <TableCell>エディタで編集されたデータ</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>デフォルト</TableCell>
                  <TableCell>システムのデフォルトデータ</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>データポリシーの詳細</CardTitle>
          <CardDescription>アプリケーションのデータ管理ポリシー</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <ShieldIcon className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">1. 画数データや画数吉凶データを勝手に生成しない</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  システムは自動的にデータを生成せず、常に承認されたソースからのデータのみを使用します。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <ShieldIcon className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">2. ウェブから情報をコピーしない</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  ウェブスクレイピングや外部ソースからの自動データ収集は行いません。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <ShieldIcon className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">
                  3. ユーザーの指示またはエディタで編集されたデータのみを元データとして保持する
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  データの変更や追加は、必ずユーザーの明示的な指示または承認を得た上で行います。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
