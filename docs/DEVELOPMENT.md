# 開発ガイド

## 概要

姓名判断アプリの開発環境構築と開発フローのガイドです。

## 前提条件

- Node.js 18.0.0 以上
- pnpm 8.0.0 以上
- Git

## 環境構築

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd NameAnalysis
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

```bash
cp env.example .env.local
```

`.env.local` ファイルを編集して必要な環境変数を設定してください。

### 4. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで `http://localhost:3000` にアクセスしてアプリケーションを確認できます。

## 開発フロー

### ブランチ戦略

- `main`: 本番環境用ブランチ
- `develop`: 開発用ブランチ
- `feature/*`: 機能開発用ブランチ
- `hotfix/*`: 緊急修正用ブランチ

### コミットメッセージ

以下の形式に従ってください：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードスタイル修正
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: その他の変更

**例:**
```
feat(api): add subscription creation endpoint
fix(ui): resolve layout issue on mobile devices
docs(readme): update installation instructions
```

## テスト

### テストの実行

```bash
# 全テスト実行
pnpm test

# ウォッチモード
pnpm test:watch

# カバレッジ付きテスト
pnpm test:coverage
```

### テストの種類

1. **ユニットテスト**: 個別の関数・コンポーネントのテスト
2. **統合テスト**: 複数の機能を組み合わせたテスト
3. **E2Eテスト**: エンドツーエンドのテスト

### テストファイルの配置

```
__tests__/
├── unit/           # ユニットテスト
├── integration/    # 統合テスト
└── e2e/           # E2Eテスト
```

## コードスタイル

### ESLint設定

```bash
# リント実行
pnpm lint

# 自動修正
pnpm lint:fix
```

### Prettier設定

```bash
# フォーマット実行
pnpm format
```

### TypeScript

- 厳密な型チェックを有効化
- `any` 型の使用を避ける
- 適切な型定義を作成

## パフォーマンス

### パフォーマンス監視

```typescript
import { performanceLogger } from '@/lib/performance-logger'

// 同期処理の測定
const result = performanceLogger.measure('operation-name', () => {
  return expensiveOperation()
})

// 非同期処理の測定
const result = await performanceLogger.measureAsync('async-operation', async () => {
  return await expensiveAsyncOperation()
})
```

### 最適化のベストプラクティス

1. **メモ化**: `React.memo`, `useMemo`, `useCallback` の適切な使用
2. **遅延読み込み**: 重いコンポーネントの動的インポート
3. **バンドル最適化**: 不要な依存関係の削除
4. **画像最適化**: Next.js Image コンポーネントの使用

## デバッグ

### 開発環境でのデバッグ

```typescript
// 開発環境でのみログ出力
if (process.env.NODE_ENV === 'development') {
  console.log('Debug information:', data)
}
```

### パフォーマンスデバッグ

```typescript
// パフォーマンス測定
const startTime = performance.now()
// 処理
const endTime = performance.now()
console.log(`処理時間: ${endTime - startTime}ms`)
```

## デプロイ

### 本番環境へのデプロイ

1. **Vercel Dashboard** で環境変数を設定
2. **GitHub** にコードをプッシュ
3. **Vercel** が自動的にデプロイを実行

### 環境変数の設定

本番環境で必要な環境変数：

```bash
# Square 決済設定
SQUARE_APPLICATION_ID=sq0idp-...
SQUARE_ACCESS_TOKEN=EAAAE...
SQUARE_LOCATION_ID=LM...
SQUARE_WEBHOOK_SIGNATURE_KEY=...

# 分析・監視
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_CLARITY_PROJECT_ID=...

# 本番環境フラグ
NODE_ENV=production
```

## トラブルシューティング

### よくある問題

1. **ビルドエラー**
   ```bash
   pnpm build
   ```
   でビルドエラーを確認

2. **型エラー**
   ```bash
   pnpm type-check
   ```
   で型チェックを実行

3. **テスト失敗**
   ```bash
   pnpm test --verbose
   ```
   で詳細なテスト結果を確認

### ログの確認

- **開発環境**: ブラウザのコンソール
- **本番環境**: Vercel Dashboard の Functions ログ

## 貢献ガイドライン

1. 新しい機能を追加する前に Issue を作成
2. 機能ブランチを作成して開発
3. テストを追加・更新
4. ドキュメントを更新
5. Pull Request を作成

## 参考資料

- [Next.js ドキュメント](https://nextjs.org/docs)
- [React ドキュメント](https://react.dev)
- [TypeScript ドキュメント](https://www.typescriptlang.org/docs)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
