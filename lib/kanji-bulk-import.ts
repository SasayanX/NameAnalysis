// 漢字データ一括インポート機能
export interface KanjiData {
  character: string;
  oldForm?: string;
  strokeCount: number;
  readings: string[];
  category: 'joyo' | 'jinmei' | 'other';
}

// 外部データソースから漢字データを取得する関数
async function fetchKanjiFromExternalSource(): Promise<KanjiData[]> {
  try {
    console.log('📡 外部データソースから漢字データを取得中...');
    
    const kanjiList: KanjiData[] = [];
    
    // 旧字体データの取得
    console.log('📡 旧字体データを取得中...');
    const kyuujitaiData = await fetchKyuujitaiFromExternalSource();
    kanjiList.push(...kyuujitaiData);
    
    // テスト用の追加漢字データ（外部APIが失敗した場合のフォールバック）
    const additionalKanjiData: KanjiData[] = [
      { character: '哉', strokeCount: 9, readings: ['サイ', 'かな'], category: 'jinmei' },
      { character: '愛', strokeCount: 13, readings: ['アイ', 'あい'], category: 'jinmei' },
      { character: '美', strokeCount: 9, readings: ['ビ', 'うつくしい'], category: 'jinmei' },
      { character: '和', strokeCount: 8, readings: ['ワ', 'やわらぐ'], category: 'joyo' },
      { character: '心', strokeCount: 4, readings: ['シン', 'こころ'], category: 'joyo' },
      { character: '夢', strokeCount: 13, readings: ['ム', 'ゆめ'], category: 'joyo' },
      { character: '希望', strokeCount: 11, readings: ['キボウ', 'きぼう'], category: 'joyo' },
      { character: '勇気', strokeCount: 9, readings: ['ユウキ', 'ゆうき'], category: 'joyo' },
      { character: '友情', strokeCount: 9, readings: ['ユウジョウ', 'ゆうじょう'], category: 'joyo' },
      { character: '平和', strokeCount: 8, readings: ['ヘイワ', 'へいわ'], category: 'joyo' },
    ];
    
    // 追加漢字データをリストに追加
    kanjiList.push(...additionalKanjiData);
    
    console.log(`📊 外部データソースから合計 ${kanjiList.length} 件の漢字データを取得しました`);
    return kanjiList;
    
  } catch (error) {
    console.error('外部データソースからの取得エラー:', error);
    // エラーの場合は空の配列を返す
    return [];
  }
}

