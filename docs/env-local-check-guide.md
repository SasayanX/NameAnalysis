# .env.local 設定確認ガイド

## ✅ 必須設定項目（Square Sandbox環境）

`.env.local` ファイルに以下の設定が**すべて**含まれているか確認してください：

```env
# Square Sandbox環境（必須）
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw
SQUARE_ACCESS_TOKEN=EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe
SQUARE_LOCATION_ID=LYGVDVHKBNYZC

# フロントエンド用（必須）
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw
NEXT_PUBLIC_SQUARE_LOCATION_ID=LYGVDVHKBNYZC
```

## 🔍 確認チェックリスト

### 1. ファイルの存在確認
- [ ] `.env.local` ファイルがプロジェクトルート（`package.json`と同じ階層）に存在する

### 2. 環境変数名の確認
- [ ] `SQUARE_ENVIRONMENT` （大文字小文字を正確に）
- [ ] `SQUARE_APPLICATION_ID` （`APPLICATION` は単数形）
- [ ] `SQUARE_ACCESS_TOKEN` （`ACCESS` は大文字）
- [ ] `SQUARE_LOCATION_ID` （`LOCATION` は大文字）
- [ ] `NEXT_PUBLIC_SQUARE_APPLICATION_ID` （`NEXT_PUBLIC_` プレフィックス必須）
- [ ] `NEXT_PUBLIC_SQUARE_LOCATION_ID` （`NEXT_PUBLIC_` プレフィックス必須）

### 3. 値の確認
- [ ] `SQUARE_ENVIRONMENT=sandbox` （`sandbox` は小文字）
- [ ] `SQUARE_APPLICATION_ID` の値が `sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw` と完全に一致
- [ ] `SQUARE_ACCESS_TOKEN` の値が `EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe` と完全に一致
- [ ] `SQUARE_LOCATION_ID` の値が `LYGVDVHKBNYZC` と完全に一致
- [ ] `NEXT_PUBLIC_SQUARE_APPLICATION_ID` の値が `sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw` と完全に一致
- [ ] `NEXT_PUBLIC_SQUARE_LOCATION_ID` の値が `LYGVDVHKBNYZC` と完全に一致

### 4. フォーマットの確認
- [ ] 各行に `=` が1つだけ含まれている
- [ ] `=` の前後に不要なスペースがない
- [ ] 値に引用符（`"` や `'`）が含まれていない
- [ ] 行末に不要なスペースがない
- [ ] コメント行（`#` で始まる行）以外に空行がない

## ⚠️ よくある間違い

### ❌ 間違った例

```env
# 間違い1: 環境変数名のタイポ
SQUARE_ENV=sandbox  # SQUARE_ENVIRONMENT が正しい

# 間違い2: 値に余分なスペース
SQUARE_ENVIRONMENT = sandbox  # = の前後にスペースがある

# 間違い3: 値に引用符が含まれている
SQUARE_ACCESS_TOKEN="EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe"

# 間違い4: 値が不完全
SQUARE_ACCESS_TOKEN=EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUX  # 末尾が切れている

# 間違い5: フロントエンド用のプレフィックスがない
SQUARE_APPLICATION_ID=sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw  # NEXT_PUBLIC_ が必要
```

### ✅ 正しい例

```env
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw
SQUARE_ACCESS_TOKEN=EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe
SQUARE_LOCATION_ID=LYGVDVHKBNYZC
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw
NEXT_PUBLIC_SQUARE_LOCATION_ID=LYGVDVHKBNYZC
```

## 🛠️ 設定手順

1. プロジェクトルートに `.env.local` ファイルを作成
2. 上記の正しい設定をコピー&ペースト
3. ファイルを保存
4. **開発サーバーを再起動**（重要！）

## 🔍 設定確認方法

### 方法1: ターミナルで確認

開発サーバーを起動した後、決済ボタンをクリックして、ターミナルに以下のログが表示されるか確認：

```
[Square Config] SQUARE_ENVIRONMENT: sandbox
[Square Config] SQUARE_ACCESS_TOKEN exists: true
[Square Config] SQUARE_APPLICATION_ID: exists
[Square Config] SQUARE_LOCATION_ID: exists
[Square Config] Using sandbox config (explicit)
```

### 方法2: ファイル内容を直接確認

`.env.local` ファイルを開いて、上記のチェックリストと照合してください。

## 🆘 まだエラーが出る場合

1. **ファイル名を確認**: `.env.local` （先頭にドット、拡張子は `.local`）
2. **ファイルの場所を確認**: `package.json` と同じ階層
3. **開発サーバーを完全に再起動**: `Ctrl+C` で停止 → `npm run dev` で再起動
4. **ファイルの文字エンコーディング**: UTF-8 で保存されているか確認
5. **ターミナルのログを確認**: どの環境変数が読み込まれているか確認



