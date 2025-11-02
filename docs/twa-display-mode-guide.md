# TWA Display Mode 選択ガイド

## Display Mode とは

PWA（Progressive Web App）がAndroidアプリとして起動された際の表示モードを指定します。

## 推奨設定

**`standalone`** を選択してください。

これは、ブラウザのアドレスバーやツールバーを非表示にし、ネイティブアプリのような体験を提供します。

## 利用可能なオプション

1. **standalone** ✅ **推奨**
   - ブラウザのUI（アドレスバー、ツールバー）を非表示
   - ネイティブアプリのような体験
   - TWAで最も一般的

2. **fullscreen**
   - システムUIも含めてすべてを全画面表示
   - 通常はゲームアプリなどで使用

3. **minimal-ui**
   - 最小限のブラウザUIを表示
   - アドレスバーは非表示だが、戻るボタンなどは表示

## 現在の設定

`twa-manifest.json`では以下のように設定されています：

```json
{
  "display": "standalone"
}
```

## 対話形式での入力

`bubblewrap init`の実行中に「Display mode」を聞かれた場合：

**`standalone`** と入力してEnter

---

**注意**: 表示モードの質問が表示されない場合もありますが、その場合は後で`twa-manifest.json`で設定できます。

