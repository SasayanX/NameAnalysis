/**
 * レアカード画像生成（全ランク対応）
 * SVGを生成してPNGに変換（sharp使用）
 */
import sharp from 'sharp'

export type RankType = 'SSS' | 'SS' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'

interface RankDesign {
  name: string
  // 背景色（グラデーション）
  bgColors: [string, string, string] // [start, mid, end]
  // テキスト色
  textColor: string
  // ボーダー色
  borderColor: string
  // 発光色
  glowColor: string
  // 背景パターン
  pattern: string
  // フォントファミリー（Phase 1: 基本フォント、Phase 2以降で書体を追加）
  fontFamily: string
  // フォントウェイト
  fontWeight: string
}

const RANK_DESIGNS: Record<RankType, RankDesign> = {
  // SSS 天下無双: 金龍が昇る黄金背景
  SSS: {
    name: '天下無双',
    bgColors: ['#FFD700', '#FFA500', '#FF8C00'], // 黄金グラデーション
    textColor: '#FFD700', // 金光
    borderColor: '#FFD700',
    glowColor: '#FFD700',
    pattern: 'dragon-gold', // 龍の模様（Phase 2で実装）
    fontFamily: "'Noto Sans JP', 'Yu Mincho', serif", // 太筆（Phase 2で専用フォント）
    fontWeight: '900',
  },
  // SS 無敵: 白金の雲海
  SS: {
    name: '無敵',
    bgColors: ['#E8E8E8', '#C0C0C0', '#A0A0A0'], // 白金グラデーション
    textColor: '#FFFFFF', // 銀影
    borderColor: '#C0C0C0',
    glowColor: '#FFFFFF',
    pattern: 'cloud-silver', // 雲の模様（Phase 2で実装）
    fontFamily: "'Noto Sans JP', 'Yu Mincho', serif", // 太筆（Phase 2で専用フォント）
    fontWeight: '900',
  },
  // S 最強: 赤炎＋黒龍
  S: {
    name: '最強',
    bgColors: ['#8B0000', '#DC143C', '#FF4500'], // 赤黒グラデーション
    textColor: '#FF6347', // 朱
    borderColor: '#FF4500',
    glowColor: '#FF6347',
    pattern: 'flame-red', // 炎の模様（Phase 2で実装）
    fontFamily: "'Noto Sans JP', 'Yu Mincho', serif", // 筆書（Phase 2で専用フォント）
    fontWeight: '700',
  },
  // A+ 一流: 群青×金箔
  'A+': {
    name: '一流',
    bgColors: ['#1E3A8A', '#2563EB', '#3B82F6'], // 群青グラデーション
    textColor: '#FFD700', // 金箔
    borderColor: '#FFD700',
    glowColor: '#FFD700',
    pattern: 'gold-foil', // 金箔パターン（Phase 2で実装）
    fontFamily: "'Noto Serif JP', 'Yu Mincho', serif", // 明朝×筆交じり
    fontWeight: '600',
  },
  // A 優秀: 若草色×龍の鱗模様
  A: {
    name: '優秀',
    bgColors: ['#90EE90', '#7CB342', '#558B2F'], // 若草色グラデーション
    textColor: '#F1F8E9',
    borderColor: '#7CB342',
    glowColor: '#C5E1A5',
    pattern: 'scale-pattern', // 鱗模様（Phase 2で実装）
    fontFamily: "'Noto Sans JP', serif", // 手書き筆風（Phase 2で専用フォント）
    fontWeight: '500',
  },
  // B+ 良好: 青灰色
  'B+': {
    name: '良好',
    bgColors: ['#708090', '#87CEEB', '#B0C4DE'], // 青灰色グラデーション
    textColor: '#E0F2F1',
    borderColor: '#FFD700', // シンプル金縁
    glowColor: '#B0C4DE',
    pattern: 'stardust', // 星屑エフェクト
    fontFamily: "'Noto Sans JP', sans-serif", // 丸ゴシック
    fontWeight: '400',
  },
  // B 普通: 灰白＋墨模様
  B: {
    name: '普通',
    bgColors: ['#F5F5F5', '#E0E0E0', '#BDBDBD'], // 灰白グラデーション
    textColor: '#424242',
    borderColor: '#9E9E9E',
    glowColor: '#757575',
    pattern: 'ink-pattern', // 墨模様（Phase 2で実装）
    fontFamily: "'Noto Sans JP', sans-serif", // ゴシック筆調
    fontWeight: '500',
  },
  // C 平凡: 薄茶背景＋木目
  C: {
    name: '平凡',
    bgColors: ['#D7CCC8', '#BCAAA4', '#A1887F'], // 薄茶グラデーション
    textColor: '#5D4037',
    borderColor: '#8D6E63',
    glowColor: '#A1887F',
    pattern: 'wood-grain', // 木目パターン（Phase 2で実装）
    fontFamily: "'Noto Sans JP', serif", // 細筆
    fontWeight: '300',
  },
  // D 苦労／困難: 黒墨＋朱の縦線
  D: {
    name: '苦労',
    bgColors: ['#000000', '#1A1A1A', '#2D2D2D'], // 黒墨グラデーション
    textColor: '#DC143C', // 朱
    borderColor: '#DC143C',
    glowColor: '#DC143C',
    pattern: 'vertical-lines-red', // 朱の縦線（Phase 2で実装）
    fontFamily: "'Noto Sans JP', serif", // かすれ筆体（Phase 2で専用フォント）
    fontWeight: '300',
  },
}

/**
 * レアカード画像を生成
 * @param lastName - 姓
 * @param firstName - 名
 * @param rank - ランク
 * @param totalPoints - 総合ポイント
 * @param powerLevel - パワーレベル
 * @param baseImagePath - ベース画像のパス（オプション、指定されない場合は自動生成）
 */
