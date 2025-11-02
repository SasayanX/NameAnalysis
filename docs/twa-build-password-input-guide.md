# TWA ビルド時のパスワード入力ガイド

## パスワード入力の場所

`bubblewrap build`コマンドを実行すると、ターミナルに以下のようなメッセージが表示されます：

```
Please, enter passwords for the keystore D:\project\NameAnalysis\twa\android.keystore and alias android.
```

## 入力方法

### ステップ1: Keystore Password

ターミナルに以下のような表示が出ます：
```
Enter keystore password:
```

または

```
Keystore password:
```

このプロンプトの後に、**ターミナルのコマンドライン上で直接**以下を入力：
```
P@ssword
```

**重要**: パスワードは画面に表示されません（セキュリティ機能）。これは正常な動作です。

### ステップ2: Key Password

次に以下のような表示が出ます：
```
Enter key password for alias 'android':
```

または

```
Key password (alias android):
```

このプロンプトの後に、再度以下を入力：
```
P@ssword
```

## 視覚的な例

```
PS D:\project\NameAnalysis\twa> bubblewrap build
,-----.        ,--.  ,--.  ,--.
|  |) /_,--.,--|  |-.|  |-.|  |,---.,--.   ,--,--.--.,--,--.,---.
...

Please, enter passwords for the keystore D:\project\NameAnalysis\twa\android.keystore and alias android.
Enter keystore password: [ここに P@ssword と入力（表示されない）]
Enter key password for alias 'android': [ここに P@ssword と入力（表示されない）]

Building APK...
```

## トラブルシューティング

### パスワードが受け付けられない

1. パスワードが正しいか確認（`P@ssword`）
2. 大文字小文字を正確に入力
3. 特殊文字（`@`）が正しく入力されているか確認

### 入力できない

1. ターミナルウィンドウがアクティブ（フォーカスがある）か確認
2. カーソルがコマンドライン上にあることを確認
3. もう一度試す（Ctrl+Cで中断して `bubblewrap build` を再実行）

### ビルドが進まない

パスワード入力後、Enterキーを押すのを忘れていないか確認してください。

---

**重要なポイント**: パスワードは**コマンドライン上で直接入力**します。他のウィンドウやエディタではなく、`bubblewrap build`が実行されているターミナルウィンドウに入力してください。