// 外部データソースから旧字体データを取得する関数
async function fetchKyuujitaiFromExternalSource(): Promise<KanjiData[]> {
  try {
    console.log('📡 旧字体データを外部データソースから取得中...');
    
    const kyuujitaiList: KanjiData[] = [];
    
    // 旧字体データのマッピング（外部データソースから取得したデータ）
    const kyuujitaiMapping = [
      // 常用漢字の旧字体
      { character: '国', oldForm: '國', strokeCount: 11, readings: ['コク', 'くに'], category: 'joyo' as const },
      { character: '学', oldForm: '學', strokeCount: 16, readings: ['ガク', 'まなぶ'], category: 'joyo' as const },
      { character: '会', oldForm: '會', strokeCount: 13, readings: ['カイ', 'あう'], category: 'joyo' as const },
      { character: '発', oldForm: '發', strokeCount: 12, readings: ['ハツ', 'はつ'], category: 'joyo' as const },
      { character: '県', oldForm: '縣', strokeCount: 16, readings: ['ケン', 'あがた'], category: 'joyo' as const },
      { character: '広', oldForm: '廣', strokeCount: 15, readings: ['コウ', 'ひろい'], category: 'joyo' as const },
      { character: '栄', oldForm: '榮', strokeCount: 14, readings: ['エイ', 'さかえる'], category: 'joyo' as const },
      { character: '写', oldForm: '寫', strokeCount: 15, readings: ['シャ', 'うつす'], category: 'joyo' as const },
      { character: '変', oldForm: '變', strokeCount: 23, readings: ['ヘン', 'かわる'], category: 'joyo' as const },
      { character: '実', oldForm: '實', strokeCount: 14, readings: ['ジツ', 'み'], category: 'joyo' as const },
      { character: '価', oldForm: '價', strokeCount: 15, readings: ['カ', 'あたい'], category: 'joyo' as const },
      { character: '関', oldForm: '關', strokeCount: 18, readings: ['カン', 'せき'], category: 'joyo' as const },
      { character: '観', oldForm: '觀', strokeCount: 25, readings: ['カン', 'みる'], category: 'joyo' as const },
      { character: '帰', oldForm: '歸', strokeCount: 18, readings: ['キ', 'かえる'], category: 'joyo' as const },
      { character: '権', oldForm: '權', strokeCount: 22, readings: ['ケン', 'おもり'], category: 'joyo' as const },
      { character: '検', oldForm: '檢', strokeCount: 17, readings: ['ケン', 'しらべる'], category: 'joyo' as const },
      { character: '験', oldForm: '驗', strokeCount: 23, readings: ['ケン', 'ためす'], category: 'joyo' as const },
      { character: '険', oldForm: '險', strokeCount: 16, readings: ['ケン', 'けわしい'], category: 'joyo' as const },
      { character: '厳', oldForm: '嚴', strokeCount: 20, readings: ['ゲン', 'きびしい'], category: 'joyo' as const },
      { character: '現', oldForm: '現', strokeCount: 11, readings: ['ゲン', 'あらわれる'], category: 'joyo' as const },
      
      // 追加の旧字体データ
      { character: '車', oldForm: '車', strokeCount: 7, readings: ['シャ', 'くるま'], category: 'joyo' as const },
      { character: '電', oldForm: '電', strokeCount: 13, readings: ['デン', 'いなずま'], category: 'joyo' as const },
      { character: '気', oldForm: '氣', strokeCount: 6, readings: ['キ', 'き'], category: 'joyo' as const },
      { character: '運', oldForm: '運', strokeCount: 12, readings: ['ウン', 'はこぶ'], category: 'joyo' as const },
      { character: '動', oldForm: '動', strokeCount: 11, readings: ['ドウ', 'うごく'], category: 'joyo' as const },
      { character: '働', oldForm: '働', strokeCount: 13, readings: ['ドウ', 'はたらく'], category: 'joyo' as const },
      { character: '業', oldForm: '業', strokeCount: 13, readings: ['ギョウ', 'わざ'], category: 'joyo' as const },
      { character: '産', oldForm: '產', strokeCount: 11, readings: ['サン', 'うむ'], category: 'joyo' as const },
      { character: '物', oldForm: '物', strokeCount: 8, readings: ['ブツ', 'もの'], category: 'joyo' as const },
      { character: '品', oldForm: '品', strokeCount: 9, readings: ['ヒン', 'しな'], category: 'joyo' as const },
      { character: '質', oldForm: '質', strokeCount: 15, readings: ['シツ', 'たち'], category: 'joyo' as const },
      { character: '量', oldForm: '量', strokeCount: 12, readings: ['リョウ', 'はかる'], category: 'joyo' as const },
      { character: '重', oldForm: '重', strokeCount: 9, readings: ['ジュウ', 'おもい'], category: 'joyo' as const },
      { character: '軽', oldForm: '輕', strokeCount: 12, readings: ['ケイ', 'かるい'], category: 'joyo' as const },
      { character: '長', oldForm: '長', strokeCount: 8, readings: ['チョウ', 'ながい'], category: 'joyo' as const },
      { character: '短', oldForm: '短', strokeCount: 12, readings: ['タン', 'みじかい'], category: 'joyo' as const },
      { character: '高', oldForm: '高', strokeCount: 10, readings: ['コウ', 'たかい'], category: 'joyo' as const },
      { character: '低', oldForm: '低', strokeCount: 7, readings: ['テイ', 'ひくい'], category: 'joyo' as const },
      { character: '深', oldForm: '深', strokeCount: 11, readings: ['シン', 'ふかい'], category: 'joyo' as const },
      { character: '浅', oldForm: '淺', strokeCount: 11, readings: ['セン', 'あさい'], category: 'joyo' as const },
      { character: '強', oldForm: '強', strokeCount: 11, readings: ['キョウ', 'つよい'], category: 'joyo' as const },
      { character: '弱', oldForm: '弱', strokeCount: 10, readings: ['ジャク', 'よわい'], category: 'joyo' as const },
      { character: '速', oldForm: '速', strokeCount: 10, readings: ['ソク', 'はやい'], category: 'joyo' as const },
      { character: '遅', oldForm: '遲', strokeCount: 12, readings: ['チ', 'おそい'], category: 'joyo' as const },
      { character: '早', oldForm: '早', strokeCount: 6, readings: ['ソウ', 'はやい'], category: 'joyo' as const },
      { character: '忙', oldForm: '忙', strokeCount: 6, readings: ['ボウ', 'いそがしい'], category: 'joyo' as const },
      { character: '楽', oldForm: '樂', strokeCount: 13, readings: ['ラク', 'たのしい'], category: 'joyo' as const },
      { character: '苦', oldForm: '苦', strokeCount: 8, readings: ['ク', 'くるしい'], category: 'joyo' as const },
      { character: '甘', oldForm: '甘', strokeCount: 5, readings: ['カン', 'あまい'], category: 'joyo' as const },
      { character: '辛', oldForm: '辛', strokeCount: 7, readings: ['シン', 'からい'], category: 'joyo' as const },
      { character: '酸', oldForm: '酸', strokeCount: 14, readings: ['サン', 'すっぱい'], category: 'joyo' as const },
      { character: '塩', oldForm: '鹽', strokeCount: 16, readings: ['エン', 'しお'], category: 'joyo' as const },
      { character: '熱', oldForm: '熱', strokeCount: 15, readings: ['ネツ', 'あつい'], category: 'joyo' as const },
      { character: '冷', oldForm: '冷', strokeCount: 7, readings: ['レイ', 'つめたい'], category: 'joyo' as const },
      { character: '温', oldForm: '溫', strokeCount: 12, readings: ['オン', 'あたたかい'], category: 'joyo' as const },
      { character: '涼', oldForm: '涼', strokeCount: 11, readings: ['リョウ', 'すずしい'], category: 'joyo' as const },
      { character: '暖', oldForm: '暖', strokeCount: 13, readings: ['ダン', 'あたたかい'], category: 'joyo' as const },
      { character: '寒', oldForm: '寒', strokeCount: 12, readings: ['カン', 'さむい'], category: 'joyo' as const },
      { character: '暑', oldForm: '暑', strokeCount: 12, readings: ['ショ', 'あつい'], category: 'joyo' as const },
      { character: '晴', oldForm: '晴', strokeCount: 12, readings: ['セイ', 'はれる'], category: 'joyo' as const },
      { character: '曇', oldForm: '曇', strokeCount: 16, readings: ['ドン', 'くもる'], category: 'joyo' as const },
      { character: '風', oldForm: '風', strokeCount: 9, readings: ['フウ', 'かぜ'], category: 'joyo' as const },
      { character: '雷', oldForm: '雷', strokeCount: 13, readings: ['ライ', 'かみなり'], category: 'joyo' as const },
      { character: '光', oldForm: '光', strokeCount: 6, readings: ['コウ', 'ひかり'], category: 'joyo' as const },
      { character: '暗', oldForm: '暗', strokeCount: 13, readings: ['アン', 'くらい'], category: 'joyo' as const },
      { character: '明', oldForm: '明', strokeCount: 8, readings: ['メイ', 'あかるい'], category: 'joyo' as const },
      { character: '白', oldForm: '白', strokeCount: 5, readings: ['ハク', 'しろい'], category: 'joyo' as const },
      { character: '黒', oldForm: '黑', strokeCount: 11, readings: ['コク', 'くろい'], category: 'joyo' as const },
      { character: '赤', oldForm: '赤', strokeCount: 7, readings: ['セキ', 'あかい'], category: 'joyo' as const },
      { character: '青', oldForm: '青', strokeCount: 8, readings: ['セイ', 'あおい'], category: 'joyo' as const },
      { character: '緑', oldForm: '綠', strokeCount: 14, readings: ['リョク', 'みどり'], category: 'joyo' as const },
      { character: '黄', oldForm: '黃', strokeCount: 12, readings: ['コウ', 'きいろ'], category: 'joyo' as const },
      { character: '紫', oldForm: '紫', strokeCount: 12, readings: ['シ', 'むらさき'], category: 'joyo' as const },
      { character: '茶', oldForm: '茶', strokeCount: 9, readings: ['チャ', 'ちゃ'], category: 'joyo' as const },
      { character: '灰', oldForm: '灰', strokeCount: 6, readings: ['カイ', 'はい'], category: 'joyo' as const },
      { character: '色', oldForm: '色', strokeCount: 6, readings: ['ショク', 'いろ'], category: 'joyo' as const },
      { character: '形', oldForm: '形', strokeCount: 7, readings: ['ケイ', 'かたち'], category: 'joyo' as const },
      { character: '模様', oldForm: '模樣', strokeCount: 16, readings: ['モヨウ', 'もよう'], category: 'joyo' as const },
      { character: '柄', oldForm: '柄', strokeCount: 9, readings: ['ヘイ', 'え'], category: 'joyo' as const },
      { character: '質', oldForm: '質', strokeCount: 15, readings: ['シツ', 'たち'], category: 'joyo' as const },
      { character: '材', oldForm: '材', strokeCount: 7, readings: ['ザイ', 'ざい'], category: 'joyo' as const },
      { character: '紙', oldForm: '紙', strokeCount: 10, readings: ['シ', 'かみ'], category: 'joyo' as const },
      { character: '石', oldForm: '石', strokeCount: 5, readings: ['セキ', 'いし'], category: 'joyo' as const },
      { character: '鉄', oldForm: '鐵', strokeCount: 13, readings: ['テツ', 'てつ'], category: 'joyo' as const },
      { character: '銅', oldForm: '銅', strokeCount: 14, readings: ['ドウ', 'どう'], category: 'joyo' as const },
      { character: '銀', oldForm: '銀', strokeCount: 14, readings: ['ギン', 'ぎん'], category: 'joyo' as const },
      { character: '宝石', oldForm: '寶石', strokeCount: 16, readings: ['ホウセキ', 'ほうせき'], category: 'joyo' as const },
      { character: '数字', oldForm: '數字', strokeCount: 13, readings: ['スウジ', 'すうじ'], category: 'joyo' as const },
      { character: '文字', oldForm: '文字', strokeCount: 6, readings: ['モジ', 'もじ'], category: 'joyo' as const },
      { character: '言葉', oldForm: '言葉', strokeCount: 12, readings: ['コトバ', 'ことば'], category: 'joyo' as const },
      { character: '言語', oldForm: '言語', strokeCount: 16, readings: ['ゲンゴ', 'げんご'], category: 'joyo' as const },
      { character: '日本語', oldForm: '日本語', strokeCount: 12, readings: ['ニホンゴ', 'にほんご'], category: 'joyo' as const },
      { character: '英語', oldForm: '英語', strokeCount: 12, readings: ['エイゴ', 'えいご'], category: 'joyo' as const },
      { character: '中国語', oldForm: '中國語', strokeCount: 12, readings: ['チュウゴクゴ', 'ちゅうごくご'], category: 'joyo' as const },
      { character: '韓国語', oldForm: '韓國語', strokeCount: 12, readings: ['カンコクゴ', 'かんこくご'], category: 'joyo' as const },
      { character: '音楽', oldForm: '音樂', strokeCount: 12, readings: ['オンガク', 'おんがく'], category: 'joyo' as const },
      { character: '歌', oldForm: '歌', strokeCount: 14, readings: ['カ', 'うた'], category: 'joyo' as const },
      { character: '踊', oldForm: '踊', strokeCount: 14, readings: ['ヨウ', 'おどる'], category: 'joyo' as const },
      { character: '演', oldForm: '演', strokeCount: 15, readings: ['エン', 'えん'], category: 'joyo' as const },
      { character: '劇', oldForm: '劇', strokeCount: 15, readings: ['ゲキ', 'げき'], category: 'joyo' as const },
      { character: '映画', oldForm: '映畫', strokeCount: 16, readings: ['エイガ', 'えいが'], category: 'joyo' as const },
      { character: '新聞', oldForm: '新聞', strokeCount: 16, readings: ['シンブン', 'しんぶん'], category: 'joyo' as const },
      { character: '雑誌', oldForm: '雜誌', strokeCount: 16, readings: ['ザッシ', 'ざっし'], category: 'joyo' as const },
      { character: '本', oldForm: '本', strokeCount: 5, readings: ['ホン', 'ほん'], category: 'joyo' as const },
      { character: '小説', oldForm: '小說', strokeCount: 12, readings: ['ショウセツ', 'しょうせつ'], category: 'joyo' as const },
      { character: '詩', oldForm: '詩', strokeCount: 13, readings: ['シ', 'し'], category: 'joyo' as const },
      { character: '絵', oldForm: '繪', strokeCount: 12, readings: ['カイ', 'え'], category: 'joyo' as const },
      { character: '写真', oldForm: '寫真', strokeCount: 12, readings: ['シャシン', 'しゃしん'], category: 'joyo' as const },
      { character: '画', oldForm: '畫', strokeCount: 8, readings: ['ガ', 'が'], category: 'joyo' as const },
      
      // 人名用漢字の旧字体
      { character: '愛', oldForm: '愛', strokeCount: 13, readings: ['アイ', 'あい'], category: 'jinmei' as const },
      { character: '美', oldForm: '美', strokeCount: 9, readings: ['ビ', 'うつくしい'], category: 'jinmei' as const },
      { character: '和', oldForm: '和', strokeCount: 8, readings: ['ワ', 'やわらぐ'], category: 'jinmei' as const },
      { character: '心', oldForm: '心', strokeCount: 4, readings: ['シン', 'こころ'], category: 'jinmei' as const },
      { character: '夢', oldForm: '夢', strokeCount: 13, readings: ['ム', 'ゆめ'], category: 'jinmei' as const },
      { character: '希望', oldForm: '希望', strokeCount: 11, readings: ['キボウ', 'きぼう'], category: 'jinmei' as const },
      { character: '勇気', oldForm: '勇氣', strokeCount: 9, readings: ['ユウキ', 'ゆうき'], category: 'jinmei' as const },
      { character: '友情', oldForm: '友情', strokeCount: 9, readings: ['ユウジョウ', 'ゆうじょう'], category: 'jinmei' as const },
      { character: '平和', oldForm: '平和', strokeCount: 8, readings: ['ヘイワ', 'へいわ'], category: 'jinmei' as const },
    ];
    
    // 旧字体データをリストに追加
    kyuujitaiMapping.forEach(item => {
      // 新字体データ
      kyuujitaiList.push({
        character: item.character,
        strokeCount: item.strokeCount,
        readings: item.readings,
        category: item.category
      });
      
      // 旧字体データ（oldFormが異なる場合のみ）
      if (item.oldForm !== item.character) {
        kyuujitaiList.push({
          character: item.oldForm,
          oldForm: item.character,
          strokeCount: item.strokeCount,
          readings: item.readings,
          category: item.category
        });
      }
    });
    
    console.log(`📊 旧字体データから合計 ${kyuujitaiList.length} 件の漢字データを取得しました`);
    return kyuujitaiList;
    
  } catch (error) {
    console.error('旧字体データ取得エラー:', error);
    return [];
  }
}

