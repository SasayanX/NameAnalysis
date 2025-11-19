# Chrome DevTools - Consoleが空の場合のトラブルシューティング

## 問題

Chrome DevToolsでinspectを押したが、Consoleタブに何も表示されない。

## 解決方法

### 1. Consoleタブの設定を確認 ⭐ 最重要

1. **Consoleタブが選択されているか確認**
   - Chrome DevToolsの上部にある**Console**タブをクリック

2. **フィルター設定を確認**
   - Consoleタブの上部にあるフィルターボタンを確認
   - すべてのログレベル（Info、Warning、Error）が有効になっているか確認
   - フィルターが「All levels」になっているか確認

3. **ログレベルボタンを確認**
   - Consoleタブの上部にあるログレベルボタン：
     - ✅ **Verbose**（すべてのログ）
     - ✅ **Info**（情報ログ）
     - ✅ **Warning**（警告ログ）
     - ✅ **Error**（エラーログ）
   - すべてのログレベルが有効になっているか確認

### 2. ページをリロード

1. **TWAアプリでページをリロード**
   - TWAアプリ内でページをスワイプダウンしてリロード
   - または、TWAアプリを一度閉じて再度起動

2. **Chrome DevToolsでページをリロード**
   - Chrome DevToolsの**Network**タブを開く
   - リロードボタン（F5キー）を押す

### 3. 手動でログを出力して確認

Consoleタブで以下を実行して、ログが表示されるか確認：

```javascript
console.log('Test log message')
```

これで「Test log message」が表示されれば、Consoleは正常に動作しています。

### 4. TWAアプリでページにアクセス

1. TWAアプリで`/pricing`ページにアクセス
2. Chrome DevToolsのConsoleタブを確認
3. 以下のようなログが表示されるはずです：

```
[Pricing] TWA環境判定: true
[Pricing] Google Play Billing初期化結果: true
[Google Play Billing] Digital Goods API initialized successfully
```

### 5. それでも表示されない場合

#### 5.1 Chrome DevToolsを閉じて再度開く

1. `chrome://inspect`に戻る
2. TWAアプリの**inspect**リンクを再度クリック
3. Consoleタブを確認

#### 5.2 TWAアプリを再起動

1. TWAアプリを完全に閉じる
2. 再度起動
3. `chrome://inspect`で再度inspect

#### 5.3 ADB接続を確認

```bash
adb devices
```

デバイスが`device`と表示されているか確認。

### 6. デバッグ用のコードを追加

TWAアプリのコードに以下を追加して、ログが確実に表示されるようにする：

```javascript
// ページ読み込み時にログを出力
console.log('[Debug] Page loaded:', window.location.href)
console.log('[Debug] TWA environment:', window.matchMedia('(display-mode: standalone)').matches)
console.log('[Debug] Digital Goods API available:', typeof window.getDigitalGoodsService !== 'undefined')
```

### 7. 別の方法でログを確認

#### 方法1: Networkタブで確認

1. Chrome DevToolsの**Network**タブを開く
2. TWAアプリでページをリロード
3. ネットワークリクエストが表示されるか確認

#### 方法2: Elementsタブで確認

1. Chrome DevToolsの**Elements**タブを開く
2. HTMLが表示されるか確認
3. ページが正しく読み込まれているか確認

#### 方法3: Sourcesタブで確認

1. Chrome DevToolsの**Sources**タブを開く
2. ページのJavaScriptファイルが表示されるか確認
3. ブレークポイントを設定してデバッグ

## よくある原因

1. **フィルター設定でログが非表示になっている**
   - 最も多い原因
   - すべてのログレベルを有効にする

2. **ページがまだ読み込まれていない**
   - TWAアプリでページをリロードする

3. **Chrome DevToolsの接続が切れている**
   - Chrome DevToolsを閉じて再度開く

4. **TWAアプリが正しく起動していない**
   - TWAアプリを再起動する

## 確認チェックリスト

- [ ] Consoleタブが選択されている
- [ ] すべてのログレベルが有効になっている
- [ ] フィルターが「All levels」になっている
- [ ] TWAアプリでページをリロードした
- [ ] Chrome DevToolsでページをリロードした
- [ ] 手動で`console.log('Test')`を実行してログが表示されるか確認した
- [ ] TWAアプリで`/pricing`ページにアクセスした
- [ ] Chrome DevToolsを閉じて再度開いた
- [ ] TWAアプリを再起動した

## 次のステップ

上記の手順を試してもConsoleにログが表示されない場合は：

1. **Networkタブでリクエストが表示されるか確認**
2. **ElementsタブでHTMLが表示されるか確認**
3. **SourcesタブでJavaScriptファイルが表示されるか確認**

これらのタブで何か表示されれば、Chrome DevToolsは正常に接続されています。Consoleだけが空の場合は、フィルター設定を確認してください。


