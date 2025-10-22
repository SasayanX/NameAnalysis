const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 必要なアイコンサイズ
const iconSizes = [
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-256x256.png', size: 256 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-32x32.png', size: 32 },
  { name: 'icon-16x16.png', size: 16 }
];

async function resizeIcons() {
  const inputFile = path.join(__dirname, '../public/icons/main-logo.png');
  const outputDir = path.join(__dirname, '../public/icons/');

  // 入力ファイルの存在確認
  if (!fs.existsSync(inputFile)) {
    console.error('メインロゴファイルが見つかりません: main-logo.png');
    console.log('以下の手順で準備してください:');
    console.log('1. 512x512pxのメインロゴを作成');
    console.log('2. public/icons/main-logo.pngとして保存');
    return;
  }

  console.log('アイコンの自動リサイズを開始...');

  for (const icon of iconSizes) {
    try {
      await sharp(inputFile)
        .resize(icon.size, icon.size)
        .png()
        .toFile(path.join(outputDir, icon.name));
      
      console.log(`_{icon.name} を作成しました (${icon.size}x${icon.size}px)`);
    } catch (error) {
      console.error(`${icon.name} の作成に失敗:`, error.message);
    }
  }

  console.log('アイコンリサイズ完了！');
}

// スクリプト実行
resizeIcons().catch(console.error);
