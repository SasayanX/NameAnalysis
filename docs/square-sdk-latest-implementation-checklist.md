# Square SDK最新実装チェックリスト（2024-2025）

## ⚠️ 実装前に必ず確認すべきポイント

以前ハマった経験を踏まえ、最新のSquare SDK実装で確認すべき重要なポイントをまとめました。

## 📚 公式ドキュメント（最新版を確認）

### 必須確認リソース

1. **Square Web Payments SDK公式ドキュメント**
   - https://developer.squareup.com/docs/web-payments/overview
   - 最新のAPIリファレンスを確認

2. **Square Subscriptions API**
   - https://developer.squareup.com/docs/subscriptions-api/overview
   - サブスクリプション作成の最新方法

3. **Square Changelog（変更履歴）**
   - https://developer.squareup.com/docs/changelog/connect
   - 最新の変更点を確認（2024年12月、2025年1月に更新あり）

4. **Squareコミュニティフォーラム**
   - https://community.squareup.com/
   - よくある問題や最新の議論を確認

## 🔍 実装前に確認すべき重要ポイント

### 1. SDKの読み込み方法（最新版）

**確認事項**:
- ✅ 最新のSDK CDN URL（`https://web.squarecdn.com/v1/square.js` が最新か）
- ✅ SDKのバージョン指定が必要か
- ✅ TypeScript型定義の最新版

**よくある問題**:
- 古いCDN URLを使用している
- SDKのバージョンが古い
- TypeScript型定義が不足している

### 2. 環境切り替え（Sandbox/Production）

**確認事項**:
- ✅ `applicationId` と `locationId` が環境ごとに正しく設定されているか
- ✅ Sandbox環境では自動的にテストモードになるか
- ✅ 環境変数での切り替え方法

**よくある問題**:
- Sandbox環境なのにProductionの認証情報を使用している
- 環境変数の設定が間違っている
- テストカードが動作しない

**最新の実装方法**:
```typescript
// 環境に応じた認証情報の取得
const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID

// Sandbox環境では自動的にテストモード
const payments = window.Square.payments(applicationId, locationId)
```

### 3. サブスクリプション作成API（最新版）

**確認事項**:
- ✅ `CreateSubscription` APIの最新パラメータ
- ✅ `source_id` の形式（card nonceの使い方）
- ✅ 必須パラメータとオプションパラメータ
- ✅ エラーレスポンスの形式

**よくある問題**:
- APIのパラメータ名が変更されている
- `source_id` の形式が間違っている
- 必須パラメータが不足している

**最新のAPI仕様（要確認）**:
```typescript
// 公式ドキュメントで最新のAPI仕様を確認
POST https://connect.squareup.com/v2/subscriptions
{
  "location_id": "string",
  "plan_id": "string",
  "source_id": "string", // card nonce
  "customer_id": "string", // オプション
  "start_date": "YYYY-MM-DD",
  // その他の最新パラメータを確認
}
```

### 4. カードトークン化（Card Nonce）

**確認事項**:
- ✅ `card.tokenize()` の最新メソッド
- ✅ トークン化の成功/失敗の判定方法
- ✅ エラーハンドリングの方法

**よくある問題**:
- トークン化のメソッド名が変更されている
- エラーレスポンスの形式が変わっている
- 非同期処理の扱いが間違っている

**最新の実装方法（要確認）**:
```typescript
// 公式ドキュメントで最新の実装方法を確認
const tokenResult = await card.tokenize()
if (tokenResult.status === "OK") {
  const cardNonce = tokenResult.token
  // サブスクリプション作成に使用
} else {
  // エラーハンドリング
  console.error(tokenResult.errors)
}
```

### 5. 3Dセキュア対応

**確認事項**:
- ✅ 日本では3Dセキュアフローが実行されない（2024年11月時点）
- ✅ `verifyBuyer` の使用が必要か
- ✅ 将来的な変更の予定

**最新情報**:
- 日本では現時点で3Dセキュアフローが実行されない
- 将来的に開発者が`verifyBuyer`を組み込む必要がなくなる予定

### 6. エラーハンドリング

**確認事項**:
- ✅ 最新のエラーレスポンス形式
- ✅ エラーコードの意味
- ✅ リトライロジックの必要性

**よくある問題**:
- エラーメッセージが不明確
- エラーコードの意味が分からない
- リトライロジックが不足している

## 🧪 テスト環境の確認

### Sandbox環境でのテスト

**確認事項**:
- ✅ テストカード番号（最新版を確認）
  - 一般的: `4111 1111 1111 1111`
  - 公式ドキュメントで最新のテストカードを確認
- ✅ テスト環境での動作確認
- ✅ エラーケースのテスト

**よくある問題**:
- テストカードが動作しない
- Sandbox環境の設定が間違っている
- テスト環境でのエラーが本番環境でも発生する

## 📋 実装前チェックリスト

実装を始める前に、以下を確認してください：

- [ ] 公式ドキュメントの最新版を確認（2024-2025年）
- [ ] Changelogで最新の変更点を確認
- [ ] コミュニティフォーラムでよくある問題を確認
- [ ] SDKのCDN URLが最新か確認
- [ ] 環境変数の設定方法を確認
- [ ] サブスクリプション作成APIの最新仕様を確認
- [ ] カードトークン化の最新メソッドを確認
- [ ] エラーハンドリングの最新方法を確認
- [ ] テスト環境の設定を確認
- [ ] テストカードの最新情報を確認

## 🔗 重要なリンク

1. **Square Web Payments SDK**
   - https://developer.squareup.com/docs/web-payments/overview

2. **Square Subscriptions API**
   - https://developer.squareup.com/docs/subscriptions-api/overview

3. **Square Changelog**
   - https://developer.squareup.com/docs/changelog/connect

4. **Squareコミュニティフォーラム**
   - https://community.squareup.com/

5. **Square開発者向けドキュメント（日本語）**
   - https://developer.squareup.com/jp/ja

## 💡 実装時の注意点

### 1. 公式ドキュメントを常に参照

- 古い実装例やブログ記事を参考にしない
- 公式ドキュメントの最新版を必ず確認

### 2. 環境変数の管理

- Sandbox/Productionで正しく切り替わるか確認
- 環境変数が正しく読み込まれているか確認

### 3. エラーログの確認

- ブラウザのコンソールでエラーを確認
- サーバー側のログも確認
- Squareダッシュボードでエラーを確認

### 4. 段階的な実装

- まず最小限の実装で動作確認
- エラーハンドリングを追加
- 本番環境へのデプロイ前に十分なテスト

## 🚨 よくあるハマりポイント

1. **SDKのバージョンが古い**
   - 最新のCDN URLを使用する
   - 公式ドキュメントで最新版を確認

2. **環境変数の設定ミス**
   - Sandbox/Productionで正しく切り替わるか確認
   - 環境変数が正しく読み込まれているか確認

3. **APIのパラメータが間違っている**
   - 公式ドキュメントで最新のAPI仕様を確認
   - 必須パラメータが不足していないか確認

4. **非同期処理の扱いが間違っている**
   - `async/await` を正しく使用
   - エラーハンドリングを適切に実装

5. **テストカードが動作しない**
   - 最新のテストカード番号を確認
   - Sandbox環境の設定を確認

## 📝 次のステップ

1. ✅ このチェックリストの項目をすべて確認
2. ✅ 公式ドキュメントで最新の実装方法を確認
3. ✅ 既存の実装（`components/square-payment-form.tsx`）を最新仕様と照合
4. ✅ 必要に応じて実装を更新
5. ✅ テスト環境で十分に動作確認
6. ✅ 本番環境へのデプロイ