export async function generateRareCardImage(
  lastName: string,
  firstName: string,
  rank: RankType,
  totalPoints: number,
  powerLevel: number,
  baseImagePath?: string
): Promise<Buffer> {
  const design = RANK_DESIGNS[rank]
  const fullName = lastName + firstName

  // カードサイズ（縦向き）
  const width = 1200
  const height = 1800
  const padding = 60
  const cardWidth = width - padding * 2
  const cardHeight = height - padding * 2

  // ランク別の色設定（RareCard.tsxと同じ）- gradientDefより前に定義する必要がある
  const rankColors: Record<RankType, { main: string; glow: string; shadow: string; bg: string }> = {
    SSS: { main: '#FFF8D9', glow: '#FFD76A', shadow: '#B8860B', bg: '#FFD700' },
    SS: { main: '#F2F7FF', glow: '#BFD1FF', shadow: '#8FA7CC', bg: '#F5F5F5' },
    S: { main: '#FFE1CC', glow: '#FF8040', shadow: '#993300', bg: '#FF8A80' },
    'A+': { main: '#DDE8FF', glow: '#B0C8FF', shadow: '#203060', bg: '#80CBC4' },
    A: { main: '#EAF5CC', glow: '#BFE87A', shadow: '#667A3A', bg: '#A5D6A7' },
    'B+': { main: '#DCE8FF', glow: '#99BFFF', shadow: '#334A66', bg: '#C8E6C9' },
    B: { main: '#F5F5F5', glow: '#CCCCCC', shadow: '#555555', bg: '#E0E0E0' },
    C: { main: '#F2E0C6', glow: '#E5B67E', shadow: '#5C3A24', bg: '#F9E79F' },
    D: { main: '#FFD1A6', glow: '#CC5A2E', shadow: '#330000', bg: '#E5E7E9' },
  }
  const colors = rankColors[rank]

  // グラデーション定義（SVG用）- Phase 2: SSS特別演出追加
  const gradientId = `gradient-${rank}`
  const glowIntensity = rank === 'SSS' || rank === 'SS' ? 4 : rank === 'S' || rank === 'A+' || rank === 'A' ? 3 : 2
  
  // Phase 2: SSS特別演出 - エフェクト定義
  let specialEffectsDef = ''
  if (rank === 'SSS') {
    specialEffectsDef = `
      <!-- 光輪エフェクト -->
      <radialGradient id="halo-gradient">
        <stop offset="0%" style="stop-color:#FFD700;stop-opacity:0.8" />
        <stop offset="50%" style="stop-color:#FFA500;stop-opacity:0.4" />
        <stop offset="100%" style="stop-color:#FF8C00;stop-opacity:0" />
      </radialGradient>
      <!-- 火花エフェクト用フィルター -->
      <filter id="sparkle-filter">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- 強力な発光フィルター（SSS用、RareCard.tsxと同じ） -->
      <filter id="strong-glow">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <!-- ① 光沢の多層構造フィルター -->
      <filter id="multi-layer-gloss" x="-50%" y="-50%" width="200%" height="200%">
        <!-- 内側：オレンジゴールド（陰影） -->
        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="shadow1"/>
        <feOffset in="shadow1" dx="2" dy="2" result="offset1"/>
        <feComponentTransfer in="offset1" result="innerGlow">
          <feFuncA type="linear" slope="0.3"/>
          <feFuncR type="discrete" tableValues="1.0 0.8"/>
          <feFuncG type="discrete" tableValues="0.6 0.5"/>
          <feFuncB type="discrete" tableValues="0.0 0.0"/>
        </feComponentTransfer>
        
        <!-- 中間：ホワイトゴールド（光反射） -->
        <feSpecularLighting in="SourceAlpha" surfaceScale="5" specularConstant="1.5" specularExponent="20" result="specOut">
          <fePointLight x="400" y="300" z="200"/>
        </feSpecularLighting>
        <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2"/>
        <feComponentTransfer in="specOut2" result="whiteGold">
          <feFuncA type="linear" slope="0.6"/>
          <feFuncR type="linear" slope="1.5" intercept="-0.5"/>
          <feFuncG type="linear" slope="1.5" intercept="-0.3"/>
          <feFuncB type="linear" slope="1.5" intercept="0.0"/>
        </feComponentTransfer>
        
        <!-- 外側：アンビエントライト（金の縁光） -->
        <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="ambientBlur"/>
        <feComponentTransfer in="ambientBlur" result="ambientLight">
          <feFuncA type="linear" slope="0.4"/>
          <feFuncR type="discrete" tableValues="1.0"/>
          <feFuncG type="discrete" tableValues="0.84"/>
          <feFuncB type="discrete" tableValues="0.0"/>
        </feComponentTransfer>
        
        <!-- マージ：多層を合成 -->
        <feMerge>
          <feMergeNode in="ambientLight"/>
          <feMergeNode in="innerGlow"/>
          <feMergeNode in="whiteGold"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <!-- ② テクスチャ：金箔パターン -->
      <pattern id="gold-foil-texture" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <!-- パーリンノイズ風のテクスチャ -->
        <rect width="100" height="100" fill="#FFD700" opacity="0.1"/>
        <circle cx="20" cy="20" r="2" fill="#FFA500" opacity="0.2"/>
        <circle cx="50" cy="30" r="1.5" fill="#FFD700" opacity="0.15"/>
        <circle cx="70" cy="60" r="2.5" fill="#FFA500" opacity="0.2"/>
        <circle cx="30" cy="80" r="1" fill="#FFD700" opacity="0.15"/>
        <circle cx="80" cy="15" r="1.5" fill="#FFA500" opacity="0.2"/>
        <circle cx="15" cy="50" r="2" fill="#FFD700" opacity="0.15"/>
        <circle cx="60" cy="70" r="1" fill="#FFA500" opacity="0.2"/>
        <circle cx="40" cy="10" r="1.5" fill="#FFD700" opacity="0.15"/>
        <circle cx="90" cy="40" r="2" fill="#FFA500" opacity="0.2"/>
        <!-- 細かい線状の模様 -->
        <line x1="0" y1="0" x2="100" y2="100" stroke="#FFD700" stroke-width="0.5" opacity="0.1"/>
        <line x1="100" y1="0" x2="0" y2="100" stroke="#FFA500" stroke-width="0.5" opacity="0.1"/>
      </pattern>
      
      <!-- 後光エフェクト用フィルター -->
      <filter id="name-halo" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="15" result="haloBlur"/>
        <feComponentTransfer in="haloBlur" result="haloColor">
          <feFuncA type="linear" slope="0.5"/>
          <feFuncR type="discrete" tableValues="1.0"/>
          <feFuncG type="discrete" tableValues="0.84"/>
          <feFuncB type="discrete" tableValues="0.0"/>
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="haloColor"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <!-- 斜めハイライト用グラデーション -->
      <linearGradient id="highlight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.3" />
        <stop offset="50%" style="stop-color:#FFFFFF;stop-opacity:0.1" />
        <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:0" />
      </linearGradient>
    `
  }
  
  const gradientDef = `
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${design.bgColors[0]};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${design.bgColors[1]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${design.bgColors[2]};stop-opacity:1" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- ランク別色付きグローフィルター（RareCard.tsxのtextShadowを完全再現: 0 0 6px glow, 0 0 14px glow, 0 4px 4px shadow） -->
      <filter id="glow-colored-${rank}" x="-100%" y="-100%" width="300%" height="300%">
        <!-- 0 0 6px ${colors.glow} -->
        <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur1"/>
        <feOffset in="blur1" dx="0" dy="0" result="offset1"/>
        <feFlood flood-color="${colors.glow}" flood-opacity="0.8" result="glowColor1"/>
        <feComposite in="glowColor1" in2="offset1" operator="in" result="glow1"/>
        
        <!-- 0 0 14px ${colors.glow} -->
        <feGaussianBlur in="SourceAlpha" stdDeviation="14" result="blur2"/>
        <feOffset in="blur2" dx="0" dy="0" result="offset2"/>
        <feFlood flood-color="${colors.glow}" flood-opacity="0.6" result="glowColor2"/>
        <feComposite in="glowColor2" in2="offset2" operator="in" result="glow2"/>
        
        <!-- 0 4px 4px ${colors.shadow} -->
        <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur3"/>
        <feOffset in="blur3" dx="0" dy="4" result="offset3"/>
        <feFlood flood-color="${colors.shadow}" flood-opacity="0.6" result="shadowColor"/>
        <feComposite in="shadowColor" in2="offset3" operator="in" result="shadow"/>
        
        <!-- マージ: 影 → 外側グロー → 内側グロー → テキスト -->
        <feMerge>
          <feMergeNode in="shadow"/>
          <feMergeNode in="glow2"/>
          <feMergeNode in="glow1"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="glow-${rank}">
        <feGaussianBlur stdDeviation="${glowIntensity}" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      ${specialEffectsDef}
    </defs>
  `

  // 縦書き名前の配置（RareCard.tsxと同じ計算ロジックを使用）
  const nameChars = Array.from(fullName)
  
  // セーフゾーン（RareCard.tsxと同じ）
  const safeZone = { top: 120, bottom: 120, left: 80, right: 80 }
  const nameAreaWidth = width - safeZone.left - safeZone.right
  const nameAreaHeight = height - safeZone.top - safeZone.bottom
  
  // 文字サイズと行間を自動計算（RareCard.tsxと同じ）
  const charSize = Math.min(180, Math.floor(nameAreaWidth / nameChars.length * 1.2))
  const charSpacing = charSize * 1.05
  const nameStartX = width / 2
  const nameStartY = safeZone.top + (nameAreaHeight - (nameChars.length - 1) * charSpacing) / 2

  // 名前の文字要素（RareCard.tsxと同じ実装）
  const nameElements = nameChars.map((char, index) => {
    const y = nameStartY + index * charSpacing

    return `
      <!-- 後光エフェクト（SSSのみ） -->
      ${rank === 'SSS' ? `
      <text x="${nameStartX}" y="${y}" 
            text-anchor="middle" dominant-baseline="central"
            font-family="'Hannari','Yu Mincho','Hiragino Mincho ProN',serif" 
            font-size="${charSize}" 
            font-weight="900" 
            fill="${colors.glow}" 
            opacity="0.6"
            filter="url(#strong-glow)">${char}</text>
      ` : ''}
      
      <!-- 多段影（RareCard.tsxと同じ） -->
      <text x="${nameStartX + 2}" y="${y + 3}" 
            text-anchor="middle" dominant-baseline="central"
            font-family="'Hannari','Yu Mincho','Hiragino Mincho ProN',serif" 
            font-size="${charSize}" 
            font-weight="900" 
            fill="${colors.shadow}" 
            opacity="0.6">${char}</text>
      
      <!-- メインテキスト（RareCard.tsxと同じ、色付きグロー適用、SSランクは縁取り強化） -->
      <text x="${nameStartX}" y="${y}" 
            text-anchor="middle" dominant-baseline="central"
            font-family="'Hannari','Yu Mincho','Hiragino Mincho ProN',serif" 
            font-size="${charSize}" 
            font-weight="900" 
            fill="${colors.main}" 
            stroke="${rank === 'SS' ? '#1A3A5F' : colors.shadow}"
            stroke-width="${rank === 'SS' ? 6 : 4}"
            stroke-linejoin="round"
            stroke-linecap="round"
            filter="${rank === 'SSS' ? 'url(#strong-glow)' : `url(#glow-colored-${rank})`}">${char}</text>
      
      <!-- 内側ハイライト（RareCard.tsxと同じ） -->
      <text x="${nameStartX - 1}" y="${y - 2}" 
            text-anchor="middle" dominant-baseline="central"
            font-family="'Hannari','Yu Mincho','Hiragino Mincho ProN',serif" 
            font-size="${charSize * 0.98}" 
            font-weight="900" 
            fill="rgba(255,255,255,0.4)" 
            opacity="0.5">${char}</text>
    `
  }).join('\n')

  // Phase 2: SSS特別演出 - 背景要素生成（画像に近づける改善版）
  let sssSpecialBackground = ''
  if (rank === 'SSS') {
    const centerX = width / 2
    const centerY = height / 2
    
    // 放射状の金色の線（中央から放射）
    let radialLines = ''
    for (let i = 0; i < 24; i++) {
      const angle = (i * 360) / 24
      const rad = (angle * Math.PI) / 180
      const x1 = centerX
      const y1 = centerY
      const x2 = centerX + Math.cos(rad) * 600
      const y2 = centerY + Math.sin(rad) * 600
      radialLines += `
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
              stroke="#FFD700" stroke-width="2" opacity="0.15" filter="url(#strong-glow)"/>
      `
    }
    
    // 金龍のシルエット（左側に頭、右側に尾）
    const dragonX = width * 0.3  // 左側に配置
    const dragonY = height / 2
    sssSpecialBackground = `
      <!-- 放射状の金色の線 -->
      <g opacity="0.6">
        ${radialLines}
      </g>
      
      <!-- 金龍のシルエット（より明確に、背景に透かす） -->
      <g opacity="0.15" transform="translate(${dragonX}, ${dragonY})">
        <!-- 龍の体（S字カーブ、左から右へ） -->
        <path d="M -200,0 Q -100,-80 0,0 Q 100,80 200,0 Q 300,-60 400,0 Q 500,40 600,0"
              stroke="#FFD700" stroke-width="30" fill="none" stroke-linecap="round" filter="url(#strong-glow)"/>
        <!-- 龍の頭（左側） -->
        <ellipse cx="-180" cy="0" rx="60" ry="50" fill="#FFA500" opacity="0.7" filter="url(#strong-glow)"/>
        <circle cx="-190" cy="-10" r="15" fill="#FFD700"/>
        <circle cx="-190" cy="-10" r="8" fill="#FF0000"/>
        <!-- 龍の角（左側） -->
        <path d="M -200,-30 L -210,-50 L -220,-40 Z" fill="#FFD700" filter="url(#strong-glow)"/>
        <path d="M -180,-30 L -170,-50 L -160,-40 Z" fill="#FFD700" filter="url(#strong-glow)"/>
        <!-- 龍の尾（右側） -->
        <path d="M 580,0 Q 620,-30 640,-50 Q 660,-70 680,-90"
              stroke="#FFD700" stroke-width="20" fill="none" stroke-linecap="round" filter="url(#strong-glow)"/>
      </g>
      
      <!-- 金龍の紋様（うっすら透かす、神聖感アップ） -->
      <g opacity="0.08" transform="translate(${width / 2}, ${height / 2})">
        <!-- 龍の紋様パターン（装飾的な模様） -->
        <path d="M -300,0 Q -250,-50 -200,0 Q -150,50 -100,0 Q -50,-50 0,0 Q 50,50 100,0 Q 150,-50 200,0 Q 250,50 300,0"
              stroke="#FFD700" stroke-width="40" fill="none" stroke-linecap="round" opacity="0.3"/>
        <path d="M -300,0 Q -250,50 -200,0 Q -150,-50 -100,0 Q -50,50 0,0 Q 50,-50 100,0 Q 150,50 200,0 Q 250,-50 300,0"
              stroke="#FFA500" stroke-width="30" fill="none" stroke-linecap="round" opacity="0.2"/>
      </g>
      
      <!-- 光輪エフェクト（より強力に） -->
      <g opacity="0.7">
        <circle cx="${centerX}" cy="${centerY}" r="250" fill="url(#halo-gradient)" filter="url(#strong-glow)"/>
        <circle cx="${centerX}" cy="${centerY}" r="180" fill="url(#halo-gradient)" opacity="0.6" filter="url(#strong-glow)"/>
        <circle cx="${centerX}" cy="${centerY}" r="120" fill="url(#halo-gradient)" opacity="0.4" filter="url(#strong-glow)"/>
      </g>
      
      <!-- 火花エフェクト（より細かく、多く） -->
      <g opacity="0.9">
        ${generateSparkles(width, height, padding, cardWidth, cardHeight, 60)}
      </g>
    `
  }

  // Phase 2: SSS特別演出 - フレーム装飾（下部のみ、画像に合わせて）
  let sssFrameDecoration = ''
  if (rank === 'SSS') {
    const cornerSize = 100
    // 下部のコーナーのみ装飾（画像に合わせて）
    sssFrameDecoration = `
      <!-- 左下の龍の爪（炎のような装飾） -->
      <g transform="translate(${padding + 20}, ${height - padding - 20}) scale(1, -1)">
        ${generateFlameCorner(cornerSize)}
      </g>
      <!-- 右下の龍の爪（炎のような装飾） -->
      <g transform="translate(${width - padding - 20}, ${height - padding - 20}) scale(-1, -1)">
        ${generateFlameCorner(cornerSize)}
      </g>
    `
  }

  // ベース画像を使用する場合
  if (baseImagePath) {
    return await generateRareCardWithBaseImage(
      lastName,
      firstName,
      rank,
      totalPoints,
      powerLevel,
      baseImagePath,
      width,
      height,
      design
    )
  }

  // SVG生成（従来の方法：ベース画像なし）
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${gradientDef}
      
      <!-- 背景（より暗く） -->
      <rect width="${width}" height="${height}" fill="#000000"/>
      
      <!-- Phase 2: SSS特別演出 - 背景エフェクト -->
      ${sssSpecialBackground}
      
      <!-- カード本体 -->
      <rect x="${padding}" y="${padding}" 
            width="${cardWidth}" height="${cardHeight}" 
            rx="30" ry="30"
            fill="${rank === 'SSS' ? 'url(#gold-foil-texture)' : `url(#${gradientId})`}" 
            stroke="${design.borderColor}" 
            stroke-width="${rank === 'SSS' ? '12' : '8'}"
            filter="${rank === 'SSS' ? 'url(#multi-layer-gloss)' : `url(#glow-${rank})`}"/>
      ${rank === 'SSS' ? `
        <!-- カード本体のグラデーションオーバーレイ -->
        <rect x="${padding}" y="${padding}" 
              width="${cardWidth}" height="${cardHeight}" 
              rx="30" ry="30"
              fill="url(#${gradientId})" 
              opacity="0.7"/>
        <!-- 斜めハイライト（立体感） -->
        <rect x="${padding}" y="${padding}" 
              width="${cardWidth}" height="${cardHeight}" 
              rx="30" ry="30"
              fill="url(#highlight-gradient)"/>
      ` : ''}
      
      <!-- Phase 2: SSS特別演出 - フレーム装飾（龍の爪） -->
      ${sssFrameDecoration}
      
      <!-- 装飾パターン（背景） -->
      <g opacity="0.1">
        ${generatePattern(design.pattern, width, height, padding, cardWidth, cardHeight)}
      </g>
      
      <!-- ランク表示（左上）- より目立つバッジ -->
      <g transform="translate(${padding + 40}, ${padding + 40})">
        <circle cx="0" cy="0" r="85" fill="rgba(0,0,0,0.5)" stroke="${design.borderColor}" stroke-width="${rank === 'SSS' ? '8' : '4'}"/>
        <circle cx="0" cy="0" r="75" fill="rgba(255,215,0,0.1)" stroke="${design.borderColor}" stroke-width="2"/>
        <text x="0" y="0" text-anchor="middle" dominant-baseline="central"
              font-family="Arial, sans-serif" font-size="76" font-weight="900"
              fill="#FFFFFF" filter="${rank === 'SSS' ? 'url(#strong-glow)' : `url(#glow-${rank})`}">${rank}</text>
      </g>
      
      <!-- ランク名（右上）- リボンプレート風 -->
      ${rank === 'SSS' ? `
        <!-- リボンプレート背景 -->
        <g transform="translate(${width - padding - 200}, ${padding + 20})">
          <path d="M 0,20 Q 20,0 40,20 Q 60,40 80,20 Q 100,0 120,20 Q 140,40 160,20 Q 180,0 200,20 L 200,60 Q 180,80 160,60 Q 140,40 120,60 Q 100,80 80,60 Q 60,40 40,60 Q 20,80 0,60 Z"
                fill="#FFD700" opacity="0.9" stroke="#FFA500" stroke-width="2" filter="url(#strong-glow)"/>
          <path d="M 10,30 Q 20,15 30,30 Q 40,45 50,30 Q 60,15 70,30 Q 80,45 90,30 Q 100,15 110,30 Q 120,45 130,30 Q 140,15 150,30 Q 160,45 170,30 Q 180,15 190,30 L 190,50 Q 180,65 170,50 Q 160,35 150,50 Q 140,65 130,50 Q 120,35 110,50 Q 100,65 90,50 Q 80,35 70,50 Q 60,65 50,50 Q 40,35 30,50 Q 20,65 10,50 Z"
                fill="#FFA500" opacity="0.6"/>
          <text x="100" y="45" 
                text-anchor="middle" dominant-baseline="central"
                font-family="${design.fontFamily}" font-size="32" font-weight="900"
                fill="#FFFFFF" filter="url(#strong-glow)">${design.name}</text>
        </g>
      ` : `
        <text x="${width - padding - 40}" y="${padding + 80}" 
              text-anchor="end"
              font-family="${design.fontFamily}" font-size="42" font-weight="${design.fontWeight}"
              fill="#FFFFFF" filter="${rank === 'SSS' ? 'url(#strong-glow)' : `url(#glow-${rank})`}">${design.name}</text>
      `}
      <!-- スターバーストアイコン（右上） -->
      <g transform="translate(${width - padding - 60}, ${padding + 100})">
        <path d="M 0,-12 L 3,-3 L 12,-3 L 4,1 L 7,10 L 0,5 L -7,10 L -4,1 L -12,-3 L -3,-3 Z"
              fill="#FFD700" filter="url(#sparkle-filter)" opacity="0.9"/>
      </g>
      
      <!-- 名前（縦書き） -->
      ${nameElements}
      
      <!-- パワーポイント表示（RareCard.tsxと同じ位置: height - 130） -->
      <g transform="translate(${width / 2}, ${height - 130})">
        <!-- スコア帯背景（RareCard.tsxと同じ） -->
        <rect x="-100" y="-35" width="200" height="70" rx="8" ry="8"
              fill="${rank === 'SSS' ? colors.bg : 'rgba(0,0,0,0.5)'}"
              opacity="0.9"
              stroke="${colors.glow}"
              stroke-width="3"
              filter="${rank === 'SSS' ? 'url(#strong-glow)' : 'url(#glow)'}"/>
        <!-- ポイント表示（RareCard.tsxと同じ） -->
        <text x="0" y="0" text-anchor="middle" dominant-baseline="central"
              font-family="Arial, sans-serif" font-size="64" font-weight="900"
              fill="#FFFFFF" 
              filter="${rank === 'SSS' ? 'url(#strong-glow)' : 'url(#glow)'}">${totalPoints}pt</text>
        <!-- パワーレベル表示（RareCard.tsxと同じ） -->
        <text x="0" y="65" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="32"
              fill="#FFFFFF" 
              opacity="0.9">パワーレベル ${powerLevel}/10</text>
      </g>
      
      <!-- フッター -->
      <text x="${width / 2}" y="${height - padding - 40}" 
            text-anchor="middle"
            font-family="${design.fontFamily}" font-size="28"
            fill="${design.textColor}" opacity="0.8">おなまえ格付け</text>
    </svg>
  `

  // SVGをPNGに変換
  const imageBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()

  return imageBuffer
}

/**
 * ベース画像を使用してレアカードを生成
 * ベース画像の上に名前テキストとエフェクトを合成
 */
async function generateRareCardWithBaseImage(
  lastName: string,
  firstName: string,
  rank: RankType,
  totalPoints: number,
  powerLevel: number,
  baseImagePath: string,
  width: number,
  height: number,
  design: RankDesign
): Promise<Buffer> {
  const fullName = lastName + firstName
  const nameChars = Array.from(fullName)
  
  // カードサイズ
  const padding = 60
  const cardWidth = width - padding * 2
  const cardHeight = height - padding * 2
  
  // 名前テキストの配置（RareCard.tsxと同じ計算ロジックを使用）
  // セーフゾーン（RareCard.tsxと同じ）
  const safeZone = { top: 120, bottom: 120, left: 80, right: 80 }
  const nameAreaWidth = width - safeZone.left - safeZone.right
  const nameAreaHeight = height - safeZone.top - safeZone.bottom
  
  // 文字サイズと行間を自動計算（RareCard.tsxと同じ）
  const charSize = Math.min(180, Math.floor(nameAreaWidth / nameChars.length * 1.2))
  const charSpacing = charSize * 1.05
  const nameStartX = width / 2
  const nameStartY = safeZone.top + (nameAreaHeight - (nameChars.length - 1) * charSpacing) / 2
  
  // ランク別の色設定（RareCard.tsxと同じ）
  const rankColors: Record<RankType, { main: string; glow: string; shadow: string; bg: string }> = {
    SSS: { main: '#FFF8D9', glow: '#FFD76A', shadow: '#B8860B', bg: '#FFD700' },
    SS: { main: '#F2F7FF', glow: '#BFD1FF', shadow: '#8FA7CC', bg: '#F5F5F5' },
    S: { main: '#FFE1CC', glow: '#FF8040', shadow: '#993300', bg: '#FF8A80' },
    'A+': { main: '#DDE8FF', glow: '#B0C8FF', shadow: '#203060', bg: '#80CBC4' },
    A: { main: '#EAF5CC', glow: '#BFE87A', shadow: '#667A3A', bg: '#A5D6A7' },
    'B+': { main: '#DCE8FF', glow: '#99BFFF', shadow: '#334A66', bg: '#C8E6C9' },
    B: { main: '#F5F5F5', glow: '#CCCCCC', shadow: '#555555', bg: '#E0E0E0' },
    C: { main: '#F2E0C6', glow: '#E5B67E', shadow: '#5C3A24', bg: '#F9E79F' },
    D: { main: '#FFD1A6', glow: '#CC5A2E', shadow: '#330000', bg: '#E5E7E9' },
  }
  const colors = rankColors[rank]

  // エフェクト定義（RareCard.tsxと同じ）
  const textEffectsDef = `
    <defs>
      <!-- 発光フィルター（RareCard.tsxと同じ） -->
      <filter id="glow">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <!-- 強力な発光フィルター（SSS用、RareCard.tsxと同じ） -->
      <filter id="strong-glow">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <!-- ランク別色付きグローフィルター（RareCard.tsxのtextShadowを完全再現: 0 0 6px glow, 0 0 14px glow, 0 4px 4px shadow） -->
      <filter id="glow-colored-${rank}" x="-100%" y="-100%" width="300%" height="300%">
        <!-- 0 0 6px ${colors.glow} -->
        <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur1"/>
        <feOffset in="blur1" dx="0" dy="0" result="offset1"/>
        <feFlood flood-color="${colors.glow}" flood-opacity="0.8" result="glowColor1"/>
        <feComposite in="glowColor1" in2="offset1" operator="in" result="glow1"/>
        
        <!-- 0 0 14px ${colors.glow} -->
        <feGaussianBlur in="SourceAlpha" stdDeviation="14" result="blur2"/>
        <feOffset in="blur2" dx="0" dy="0" result="offset2"/>
        <feFlood flood-color="${colors.glow}" flood-opacity="0.6" result="glowColor2"/>
        <feComposite in="glowColor2" in2="offset2" operator="in" result="glow2"/>
        
        <!-- 0 4px 4px ${colors.shadow} -->
        <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur3"/>
        <feOffset in="blur3" dx="0" dy="4" result="offset3"/>
        <feFlood flood-color="${colors.shadow}" flood-opacity="0.6" result="shadowColor"/>
        <feComposite in="shadowColor" in2="offset3" operator="in" result="shadow"/>
        
        <!-- マージ: 影 → 外側グロー → 内側グロー → テキスト -->
        <feMerge>
          <feMergeNode in="shadow"/>
          <feMergeNode in="glow2"/>
          <feMergeNode in="glow1"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `
  
  // 名前テキスト要素（RareCard.tsxと同じ実装）
  const nameElements = nameChars.map((char, index) => {
    const y = nameStartY + index * charSpacing

    return `
      <!-- 後光エフェクト（SSSのみ、RareCard.tsxと同じ） -->
      ${rank === 'SSS' ? `
      <text x="${nameStartX}" y="${y}" 
            text-anchor="middle" dominant-baseline="central"
            font-family="'Hannari','Yu Mincho','Hiragino Mincho ProN',serif" 
            font-size="${charSize}" 
            font-weight="900" 
            fill="${colors.glow}" 
            opacity="0.6"
            filter="url(#strong-glow)">${char}</text>
      ` : ''}
      
      <!-- 多段影（RareCard.tsxと同じ） -->
      <text x="${nameStartX + 2}" y="${y + 3}" 
            text-anchor="middle" dominant-baseline="central"
            font-family="'Hannari','Yu Mincho','Hiragino Mincho ProN',serif" 
            font-size="${charSize}" 
            font-weight="900" 
            fill="${colors.shadow}" 
            opacity="0.6">${char}</text>
      
      <!-- メインテキスト（RareCard.tsxと同じ、色付きグロー適用、SSランクは縁取り強化） -->
      <text x="${nameStartX}" y="${y}" 
            text-anchor="middle" dominant-baseline="central"
            font-family="'Hannari','Yu Mincho','Hiragino Mincho ProN',serif" 
            font-size="${charSize}" 
            font-weight="900" 
            fill="${colors.main}" 
            stroke="${rank === 'SS' ? '#1A3A5F' : colors.shadow}"
            stroke-width="${rank === 'SS' ? 6 : 4}"
            stroke-linejoin="round"
            stroke-linecap="round"
            filter="${rank === 'SSS' ? 'url(#strong-glow)' : `url(#glow-colored-${rank})`}">${char}</text>
      
      <!-- 内側ハイライト（RareCard.tsxと同じ） -->
      <text x="${nameStartX - 1}" y="${y - 2}" 
            text-anchor="middle" dominant-baseline="central"
            font-family="'Hannari','Yu Mincho','Hiragino Mincho ProN',serif" 
            font-size="${charSize * 0.98}" 
            font-weight="900" 
            fill="rgba(255,255,255,0.4)" 
            opacity="0.5">${char}</text>
    `
  }).join('\n')
  
  // テキストレイヤーのSVG生成
  const textLayerSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${textEffectsDef}
      
      <!-- 名前（縦書き） -->
      ${nameElements}
      
      <!-- パワーポイント表示（RareCard.tsxと同じ） -->
      <g transform="translate(${width / 2}, ${height - 130})">
        <!-- スコア帯背景（RareCard.tsxと同じ） -->
        <rect x="-100" y="-35" width="200" height="70" rx="8" ry="8"
              fill="${rank === 'SSS' ? colors.bg : 'rgba(0,0,0,0.5)'}"
              opacity="0.9"
              stroke="${colors.glow}"
              stroke-width="3"
              filter="${rank === 'SSS' ? 'url(#strong-glow)' : 'url(#glow)'}"/>
        <!-- ポイント表示（RareCard.tsxと同じ） -->
        <text x="0" y="0" text-anchor="middle" dominant-baseline="central"
              font-family="Arial, sans-serif" font-size="64" font-weight="900"
              fill="#FFFFFF" 
              filter="${rank === 'SSS' ? 'url(#strong-glow)' : 'url(#glow)'}">${totalPoints}pt</text>
        <!-- パワーレベル表示（RareCard.tsxと同じ） -->
        <text x="0" y="65" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="32"
              fill="#FFFFFF" 
              opacity="0.9">パワーレベル ${powerLevel}/10</text>
      </g>
    </svg>
  `
  
  // ベース画像を読み込む
  let baseImage: sharp.Sharp
  try {
    const fs = await import('fs')
    const path = await import('path')
    
    // baseImagePathが`/images/...`で始まる場合は先頭の`/`を削除
    const normalizedPath = baseImagePath.startsWith('/') 
      ? baseImagePath.substring(1) 
      : baseImagePath
    
    const imagePath = path.join(process.cwd(), 'public', normalizedPath)
    console.log('📸 ベース画像パス:', imagePath)
    
    // ファイルの存在確認
    if (!fs.existsSync(imagePath)) {
      throw new Error(`ベース画像が見つかりません: ${imagePath} (元のパス: ${baseImagePath})`)
    }
    
    const baseImageBuffer = fs.readFileSync(imagePath)
    baseImage = sharp(baseImageBuffer).resize(width, height)
    console.log('✅ ベース画像読み込み成功:', imagePath)
  } catch (error: any) {
    console.error('❌ ベース画像の読み込みエラー:', error)
    console.error('エラー詳細:', {
      baseImagePath,
      cwd: process.cwd(),
      errorMessage: error.message,
      errorStack: error.stack,
    })
    // フォールバック：エラーを返す
    throw new Error(`ベース画像の読み込みに失敗しました: ${baseImagePath}. 詳細: ${error.message}`)
  }
  
  // テキストレイヤーをPNGに変換
  const textLayerBuffer = await sharp(Buffer.from(textLayerSvg))
    .png()
    .toBuffer()
  
  // ベース画像の上にテキストレイヤーを合成
  const finalImage = await baseImage
    .composite([
      {
        input: textLayerBuffer,
        blend: 'over', // オーバーレイモード
      },
    ])
    .png()
    .toBuffer()
  
  return finalImage
}

/**
 * Phase 2: SSS特別演出 - 火花エフェクト生成（より細かく、多く）
 */
function generateSparkles(
  width: number,
  height: number,
  padding: number,
  cardWidth: number,
  cardHeight: number,
  count: number = 30
): string {
  const sparkles: string[] = []
  
  for (let i = 0; i < count; i++) {
    const x = padding + Math.random() * cardWidth
    const y = padding + Math.random() * cardHeight
    const size = 2 + Math.random() * 4  // より小さく
    const rotation = Math.random() * 360
    
    // 星形の火花（より細かく）
    sparkles.push(`
      <g transform="translate(${x}, ${y}) rotate(${rotation})">
        <circle cx="0" cy="0" r="${size * 0.5}" fill="#FFD700" filter="url(#sparkle-filter)" opacity="${0.4 + Math.random() * 0.6}"/>
        <path d="M 0,-${size} L ${size * 0.3},-${size * 0.3} L ${size},0 L ${size * 0.3},${size * 0.3} L 0,${size} L -${size * 0.3},${size * 0.3} L -${size},0 L -${size * 0.3},-${size * 0.3} Z"
              fill="#FFD700" filter="url(#sparkle-filter)" opacity="${0.5 + Math.random() * 0.5}"/>
      </g>
    `)
  }
  
  return sparkles.join('\n')
}

/**
 * Phase 2: SSS特別演出 - 炎のようなコーナー装飾（画像の下部コーナーに合わせて）
 */
function generateFlameCorner(size: number): string {
  // 炎のような装飾（下部コーナー用）
  return `
    <g>
      <!-- 炎の装飾（複数の炎のパス） -->
      <path d="M 0,0 Q ${size * 0.2},-${size * 0.3} ${size * 0.4},-${size * 0.5} 
               Q ${size * 0.3},-${size * 0.4} ${size * 0.5},-${size * 0.7} 
               Q ${size * 0.4},-${size * 0.6} ${size * 0.6},-${size * 0.8} 
               Q ${size * 0.5},-${size * 0.7} ${size * 0.7},-${size * 0.9} 
               Q ${size * 0.6},-${size * 0.8} ${size * 0.8},-${size}"
            fill="#FFD700" stroke="#FFA500" stroke-width="2" filter="url(#strong-glow)" opacity="0.9"/>
      <path d="M 0,0 Q ${size * 0.15},-${size * 0.25} ${size * 0.35},-${size * 0.45} 
               Q ${size * 0.25},-${size * 0.35} ${size * 0.45},-${size * 0.65} 
               Q ${size * 0.35},-${size * 0.55} ${size * 0.55},-${size * 0.75} 
               Q ${size * 0.45},-${size * 0.65} ${size * 0.65},-${size * 0.85}"
            fill="#FFA500" filter="url(#strong-glow)" opacity="0.7"/>
    </g>
  `
}

/**
 * パターンを生成 - Phase 1: 基本パターンのみ実装
 */
function generatePattern(
  pattern: string,
  width: number,
  height: number,
  padding: number,
  cardWidth: number,
  cardHeight: number
): string {
  const startX = padding + 20
  const startY = padding + 20
  const endX = width - padding - 20
  const endY = height - padding - 20

  // Phase 1: 基本パターンのマッピング
  // Phase 2以降で詳細なパターンを実装予定
  if (pattern === 'dragon-gold' || pattern === 'diamond') {
    // ダイヤモンドパターン（SSS: 龍の模様はPhase 2で実装）
    let diamonds = ''
    for (let x = startX; x < endX; x += 100) {
      for (let y = startY; y < endY; y += 100) {
        diamonds += `
          <path d="M ${x} ${y - 20} L ${x + 20} ${y} L ${x} ${y + 20} L ${x - 20} ${y} Z"
                fill="#ffffff" opacity="0.15"/>
        `
      }
    }
    return diamonds
  } else if (pattern === 'cloud-silver' || pattern === 'star') {
    // 星パターン（SS: 雲の模様はPhase 2で実装）
    let stars = ''
    for (let x = startX; x < endX; x += 120) {
      for (let y = startY; y < endY; y += 120) {
        stars += `
          <path d="M ${x} ${y - 15} L ${x + 4} ${y - 4} L ${x + 15} ${y - 4} L ${x + 6} ${y + 2} 
                   L ${x + 10} ${y + 13} L ${x} ${y + 6} L ${x - 10} ${y + 13} L ${x - 6} ${y + 2} 
                   L ${x - 15} ${y - 4} L ${x - 4} ${y - 4} Z"
                fill="#ffffff" opacity="0.1"/>
        `
      }
    }
    return stars
  } else if (pattern === 'flame-red' || pattern === 'sparkle') {
    // キラキラパターン（S: 炎の模様はPhase 2で実装）
    let sparkles = ''
    for (let x = startX; x < endX; x += 80) {
      for (let y = startY; y < endY; y += 80) {
        sparkles += `
          <circle cx="${x}" cy="${y}" r="3" fill="#ffffff" opacity="0.15"/>
          <path d="M ${x} ${y - 8} L ${x} ${y + 8} M ${x - 8} ${y} L ${x + 8} ${y}"
                stroke="#ffffff" stroke-width="2" opacity="0.15"/>
        `
      }
    }
    return sparkles
  } else if (pattern === 'stardust') {
    // 星屑エフェクト（B+）
    let stardust = ''
    for (let x = startX; x < endX; x += 60) {
      for (let y = startY; y < endY; y += 60) {
        stardust += `
          <circle cx="${x}" cy="${y}" r="2" fill="#ffffff" opacity="0.2"/>
        `
      }
    }
    return stardust
  } else if (pattern === 'vertical-lines-red') {
    // 縦線パターン（D: 朱の縦線）
    let lines = ''
    for (let x = startX; x < endX; x += 30) {
      lines += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${endY}" stroke="#DC143C" stroke-width="1" opacity="0.3"/>`
    }
    return lines
  } else {
    // デフォルト（グリッド）- その他のパターンはPhase 2で実装
    let grid = ''
    for (let x = startX; x < endX; x += 50) {
      grid += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${endY}" stroke="#ffffff" stroke-width="1" opacity="0.05"/>`
    }
    for (let y = startY; y < endY; y += 50) {
      grid += `<line x1="${startX}" y1="${y}" x2="${endX}" y2="${y}" stroke="#ffffff" stroke-width="1" opacity="0.05"/>`
    }
    return grid
  }
}

