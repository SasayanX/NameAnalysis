// 人気の漢字を組み合わせて名前を生成するスクリプト
const fs = require('fs');
const path = require('path');

// 既存データを読み込み
const existingData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/baby-names.json'), 'utf8'));
const existingMaleNames = new Set(existingData.male.map(n => n.kanji));
const existingFemaleNames = new Set(existingData.female.map(n => n.kanji));

// 人気の漢字（1文字目）
const popularFirstKanji = {
  male: ['大', '陽', '悠', '結', '蒼', '翔', '颯', '海', '湊', '琉', '晴', '優', '和', '翼', '光', '慶', '誠', '隼', '快', '輝', '朗', '健', '陸', '葵', '楓', '歩', '理', '瑛', '一', '瑛', '奏', '律', '暖', '怜', '蒼', '颯', '颯', '颯', '颯', '颯'],
  female: ['美', '心', '陽', '結', '花', '愛', '莉', '咲', '桜', '柚', '朱', '杏', '月', '楓', '和', '華', '百', '紗', '明', '風', '羽', '葉', '茉', '帆', '菜', '玲', '奈', '希', '凪', '彩', '日', '実', '琴', '千', '夏', '乙', '音', '夢', '穂', '香', '灯', '紬', '翠', '凛', '芽', '葵', '陽', '結', '咲', '澪', '詩', '愛', '緒']
};

// 人気の漢字（2文字目）
const popularSecondKanji = {
  male: ['翔', '太', '斗', '人', '真', '大', '空', '汰', '希', '雅', '仁', '介', '司', '哉', '作', '史', '志', '生', '輝', '佑', '雄', '健', '拓', '宏', '治', '博', '隆', '貴', '秀', '直', '武', '達', '明', '憲', '正', '翔', '太', '斗', '人', '真', '大', '空', '汰', '希', '雅', '仁', '介', '司', '哉', '作', '史', '志', '生', '輝', '佑', '雄', '健', '拓', '宏', '治', '博', '隆', '貴', '秀', '直', '武', '達', '明', '憲', '正'],
  female: ['依', '子', '奈', '美', '音', '月', '花', '菜', '結', '愛', '実', '望', '唯', '理', '陽', '乃', '希', '帆', '葵', '心', '桜', '琴', '晴', '鈴', '良', '莉', '帆', '茉', '愛', '花', '実', '心', '音', '菜', '咲', '花', '夢', '心', '菜', '咲', '花', '依', '子', '奈', '美', '音', '月', '花', '菜', '結', '愛', '実', '望', '唯', '理', '陽', '乃', '希', '帆', '葵', '心', '桜', '琴', '晴', '鈴', '良', '莉', '帆', '茉', '愛', '花', '実', '心', '音', '菜', '咲', '花']
};

