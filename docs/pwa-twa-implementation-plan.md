# PWA/TWA実装計画

## 概要
既存の姓名判断アプリをPWA（Progressive Web App）とTWA（Trusted Web Activity）に対応させ、ネイティブアプリのような体験を提供する。

## 既存資産の活用

### 1. 現在の技術スタック
- ✅ Next.js 15.2.4（PWA対応済み）
- ✅ React 19
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ レスポンシブデザイン

### 2. 既存機能
- ✅ 姓名判断ロジック
- ✅ 決済システム
- ✅ ユーザー認証
- ✅ データ管理

## PWA/TWA実装計画

### Phase 1: PWA基盤構築（1-2週間）

#### 1.1 Service Worker実装
```typescript
// public/sw.js
const CACHE_NAME = 'name-analysis-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})
```

#### 1.2 Web App Manifest
```json
// public/manifest.json
{
  "name": "まいにち姓名判断 - AI完全旧字体対応",
  "short_name": "姓名判断AI",
  "description": "完全旧字体対応のAI姓名判断アプリ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#2D5016",
  "theme_color": "#D4AF37",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 1.3 Next.js PWA設定
```typescript
// next.config.mjs
import withPWA from 'next-pwa'

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i-ready,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-static',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    }
  ]
})

export default nextConfig
```

### Phase 2: オフライン機能実装（1週間）

#### 2.1 オフライン対応コンポーネント
```typescript
// components/PWA/OfflineIndicator.tsx
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOnline && showOfflineMessage) {
    return (
      <div className="offline-indicator">
        <div className="isi-offline-message">
          <p>オフラインです。一部機能が制限されます。</p>
          <button onClick={() => setShowOfflineMessage(false)}>
            閉じる
          </button>
        </div>
      </div>
    )
  }

  return null
}
```

#### 2.2 オフライン対応の姓名判断
```typescript
// lib/offline-analysis.ts
export class OfflineAnalysisManager {
  private cache: Map<string, NameAnalysisResult> = new Map()

  async analyzeNameOffline(lastName: string, firstName: string): Promise<NameAnalysisResult> {
    const cacheKey = `${lastName}_${firstName}`
    
    // キャッシュから取得
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // オフライン分析を実行
    const analysis = analyzeNameFortune(lastName, firstName)
    
    // キャッシュに保存
    this.cache.set(cacheKey, analysis)
    
    return analysis
  }

  // キャッシュをローカルストレージに保存
  saveCacheToStorage() {
    const cacheData = Array.from(this.cache.entries())
    localStorage.setItem('name-analysis-cache', JSON.stringify(cacheData))
  }

