import { StrokeDataDebugger } from "@/components/stroke-data-debugger"
import { QuickStrokeTest } from "@/components/quick-stroke-test"
import { CsvImportEmergencyTester } from "@/components/csv-import-emergency-tester"

export default function DebugStrokeDataPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-red-600">🚨 画数データ緊急修正</h1>

      {/* 緊急修正ツール */}
      <CsvImportEmergencyTester />

      {/* クイックテスト */}
      <QuickStrokeTest />

      {/* 詳細デバッガー */}
      <StrokeDataDebugger />

      {/* 修正状況 */}
      <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="font-bold mb-2 text-red-700">🚨 緊急修正実施済み</h2>
        <ul className="text-sm space-y-1">
          <li>✅ CSVデータに「条」(11画)を追加</li>
          <li>✅ CSVデータに「承」(8画)を追加</li>
          <li>✅ CSVデータに「桑」(10画)を再確認</li>
          <li>✅ CSVデータに「陸」(16画)を再確認</li>
          <li>✅ CSVデータに「也」(3画)を再確認</li>
          <li>✅ CSVデータに「斉」(8画)を再確認</li>
          <li>✅ 緊急修正版データファイルを作成</li>
        </ul>
        <p className="text-xs mt-2 text-red-600 font-medium">
          ページを完全リロード（Ctrl+Shift+R）→ 開発サーバー再起動 → テスト実行
        </p>
      </div>
    </div>
  )
}
