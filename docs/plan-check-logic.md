# サイトアクセス時のプラン確認ロジック

## 概要

サイトアクセス時に、ユーザーのサブスクリプションプラン（free/basic/premium）を確認し、使用制限を適用する仕組みについて説明します。

## プラン確認の流れ

### 1. アプリケーション起動時（ClientPage）

**ファイル**: `app/ClientPage.tsx`

```typescript
// 1. UsageTrackerのインスタンスを取得
const [usageTracker] = useState(() => UsageTracker.getInstance())

// 2. 初期状態として、現在の使用状況を取得
const [usageStatus, setUsageStatus] = useState(() => {
  return usageTracker.getUsageStatus()
})

// 3. プラン状態を初期化
const [currentPlan, setCurrentPlan] = useState<"free" | "basic" | "premium">(() => {
  const plan = usageStatus?.plan || "free"
  return plan as "free" | "basic" | "premium"
})
```

### 2. UsageTracker.getCurrentPlan() の処理

**ファイル**: `lib/usage-tracker.ts` (195-266行目)

```typescript
private getCurrentPlan(): string {
  // 1. デバッグモードチェック（開発環境のみ）
  if (this.isV0Environment()) {
    return "premium"
  }

  // 2. デバッグプランが設定されている場合（開発環境のみ）
  const debugPlan = localStorage.getItem("debug_current_plan")
  if (debugPlan && process.env.NODE_ENV === "development") {
    return debugPlan
  }

  // 3. SubscriptionManagerから実際のプラン情報を取得
  const manager = SubscriptionManager.getInstance()
  const subscriptionInfo = manager.getSubscriptionInfo()
  
  if (subscriptionInfo && subscriptionInfo.plan) {
    const plan = subscriptionInfo.plan
    
    // 4. 無料プランの場合はそのまま返す
    if (plan === "free") {
      return "free"
    }
    
    // 5. 有料プラン（basic/premium）の場合、有効性をチェック
    const isActive = manager.isSubscriptionActive()
    
    if (isActive) {
      return plan  // basic または premium
    } else {
      // 有料プランだが期限切れなどの場合は無料プランに戻す
      return "free"
    }
  }
  
  // 6. サブスクリプション情報がない場合は無料プラン
  return "free"
}
```

### 3. SubscriptionManager.isSubscriptionActive() の処理

**ファイル**: `lib/subscription-manager.ts` (184-205行目)

```typescript
isSubscriptionActive(): boolean {
  // 1. 無料プランの場合は常にfalse（有効なサブスクリプションではない）
  if (this.currentSubscription.plan === "free") {
    return false
  }

  // 2. キャンセル済みまたは失敗ステータスの場合はfalse
  if (this.currentSubscription.status === "cancelled" || 
      this.currentSubscription.status === "failed") {
    return false
  }

  // 3. expiresAtがない場合は無効
  if (!this.currentSubscription.expiresAt) {
    return false
  }

  // 4. 現在日時がexpiresAtより前であるかチェック
  return new Date() < this.currentSubscription.expiresAt
}
```

### 4. SubscriptionManager.loadSubscription() の処理

**ファイル**: `lib/subscription-manager.ts` (114-139行目)

```typescript
private loadSubscription(): UserSubscription {
  // 1. サーバーサイド（SSR）の場合はデフォルトを返す
  if (typeof window === "undefined") {
    return this.getDefaultSubscription()  // freeプラン
  }

  // 2. localStorageからサブスクリプション情報を読み込み
  const stored = localStorage.getItem("userSubscription")
  if (stored) {
    const parsed = JSON.parse(stored)
    return {
      ...parsed,
      expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
      trialEndsAt: parsed.trialEndsAt ? new Date(parsed.trialEndsAt) : null,
      // ... その他の日付フィールドも同様に変換
    }
  }

  // 3. 保存されていない場合はデフォルト（無料プラン）
  return this.getDefaultSubscription()
}
```

## データ保存場所

### localStorage内のキー

1. **`userSubscription`**: サブスクリプション情報
   - 形式: JSON文字列
   - 内容:
     ```typescript
     {
       plan: "free" | "basic" | "premium",
       expiresAt: string | null,  // ISO日付文字列
       isActive: boolean,
       trialEndsAt: string | null,
       status: "active" | "pending" | "cancelled" | "failed",
       squareSubscriptionId?: string,
       gmoSubscriptionId?: string,
       paymentMethod?: "square" | "gmo" | "manual",
       // ...
     }
     ```

2. **`usage_tracker_data`**: 使用状況データ
   - 形式: JSON文字列
   - 内容:
     ```typescript
     {
       personalAnalysis: number,
       companyAnalysis: number,
       compatibilityAnalysis: number,
       numerologyAnalysis: number,
       babyNaming: number,
       pdfExport: number,
       historyStorage: number,
       lastReset: string,  // YYYY-MM-DD形式の日付
     }
     ```

## プラン確認のタイミング

### 1. ページロード時

- `ClientPage`コンポーネントがマウントされた時
- `UsageTracker.getInstance()`が呼び出された時（初回のみシングルトンインスタンスを作成）
- `getUsageStatus()`が呼び出された時

### 2. 機能使用時

- 各機能（個人名分析、会社名分析など）を使用する前に
- `canUseFeature()`メソッド内で`getCurrentPlan()`が呼び出される

### 3. プラン変更時

- サブスクリプション購入・更新・キャンセル時
- `SubscriptionManager`のメソッド（`startSquareSubscription()`, `cancelSubscription()`など）が呼び出された時
- `localStorage`の`userSubscription`が更新された時

