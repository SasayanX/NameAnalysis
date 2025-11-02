#!/bin/bash
# TWAビルドスクリプト

echo "🚀 TWAビルドプロセス開始..."

# TWA Builder CLIのインストール確認
if ! command -v bubblewrap &> /dev/null; then
    echo "📦 TWA Builder CLI (bubblewrap) をインストール中..."
    npm install -g @bubblewrap/cli
else
    echo "✅ TWA Builder CLI は既にインストール済みです"
fi

# TWAプロジェクトの初期化（初回のみ）
if [ ! -d "./twa" ]; then
    echo "🔧 TWAプロジェクトを初期化中..."
    bubblewrap init --manifest=https://nameanalysis216.vercel.app/manifest.json
else
    echo "✅ TWAプロジェクトは既に存在します"
fi

# Android APKのビルド
echo "🔨 Android APKをビルド中..."
cd twa
bubblewrap build

if [ $? -eq 0 ]; then
    echo "✅ TWA APKビルド完了！"
    echo "📱 APKファイル: ./twa/app-release.apk"
    echo "📝 次のステップ:"
    echo "   1. ./twa/app-release.apk を確認"
    echo "   2. テストデバイスでインストールして動作確認"
    echo "   3. Google Play Consoleでアプリ申請"
else
    echo "❌ ビルドに失敗しました。エラーログを確認してください。"
    exit 1
fi

