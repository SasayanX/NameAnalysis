import { GMORequirementsChecklist } from "@/components/gmo-requirements-checklist"

export default function GMOSetupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">GMOペイメント審査準備</h1>
        <p className="text-gray-600">GMOペイメントゲートウェイの審査に必要な書類と手続きを確認しましょう。</p>
      </div>

      <GMORequirementsChecklist />

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📋 開業届の提出手順</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>税務署で「個人事業の開業・廃業等届出書」を入手（またはe-Taxで電子申請）</li>
          <li>必要事項を記入（事業内容：「インターネットサービス業」など）</li>
          <li>税務署に提出（控えに受付印をもらう）</li>
          <li>受付印付きの控えをGMO審査で使用</li>
        </ol>
        <p className="text-sm text-blue-600 mt-2">💡 開業届は提出から1ヶ月以内にGMO審査を申請することを推奨</p>
      </div>
    </div>
  )
}
