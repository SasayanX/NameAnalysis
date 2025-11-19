# Gemini AI鑑定APIテスト - ブラウザコンソール用

## 実行方法

1. 開発サーバーを起動: `npm run dev`
2. ブラウザで `http://localhost:3000` を開く
3. 開発者ツール（F12）→ コンソールタブ
4. 以下のコードを貼り付けて実行

## テストコード（コピー&ペースト用）

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

    // 姓名判断結果を生成（既存のAPIを使用）
    console.log('🔮 姓名判断結果を生成中...');
    
    // まず、既存のテストAPIで姓名判断結果を取得
    const testResponse = await fetch('/api/test-name-analysis');
    const testData = await testResponse.json();
    
    // または、直接テストデータを構築
    const nameAnalysisResult = {
      name: '山田太郎',
      categories: [
        {
          name: '天格',
          strokeCount: 8,
          fortune: '中吉',
          explanation: '社会的な成功や対外的な印象を表します',
          description: '社会的な成功や対外的な印象を表します',
          score: 70
        },
        {
          name: '人格',
          strokeCount: 9,
          fortune: '凶',
          explanation: '性格や才能、人生の中心的な運勢を表します',
          description: '性格や才能、人生の中心的な運勢を表します',
          score: 30
        },
        {
          name: '地格',
          strokeCount: 18,
          fortune: '中吉',
          explanation: '家庭環境や若年期の運勢を表します',
          description: '家庭環境や若年期の運勢を表します',
          score: 70
        },
        {
          name: '外格',
          strokeCount: 17,
          fortune: '吉',
          explanation: '対人関係や社会との関わり方を表します',
          description: '対人関係や社会との関わり方を表します',
          score: 80
        },
        {
          name: '総格',
          strokeCount: 26,
          fortune: '凶',
          explanation: '人生全体の運勢を総合的に表します',
          description: '人生全体の運勢を総合的に表します',
          score: 40
        }
      ],
      totalScore: 54
    };

    // 五行分析結果
    const gogyoResult = {
      elements: {
        wood: 0,
        fire: 2,
        earth: 1,
        metal: 3,
        water: 3
      },
      dominantElement: '金',
      weakElement: '木',
      yinYang: '陽',
      externalLuck: 8,
      internalLuck: 9,
      lifeLuck: 26,
      birthStars: ['火星', '火星', '水星', '水星'],
      nameStars: ['金星', '水星', '金星', '金星', '土星']
    };

    console.log('✅ データ準備完了');
    console.log(`  総合スコア: ${nameAnalysisResult.totalScore}点`);
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

    // レスポンスの構造を確認
    if (data.success && data.aiFortune) {
      console.log('📊 レスポンス構造:');
      console.log(`  success: ${data.success}`);
      console.log(`  name: ${data.name}`);
      console.log(`  element: ${data.element}`);
      console.log(`  kotodama数: ${data.kotodama?.length || 0}個`);
      if (data.aiFortune.fortune) {
        console.log(`  aiFortune.fortune: ${data.aiFortune.fortune.substring(0, 50)}...`);
      }
      if (data.aiFortune.personality) {
        console.log(`  aiFortune.personality: ${data.aiFortune.personality.substring(0, 50)}...`);
      }
      if (data.aiFortune.talents) {
        console.log(`  aiFortune.talents: ${data.aiFortune.talents.substring(0, 50)}...`);
      }
      if (data.aiFortune.challenges) {
        console.log(`  aiFortune.challenges: ${data.aiFortune.challenges.substring(0, 50)}...`);
      }
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:');
    console.error(error);
    if (error.message) {
      console.error(`  エラーメッセージ: ${error.message}`);
    }
  }
})();
```

## 注意事項

- 開発サーバー（`npm run dev`）が起動している必要があります
- 環境変数 `GOOGLE_GENERATIVE_AI_API_KEY` が設定されている必要があります
- Firestoreの設定（`FIREBASE_SERVICE_ACCOUNT_KEY_PATH` または `FIREBASE_SERVICE_ACCOUNT_KEY_JSON`）が必要です

