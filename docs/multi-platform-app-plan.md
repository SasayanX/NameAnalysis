# マルチプラットフォームアプリ化計画

## 概要
既存のPWA基盤を活用して、複数のプラットフォームでアプリ化を実現する。

## 対応プラットフォーム

### 1. Android (TWA) - 優先度: 高
- **技術**: Trusted Web Activity
- **ツール**: TWA Builder
- **ストア**: Google Play Store
- **ステータス**: 準備完了（PWA基盤済み）

### 2. iOS (PWA → Native) - 優先度: 高
- **技術**: Capacitor
- **ツール**: Ionic Capacitor
- **ストア**: Apple App Store
- **ステータス**: 未実装

### 3. Windows (PWA → Desktop) - 優先度: 中
- **技術**: PWABuilder
- **ツール**: Microsoft PWABuilder
- **ストア**: Microsoft Store
- **ステータス**: 未実装

### 4. macOS (Electron) - 優先度: 低
- **技術**: Electron
- **ツール**: Electron Builder
- **ストア**: Mac App Store
- **ステータス**: 未実装

## 実装スケジュール

### Phase 1: Android TWA (1週間)
- [x] PWA基盤構築
- [ ] TWA Builder でプロジェクト生成
- [ ] Digital Asset Links 設定
- [ ] Google Play Console 申請

### Phase 2: iOS Capacitor (2週間)
- [ ] Capacitor セットアップ
- [ ] iOS プロジェクト生成
- [ ] ネイティブ機能統合
- [ ] App Store 申請

### Phase 3: Windows PWABuilder (1週間)
- [ ] PWABuilder でプロジェクト生成
- [ ] Windows アプリ設定
- [ ] Microsoft Store 申請

### Phase 4: macOS Electron (1週間)
- [ ] Electron セットアップ
- [ ] macOS アプリ生成
- [ ] Mac App Store 申請

## 技術詳細

### iOS Capacitor 実装

#### 1. Capacitor セットアップ
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios
npx cap init "まいにちAI姓名判断" "com.yourcompany.mainichiainameanalysis"
npx cap add ios
```

#### 2. iOS 設定
```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.yourcompany.mainichiainameanalysis',
  appName: 'まいにちAI姓名判断',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
}

export default config
```

#### 3. ネイティブ機能統合
```typescript
// lib/capacitor-native.ts
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'

export class NativeFeatureManager {
  async requestPushPermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      const result = await PushNotifications.requestPermissions()
      return result.receive === 'granted'
    }
    return false
  }

  async scheduleLocalNotification(title: string, body: string, schedule: Date) {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Date.now(),
          schedule: { at: schedule }
        }]
      })
    }
  }
}
```

### Windows PWABuilder 実装

#### 1. PWABuilder 設定
```json
// pwa-builder.json
{
  "packageId": "com.yourcompany.mainichiainameanalysis",
  "displayName": "まいにちAI姓名判断",
  "themeColor": "#D4AF37",
  "backgroundColor": "#2D5016",
  "startUrl": "/",
  "shortcuts": [
    {
      "name": "姓名判断",
      "short_name": "姓名判断",
      "description": "AI姓名判断を開始",
      "url": "/",
      "icons": [
        {
          "src": "/icons/icon-192x192.png",
          "sizes": "192x192"
        }
      ]
    }
  ]
}
```

#### 2. Windows アプリ設定
```xml
<!-- Package.appxmanifest -->
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10">
  <Identity Name="com.yourcompany.mainichiainameanalysis" 
            Publisher="CN=YourCompany" 
            Version="1.0.0.0" />
  <Properties>
    <DisplayName>まいにちAI姓名判断</DisplayName>
    <PublisherDisplayName>YourCompany</PublisherDisplayName>
    <Logo>Assets\StoreLogo.png</Logo>
  </Properties>
  <Dependencies>
    <TargetDeviceFamily Name="Windows.Universal" MinVersion="10.0.0.0" MaxVersionTested="10.0.0.0" />
  </Dependencies>
  <Resources>
    <Resource Language="ja" />
  </Resources>
  <Applications>
    <Application Id="App" Executable="$targetnametoken$.exe" EntryPoint="$targetentrypoint$">
      <uap:VisualElements DisplayName="まいにちAI姓名判断" 
                          Description="AI姓名判断アプリ" 
                          BackgroundColor="#2D5016" 
                          Square150x150Logo="Assets\Square150x150Logo.png" 
                          Square44x44Logo="Assets\Square44x44Logo.png">
        <uap:DefaultTile Wide310x150Logo="Assets\Wide310x150Logo.png" />
        <uap:SplashScreen Image="Assets\SplashScreen.png" />
      </uap:VisualElements>
    </Application>
  </Applications>
</Package>
```

### macOS Electron 実装

#### 1. Electron セットアップ
```bash
npm install electron electron-builder
npm install electron-packager
```

#### 2. Electron メインプロセス
```typescript
// electron/main.ts
import { app, BrowserWindow, Menu } from 'electron'
import * as path from 'path'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png')
  })

  mainWindow.loadURL('https://ainameanalysis.netlify.app')
  
  // メニュー設定
  const template = [
    {
      label: 'ファイル',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: '表示',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]
  
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
```

#### 3. Electron Builder 設定
```json
// electron-builder.json
{
  "appId": "com.yourcompany.mainichiainameanalysis",
  "productName": "まいにちAI姓名判断",
  "directories": {
    "output": "dist"
  },
  "files": [
    "build/**/*",
    "node_modules/**/*"
  ],
  "mac": {
    "category": "public.app-category.lifestyle",
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      }
    ]
  },
  "win": {
    "target": "nsis"
  },
  "linux": {
    "target": "AppImage"
  }
}
```

## 優先順位とリソース配分

### 高優先度 (即座に開始)
1. **Android TWA** - 最も簡単、Google Play Store
2. **iOS Capacitor** - 市場シェア大、App Store

### 中優先度 (Phase 2)
3. **Windows PWABuilder** - デスクトップ市場

### 低優先度 (Phase 3)
4. **macOS Electron** - ニッチ市場

## 成功指標

### 技術指標
- **Android**: Google Play Store 承認
- **iOS**: App Store 承認
- **Windows**: Microsoft Store 承認
- **macOS**: Mac App Store 承認

### ビジネス指標
- **ダウンロード数**: 各プラットフォームで1,000件/月
- **ユーザーエンゲージメント**: 30%向上
- **収益**: 各プラットフォームで10万円/月

## 次のステップ

1. **Android TWA**: TWA Builder でプロジェクト生成
2. **iOS Capacitor**: Capacitor セットアップ
3. **Windows PWABuilder**: PWABuilder でプロジェクト生成
4. **macOS Electron**: Electron セットアップ

どのプラットフォームから始めますか？
