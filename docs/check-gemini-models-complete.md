# Gemini APIで使用可能なモデルを完全に確認する方法

## ブラウザのコンソールで実行

以下のコードをブラウザのコンソールに貼り付けて実行してください：

```javascript
(async function checkGeminiModelsComplete() {
  // .env.localからAPIキーを取得できないため、手動で設定してください
  const apiKey = 'YOUR_API_KEY'; // ← ここに実際のAPIキーを入力
  
  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    console.error('❌ APIキーを設定してください');
    return;
  }
  
  try {
    console.log('🔍 Gemini APIで使用可能なモデルを確認中...\n');
    console.log(`APIキー: ${apiKey.substring(0, 10)}...\n`);
    
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    console.log('📡 APIを呼び出し中...\n');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API呼び出しエラー: ${response.status} ${response.statusText}`);
      console.error('レスポンス:', errorText);
      return;
    }
    
    const data = await response.json();
    
    // 完全なレスポンスを表示
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 完全なJSONレスポンス:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // モデルが存在するか確認
    if (data.models && Array.isArray(data.models)) {
      console.log(`📊 総モデル数: ${data.models.length}個\n`);
      
      // すべてのモデルを表示
      console.log('📋 すべてのモデル:');
      data.models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name || 'N/A'}`);
        if (model.displayName) {
          console.log(`   表示名: ${model.displayName}`);
        }
        if (model.supportedGenerationMethods) {
          console.log(`   サポートメソッド: ${model.supportedGenerationMethods.join(', ')}`);
        }
        console.log('');
      });
      
      // generateContentをサポートするモデルをフィルタ
      const supportedModels = data.models
        .filter((model) => {
          const methods = model.supportedGenerationMethods || [];
          return methods.includes('generateContent');
        })
        .map((model) => ({
          name: model.name ? model.name.replace('models/', '') : 'N/A',
          displayName: model.displayName,
          description: model.description,
          methods: model.supportedGenerationMethods,
        }));
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ generateContentをサポートするモデル: ${supportedModels.length}個`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (supportedModels.length > 0) {
        supportedModels.forEach((model, index) => {
          console.log(`${index + 1}. ${model.name}`);
          if (model.displayName) {
            console.log(`   表示名: ${model.displayName}`);
          }
          if (model.description) {
            console.log(`   説明: ${model.description}`);
          }
          console.log('');
        });
        
        // 推奨モデルを表示
        const recommended = supportedModels.find((m) => 
          m.name.includes('flash') || m.name.includes('pro')
        );
        
        if (recommended) {
          console.log(`💡 推奨モデル: ${recommended.name}\n`);
        }
      } else {
        console.log('⚠️ generateContentをサポートするモデルが見つかりませんでした');
      }
      
    } else {
      console.error('❌ モデルデータが存在しません');
      console.log('レスポンス構造:', Object.keys(data));
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:');
    console.error('エラーメッセージ:', error.message);
    console.error('スタック:', error.stack);
  }
})();
```

## 結果に基づく次のステップ

1. **完全なJSONレスポンスを確認**して、使用可能なモデル名を特定
2. 特定したモデル名を`app/api/ai/generate-fortune/route.ts`の`modelNames`配列に追加
3. 開発サーバーを再起動してテスト

