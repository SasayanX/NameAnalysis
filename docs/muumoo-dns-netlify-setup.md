# ムームーDNSでドメイン管理 + Netlifyで配信する設定方法

## 概要

ムームーDNS（ムームードメイン）でドメインを管理し続けながら、Netlifyでサイトを配信する設定方法です。

**重要**: DNS管理とホスティングは別々に管理できます。ドメインのDNS管理はムームーDNSで行い、サイトのホスティングはNetlifyで行う設定です。

## 前提条件

- ムームーDNSでドメインを取得・管理している
- Netlifyアカウントを作成済み
- Netlifyにサイトをデプロイ済み

## 設定手順

### ステップ1: Netlifyでドメインを追加

1. **Netlify Dashboardにログイン**
   - https://app.netlify.com/

2. **サイトを選択**
   - 配信したいサイトを選択

3. **Domain settingsを開く**
   - 左メニュー → **Domain settings** → **Domains**

4. **カスタムドメインを追加**
   - 「Add custom domain」をクリック
   - ドメイン名を入力（例: `seimei.app` または `www.seimei.app`）
   - 「Add domain」をクリック

5. **NetlifyのDNS設定を確認（しない）**
   - ⚠️ **重要**: この段階では、NetlifyのDNS設定は使用しません
   - ムームーDNSで管理しているため、NetlifyのDNS設定は無視してください

### ステップ2: Netlifyのドメイン情報を確認

Netlifyでドメインを追加すると、以下のような情報が表示されます：

**Netlify Dashboardで確認できる情報**:
- ドメイン: `seimei.app` → `NETLIFY` レコード → `ainameanalysis.netlify.app`
- wwwサブドメイン: `www.seimei.app` → `NETLIFY` レコード → `ainameanalysis.netlify.app`

⚠️ **重要**: `NETLIFY`レコードはNetlify独自のレコードタイプで、ムームーDNSでは使用できません。

**ムームーDNSで設定する場合の代替方法**:

Netlifyの最新のIPアドレスを確認するには、Netlifyのサブドメインを解決します：

```bash
# NetlifyサブドメインのIPアドレスを確認
nslookup ainameanalysis.netlify.app
```

または、Netlifyのドキュメントに記載されている標準的なIPアドレスを使用します：

**IPv4（ルートドメイン用）**:
- `75.2.60.5`
- `99.83.190.102`

**IPv6（オプション）**:
- `2606:4700::6810:3c05`
- `2606:4700::6393:be66`

### ステップ3: NetlifyのIPアドレスを確認

Netlifyのサブドメイン（`ainameanalysis.netlify.app`）のIPアドレスを確認します：

```bash
# Windows PowerShell
nslookup ainameanalysis.netlify.app

# または、コマンドプロンプト
nslookup ainameanalysis.netlify.app
```

**結果の例**:
```
Non-authoritative answer:
Name:    ainameanalysis.netlify.app
Address:  75.2.60.5
Address:  99.83.190.102
```

これらのIPアドレスをメモしておきます。

### ステップ4: ムームーDNSでDNSレコードを設定

1. **ムームードメインの管理画面にログイン**
   - https://muumuu-domain.com/

2. **ドメイン管理を開く**
   - ログイン後、管理対象のドメイン（`seimei.app`）を選択
   - 「DNS設定」または「ムームーDNS設定」を開く

3. **Aレコードを追加（ルートドメイン用）**

   **IPv4の場合**:
   - **レコードタイプ**: `A`
   - **サブドメイン/ホスト名**: `@` または空白（ルートドメイン用）
   - **値（Value/指す値）**: NetlifyのIPアドレス（例: `75.2.60.5`）
   - **TTL**: `3600`（デフォルト）

   ⚠️ **重要**: Netlifyが複数のIPアドレスを返す場合、**複数のAレコードを追加**してください。
   - 1つ目のAレコード: `@` → `75.2.60.5`
   - 2つ目のAレコード: `@` → `99.83.190.102`（Netlifyが2つ目のIPアドレスを返す場合）

   **ALIASレコードが利用可能な場合（推奨）**:
   - ムームーDNSでALIASレコードがサポートされている場合、Aレコードの代わりにALIASレコードを使用できます
   - **レコードタイプ**: `ALIAS`
   - **サブドメイン/ホスト名**: `@` または空白
   - **値（Value/指す値）**: `ainameanalysis.netlify.app`
   - ALIASレコードは、NetlifyのIPアドレスが変更されても自動的に追従するため、より推奨されます

4. **CNAMEレコードを追加（wwwサブドメイン用）**

   wwwサブドメイン（`www.seimei.app`）でもアクセスできるようにする場合：

   - **レコードタイプ**: `CNAME`
   - **サブドメイン/ホスト名**: `www`
   - **値（Value/指す値）**: Netlifyのサブドメイン `ainameanalysis.netlify.app`
   - **TTL**: `3600`

5. **TXTレコード（Google Search Console検証用、既に設定済みの場合）**

   Netlifyで表示されているTXTレコードは、Google Search Consoleの検証用です。
   ムームーDNS側にも同じレコードを追加してください：

   - **レコードタイプ**: `TXT`
   - **サブドメイン/ホスト名**: `@` または空白
   - **値（Value/指す値）**: `google-site-verification=kpmzjiMOfzdOiQnTBva4LrvuP2-neMqMoSa9Av7yNt0`
   - **TTL**: `3600`

5. **保存**
   - 設定を保存

### ステップ5: ネームサーバーの確認

**重要**: ネームサーバー（NSレコード）は**ムームーDNSのまま**にします。

- ✅ **正しい**: ネームサーバーは `ns1.muumuu-domain.com`、`ns2.muumuu-domain.com` などのまま
- ❌ **間違い**: ネームサーバーをNetlifyに変更しない

