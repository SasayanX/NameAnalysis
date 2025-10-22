import { CredentialCollector } from "@/components/credential-collector"
import { QuickSetupGuide } from "@/components/quick-setup-guide"

export default function CredentialSetupPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">認証情報設定</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Square Developer Console で取得した4つの認証情報を入力してください。
        </p>
      </div>

      <QuickSetupGuide />
      <CredentialCollector />
    </div>
  )
}
