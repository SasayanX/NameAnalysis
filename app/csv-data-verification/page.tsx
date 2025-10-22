import { CsvDataVerification } from "@/components/csv-data-verification"

export default function CsvDataVerificationPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">CSVデータ更新確認</h1>
        <p className="text-muted-foreground">インポートされたデータが正しく反映されているか確認します</p>
      </div>

      <CsvDataVerification />
    </div>
  )
}
