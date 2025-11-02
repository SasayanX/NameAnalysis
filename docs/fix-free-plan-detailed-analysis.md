# 無料プランでの詳細鑑定制限修正

## 問題

無料プランで詳細鑑定の内容が全部見れてしまう問題が発生。

## 原因

1. `currentPlan`の初期化が不完全な可能性
2. `isPreviewMode`と`canViewDetailedAnalysis`の判定が不十分

## 修正内容

### 1. `components/name-analysis-result.tsx`

- `isFreePlan`フラグを追加して、より確実な判定を実施
- カテゴリーの詳細説明（`description`/`explanation`）の表示制御を強化
- 無料プランの場合は確実に非表示にするロジックに変更

```typescript
// 修正前
const canViewDetailedAnalysis = currentPlan !== "free"
const isPreviewMode = currentPlan === "free"

// 修正後
const isFreePlan = currentPlan === "free" || !currentPlan || currentPlan === undefined
const canViewDetailedAnalysis = !isFreePlan
const isPreviewMode = isFreePlan
```

### 2. `app/ClientPage.tsx`

- `currentPlan`の初期化処理を強化
- 無効な値の場合は確実に"free"にフォールバック

```typescript
// 修正前
const [currentPlan, setCurrentPlan] = useState<"free" | "basic" | "premium">(
  () => (usageStatus.plan || "free")
)

// 修正後
const [currentPlan, setCurrentPlan] = useState<"free" | "basic" | "premium">(() => {
  const plan = usageStatus?.plan || "free"
  if (plan !== "free" && plan !== "basic" && plan !== "premium") {
    console.warn("Invalid plan value:", plan, "falling back to 'free'")
    return "free"
  }
  return plan as "free" | "basic" | "premium"
})
```

## 制限される内容（無料プラン）

無料プランでは以下の内容が非表示になります：

1. **カテゴリーの詳細説明**（`description`/`explanation`）
   - 代わりに「詳細な解説は有料プランでご覧いただけます」を表示

2. **詳細分析**（`results.details`）
   - `canViewDetailedAnalysis`で制御

3. **文字別画数**（`results.characterDetails`）
   - `canViewDetailedAnalysis`で制御

4. **霊数情報**（`results.reisuuInfo`）
   - `canViewDetailedAnalysis`で制御

5. **推測マーク案内**（`results.characterDetails`に`isDefault`がある場合）
   - `canViewDetailedAnalysis`で制御

6. **詳細アドバイス**（`results.advice`）
   - `canViewDetailedAnalysis`で制御
   - 代わりにロックされたカードとアップグレード誘導を表示

7. **旧字体変換情報**（`results.kanjiInfo`）
   - `canViewDetailedAnalysis`で制御

8. **AI開運アドバイス**（`AIFortuneAdvisor`）
   - `canViewDetailedAnalysis`で制御

## 表示される内容（無料プラン）

無料プランでも以下の内容は表示されます：

1. **総合スコア**（`results.totalScore`）
2. **五格の数値と運勢**（`category.name`, `category.fortune`, `strokeCount`）
   - 詳細な説明（`description`/`explanation`）は非表示

## テスト方法

1. ブラウザの開発者ツールを開く
2. Consoleタブで以下のログを確認：
   - `currentPlan: "free"`
   - `isFreePlan: true`
   - `canViewDetailedAnalysis: false`
   - `isPreviewMode: true`

3. 詳細鑑定タブで以下を確認：
   - カテゴリーの詳細説明が表示されていない
   - 「詳細な解説は有料プランでご覧いただけます」が表示されている
   - 詳細分析、文字別画数、詳細アドバイス、AI開運アドバイスが表示されていない
   - ロックされたカードとアップグレード誘導が表示されている

## 注意事項

- ブラウザのキャッシュをクリアする必要がある場合があります
- 開発環境では`localStorage.getItem("debug_unlimited_mode") === "true"`が設定されている場合、制限が適用されません

