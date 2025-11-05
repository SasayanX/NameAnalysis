# 自社オリジナルサインシステム実装計画

## 概要

GMOサインを使わずに、自社オリジナルの電子署名システムを構築します。
PDFの倍々契約書の署名欄に、ユーザーが手書きでサインし、保存して返送するシステムです。

## 技術スタック

### フロントエンド
- **PDF表示**: `react-pdf` または `@react-pdf-viewer/core`
- **手書きサイン**: `signature_pad` または `react-signature-canvas`
- **PDF編集**: `pdf-lib` (PDFの結合・編集)

### バックエンド
- **PDF保存**: Supabase Storage（`contracts`バケット）
- **契約書管理**: Supabase `contracts`テーブル
- **署名検証**: タイムスタンプ、IPアドレス、ユーザー情報を記録

## 実装フロー

### 1. 契約書の準備
```
/contracts/{contractId}.pdf
- 署名欄を予め用意
- 署名位置を座標で指定
```

### 2. 署名画面の表示
```
1. PDFを表示
2. 署名欄に「ここにサイン」ボタンを表示
3. クリックで署名モーダルを開く
```

### 3. 手書きサイン
```
1. Canvas上で手書き入力
2. 「クリア」ボタンでリセット
3. 「保存」ボタンで確定
```

### 4. PDFへの埋め込み
```
1. サイン画像をPNG/JPEGに変換
2. pdf-libでPDFの署名欄に画像を埋め込む
3. 署名済みPDFを生成
```

### 5. 保存・送信
```
1. 署名済みPDFをSupabase Storageに保存
2. 契約書情報をSupabaseに記録
3. メール通知（オプション）
```

## データベーススキーマ

```sql
-- 契約書テーブル
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  contract_type TEXT NOT NULL, -- 'subscription', 'service', etc.
  original_pdf_url TEXT NOT NULL, -- 元の契約書PDF
  signed_pdf_url TEXT, -- 署名済みPDF（NULLの場合は未署名）
  signature_data JSONB, -- 署名情報（タイムスタンプ、IP等）
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'signed', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- インデックス
CREATE INDEX idx_contracts_user_id ON contracts(user_id);
CREATE INDEX idx_contracts_status ON contracts(status);
```

## API設計

### 1. 契約書取得
```
GET /api/contracts/{contractId}
→ 契約書PDFと署名状況を返す
```

### 2. 署名保存
```
POST /api/contracts/{contractId}/sign
Body: {
  signatureImage: string (base64),
  signaturePosition: { x: number, y: number }
}
→ 署名済みPDFを生成して保存
```

### 3. 署名済みPDFダウンロード
```
GET /api/contracts/{contractId}/download
→ 署名済みPDFをダウンロード
```

## コンポーネント設計

### 1. ContractViewer
```tsx
<ContractViewer
  contractId={string}
  onSignComplete={callback}
/>
```

### 2. SignaturePad
```tsx
<SignaturePad
  onSave={(signatureData) => void}
  onClear={() => void}
/>
```

### 3. SignatureModal
```tsx
<SignatureModal
  isOpen={boolean}
  onClose={() => void}
  onSave={(signature) => void}
/>
```

## セキュリティ考慮事項

1. **署名の改ざん防止**
   - 署名済みPDFにタイムスタンプを埋め込む
   - ハッシュ値を計算して検証

2. **認証**
   - 契約書は認証済みユーザーのみアクセス可能
   - RLSポリシーでユーザーごとにアクセス制限

3. **監査ログ**
   - 署名時刻、IPアドレス、ユーザー情報を記録
   - 変更履歴を保持

## 実装の難易度

- **難易度**: 中程度
- **工数見積もり**: 2-3日
- **主な作業**:
  1. PDF表示コンポーネント（1日）
  2. 手書きサイン機能（0.5日）
  3. PDFへの埋め込み（0.5日）
  4. バックエンドAPI（1日）

## 必要なライブラリ

```json
{
  "dependencies": {
    "react-pdf": "^7.0.0",
    "signature_pad": "^4.0.0",
    "pdf-lib": "^1.17.1",
    "react-signature-canvas": "^1.0.6"
  }
}
```

## 実装可能か？

✅ **はい、実装可能です**

- 既存の技術スタック（Next.js + Supabase）で実装可能
- 必要なライブラリはすべて利用可能
- 複雑な外部サービス連携は不要

## 注意点

1. **PDFの互換性**: ブラウザでのPDF表示は環境によって異なる可能性
2. **署名の法的有効性**: 法的な要件を満たすか、専門家に確認が必要
3. **ストレージ容量**: 契約書PDFは容量が大きい可能性（Supabase Storageの容量を確認）

## 次のステップ

実装を開始する場合は、以下を明確にしてください：
1. 契約書の形式（PDFテンプレート）
2. 署名欄の位置（座標指定）
3. 署名後のワークフロー（承認プロセスなど）
4. メール通知の有無

