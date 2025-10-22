import { CsvStrokeImporter } from "@/components/csv-stroke-importer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function CsvImportPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">CSV画数データインポート</h1>
        <p className="text-muted-foreground">不足している漢字の画数データをCSVファイルから一括インポートできます</p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>重要:</strong> インポート後は必ずアプリケーションを再起動してデータを反映させてください。
          また、バックアップとして現在のデータをエクスポートしておくことをお勧めします。
        </AlertDescription>
      </Alert>

      <CsvStrokeImporter />

      <Card>
        <CardHeader>
          <CardTitle>CSVファイルの形式例</CardTitle>
          <CardDescription>以下の形式でCSVファイルを作成してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">形式1: 漢字,画数</h3>
              <pre className="bg-muted p-3 rounded text-sm">
                {`漢字,画数
愛,13
心,4
翔,12
陽,12
結,12`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">形式2: 画数,漢字</h3>
              <pre className="bg-muted p-3 rounded text-sm">
                {`画数,漢字
13,愛
4,心
12,翔
12,陽
12,結`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
