# Stroke Data Priority System

## 概要
複数のstroke-dataファイルで同じ漢字が定義されている場合、以下の優先順位で処理されます。

## 優先順位（高い順）

### 1. 🥇 csvImportedData（最高優先度）
- **ファイル**: `lib/stroke-data/csv-imported-data.ts`
- **用途**: CSVインポート機能で追加されたデータ
- **特徴**: ユーザーが手動で追加したデータのため最優先

### 2. 🥈 extendedKanjiData
- **ファイル**: `lib/stroke-data/extended-kanji.ts`
- **用途**: 追加の漢字データ（旧字体、特殊漢字など）
- **特徴**: 一般的でない漢字や特別な画数設定

### 3. 🥉 katakanaData
- **ファイル**: `lib/stroke-data/kana.ts`
- **用途**: カタカナの画数データ

### 4. hiraganaData
- **ファイル**: `lib/stroke-data/kana.ts`
- **用途**: ひらがなの画数データ

### 5. commonKanjiData
- **ファイル**: `lib/stroke-data/common-kanji.ts`
- **用途**: 常用漢字の画数データ

### 6. givenNamesData
- **ファイル**: `lib/stroke-data/given-names.ts`
- **用途**: 名前によく使われる漢字

### 7. surnamesData
- **ファイル**: `lib/stroke-data/surnames.ts`
- **用途**: 姓によく使われる漢字

### 8. basicNumbersData（最低優先度）
- **ファイル**: `lib/stroke-data/basic-numbers.ts`
- **用途**: 基本的な数字や記号

## 実際の処理例

\`\`\`typescript
// 「学」という漢字が複数ファイルで定義されている場合
const strokeCountData = {
  ...basicNumbersData,    // 学: 8画
  ...surnamesData,        // 学: 8画（変更なし）
  ...givenNamesData,      // 学: 8画（変更なし）
  ...commonKanjiData,     // 学: 8画（変更なし）
  ...hiraganaData,        // 学: 定義なし
  ...katakanaData,        // 学: 定義なし
  ...extendedKanjiData,   // 学: 16画（上書き！）
  ...csvImportedData,     // 学: 16画（確定）
}
// 結果: 学 = 16画
\`\`\`

## 重複する主な漢字例

| 漢字 | common-kanji | extended-kanji | csv-imported | 最終値 |
|------|--------------|----------------|--------------|--------|
| 学   | 8画          | 16画           | 16画         | 16画   |
| 人   | 2画          | -              | 2画          | 2画    |
| 田   | 5画          | -              | 5画          | 5画    |
| 中   | 4画          | -              | 4画          | 4画    |

## 設計思想

1. **ユーザーデータ最優先**: CSVインポートデータを最優先とし、ユーザーの意図を尊重
2. **特殊ケース対応**: extendedKanjiで旧字体や特殊な画数設定に対応
3. **基本データ保護**: 基本的なデータは最低優先度とし、上位データで柔軟に上書き可能

## 注意点

- 同じ漢字でも文脈により画数が異なる場合があります
- 旧字体と新字体で画数が異なる場合、より適切な方を上位データで定義してください
- CSVインポート時は既存データとの整合性を確認することを推奨します
