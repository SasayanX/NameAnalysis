"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/components/ui/use-toast"

interface PdfExportButtonProps {
  contentId: string
  fileName?: string
  buttonText?: string
}

export function PdfExportButton({
  contentId,
  fileName = "姓名判断結果",
  buttonText = "PDFでダウンロード",
}: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportToPdf = async () => {
    const element = document.getElementById(contentId)
    if (!element) {
      toast({
        title: "エラー",
        description: "エクスポートする内容が見つかりませんでした。",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      // 要素内の画像が完全に読み込まれるのを待つ
      const images = Array.from(element.querySelectorAll("img"))
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve // エラーが発生しても続行
          })
        }),
      )

      // スクロール位置を保存
      const scrollX = window.scrollX
      const scrollY = window.scrollY

      // html2canvasのオプションを改善
      const canvas = await html2canvas(element, {
        scale: 1.5, // 解像度を少し下げて安定性を向上
        useCORS: true, // 外部画像を使用する場合
        allowTaint: true, // セキュリティ制限を緩和
        logging: false,
        backgroundColor: "#ffffff",
        imageTimeout: 15000, // 画像読み込みのタイムアウトを延長
        onclone: (clonedDoc) => {
          // クローンされたドキュメントのスタイルを調整
          const clonedElement = clonedDoc.getElementById(contentId)
          if (clonedElement) {
            // 印刷に適したスタイルを適用
            clonedElement.style.overflow = "visible"
            clonedElement.style.height = "auto"
            // フォントを確実に読み込む
            clonedDoc.fonts?.ready
          }
          return Promise.resolve()
        },
      })

      // スクロール位置を復元
      window.scrollTo(scrollX, scrollY)

      // PDFのサイズを設定（A4サイズ）
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // キャンバスをPDFに変換（品質を調整）
      const imgData = canvas.toDataURL("image/jpeg", 0.95) // JPEGに変更し、品質を95%に設定
      const imgWidth = 210 // A4幅
      const pageHeight = 295 // A4高さ (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // 複数ページに分割する処理を改善
      let heightLeft = imgHeight
      let position = 0
      let pageCount = 0

      // 最初のページ
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      pageCount++

      // 複数ページに分割（改善版）
      while (heightLeft > 0) {
        position = -pageHeight * pageCount
        pdf.addPage()
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
        pageCount++
      }

      // PDFを保存
      pdf.save(`${fileName}.pdf`)

      toast({
        title: "PDFのエクスポートが完了しました",
        description: `${fileName}.pdfとして保存されました`,
      })
    } catch (error) {
      console.error("PDF export error:", error)
      toast({
        title: "エクスポートに失敗しました",
        description: "PDFの生成中にエラーが発生しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={exportToPdf} disabled={isExporting} variant="outline" size="sm">
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          エクスポート中...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  )
}

// 名前付きエクスポート（大文字のD）
export { PdfExportButton as PDFExportButton }

// 後方互換性のため既存のエクスポートも維持

export default PdfExportButton