// 1文字名（人気の漢字）
const singleKanji = {
  male: ['碧', '蓮', '湊', '蒼', '樹', '翔', '翼', '光', '慶', '誠', '隼', '颯', '晴', '快', '輝', '陽', '悠', '奏', '律', '暖', '怜', '陸', '葵', '楓', '歩', '理', '健', '瑛', '朗', '健', '優', '和', '琉', '湊', '翔', '颯', '煌', '圭', '駿', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯', '颯'],
  female: ['紬', '翠', '凛', '芽', '葵', '心', '陽', '菜', '美', '咲', '桜', '結', '莉', '澪', '詩', '愛', '緒', '柚', '朱', '花', '音', '杏', '月', '楓', '花', '和', '華', '百', '咲', '紗', '明', '風', '羽', '葉', '愛', '茉', '帆', '菜', '月', '玲', '奈', '希', '凪', '彩', '日', '心', '実', '琴', '千', '夏', '乙', '音', '夢', '穂', '香', '灯', '紬', '翠', '凛', '芽', '葵', '心', '陽', '菜', '美', '咲', '桜', '結', '莉', '澪', '詩', '愛', '緒', '柚', '朱', '花', '音', '杏', '月', '楓', '花', '和', '華', '百', '咲', '紗', '明', '風', '羽', '葉', '愛', '茉', '帆', '菜', '月', '玲', '奈', '希', '凪', '彩', '日', '心', '実', '琴', '千', '夏', '乙', '音', '夢', '穂', '香', '灯']
};

// 読み方のマッピング（簡易版）
const readingMap = {
  '大': 'だい', '陽': 'よう', '悠': 'ゆう', '結': 'ゆい', '蒼': 'そう', '翔': 'しょう', '颯': 'はやて', '海': 'かい', '湊': 'みなと',
  '琉': 'りゅう', '晴': 'はる', '優': 'ゆう', '和': 'わ', '翼': 'つばさ', '光': 'ひかり', '慶': 'けい', '誠': 'まこと', '隼': 'しゅん',
  '快': 'かい', '輝': 'き', '朗': 'ろう', '健': 'けん', '陸': 'りく', '葵': 'あおい', '楓': 'かえで', '歩': 'あゆむ', '理': 'り', '瑛': 'えい',
  '美': 'み', '心': 'こころ', '花': 'はな', '愛': 'あい', '莉': 'り', '咲': 'さき', '桜': 'さくら', '柚': 'ゆず', '朱': 'あかり',
  '杏': 'あん', '月': 'つき', '和': 'わ', '華': 'はな', '百': 'もも', '紗': 'さら', '明': 'あき', '風': 'かぜ', '羽': 'はね', '葉': 'は',
  '茉': 'ま', '帆': 'ほ', '菜': 'な', '玲': 'れい', '奈': 'な', '希': 'き', '凪': 'なぎ', '彩': 'あや', '日': 'ひ', '実': 'み', '琴': 'こと',
  '千': 'ち', '夏': 'なつ', '乙': 'おと', '音': 'おと', '夢': 'ゆめ', '穂': 'ほ', '香': 'か', '灯': 'あかり'
};

function getReading(kanji) {
  if (kanji.length === 1) {
    return readingMap[kanji] || kanji;
  }
  // 2文字の場合は簡易的に組み合わせ
  return (readingMap[kanji[0]] || kanji[0]) + (readingMap[kanji[1]] || kanji[1]);
}

function getMeaning(kanji) {
  const meanings = {
    '碧': '美しい青緑色', '蓮': '蓮の花のように清らか', '湊': '人が集まる港', '蒼': '広い空のように',
    '樹': '大樹のように成長', '翔': '大空に翔ける', '翼': '翼を持って飛ぶ', '光': '光のように明るく',
    '慶': '慶びに満ちた', '誠': '誠実に', '隼': '素早い', '颯': '颯爽と', '晴': '晴れやかに',
    '快': '快活に', '輝': '輝かしく', '陽': '太陽のように', '悠': 'ゆったりと', '奏': '美しい音を奏でる',
    '律': '規則正しく', '暖': '暖かく', '怜': '聡明で', '陸': '大地にしっかりと', '葵': '太陽に向かう',
    '楓': '美しい紅葉', '歩': '一歩一歩進む', '理': '道理をわきまえる', '健': '健康に', '瑛': '美しい宝石',
    '朗': '明るく', '優': '優しく', '和': '和やかに', '琉': '美しく',
    '紬': '上質な織物のように', '翠': '美しい緑', '凛': '凛とした品格', '芽': '新しい芽',
    '心': '心が優しく', '菜': '自然の恵み', '美': '美しく', '咲': '美しく咲く', '桜': '桜の花のように',
    '結': '結ばれる', '莉': '美しい', '澪': '美しい水路', '詩': '美しい詩', '愛': '愛らしく',
    '緒': '美しい緒', '柚': '柚子のように', '朱': '赤く美しい', '花': '花のように', '音': '美しい音',
    '杏': '杏の実', '月': '美しい月', '華': '華やかに', '紗': '上品な', '風': '爽やかな風',
    '羽': '美しい羽', '葉': '美しい葉', '茉': '美しく', '帆': '希望の帆', '玲': '美しく',
    '凪': '穏やかに', '彩': '彩られた', '実': '実りの', '琴': '美しい琴', '千': '多くの',
    '夏': '夏のように', '乙': '乙女のように', '夢': '夢のように', '穂': '穂のように', '香': '香り豊かに',
    '灯': '灯りのように'
  };
  
  if (kanji.length === 1) {
    return meanings[kanji] || `${kanji}の意味`;
  }
  
  // 2文字の場合は組み合わせて意味を生成
  const first = meanings[kanji[0]] || kanji[0];
  const second = meanings[kanji[1]] || kanji[1];
  return `${first}${second}`;
}

// 名前を生成
function generateNames() {
  const newMale = [];
  const newFemale = [];
  
  // 1文字名前を生成
  singleKanji.male.forEach(kanji => {
    if (!existingMaleNames.has(kanji) && newMale.length < 500) {
      newMale.push({
        kanji: kanji,
        reading: getReading(kanji),
        meaning: getMeaning(kanji)
      });
      existingMaleNames.add(kanji);
    }
  });
  
  singleKanji.female.forEach(kanji => {
    if (!existingFemaleNames.has(kanji) && newFemale.length < 500) {
      newFemale.push({
        kanji: kanji,
        reading: getReading(kanji),
        meaning: getMeaning(kanji)
      });
      existingFemaleNames.add(kanji);
    }
  });
  
  // 2文字名前を生成（組み合わせ）
  let combinations = 0;
  for (const first of popularFirstKanji.male) {
    for (const second of popularSecondKanji.male) {
      if (combinations >= 750) break; // 制限
      const kanji = first + second;
      if (!existingMaleNames.has(kanji) && newMale.length < 1000) {
        newMale.push({
          kanji: kanji,
          reading: getReading(kanji),
          meaning: getMeaning(kanji)
        });
        existingMaleNames.add(kanji);
        combinations++;
      }
    }
    if (combinations >= 750) break;
  }
  
  combinations = 0;
  for (const first of popularFirstKanji.female) {
    for (const second of popularSecondKanji.female) {
      if (combinations >= 750) break; // 制限
      const kanji = first + second;
      if (!existingFemaleNames.has(kanji) && newFemale.length < 1000) {
        newFemale.push({
          kanji: kanji,
          reading: getReading(kanji),
          meaning: getMeaning(kanji)
        });
        existingFemaleNames.add(kanji);
        combinations++;
      }
    }
    if (combinations >= 750) break;
  }
  
  return { male: newMale, female: newFemale };
}

const generated = generateNames();

// 既存データに追加
const expandedData = {
  male: [...existingData.male, ...generated.male],
  female: [...existingData.female, ...generated.female]
};

console.log(`\n📈 生成結果:`);
console.log(`生成: 男性 ${generated.male.length}名, 女性 ${generated.female.length}名`);
console.log(`拡充前: 男性 ${existingData.male.length}名, 女性 ${existingData.female.length}名 (合計 ${existingData.male.length + existingData.female.length}名)`);
console.log(`拡充後: 男性 ${expandedData.male.length}名, 女性 ${expandedData.female.length}名 (合計 ${expandedData.male.length + expandedData.female.length}名)`);

// 新しいデータを保存
fs.writeFileSync(
  path.join(__dirname, '../data/baby-names.json'),
  JSON.stringify(expandedData, null, 2),
  'utf8'
);

console.log(`\n✅ 名前データの拡充が完了しました！`);

