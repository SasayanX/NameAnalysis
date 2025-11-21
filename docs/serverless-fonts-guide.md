# サーバーレス環境で利用可能なフォント

## Netlify Functions（AWS Lambdaベース）で確実に利用できるフォント

Netlify FunctionsはAWS Lambdaベースで動作しており、限られたフォントしか利用できません。

### ✅ 確実に利用できるフォント（英語）

以下のフォントは、サーバーレス環境で確実に利用できます：

1. **Arial** - サンセリフ（最も確実）
2. **Helvetica** - サンセリフ
3. **Times New Roman** - セリフ
4. **Courier** - 等幅
5. **Verdana** - サンセリフ
6. **Georgia** - セリフ
7. **DejaVu Sans** - サンセリフ（Linux環境）
8. **DejaVu Serif** - セリフ（Linux環境）
9. **Liberation Sans** - サンセリフ（Linux環境）
10. **Liberation Serif** - セリフ（Linux環境）

### ❌ 利用できないフォント（日本語）

以下の日本語フォントは、サーバーレス環境では**通常利用できません**：

- Noto Sans JP
- Noto Serif JP
- Yu Mincho
- Yu Gothic
- Hiragino Mincho ProN
- Hiragino Kaku Gothic ProN
- Hannari
- その他の日本語フォント

## 現在の実装

現在、`lib/rare-card-generator.ts`では、名前テキストに以下のフォントを使用しています：

```typescript
font-family="'Arial','Helvetica','sans-serif'"
```

これは正しいアプローチですが、日本語文字が正しく表示されるかどうかは、sharpライブラリがどのようにフォントを処理するかによります。

## 解決策：日本語フォントを埋め込む

日本語フォントを確実に使用するには、フォントファイルをBase64エンコードしてSVGに埋め込む必要があります。

### 方法1: Base64エンコードでフォントを埋め込む

```typescript
// フォントファイルをBase64エンコード
const fontBase64 = fs.readFileSync('path/to/font.ttf').toString('base64')

// SVGの<defs>セクションに追加
const fontFace = `
  <defs>
    <style>
      @font-face {
        font-family: 'Noto Sans JP';
        src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype');
        font-weight: 900;
        font-style: normal;
      }
    </style>
  </defs>
`
```

### 方法2: リモートフォントを使用（推奨）

Google FontsやCDNからフォントを読み込む：

```typescript
const fontFace = `
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&display=swap');
    </style>
  </defs>
`
```

**注意**: サーバーレス環境では、外部リソースへのアクセスが制限される場合があります。

### 方法3: フォントファイルをプロジェクトに含める

1. `public/fonts/`フォルダにフォントファイルを配置
2. Base64エンコードしてSVGに埋め込む
3. または、フォントファイルをLambdaレイヤーに含める

## 推奨される実装

現在の実装（`'Arial','Helvetica','sans-serif'`）は、サーバーレス環境で確実に動作しますが、日本語文字の表示が不十分な場合があります。

### 最適な解決策

1. **軽量な日本語フォントを選択**（例：Noto Sans JPのサブセット）
2. **Base64エンコードで埋め込む**
3. **フォントサイズを最適化**（ファイルサイズを小さく保つ）

### 実装例

```typescript
// フォントをBase64エンコードして埋め込む
const embedFont = async () => {
  const fs = await import('fs')
  const path = await import('path')
  
  // フォントファイルのパス
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Black.ttf')
  
  if (fs.existsSync(fontPath)) {
    const fontBuffer = fs.readFileSync(fontPath)
    const fontBase64 = fontBuffer.toString('base64')
    
    return `
      <defs>
        <style>
          @font-face {
            font-family: 'Noto Sans JP';
            src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype');
            font-weight: 900;
            font-style: normal;
          }
        </style>
      </defs>
    `
  }
  
  // フォールバック: 汎用フォント
  return ''
}
```

## 注意事項

1. **フォントファイルサイズ**: Base64エンコードすると、ファイルサイズが約33%増加します
2. **Lambda制限**: Lambda関数のサイズ制限（250MB）に注意
3. **パフォーマンス**: フォント埋め込みは、SVG生成時間を増加させる可能性があります
4. **ライセンス**: 使用するフォントのライセンスを確認してください

## 次のステップ

1. 軽量な日本語フォント（Noto Sans JPのサブセットなど）を選択
2. フォントファイルを`public/fonts/`に配置
3. Base64エンコードで埋め込む実装を追加
4. テストして、日本語文字が正しく表示されることを確認

