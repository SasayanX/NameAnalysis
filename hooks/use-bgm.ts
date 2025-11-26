/**
 * BGM管理用カスタムフック
 * AI深層言霊鑑定結果表示時にBGMを再生
 */
"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export function useBGM() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [volume, setVolume] = useState(0.5) // デフォルト音量50%

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    if (typeof window === "undefined") return

    const savedEnabled = localStorage.getItem("ai-fortune-bgm-enabled")
    const savedVolume = localStorage.getItem("ai-fortune-bgm-volume")

    if (savedEnabled !== null) {
      setIsEnabled(savedEnabled === "true")
    }
    if (savedVolume !== null) {
      setVolume(parseFloat(savedVolume))
    }
  }, [])

  // Audio要素を初期化
  useEffect(() => {
    if (typeof window === "undefined") return

    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/Nozomi.mp3")
      audioRef.current.loop = true
      audioRef.current.volume = volume
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // 音量変更
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      localStorage.setItem("ai-fortune-bgm-volume", volume.toString())
    }
  }, [volume])

  // BGM再生
  const play = useCallback(async () => {
    if (!audioRef.current) return

    try {
      await audioRef.current.play()
      setIsPlaying(true)
      setIsEnabled(true)
      localStorage.setItem("ai-fortune-bgm-enabled", "true")
      console.log("[BGM] 再生開始")
    } catch (error: any) {
      console.warn("[BGM] 自動再生に失敗しました:", error.message)
      // autoplay制限により失敗した場合は、ユーザーに手動再生を促す
      setIsPlaying(false)
    }
  }, [])

  // BGM停止
  const pause = useCallback(() => {
    if (!audioRef.current) return

    audioRef.current.pause()
    setIsPlaying(false)
    setIsEnabled(false)
    localStorage.setItem("ai-fortune-bgm-enabled", "false")
    console.log("[BGM] 停止")
  }, [])

  // BGMトグル
  const toggle = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  // 自動再生を試みる（ユーザー操作後に呼び出す想定）
  const tryAutoPlay = useCallback(async () => {
    // 以前に無効化していた場合は再生しない
    const savedEnabled = localStorage.getItem("ai-fortune-bgm-enabled")
    if (savedEnabled === "false") {
      console.log("[BGM] ユーザーが以前に無効化したため、自動再生をスキップ")
      return false
    }

    // 初回または有効化されている場合は自動再生を試みる
    try {
      await play()
      return true
    } catch (error) {
      console.warn("[BGM] 自動再生に失敗しました")
      return false
    }
  }, [play])

  return {
    isPlaying,
    isEnabled,
    volume,
    play,
    pause,
    toggle,
    tryAutoPlay,
    setVolume,
  }
}

