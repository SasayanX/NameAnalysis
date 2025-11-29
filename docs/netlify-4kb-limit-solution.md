# Netlify 環境変数4KB制限の解決策

## 問題

Netlifyの環境変数の合計サイズが4KB制限を超えています。特に、`GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_JSON`のような大きなサービスアカウントキーのJSONが原因です。

## 解決策

### 方法1: サービスアカウントキーをファイルとして保存（推奨・プライベートリポジトリの場合）

プライベートリポジトリの場合、サービスアカウントキーをファイルとして保存し、Gitにコミットすることができます。

#### 手順

1. **サービスアカウントキーをダウンロード**
   - Google Cloud ConsoleからJSONキーをダウンロード

2. **プロジェクトに配置**
   ```
   functions/config/google-cloud-tts-service-account.json
   ```

3. **`.gitignore`を確認**
   - 現在、`functions/config/*.json`が`.gitignore`に含まれています
   - プライベートリポジトリの場合、この行をコメントアウトまたは削除する必要があります
   - 公開リポジトリの場合は、**絶対にコミットしないでください**

4. **環境変数を設定**
   - Netlify Dashboard → Site settings → Environment variables
   - `GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_PATH` = `functions/config/google-cloud-tts-service-account.json`
   - **`GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_JSON`を削除**（これが4KB制限を超えている原因）

5. **Gitにコミット**
   ```bash
   git add functions/config/google-cloud-tts-service-account.json
   git commit -m "Add Google Cloud TTS service account key"
   git push
   ```

#### 注意事項

- ⚠️ **公開リポジトリでは使用しないでください**
- プライベートリポジトリでも、最小限の権限を持つサービスアカウントを作成することを推奨
- 定期的にキーをローテーションする

### 方法2: Google Secret Managerを使用（推奨・本番環境）

ランタイムでGoogle Secret Managerからサービスアカウントキーを取得する方法です。

#### 利点

- 環境変数のサイズを大幅に削減
- セキュリティが向上
- キーのローテーションが容易

#### 実装方法

1. **Secret Managerにキーを保存**
   ```bash
   gcloud secrets create google-cloud-tts-service-account-key \
     --data-file=path/to/service-account-key.json
   ```

2. **サービスアカウントに権限を付与**
   ```bash
   gcloud secrets add-iam-policy-binding google-cloud-tts-service-account-key \
     --member="serviceAccount:YOUR_NETLIFY_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **コードを修正してSecret Managerから取得**
   - ただし、Secret Managerにアクセスするためには、別の認証情報が必要になる可能性があります

### 方法3: 他の大きな環境変数を削減

`GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_JSON`以外にも、大きな環境変数がないか確認してください：

- `FIREBASE_SERVICE_ACCOUNT_KEY_JSON`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON`
- その他の大きなJSON文字列

これらも同様に、ファイルパスに変更することを検討してください。

### 方法4: Netlify環境変数のスコープを調整（一時的な解決策）

Netlifyでは、環境変数のスコープを設定できます。不要な環境変数を削除または無効化してください。

1. Netlify Dashboard → Site settings → Environment variables
2. 使用していない大きな環境変数を削除
3. 必要最小限の環境変数のみを残す

## 推奨される対応

1. **すぐに対応**（デプロイを再開するため）:
   - `GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_JSON`を削除
   - サービスアカウントキーを`functions/config/`に配置
   - `GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_PATH`を設定
   - Gitにコミット（プライベートリポジトリの場合のみ）

2. **長期的な対応**:
   - すべての大きなサービスアカウントキーをファイルベースに移行
   - または、Google Secret Managerなどの外部シークレットマネージャーを使用

## 確認方法

環境変数のサイズを確認するには、Netlify Dashboardで各環境変数の値をコピーし、テキストエディタでサイズを確認してください。

現在のコードは、`GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_PATH`と`GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_JSON`の両方に対応しているため、環境変数をJSONからパスに変更するだけで動作するはずです。

