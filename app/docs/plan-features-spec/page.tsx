import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Database, Shield, Settings } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "開発者向け: プラン機能仕様 | まいにちAI姓名判断",
  description: "開発者向けのプラン機能仕様、実装詳細、制限値、API仕様を記載しています。",
}

export default function PlanFeaturesSpecPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-6 w-6 text-gray-600" />
            <h1 className="text-4xl font-bold">開発者向け: プラン機能仕様</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            各プランの機能制限、実装詳細、技術仕様を記載しています
          </p>
          <div className="flex gap-4">
            <Link href="/plans/features" className="text-blue-600 hover:underline">
              ← ユーザー向け機能一覧
            </Link>
            <Link href="/docs" className="text-blue-600 hover:underline">
              ← 開発ドキュメント一覧
            </Link>
          </div>
        </div>

        {/* プラン制限値 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              プラン別使用制限値
            </CardTitle>
            <CardDescription>
              UsageTrackerで使用される制限値。値が-1の場合は無制限
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">機能</th>
                    <th className="text-center py-3 px-4 font-semibold">無料プラン</th>
                    <th className="text-center py-3 px-4 font-semibold">ベーシック</th>
                    <th className="text-center py-3 px-4 font-semibold">プレミアム</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-mono">personalAnalysis</td>
                    <td className="text-center py-3 px-4">1回/日</td>
                    <td className="text-center py-3 px-4">10回/日</td>
                    <td className="text-center py-3 px-4 font-mono">-1 (無制限)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-mono">companyAnalysis</td>
                    <td className="text-center py-3 px-4">1回/日</td>
                    <td className="text-center py-3 px-4">10回/日</td>
                    <td className="text-center py-3 px-4 font-mono">-1 (無制限)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-mono">compatibilityAnalysis</td>
                    <td className="text-center py-3 px-4">0 (不可)</td>
                    <td className="text-center py-3 px-4">3回/日</td>
                    <td className="text-center py-3 px-4 font-mono">-1 (無制限)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-mono">numerologyAnalysis</td>
                    <td className="text-center py-3 px-4">0 (不可)</td>
                    <td className="text-center py-3 px-4">5回/日</td>
                    <td className="text-center py-3 px-4 font-mono">-1 (無制限)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-mono">babyNaming</td>
                    <td className="text-center py-3 px-4">0 (不可)</td>
                    <td className="text-center py-3 px-4">5回/日</td>
                    <td className="text-center py-3 px-4 font-mono">-1 (無制限)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-mono">pdfExport</td>
                    <td className="text-center py-3 px-4">0 (不可)</td>
                    <td className="text-center py-3 px-4">10回/日</td>
                    <td className="text-center py-3 px-4 font-mono">-1 (無制限)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono">historyStorage</td>
                    <td className="text-center py-3 px-4">10件</td>
                    <td className="text-center py-3 px-4">50件</td>
                    <td className="text-center py-3 px-4 font-mono">-1 (無制限)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 実装詳細 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              実装詳細
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="font-semibold text-lg mb-3">使用制限の実装</h3>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                <div>ファイル: <code className="text-blue-600">lib/usage-tracker.ts</code></div>
                <div className="mt-2">
                  <div>クラス: <code>UsageTracker</code></div>
                  <div>メソッド: <code>canUseFeature(feature: string)</code></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                使用制限は<code>UsageTracker</code>クラスで管理されています。
                1日ごとに自動リセットされます（日本時間0:00）。
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">プラン判定ロジック</h3>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                <div>ファイル: <code className="text-blue-600">lib/subscription-manager.ts</code></div>
                <div className="mt-2">
                  <div>クラス: <code>SubscriptionManager</code></div>
                  <div>メソッド: <code>getCurrentPlan()</code></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                プラン情報は<code>SubscriptionManager</code>で管理されています。
                Square決済システムと連携して、プラン情報を取得します。
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">詳細鑑定の制限実装</h3>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                <div>ファイル: <code className="text-blue-600">app/ClientPage.tsx</code></div>
                <div className="mt-2">
                  <div>コンポーネント: <code>ClientPage</code></div>
                  <div>関数: <code>handleTabChange()</code></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                無料プランでは詳細鑑定タブが無効化され、コンテンツはプレビュー版のみ表示されます。
              </p>
            </section>
          </CardContent>
        </Card>

        {/* 機能別実装状況 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              機能別実装状況
            </CardTitle>
            <CardDescription>
              各機能の実装状況とプラン制限の適用方法
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">かんたん鑑定</h4>
                <p className="text-sm text-gray-600">
                  全プランで利用可能。制限なし。
                  <br />
                  コンポーネント: <code className="text-xs bg-gray-100 px-1">components/simple-analysis-result.tsx</code>
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold">詳細鑑定</h4>
                <p className="text-sm text-gray-600">
                  無料プラン: プレビュー版（数値のみ）<br />
                  ベーシック以上: 完全版
                  <br />
                  コンポーネント: <code className="text-xs bg-gray-100 px-1">components/name-analysis-result.tsx</code>
                  <br />
                  制限チェック: <code className="text-xs bg-gray-100 px-1">app/ClientPage.tsx</code>の<code>handleTabChange</code>
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">総合分析</h4>
                <p className="text-sm text-gray-600">
                  無料プラン: 基本情報のみ<br />
                  ベーシック以上: 詳細分析
                  <br />
                  コンポーネント: <code className="text-xs bg-gray-100 px-1">components/six-star-chart.tsx</code>
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold">相性診断</h4>
                <p className="text-sm text-gray-600">
                  無料プラン: 利用不可<br />
                  ベーシック: 1日3回<br />
                  プレミアム: 無制限
                  <br />
                  コンポーネント: <code className="text-xs bg-gray-100 px-1">components/compatibility-analyzer.tsx</code>
                  <br />
                  制限チェック: <code className="text-xs bg-gray-100 px-1">UsageTracker.canUseFeature("compatibilityAnalysis")</code>
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold">おなまえ格付けランク</h4>
                <p className="text-sm text-gray-600">
                  プレミアム限定機能<br />
                  コンポーネント: <code className="text-xs bg-gray-100 px-1">components/name-ranking-card.tsx</code>
                  <br />
                  制限チェック: <code className="text-xs bg-gray-100 px-1">currentPlan === "premium"</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API仕様 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API仕様</CardTitle>
            <CardDescription>プラン判定と使用制限チェックのAPI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">現在のプラン取得</h4>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-xs">
                  <div>const subscription = useSubscription()</div>
                  <div className="mt-1">const plan = subscription.getCurrentPlan()</div>
                  <div className="mt-1">// 戻り値: {`{ id: "free" | "basic" | "premium", ... }`}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">機能利用可否チェック</h4>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-xs">
                  <div>const usageTracker = UsageTracker.getInstance()</div>
                  <div className="mt-1">const result = usageTracker.canUseFeature("personalAnalysis")</div>
                  <div className="mt-1">// 戻り値: {`{ allowed: boolean, limit: number, current: number, remaining: number }`}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">使用回数カウント</h4>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-xs">
                  <div>const success = usageTracker.incrementUsage("personalAnalysis")</div>
                  <div className="mt-1">// 戻り値: boolean (成功したかどうか)</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* データ構造 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>データ構造</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">プラン定義</h4>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`{
  id: "free" | "basic" | "premium",
  name: string,
  price: number,
  features: string[],
  limits: {
    personalAnalysis: number,
    companyAnalysis: number,
    compatibilityAnalysis: number,
    // ...
  }
}`}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">使用状況データ</h4>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`{
  personalAnalysis: number,
  companyAnalysis: number,
  compatibilityAnalysis: number,
  numerologyAnalysis: number,
  babyNaming: number,
  pdfExport: number,
  historyStorage: number,
  lastReset: string (ISO date)
}`}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 参考リンク */}
        <Card>
          <CardHeader>
            <CardTitle>参考リンク</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                • <Link href="/plans/features" className="text-blue-600 hover:underline">ユーザー向け機能一覧</Link>
              </li>
              <li>
                • <code className="text-xs bg-gray-100 px-1">lib/usage-tracker.ts</code> - 使用制限管理
              </li>
              <li>
                • <code className="text-xs bg-gray-100 px-1">lib/subscription-manager.ts</code> - プラン管理
              </li>
              <li>
                • <code className="text-xs bg-gray-100 px-1">lib/freemium-plan-structure.ts</code> - プラン構造定義
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

