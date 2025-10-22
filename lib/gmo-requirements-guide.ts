// GMOペイメントゲートウェイ審査要件ガイド

export interface GMORequirements {
  documentType: string
  required: boolean
  description: string
  notes?: string
}

export const GMO_INDIVIDUAL_REQUIREMENTS: GMORequirements[] = [
  {
    documentType: "開業届の写し",
    required: true,
    description: "税務署に提出した開業届の控え（受付印必須）",
    notes: "個人事業主として正式に開業していることの証明",
  },
  {
    documentType: "身分証明書",
    required: true,
    description: "運転免許証、パスポート、マイナンバーカードなど",
    notes: "顔写真付きの公的身分証明書",
  },
  {
    documentType: "銀行口座通帳",
    required: true,
    description: "売上金振込先口座の通帳コピー（1-2ページ目）",
    notes: "事業用口座推奨（個人口座でも可）",
  },
  {
    documentType: "事業内容証明資料",
    required: true,
    description: "ウェブサイト、パンフレット、名刺など",
    notes: "実際に事業を行っていることの証明",
  },
  {
    documentType: "印鑑証明書",
    required: false,
    description: "市区町村発行の印鑑証明書",
    notes: "高額取引の場合に求められることがある",
  },
]

export const GMO_審査基準 = {
  事業実態: "実際に運営されているサービス・商品があること",
  継続性: "継続的な事業運営が見込まれること",
  信頼性: "適切な特商法表記・プライバシーポリシーがあること",
  コンプライアンス: "法令遵守体制が整っていること",
  リスク評価: "チャージバック・不正利用のリスクが低いこと",
}

export const GMO_審査期間 = {
  標準: "5-10営業日",
  追加資料要求時: "2-3週間",
  再審査: "1-2週間",
}

export const GMO_手数料体系 = {
  初期費用: "無料",
  月額基本料: "無料",
  決済手数料: {
    Visa_Mastercard: "3.25%",
    JCB: "3.45%",
    American_Express: "3.74%",
    Diners: "3.74%",
  },
  トランザクション料: "無料",
  振込手数料: "250円/回",
}
