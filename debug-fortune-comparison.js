// 金雨輝龍と金雨我龍の運勢比較デバッグ
const { analyzeNameFortune } = require('./lib/name-analysis-unified');

function debugNameAnalysis(lastName, firstName, nameLabel) {
  console.log(`\n=== ${nameLabel} の分析 ===`);
  
  const result = analyzeNameFortune(lastName, firstName, "male", {});
  
  console.log("各格の詳細:");
  result.categories.forEach((category, index) => {
    console.log(`${index + 1}. ${category.name}: ${category.strokes}画 - ${category.fortune} (スコア: ${category.score})`);
  });
  
  // 運勢パワーを手動計算
  const fortunePoints = {
    大吉: 100,
    中吉: 80,
    吉: 60,
    凶: 20,
    中凶: 8,
    大凶: 0,
  };

  let totalFortunePoints = 0;
  let categoryCount = 0;

  result.categories.forEach((category) => {
    categoryCount++;
    
    let foundFortune = false;
    for (const [fortune, pointValue] of Object.entries(fortunePoints)) {
      if (category.fortune && category.fortune.includes(fortune)) {
        totalFortunePoints += pointValue;
        console.log(`  ${category.name}: ${fortune} = +${pointValue}ポイント`);
        foundFortune = true;
        break;
      }
    }
    
    if (!foundFortune) {
      console.warn(`  ${category.name}: 運勢が見つかりません - ${category.fortune}`);
    }
  });

  const averagePoints = categoryCount > 0 ? totalFortunePoints / categoryCount : 0;
  
  console.log(`\n運勢パワー計算結果:`);
  console.log(`  合計: ${totalFortunePoints}点`);
  console.log(`  平均: ${averagePoints}点`);
  console.log(`  最終: ${Math.round(averagePoints)}点`);
  
  return {
    totalPoints: totalFortunePoints,
    averagePoints: averagePoints,
    finalPoints: Math.round(averagePoints),
    categories: result.categories
  };
}

// 両方の名前を分析
console.log("金雨輝龍と金雨我龍の運勢比較分析");

const kiryuResult = debugNameAnalysis("金雨", "輝龍", "金雨輝龍");
const wareiResult = debugNameAnalysis("金雨", "我龍", "金雨我龍");

console.log("\n=== 比較結果 ===");
console.log(`金雨輝龍: ${kiryuResult.finalPoints}点`);
console.log(`金雨我龍: ${wareiResult.finalPoints}点`);

console.log("\n=== 詳細比較 ===");
console.log("金雨輝龍の各格:");
kiryuResult.categories.forEach(cat => {
  console.log(`  ${cat.name}: ${cat.strokes}画 - ${cat.fortune}`);
});

console.log("\n金雨我龍の各格:");
wareiResult.categories.forEach(cat => {
  console.log(`  ${cat.name}: ${cat.strokes}画 - ${cat.fortune}`);
});

// 違いを特定
console.log("\n=== 違いの分析 ===");
for (let i = 0; i < kiryuResult.categories.length; i++) {
  const kiryu = kiryuResult.categories[i];
  const warei = wareiResult.categories[i];
  
  if (kiryu.strokes !== warei.strokes || kiryu.fortune !== warei.fortune) {
    console.log(`${kiryu.name}:`);
    console.log(`  金雨輝龍: ${kiryu.strokes}画 - ${kiryu.fortune}`);
    console.log(`  金雨我龍: ${warei.strokes}画 - ${warei.fortune}`);
  }
}
