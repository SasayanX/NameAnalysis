# Android リモートデバッグガイド

## 概要

AndroidデバイスをUSB接続して、Chrome DevToolsでTWAアプリのコンソールログを確認する方法です。

## 前提条件

- Androidデバイス（TWAアプリがインストールされている）
- USBケーブル
- PC（Windows/Mac/Linux）
- Chromeブラウザ（PC側）

## ステップ1: Androidデバイスの設定

### 1.1 開発者オプションを有効化

1. **設定** → **端末情報**（または**デバイス情報**）を開く
2. **ビルド番号**を7回タップ
   - 「開発者になりました」というメッセージが表示されます

### 1.2 USBデバッグを有効化

1. **設定** → **開発者向けオプション**を開く
2. **USBデバッグ**をオンにする
3. 確認ダイアログが表示されたら**OK**をクリック

### 1.3 WebViewデバッグを有効化（TWAアプリの場合）

1. **設定** → **開発者向けオプション**を開く
2. **WebViewのデバッグを有効にする**をオンにする
   - または**WebViewの選択**で、TWAアプリで使用しているWebViewを選択

## ステップ2: PC側の設定

### 2.1 USBドライバーのインストール（Windowsの場合）

1. AndroidデバイスのメーカーからUSBドライバーをダウンロード
   - Samsung: Samsung USB Driver
   - Google: Google USB Driver
   - その他: メーカーの公式サイトから

2. USBドライバーをインストール

### 2.2 ADB（Android Debug Bridge）のインストール

#### 方法1: Android SDK Platform Toolsをインストール（推奨）

1. [Android SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools)をダウンロード
2. 解凍して任意のフォルダに配置
3. 環境変数PATHに追加（オプション）

#### 方法2: Android Studioをインストール

