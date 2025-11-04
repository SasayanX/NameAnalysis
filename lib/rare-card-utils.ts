/**
 * レアカード画像のCanvas書き出しユーティリティ
 */

/**
 * SVG要素をPNG Blobに変換
 */
export async function renderCardPNG(svgElement: SVGSVGElement): Promise<Blob> {
  const svgData = new XMLSerializer().serializeToString(svgElement)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.crossOrigin = 'anonymous'

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = svgElement.viewBox.baseVal.width || svgElement.clientWidth
      canvas.height = svgElement.viewBox.baseVal.height || svgElement.clientHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // 背景を白で塗りつぶし（透明度対策）
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // SVG画像を描画
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        'image/png',
        1.0
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image'))
    }

    img.src = url
  })
}

/**
 * PNG Blobをダウンロード
 */
export function downloadCardPNG(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * PNG BlobをData URLに変換（共有用）
 */
export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * SNS共有用のテキストを生成
 */
export function generateShareText(
  lastName: string,
  firstName: string,
  rank: string,
  title: string,
  score: number
): string {
  return `${lastName}${firstName}さんの姓名判断結果\n${rank} ${title} / ${score}pt\n\n#AI姓名判断 #姓名判断 #レアカード\nhttps://seimei.app`
}

/**
 * Web Share APIで共有（対応デバイスのみ）
 */
export async function shareCard(
  blob: Blob,
  shareText: string,
  lastName: string,
  firstName: string,
  rank: string
): Promise<void> {
  if (!navigator.share) {
    throw new Error('Web Share API is not supported')
  }

  const file = new File([blob], `${lastName}${firstName}_${rank}_RareCard.png`, {
    type: 'image/png',
  })

  await navigator.share({
    title: `${lastName}${firstName}さんのレアカード`,
    text: shareText,
    files: [file],
  })
}

