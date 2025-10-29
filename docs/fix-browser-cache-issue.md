# ブラウザキャッシュ問題の解決方法

## 問題
Viteのリソース（`@vite/client`、`@react-refresh`、`src/main.tsx`）が404エラーになる

## 原因
古いViteアプリのService Workerやキャッシュが残っている

## 解決方法

### 方法1: ブラウザのDevToolsでService Workerをアン登録

1. **Chrome DevToolsを開く** (F12)
2. **Applicationタブ**を開く
3. **Service Workers**セクションを開く
4. 登録されているService Workerがある場合：
   - **Unregister**ボタンをクリック
5. **Clear storage**セクションで：
   - **Clear site data**をクリック
6. ページを**ハードリロード** (Ctrl+Shift+R または Cmd+Shift+R)

### 方法2: ブラウザのキャッシュを完全にクリア

1. **設定** → **プライバシーとセキュリティ** → **閲覧履歴データの削除**
2. **キャッシュされた画像とファイル**にチェック
3. **データを削除**をクリック
4. `localhost:3000`を再度開く

### 方法3: シークレットモードで確認

1. **シークレットウィンドウ**を開く
2. `http://localhost:3000`にアクセス
3. 正常に動作するか確認

## 開発時の一時的な対処

開発中は、Service Workerを一時的に無効化することもできます：

```typescript
// app/layout.tsx やコンポーネントで
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister()
    })
  })
}
```


