# Stripe vs Square 比較（開発者体験の観点）

## 🎯 結論

**Stripeは技術的には優れていますが、占い系サービスの審査が厳しく、現在は利用できません。**

## 📊 比較表

| 項目 | Stripe | Square |
|------|--------|--------|
| **テスト環境** | ✅ **非常にシンプル**<br>ダッシュボードで「テストモード」スイッチをON/OFFするだけ | ❌ **複雑**<br>Sandbox/Productionで別々のPayment Linkを作成する必要がある |
| **開発者体験** | ✅ **最高**<br>ドキュメント充実、APIが直感的、エラーメッセージが明確 | ⚠️ **やや複雑**<br>環境ごとの設定が分かりづらい |
| **サブスクリプション** | ✅ **充実**<br>強力なサブスクリプション機能、管理画面が優秀 | ⚠️ **基本機能**<br>基本的な機能はあるが、Stripeほど充実していない |
| **審査** | ❌ **厳格**<br>占い・スピリチュアル系は審査落ちの可能性が高い | ✅ **比較的緩い**<br>占い系でも通過率が高い |
| **手数料** | 3.6% | 3.25% |
| **実装難易度** | ✅ **簡単** | ✅ **簡単** |

## 🔍 詳細比較

### テスト環境の扱い

#### Stripe（優れている点）

```typescript
// Stripeの場合
// 1. ダッシュボードで「テストモード」スイッチをON
// 2. 同じAPIキーでテスト/本番を切り替え可能
// 3. テストカードが明確にドキュメント化されている

// テストカード（明確に定義されている）
const testCard = "4242 4242 4242 4242" // 成功
const testCardDecline = "4000 0000 0000 0002" // 失敗
```

**メリット**:
- ✅ スイッチ一つでテスト/本番を切り替え
- ✅ 同じコード、同じ設定で動作
- ✅ テストカードが明確
- ✅ エラーハンドリングが簡単

#### Square（複雑な点）

```typescript
// Squareの場合
// 1. Sandbox環境でPayment Linkを作成
// 2. Production環境でPayment Linkを作成
// 3. 環境ごとに異なるリンクを管理する必要がある

// 環境変数で切り替えが必要
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC_SANDBOX=https://square.link/u/xxxxx
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC_PRODUCTION=https://square.link/u/yyyyy
```

**デメリット**:
- ❌ 環境ごとにPayment Linkを作り直す必要がある
- ❌ スイッチをON/OFFしても既存のリンクは環境が変わらない
- ❌ テスト環境と本番環境で別々の設定が必要
- ❌ 混乱しやすい

### 開発者体験

#### Stripe

**優れている点**:
- ✅ ドキュメントが充実している
- ✅ APIが直感的で使いやすい
- ✅ エラーメッセージが明確
- ✅ テストツールが充実（Stripe CLI、Webhookテストなど）
- ✅ ダッシュボードが使いやすい

**例**:
```typescript
// Stripeの実装例（シンプル）
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: 'price_xxxxx',
    quantity: 1,
  }],
  success_url: 'https://your-app.com/success',
  cancel_url: 'https://your-app.com/cancel',
})
```

#### Square

**課題**:
- ⚠️ 環境ごとの設定が複雑
- ⚠️ Payment LinkとAPIの使い分けが分かりづらい
- ⚠️ ドキュメントがやや散在している
- ⚠️ テスト環境の扱いが直感的でない

**例**:
```typescript
// Squareの実装例（環境ごとに異なる）
// Sandbox環境用のPayment Link
const sandboxLink = process.env.NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC_SANDBOX
// Production環境用のPayment Link
const productionLink = process.env.NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC_PRODUCTION
```

## 🚫 Stripeが使えない理由

### 審査の問題

プロジェクトの履歴によると、**Stripeは既に審査で落ちています**。

```
status: "審査落ち"
reason: "占い・スピリチュアル系サービスのため"
```

**Stripeの審査基準**:
- 占い・スピリチュアル系サービスは審査が厳しい
- 審査通過率: 2/10（非常に低い）
- アカウント停止のリスクもある

### なぜSquareが選ばれたか

```
審査通過率: 9/10（占い系でも高い通過率）
実装難易度: 9/10（最も簡単）
総合点: 8.4/10（最優先推奨）
```

## 💡 代替案

### 1. Squareの使い方を改善する

現在の課題を解決する方法：
- 環境変数でSandbox/Productionを自動切り替え
- Payment Linkの管理を簡素化
- テスト用のヘルパー関数を作成

### 2. GMOペイメントゲートウェイ

**メリット**:
- ✅ 占い系に比較的寛容（審査通過率: 8/10）
- ✅ 多様な決済手段（クレカ、コンビニ、銀行振込）
- ✅ 定期課金対応
- ✅ 日本企業でサポートが充実

**デメリット**:
- ⚠️ 実装がやや複雑
- ⚠️ 振込手数料250円/回
- ⚠️ 開業届必須

### 3. PayPal

**メリット**:
- ✅ 審査が最も緩い（審査通過率: 9/10）
- ✅ 実装が簡単
- ✅ グローバル対応

**デメリット**:
- ⚠️ 手数料が高い（3.6% + 40円）
- ⚠️ 日本での認知度が低い

## 🎯 推奨アクション

### 短期的（Squareの改善）

1. **環境変数で自動切り替え**
   ```typescript
   // lib/square-config.ts を改善
   // Sandbox/Productionを自動判定
   ```

2. **Payment Link管理の簡素化**
   - 環境ごとのリンクを自動選択
   - テスト用のヘルパー関数を作成

3. **ドキュメントの改善**
   - テスト手順を明確化
   - よくある問題のFAQを作成

### 長期的（代替案の検討）

1. **GMOペイメントゲートウェイの検討**
   - 審査通過の可能性が高い
   - 多様な決済手段に対応

2. **Stripe再審査の検討**
   - サービス内容を変更して再申請
   - ただし、通過の可能性は低い

## 📝 まとめ

**Stripeは技術的には優れていますが、占い系サービスの審査が厳しく、現在は利用できません。**

**Squareの課題**:
- テスト環境の扱いが複雑
- 環境ごとの設定が分かりづらい

**改善策**:
- 環境変数で自動切り替えを実装
- Payment Link管理を簡素化
- ドキュメントを改善

**代替案**:
- GMOペイメントゲートウェイ（審査通過率が高い）
- PayPal（審査が最も緩い）



