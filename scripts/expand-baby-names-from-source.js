// 人気ランキングデータから名前を抽出して拡充するスクリプト
const fs = require('fs');
const path = require('path');

// 既存データを読み込み
const existingData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/baby-names.json'), 'utf8'));
const existingMaleNames = new Set(existingData.male.map(n => n.kanji));
const existingFemaleNames = new Set(existingData.female.map(n => n.kanji));

// additional-popular-names.txtから名前を抽出
function parseAdditionalNames() {
  const content = fs.readFileSync(path.join(__dirname, '../data/additional-popular-names.txt'), 'utf8');
  const lines = content.split('\n');
  
  const newMale = [];
  const newFemale = [];
  let currentGender = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // 性別ヘッダーを検出
    if (trimmed.includes('男の子')) {
      currentGender = 'male';
      continue;
    }
    if (trimmed.includes('女の子')) {
      currentGender = 'female';
      continue;
    }
    
    // 名前の行をパース（例：碧（あお））
    const match = trimmed.match(/^(.+?)（(.+?)）/);
    if (match) {
      const kanji = match[1].trim();
      const reading = match[2].trim();
      
      if (currentGender === 'male' && !existingMaleNames.has(kanji)) {
        newMale.push({
          kanji: kanji,
          reading: reading,
          meaning: getMeaning(kanji, reading)
        });
        existingMaleNames.add(kanji);
      } else if (currentGender === 'female' && !existingFemaleNames.has(kanji)) {
        newFemale.push({
          kanji: kanji,
          reading: reading,
          meaning: getMeaning(kanji, reading)
        });
        existingFemaleNames.add(kanji);
      }
    }
  }
  
  return { male: newMale, female: newFemale };
}

// popular-names-2021-2025.mdから名前を抽出
function parseMarkdownNames() {
  const content = fs.readFileSync(path.join(__dirname, '../data/popular-names-2021-2025.md'), 'utf8');
  const lines = content.split('\n');
  
  const newMale = [];
  const newFemale = [];
  let currentSection = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // セクション検出
    if (trimmed.includes('男の子の人気名前')) {
      currentSection = 'male';
      continue;
    }
    if (trimmed.includes('女の子の人気名前')) {
      currentSection = 'female';
      continue;
    }
    if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
      currentSection = null;
      continue;
    }
    
    if (!currentSection) continue;
    
    // 名前の行をパース（例：碧（あお） または 陽翔（はると））
    const match = trimmed.match(/^(.+?)（(.+?)）/);
    if (match) {
      const kanji = match[1].trim();
      const reading = match[2].split('/')[0].trim(); // 複数読みがある場合は最初を使う
      
      if (currentSection === 'male' && !existingMaleNames.has(kanji)) {
        newMale.push({
          kanji: kanji,
          reading: reading,
          meaning: getMeaning(kanji, reading)
        });
        existingMaleNames.add(kanji);
      } else if (currentSection === 'female' && !existingFemaleNames.has(kanji)) {
        newFemale.push({
          kanji: kanji,
          reading: reading,
          meaning: getMeaning(kanji, reading)
        });
        existingFemaleNames.add(kanji);
      }
    }
  }
  
  return { male: newMale, female: newFemale };
}

