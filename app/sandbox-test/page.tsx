import { SandboxTestPanel } from "@/components/sandbox-test-panel"
import { QuickSetupGuide } from "@/components/quick-setup-guide"

export default function SandboxTestPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">サンドボックステスト</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">提供されたサンドボックス認証情報で決済機能をテストします。</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <SandboxTestPanel />
        <QuickSetupGuide />
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">現在の設定</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            <strong>Application ID:</strong> sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw
          </p>
          <p>
            <strong>Environment:</strong> Sandbox（テスト環境）
          </p>
          <p>
            <strong>Status:</strong> テスト準備完了
          </p>
        </div>
      </div>
    </div>
  )
}
