# DNS伝播確認方法

## DNS伝播について

DNS設定の変更が反映されるまで、**数分〜最大48時間**かかります。

- **通常**: 30分〜2時間
- **最大**: 48時間（ただし、通常は数時間以内）

## 確認方法

### 1. コマンドラインで確認

#### MXレコードの確認

```bash
nslookup -type=MX seimei.app
```

**期待される結果**:
```
seimei.app      MX preference = 10, mail exchanger = mx01.muumuu-mail.com.
```

#### SPFレコード（TXT）の確認

```bash
nslookup -type=TXT seimei.app
```

**期待される結果**:
```
seimei.app      text = "v=spf1 include:resend.com include:_spf.muumuu-mail.com ~all"
seimei.app      text = "google-site-verification=kpmzjiMOfzdOiQnTBva4LrvuP2-neMqMoSa9Av7yNt0"
```

#### ネームサーバーの確認（ムームーDNSに変更した場合）

```bash
nslookup -type=NS seimei.app
```

**期待される結果**（ムームーDNSの場合）:
```
seimei.app      nameserver = ns1.muumuu-domain.com
seimei.app      nameserver = ns2.muumuu-domain.com
```

### 2. オンラインツールで確認（推奨）

#### DNS Checker

https://dnschecker.org/

**使用方法**:
1. ドメイン名: `seimei.app` を入力
2. レコードタイプを選択:
   - **MX**: MXレコードの伝播状況を確認
   - **TXT**: SPFレコードの伝播状況を確認
   - **NS**: ネームサーバーの伝播状況を確認
3. 「Search」をクリック
4. 世界中のDNSサーバーで反映されているか確認
   - ✅ 緑: 反映済み
   - ❌ 赤: 未反映

#### MXToolbox

https://mxtoolbox.com/

**使用方法**:
1. ドメイン名: `seimei.app` を入力
2. レコードタイプを選択（MX、TXT、NSなど）
3. 結果を確認

## 確認のタイミング

### 即座に確認（数分後）

```bash
nslookup -type=MX seimei.app
```

ローカルのDNSキャッシュの影響で、すぐに反映されない場合があります。

### 定期的に確認（30分、1時間、2時間後）

同じコマンドを繰り返し実行して、反映状況を確認します。

### 最終確認（24時間後）

すべてのDNSサーバーに反映されているか確認します。

## ローカルDNSキャッシュのクリア

すぐに確認したい場合、ローカルのDNSキャッシュをクリアできます。

### Windowsの場合

```powershell
ipconfig /flushdns
```

### Macの場合

```bash
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

### Linuxの場合

```bash
sudo systemd-resolve --flush-caches
# または
sudo service systemd-resolved restart
```

## 確認チェックリスト

設定したDNSレコードが反映されているか確認：

- [ ] MXレコード: `mx01.muumuu-mail.com.` が表示される
- [ ] SPFレコード: `v=spf1 include:resend.com include:_spf.muumuu-mail.com ~all` が表示される
- [ ] ネームサーバー: ムームーDNSのネームサーバーが表示される（変更した場合）
- [ ] Webサイト: `https://seimei.app` が正常に表示される

## 問題が発生した場合

### 24時間経過しても反映されない場合

1. **ムームーDNSの管理画面で再確認**
   - DNSレコードが正しく設定されているか
   - レコードの値が正確か（タイポなど）

2. **DNS伝播チェッカーツールで確認**
   - 一部のDNSサーバーには反映されているか
   - 伝播が進行中か

3. **ムームーDNSのサポートに問い合わせ**
   - DNS設定が正しく保存されているか確認を依頼

## 設定が反映されたら

### メールアカウントの作成

1. ムームーメールの管理画面にログイン
2. メールアドレス作成（例: `info@seimei.app`）
3. パスワードを設定

### メールの送受信テスト

1. 外部のメールアドレスから `info@seimei.app` にテストメールを送信
2. 受信できることを確認
3. `info@seimei.app` から外部にメールを送信
4. 送信できることを確認

## 参考リンク

- [DNS Checker](https://dnschecker.org/)
- [MXToolbox](https://mxtoolbox.com/)
- [DNS伝播の確認（What's My DNS）](https://www.whatsmydns.net/)


