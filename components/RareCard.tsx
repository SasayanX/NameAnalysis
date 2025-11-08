'use client'

import { useEffect, useRef, useState } from 'react'

interface RareCardProps {
  lastName: string
  firstName: string
  rank: 'SSS' | 'SS' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'
  title: string
  score: number
  powerLevel: number
  baseSrc?: string // ランク別ベース画像（オプション）
  width?: number
  height?: number
}

export default function RareCard({
  lastName,
  firstName,
  rank,
  title,
  score,
  powerLevel,
  baseSrc,
  width = 1024,
  height = 1536,
}: RareCardProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const fullName = lastName + firstName
  const nameChars = Array.from(fullName)

  // ランク別ベース画像のデフォルトパス
  const defaultBaseSrc = baseSrc || `/images/rare-cards/card_base_${rank}_v1.png`

  // ランク別の色設定（新規カラーパレット）
  const rankColors = {
    SSS: { main: '#FFF8D9', glow: '#FFD76A', shadow: '#B8860B', bg: '#FFD700' }, // 黄金
    SS: { main: '#F2F7FF', glow: '#BFD1FF', shadow: '#8FA7CC', bg: '#F5F5F5' }, // 白金
    S: { main: '#FFE1CC', glow: '#FF8040', shadow: '#993300', bg: '#FF8A80' }, // 赤金
    'A+': { main: '#DDE8FF', glow: '#B0C8FF', shadow: '#203060', bg: '#80CBC4' }, // 群青金箔
    A: { main: '#EAF5CC', glow: '#BFE87A', shadow: '#667A3A', bg: '#A5D6A7' }, // 若草龍鱗
    'B+': { main: '#DCE8FF', glow: '#99BFFF', shadow: '#334A66', bg: '#C8E6C9' }, // 青灰
    B: { main: '#F5F5F5', glow: '#CCCCCC', shadow: '#555555', bg: '#E0E0E0' }, // 灰白
    C: { main: '#F2E0C6', glow: '#E5B67E', shadow: '#5C3A24', bg: '#F9E79F' }, // 木目
    D: { main: '#FFD1A6', glow: '#CC5A2E', shadow: '#330000', bg: '#E5E7E9' }, // 黒墨
  }

  const colors = rankColors[rank]

  // セーフゾーン（上下120px / 左右80px）
  const safeZone = { top: 120, bottom: 120, left: 80, right: 80 }
  const nameAreaWidth = width - safeZone.left - safeZone.right
  const nameAreaHeight = height - safeZone.top - safeZone.bottom

  // 縦書きの文字サイズと行間を自動計算
  const charSize = Math.min(180, Math.floor(nameAreaWidth / nameChars.length * 1.2)) // 144から180に増加、係数も1.2に
  const charSpacing = charSize * 1.05
  const nameStartX = width / 2
  const nameStartY = safeZone.top + (nameAreaHeight - (nameChars.length - 1) * charSpacing) / 2

  return (
    <div className="relative inline-block">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="rounded-2xl shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>

          {/* 発光フィルター */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 強力な発光フィルター（SSS用） */}
          <filter id="strong-glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 浮き彫りフィルター */}
          <filter id="emboss">
            <feDiffuseLighting in="SourceGraphic" lightingColor={colors.glow} surfaceScale="2" result="light">
              <feDistantLight azimuth="225" elevation="40" />
            </feDiffuseLighting>
            <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="1" k2="0.7" k3="0" k4="0" />
          </filter>

          {/* 多段影フィルター */}
          <filter id="multi-shadow">
            <feGaussianBlur stdDeviation="4" result="shadow1" />
            <feGaussianBlur stdDeviation="8" result="shadow2" />
            <feMerge>
              <feMergeNode in="shadow2" />
              <feMergeNode in="shadow1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 背景ベース画像 */}
        <image
          href={defaultBaseSrc}
          x="0"
          y="0"
          width={width}
          height={height}
          preserveAspectRatio="xMidYMid slice"
        />

        {/* 名前（縦書き中央） */}
        {nameChars.map((char, index) => {
          const y = nameStartY + index * charSpacing
          const glowFilter = rank === 'SSS' ? 'url(#strong-glow)' : 'url(#glow)'

          return (
            <g key={index}>
              {/* 後光エフェクト（SSSのみ） */}
              {rank === 'SSS' && (
                <text
                  x={nameStartX}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={charSize}
                  fontWeight="900"
                  fill={colors.glow}
                  opacity="0.6"
                  filter="url(#strong-glow)"
                  fontFamily="'Hannari','Yu Mincho','Hiragino Mincho ProN',serif"
                >
                  {char}
                </text>
              )}

              {/* 多段影 */}
              <text
                x={nameStartX + 2}
                y={y + 3}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={charSize}
                fontWeight="900"
                fill={colors.shadow}
                opacity="0.6"
                fontFamily="'Hannari','Yu Mincho','Hiragino Mincho ProN',serif"
              >
                {char}
              </text>

              {/* メインテキスト */}
              <text
                x={nameStartX}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={charSize}
                fontWeight="900"
                fill={colors.main}
                stroke={rank === 'SS' ? '#1A3A5F' : colors.shadow}
                strokeWidth={rank === 'SS' ? 6 : 4}
                strokeLinejoin="round"
                strokeLinecap="round"
                filter={glowFilter}
                fontFamily="'Hannari','Yu Mincho','Hiragino Mincho ProN',serif"
                style={{
                  textShadow: `0 0 6px ${colors.glow}, 0 0 14px ${colors.glow}, 0 4px 4px ${colors.shadow}`,
                }}
              >
                {char}
              </text>

              {/* 内側ハイライト */}
              <text
                x={nameStartX - 1}
                y={y - 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={charSize * 0.98}
                fontWeight="900"
                fill="rgba(255,255,255,0.4)"
                opacity="0.5"
                fontFamily="'Hannari','Yu Mincho','Hiragino Mincho ProN',serif"
              >
                {char}
              </text>
            </g>
          )
        })}

        {/* スコア帯（下部） */}
        <g transform={`translate(${width / 2}, ${height - 130})`}>
          <rect
            x="-100"
            y="-35"
            width="200"
            height="70"
            rx="8"
            ry="8"
            fill={rank === 'SSS' ? colors.bg : 'rgba(0,0,0,0.5)'}
            opacity="0.9"
            stroke={colors.glow}
            strokeWidth="3"
            filter={rank === 'SSS' ? 'url(#strong-glow)' : 'url(#glow)'}
          />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="64"
            fontWeight="900"
            fill="#FFFFFF"
            filter={rank === 'SSS' ? 'url(#strong-glow)' : 'url(#glow)'}
          >
            {score}pt
          </text>
          <text
            x="0"
            y="65"
            textAnchor="middle"
            fontSize="32"
            fill="#FFFFFF"
            opacity="0.9"
          >
            パワーレベル {powerLevel}/10
          </text>
        </g>
      </svg>
    </div>
  )
}