  // ローカルストレージからキャッシュを復元
  loadCacheFromStorage() {
    const cacheData = localStorage.getItem('name-analysis-cache')
    if (cacheData) {
      const parsed = JSON.parse(cacheData)
      this.cache = new Map(parsed)
    }
  }
}
```

### Phase 3: プッシュ通知実装（1-2週間）

#### 3.1 プッシュ通知サービス
```typescript
// lib/push-notification-service.ts
export class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('このブラウザは通知をサポートしていません')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      this.registration = await navigator.serviceWorker.ready
    }

    const subscription = await this.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })

    // サーバーにサブスクリプションを送信
    await this.sendSubscriptionToServer(subscription)
    
    return subscription
  }

  private async sendSubscriptionToServer(subscription: PushSubscription) {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    })
  }

  async scheduleDailyFortune(userName: string, time: string = '08:00') {
    await fetch('/api/push/schedule-daily', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName,
        time,
        type: 'daily-fortune'
      })
    })
  }
}
```

#### 3.2 プッシュ通知API
```typescript
// app/api/push/schedule-daily/route.ts
export async function POST(request: NextRequest) {
  try {
    const { userName, time, type } = await request.json()
    
    // 毎日の運勢通知をスケジュール
    const scheduleData = {
      userName,
      time,
      type,
      scheduledAt: new Date().toISOString()
    }

    // データベースにスケジュールを保存
    await saveNotificationSchedule(scheduleData)
    
    return NextResponse.json({
      success: true,
      message: '通知スケジュールを設定しました'
    })
  } catch (error) {
    return NextResponse.json({ error: '通知設定に失敗しました' }, { status: 500 })
  }
}
```

### Phase 4: TWA実装（1週間）

#### 4.1 TWA設定ファイル
```json
// twa-config.json
{
  "packageId": "com.nameanalysis.ai",
  "host": "name-analysis-ai.vercel.app",
  "name": "姓名判断AI",
  "launcherName": "姓名判断AI",
  "display": "standalone",
  "themeColor": "#D4AF37",
  "navigationColor": "#2D5016",
  "backgroundColor": "#2D5016",
  "enableNotifications": true,
  "startUrl": "/",
  "iconUrl": "https://name-analysis-ai.vercel.app/icons/icon-512x512.png",
  "maskableIconUrl": "https://name-analysis-ai.vercel.app/icons/icon-512x512.png",
  "monochromeIconUrl": "https://name-analysis-ai.vercel.app/icons/icon-512x512.png",
  "splashScreenFadeOutDuration": 300,
  "signingKey": {
    "path": "./android-signing-key.json",
    "alias": "android"
  },
  "appVersionName": "1.0.0",
  "appVersionCode": 1
}
```

#### 4.2 TWAビルドスクリプト
```bash
#!/bin/bash
# scripts/build-twa.sh

# TWAビルドツールのインストール
npm install -g @bubblewrap/cli

# TWAアプリの生成
bubblewrap init --manifest=https://name-analysis-ai.vercel.app/manifest.json

# Android APKのビルド
bubblewrap build

echo "TWA APKが生成されました: ./twa-release.apk"
```

### Phase 5: パフォーマンス最適化（1週間）

#### 5.1 画像最適化
```typescript
// next.config.mjs
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  compress: true,
  poweredByHeader: false
}
```

#### 5.2 コード分割最適化
```typescript
// components/LazyComponents.tsx
import dynamic from 'next/dynamic'

export const LazyAIAnalysis = dynamic(() => import('./ai/AIAnalysisSection'), {
  loading: () => <div>AI分析を読み込み中...</div>,
  ssr: false
})

export const LazyCompatibilityAnalysis = dynamic(() => import('./ai/CompatibilityAnalysis'), {
  loading: () => <div>相性分析を読み込み中...</div>,
  ssr: false
})
```

## 実装スケジュール

### Week 1: PWA基盤構築
- [ ] Service Worker実装
- [ ] Web App Manifest設定
- [ ] Next.js PWA設定

### Week 2: オフライン機能
- [ ] オフライン対応コンポーネント
- [ ] キャッシュ機能実装
- [ ] オフライン分析機能

### Week 3: プッシュ通知
- [ ] プッシュ通知サービス
- [ ] 通知API実装
- [ ] スケジュール機能

### Week 4: TWA実装
- [ ] TWA設定ファイル作成
- [ ] Android APKビルド
- [ ] ストア申請準備

### Week 5: 最適化・テスト
- [ ] パフォーマンス最適化
- [ ] テスト実装
- [ ] デバッグ・修正

## 成功指標

### 技術指標
- ページ読み込み時間: 2秒以内
- オフライン機能: 基本分析が利用可能
- プッシュ通知: 95%以上の配信率
- PWAスコア: 90点以上

### ユーザー体験指標
- インストール率: 30%以上
- オフライン利用率: 20%以上
- 通知許可率: 60%以上
- ユーザーエンゲージメント: 40%向上

## 次のステップ

1. **PWA基盤構築**: Service WorkerとManifestの実装
2. **オフライン機能**: キャッシュとオフライン分析の実装
3. **プッシュ通知**: 毎日の運勢通知機能の実装
4. **TWA実装**: Androidアプリ化の準備
5. **最適化**: パフォーマンスとUXの向上
