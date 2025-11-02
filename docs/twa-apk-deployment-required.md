# TWA APKデプロイ前の必須作業

## ⚠️ 重要な問題

**APKで詳細鑑定が全部見れる = 本番環境（seimei.app）に修正がデプロイされていない**

TWA（Trusted Web Activity）はWebサイトをラッピングしているため：
- APK内にコードは含まれない
- すべてのコードはWebサイト（`https://seimei.app`）から読み込まれる
- ローカルで修正しても、本番環境に反映されない限り無意味

## 🔧 必要な作業

### 1. 修正内容の確認

以下のファイルが修正されています：
- `components/name-analysis-result.tsx` - `isFreePlan`フラグ追加
- `app/ClientPage.tsx` - `currentPlan`初期化強化

### 2. デプロイ手順

1. **GitHubにプッシュ**
   ```bash
   git add components/name-analysis-result.tsx app/ClientPage.tsx
   git commit -m "fix: 無料プランでの詳細鑑定制限を強化"
   git push origin master
   ```

2. **Vercelで自動デプロイ**
   - GitHubへのプッシュで自動的にデプロイが開始されます
   - Vercel Dashboardでデプロイ状態を確認

3. **デプロイ完了を確認**
   - `https://seimei.app`で修正が反映されているか確認
   - ブラウザで無料プランで詳細鑑定の制限をテスト

4. **APKを再ビルド（オプション）**
   - デプロイ後、APKは自動的に最新のWebサイトを使用します
   - 再ビルドは不要ですが、バージョンを更新したい場合は再ビルド

## 📋 チェックリスト

- [ ] 修正したコードをGitHubにプッシュ
- [ ] Vercelでデプロイが完了
- [ ] `https://seimei.app`で無料プランでの制限が機能していることを確認
- [ ] ブラウザで確認後、APKでも同じ制限が機能していることを確認

## ⚠️ 注意事項

**現在のAPKは本番環境の古いコードを使用しているため、無料プランでも詳細鑑定が全部見えてしまいます。**

修正をデプロイするまでは、このAPKを配布すべきではありません。

