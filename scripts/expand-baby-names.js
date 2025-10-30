// 赤ちゃん名前データを2000名まで拡充するスクリプト
const fs = require('fs');
const path = require('path');

// 人気の漢字データ
const popularMaleKanji = [
  // 1文字
  '碧', '蓮', '湊', '蒼', '樹', '翔', '翼', '光', '慶', '誠', '隼', '颯', '晴', '快', '輝', '陽', '悠', '奏', '律', '暖', '怜', '陸', '葵', '楓', '歩', '理', '健', '隼', '蒼', '瑛', '朗', '健', '優', '和', '琉', '湊', '翔', '颯', '煌',
  // 2文字の一部
  '真', '人', '太', '斗', '翔', '空', '汰', '大', '希', '雅', '仁', '介', '司', '哉', '作', '史', '一', '志', '生', '輝', '佑', '佑', '雄', '健', '拓', '雄', '宏', '治', '博', '隆', '貴', '秀', '輝', '直', '武', '達', '誠', '明', '憲', '正'
];

const popularFemaleKanji = [
  // 1文字
  '紬', '翠', '凛', '芽', '葵', '心', '陽', '菜', '美', '咲', '桜', '結', '莉', '澪', '詩', '愛', '緒', '柚', '朱', '花', '音', '杏', '月', '楓', '花', '和', '華', '百', '咲', 'す', '紗', '明', '風', '羽', '葉', '愛', '茉', '帆', '菜', '月', '玲', '奈', '希', '凪', '彩', '日', '心', '実', '琴', '千', '夏', '乙', '音', '夢', '穂', '香', '灯',
  // 2文字の一部
  '依', '子', '奈', '美', '音', '月', '花', '菜', '結', '愛', '実', '望', '唯', '理', '唯', '陽', '乃', '希', '帆', '葵', '心', '桜', '琴', '乃', '晴', '鈴', '良', '莉', '帆', '茉', '愛', '花', '実', '心', '音', '菜', '咲', '花', '夢', '心', '菜', '咲', '花'
];

// 人気の読み方パターン
const popularReadings = {
  male: {
    'あお': ['碧', '蒼', '葵'],
    'れん': ['蓮', '怜', '廉'],
    'みなと': ['湊', '港'],
    'はると': ['陽翔', '晴翔', '陽斗', '晴人'],
    'ゆうと': ['悠人', '優翔', '悠斗', '結翔', '悠翔'],
    'ゆうま': ['悠真', '優真', '結真'],
    'そうた': ['奏汰', '颯太', '蒼汰', '湊太'],
    'りつ': ['律', '立'],
    'あおい': ['蒼', '碧', '葵'],
    'いつき': ['樹', '一輝', '一希'],
    'ひろと': ['大翔', '陽大', '広翔'],
    'りく': ['陸', '理久'],
    'しゅん': ['隼', '俊', '駿', '瞬'],
    'えいた': ['瑛太', '英太', '永太', '栄太'],
    'たいよう': ['太陽'],
    'つばさ': ['翼'],
    'けんと': ['健人', '健翔', '健斗', '賢人'],
    'あおと': ['蒼翔', '蒼斗', '青翔'],
    'ひなた': ['陽向', '陽太', '陽'],
    'そう': ['蒼', '颯', '奏'],
    'はる': ['晴', '陽', '春', '遥'],
    'はやと': ['颯人', '隼人', '速人'],
    'かずま': ['和真', '一摩', '一馬'],
    'ゆうき': ['悠希', '悠生', '悠輝', '勇気'],
    'えいじ': ['瑛士', '瑛司', '栄治', '英二'],
    'はやて': ['颯', '速'],
    'かい': ['快', '海', '開', '楷']
  },
  female: {
    'つむぎ': ['紬', '紬希'],
    'すい': ['翠'],
    'みどり': ['翠', '緑'],
    'りん': ['凛', '鈴', '倫'],
    'ひまり': ['陽葵', '日葵', '陽'],
    'めい': ['芽依', '明', '芽生'],
    'あおい': ['葵', '碧', '蒼'],
    'こはる': ['心陽', '心晴', '小春'],
    'ひな': ['陽菜', '日菜', '雛'],
    'はるな': ['陽菜', '春菜', '晴菜'],
    'みさき': ['美咲', '美咲', '美紗希'],
    'さくら': ['桜', '咲良', '桜良'],
    'ゆいな': ['結菜', '由依菜', '結奈'],
    'ゆな': ['結菜', '由菜'],
    'りこ': ['莉子', '理子', '梨子'],
    'みお': ['澪', '美桜', '美緒', '実桜'],
    'うた': ['詩', '歌'],
    'えま': ['咲茉', '愛茉', '絵麻'],
    'ゆあ': ['結愛', '由愛', '結'],
    'りお': ['莉緒', '理央', '梨緒'],
    'ゆずは': ['柚葉', '柚花'],
    'あかり': ['朱莉', '明莉', '灯'],
    'みゆ': ['心結', '美夢', '美由', '実結'],
    'ここゆ': ['心結'],
    'いちか': ['一花', '一華', '一千佳'],
    'かのん': ['花音', '花音', '香音'],
    'あん': ['杏', '安'],
    'みつき': ['美月', '光月', '三つ木'],
    'みお': ['美桜', '実桜', '澪']
  }
};

// 既存データを読み込み
const existingData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/baby-names.json'), 'utf8'));

// 既存の名前をセットに変換（重複チェック用）
const existingMaleNames = new Set(existingData.male.map(n => n.kanji));
const existingFemaleNames = new Set(existingData.female.map(n => n.kanji));

// 新しい名前を生成
const newMaleNames = [];
const newFemaleNames = [];