ネームサーバーを確認するには：

```bash
nslookup -type=NS seimei.app
```

以下のような結果が返ればOK（例）:
```
seimei.app  nameserver = ns1.muumuu-domain.com
seimei.app  nameserver = ns2.muumuu-domain.com
```

### ステップ6: SSL証明書の設定（自動）

Netlifyは自動的にSSL証明書（Let's Encrypt）を発行します。

1. **Domain settings → HTTPS** を開く
2. **「Verify DNS configuration」** をクリック（必要な場合）
3. 数分〜数時間でSSL証明書が自動的に発行されます

### ステップ7: DNS伝播の確認

DNS設定が反映されるまで、数分〜最大48時間かかる場合があります。

**確認方法**:

```bash
# Aレコードの確認
nslookup seimei.app

# CNAMEレコードの確認（wwwの場合）
nslookup www.seimei.app
```

または、オンラインツールを使用：
- https://dnschecker.org/
- https://www.whatsmydns.net/

### ステップ8: 動作確認

1. **ブラウザでアクセス**
   - `https://seimei.app` にアクセス
   - Netlifyで配信されているサイトが表示されることを確認

2. **SSL証明書の確認**
   - ブラウザのアドレスバーに鍵マークが表示されることを確認
   - `https://` でアクセスできることを確認

## よくある設定パターン

### パターン1: ルートドメインのみ（推奨）

```
seimei.app → Netlify (AレコードまたはALIASレコード)
```

**ムームーDNSの設定（Aレコード方式）**:
- Aレコード: `@` → `75.2.60.5`（NetlifyのIPアドレス）
- Aレコード: `@` → `99.83.190.102`（NetlifyのIPアドレス、2つ目）

**ムームーDNSの設定（ALIASレコード方式、推奨）**:
- ALIASレコード: `@` → `ainameanalysis.netlify.app`
  - ⚠️ ALIASレコードが利用できない場合は、Aレコード方式を使用してください

### パターン2: ルートドメイン + wwwサブドメイン（推奨）

```
seimei.app → Netlify (AレコードまたはALIASレコード)
www.seimei.app → Netlify (CNAMEレコード)
```

**ムームーDNSの設定（Aレコード方式）**:
- Aレコード: `@` → `75.2.60.5`
- Aレコード: `@` → `99.83.190.102`
- CNAMEレコード: `www` → `ainameanalysis.netlify.app`

**ムームーDNSの設定（ALIASレコード方式、推奨）**:
- ALIASレコード: `@` → `ainameanalysis.netlify.app`
- CNAMEレコード: `www` → `ainameanalysis.netlify.app`

### パターン3: wwwサブドメインのみ

```
www.seimei.app → Netlify (CNAMEレコード)
seimei.app → www.seimei.app にリダイレクト（Netlify側で設定）
```

**ムームーDNSの設定**:
- CNAMEレコード: `www` → `ainameanalysis.netlify.app`

**Netlify側の設定**:
- Domain settings → **「Add domain alias」** で `seimei.app` を追加
- 自動的に `www.seimei.app` にリダイレクトされます

## トラブルシューティング

### 問題1: サイトが表示されない

**確認事項**:
1. DNS伝播が完了しているか（最大48時間）
2. AレコードまたはCNAMEレコードが正しく設定されているか
3. Netlifyでドメインが追加されているか
4. SSL証明書が発行されているか

**解決方法**:
```bash
# DNSレコードを確認
nslookup seimei.app
# 結果にNetlifyのIPアドレスが表示されることを確認
```

### 問題2: SSL証明書が発行されない

**確認事項**:
1. DNS設定が正しく反映されているか
2. ドメインがNetlifyに正しく追加されているか

**解決方法**:
- Netlify Dashboard → Domain settings → HTTPS
- 「Verify DNS configuration」をクリック
- 数時間待ってから再度確認

### 問題3: wwwとルートドメインで異なる表示になる

**原因**: ルートドメインとwwwサブドメインが別々の設定になっている

**解決方法**:
- Netlify Dashboard → Domain settings → Domains
- `seimei.app` と `www.seimei.app` の両方を追加
- Netlifyが自動的に統一してくれます

### 問題4: DNS設定を変更したが反映されない

**確認事項**:
1. DNS伝播時間（通常数分〜数時間、最大48時間）
2. DNSキャッシュ（ブラウザやOSのキャッシュをクリア）

**解決方法**:
```bash
# DNSキャッシュをクリア（Windows）
ipconfig /flushdns

# DNSキャッシュをクリア（Mac）
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

## 注意事項

### ⚠️ 重要なポイント

1. **ネームサーバーは変更しない**
   - ムームーDNSのネームサーバー（`ns1.muumuu-domain.com` など）のままにしてください
   - ネームサーバーをNetlifyに変更すると、ムームーDNSでの設定が無効になります

2. **DNS設定はムームーDNSで行う**
   - NetlifyのDNS設定画面には設定しないでください
   - すべてのDNSレコードはムームーDNSで管理します

3. **複数のAレコードが必要な場合がある**
   - Netlifyが複数のIPアドレスを提供する場合、すべてのAレコードを追加してください

4. **DNS伝播には時間がかかる**
   - 通常は数分〜数時間ですが、最大48時間かかる場合があります
   - 焦らずに待ちましょう

## 参考リンク

- [Netlify公式: カスタムドメインの設定](https://docs.netlify.com/domains-https/custom-domains/)
- [ムームードメイン: DNS設定ガイド](https://muumuu-domain.com/guide/dns/)
- [DNS伝播チェッカー](https://dnschecker.org/)