1. [Android Studio](https://developer.android.com/studio)をインストール
2. Android SDK Platform Toolsが自動的にインストールされます

### 2.3 ADBの動作確認

コマンドプロンプト（Windows）またはターミナル（Mac/Linux）で以下を実行：

```bash
adb version
```

バージョン情報が表示されればOKです。

## ステップ3: USB接続とデバイスの認識

### 3.1 USB接続

1. AndroidデバイスをPCにUSBケーブルで接続
2. Androidデバイスに「USBデバッグを許可しますか？」というダイアログが表示される
3. **常にこのコンピューターから許可する**にチェックを入れる
4. **OK**をクリック

### 3.2 デバイスの認識確認

コマンドプロンプトまたはターミナルで以下を実行：

```bash
adb devices
```

**正常な場合の出力**:
```
List of devices attached
XXXXXXXX    device
```

**デバイスが認識されない場合**:
- USBケーブルを確認（データ転送対応のケーブルを使用）
- USBデバッグが有効になっているか確認
- USBドライバーが正しくインストールされているか確認
- デバイスを再接続

## ステップ4: Chrome DevToolsでリモートデバッグ

### 4.1 Chrome DevToolsを開く

1. PCのChromeブラウザを開く
2. アドレスバーに以下を入力：
   ```
   chrome://inspect
   ```
   または
   ```
   chrome://inspect/#devices
   ```

### 4.2 デバイスとアプリを確認

1. **Remote Target**セクションにAndroidデバイスが表示されます
2. デバイス名の下に、開いているWebページやTWAアプリが表示されます
3. TWAアプリを探す（通常は`com.nameanalysis.ai`などのパッケージ名）

### 4.3 デバッグを開始

1. TWAアプリの右側にある**inspect**リンクをクリック
2. Chrome DevToolsが新しいウィンドウで開きます
3. **Console**タブを選択

### 4.4 コンソールログを確認

1. TWAアプリで`/pricing`ページにアクセス
2. Chrome DevToolsの**Console**タブでログを確認

**確認すべきログ**:
```
[Pricing] TWA環境判定: true
[Pricing] Google Play Billing初期化結果: true
[Google Play Billing] Digital Goods API initialized successfully
```

## ステップ5: デバッグ用のコンソールコマンド

Chrome DevToolsの**Console**タブで以下を実行：

### 5.1 TWA環境の確認

```javascript
// TWA環境かどうか確認
console.log('TWA環境:', window.matchMedia('(display-mode: standalone)').matches)
```

### 5.2 Digital Goods APIの確認

```javascript
// Digital Goods APIが利用可能か確認
console.log('Digital Goods API:', typeof window.getDigitalGoodsService !== 'undefined')
```

### 5.3 商品IDの確認

```javascript
// 商品IDを確認
console.log('Basic Product ID:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC || 'basic_monthly')
console.log('Premium Product ID:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM || 'premium_monthly')
```

### 5.4 Digital Goods APIを手動で初期化

```javascript
// Digital Goods APIを手動で初期化
if (typeof window.getDigitalGoodsService !== 'undefined') {
  window.getDigitalGoodsService('https://play.google.com/billing')
    .then(service => {
      console.log('Digital Goods API initialized:', service)
      return service.getDetails(['basic_monthly', 'premium_monthly'])
    })
    .then(details => {
      console.log('Product details:', details)
    })
    .catch(error => {
      console.error('Digital Goods API error:', error)
    })
}
```

## トラブルシューティング

### 問題1: デバイスが認識されない

**解決方法**:
1. USBケーブルを確認（データ転送対応のケーブルを使用）
2. USBデバッグが有効になっているか確認
3. USBドライバーを再インストール
4. デバイスを再接続

### 問題2: `adb devices`でデバイスが`unauthorized`と表示される

**症状**:
```
List of devices attached
XXXXXXXX    unauthorized
```

**解決方法**:
1. **Androidデバイスの画面を確認**
   - 「USBデバッグを許可しますか？」というダイアログが表示されているはずです
   - このダイアログが表示されていない場合は、USBケーブルを抜いて再度接続

2. **ダイアログで許可する**
   - **常にこのコンピューターから許可する**にチェックを入れる
   - **OK**または**許可**をクリック

3. **ADBで再確認**
   ```bash
   adb devices
   ```
   **正常な場合**:
   ```
   List of devices attached
   XXXXXXXXX    device
   ```

4. **それでも`unauthorized`のままの場合**
   - USBケーブルを抜いて再度接続
   - Androidデバイスの画面を確認（ダイアログが表示されるまで待つ）
   - ダイアログで許可する
   - ADBサーバーを再起動：
     ```bash
     adb kill-server
     adb start-server
     adb devices
     ```

### 問題2-2: `adb devices`でデバイスが表示されない

**解決方法**:
1. Androidデバイスで「USBデバッグを許可しますか？」ダイアログを確認
2. **常にこのコンピューターから許可する**にチェックを入れる
3. ADBサーバーを再起動：
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

### 問題3: Chrome DevToolsでアプリが表示されない

**解決方法**:
1. WebViewデバッグが有効になっているか確認
2. TWAアプリを起動してから`chrome://inspect`を開く
3. ページを更新（F5キー）

### 問題4: コンソールログが表示されない ⭐ よくある問題

**症状**:
- Chrome DevToolsでinspectを押したが、Consoleタブに何も表示されない

**解決方法**:

#### 1. Consoleタブの設定を確認

1. **Console**タブが選択されているか確認
2. **フィルター設定**を確認：
   - Consoleタブの上部にあるフィルターボタンを確認
   - すべてのログレベル（Info、Warning、Error）が有効になっているか確認
   - フィルターが「All levels」になっているか確認

#### 2. ページをリロード

1. **TWAアプリでページをリロード**：
   - TWAアプリ内でページをスワイプダウンしてリロード
   - または、TWAアプリを一度閉じて再度起動

2. **Chrome DevToolsでページをリロード**：
   - Chrome DevToolsの**Network**タブを開く
   - リロードボタン（F5キー）を押す

#### 3. ログレベルを確認

Consoleタブの上部にあるログレベルボタンを確認：
- ✅ **Verbose**（すべてのログ）
- ✅ **Info**（情報ログ）
- ✅ **Warning**（警告ログ）
- ✅ **Error**（エラーログ）

すべてのログレベルが有効になっているか確認してください。

#### 4. 手動でログを出力

Consoleタブで以下を実行して、ログが表示されるか確認：

```javascript
console.log('Test log message')
```

これで「Test log message」が表示されれば、Consoleは正常に動作しています。

#### 5. TWAアプリでページにアクセス

1. TWAアプリで`/pricing`ページにアクセス
2. Chrome DevToolsのConsoleタブを確認
3. 以下のようなログが表示されるはずです：

```
[Pricing] TWA環境判定: true
[Pricing] Google Play Billing初期化結果: true
[Google Play Billing] Digital Goods API initialized successfully
```

#### 6. それでも表示されない場合

1. **Chrome DevToolsを閉じて再度開く**：
   - `chrome://inspect`に戻る
   - TWAアプリの**inspect**リンクを再度クリック

2. **TWAアプリを再起動**：
   - TWAアプリを完全に閉じる
   - 再度起動
   - `chrome://inspect`で再度inspect

3. **ADB接続を確認**：
   ```bash
   adb devices
   ```
   デバイスが`device`と表示されているか確認

#### 7. デバッグ用のコードを追加

TWAアプリのコードに以下を追加して、ログが確実に表示されるようにする：

```javascript
// ページ読み込み時にログを出力
console.log('[Debug] Page loaded:', window.location.href)
console.log('[Debug] TWA environment:', window.matchMedia('(display-mode: standalone)').matches)
console.log('[Debug] Digital Goods API available:', typeof window.getDigitalGoodsService !== 'undefined')
```

## 参考リンク

- [Chrome DevTools - Remote Debugging](https://developer.chrome.com/docs/devtools/remote-debugging/)
- [Android Debug Bridge (ADB)](https://developer.android.com/studio/command-line/adb)
- [WebView Debugging](https://developer.chrome.com/docs/devtools/remote-debugging/webviews/)

## 次のステップ

リモートデバッグが完了したら：

1. **コンソールログを確認** - エラーメッセージの詳細を確認
2. **購入ボタンをクリック** - エラーメッセージを確認
3. **エラーメッセージを共有** - 問題の原因を特定

