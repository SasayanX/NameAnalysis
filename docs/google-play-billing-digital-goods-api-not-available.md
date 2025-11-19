# Google Play Billing - Digital Goods API not available エラー

## エラーメッセージ

```
[Google Play Billing] Digital Goods API not available after retries
[Google Play Billing] Not available (Web版またはTWA未対応環境)
```

## 原因

Digital Goods APIがTWAアプリ内で利用できない状態です。考えられる原因：

### 1. AABに`playBilling`機能が含まれていない ⭐ 最も可能性が高い

**確認方法**:
```bash
cd twa
bubblewrap fingerprint
```

`twa-manifest.json`の`features.playBilling`が`true`であることを確認：

```json
{
  "features": {
    "playBilling": {
      "enabled": true
    }
  }
}
```

**解決方法**:
1. `twa-manifest.json`で`playBilling`機能を有効化
2. AABを再ビルド：
   ```bash
   cd twa
   bubblewrap build
   ```
3. 最新のAABをGoogle Play Consoleにアップロード

### 2. 古いAABがインストールされている

**確認方法**:
1. Google Play Console → **テスト** → **内部テスト**
2. アップロードしたAABのバージョンコードを確認
3. 最新のAAB（バージョンコード13）がアップロードされているか確認

**解決方法**:
1. 最新のAABを再アップロード
2. 内部テストトラックでリリース
3. TWAアプリを再インストール

### 3. TWAアプリが正しくインストールされていない

**確認方法**:
1. AndroidデバイスでTWAアプリをアンインストール
2. 内部テストトラックから再インストール

**解決方法**:
1. TWAアプリを完全にアンインストール
2. Google Play Consoleの内部テストトラックから再インストール

### 4. WebViewデバッグが有効化されていない

**確認方法**:
1. **設定** → **開発者向けオプション**
2. **WebViewのデバッグを有効にする**がオンになっているか確認

**解決方法**:
1. **設定** → **開発者向けオプション**
2. **WebViewのデバッグを有効にする**をオンにする

### 5. TWA環境と判定されていない

**確認方法**:
Chrome DevToolsのConsoleタブで以下を実行：

```javascript
// TWA環境かどうか確認
console.log('TWA環境:', window.matchMedia('(display-mode: standalone)').matches)

// Digital Goods APIが利用可能か確認
console.log('Digital Goods API:', typeof window.getDigitalGoodsService !== 'undefined')

// User Agentを確認
console.log('User Agent:', navigator.userAgent)
```

**解決方法**:
- TWAアプリ内でアクセスしていることを確認
- 通常のブラウザではなく、TWAアプリ内でアクセス

## デバッグ手順

### ステップ1: コンソールログを確認

Chrome DevToolsのConsoleタブで、以下のログが表示されるか確認：

```
[Google Play Billing] Initialization attempt: {
  isTWA: true/false,
  hasDigitalGoodsAPI: true/false,
  userAgent: "...",
  displayMode: true/false,
  retryAttempts: 5
}
```

### ステップ2: AABのバージョンを確認

1. Google Play Console → **テスト** → **内部テスト**
2. アップロードしたAABのバージョンコードを確認
3. 最新のAABがアップロードされているか確認

### ステップ3: playBilling機能を確認

```bash
cd twa
bubblewrap fingerprint
```

`twa-manifest.json`の`features.playBilling`が`true`であることを確認。

### ステップ4: TWAアプリを再インストール

1. TWAアプリを完全にアンインストール
2. Google Play Consoleの内部テストトラックから再インストール

## よくある原因と解決方法

### 原因1: AABにplayBilling機能が含まれていない

**解決方法**:
1. `twa-manifest.json`で`playBilling`機能を有効化
2. AABを再ビルド
3. 最新のAABをアップロード

### 原因2: 古いAABがインストールされている

**解決方法**:
1. 最新のAABを再アップロード
2. TWAアプリを再インストール

### 原因3: TWA環境と判定されていない

**解決方法**:
1. TWAアプリ内でアクセスしていることを確認
2. 通常のブラウザではなく、TWAアプリ内でアクセス

## 次のステップ

1. **AABのバージョンを確認** - 最新のAABがアップロードされているか確認
2. **playBilling機能を確認** - `twa-manifest.json`で有効化されているか確認
3. **TWAアプリを再インストール** - 最新のAABをインストール
4. **コンソールログを確認** - デバッグ情報を確認

問題が続く場合は、コンソールのデバッグ情報を共有してください。


