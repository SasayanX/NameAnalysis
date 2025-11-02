# モバイルでプレミアムモードを強制する方法（スクリーンショット用）

Google Playのスクリーンショット撮影用に、モバイルブラウザでプレミアムモードを強制する方法です。

## 方法1: ブラウザの開発者ツールを使用（推奨）

### Chrome/Edge（Android）

1. アプリをモバイルブラウザで開く
2. 右上のメニュー（3点リーダー）→ **開発者向けオプションを表示**
3. 開発者ツールを有効化
4. **JavaScriptコンソール**を開く
5. 以下を実行：

```javascript
// プレミアムプランを強制設定
localStorage.setItem('userSubscription', JSON.stringify({
  plan: 'premium',
  isActive: true,
  expiresAt: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
  status: 'active',
  paymentMethod: 'square',
  amount: 550,
  nextBillingDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
  lastPaymentDate: new Date().toISOString()
}));

// ページをリロード
location.reload();
```

### Safari（iOS）

1. **設定** → **Safari** → **詳細** → **Webインスペクタ** を有効化
2. MacのSafariで **開発** → **[デバイス名]** → **[ページ名]** を選択
3. JavaScriptコンソールで上記のコードを実行

## 方法2: URLパラメータを使用（実装済み）

スクリーンショット撮影を簡単にするため、URLパラメータでプレミアムモードを有効化できる機能を実装しました。

### 使い方

**プレミアムモードを有効化:**
```
https://seimei.app/?premium=true
または
https://seimei.app/?plan=premium
```

**ベーシックモード:**
```
https://seimei.app/?plan=basic
```

**無料モードに戻す:**
```
https://seimei.app/?plan=free
```

URLを開くと自動的にプランが切り替わり、ページがリロードされます。

## 方法3: 開発環境での設定

開発サーバーで実行している場合：

```bash
# 開発モードで起動
NODE_ENV=development npm run dev
```

開発環境では `debugSwitchPlan('premium')` が使用可能です。

## 確認方法

ページをリロード後、以下を確認：

1. ヘッダーに「プレミアムプラン」と表示される
2. プレミアム機能（運気運行表、六星占術詳細など）が使用可能
3. 使用制限が解除されている

## 注意事項

- この設定はローカルストレージに保存されます
- ブラウザのデータを削除するとリセットされます
- 本番環境でも動作しますが、実際の決済は行われません

