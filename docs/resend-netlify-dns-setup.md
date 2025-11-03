# Resend ドメイン認証の設定方法（簡単版）

## 📋 やること
Resendで`kanau-kiryu.com`を使えるようにするため、Netlifyに4つのDNSレコードを追加します。

## 🎯 手順（5分で完了）

### ステップ1: Netlifyにログイン
1. https://app.netlify.com/ にアクセス
2. ログイン

### ステップ2: DNS設定画面を開く
1. 左メニューから「**Domain settings**」をクリック
2. または「**Site settings**」→「**Domain management**」を開く
3. `kanau-kiryu.com`をクリック
4. 「**DNS records**」タブを開く

### ステップ3: 4つのレコードを追加

画面にある「**Add DNS record**」ボタンから、以下を1つずつ追加します。

---

#### レコード1: DKIM（一番重要！）
1. 「**Add DNS record**」をクリック
2. 入力欄を埋める：
   - **Type**: `TXT` を選択
   - **Hostname**: `resend._domainkey` と入力
   - **Value**: 以下の長い文字列をコピペ（改行なし）
     ```
     p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCkred69U+aUi84A4i2fgxOKZ80Nlw+YwFnkvNfE8nimfpACnc9UuUow228mlu643Xo0OAiw3vl5TN2W6d89qY//SHKL4o0LOQlwv9dGCaKlBwgI4fiEanGG30LoGRraA5cwhGV7PsGaIvIttm/7iQ1Fuhxim/6qGjggBaY1z2e7wIDAQAB
     ```
3. 「**Add record**」をクリック

---

#### レコード2: SPF
1. 「**Add DNS record**」をクリック
2. 入力欄を埋める：
   - **Type**: `TXT` を選択
   - **Hostname**: `send` と入力
   - **Value**: `v=spf1 include:amazonses.com ~all` と入力
3. 「**Add record**」をクリック

---

#### レコード3: DMARC（任意）
1. 「**Add DNS record**」をクリック
2. 入力欄を埋める：
   - **Type**: `TXT` を選択
   - **Hostname**: `_dmarc` と入力
   - **Value**: `v=DMARC1; p=none;` と入力
3. 「**Add record**」をクリック

---

#### レコード4: MX
1. 「**Add DNS record**」をクリック
2. 入力欄を埋める：
   - **Type**: `MX` を選択
   - **Hostname**: `send` と入力
   - **Value**: `feedback-smtp.ap-northeast-1.amazonses.com` と入力
   - **Priority**: `10` と入力
3. 「**Add record**」をクリック

---

## ✅ 設定後の確認

### 確認方法1: Resendダッシュボード
1. Resendにログイン（https://resend.com/domains）
2. `kanau-kiryu.com`を開く
3. 4つのレコードがすべて✅（緑色のチェック）になればOK
4. もし❌（赤）のままなら、**数時間待つ**（DNS伝播に時間がかかります）

### 確認方法2: オンラインツール（簡単）
ブラウザで以下を開いて確認：
- https://www.whatsmydns.net/#TXT/resend._domainkey.kanau-kiryu.com
- 世界中のDNSサーバーでレコードが見つかればOK

## ⏰ 時間がかかる場合

- **通常**: 数分〜1時間
- **遅い場合**: 最大24時間
- **48時間経っても認証されない**: 設定ミスの可能性があります

## ❌ うまくいかない場合

### チェックリスト
- [ ] 4つすべてのレコードを追加したか？
- [ ] Hostname（ホスト名）を正しく入力したか？（特に`resend._domainkey`にスペースがないか）
- [ ] Value（値）を正確にコピペしたか？（特にDKIMは長いので間違いやすい）
- [ ] 24時間以上待ったか？

### よくある間違い
1. **Hostnameに`.kanau-kiryu.com`を付けない**
   - ✅ 正しい: `resend._domainkey`
   - ❌ 間違い: `resend._domainkey.kanau-kiryu.com`
2. **DKIMの値に改行が入っている**
   - 1行でコピペしてください

## 📞 それでもダメな場合
Resendのサポートに連絡してください。

---

**完成！** 4つのレコードがすべて✅になれば、メール送信が使えるようになります。
