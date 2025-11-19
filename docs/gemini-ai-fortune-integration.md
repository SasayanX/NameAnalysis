# Gemini AI鑑定機能の統合

## 概要

既存の姓名判断結果（5格、運勢データ）とFirestoreの`kotodama`コレクションに保存された言霊マスターデータを組み合わせて、Gemini APIでパーソナライズされたAI鑑定結果を生成する機能です。

**重要**: この機能は既存の姓名判断ロジックを使用し、Gemini APIに姓名判断をさせるのではなく、既存の結果を解釈して鑑定文を生成します。

## 実装内容

### 1. パッケージの追加

以下のパッケージを`package.json`に追加しました：

- `firebase-admin`: Firestoreへのアクセス用
- `@google/generative-ai`: Gemini APIクライアント用

### 2. APIエンドポイント

#### `/api/kotodama` (GET)

Firestoreから言霊マスターデータを取得します。

**クエリパラメータ:**
- `element` (オプション): 五行要素でフィルタリング（例: `水`, `木`, `火`, `土`, `金`）

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc-id",
      "phrase_jp": "受容",
      "advice_text": "柔軟性を持って受け入れることで、新しい可能性が開けます",
      "element": "水",
      "priority": 1
    }
  ],
  "count": 1
}
```

#### `/api/ai/generate-fortune` (POST)

既存の姓名判断結果を解釈して、Gemini APIでAI鑑定結果を生成します。

**リクエストボディ:**
```json
{
  "nameAnalysisResult": {
    "name": "山田太郎",
    "categories": [
      {
        "name": "天格",
        "strokeCount": 16,
        "fortune": "大吉",
        "explanation": "社会的な成功や対外的な印象を表します",
        "score": 95
      },
      // ... 他の4格（人格、地格、外格、総格）
    ],
    "totalScore": 85
  },
  "gogyoResult": {
    "elements": {
      "wood": 2,
      "fire": 1,
      "earth": 1,
      "metal": 1,
      "water": 4
    },
    "dominantElement": "水",
    "weakElement": "火",
    "yinYang": "陽"
  },
  "birthdate": "1990-01-01"
}
```

**レスポンス例:**
```json
{
  "success": true,
  "name": "山田太郎",
  "gender": "男性",
  "element": "水",
  "kotodama": [
    {
      "id": "doc-id",
      "phrase_jp": "受容",
      "advice_text": "..."
    }
  ],
  "aiFortune": {
    "fortune": "山田太郎さん（男性）の今日の運勢は...",
    "luckyElement": "水の要素",
    "advice": "今日の開運アドバイス"
  }
}
```

### 3. フロントエンド統合

#### `app/ClientPage.tsx`

- `handlePersonalAnalysis`関数内で、五行分析の結果から主要な要素（`dominantElement`）を取得
- `generateAiFortune`関数を呼び出してAI鑑定を生成
- 結果を`aiFortune`状態に保存

#### `components/name-analysis-result.tsx`

- AI鑑定結果を表示する新しいセクションを追加
- 鑑定文、ラッキー要素、開運アドバイス、使用された言霊を表示

## 環境変数の設定

### Firebase Service Account Key

Firestoreにアクセスするために、Firebase Service Account Keyが必要です。

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを選択
2. プロジェクト設定 → サービスアカウント → 新しい秘密鍵の生成
3. ダウンロードしたJSONファイルを`secret/`ディレクトリに配置
4. `.env.local`に以下を設定：

```env
# 方法1: ファイルパスを指定
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./secret/firebase-service-account-key.json

# 方法2: JSON文字列を直接設定（Vercelなどの環境変数で推奨）
# FIREBASE_SERVICE_ACCOUNT_KEY_JSON={"type":"service_account",...}
```

### Google Gemini API Key

1. [Google AI Studio](https://makersuite.google.com/app/apikey) でAPIキーを取得
2. `.env.local`に以下を設定：

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

## 使用方法

1. 名前入力フォームに姓名を入力
2. 「姓名判断を実行」ボタンをクリック
3. 通常の姓名判断結果が表示される
4. 五行分析が完了すると、自動的にAI鑑定が生成される
5. 「詳細」タブの下部に「AI鑑定（言霊と名前の組み合わせ分析）」セクションが表示される

## データフロー

1. ユーザーが姓名判断を実行
2. 既存の姓名判断ロジック（`analyzeNameFortune`）が実行され、5格の分析結果が取得される
3. 五行分析（`calculateGogyo`）が実行され、五行要素の分析結果が取得される
4. `generateAiFortune`関数が呼び出される（既存の姓名判断結果と五行分析結果を渡す）
5. Firestoreから該当要素の言霊データを取得（`/api/kotodama?element=水`）
6. Gemini APIにプロンプトを送信（既存の姓名判断結果、五行分析結果、言霊データを含む）
7. Gemini APIが既存の結果を解釈して鑑定文を生成
8. AI鑑定結果を取得し、UIに表示

## 注意事項

- Firestoreの`kotodama`コレクションには、以下のフィールドが必要です：
  - `phrase_jp`: 言霊の日本語表記
  - `advice_text`: 助言テキスト
  - `element`: 五行要素（`水`, `木`, `火`, `土`, `金`）
  - `priority`: 優先度（数値、降順でソート）

- Gemini APIのレスポンスがJSON形式でない場合、テキスト全体を鑑定文として使用します

- エラーが発生しても既存の姓名判断結果は表示されます（AI鑑定のみ失敗）

## トラブルシューティング

### Firestore接続エラー

- `FIREBASE_SERVICE_ACCOUNT_KEY_PATH`または`FIREBASE_SERVICE_ACCOUNT_KEY_JSON`が正しく設定されているか確認
- Firebase ConsoleでFirestore APIが有効になっているか確認

### Gemini APIエラー

- `GOOGLE_GENERATIVE_AI_API_KEY`が正しく設定されているか確認
- APIキーの有効期限を確認
- レート制限に達していないか確認

### 言霊データが取得できない

- Firestoreの`kotodama`コレクションにデータが存在するか確認
- コレクション名が`kotodama`であるか確認
- フィールド名が正しいか確認（`phrase_jp`, `advice_text`, `element`, `priority`）

