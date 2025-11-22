/**
 * レアカード画像のCanvas書き出しユーティリティ
 */

/**
 * 画像URLをData URLに変換
 */
async function imageToDataURL(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // 相対パスを絶対URLに変換
    let absoluteUrl = url
    if (url.startsWith('/')) {
      absoluteUrl = window.location.origin + url
    } else if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
      absoluteUrl = window.location.origin + '/' + url
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    const timeout = setTimeout(() => {
      reject(new Error(`Image load timeout: ${absoluteUrl}`))
    }, 10000)

    img.onload = () => {
      clearTimeout(timeout)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch (error: any) {
        reject(new Error(`Failed to convert image to data URL: ${error.message}`))
      }
    }
    img.onerror = (error) => {
      clearTimeout(timeout)
      console.error('Image load error:', absoluteUrl, error)
      reject(new Error(`Failed to load image: ${absoluteUrl}. This may be due to CORS restrictions.`))
    }
    img.src = absoluteUrl
  })
}

/**
 * SVG要素をPNG Blobに変換
 */
export async function renderCardPNG(svgElement: SVGSVGElement): Promise<Blob> {
  // SVG内の外部画像をData URLに変換
  const imageElements = svgElement.querySelectorAll('image')
  const imagePromises = Array.from(imageElements).map(async (imgEl) => {
    const href = imgEl.getAttribute('href') || imgEl.getAttribute('xlink:href')
    if (href && !href.startsWith('data:')) {
      try {
        const dataUrl = await imageToDataURL(href)
        imgEl.setAttribute('href', dataUrl)
        if (imgEl.hasAttribute('xlink:href')) {
          imgEl.setAttribute('xlink:href', dataUrl)
        }
      } catch (error) {
        console.warn('Failed to convert image to data URL:', href, error)
        // エラーが発生した場合は、画像要素を削除するか、空のData URLを設定
        // これにより、SVGの読み込みエラーを防ぐ
        try {
          // 透明な1x1ピクセルのData URLを設定
          const emptyDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          imgEl.setAttribute('href', emptyDataUrl)
          if (imgEl.hasAttribute('xlink:href')) {
            imgEl.setAttribute('xlink:href', emptyDataUrl)
          }
        } catch (setError) {
          console.warn('Failed to set fallback image:', setError)
        }
      }
    }
  })

  // すべての画像変換を待つ（エラーが発生しても続行）
  await Promise.allSettled(imagePromises)

  const svgData = new XMLSerializer().serializeToString(svgElement)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.crossOrigin = 'anonymous'

  return new Promise((resolve, reject) => {
    // タイムアウトを設定（10秒）
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url)
      reject(new Error('SVG image load timeout'))
    }, 10000)

    img.onload = () => {
      clearTimeout(timeout)
      const canvas = document.createElement('canvas')
      canvas.width = svgElement.viewBox.baseVal.width || svgElement.clientWidth
      canvas.height = svgElement.viewBox.baseVal.height || svgElement.clientHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Canvas context not available'))
        return
      }

      // 背景を黒で塗りつぶし（透明度対策）
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

    img.onerror = (error) => {
      clearTimeout(timeout)
      URL.revokeObjectURL(url)
      console.error('SVG image load error:', error)
      // より詳細なエラー情報を提供
      const svgDataPreview = new XMLSerializer().serializeToString(svgElement).substring(0, 200)
      reject(new Error(`Failed to load SVG image. This may be due to CORS restrictions or invalid image references. SVG preview: ${svgDataPreview}...`))
    }

    // SVGを読み込む前に少し待つ（画像変換が完了するまで）
    setTimeout(() => {
      img.src = url
    }, 100)
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

