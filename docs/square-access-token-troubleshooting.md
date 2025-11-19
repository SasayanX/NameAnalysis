# Square Access Token 401エラー トラブルシューティング

## 🔴 問題: 401 Unauthorized エラー

```
{
  "category": "AUTHENTICATION_ERROR",
  "code": "UNAUTHORIZED",
  "detail": "This request could not be authorized."
}
```

## 🔍 原因と解決方法

### 1. Access Tokenが無効になっている

**最も可能性が高い原因**

#### 確認方法
1. [Square Developer Dashboard](https://developer.squareup.com/apps) にログイン
2. 右上の「Sandbox」スイッチが**ON**になっているか確認
3. アプリを選択
4. 「Credentials」タブを開く
5. 「Sandbox」セクションの「Access Token」を確認

#### 解決方法
1. 「Access Token」の横にある「Show」をクリック
2. 必要に応じて「Regenerate」をクリックして新しいトークンを生成
3. 新しいAccess Tokenをコピー
4. `.env.local` に設定：
   ```env
   SQUARE_ACCESS_TOKEN=新しいAccess Tokenをここに貼り付け
   ```
5. 開発サーバーを再起動

### 2. 環境の不一致

**Sandbox環境とProduction環境で異なるAccess Tokenを使用する必要があります**

#### 確認事項
- Square Developer Dashboardで「Sandbox」スイッチがONになっているか
- Access Tokenが「Sandbox」セクションのものか（「Production」セクションのものではないか）

### 3. Access Tokenの形式が間違っている

#### 確認事項
- Access Tokenに余分なスペースや改行が含まれていないか
- Access Tokenが完全にコピーされているか（途中で切れていないか）

#### 正しい形式
```env
SQUARE_ACCESS_TOKEN=EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe
```

#### 間違った形式
```env
# 間違い1: 引用符で囲んでいる
SQUARE_ACCESS_TOKEN="EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe"

# 間違い2: 余分なスペース
SQUARE_ACCESS_TOKEN = EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe

# 間違い3: 途中で切れている
SQUARE_ACCESS_TOKEN=EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgU
```

### 4. APIエンドポイントの問題

**注意**: Square APIは通常、Sandbox環境とProduction環境で同じエンドポイント（`https://connect.squareup.com`）を使用します。Access Tokenで環境を区別します。

ただし、一部の古いドキュメントでは、Sandbox環境用の別のエンドポイント（`https://connect.squareupsandbox.com`）が言及されることがありますが、現在は使用されていません。

## ✅ 解決手順（推奨）

### ステップ1: Square Developer DashboardでAccess Tokenを再生成

1. [Square Developer Dashboard](https://developer.squareup.com/apps) にログイン
2. 右上の「Sandbox」スイッチが**ON**になっているか確認
3. アプリを選択
4. 「Credentials」タブを開く
5. 「Sandbox」セクションの「Access Token」の横にある「Regenerate」をクリック
6. 新しいAccess Tokenをコピー

### ステップ2: .env.localを更新

```env
SQUARE_ENVIRONMENT=sandbox
SQUARE_ACCESS_TOKEN=新しいAccess Tokenをここに貼り付け
SQUARE_APPLICATION_ID=sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw
SQUARE_LOCATION_ID=LYGVDVHKBNYZC
```

### ステップ3: 開発サーバーを再起動

```bash
# Ctrl+C で停止
npm run dev
```

### ステップ4: テスト

```
http://localhost:3000/api/test-square-api
```

成功した場合：
```json
{
  "success": true,
  "message": "Square API接続成功",
  "status": 200
}
```

## 🆘 まだエラーが出る場合

1. **Square Developer Dashboardでアプリの状態を確認**
   - アプリが有効になっているか
   - 必要な権限が付与されているか

2. **Squareサポートに問い合わせ**
   - [Square Developer Support](https://developer.squareup.com/docs/build-basics/using-rest-apis#support)

3. **別のアプリでテスト**
   - 新しいSquareアプリを作成して、新しいAccess Tokenを取得

## 📝 参考

- [Square API Authentication](https://developer.squareup.com/docs/build-basics/using-rest-apis#authentication)
- [Square Developer Dashboard](https://developer.squareup.com/apps)