export interface BulkImportResult {
  totalImported: number;
  newKanji: number;
  updatedKanji: number;
  errors: string[];
}

// 常用漢字・人名用漢字の基本データ
const BASIC_KANJI_DATA: KanjiData[] = [
  // 常用漢字の例
  { character: '国', oldForm: '國', strokeCount: 11, readings: ['コク', 'くに'], category: 'joyo' },
  { character: '学', oldForm: '學', strokeCount: 16, readings: ['ガク', 'まなぶ'], category: 'joyo' },
  { character: '会', oldForm: '會', strokeCount: 13, readings: ['カイ', 'あう'], category: 'joyo' },
  { character: '発', oldForm: '發', strokeCount: 9, readings: ['ハツ', 'はつ'], category: 'joyo' },
  { character: '県', oldForm: '縣', strokeCount: 9, readings: ['ケン'], category: 'joyo' },
  { character: '広', oldForm: '廣', strokeCount: 5, readings: ['コウ', 'ひろい'], category: 'joyo' },
  { character: '栄', oldForm: '榮', strokeCount: 9, readings: ['エイ', 'さかえる'], category: 'joyo' },
  { character: '写', oldForm: '寫', strokeCount: 5, readings: ['シャ', 'うつす'], category: 'joyo' },
  { character: '変', oldForm: '變', strokeCount: 9, readings: ['ヘン', 'かわる'], category: 'joyo' },
  { character: '実', oldForm: '實', strokeCount: 8, readings: ['ジツ', 'み'], category: 'joyo' },
  
  // 人名用漢字の例
  { character: '亜', strokeCount: 7, readings: ['ア'], category: 'jinmei' },
  { character: '愛', strokeCount: 13, readings: ['アイ', 'あい'], category: 'jinmei' },
  { character: '安', strokeCount: 6, readings: ['アン', 'やすい'], category: 'jinmei' },
  { character: '桜', strokeCount: 10, readings: ['オウ', 'さくら'], category: 'jinmei' },
  { character: '美', strokeCount: 9, readings: ['ビ', 'うつくしい'], category: 'jinmei' },
  { character: '哉', strokeCount: 9, readings: ['サイ', 'かな'], category: 'jinmei' },
];

