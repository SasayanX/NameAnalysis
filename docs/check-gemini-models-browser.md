# Gemini APIで使用可能なモデルを確認する方法

## 方法1: ブラウザのコンソールから実行（推奨）

1. ブラウザで `http://localhost:3000` を開く
2. 開発者ツール（F12）→ コンソールタブ
3. 以下のコードを貼り付けて実行

**注意**: `YOUR_API_KEY`の部分を、`.env.local`に設定した実際のAPIキーに置き換えてください。

```javascript
(async function checkGeminiModels() {
  // .env.localからAPIキーを取得できないため、手動で設定してください
  const apiKey = 'YOUR_API_KEY'; // ← ここに実際のAPIキーを入力
  
  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    console.error('❌ APIキーを設定してください');
    console.error('   .env.localファイルからGOOGLE_GENERATIVE_AI_API_KEYの値をコピーして、上記のapiKey変数に設定してください');
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
    
    if (data.models && data.models.length > 0) {
      console.log('✅ 使用可能なモデル:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // generateContentをサポートするモデルをフィルタ
      const supportedModels = data.models
        .filter((model) => {
          return model.supportedGenerationMethods?.includes('generateContent');
        })
        .map((model) => ({
          name: model.name.replace('models/', ''),
          displayName: model.displayName,
          description: model.description,
        }));
      
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
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`\n📊 合計: ${supportedModels.length}個のモデルが使用可能\n`);
      
      // 推奨モデルを表示
      const recommended = supportedModels.find((m) => 
        m.name.includes('flash') || m.name.includes('pro')
      );
      
      if (recommended) {
        console.log(`💡 推奨モデル: ${recommended.name}\n`);
      }
      
      // JSON形式でも出力
      console.log('📦 完全なJSONレスポンス:');
      console.log(JSON.stringify(data, null, 2));
      
    } else {
      console.error('❌ モデルが見つかりませんでした');
      console.log('レスポンス:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:');
    console.error('エラーメッセージ:', error.message);
  }
})();
```

## 方法2: curlコマンドで実行（PowerShell）

PowerShellで以下のコマンドを実行してください：

```powershell
# .env.localからAPIキーを取得（手動で設定する必要があります）
$apiKey = "YOUR_API_KEY"  # ← ここに実際のAPIキーを入力

$url = "https://generativelanguage.googleapis.com/v1/models?key=$apiKey"

Invoke-RestMethod -Uri $url -Method Get | ConvertTo-Json -Depth 10
```

## 方法3: Node.jsスクリプトで実行

ターミナルで以下のコマンドを実行：

```bash
node scripts/check-gemini-models.js
```

## 結果の解釈

### ✅ 成功した場合
- モデルのリストが表示されます
- `generateContent`をサポートするモデル名を確認してください
- そのモデル名を`app/api/ai/generate-fortune/route.ts`の`modelNames`配列に追加してください

### ❌ 401 Unauthorized
- APIキーが無効です
- `.env.local`のAPIキーを再確認してください
- [Google AI Studio](https://makersuite.google.com/app/apikey)で新しいAPIキーを生成してください

### ❌ 404 Not Found
- エンドポイントURLが間違っているか、Gemini APIが有効化されていません
- Google Cloud ConsoleでGemini APIが有効化されているか確認してください

### ❌ 429 Too Many Requests
- クォータを超過しています
- しばらく待ってから再試行してください
- または、有料プランにアップグレードしてください

