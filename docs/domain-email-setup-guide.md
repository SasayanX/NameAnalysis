# ドメインメール設定ガイド（seimei.app）

## 現在の状況

**MXレコードが設定されていません** ❌

```bash
nslookup -type=MX seimei.app
```

現在、MXレコードが存在しないため、`info@seimei.app` などのドメインメールは受信できません。

## 選択肢

ドメインメールを使用するには、以下の2つの選択肢があります：

### 選択肢1: ネームサーバーをNetlifyのままにして、Netlify側でメール設定

**メリット**:
- ✅ 現在の設定を維持（変更不要）
- ✅ Netlifyと統合された管理

**デメリット**:
- ⚠️ メールサービスプロバイダーが必要（Gmail Workspace、Microsoft 365、独自メールサーバーなど）
- ⚠️ Netlify DashboardでMXレコードを設定する必要がある

**手順**:
1. メールサービスプロバイダーを選択
2. Netlify Dashboard → Domain settings → DNS configuration
3. MXレコード、SPF、DKIM、DMARCレコードを設定

### 選択肢2: ネームサーバーをムームーDNSに戻して、ムームーDNS側でメール設定（推奨）

**メリット**:
- ✅ メール設定が柔軟（メールサービスプロバイダーを変更しやすい）
- ✅ ムームーDNSでWebサイト（Netlify）とメールの両方を一元管理
- ✅ ムームーDNSのメール設定機能を利用可能

**デメリット**:
- ⚠️ ネームサーバーの変更が必要（DNS伝播に数時間かかる）
- ⚠️ Netlify側のDNS設定もムームーDNS側に移行する必要がある

**手順**:
1. ムームーDNSの管理画面でネームサーバーを戻す
2. ムームーDNS側でWebサイト（Netlify）用のDNSレコードを設定
3. ムームーDNS側でメール用のDNSレコード（MX、SPF、DKIM、DMARC）を設定

## 推奨: 選択肢2（ムームーDNSに戻す）

### 理由

1. **メール機能の柔軟性**: メールサービスプロバイダーを後から変更しやすい
2. **一元管理**: Webサイトとメールの設定を同じ場所で管理
3. **既存の運用**: 以前はムームーDNSで管理していた可能性が高い

### 詳細な手順

#### ステップ1: 現在のNetlifyのDNS設定をメモ

Netlify Dashboard → Domain settings → DNS configuration で現在の設定を確認：

- `seimei.app` → `NETLIFY` → `ainameanalysis.netlify.app`
- `www.seimei.app` → `NETLIFY` → `ainameanalysis.netlify.app`
- `seimei.app` → `TXT` → `google-site-verification=...`

#### ステップ2: NetlifyのIPアドレスを確認

```bash
nslookup ainameanalysis.netlify.app
```

結果のIPアドレスをメモ（例: `13.215.239.219`、`52.74.6.109`）

#### ステップ3: ムームーDNSでネームサーバーを戻す

1. **ムームードメインの管理画面にログイン**
   - https://muumuu-domain.com/

2. **ドメイン管理を開く**
   - 管理対象のドメイン（`seimei.app`）を選択

3. **ネームサーバー設定を変更**
   - 「ネームサーバー設定」を開く
   - ネームサーバーをムームーDNSのネームサーバーに戻す
   - 例: `ns1.muumuu-domain.com`、`ns2.muumuu-domain.com` など
   - （正確なネームサーバー名はムームーDNSの管理画面で確認してください）

#### ステップ4: ムームーDNSでWebサイト用のDNSレコードを設定

1. **DNS設定を開く**
   - 「DNS設定」または「ムームーDNS設定」を開く

2. **ルートドメイン（`seimei.app`）用のAレコードまたはALIASレコード**

   **ALIASレコードが利用可能な場合（推奨）**:
   - **レコードタイプ**: `ALIAS`
   - **サブドメイン**: `@` または空白
   - **値**: `ainameanalysis.netlify.app`
   - **TTL**: `3600`

   **Aレコードの場合**:
   - **レコードタイプ**: `A`
   - **サブドメイン**: `@` または空白
   - **値**: `13.215.239.219`（NetlifyのIPアドレス）
   - **TTL**: `3600`

   - 2つ目のIPアドレスがある場合:
     - **レコードタイプ**: `A`
     - **サブドメイン**: `@` または空白
     - **値**: `52.74.6.109`（NetlifyのIPアドレス、2つ目）
     - **TTL**: `3600`

3. **wwwサブドメイン（`www.seimei.app`）用のCNAMEレコード**

   - **レコードタイプ**: `CNAME`
   - **サブドメイン**: `www`
   - **値**: `ainameanalysis.netlify.app`
   - **TTL**: `3600`

4. **Google Search Console検証用のTXTレコード**

   - **レコードタイプ**: `TXT`
   - **サブドメイン**: `@` または空白
   - **値**: `google-site-verification=kpmzjiMOfzdOiQnTBva4LrvuP2-neMqMoSa9Av7yNt0`
   - **TTL**: `3600`

