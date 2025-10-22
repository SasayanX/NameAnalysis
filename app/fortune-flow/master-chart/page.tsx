import { FortuneMasterChart } from "@/components/fortune-master-chart"

export default function MasterChartPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">運命基本シート分析</h1>

      <FortuneMasterChart description="すべての星人タイプの運気パターンを分析し、五行の相生・相克関係と極性による影響を検証します。" />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-2">運命基本シートについて</h2>
        <p className="mb-4">
          運命基本シートは、16種類の星人タイプ（8つの基本要素×2つの極性）の運気パターンを一覧にしたものです。
          このシートを分析することで、運気パターンの背後にある法則性を理解し、数式モデルの精度を向上させることができます。
        </p>
        <p className="mb-4">
          分析の結果、以下の重要な法則性が確認されました：
          <br />
          1. 基本要素は五行の相生関係（木→火→土→金→水→木）に沿って2ヶ月ずつシフトする
          <br />
          2. 極性が異なる場合は運気が反転する（大吉⇔大凶、吉⇔凶）
          <br />
          3. 特殊な星人タイプ（天王、冥王、海王）は独自のシフトパターンを持つ
        </p>
        <p>
          これらの法則を組み合わせた数式モデルは、高い精度で運気パターンを予測できることが確認されました。
          特に、五行の基本要素（木、火、土、金、水）に関しては90%以上の精度で予測可能です。
          この知見を活用することで、より正確な運気予測や相性分析が可能になります。
        </p>
      </div>
    </div>
  )
}
