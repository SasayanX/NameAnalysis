'use client'

import React, { useEffect, useRef, useState } from 'react'

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
  // スペースを除外した文字配列を作成
  const lastNameChars = Array.from(lastName)
  const firstNameChars = Array.from(firstName)
  const nameChars = [...lastNameChars, ...firstNameChars]
  const lastNameLength = lastNameChars.length // 姓名の境界を記録

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
  const charSize = Math.min(200, Math.floor(nameAreaWidth / nameChars.length * 1.2)) // 最大200px
  const baseCharSpacing = charSize * 1.05
  const nameSpacing = baseCharSpacing * 0.2 // 姓名の間の追加間隔（通常の20%）
  const nameStartX = width / 2
  
  // 通常の文字間隔で全体の高さを計算（姓名の間の追加間隔は後で加算）
  const totalBaseSpacing = (nameChars.length - 1) * baseCharSpacing
  const nameStartY = safeZone.top + (nameAreaHeight - totalBaseSpacing - nameSpacing) / 2

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

          {/* 昇龍エフェクト用: ランク別グラデーション（各文字用） */}
          {nameChars.map((char, index) => {
            if (rank === 'SSS') {
              // SSS: 金色系グラデーション（下から上へ）
              return (
                <React.Fragment key={`gradient-sss-${index}`}>
                  <linearGradient id={`flame-gradient-front-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#B8860B', stopOpacity: 1 }} />
                    <stop offset="30%" style={{ stopColor: '#DAA520', stopOpacity: 1 }} />
                    <stop offset="60%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                    <stop offset="85%" style={{ stopColor: '#FFE55C', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#FFF8D9', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id={`stroke-gradient-front-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
                  </linearGradient>
                </React.Fragment>
              )
            } else if (rank === 'SS') {
              // SS: 銀色系グラデーション（下から上へ）
              return (
                <React.Fragment key={`gradient-ss-${index}`}>
                  <linearGradient id={`flame-gradient-front-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#4A5568', stopOpacity: 1 }} />
                    <stop offset="30%" style={{ stopColor: '#718096', stopOpacity: 1 }} />
                    <stop offset="60%" style={{ stopColor: '#A0AEC0', stopOpacity: 1 }} />
                    <stop offset="85%" style={{ stopColor: '#C0CCD4', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#F2F7FF', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id={`stroke-gradient-front-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
                  </linearGradient>
                </React.Fragment>
              )
            } else if (rank === 'A+') {
              // A+: 紺色系グラデーション（下から上へ）
              return (
                <linearGradient key={`flame-${index}`} id={`flame-gradient-front-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#203060', stopOpacity: 1 }} />
                  <stop offset="30%" style={{ stopColor: '#334A66', stopOpacity: 1 }} />
                  <stop offset="60%" style={{ stopColor: '#5C7FB8', stopOpacity: 1 }} />
                  <stop offset="85%" style={{ stopColor: '#B0C8FF', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#DDE8FF', stopOpacity: 1 }} />
                </linearGradient>
              )
            } else if (rank === 'A') {
              // A: 緑系グラデーション（下から上へ）
              return (
                <linearGradient key={`flame-${index}`} id={`flame-gradient-front-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#2E7D32', stopOpacity: 1 }} />
                  <stop offset="30%" style={{ stopColor: '#388E3C', stopOpacity: 1 }} />
                  <stop offset="60%" style={{ stopColor: '#66BB6A', stopOpacity: 1 }} />
                  <stop offset="85%" style={{ stopColor: '#A5D6A7', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#C8E6C9', stopOpacity: 1 }} />
                </linearGradient>
              )
            } else if (rank === 'B+') {
              // B+: 銀色系グラデーション（下から上へ）
              return (
                <linearGradient key={`flame-${index}`} id={`flame-gradient-front-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#4A5568', stopOpacity: 1 }} />
                  <stop offset="30%" style={{ stopColor: '#718096', stopOpacity: 1 }} />
                  <stop offset="60%" style={{ stopColor: '#A0AEC0', stopOpacity: 1 }} />
                  <stop offset="85%" style={{ stopColor: '#C0CCD4', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#F2F7FF', stopOpacity: 1 }} />
                </linearGradient>
              )
            } else if (rank === 'B') {
              // B: 下から黒、上に銀のグラデーション
              return (
                <linearGradient key={`flame-${index}`} id={`flame-gradient-front-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#4A4A4A', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
                </linearGradient>
              )
            } else if (rank === 'C') {
              // C: 下から焦げ茶、上に黄色のグラデーション
              return (
                <linearGradient key={`flame-${index}`} id={`flame-gradient-front-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#5D4037', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#8D6E63', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                </linearGradient>
              )
            } else {
              // D: 下から黒、上に白のグラデーション
              return (
                <linearGradient key={`flame-${index}`} id={`flame-gradient-front-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#4A4A4A', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
                </linearGradient>
              )
            }
          })}
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
          // 累積Y位置を計算（姓と名の間だけ追加間隔）
          let y = nameStartY
          for (let i = 0; i < index; i++) {
            y += baseCharSpacing
            // 姓の最後の文字の後（名の最初の文字の前）に追加間隔を加える
            if (i === lastNameLength - 1) {
              y += nameSpacing
            }
          }
          
          const glowFilter = rank === 'SSS' ? 'url(#strong-glow)' : 'url(#glow)'
          const fontFamily = "'KSW闘龍', serif"

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
                  fontWeight="700"
                  fill={colors.glow}
                  opacity="0.6"
                  filter="url(#strong-glow)"
                  fontFamily={fontFamily}
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
                fontWeight="700"
                fill={colors.shadow}
                opacity="0.6"
                fontFamily={fontFamily}
              >
                {char}
              </text>

              {/* メインテキスト（昇龍エフェクト: 下から上への炎グラデーション + 縁取り） */}
              <text
                x={nameStartX}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={charSize}
                fontWeight="700"
                fill={`url(#flame-gradient-front-${index})`}
                stroke={
                  rank === 'SSS' || rank === 'SS' 
                    ? `url(#stroke-gradient-front-${index})` 
                    : rank === 'D'
                    ? '#FFFFFF'
                    : rank === 'C'
                    ? '#D7CCC8'
                    : rank === 'B'
                    ? '#F5DEB3'
                    : '#FFD700'
                }
                strokeWidth={1.5}
                strokeLinejoin="miter"
                strokeLinecap="butt"
                strokeOpacity={0.9}
                strokeMiterlimit={4}
                fontFamily={fontFamily}
                style={{
                  textRendering: 'optimizeLegibility',
                  shapeRendering: 'crispEdges',
                }}
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
            fill={`url(#flame-gradient-front-0)`}
            stroke={rank === 'SSS' ? '#FFFFFF' : 'none'}
            strokeWidth={rank === 'SSS' ? '0.3' : '0'}
            strokeLinejoin="round"
            strokeLinecap="round"
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