// 意味を生成（簡易版）
function getMeaning(kanji, reading) {
  const meanings = {
    // 男の子
    '碧': '美しい青緑色',
    '蓮': '蓮の花のように清らか',
    '湊': '人が集まる港',
    '蒼': '広い空のように',
    '樹': '大樹のように成長',
    '大翔': '大きく翔ける',
    '悠真': 'ゆったりと真っ直ぐ',
    '結翔': '結ばれて翔ける',
    '律': '規則正しく',
    '陽翔': '太陽のように翔ける',
    '颯真': '颯爽とした真実',
    '琉生': '美しく生まれる',
    '悠人': 'ゆったりとした人',
    '奏汰': '美しい音を奏でる',
    '怜': '聡明で',
    '海翔': '海のように広く翔ける',
    '颯人': '颯爽とした人',
    '葵': '太陽に向かう',
    '楓': '美しい紅葉',
    '翔': '大空に翔ける',
    '光': '光のように明るく',
    '慶': '慶びに満ちた',
    '瑛太': '美しい宝石のように',
    '歩': '一歩一歩進む',
    '理人': '道理をわきまえた人',
    '太陽': '太陽のように明るく',
    '翼': '翼を持って飛ぶ',
    '健人': '健康な人',
    '陸': '大地にしっかりと',
    '蒼翔': '青空に翔ける',
    '健翔': '健康で翔ける',
    '大河': '大きな川のように',
    '優翔': '優しく翔ける',
    '悠斗': 'ゆったりとした',
    '誠': '誠実に',
    '一輝': '一つの輝き',
    '一摩': '第一の',
    '亜沙人': '優しい人',
    '陽向': '太陽の方向へ',
    '蒼空': '青い空のように',
    '瑛斗': '美しい',
    '颯太': '颯爽とした',
    '晴': '晴れやかに',
    '隼人': '素早い人',
    '優真': '優しく真っ直ぐ',
    '晴人': '晴れやかな人',
    '悠': 'ゆったりと',
    '蒼汰': '青く澄んだ',
    '隼': '素早い',
    '瑛': '美しい宝石',
    '和真': '和やかで真っ直ぐ',
    '悠生': 'ゆったりと生きる',
    '瑛士': '美しい士',
    '颯': '颯爽と',
    '快': '快活に',
    '大志': '大きな志',
    '琉斗': '美しい',
    '悠希': 'ゆったりと希望',
    '湊斗': '湊で集まる',
    '颯大': '颯爽として大きい',
    '湊太': '湊で集まる',
    '陽大': '太陽のように大きい',
    '琉雅': '美しく上品',
    '悠雅': 'ゆったりと上品',
    '陽斗': '太陽のように',
    '煌': '輝かしく',
    '琥太郎': '琥珀のように',
    '颯馬': '颯爽とした馬',
    '琉星': '美しい星',
    
    // 女の子
    '紬': '上質な織物のように',
    '翠': '美しい緑',
    '凛': '凛とした品格',
    '陽葵': '太陽と葵の花',
    '芽依': '新しい芽',
    '葵': '太陽に向かう花',
    '心陽': '心が陽のように',
    '陽菜': '太陽のような菜',
    '美咲': '美しく咲く',
    '桜': '桜の花のように',
    '結菜': '結ばれた菜',
    '莉子': '美しい子',
    '澪': '美しい水路',
    '詩': '美しい詩',
    '咲茉': '美しく咲く',
    '結愛': '愛が結ばれる',
    '莉緒': '美しい緒',
    '柚葉': '柚子の葉',
    '朱莉': '赤く美しい',
    '心結': '心が結ばれる',
    '一花': '一輪の花',
    '花音': '花の音',
    '杏': '杏の実',
    '美月': '美しい月',
    '美桜': '美しい桜',
    '楓': '美しい紅葉',
    '花': '花のように',
    '陽菜乃': '太陽のような菜',
    '柚希': '柚子の希望',
    '一華': '一輪の華',
    '結': '結ばれる',
    '凪咲': '凪と咲く',
    '乃愛': '愛の',
    '光莉': '光のように',
    '琴音': '琴の音',
    '詩乃': '詩のような',
    '菫': 'すみれの花',
    '和花': '和やかな花',
    '華': '華やかに',
    '百花': '多くの花',
    '陽咲': '太陽のように咲く',
    '莉愛': '美しい愛',
    '菜月': '菜の月',
    '咲希': '咲く希望',
    '心晴': '心が晴れる',
    '鈴': '美しい鈴',
    '紗良': '上品な',
    '明莉': '明るく美しい',
    '風花': '風と花',
    '美羽': '美しい羽',
    '葉月': '葉の月',
    '愛莉': '愛らしく',
    '愛茉': '愛らしく',
    '莉帆': '美しい帆',
    '愛菜': '愛らしい菜',
    '柚月': '柚子の月',
    '玲奈': '美しく',
    '希帆': '希望の帆',
    '凪紗': '凪と紗',
    '結葵': '結ばれた葵',
    '結心': '心が結ばれる',
    '彩羽': '彩られた羽',
    '日葵': '太陽と葵',
    '彩心': '彩られた心',
    '実桜': '実りの桜',
    '美琴': '美しい琴',
    '七海': '七つの海',
    '柚花': '柚子の花',
    '咲': '咲く',
    '千晴': '千の晴れ',
    '夏帆': '夏の帆',
    '陽': '太陽',
    '乙葉': '乙女の葉',
    '心音': '心の音',
    '咲花': '咲く花',
    '日和': '良い日和',
    '美夢': '美しい夢',
    '穂香': '穂の香り',
    '心菜': '心の菜',
    '灯': '灯り',
    '夢音': '夢の音',
    '夢月': '夢の月',
    '夢星': '夢の星',
    '夢空': '夢の空',
    '夢理': '夢の理',
    '夢奈': '夢の奈',
    '夢美': '夢のように美しい',
    '夢実': '夢の実',
    '夢望': '夢と希望',
    '夢結': '夢が結ばれる',
    '夢唯': '唯一の夢',
    '唯愛': '唯一の愛',
    '唯音': '唯一の音',
    '唯月': '唯一の月',
    '唯星': '唯一の星',
    '唯空': '唯一の空',
    '唯理': '唯一の理',
    '唯奈': '唯一の奈',
    '唯美': '唯一の美',
    '唯実': '唯一の実'
  };
  
  return meanings[kanji] || `${kanji}の意味（${reading}）`;
}

