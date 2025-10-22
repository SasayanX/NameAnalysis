// lib/stroke-data/given-names.ts

// This file contains stroke data for common given names.
// It is structured as a JavaScript object where keys are names
// and values are the number of strokes in the name.

const givenNames: { [key: string]: number } = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  子: 3,
  美: 9,
  咲: 9,
  愛: 13,
  優: 17,
  結: 12,
  心: 4,
  春: 9,
  夏: 10,
  秋: 9,
  冬: 5,
  海: 9,
  空: 8,
  花: 7,
  風: 9,
  月: 4,
  星: 9,
  光: 6,
  彩: 11,
  音: 9,
  凛: 15,
  遥: 12,
  茜: 9,
  葵: 12,
  楓: 13,
  陽: 12,
  葵生: 21,
  結菜: 23,
  陽菜: 21,
  美咲: 18,
  心美: 13,
  愛美: 22,
  学: 16, // Ensure this is 16 strokes, not 8. If it was 8, remove it.
  健: 11,
  翔: 12,
  大: 3,
  太: 4,
  一郎: 13,
  健太: 15,
  翔太: 16,
  拓: 9,
  拓也: 15,
  学人: 18,
  太郎: 14,
  次郎: 15,
  三郎: 16,
  健吾: 19,
  翔平: 17,
  大輝: 18,
  拓海: 18,
  学: 16,
}

// ファイル内で「学」が定義されているかチェックし、もし8画で定義されていたら削除します。
// In this case, "学" is defined as 16, which is correct, so no deletion is needed.
// If it was "学: 8", we would remove that line.

export default givenNames
