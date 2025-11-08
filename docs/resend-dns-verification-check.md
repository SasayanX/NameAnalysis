# Resend DNS認証の確認方法

## DNS伝播の待機時間

DNSレコードの変更が反映されるまで：
- **最短**: 数分
- **通常**: 30分〜2時間
- **最大**: 48時間（ただし、通常は数時間以内）

## 確認方法

### 1. DNS伝播チェックツールを使用（推奨）

#### オンラインツール

1. **DNS Checker** (https://dnschecker.org/)
   - ドメイン名: `seimei.app`
   - レコードタイプ: `TXT` または `MX`
   - グローバルに反映されているか確認

2. **MXToolbox** (https://mxtoolbox.com/)
   - ドメイン名を入力
   - 各種DNSレコードを確認

#### 使用方法

1. Resendダッシュボードで設定したDNSレコードを確認
   - 例: `v=spf1 include:resend.com ~all` (SPFレコード)
   - 例: `default._domainkey.seimei.app` (DKIMレコード)

2. DNS Checkerで確認
   - ホスト名を入力（例: `seimei.app`）
   - レコードタイプを選択（TXT、MX等）
   - 「Search」をクリック
   - グローバルのDNSサーバーに反映されているか確認

### 2. コマンドラインで確認

```bash
# SPFレコードの確認
nslookup -type=TXT seimei.app

# DKIMレコードの確認（例：default._domainkey）
nslookup -type=TXT default._domainkey.seimei.app

# すべてのTXTレコードを確認
nslookup -type=TXT seimei.app
```

### 3. Resendダッシュボードで確認

1. Resendダッシュボードにログイン
2. **Domains** → ドメイン名を選択
3. **Verification Status** を確認
   - ✅ **Verified**: 認証完了
   - ⏳ **Pending**: 認証待ち（DNS伝播を待っている）
   - ❌ **Failed**: 認証失敗（DNSレコードを再確認）

## 確認すべきDNSレコード

Resendが要求するDNSレコード：

### 1. SPFレコード
- **タイプ**: TXT
- **ホスト名**: `@` または `seimei.app`
- **値**: `v=spf1 include:resend.com ~all`

### 2. DKIMレコード（通常3つ）
- **タイプ**: TXT
- **ホスト名**: 
  - `default._domainkey.seimei.app`
  - `resend._domainkey.seimei.app`
  - （その他、Resendが指定するホスト名）
- **値**: Resendが提供する長い文字列

### 3. DMARCレコード（オプション）
- **タイプ**: TXT
- **ホスト名**: `_dmarc.seimei.app`
- **値**: `v=DMARC1; p=none; rua=mailto:your-email@example.com`

## トラブルシューティング

### 問題1: まだ反映されていない

**確認事項**:
1. DNSレコードが正しく設定されているか
2. 権威DNSサーバー（ムームードメイン）で設定しているか
3. レコードの値が完全にコピーされているか（一字一句正確に）

**解決方法**:
- もう少し待つ（最大24時間）
- DNSレコードを再確認
- ムームードメインのDNS設定画面で、レコードが正しく保存されているか確認

### 問題2: 一部のDNSサーバーにのみ反映されている

**状況**: DNS伝播が進行中

**対処**: 
- 通常は問題ありません。すべてのDNSサーバーに反映されるまで待ちます。
- 通常、数時間以内にすべてのDNSサーバーに反映されます。

### 問題3: Resendダッシュボードで「Failed」と表示される

**確認事項**:
1. DNSレコードの値が正確か
2. ホスト名が正しいか
3. レコードタイプが正しいか（TXT、MX等）

**解決方法**:
- Resendダッシュボードで表示されるDNSレコードを再確認
- ムームードメインのDNS設定を再確認
- レコードを削除して再追加

## 次のステップ

1. **DNS伝播を待つ**（30分〜2時間）
2. **DNS Checkerで確認**（https://dnschecker.org/）
3. **Resendダッシュボードで確認**（認証ステータス）
4. **認証完了後**: 環境変数を更新
   ```env
   RESEND_FROM_EMAIL=noreply@seimei.app
   CONTACT_EMAIL=kanaukiryu@gmail.com
   ```

## 参考リンク

- [DNS Checker](https://dnschecker.org/)
- [MXToolbox](https://mxtoolbox.com/)
- [Resend Domains](https://resend.com/domains)