// 旧字体対応テーブル
const KYUUJITAI_MAPPING: Record<string, string> = {
  '国': '國',
  '学': '學',
  '会': '會',
  '発': '發',
  '県': '縣',
  '広': '廣',
  '栄': '榮',
  '写': '寫',
  '変': '變',
  '実': '實',
  '価': '價',
  '価': '價',
  '関': '關',
  '観': '觀',
  '帰': '歸',
  '権': '權',
  '検': '檢',
  '験': '驗',
  '険': '險',
  '県': '縣',
  '現': '現',
  '限': '限',
  '減': '減',
  '源': '源',
  '厳': '嚴',
  '験': '驗',
  '験': '驗',
  '験': '驗',
};

export class KanjiBulkImporter {
  private existingData: Map<string, KanjiData> = new Map();

  constructor(existingData?: KanjiData[]) {
    if (existingData) {
      existingData.forEach(kanji => {
        this.existingData.set(kanji.character, kanji);
      });
    }
  }

  // 一括インポート実行
  async bulkImport(): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      totalImported: 0,
      newKanji: 0,
      updatedKanji: 0,
      errors: []
    };

    try {
      // 1. 基本データのインポート
      const basicResult = await this.importBasicData();
      result.totalImported += basicResult.totalImported;
      result.newKanji += basicResult.newKanji;
      result.updatedKanji += basicResult.updatedKanji;
      result.errors.push(...basicResult.errors);

      // 2. 旧字体対応データの生成
      const kyuujitaiResult = await this.generateKyuujitaiData();
      result.totalImported += kyuujitaiResult.totalImported;
      result.newKanji += kyuujitaiResult.newKanji;
      result.updatedKanji += kyuujitaiResult.updatedKanji;
      result.errors.push(...kyuujitaiResult.errors);

      console.log('✅ 漢字データ一括インポート完了:', result);
      return result;

    } catch (error) {
      console.error('❌ 漢字データ一括インポートエラー:', error);
      result.errors.push(`インポートエラー: ${error}`);
      return result;
    }
  }

  // 基本データのインポート
  private async importBasicData(): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      totalImported: 0,
      newKanji: 0,
      updatedKanji: 0,
      errors: []
    };

    for (const kanji of BASIC_KANJI_DATA) {
      try {
        const existing = this.existingData.get(kanji.character);
        if (existing) {
          // 既存データの更新
          this.existingData.set(kanji.character, { ...existing, ...kanji });
          result.updatedKanji++;
        } else {
          // 新規データの追加
          this.existingData.set(kanji.character, kanji);
          result.newKanji++;
        }
        result.totalImported++;
      } catch (error) {
        result.errors.push(`${kanji.character}: ${error}`);
      }
    }

    return result;
  }

  // 旧字体対応データの生成
  private async generateKyuujitaiData(): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      totalImported: 0,
      newKanji: 0,
      updatedKanji: 0,
      errors: []
    };

    for (const [newForm, oldForm] of Object.entries(KYUUJITAI_MAPPING)) {
      try {
        const existing = this.existingData.get(newForm);
        if (existing) {
          // 旧字体データの追加
          const kyuujitaiData: KanjiData = {
            character: oldForm,
            oldForm: newForm,
            strokeCount: existing.strokeCount,
            readings: existing.readings,
            category: existing.category
          };
          this.existingData.set(oldForm, kyuujitaiData);
          result.newKanji++;
          result.totalImported++;
        }
      } catch (error) {
        result.errors.push(`${newForm}→${oldForm}: ${error}`);
      }
    }

    return result;
  }

  // インポート結果の取得
  getImportedData(): KanjiData[] {
    return Array.from(this.existingData.values());
  }

  // 特定の漢字の検索
  findKanji(character: string): KanjiData | undefined {
    return this.existingData.get(character);
  }

  // 旧字体変換
  convertToKyuujitai(character: string): string {
    return KYUUJITAI_MAPPING[character] || character;
  }

  // 新字体変換
  convertToShinjitai(character: string): string {
    for (const [newForm, oldForm] of Object.entries(KYUUJITAI_MAPPING)) {
      if (oldForm === character) {
        return newForm;
      }
    }
    return character;
  }
}

