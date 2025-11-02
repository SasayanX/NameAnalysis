# TWA Orientation（画面の向き）選択ガイド

## Orientation とは

アプリが起動された際の画面の向き（縦向き/横向き）を指定します。

## 推奨設定

**`portrait`** を選択してください。

姓名判断アプリは縦向きでの使用が最適です。

## 利用可能なオプション

1. **portrait** ✅ **推奨**
   - 縦向き固定
   - 姓名判断アプリに最適
   - スマートフォンの一般的な使用方法

2. **landscape**
   - 横向き固定
   - 通常はゲームやビデオプレイヤーで使用

3. **any**
   - 縦横どちらでもOK
   - ユーザーが自由に回転可能

4. **natural**
   - デバイスのデフォルトの向きを使用

## 現在の設定

`app/manifest.ts`では以下のように設定されています：

```typescript
orientation: "portrait"
```

## 対話形式での入力

`bubblewrap init`の実行中に「Orientation」を聞かれた場合：

**`portrait`** と入力してEnter

---

**注意**: 画面の向きは後で`twa-manifest.json`で変更できますが、姓名判断アプリの場合は`portrait`（縦向き）が最適です。

