# Resend ドメイン認証 - Netlify設定ガイド

## 問題の概要

Resendのドメイン認証がNetlifyで完了しない場合の対処方法です。

## 重要なポイント

### 1. ドメイン管理の場所を確認

**seimei.app**のドメインがどこで管理されているかを確認してください：

- **Netlifyで管理している場合**: NetlifyのDNS設定から追加
- **外部DNSプロバイダー（例：お名前.com、ムームードメイン等）で管理している場合**: **外部DNSプロバイダー**で設定する必要があります

⚠️ **注意**: Netlifyでホスティングしていても、ドメインが外部DNSプロバイダーで管理されている場合は、**NetlifyのDNS設定ではなく、外部DNSプロバイダーで設定**する必要があります。

## Netlifyでドメイン管理している場合

### 手順

1. **Netlify Dashboardにログイン**
   - https://app.netlify.com/

2. **ドメイン設定を開く**
   - サイトを選択 → **Domain settings** → **DNS configuration**

3. **ResendのDNSレコードを追加**
   - Resendダッシュボードで表示される以下のレコードを追加：
     - **SPFレコード** (TXT)
     - **DKIMレコード** (TXT、通常3つ)
     - **DMARCレコード** (TXT、オプション)

4. **レコードの追加方法**
   - 「Add DNS record」をクリック
   - タイプを選択（TXT、MX等）
   - **Name**: Resendが指定するホスト名（例：`_resend`、`default._domainkey`等）
   - **Value**: Resendが提供する値（**完全にコピー**）
   - TTLはデフォルト（3600）でOK

### よくある間違い

❌ **間違い**: 値の一部だけをコピーしてしまう
✅ **正しい**: 値全体を完全にコピー（引用符やスペースも含む）

❌ **間違い**: ホスト名を省略する（`_resend.seimei.app`ではなく`_resend`だけ）
✅ **正しい**: Resendが指定するホスト名をそのまま使用

## 外部DNSプロバイダーでドメイン管理している場合

### 手順

1. **ドメインの管理画面にログイン**
   - お名前.com、ムームードメイン、Route53等の管理画面

2. **DNS設定を開く**
   - ドメイン管理 → DNS設定/DNSレコード設定

3. **ResendのDNSレコードを追加**
   - Netlifyと同様に、Resendが提供するレコードを追加

4. **NetlifyのDNS設定は変更しない**
   - 外部DNSで管理している場合、NetlifyのDNS設定は使用されません

## DNSレコードの伝播確認

### 確認方法

1. **DNS伝播チェックツールを使用**
   - https://dnschecker.org/
   - `seimei.app`を入力
   - 設定したレコードタイプ（TXT、MX等）を選択
   - グローバルに反映されているか確認

2. **コマンドラインで確認**
   ```bash
   # SPFレコードの確認
   nslookup -type=TXT seimei.app
   
   # DKIMレコードの確認（例：default._domainkey）
   nslookup -type=TXT default._domainkey.seimei.app
   ```

### 伝播時間

- **通常**: 数分〜数時間
- **最大**: 48時間（ただし、通常は数時間以内）

## トラブルシューティング

### 問題1: レコードが反映されない

**確認事項**:
1. レコードの値が完全にコピーされているか
2. ホスト名が正しいか（`_resend`、`default._domainkey`等）
3. レコードタイプが正しいか（TXT、MX等）
4. 既存のレコードと競合していないか

**解決方法**:
- Resendのダッシュボードで表示されるレコードを**一字一句正確に**コピー
- 値の前後に余分なスペースや引用符がないか確認

### 問題2: ドメイン認証が失敗し続ける

**確認事項**:
1. **ドメイン管理の場所を再確認**
   - Netlifyで管理しているか、外部DNSプロバイダーで管理しているか
   - 外部DNSで管理している場合、NetlifyのDNS設定は無視されます

2. **DNS伝播が完了しているか**
   - DNSチェッカーツールで確認
   - すべてのDNSサーバーに反映されているか確認

**解決方法**:
- ドメイン管理の場所を正しく特定
- 管理しているDNSプロバイダーで設定
- 24時間待ってから再確認

### 問題3: 既存のレコードと競合

**確認事項**:
- 既存のSPFレコードがある場合、新しい値と**統合**する必要がある
- 既存のDKIMレコードがある場合、追加で設定（通常は問題なし）

**解決方法（SPFレコードの場合）**:
```
# 既存のSPFレコード例
v=spf1 include:_spf.google.com ~all

# ResendのSPFレコードを追加
v=spf1 include:_spf.google.com include:resend.com ~all
```

## 当面の対応（ドメイン認証が完了していない場合）

現在のコードでは、ドメイン認証が完了していなくても動作するように実装されています：

- **自動フォールバック**: ドメイン認証エラーを検出すると、自動的に`onboarding@resend.dev`を使用
- **正常動作**: お問い合わせフォームは正常に動作します

### 環境変数の設定

```env
# RESEND_FROM_EMAILを設定しない（またはコメントアウト）
# RESEND_FROM_EMAIL=noreply@seimei.app

# これにより、自動的にonboarding@resend.devが使用されます
```

## Resendサポートへの問い合わせ

上記の手順を試しても解決しない場合：

1. **Resendのサポートに問い合わせ**
   - サポートページ: https://resend.com/support
   - エラーメッセージのスクリーンショット
   - 設定したDNSレコードの内容
   - ドメイン管理の場所（Netlify or 外部DNS）

2. **提供する情報**
   - ドメイン名: `seimei.app`
   - DNSプロバイダー: Netlify（または外部DNSプロバイダー名）
   - 設定したDNSレコードの詳細
   - エラーメッセージ

## 参考リンク

- [Resend DNS設定ドキュメント](https://resend.com/docs/dashboard/domains/introduction)
- [Netlify DNS設定ドキュメント](https://docs.netlify.com/domains-https/custom-domains/configure-dns/)
- [DNS伝播チェッカー](https://dnschecker.org/)