#### ステップ5: ムームーDNSでメール用のDNSレコードを設定

メールサービスプロバイダーによって設定が異なります。以下は主要なプロバイダーの例です。

##### Gmail Workspace（Google Workspace）の場合

1. **MXレコード**
   - **レコードタイプ**: `MX`
   - **サブドメイン**: `@` または空白
   - **優先度**: `1`
   - **値**: `ASPMX.L.GOOGLE.COM`
   - **TTL**: `3600`

   - **レコードタイプ**: `MX`
   - **サブドメイン**: `@` または空白
   - **優先度**: `5`
   - **値**: `ALT1.ASPMX.L.GOOGLE.COM`
   - **TTL**: `3600`

   - （以下、すべてのMXレコードを設定）
     - 優先度 `5`: `ALT2.ASPMX.L.GOOGLE.COM`
     - 優先度 `10`: `ALT3.ASPMX.L.GOOGLE.COM`
     - 優先度 `10`: `ALT4.ASPMX.L.GOOGLE.COM`

2. **SPFレコード（TXT）**
   - **レコードタイプ**: `TXT`
   - **サブドメイン**: `@` または空白
   - **値**: `v=spf1 include:_spf.google.com ~all`
   - **TTL**: `3600`

3. **DKIMレコード（TXT）**
   - Gmail Workspaceの管理画面で提供されるDKIMレコードを設定

4. **DMARCレコード（TXT）**
   - **レコードタイプ**: `TXT`
   - **サブドメイン**: `_dmarc`
   - **値**: `v=DMARC1; p=none; rua=mailto:your-email@example.com`
   - **TTL**: `3600`

##### Microsoft 365（Outlook）の場合

1. **MXレコード**
   - Microsoft 365の管理画面で提供されるMXレコードを設定

2. **SPFレコード（TXT）**
   - **値**: `v=spf1 include:spf.protection.outlook.com -all`

3. **DKIM、DMARCレコード**
   - Microsoft 365の管理画面で提供されるレコードを設定

##### 独自メールサーバーまたはその他のメールサービスプロバイダーの場合

1. メールサービスプロバイダーのドキュメントを参照
2. 提供されるMXレコード、SPF、DKIM、DMARCレコードを設定

#### ステップ6: DNS伝播を待つ

- 通常は数時間、最大48時間かかります
- 確認方法:
  ```bash
  # ネームサーバーが変更されたか確認
  nslookup -type=NS seimei.app
  
  # ムームーDNSのネームサーバーが返ってくることを確認
  ```

#### ステップ7: 動作確認

1. **Webサイトが表示されるか確認**
   - `https://seimei.app` にアクセス

2. **メールが受信できるか確認**
   - 外部から `info@seimei.app` などにテストメールを送信

## メールサービスプロバイダーの選択

### 主要な選択肢

1. **Gmail Workspace（Google Workspace）**
   - 月額料金: 約¥680/ユーザー〜
   - 30日間の無料トライアルあり
   - https://workspace.google.com/

2. **Microsoft 365**
   - 月額料金: 約¥680/ユーザー〜
   - 無料トライアルあり
   - https://www.microsoft.com/ja-jp/microsoft-365/

3. **ムームーDNSのメールサービス**
   - ムームーDNSが提供するメールサービスを利用可能
   - 料金はムームーDNSのサイトで確認

4. **独自メールサーバー**
   - VPSなどで独自にメールサーバーを構築

## トラブルシューティング

### 問題1: Webサイトが表示されなくなった

**原因**: DNS伝播が完了していない、またはDNSレコードの設定ミス

**解決方法**:
1. DNS伝播を待つ（最大48時間）
2. DNSレコードを再確認
3. `nslookup seimei.app` でIPアドレスが正しく返ってくるか確認

### 問題2: メールが受信できない

**原因**: MXレコードが正しく設定されていない、またはメールサービスプロバイダーの設定が不完全

**解決方法**:
1. MXレコードを確認: `nslookup -type=MX seimei.app`
2. SPF、DKIM、DMARCレコードを確認
3. メールサービスプロバイダーのドキュメントを再確認

### 問題3: ネームサーバーの変更が反映されない

**解決方法**:
1. ムームーDNSの管理画面でネームサーバーが正しく設定されているか確認
2. DNS伝播を待つ（通常は数時間）
3. `nslookup -type=NS seimei.app` で確認

## 参考リンク

- [Gmail Workspace セットアップガイド](https://support.google.com/a/answer/175130)
- [Microsoft 365 セットアップガイド](https://docs.microsoft.com/ja-jp/microsoft-365/admin/setup/setup)
- [ムームードメイン: DNS設定ガイド](https://muumuu-domain.com/guide/dns/)
- [DNS伝播チェッカー](https://dnschecker.org/)

