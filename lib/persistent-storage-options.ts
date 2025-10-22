// 永続化オプションの説明と実装ガイド

export interface PersistentStorageOption {
  name: string
  description: string
  pros: string[]
  cons: string[]
  implementation: string
  cost: string
}

export const STORAGE_OPTIONS: PersistentStorageOption[] = [
  {
    name: "Supabase Database",
    description: "PostgreSQLデータベースでの永続化",
    pros: ["完全な永続化", "複数ユーザー間でのデータ共有", "リアルタイム同期", "無料枠あり"],
    cons: ["初期設定が必要", "データベース設計が必要"],
    implementation: "環境変数でSupabase接続情報を設定",
    cost: "月額0円〜（無料枠：50MB、50,000行）",
  },
  {
    name: "Vercel KV (Redis)",
    description: "Redis互換のキーバリューストア",
    pros: ["高速アクセス", "Vercelとの統合が簡単", "スケーラブル"],
    cons: ["有料プランが必要", "構造化データには不向き"],
    implementation: "Vercel KV統合を有効化",
    cost: "月額20ドル〜",
  },
  {
    name: "GitHub Repository",
    description: "GitHubリポジトリのファイルとして保存",
    pros: ["完全無料", "バージョン管理", "バックアップ自動"],
    cons: ["更新に時間がかかる", "API制限あり"],
    implementation: "GitHub APIでファイル更新",
    cost: "無料",
  },
  {
    name: "ローカルエクスポート/インポート",
    description: "ユーザーがファイルで管理",
    pros: ["完全無料", "ユーザーが完全制御", "プライバシー保護"],
    cons: ["手動管理が必要", "デバイス間同期なし"],
    implementation: "既に実装済み",
    cost: "無料",
  },
]

// 推奨される実装順序
export const IMPLEMENTATION_PRIORITY = [
  "ローカルエクスポート/インポート（現在実装済み）",
  "GitHub Repository（無料で永続化）",
  "Supabase Database（本格運用向け）",
  "Vercel KV（高性能が必要な場合）",
]