// 名前を抽出
const fromAdditional = parseAdditionalNames();
const fromMarkdown = parseMarkdownNames();

// 組み合わせ
const allNewMale = [...fromAdditional.male, ...fromMarkdown.male];
const allNewFemale = [...fromAdditional.female, ...fromMarkdown.female];

// 重複除去
const uniqueNewMale = Array.from(new Map(allNewMale.map(n => [n.kanji, n])).values());
const uniqueNewFemale = Array.from(new Map(allNewFemale.map(n => [n.kanji, n])).values());

console.log(`\n📊 抽出結果:`);
console.log(`- additional-popular-names.txtから: 男性 ${fromAdditional.male.length}名, 女性 ${fromAdditional.female.length}名`);
console.log(`- popular-names-2021-2025.mdから: 男性 ${fromMarkdown.male.length}名, 女性 ${fromMarkdown.female.length}名`);
console.log(`- 重複除去後: 男性 ${uniqueNewMale.length}名, 女性 ${uniqueNewFemale.length}名`);

// 既存データに追加
const expandedData = {
  male: [...existingData.male, ...uniqueNewMale],
  female: [...existingData.female, ...uniqueNewFemale]
};

console.log(`\n📈 拡充結果:`);
console.log(`拡充前: 男性 ${existingData.male.length}名, 女性 ${existingData.female.length}名 (合計 ${existingData.male.length + existingData.female.length}名)`);
console.log(`拡充後: 男性 ${expandedData.male.length}名, 女性 ${expandedData.female.length}名 (合計 ${expandedData.male.length + expandedData.female.length}名)`);
console.log(`追加: 男性 ${uniqueNewMale.length}名, 女性 ${uniqueNewFemale.length}名 (合計 ${uniqueNewMale.length + uniqueNewFemale.length}名)`);

// 目標の2000名に達していない場合、組み合わせ生成で補完
const targetTotal = 2000;
const currentTotal = expandedData.male.length + expandedData.female.length;
const needed = Math.max(0, targetTotal - currentTotal);

if (needed > 0) {
  console.log(`\n⚠️ 目標の2000名に達していません。あと ${needed}名必要です。`);
  console.log(`組み合わせ生成で補完するか、追加のデータソースを用意してください。`);
}

// バックアップを作成
const backupPath = path.join(__dirname, '../data/baby-names.json.backup');
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(path.join(__dirname, '../data/baby-names.json'), backupPath);
  console.log(`\n💾 バックアップを作成: ${backupPath}`);
}

// 新しいデータを保存
fs.writeFileSync(
  path.join(__dirname, '../data/baby-names.json'),
  JSON.stringify(expandedData, null, 2),
  'utf8'
);

console.log(`\n✅ 名前データの拡充が完了しました！`);

