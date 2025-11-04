# 五行アドバイス修正 - グラフの実際の値と一致させる

## 問題
AI詳細アドバイスの五行に関するアドバイスが、実際の五行グラフの値を見ていませんでした。
- 「〇の気が強い」というアドバイスが出ていたが、実際のグラフで最も長い（多い）要素が別だった
- `gogyoResult.dominantElement`と`gogyoResult.weakElement`を直接使用していたが、これらがグラフの実際の値と一致していない可能性があった

## 修正内容
アドバイス生成時に、グラフの実際の値（`gogyoResult.elements`）から直接最大値と最小値を計算するように変更しました。

### 修正したファイル

1. **`components/advanced-five-elements-chart.tsx`**
   - 五行バランス分析のアドバイス生成
   - プレミアム会員向けの詳細アドバイス
   - プロ会員向けの表示
   - バッジ表示（優勢要素）

2. **`hooks/use-name-analysis.ts`**
   - 生年月日ありの場合のアドバイス生成
   - 生年月日なしの場合のアドバイス生成

3. **`hooks/use-optimized-analysis.ts`**
   - 最適化版分析のアドバイス生成

4. **`components/name-analyzer.tsx`**
   - 生年月日ありの場合のアドバイス生成（3箇所）
   - エラーハンドリング時のアドバイス生成
   - 生年月日なしの場合のアドバイス生成

5. **`app/fortune-comprehensive/page.tsx`**
   - 総合占いページのアドバイス生成

## 修正方法
各箇所で、以下のロジックを追加しました：

```typescript
// グラフの実際の値から最大値と最小値を計算
const elementArray = [
  { element: "木" as const, count: gogyoResult.elements.wood },
  { element: "火" as const, count: gogyoResult.elements.fire },
  { element: "土" as const, count: gogyoResult.elements.earth },
  { element: "金" as const, count: gogyoResult.elements.metal },
  { element: "水" as const, count: gogyoResult.elements.water },
]
elementArray.sort((a, b) => b.count - a.count)
const actualDominantElement = elementArray[0].element
const actualWeakElement = elementArray[elementArray.length - 1].element
```

そして、`gogyoResult.dominantElement`と`gogyoResult.weakElement`の代わりに、`actualDominantElement`と`actualWeakElement`を使用するように変更しました。

## 確認事項
- ✅ グラフの実際の値から最大値・最小値を計算
- ✅ アドバイスがグラフの表示と一致
- ✅ すべての主要な表示箇所で修正済み
- ✅ リンターエラーなし

## 注意事項
`lib/advanced-gogyo.ts`の`calculateGogyo`関数は、`dominantElement`と`weakElement`を計算していますが、これは参考値として残しています。実際のアドバイス生成時には、グラフの実際の値（`gogyoResult.elements`）から直接計算するように統一しました。

これにより、グラフの表示とアドバイスが常に一致するようになりました。

