# Perplexity AI への質問: Square Cards API 400エラー

## 🔴 現在の問題

- Square Cards APIで400 Bad Requestエラーが発生
- エラーメッセージ: "Field must not be blank"
- リクエストボディ:
  ```json
  {
    "source_id": "card_nonce_here",
    "card": {
      "customer_id": "customer_id_here"
    },
    "idempotency_key": "card_customer_id_timestamp"
  }
  ```

## 📋 Perplexity AI への質問

### 質問: Square Cards API の最新実装方法（2024-2025年）

```
Square APIのCards APIでカードを登録する際に、400 Bad Requestエラーが発生しています。
エラーメッセージは「Field must not be blank」です。

現在の実装:
- エンドポイント: https://connect.squareupsandbox.com/v2/cards
- APIバージョン: 2024-01-18
- リクエストボディ:
  {
    "source_id": "card_nonce_from_web_payments_sdk",
    "card": {
      "customer_id": "customer_id"
    },
    "idempotency_key": "card_customer_id_timestamp"
  }

2024-2025年の最新のSquare Cards APIの実装方法を教えてください。特に:
1. リクエストボディの正しい構造
2. 必須フィールド
3. `source_id`と`card_nonce`の違い（どちらを使うべきか）
4. `card`オブジェクトの構造
5. 最新のAPIバージョン
6. よくある間違い

Web Payments SDKで取得したcard nonceを使ってカードを登録する具体的なコード例を提示してください。
```

## 🔍 確認すべきポイント

1. **リクエストボディの構造**
   - `source_id` vs `card_nonce`
   - `card`オブジェクトの構造
   - 必須フィールド

2. **APIバージョン**
   - 最新のAPIバージョン
   - バージョンによる違い

3. **エラーメッセージ**
   - どのフィールドが空なのか
   - フィールド名の確認

## 📝 参考

- [Square Cards API Documentation](https://developer.squareup.com/reference/square/cards-api)
- [Square Web Payments SDK](https://developer.squareup.com/docs/web-payments/overview)