## プラン別制限

### プラン制限定義

**ファイル**: `lib/usage-tracker.ts` (43-71行目)

```typescript
const PLAN_LIMITS: { [plan: string]: UsageLimits } = {
  free: {
    personalAnalysis: 1,      // 1日1回
    companyAnalysis: 1,         // 1日1回
    compatibilityAnalysis: 0,    // 利用不可
    numerologyAnalysis: 0,      // 利用不可
    babyNaming: 0,             // 利用不可
    pdfExport: 0,              // 利用不可
    historyStorage: 10,         // 10件まで
  },
  basic: {
    personalAnalysis: -1,       // 無制限
    companyAnalysis: -1,        // 無制限
    compatibilityAnalysis: 5,   // 1日5回
    numerologyAnalysis: 5,      // 1日5回
    babyNaming: 5,             // 1日5回
    pdfExport: 5,              // 1日5回
    historyStorage: 50,         // 50件まで
  },
  premium: {
    personalAnalysis: -1,       // 無制限
    companyAnalysis: -1,        // 無制限
    compatibilityAnalysis: -1,  // 無制限
    numerologyAnalysis: -1,    // 無制限
    babyNaming: -1,            // 無制限
    pdfExport: -1,             // 無制限
    historyStorage: -1,         // 無制限
  },
}
```

**注意**: `-1`は無制限を意味します。

## 使用制限チェック

### canUseFeature() メソッド

**ファイル**: `lib/usage-tracker.ts` (345-412行目)

```typescript
canUseFeature(feature: keyof Omit<UsageData, "lastReset">): UsageLimit {
  // 1. デバッグモードチェック（開発環境のみ）
  if (this.isV0Environment()) {
    return { allowed: true, limit: -1, current: 0, remaining: -1 }
  }

  // 2. 日次リセットチェック
  this.checkDailyReset()

  // 3. 現在のプランを取得
  const currentPlan = this.getCurrentPlan()
  const limits = this.getPlanLimits(currentPlan)

  // 4. 機能の制限値を取得
  const featureLimit = limits[feature]
  const currentUsage = this.usageData[feature] || 0

  // 5. 無制限の場合
  if (featureLimit === -1) {
    return { allowed: true, limit: -1, current: currentUsage, remaining: -1 }
  }

  // 6. 制限チェック
  const remaining = Math.max(0, featureLimit - currentUsage)
  return {
    allowed: remaining > 0,
    limit: featureLimit,
    current: currentUsage,
    remaining,
  }
}
```

## 日次リセット

### checkDailyReset() メソッド

**ファイル**: `lib/usage-tracker.ts` (312-325行目)

```typescript
private checkDailyReset() {
  const today = new Date().toISOString().split("T")[0]  // YYYY-MM-DD
  
  // lastResetが今日の日付でない場合、使用状況をリセット
  if (this.usageData.lastReset !== today) {
    this.usageData = {
      ...this.getDefaultUsageData(),
      lastReset: today,
    }
    this.saveUsageData()
  }
}
```

毎日自動的に使用状況がリセットされます。

## デバッグモード

### 開発環境でのデバッグ機能

1. **デバッグプラン切り替え**
   ```javascript
   localStorage.setItem("debug_current_plan", "premium")  // free, basic, premium
   ```

2. **デバッグ無制限モード**
   ```javascript
   localStorage.setItem("debug_unlimited_mode", "true")
   ```

3. **デバッグトライアル**
   ```javascript
   localStorage.setItem("debug_is_trial", "true")
   localStorage.setItem("debug_trial_days", "3")
   ```

**注意**: これらのデバッグ機能は開発環境（`NODE_ENV === "development"`）でのみ有効です。

## プラン確認の流れ図

```
サイトアクセス
    ↓
ClientPage マウント
    ↓
UsageTracker.getInstance() 呼び出し
    ↓
getUsageStatus() 呼び出し
    ↓
getCurrentPlan() 呼び出し
    ↓
SubscriptionManager.getInstance() 呼び出し
    ↓
loadSubscription() 呼び出し
    ↓
localStorage.getItem("userSubscription") 読み込み
    ↓
getSubscriptionInfo() 取得
    ↓
isSubscriptionActive() チェック
    ↓
expiresAt と現在日時を比較
    ↓
プラン決定（free/basic/premium）
    ↓
使用制限を適用
```

## 注意事項

1. **ローカルストレージ依存**: 現在の実装では、サブスクリプション情報は`localStorage`に保存されています。ブラウザのデータをクリアすると、サブスクリプション情報も失われます。

2. **サーバーサイドでの確認**: サーバーサイド（SSR）では、常に`free`プランとして扱われます。プラン確認はクライアントサイドでのみ行われます。

3. **期限切れの自動処理**: 有料プランの`expiresAt`が過ぎた場合、自動的に`free`プランに戻ります。ただし、この処理は`getCurrentPlan()`が呼び出された時のみ実行されます。

4. **同期タイミング**: プラン変更後、即座に反映されない場合があります。ページをリロードするか、`usageTracker.getUsageStatus()`を再呼び出しすることで更新されます。

## 関連ファイル

- `lib/usage-tracker.ts`: 使用状況追跡とプラン確認ロジック
- `lib/subscription-manager.ts`: サブスクリプション管理
- `app/ClientPage.tsx`: メインページでのプラン確認使用例
- `components/subscription-status-card.tsx`: プラン状態表示コンポーネント


