"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface UseTextToSpeechOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const {
    lang = "ja-JP",
    rate = 1.0,
    pitch = 1.0,
    volume = 1.0,
  } = options

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }
    return () => {
      // クリーンアップ: コンポーネントのアンマウント時に読み上げを停止
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current) {
        console.warn("SpeechSynthesis is not supported")
        return
      }

      // 既存の読み上げを停止
      synthRef.current.cancel()

      // テキストをクリーンアップ（改行を空白に変換、連続する空白を1つに）
      const cleanText = text
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim()

      if (!cleanText) {
        console.warn("Empty text to speak")
        return
      }

      // 新しい発話を作成
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = lang
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume

      // イベントハンドラー
      utterance.onstart = () => {
        setIsSpeaking(true)
        setIsPaused(false)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        utteranceRef.current = null
      }

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event)
        setIsSpeaking(false)
        setIsPaused(false)
        utteranceRef.current = null
      }

      utterance.onpause = () => {
        setIsPaused(true)
      }

      utterance.onresume = () => {
        setIsPaused(false)
      }

      utteranceRef.current = utterance
      synthRef.current.speak(utterance)
    },
    [lang, rate, pitch, volume]
  )

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
      utteranceRef.current = null
    }
  }, [])

  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking && !isPaused) {
      synthRef.current.pause()
      setIsPaused(true)
    }
  }, [isSpeaking, isPaused])

  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume()
      setIsPaused(false)
    }
  }, [isPaused])

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
  }
}

