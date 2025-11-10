# 赤ちゃん名付け機能の使用制限が効かない問題の修正方法

## 問題
赤ちゃん名付け機能がコースに関係なく無制限で使用できてしまう

## 修正内容

### 1. `isV0Environment()`の厳格化
- 開発環境でも、明示的に`debug_unlimited_mode`が設定されていない限り無制限モードを無効化
- プロダクション環境では常に`false`を返す

### 2. `getCurrentPlan()`の改善
- `SubscriptionManager`から実際のプラン情報を取得
- `isSubscriptionActive()`が`false`の場合は無料プランを返す
- デフォルトは`"free"`プラン

### 3. `SubscriptionManager.isSubscriptionActive()`の修正
- 無料プラン（`plan === "free"`）の場合は常に`false`を返す
- `expiresAt`がない場合は`false`を返す

## デバッグ方法

ブラウザのコンソールを開いて、以下のログを確認してください：

```
[UsageTracker] canUseFeature: babyNaming, プラン: free
[UsageTracker] babyNaming: 制限=0, 使用=0
[UsageTracker] babyNaming: 結果: {allowed: false, limit: 0, current: 0, remaining: 0}
```

もし以下のようなログが出ている場合、デバッグモードが有効になっています：

```
[UsageTracker] デバッグ無制限モード: babyNaming は無制限
```

## デバッグモードの確認とクリア

ブラウザのコンソールで以下を実行してください：

```javascript
// デバッグモードの確認
console.log('debug_unlimited_mode:', localStorage.getItem('debug_unlimited_mode'))
console.log('debug_current_plan:', localStorage.getItem('debug_current_plan'))

// デバッグモードをクリア
localStorage.removeItem('debug_unlimited_mode')
localStorage.removeItem('debug_current_plan')

// ページをリロード
location.reload()
```

## 使用制限

### freeプラン
- `babyNaming: 0`（使用不可）

### basicプラン
- `babyNaming: 5`（1日5回）

### premiumプラン
- `babyNaming: -1`（無制限）














