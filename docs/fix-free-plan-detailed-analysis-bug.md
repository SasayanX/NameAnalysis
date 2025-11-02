# 無料プランでの詳細鑑定アクセス制御 修正

## 🐛 問題

無料プランでも詳細鑑定タブにアクセスでき、何度でも使用できてしまう問題がありました。

## 🔍 原因

1. **タブ切り替えの制御不足**: `onValueChange`が直接`setActiveTab`を呼んでいたため、`handleTabClick`の`preventDefault`が効かない
2. **UI制限のみ**: アイコン表示とクリック防止のみで、実際のコンテンツは表示されてしまう
3. **多重チェックなし**: タブとコンテンツの両方で制御していなかった

## ✅ 修正内容

### 1. タブ切り替えハンドラーの追加

```typescript
const handleTabChange = useCallback(
  (tabValue: string) => {
    // 詳細鑑定タブの場合、basic/premiumプランが必要
    if (tabValue === "detailed") {
      if (currentPlan === "free") {
        // 無料プランでは詳細鑑定にアクセス不可
        window.location.href = "/pricing"
        return
      }
    }
    
    // その他のタブは通常通り切り替え
    setActiveTab(tabValue)
  },
  [currentPlan],
)
```

### 2. タブの無効化

```tsx
<TabsTrigger 
  value="detailed" 
  disabled={currentPlan === "free"}  // ← 追加
  onClick={handleTabClick("detailed", "basic")}
>
  {currentPlan === "free" && <LockIcon className="h-3 w-3 mr-1" />}
  詳細鑑定
</TabsTrigger>
```

### 3. コンテンツ側での制御

```tsx
<TabsContent value="detailed">
  {currentPlan === "free" ? (
    // アップグレード誘導表示
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="pt-6 text-center py-12">
        <LockIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="font-semibold text-purple-800 mb-2 text-lg">
          詳細鑑定は有料プランでご利用いただけます
        </h3>
        <p className="text-sm text-purple-600 mb-6">
          ベーシックプラン以上で、天格・人格・地格・外格・総格の詳細分析が可能です
        </p>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" asChild>
          <Link href="/pricing">プランを見る</Link>
        </Button>
      </CardContent>
    </Card>
  ) : (
    <NameAnalysisResult ... />
  )}
</TabsContent>
```

## 🛡️ 防御層

以下の3層で制御：

1. **UI層**: タブを`disabled`属性で無効化
2. **イベント層**: `handleTabChange`でプランチェック
3. **コンテンツ層**: `TabsContent`内で再度プランチェック

これにより、無料プランでは詳細鑑定機能にアクセスできないようになりました。

## 📋 確認事項

- [x] 無料プランでタブが無効化される
- [x] 無料プランでタブをクリックしても詳細鑑定が開かない
- [x] 無料プランでコンテンツにアクセスしてもアップグレード誘導が表示される
- [x] 有料プランでは正常に詳細鑑定が表示される

## 🎯 今後の改善点

- URLパラメータ（例：`?tab=detailed`）での直接アクセスも制御する必要がある場合は、サーバーサイドでのチェックを追加
- プラン変更時のタブ状態管理を改善

---

**修正日**: 2025-01-26  
**ステータス**: ✅ 完了

