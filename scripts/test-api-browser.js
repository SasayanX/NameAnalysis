/**
 * ブラウザのコンソールから実行するAPIテストコード
 * 開発サーバーが起動している状態で、ブラウザのコンソールに貼り付けて実行してください
 */

(async function testGeminiAPI() {
  try {
    console.log('🧪 Gemini AI鑑定APIテスト開始\n');

    // テストデータ
    const lastName = '山田';
    const firstName = '太郎';
    const gender = 'male';
    const birthdate = '1990-01-01';

    console.log('📝 テストデータ:');
    console.log(`  姓名: ${lastName}${firstName}`);
    console.log(`  性別: ${gender}`);
    console.log(`  生年月日: ${birthdate}\n`);

    // 姓名判断結果を生成（既存の関数を使用）
    console.log('🔮 姓名判断結果を生成中...');
    
    // 動的にモジュールをインポート（Next.js環境）
    const { analyzeNameFortune } = await import('/lib/name-data-simple-fixed');
    const { calculateGogyo } = await import('/lib/advanced-gogyo');
    
    const nameAnalysisResult = analyzeNameFortune(lastName, firstName, gender);
    nameAnalysisResult.name = `${lastName}${firstName}`;
    
    console.log('✅ 姓名判断結果生成完了');
    console.log(`  総合スコア: ${nameAnalysisResult.totalScore}点\n`);

    // 五行分析結果を生成
    console.log('🌿 五行分析結果を生成中...');
    const birthdateObj = new Date(birthdate);
    const gogyoResult = calculateGogyo(lastName, firstName, birthdateObj);
    
    console.log('✅ 五行分析結果生成完了');
    console.log(`  優勢な要素: ${gogyoResult.dominantElement}\n`);

    // APIを呼び出し
    console.log('🚀 APIを呼び出し中...');
    const response = await fetch('/api/ai/generate-fortune', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nameAnalysisResult,
        gogyoResult,
        birthdate,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API呼び出しエラー:');
      console.error(`  ステータス: ${response.status} ${response.statusText}`);
      console.error(`  エラー内容: ${errorText}`);
      return;
    }

    const data = await response.json();
    
    console.log('✅ API呼び出し成功\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 生のJSONレスポンス:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:');
    console.error(error);
  }
})();