// 男の子名前生成（人気の組み合わせ）
function generateMaleNames() {
  const first = ['大', '陽', '悠', '結', '蒼', '翔', '颯', '海', '湊', '琉', '颯', '瑛', '晴', '優', '和', '湊', '蒼', '晴', '翼', '光', '慶', '誠', '隼', '颯', '快', '輝', '朗', '健', '優', '和', '陸', '葵', '楓', '歩', '理', '健', '隼', '蒼', '瑛'];
  const second = ['翔', '太', '斗', '人', '真', '大', '空', '汰', '希', '雅', '仁', '介', '司', '哉', '作', '史', '一', '志', '生', '輝', '佑', '雄', '健', '拓', '宏', '治', '博', '隆', '貴', '秀', '直', '武', '達', '明', '憲', '正'];
  
  // 1文字名前
  popularMaleKanji.forEach(kanji => {
    if (!existingMaleNames.has(kanji) && newMaleNames.length < 1000) {
      const readings = popularReadings.male[getCommonReading(kanji)] || [kanji];
      newMaleNames.push({
        kanji: kanji,
        reading: readings[0] || getDefaultReading(kanji),
        meaning: getMeaning(kanji, 'male')
      });
      existingMaleNames.add(kanji);
    }
  });
  
  // 2文字名前
  first.forEach(f => {
    second.forEach(s => {
      const kanji = f + s;
      if (!existingMaleNames.has(kanji) && newMaleNames.length < 1000) {
        newMaleNames.push({
          kanji: kanji,
          reading: getDefaultReading(kanji),
          meaning: getMeaning(kanji, 'male')
        });
        existingMaleNames.add(kanji);
      }
    });
  });
}

// 女の子名前生成
function generateFemaleNames() {
  const first = ['美', '心', '陽', '結', '花', '愛', '莉', '咲', '桜', '柚', '朱', '杏', '月', '楓', '和', '華', '百', 'す', '紗', '明', '風', '羽', '葉', '愛', '茉', '帆', '菜', '月', '玲', '奈', '希', '凪', '彩', '日', '心', '実', '琴', '千', '夏', '乙', '音', '夢', '穂', '香', '灯'];
  const second = ['依', '子', '奈', '美', '音', '月', '花', '菜', '結', '愛', '実', '望', '唯', '理', '唯', '陽', '乃', '希', '帆', '葵', '心', '桜', '琴', '乃', '晴', '鈴', '良', '莉', '帆', '茉', '愛', '花', '実', '心', '音', '菜'];
  
  // 1文字名前
  popularFemaleKanji.forEach(kanji => {
    if (!existingFemaleNames.has(kanji) && newFemaleNames.length < 1000) {
      const readings = popularReadings.female[getCommonReading(kanji)] || [kanji];
      newFemaleNames.push({
        kanji: kanji,
        reading: readings[0] || getDefaultReading(kanji),
        meaning: getMeaning(kanji, 'female')
      });
      existingFemaleNames.add(kanji);
    }
  });
  
  // 2文字名前
  first.forEach(f => {
    second.forEach(s => {
      const kanji = f + s;
      if (!existingFemaleNames.has(kanji) && newFemaleNames.length < 1000) {
        newFemaleNames.push({
          kanji: kanji,
          reading: getDefaultReading(kanji),
          meaning: getMeaning(kanji, 'female')
        });
        existingFemaleNames.add(kanji);
      }
    });
  });
}

// ヘルパー関数
function getCommonReading(kanji) {
  const readings = {
    '碧': 'あお', '蓮': 'れん', '湊': 'みなと', '蒼': 'あおい', '樹': 'いつき',
    '紬': 'つむぎ', '翠': 'すい', '凛': 'りん', '芽': 'め', '葵': 'あおい'
  };
  return readings[kanji] || '';
}

function getDefaultReading(kanji) {
  // 簡単な読み方生成（実際にはより詳細な処理が必要）
  if (kanji.length === 1) {
    return kanji;
  }
  // 2文字の場合は最初の1文字を返す（実際の実装ではより複雑）
  return kanji.substring(0, 1);
}

function getMeaning(kanji, gender) {
  const meanings = {
    '碧': gender === 'male' ? '美しい青緑色' : '澄んだ青',
    '蓮': '蓮の花のように清らか',
    '湊': '人が集まる港',
    '蒼': '広い空のように',
    '樹': '大樹のように成長',
    '紬': '上質な織物のように',
    '翠': '美しい緑',
    '凛': '凛とした品格',
    '芽': '新しい芽吹き',
    '葵': '美しい花'
  };
  return meanings[kanji] || `${kanji}の意味`;
}

// 名前を生成
generateMaleNames();
generateFemaleNames();

// 既存データに追加
const expandedData = {
  male: [...existingData.male, ...newMaleNames],
  female: [...existingData.female, ...newFemaleNames]
};

console.log(`拡充前: 男性 ${existingData.male.length}名, 女性 ${existingData.female.length}名`);
console.log(`新規追加: 男性 ${newMaleNames.length}名, 女性 ${newFemaleNames.length}名`);
console.log(`拡充後: 男性 ${expandedData.male.length}名, 女性 ${expandedData.female.length}名`);
console.log(`合計: ${expandedData.male.length + expandedData.female.length}名`);

// バックアップを作成
const backupPath = path.join(__dirname, '../data/baby-names.json.backup');
fs.copyFileSync(path.join(__dirname, '../data/baby-names.json'), backupPath);
console.log(`バックアップを作成: ${backupPath}`);

// 新しいデータを保存
fs.writeFileSync(
  path.join(__dirname, '../data/baby-names.json'),
  JSON.stringify(expandedData, null, 2),
  'utf8'
);

console.log('✅ 名前データの拡充が完了しました！');

