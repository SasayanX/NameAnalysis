# Netlify環境変数サイズ制限エラーの対処

## 問題

Netlifyのデプロイ時に以下のエラーが発生：

```
Failed to create function: invalid parameter for function creation: 
Your environment variables exceed the 4KB limit imposed by AWS Lambda
```

## 原因

Netlify Functionsは環境変数の総サイズが**4KB（4096バイト）**を超えると、関数をデプロイできません。

大きなJSON値（例：Firebase Service Account Key）が環境変数に含まれていると、この制限を簡単に超えてしまいます。

---

## 対処方法

### **方法1: Firebase Service Account Keyをファイルパスに変更（推奨）**

#### 現在の問題

以下の環境変数が非常に大きい可能性があります：

- `FIREBASE_SERVICE_ACCOUNT_KEY_JSON` - Firebase Service Account KeyのJSON全体（約2-3KB）
- `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON` - Google Play Service Account KeyのJSON全体（約2-3KB）

#### 解決策

JSONの内容を直接環境変数に入れるのではなく、**ファイルパスを使用**します。

##### ステップ1: Netlifyに環境変数を追加（ファイルパスのみ）

**削除する環境変数:**
- `FIREBASE_SERVICE_ACCOUNT_KEY_JSON`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON`

**追加する環境変数:**
```
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/opt/build/repo/secret/firebase-key.json
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH=/opt/build/repo/secret/google-play-key.json
```

##### ステップ2: ビルド時にファイルを作成

Netlifyのビルド設定で、環境変数からファイルを作成します。

`netlify.toml` に追加：

```toml
[build]
  command = """
    mkdir -p secret && \
    echo "$FIREBASE_SERVICE_ACCOUNT_KEY_BASE64" | base64 -d > secret/firebase-key.json && \
    echo "$GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_BASE64" | base64 -d > secret/google-play-key.json && \
    npm run build
  """
```

そして、Netlifyに以下の環境変数を追加（Base64エンコード済み）：

```
FIREBASE_SERVICE_ACCOUNT_KEY_BASE64=<Base64エンコード済みJSON>
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_BASE64=<Base64エンコード済みJSON>
```

**Base64エンコード方法:**

```bash
# Linuxまたはmacで
cat firebase-key.json | base64 -w 0

# Windowsで（PowerShell）
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("firebase-key.json"))
```

---

### **方法2: 使用していない環境変数を削除**

Netlifyの環境変数リストを確認し、使用していない変数を削除します。

#### 確認すべき環境変数

以下の環境変数が設定されているか確認し、**不要なものを削除**：

- `EMAIL_PASS` - メール送信に使用（必要な場合のみ）
- `EMAIL_USER` - メール送信に使用（必要な場合のみ）
- `SQUARE_WEBHOOK_SIGNATURE_KEY` - Square Webhook検証に使用（必要）
- その他、使用していない環境変数

---

### **方法3: 環境変数を外部シークレットストアに移動**

長期的な解決策として、大きなシークレットを外部ストアに保存します。

#### オプション

1. **AWS Secrets Manager**
2. **HashiCorp Vault**
3. **Google Secret Manager**

ランタイムで取得するようにコードを変更します。

---

## チェックスクリプトの使用

`scripts/check-env-size.js` を実行して、どの環境変数が大きいか確認できます：

```bash
node scripts/check-env-size.js
```

出力例：

```
============================================================
環境変数サイズチェック
============================================================
総合計: 4532 バイト (制限: 4096 バイト)

大きい環境変数 TOP 10:
------------------------------------------------------------
1. FIREBASE_SERVICE_ACCOUNT_KEY_JSON
   サイズ: 2340 バイト (値の長さ: 2340 文字)
2. GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON
   サイズ: 2100 バイト (値の長さ: 2100 文字)
3. GOOGLE_GENERATIVE_AI_API_KEY
   サイズ: 92 バイト (値の長さ: 92 文字)
...
```

---

## 推奨される対処の優先順位

### **最優先（すぐに実行）**

1. ✅ **FIREBASE_SERVICE_ACCOUNT_KEY_JSON を削除**
   - 代わりに `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` を使用
   - ファイルは既に `secret/mainichi-ai-seimei-firebase-adminsdk-fbsvc-9c97ba7d7f.json` に配置済み

2. ✅ **GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON を削除**
   - 代わりに `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH` を使用

### **中期**

3. 使用していない環境変数を削除

### **長期**

4. 大きなシークレットを外部ストアに移動

---

## 実装済みのコード

既に以下のコードでファイルパスをサポートしています：

### Firebase

```typescript
// lib/firestore-client.ts
const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH
const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON

if (serviceAccountKeyPath) {
  // ファイルから読み込み（推奨）
  const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountKeyPath, 'utf8'))
  credential = admin.credential.cert(serviceAccountKey)
} else if (serviceAccountKeyJson) {
  // JSON文字列から読み込み（非推奨・大きい）
  const serviceAccountKey = JSON.parse(serviceAccountKeyJson)
  credential = admin.credential.cert(serviceAccountKey)
}
```

### Google Play

```typescript
// app/api/verify-google-play-purchase/route.ts
async function getGoogleAuth() {
  const keyPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH
  const keyJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON

  if (keyPath) {
    // ファイルから読み込み（推奨）
    return new GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    })
  } else if (keyJson) {
    // JSON文字列から読み込み（非推奨・大きい）
    const credentials = JSON.parse(keyJson)
    return new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    })
  }
}
```

---

## 次のステップ

1. Netlify Dashboard → Site settings → Environment variables
2. `FIREBASE_SERVICE_ACCOUNT_KEY_JSON` を削除
3. `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON` を削除
4. 既に `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` と `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH` が設定されているか確認
5. 設定されていない場合は追加：
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=secret/mainichi-ai-seimei-firebase-adminsdk-fbsvc-9c97ba7d7f.json
   ```
6. 再デプロイ

---

## トラブルシューティング

### Q: ファイルが見つからない

**A:** Netlifyのビルドディレクトリは `/opt/build/repo/` です。ファイルパスは絶対パスまたは相対パスで指定できます。

相対パスの場合：
```
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=secret/firebase-key.json
```

絶対パスの場合：
```
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/opt/build/repo/secret/firebase-key.json
```

### Q: まだエラーが出る

**A:** `node scripts/check-env-size.js` を実行して、他に大きな環境変数がないか確認してください。

