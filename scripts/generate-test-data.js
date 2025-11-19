/**
 * テスト用データ生成スクリプト
 * 山田太郎さんの姓名判断結果と五行分析結果を生成
 */

const { analyzeNameFortune } = require('../lib/name-data-simple-fixed');
const { calculateGogyo } = require('../lib/advanced-gogyo');

const lastName = '山田';
const firstName = '太郎';
const gender = 'male';
const birthdate = '1990-01-01';

// 姓名判断結果を生成
const nameAnalysisResult = analyzeNameFortune(lastName, firstName, gender);
nameAnalysisResult.name = `${lastName}${firstName}`;

// 五行分析結果を生成
const birthdateObj = new Date(birthdate);
const gogyoResult = calculateGogyo(lastName, firstName, birthdateObj);

// リクエストデータを構築
const requestData = {
  nameAnalysisResult,
  gogyoResult,
  birthdate
};

// JSONを出力
console.log(JSON.stringify(requestData, null, 2));

