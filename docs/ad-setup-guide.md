# 広告設定ガイド

## 概要

このアプリケーションでは、環境に応じて異なる広告プラットフォームを使用します：
- **TWA環境（Androidアプリ）**: Google AdMob
- **ウェブ環境**: Google AdSense

## 環境変数の設定

### AdSense（ウェブ環境用）

`.env.local` または Netlify/Vercel の環境変数に以下を追加：

```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_ID=XXXXXXXXXX
```

**取得方法：**
1. [Google AdSense](https://www.google.com/adsense/) にアクセス
2. アカウントを作成またはログイン
3. 「広告」→「広告ユニット」から新しい広告ユニットを作成
4. `data-ad-client` の値が `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
5. `data-ad-slot` の値が `NEXT_PUBLIC_ADSENSE_SLOT_ID`

### AdMob（TWA環境用）

TWA環境では、Android側でAdMobを実装する必要があります。

**Android側の実装（`twa/app/src/main/java/.../LauncherActivity.java`）:**

```java
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;

public class LauncherActivity extends BrowserCompatActivity {
    private AdView adView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // AdMobの初期化
        MobileAds.initialize(this, initializationStatus -> {});
        
        // WebViewにJavaScriptインターフェースを追加
        WebView webView = getWebView();
        webView.addJavascriptInterface(new WebAppInterface(this), "Android");
    }
    
    // JavaScriptから呼び出されるメソッド
    public class WebAppInterface {
        Context mContext;
        
        WebAppInterface(Context c) {
            mContext = c;
        }
        
        @JavascriptInterface
        public void showAdBanner(String containerId) {
            runOnUiThread(() -> {
                // バナー広告を表示
                // 実装はAdMob SDKのドキュメントを参照
            });
        }
    }
}
```

**`twa/app/build.gradle` に追加：**

```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-ads:23.0.0'
}
```

## 広告の表示場所

現在、広告は以下の場所に表示されます：
- **フッターの上**: 全ページの下部にバナー広告を表示

## 広告表示の条件

- **無料プランのみ**: 有料プラン（basic/premium）のユーザーには広告を表示しません
- **環境検出**: 自動的にTWA環境かウェブ環境かを検出し、適切な広告を表示します

## トラブルシューティング

### AdSense広告が表示されない

1. 環境変数が正しく設定されているか確認
2. AdSenseアカウントが承認されているか確認
3. ブラウザのコンソールでエラーを確認
4. AdSenseの広告ユニットIDが正しいか確認

### AdMob広告が表示されない（TWA環境）

1. Android側の実装が完了しているか確認
2. `window.Android.showAdBanner` が正しく実装されているか確認
3. AdMobアカウントが設定されているか確認
4. AndroidManifest.xmlに必要な権限が追加されているか確認

## 今後の拡張

- インタースティシャル広告（分析完了時）
- リワード広告（制限解除用）
- 広告収益の追跡

