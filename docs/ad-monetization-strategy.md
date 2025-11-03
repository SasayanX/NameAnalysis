# 広告による無料プランマネタイズ戦略

## 📋 概要

将来的に無料プランに広告を表示してマネタイズするための戦略と実装手順です。

## ✅ 現在の状況

- **現在**: 広告IDを使用していない → Google Play Consoleでは「いいえ」と回答
- **将来**: 広告を追加可能（いつでも申告を変更可能）

## 🎯 無料プランのマネタイズ戦略

### 1. 広告による収益化

#### 推奨: Google AdMob
- **バナー広告**: 結果表示画面の下部に表示
- **インタースティシャル広告**: 分析完了時に表示（1日3回まで）
- **リワード広告**: 動画視聴で1回分の分析制限解除

#### 収益予測
```
無料ユーザー 1,000人 × 1日3回分析 × 30日 = 90,000回/月
eCPM（推定）: 50円
月間広告収益: 90,000回 × 0.05 = 4,500円

無料ユーザー 10,000人の場合:
月間広告収益: 45,000円
```

### 2. プラン設計の見直し

#### 現在の無料プラン
- 個人名分析: 1日1回
- 会社名分析: 1日1回
- 広告: なし

#### 改良案: 広告あり無料プラン
```typescript
const freePlanWithAds = {
  price: 0,
  features: [
    "個人名分析: 1日3回（広告視聴で+2回）",
    "会社名分析: 1日1回",
    "広告表示あり（結果画面・分析完了時）",
    "リワード広告で制限解除"
  ],
  limits: {
    personalAnalysis: 3, // 基本3回、広告で+2回
    companyAnalysis: 1,
    ads: {
      banner: true,
      interstitial: "3回/日", // 分析完了時に表示
      rewarded: "制限解除用" // 動画視聴で1回追加
    }
  }
}
```

#### ベーシックプランの価値提案
```typescript
const basicPlan = {
  price: 330,
  features: [
    "個人名分析: 無制限",
    "会社名分析: 無制限",
    "広告非表示", // ここが大きな価値
    "詳細分析",
    "PDF出力"
  ]
}
```

## 🔧 広告実装手順

### Step 1: Google Play Consoleの申告変更

1. Google Play Console → アプリの内容 → データの収集とセキュリティ
2. 「広告 ID」セクションで「はい」に変更
3. 理由: 「無料ユーザー向けに広告を表示するため」

### Step 2: AndroidManifest.xmlに権限追加

```xml
<!-- twa/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.nameanalysis.ai">
    
    <!-- 広告ID権限追加 -->
    <uses-permission android:name="com.google.android.gms.permission.AD_ID"/>
    
    <!-- 既存の権限... -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    
    <!-- ... -->
</manifest>
```

### Step 3: build.gradleにAdMob SDK追加

```gradle
// twa/app/build.gradle
dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.6.2'
    
    // Google AdMob SDK追加
    implementation 'com.google.android.gms:play-services-ads:23.0.0'
}
```

### Step 4: Webアプリ側での広告制御

#### 広告表示コンポーネント作成

```typescript
// components/ad-banner.tsx
"use client"

import { useEffect } from 'react'
import { SubscriptionManager } from '@/lib/subscription-manager'

export function AdBanner() {
  const subscription = SubscriptionManager.getInstance().getCurrentPlan()
  
  // 無料プランの場合のみ広告を表示
  if (subscription.id !== 'free') {
    return null
  }
  
  useEffect(() => {
    // TWA経由でAndroidの広告を表示
    // または、Web版ではGoogle AdSenseを使用
    if (typeof window !== 'undefined' && (window as any).Android) {
      // Android WebView経由でAdMob広告を表示
      ;(window as any).Android.showAdBanner()
    }
  }, [])
  
  return (
    <div id="ad-banner" className="w-full h-20 bg-gray-100 flex items-center justify-center">
      <p className="text-sm text-gray-500">広告</p>
    </div>
  )
}
```

#### 分析完了時の広告表示

```typescript
// lib/analysis-complete-handler.ts
import { SubscriptionManager } from './subscription-manager'

export async function handleAnalysisComplete() {
  const subscription = SubscriptionManager.getInstance().getCurrentPlan()
  
  if (subscription.id === 'free') {
    // 無料プランの場合、インタースティシャル広告を表示
    const adShownToday = localStorage.getItem('adShownToday')
    const today = new Date().toDateString()
    
    if (adShownToday !== today) {
      // 1日3回まで広告を表示
      const adCount = parseInt(localStorage.getItem('adCount') || '0')
      
      if (adCount < 3) {
        showInterstitialAd()
        localStorage.setItem('adCount', String(adCount + 1))
        localStorage.setItem('adShownToday', today)
      }
    }
  }
}

function showInterstitialAd() {
  if (typeof window !== 'undefined' && (window as any).Android) {
    ;(window as any).Android.showInterstitialAd()
  }
}
```

