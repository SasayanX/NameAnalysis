import { CsvImportExplanation } from "@/components/csv-import-explanation"

export default function CsvImportExplanationPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">CSVインポートの仕組み</h1>
        <p className="text-muted-foreground">複数回のインポートがどのように処理されるかを詳しく解説</p>
      </div>

      <CsvImportExplanation />
    </div>
  )
}
