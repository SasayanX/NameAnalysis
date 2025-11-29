# ムームーメール DNSレコード設定値

## ムームーDNS側で設定するDNSレコード

### 1. MXレコード（必須）

| 項目 | 値 |
|------|-----|
| レコードタイプ | `MX` |
| サブドメイン/ホスト名 | `@` または空白 |
| 優先度 | `10` |
| 値 | `mx01.muumuu-mail.com.`（最後のドットを含む） |
| TTL | `3600` |

### 2. SPFレコード（TXT、推奨）

**Resendと併用しない場合**:
| 項目 | 値 |
|------|-----|
| レコードタイプ | `TXT` |
| サブドメイン/ホスト名 | `@` または空白 |
| 値 | `v=spf1 include:_spf.muumuu-mail.com ~all` |
| TTL | `3600` |

**Resendと併用する場合**:
| 項目 | 値 |
|------|-----|
| レコードタイプ | `TXT` |
| サブドメイン/ホスト名 | `@` または空白 |
| 値 | `v=spf1 include:resend.com include:_spf.muumuu-mail.com ~all` |
| TTL | `3600` |

## 現在設定済みのレコード（参考）

### Webサイト用（Netlify）

| 項目 | 値 |
|------|-----|
| レコードタイプ | `ALIAS` |
| サブドメイン/ホスト名 | `@` または空白 |
| 値 | `ainameanalysis.netlify.app` |
| TTL | `3600` |

| 項目 | 値 |
|------|-----|
| レコードタイプ | `CNAME` |
| サブドメイン/ホスト名 | `www` |
| 値 | `ainameanalysis.netlify.app` |
| TTL | `3600` |

### Google Search Console検証用

| 項目 | 値 |
|------|-----|
| レコードタイプ | `TXT` |
| サブドメイン/ホスト名 | `@` または空白 |
| 値 | `google-site-verification=kpmzjiMOfzdOiQnTBva4LrvuP2-neMqMoSa9Av7yNt0` |
| TTL | `3600` |

## 設定後の確認コマンド

```bash
# MXレコードの確認
nslookup -type=MX seimei.app

# SPFレコードの確認
nslookup -type=TXT seimei.app
```

## メールアカウント作成後の設定情報（参考）

### 受信メールサーバー（IMAP）

- サーバー名: `imap4.muumuu-mail.com`
- ポート: `993`
- 暗号化方式: `SSL/TLS`

### 送信メールサーバー（SMTP）

- サーバー名: `smtp.muumuu-mail.com`
- ポート: `465`
- 暗号化方式: `SSL/TLS`


