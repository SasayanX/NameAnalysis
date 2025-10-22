import { BabyNamingStrokeValidator } from "@/components/baby-naming-stroke-validator"

export default function BabyNamingValidationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">赤ちゃん名付けツール 漢字画数データ検証</h1>
          <p className="text-muted-foreground">
            名付けツールで使用される全ての漢字の画数データが正しく登録されているかを検証します。
            不正確な画数データは姓名判断結果に直接影響するため、定期的な検証が重要です。
          </p>
        </div>

        <BabyNamingStrokeValidator />
      </div>
    </div>
  )
}
