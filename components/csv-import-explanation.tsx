"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { InfoIcon, ArrowDown, FileText, AlertTriangle, CheckCircle } from "lucide-react"

export function CsvImportExplanation() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5" />
            CSVインポートの仕組み
          </CardTitle>
          <CardDescription>複数回のインポートがどのように処理されるかを詳しく説明します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ステップ1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">ステップ1</Badge>
              <h3 className="font-semibold">セッション単位で保存</h3>
            </div>
            <div className="pl-4 space-y-2">
              <p className="text-sm text-muted-foreground">各CSVインポートは「セッション」として個別に保存されます</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">セッション1</div>
                  <div className="text-xs text-muted-foreground">基本漢字.csv</div>
                  <div className="text-xs">1000件</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">セッション2</div>
                  <div className="text-xs text-muted-foreground">人気名前.csv</div>
                  <div className="text-xs">200件</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">セッション3</div>
                  <div className="text-xs text-muted-foreground">特殊文字.csv</div>
                  <div className="text-xs">150件</div>
                </div>
              </div>
            </div>
          </div>

          <ArrowDown className="h-4 w-4 mx-auto text-muted-foreground" />

          {/* ステップ2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">ステップ2</Badge>
              <h3 className="font-semibold">データ統合と競合検出</h3>
            </div>
            <div className="pl-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                全セッションのデータを統合し、同じ文字で異なる画数があれば競合として検出
              </p>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>例：「愛」がセッション1で13画、セッション2で12画 → 競合として検出</AlertDescription>
              </Alert>
            </div>
          </div>

          <ArrowDown className="h-4 w-4 mx-auto text-muted-foreground" />

          {/* ステップ3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">ステップ3</Badge>
              <h3 className="font-semibold">競合解決</h3>
            </div>
            <div className="pl-4 space-y-2">
              <p className="text-sm text-muted-foreground">検出された競合について、どの値を使用するかを選択</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="p-2 border rounded text-center text-xs">
                  <div className="font-medium">現在の値を保持</div>
                  <div className="text-muted-foreground">既存データ優先</div>
                </div>
                <div className="p-2 border rounded text-center text-xs">
                  <div className="font-medium">新しい値を使用</div>
                  <div className="text-muted-foreground">新規データ優先</div>
                </div>
                <div className="p-2 border rounded text-center text-xs">
                  <div className="font-medium">手動で指定</div>
                  <div className="text-muted-foreground">カスタム値</div>
                </div>
              </div>
            </div>
          </div>

          <ArrowDown className="h-4 w-4 mx-auto text-muted-foreground" />

          {/* ステップ4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">ステップ4</Badge>
              <h3 className="font-semibold">統合ファイル生成</h3>
            </div>
            <div className="pl-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                全セッションと競合解決結果を統合した最終的な csv-imported-data.ts を生成
              </p>
              <div className="p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium text-sm">csv-imported-data.ts</span>
                </div>
                <div className="text-xs font-mono">
                  export const csvImportedData = {"{"}
                  <br />
                  &nbsp;&nbsp;"愛": 13, // セッション2の値を採用
                  <br />
                  &nbsp;&nbsp;"心": 4, // セッション1の値
                  <br />
                  &nbsp;&nbsp;"翔": 12, // セッション3の値
                  <br />
                  &nbsp;&nbsp;// ... 1350件の統合データ
                  <br />
                  {"}"}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>重要：</strong> csv-imported-data.ts は毎回<strong>完全に上書き</strong>されます。
              しかし、各セッションのデータは保持されているため、いつでも再統合可能です。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>実際の動作例</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="font-medium">1回目のインポート：</div>
            <div className="text-sm text-muted-foreground pl-4">
              • 基本漢字1000件をインポート
              <br />• csv-imported-data.ts に1000件のデータが生成される
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium">2回目のインポート：</div>
            <div className="text-sm text-muted-foreground pl-4">
              • 人気名前200件をインポート（50件が重複）
              <br />• 50件の競合が検出される
              <br />• 競合解決後、csv-imported-data.ts に1150件のデータが生成される
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium">3回目のインポート：</div>
            <div className="text-sm text-muted-foreground pl-4">
              • 特殊文字150件をインポート（10件が重複）
              <br />• 10件の競合が検出される
              <br />• 競合解決後、csv-imported-data.ts に1290件のデータが生成される
            </div>
          </div>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              各インポートで csv-imported-data.ts は上書きされますが、
              <strong>全セッションのデータが統合された結果</strong>が出力されます。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
