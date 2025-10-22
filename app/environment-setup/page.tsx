import { EnvironmentVariablesGuide } from "@/components/environment-variables-guide"

export default function EnvironmentSetupPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold">環境変数設定</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          マネタイズ化に必要な環境変数を設定します。Square Developer Console で取得した認証情報を入力してください。
        </p>
      </div>

      <EnvironmentVariablesGuide />
    </div>
  )
}
