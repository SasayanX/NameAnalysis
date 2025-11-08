# Google Play課金ポリシー対応について

## 🚨 重要な問題

テスターからの報告により、現在の実装がGoogle Playポリシーに違反している可能性が判明しました。

## 現在の状況

### 実装されている課金方式
- **Square決済**: サブスクリプション（ベーシック330円/月、プレミアム550円/月）
- **GMO決済**: サブスクリプション（実装済みだが未使用）
- **Web版**: これらの決済システムを使用

### アプリ内で解放される機能
以下の機能が課金により解放されています：

1. **ベーシックプラン（330円/月）**
   - 個人名判断: 1日10回（無料は1日1回）
   - 会社名判断: 1日10回（無料は1日1回）
   - 相性診断: 1日3回（無料は利用不可）
   - 数秘術分析: 1日5回（無料は利用不可）
   - 赤ちゃん名付け: 1日5回（無料は利用不可）
   - 運勢フロー分析: 1日5回（無料は利用不可）
   - PDF出力: 1日10回（無料は利用不可）
   - 履歴保存: 50件まで（無料は10件）

2. **プレミアムプラン（550円/月）**
   - 全機能無制限利用
   - おなまえ格付けランク（S・A・B・C・D評価）
   - 全国ランキング比較
   - 優先サポート
   - カスタムレポート

## Google Playポリシー要件

### 必須要件
> **アプリ内でデジタルコンテンツやサービスの購入を提供する場合、Google Playの課金システムを使用することが義務付けられています。**

### 該当するケース
✅ **該当する（必須）**:
- アプリ内で機能を解放する（相性診断、数秘術分析など）
- デジタルコンテンツへのアクセス（プレミアム機能）
- サブスクリプションサービス（ベーシック/プレミアムプラン）

### 例外（Google Play Billing不要）
❌ **該当しない**:
- 物理的な商品の販売
- アプリ外で使用されるコンテンツ
- 実際のサービス（レストラン予約、タクシー配車など）

## 違反のリスク

Google Playポリシー違反により、以下の措置が取られる可能性があります：

1. **アプリの配信停止**
2. **アプリの削除**
3. **開発者アカウントの停止**
4. **既存ユーザーへの影響**

## 対応策

### オプション1: Bubblewrap + Digital Goods APIによる実装（推奨）

**Bubblewrapでの対応が可能**: 
Bubblewrapで作成したTWAアプリでも、Google Play Billingに対応可能です。

**実装内容**:
1. `twa-manifest.json`で`playBilling`機能を有効化 ✅ (完了)
2. BubblewrapでAABを再ビルド
3. Google Play Consoleでサブスクリプション商品を設定
4. ウェブ側でDigital Goods APIを使用して課金処理を実装
5. サーバー側で購入レシートを検証

**メリット**:
- Google Playポリシーに完全準拠
- ウェブ技術ベースのまま実装可能
- ネイティブAndroid開発不要
- Google Playの決済インフラを活用
- ユーザーはGoogleアカウントで決済可能

**デメリット**:
- Digital Goods APIの実装が必要（1週間程度）
- Google Play Consoleでの商品設定が必要
- Google Play Developerアカウントとマーチャントアカウントのセットアップが必要

**技術仕様**:
- Bubblewrap 1.8.2以上が推奨
- Digital Goods APIまたはPayment Request APIを使用
- TWA内でGoogle Play Billing APIを呼び出し可能

### オプション2: Web版のみ課金提供（暫定対応）

**実装内容**:
1. Androidアプリ（TWA）内では課金機能を無効化
2. アプリ内からはWeb版へのリンクを表示
3. Web版でのみ決済を提供

**メリット**:
- 即座に対応可能
- 開発工数が少ない

**デメリット**:
- ユーザー体験が悪化
- アプリ内で直接課金できない
- 長期的にはGoogle Play Billingが必要

### オプション3: ハイブリッド対応

**実装内容**:
1. AndroidアプリではGoogle Play Billingを使用
2. Web版ではSquare/GMO決済を継続
3. プラットフォーム検出で適切な決済方法を選択

**メリット**:
- プラットフォームごとに最適な決済方法
- 段階的な移行が可能

**デメリット**:
- 実装が複雑
- 決済システムの管理が2つ必要

## 推奨される対応

### 短期対応（緊急）
1. **Androidアプリ内の課金機能を無効化**
   - Square決済のボタンをAndroidアプリ内では非表示
   - 代わりに「Web版で決済」へのリンクを表示

2. **Google Play Consoleでの確認**
   - 現在のアプリステータスを確認
   - ポリシー違反の警告がないか確認

### 長期対応（推奨）
1. **Google Play Billing Libraryの実装**
   - AndroidアプリにGoogle Play Billing Libraryを追加
   - サブスクリプション商品を設定
   - サーバー側でのレシート検証を実装

2. **段階的な移行**
   - まずベーシックプランのみ実装
   - その後プレミアムプランを追加

## 技術的な実装要件

### Google Play Billing Library
```gradle
dependencies {
    implementation 'com.android.billingclient:billing:6.1.0'
    implementation 'com.android.billingclient:billing-ktx:6.1.0'
}
```

### 必要な作業
1. Google Play Consoleでの商品設定
   - ベーシックプラン: 月額330円
   - プレミアムプラン: 月額550円
2. Androidアプリでの実装
   - BillingClientの初期化
   - 商品情報の取得
   - 購入フローの実装
   - 購入状態の検証
3. サーバー側での実装
   - Google Play APIを使用したレシート検証
   - サブスクリプション状態の管理

## 参考資料

- [Google Play Billing Library Documentation](https://developer.android.com/google/play/billing)
- [Google Play Billing Policy](https://support.google.com/googleplay/android-developer/answer/9888179)
- [Google Play Console - 商品管理](https://support.google.com/googleplay/android-developer/answer/140504)

## 次のステップ

1. ✅ **現状確認**: このドキュメントで問題を把握
2. ⏳ **緊急対応**: Androidアプリ内の課金機能を無効化
3. ⏳ **長期対応**: Google Play Billing Libraryの実装計画を策定
4. ⏳ **実装**: Google Play Billing Libraryの統合

## 注意事項

- **Web版での決済は継続可能**: Web版（seimei.app）ではSquare/GMO決済を継続して使用できます
- **TWAの制限**: TWA（Trusted Web Activity）内でWeb版の決済を使用することは、Google Playポリシーに違反する可能性があります
- **即座の対応が必要**: アプリが既に公開されている場合は、早急な対応が必要です

