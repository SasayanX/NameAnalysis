# Square Sandbox環境の認証情報

## ✅ 確認済みの認証情報

### Application ID
```
sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw
```

### Access Token
```
EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe
```

## 📝 設定方法

### `.env.local` に設定

```env
# Square Sandbox環境
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw
SQUARE_ACCESS_TOKEN=EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe
SQUARE_LOCATION_ID=LYGVDVHKBNYZC  # ✅ Sandbox Location ID

# フロントエンド用
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw
NEXT_PUBLIC_SQUARE_LOCATION_ID=LYGVDVHKBNYZC  # ✅ Sandbox Location ID
```

## ✅ すべての認証情報が揃いました

### Location ID
```
LYGVDVHKBNYZC
```

## 🧪 テスト方法

1. `.env.local` に上記の設定を追加
2. 開発サーバーを再起動
3. `/pricing` ページにアクセス
4. プランを選択して決済をテスト

## ⚠️ 注意事項

- Sandbox環境では実際の課金は発生しません
- テストカード: `4111 1111 1111 1111`
- これらの認証情報はSandbox環境専用です

