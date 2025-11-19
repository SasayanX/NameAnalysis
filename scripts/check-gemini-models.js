/**
 * Gemini APIで使用可能なモデルをリストアップするスクリプト
 * Node.jsのfetch APIを使用
 */

// .env.localファイルを読み込む（簡易版）
const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

const env = loadEnvLocal();
const apiKey = env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.error('❌ GOOGLE_GENERATIVE_AI_API_KEYが設定されていません');
  console.error('   .env.localファイルにAPIキーを設定してください');
  process.exit(1);
}

console.log('🔍 Gemini APIで使用可能なモデルを確認中...\n');
console.log(`APIキー: ${apiKey.substring(0, 10)}...\n`);

// fetch APIを使用（Node.js 18+）
async function checkModels() {
  try {
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
          // supportedGenerationMethodsにgenerateContentが含まれているか確認
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
    if (error.stack) {
      console.error('スタック:', error.stack);
    }
  }
}

// スクリプトを実行
checkModels();

