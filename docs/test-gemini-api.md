# Gemini AI鑑定APIテスト方法

## 方法1: ブラウザのコンソールから実行（推奨）

1. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

2. ブラウザで `http://localhost:3000` を開く

3. ブラウザの開発者ツール（F12）を開き、コンソールタブを選択

4. 以下のコードをコンソールに貼り付けて実行:

```javascript
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

    // 姓名判断結果を生成
    console.log('🔮 姓名判断結果を生成中...');
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
```

## 方法2: curlコマンドで実行

1. まず、テストデータを生成（Node.jsスクリプトまたは手動でJSONを作成）

2. curlコマンドでAPIを呼び出し:
   ```bash
   curl -X POST http://localhost:3000/api/ai/generate-fortune \
     -H "Content-Type: application/json" \
     -d @test-data.json
   ```

## 注意事項

- 開発サーバー（`npm run dev`）が起動している必要があります
- 環境変数 `GOOGLE_GENERATIVE_AI_API_KEY` が設定されている必要があります
- Firestoreの設定（`FIREBASE_SERVICE_ACCOUNT_KEY_PATH` または `FIREBASE_SERVICE_ACCOUNT_KEY_JSON`）が必要です

