# Square Sandbox環境の設定手順

## 問題: 401 Unauthorized エラー

`api/square-customers/create` が 401 エラーを返す場合、環境変数が正しく設定されていない可能性があります。

## ✅ 解決方法

### 1. `.env.local` ファイルを確認

プロジェクトルートに `.env.local` ファイルがあることを確認してください。

### 2. 以下の設定を追加/確認

```env
# Square Sandbox環境（必須）
SQUARE_ENVIRONMENT=sandbox
SQUARE_ACCESS_TOKEN=EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe
SQUARE_LOCATION_ID=LYGVDVHKBNYZC

# フロントエンド用（必須）
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw
NEXT_PUBLIC_SQUARE_LOCATION_ID=LYGVDVHKBNYZC
```

### 3. 開発サーバーを再起動

環境変数を変更した後は、**必ず開発サーバーを再起動**してください。

```bash
# サーバーを停止（Ctrl+C）
# その後、再起動
npm run dev
```

## 🔍 デバッグ方法

### ブラウザのコンソールで確認

決済ボタンをクリックした後、ブラウザのコンソールに以下のログが表示されます：

```
[Square Config] SQUARE_ENVIRONMENT: sandbox
[Square Config] Using sandbox config (explicit)
[Square Customers API] Environment: sandbox
[Square Customers API] Access Token (first 10 chars): EAAAl-F3w...
```

### サーバー側のログで確認

ターミナル（開発サーバーを実行している場所）に以下のログが表示されます：

```
[Square Config] SQUARE_ENVIRONMENT: sandbox
[Square Config] NODE_ENV: development
[Square Config] SQUARE_ACCESS_TOKEN exists: true
[Square Config] Using sandbox config (explicit)
```

## ⚠️ よくある間違い

1. **`.env.local` が `.gitignore` に含まれている**
   - これは正常です。`.env.local` は Git にコミットされません。

2. **環境変数名のタイポ**
   - `SQUARE_ENVIRONMENT` （正しい）
   - `SQUARE_ENV` （間違い）

3. **値に余分なスペース**
   - `SQUARE_ENVIRONMENT=sandbox ` （間違い：末尾にスペース）
   - `SQUARE_ENVIRONMENT=sandbox` （正しい）

4. **開発サーバーの再起動を忘れた**
   - 環境変数を変更した後は必ず再起動が必要です。

## 📝 設定確認チェックリスト

- [ ] `.env.local` ファイルがプロジェクトルートに存在する
- [ ] `SQUARE_ENVIRONMENT=sandbox` が設定されている
- [ ] `SQUARE_ACCESS_TOKEN` が設定されている（値が正しい）
- [ ] `SQUARE_LOCATION_ID` が設定されている
- [ ] `NEXT_PUBLIC_SQUARE_APPLICATION_ID` が設定されている
- [ ] `NEXT_PUBLIC_SQUARE_LOCATION_ID` が設定されている
- [ ] 開発サーバーを再起動した

## 🆘 まだエラーが出る場合

1. **ブラウザのコンソールとターミナルのログを確認**
   - どの設定が使われているか確認

2. **`.env.local` の内容を再確認**
   - コピー&ペーストで設定値を確認

3. **開発サーバーを完全に再起動**
   - ターミナルで `Ctrl+C` で停止
   - `npm run dev` で再起動

4. **ブラウザのキャッシュをクリア**
   - `Ctrl+Shift+R` (Windows/Linux)
   - `Cmd+Shift+R` (Mac)