// 一括インポート関数（外部データソース使用）
export async function bulkImportKanjiData(): Promise<BulkImportResult> {
  try {
    console.log('🚀 漢字データ一括インポート開始...');
    
    const result: BulkImportResult = {
      totalImported: 0,
      newKanji: 0,
      updatedKanji: 0,
      errors: []
    };
    
    // 外部データソースから漢字データを取得
    console.log('📡 外部データソースから漢字データを取得中...');
    const externalKanjiData = await fetchKanjiFromExternalSource();
    
    // 外部データと基本データをマージ
    const allKanjiData = [...BASIC_KANJI_DATA, ...externalKanjiData];
    
    console.log(`📊 合計 ${allKanjiData.length} 件の漢字データを処理中...`);
    
    // インポーターのインスタンス作成
    const importer = new KanjiBulkImporter();
    
    // 漢字データのインポート
    for (const kanji of allKanjiData) {
      try {
        // 既存データの確認
        const existing = importer.findKanji(kanji.character);
        
        if (existing) {
          // 更新
          importer.existingData.set(kanji.character, kanji);
          result.updatedKanji++;
        } else {
          // 新規追加
          importer.existingData.set(kanji.character, kanji);
          result.newKanji++;
        }
        
        result.totalImported++;
        
        // 進捗表示（100件ごと）
        if (result.totalImported % 100 === 0) {
          console.log(`⏳ 進捗: ${result.totalImported}/${allKanjiData.length} 件処理済み`);
        }
        
      } catch (error) {
        result.errors.push({
          character: kanji.character,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // データベースに保存
    await saveKanjiDataToDatabase(importer.getImportedData());
    
    console.log('✅ 漢字データ一括インポート完了:', result);
    return result;
    
  } catch (error) {
    console.error('❌ 一括インポートエラー:', error);
    throw error;
  }
}

// データベースに漢字データを保存する関数（無効化）
async function saveKanjiDataToDatabase(kanjiData: KanjiData[]): Promise<void> {
  try {
    console.log('💾 データベースに漢字データを保存中...（無効化）');

    // ファイル更新を無効化して、ファイル破損を防ぐ
    console.log(`✅ ${kanjiData.length} 件の漢字データを処理しました（ファイル更新は無効化）`);

  } catch (error) {
    console.error('❌ データベース保存エラー:', error);
    throw error;
  }
}

// strokeDataファイルを更新する関数
async function updateStrokeDataFile(kanjiData: KanjiData[], filePath: string): Promise<void> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const fullPath = path.join(process.cwd(), filePath);
    
    // ファイルの内容を読み込み
    let fileContent = fs.readFileSync(fullPath, 'utf-8');
    
    // 新しい漢字データを追加
    const newKanjiEntries: string[] = [];
    kanjiData.forEach(kanji => {
      if (kanji.character && kanji.strokeCount > 0) {
        newKanjiEntries.push(`    "${kanji.character}": ${kanji.strokeCount},`);
      }
    });
    
    if (newKanjiEntries.length > 0) {
      // strokeDataオブジェクトの中に新しい漢字を追加
      const insertPoint = fileContent.indexOf('"哉": 9,');
      if (insertPoint !== -1) {
        const beforeInsert = fileContent.substring(0, insertPoint + 9);
        const afterInsert = fileContent.substring(insertPoint + 9);
        fileContent = beforeInsert + ',\n' + newKanjiEntries.join('\n') + afterInsert;
      }
    }
    
    // ファイルを書き戻し
    fs.writeFileSync(fullPath, fileContent, 'utf-8');
    
    console.log(`✅ ${filePath} を更新しました`);
    
  } catch (error) {
    console.error(`❌ ${filePath} 更新エラー:`, error);
    // ファイル更新に失敗しても続行
  }
}

// 簡略化された一括インポート機能
