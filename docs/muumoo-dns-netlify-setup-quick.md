# ムームーDNS + Netlify クイック設定ガイド

## 現在の状況

- Netlifyのサブドメイン: `ainameanalysis.netlify.app`
- 設定したいドメイン: `seimei.app`
- DNS管理: ムームーDNS（ネームサーバーを変更しない）

## ムームーDNSでの設定手順

### 1. NetlifyのIPアドレスを確認

```bash
nslookup ainameanalysis.netlify.app
```

**結果の例**:
```
Address:  75.2.60.5
Address:  99.83.190.102
```

### 2. ムームーDNSで設定するレコード

#### ルートドメイン（`seimei.app`）の設定

**方法A: ALIASレコード（推奨、利用可能な場合）**
- **レコードタイプ**: `ALIAS`
- **サブドメイン**: `@` または空白
- **値**: `ainameanalysis.netlify.app`
- **TTL**: `3600`

**方法B: Aレコード（ALIASが利用できない場合）**
- **レコードタイプ**: `A`
- **サブドメイン**: `@` または空白
- **値**: `75.2.60.5`
- **TTL**: `3600`

- **レコードタイプ**: `A`
- **サブドメイン**: `@` または空白
- **値**: `99.83.190.102`
- **TTL**: `3600`

#### wwwサブドメイン（`www.seimei.app`）の設定

- **レコードタイプ**: `CNAME`
- **サブドメイン**: `www`
- **値**: `ainameanalysis.netlify.app`
- **TTL**: `3600`

#### Google Search Console検証用（既にNetlifyに設定済み）

- **レコードタイプ**: `TXT`
- **サブドメイン**: `@` または空白
- **値**: `google-site-verification=kpmzjiMOfzdOiQnTBva4LrvuP2-neMqMoSa9Av7yNt0`
- **TTL**: `3600`

## 設定後の確認

### 1. DNS伝播の確認

```bash
# ルートドメインのAレコード確認
nslookup seimei.app

# wwwサブドメインのCNAMEレコード確認
nslookup www.seimei.app
```

### 2. ブラウザでアクセス

- `https://seimei.app` にアクセス
- `https://www.seimei.app` にアクセス

両方ともNetlifyで配信されているサイトが表示されれば成功です。

## 重要な注意事項

### ⚠️ メール機能を使用する場合

**ネームサーバーをNetlifyに変更している場合、ドメインメール（例: info@seimei.app）が使用できません。**

ドメインメールを使用する場合は、以下の選択肢があります：

1. **ネームサーバーをムームーDNSに戻す**（推奨）
   - 詳細は `docs/domain-email-setup-guide.md` を参照

2. **Netlifyのまま、Netlify側でMXレコードを設定**
   - Netlify Dashboard → Domain settings → DNS configuration
   - メールサービスプロバイダー（Gmail Workspace、Microsoft 365など）が必要

### 現在のネームサーバーについて

1. **ネームサーバーがムームーDNSの場合**
   - ムームーDNSのネームサーバー（`ns1.muumuu-domain.com` など）のままにしてください

2. **ALIASレコードが利用可能か確認**
   - ムームーDNSでALIASレコードがサポートされている場合、ルートドメインにはALIASレコードを使用してください
   - ALIASレコードは、NetlifyのIPアドレスが変更されても自動的に追従します

3. **DNS伝播には時間がかかる**
   - 通常は数分〜数時間、最大48時間かかる場合があります

4. **SSL証明書は自動発行**
   - Netlifyが自動的にLet's EncryptでSSL証明書を発行します

