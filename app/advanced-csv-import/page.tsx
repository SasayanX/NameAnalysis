import { AdvancedCsvImporter } from "@/components/advanced-csv-importer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, Lightbulb } from "lucide-react"

export default function AdvancedCsvImportPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">高度なCSV画数データインポート</h1>
        <p className="text-muted-foreground">
          複数のCSVファイルからデータをインポートし、競合を解決して統合データを生成
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>新機能:</strong> 複数のCSVファイルを段階的にインポートし、 データの競合を自動検出・解決できます。
          </AlertDescription>
        </Alert>

        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>推奨ワークフロー:</strong> 基本データ → 人気名前 → 特殊文字の順で インポートすると効率的です。
          </AlertDescription>
        </Alert>
      </div>

      <AdvancedCsvImporter />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>機能一覧</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>✅ 複数CSVファイルの段階的インポート</div>
            <div>✅ データ競合の自動検出</div>
            <div>✅ 競合解決の手動選択</div>
            <div>✅ インポート履歴の管理</div>
            <div>✅ 統合データの一括エクスポート</div>
            <div>✅ セッション単位でのデータ管理</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使用例</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>セッション1:</strong> 基本漢字データ (1000件)
            </div>
            <div>
              <strong>セッション2:</strong> 2024年人気名前 (200件)
            </div>
            <div>
              <strong>セッション3:</strong> 旧字体データ (150件)
            </div>
            <div>
              <strong>競合解決:</strong> 新字体 vs 旧字体の画数
            </div>
            <div>
              <strong>最終出力:</strong> 統合された1350件のデータ
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
