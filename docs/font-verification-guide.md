# フォント変更確認ガイド

## 游明朝 Demibold への変更確認方法

### 1. ブラウザでフロントエンドのフォントを確認

1. `http://localhost:3000/test-rare-card` にアクセス
2. ブラウザの開発者ツール（F12）を開く
3. 要素を選択ツールでカードの名前テキストを選択
4. 「Computed」タブで `font-family` を確認
   - 期待値: `"Yu Mincho", serif`
   - `font-weight`: `600` (Demibold)

### 2. APIで生成された画像を確認

以下のURLをブラウザで直接開いて、生成されたPNG画像を確認：

```
http://localhost:3000/api/rare-card/generate?lastName=大谷&firstName=翔平&rank=SSS&totalPoints=480&powerLevel=10
```

**確認ポイント:**
- 日本語文字が正しく表示されているか
- フォントが游明朝（明朝体）の特徴を持っているか
  - 明朝体の特徴: 横線が細く、縦線が太い、はね・はらいが明確

### 3. フォントの違いを視覚的に確認する方法

#### 方法A: ブラウザの開発者ツールでフォントを強制変更

1. 開発者ツールでカードのテキスト要素を選択
2. 「Styles」タブで `font-family` を一時的に変更：
   - `'Arial','Helvetica','sans-serif'` → ゴシック体（太い、均一な線）
   - `'Yu Mincho', serif` → 明朝体（細い横線、太い縦線）

#### 方法B: 生成されたSVGを直接確認

1. 開発サーバーのコンソールログを確認
2. `🎨 カード生成 - フォント指定:` というログが出力されているか確認

### 4. フォントが適用されていない場合の確認

#### 開発環境（ローカル）
- Windows/Macに游明朝がインストールされているか確認
- フォント名が正しいか確認（`Yu Mincho` または `游明朝`）

#### サーバーレス環境（本番）
- 游明朝は利用できない可能性が高い
- フォント埋め込みが必要

### 5. フォントの違いを明確にするテスト

以下の2つの画像を比較：

**Before (Arial):**
```
http://localhost:3000/api/rare-card/generate?lastName=大谷&firstName=翔平&rank=SSS&totalPoints=480&powerLevel=10&font=arial
```

**After (Yu Mincho):**
```
http://localhost:3000/api/rare-card/generate?lastName=大谷&firstName=翔平&rank=SSS&totalPoints=480&powerLevel=10
```

## 游明朝の特徴

- **横線**: 細い
- **縦線**: 太い
- **はね・はらい**: 明確で美しい
- **全体的な印象**: 伝統的で上品

## トラブルシューティング

### フォントが変わらない場合

1. **ブラウザのキャッシュをクリア**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

2. **開発サーバーを再起動**
   ```bash
   # 現在のサーバーを停止 (Ctrl+C)
   npm run dev
   ```

3. **フォントがインストールされているか確認**
   - Windows: コントロールパネル > フォント
   - Mac: フォントブックアプリ

### サーバーレス環境でフォントが表示されない場合

- フォントファイルをBase64エンコードしてSVGに埋め込む必要があります
- 詳細は `docs/serverless-fonts-guide.md` を参照

