# TWAプロジェクト初期化 - 対話形式入力ガイド

`bubblewrap init`を実行する際の入力ガイドです。

## コマンド実行

```bash
cd twa
bubblewrap init --manifest=https://seimei.app/manifest.json
```

## 入力内容

### 1. Domain（ドメイン）
```
seimei.app
```

### 2. URL path（URLパス）
```
/
```

### 3. Application name（アプリケーション名）
```
まいにちAI姓名判断
```

### 4. Short name（短縮名）
```
まいにちAI姓名判断
```

### 5. Package ID（パッケージID）
```
com.nameanalysis.ai
```

### 6. Signing key（署名キー）
新しいキーを作成する場合: `y` → Enter → Enter
既存のキーを使用する場合: `n` → キーパスの入力

---

**注意**: この対話形式を完了すると、`twa`ディレクトリにAndroidプロジェクトが生成されます。

