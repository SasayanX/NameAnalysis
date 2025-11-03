/**
 * 姓名判断結果の画像生成（縦書き名前表示）
 * SVGを生成してPNGに変換（sharp使用）
 */
import { getStrokeCount } from './name-data-simple-fixed'
import sharp from 'sharp'

interface CharacterData {
  char: string
  strokes: number
  yinYang: '陽' | '陰'
}

/**
 * 縦書き名前画像をSVGで生成してPNGに変換
 */
export async function generateNameResultImage(
  lastName: string,
  firstName: string,
  result: {
    totalScore?: number
    fortune?: string
    categories?: Array<{ name: string; fortune?: string; strokeCount?: number }>
  }
): Promise<Buffer> {
  try {
    const fullName = lastName + firstName
    const charData: CharacterData[] = []
    
    // 各文字の情報を取得
    for (let i = 0; i < fullName.length; i++) {
      const char = fullName[i]
      const strokes = getStrokeCount(char)
      // 陰陽判定（画数が奇数なら陽、偶数なら陰）
      const yinYang: '陽' | '陰' = strokes % 2 === 1 ? '陽' : '陰'
      charData.push({ char, strokes, yinYang })
    }
    
    // SVGを生成
    const width = 1200
    const height = 1600
    const charSize = 120
    const charSpacing = 160
    const startX = width / 2
    const startY = 250
    
    // 縦書き文字のSVG要素を生成
    const charElements = charData.map((item, index) => {
      const y = startY + index * charSpacing
      const yinYangColor = item.yinYang === '陽' ? '#f59e0b' : '#3b82f6'
      
      return `
        <!-- 文字 ${index}: ${item.char} -->
        <g transform="translate(${startX}, ${y})">
          <!-- 背景ボックス -->
          <rect x="${-charSize / 2}" y="${-charSize / 2}" width="${charSize}" height="${charSize}" 
                fill="#ffffff" stroke="#e5e7eb" stroke-width="3" rx="8"/>
          
          <!-- 陰陽表示 -->
          <text x="${-charSize / 2 + 15}" y="${-charSize / 2 + 35}" 
                font-family="Noto Sans JP, sans-serif" font-size="32" font-weight="bold" 
                fill="${yinYangColor}">${item.yinYang}</text>
          
          <!-- 文字 -->
          <text x="0" y="0" text-anchor="middle" dominant-baseline="central"
                font-family="Noto Sans JP, sans-serif" font-size="${charSize * 0.6}" 
                font-weight="bold" fill="#111827">${item.char}</text>
          
          <!-- 画数表示 -->
          <text x="${charSize / 2 - 15}" y="${charSize / 2 - 15}" 
                font-family="Noto Sans JP, sans-serif" font-size="24" fill="#6b7280"
                text-anchor="end">${item.strokes}</text>
        </g>
      `
    }).join('\n')
    
    // 結果情報のSVG
    const resultY = startY + charData.length * charSpacing + 100
    let resultElements = ''
    
    if (result.totalScore !== undefined) {
      resultElements += `
        <text x="${width / 2}" y="${resultY}" text-anchor="middle"
              font-family="Noto Sans JP, sans-serif" font-size="36" font-weight="bold" fill="#1f2937">
          総合スコア: ${result.totalScore}点
        </text>
      `
    }
    
    if (result.fortune) {
      resultElements += `
        <text x="${width / 2}" y="${resultY + 60}" text-anchor="middle"
              font-family="Noto Sans JP, sans-serif" font-size="40" font-weight="bold" fill="#059669">
          運勢: ${result.fortune}
        </text>
      `
    }
    
    // カテゴリー情報
    if (result.categories && result.categories.length > 0) {
      const categoryNames = ['天格', '人格', '地格', '外格', '総格']
      const categoryData = categoryNames.map(name => 
        result.categories?.find(c => c.name === name)
      ).filter(Boolean)
      
      categoryData.forEach((cat, index) => {
        if (cat) {
          const x = 200 + index * 200
          resultElements += `
            <text x="${x}" y="${resultY + 120}" text-anchor="middle"
                  font-family="Noto Sans JP, sans-serif" font-size="24" fill="#4b5563">
              ${cat.name}: ${cat.fortune || '不明'}
            </text>
          `
        }
      })
    }
    
    // SVG全体
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- 背景 -->
        <rect width="${width}" height="${height}" fill="#ffffff"/>
        <rect width="${width}" height="400" fill="url(#bgGradient)"/>
        
        <!-- タイトル -->
        <text x="${width / 2}" y="80" text-anchor="middle"
              font-family="Noto Sans JP, sans-serif" font-size="48" font-weight="bold" fill="#1f2937">
          姓名判断結果
        </text>
        
        <!-- 縦書き文字 -->
        ${charElements}
        
        <!-- 結果情報 -->
        ${resultElements}
        
        <!-- フッター -->
        <text x="${width / 2}" y="${height - 50}" text-anchor="middle"
              font-family="Noto Sans JP, sans-serif" font-size="20" fill="#9ca3af">
          まいにちAI姓名判断
        </text>
      </svg>
    `
    
    // SVGをPNGに変換（sharp使用）
    const pngBuffer = await sharp(Buffer.from(svg))
      .resize(width, height)
      .png()
      .toBuffer()
    
    return pngBuffer
  } catch (error) {
    console.error('画像生成エラー:', error)
    throw new Error(`画像生成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
  }
}

/**
 * 画像をBase64エンコードして返す
 */
export async function generateNameResultImageBase64(
  lastName: string,
  firstName: string,
  result: any
): Promise<string> {
  const buffer = await generateNameResultImage(lastName, firstName, result)
  return buffer.toString('base64')
}