### Step 5: Android側の実装（TWA）

```java
// twa/app/src/main/java/com/nameanalysis/ai/LauncherActivity.java
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.rewarded.RewardedAd;

public class LauncherActivity extends BrowserActivity {
    private InterstitialAd mInterstitialAd;
    private RewardedAd mRewardedAd;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // AdMob初期化
        MobileAds.initialize(this, initializationStatus -> {});
        
        // JavaScriptインターフェースを追加
        WebView webView = getWebView();
        webView.addJavascriptInterface(new WebAppInterface(this), "Android");
    }
    
    public class WebAppInterface {
        Context mContext;
        
        WebAppInterface(Context c) {
            mContext = c;
        }
        
        @JavascriptInterface
        public void showAdBanner() {
            runOnUiThread(() -> {
                // バナー広告表示
                AdView adView = findViewById(R.id.adView);
                AdRequest adRequest = new AdRequest.Builder().build();
                adView.loadAd(adRequest);
            });
        }
        
        @JavascriptInterface
        public void showInterstitialAd() {
            runOnUiThread(() -> {
                // インタースティシャル広告表示
                AdRequest adRequest = new AdRequest.Builder().build();
                InterstitialAd.load(mContext, "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX", 
                    adRequest, new InterstitialAdLoadCallback() {
                        @Override
                        public void onAdLoaded(@NonNull InterstitialAd interstitialAd) {
                            mInterstitialAd = interstitialAd;
                            mInterstitialAd.show(LauncherActivity.this);
                        }
                    });
            });
        }
        
        @JavascriptInterface
        public void showRewardedAd() {
            runOnUiThread(() -> {
                // リワード広告表示
                AdRequest adRequest = new AdRequest.Builder().build();
                RewardedAd.load(mContext, "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX", 
                    adRequest, new RewardedAdLoadCallback() {
                        @Override
                        public void onAdLoaded(@NonNull RewardedAd rewardedAd) {
                            mRewardedAd = rewardedAd;
                            mRewardedAd.show(LauncherActivity.this, rewardItem -> {
                                // 報酬を付与（分析回数+1）
                                webView.evaluateJavascript(
                                    "window.grantAnalysisReward();", null);
                            });
                        }
                    });
            });
        }
    }
}
```

## 📊 収益シミュレーション

### シナリオ1: 保守的（1,000ユーザー）
- 無料ユーザー: 900人
- 有料ユーザー: 100人（基本50人、プレミアム50人）
- 広告収益: 4,500円/月
- サブスク収益: 44,000円/月（基本16,500円 + プレミアム27,500円）
- **合計: 48,500円/月**

### シナリオ2: 楽観的（10,000ユーザー）
- 無料ユーザー: 8,500人
- 有料ユーザー: 1,500人（基本1,000人、プレミアム500人）
- 広告収益: 38,250円/月
- サブスク収益: 577,500円/月（基本330,000円 + プレミアム275,000円）
- **合計: 615,750円/月**

## 🎯 実装優先順位

### Phase 1: 基本広告実装（1-2週間）
1. ✅ Google Play Console申告変更
2. ✅ AndroidManifest.xml権限追加
3. ✅ AdMob SDK追加
4. ✅ バナー広告実装

### Phase 2: インタースティシャル広告（1週間）
1. ✅ 分析完了時の広告表示
2. ✅ 1日3回制限
3. ✅ 広告表示カウント管理

### Phase 3: リワード広告（1週間）
1. ✅ 動画視聴で分析回数+1
2. ✅ 報酬付与システム
3. ✅ UI改善

## ⚠️ 注意事項

1. **ユーザー体験**: 広告は適度に。過度な広告は離脱率を上げる
2. **課金誘導**: 「広告非表示」がベーシックプランの大きな価値
3. **収益バランス**: 広告収益とサブスク収益のバランスを取る
4. **プライバシー**: 広告IDの使用目的を明確に説明

## 📝 Google Play Consoleでの回答

### 現在（広告なし）
- **広告IDを使用していますか？**: いいえ

### 将来（広告追加後）
- **広告IDを使用していますか？**: はい
- **理由**: 無料ユーザー向けにGoogle AdMobを使用して広告を表示するため

## 🔄 申告変更のタイミング

1. 広告実装が完了したら
2. テスト広告が正常に動作することを確認後
3. 本番リリース前にGoogle Play Consoleで申告を「はい」に変更

## ✅ まとめ

- **現在**: 「いいえ」で問題なし
- **将来**: いつでも「はい」に変更可能
- **実装**: 上記手順に従って実装
- **収益**: 無料ユーザーからも広告収益を獲得可能

無料プランのマネタイズは、広告とサブスクリプションの両方で実現できます。
