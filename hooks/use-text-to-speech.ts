"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface UseTextToSpeechOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  useGoogleCloud?: boolean // Google Cloud TTSを使用するか（デフォルト: true）
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const {
    lang = "ja-JP",
    rate = 1.0,
    pitch = 1.0,
    volume = 1.0,
    useGoogleCloud = true, // デフォルトでGoogle Cloud TTSを使用
  } = options

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // ブラウザのWeb Speech API用
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  
  // Google Cloud TTS用
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioSourceRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && !useGoogleCloud) {
      synthRef.current = window.speechSynthesis
    }
    return () => {
      // クリーンアップ
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      if (audioSourceRef.current) {
        URL.revokeObjectURL(audioSourceRef.current)
      }
    }
  }, [useGoogleCloud])

  // Google Cloud TTSを使用した読み上げ
  const speakWithGoogleCloud = useCallback(
    async (text: string) => {
      setIsLoading(true)
      
      try {
        // 既存の音声を停止
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ""
        }
        if (audioSourceRef.current) {
          URL.revokeObjectURL(audioSourceRef.current)
          audioSourceRef.current = null
        }

        // テキストをクリーンアップ
        const cleanText = text
          .replace(/\n+/g, " ")
          .replace(/\s+/g, " ")
          .trim()

        if (!cleanText) {
          console.warn("Empty text to speak")
          setIsLoading(false)
          return
        }

        // API呼び出し
        const response = await fetch("/api/text-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleanText,
            languageCode: lang,
            speakingRate: rate,
            pitch: pitch,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const data = await response.json()

        if (!data.success || !data.audioContent) {
          throw new Error(data.error || "音声データの取得に失敗しました")
        }

        // Base64デコードしてBlobを作成
        const audioBytes = Uint8Array.from(atob(data.audioContent), (c) => c.charCodeAt(0))
        const audioBlob = new Blob([audioBytes], { type: "audio/mp3" })
        const audioUrl = URL.createObjectURL(audioBlob)
        audioSourceRef.current = audioUrl

        // Audio要素を作成・再生
        const audio = new Audio(audioUrl)
        audio.volume = volume
        audioRef.current = audio

        audio.onplay = () => {
          setIsSpeaking(true)
          setIsPaused(false)
          setIsLoading(false)
        }

        audio.onended = () => {
          setIsSpeaking(false)
          setIsPaused(false)
          setIsLoading(false)
          if (audioSourceRef.current) {
            URL.revokeObjectURL(audioSourceRef.current)
            audioSourceRef.current = null
          }
          audioRef.current = null
        }

        audio.onerror = (event) => {
          console.error("Audio playback error:", event)
          setIsSpeaking(false)
          setIsPaused(false)
          setIsLoading(false)
          if (audioSourceRef.current) {
            URL.revokeObjectURL(audioSourceRef.current)
            audioSourceRef.current = null
          }
        }

        audio.onpause = () => {
          setIsPaused(true)
        }

        await audio.play()
      } catch (error: any) {
        console.error("Google Cloud TTS error:", error)
        setIsLoading(false)
        setIsSpeaking(false)
        setIsPaused(false)
        // フォールバック: ブラウザのWeb Speech APIを使用
        if (synthRef.current && typeof window !== "undefined" && "speechSynthesis" in window) {
          console.warn("Falling back to browser SpeechSynthesis")
          speakWithBrowser(text)
        }
      }
    },
    [lang, rate, pitch, volume]
  )

  // ブラウザのWeb Speech APIを使用した読み上げ
  const speakWithBrowser = useCallback(
    (text: string) => {
      if (!synthRef.current) {
        console.warn("SpeechSynthesis is not supported")
        return
      }

      // 既存の読み上げを停止
      synthRef.current.cancel()

      // テキストをクリーンアップ
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

  const speak = useCallback(
    (text: string) => {
      if (useGoogleCloud) {
        speakWithGoogleCloud(text)
      } else {
        speakWithBrowser(text)
      }
    },
    [useGoogleCloud, speakWithGoogleCloud, speakWithBrowser]
  )

  const stop = useCallback(() => {
    if (useGoogleCloud) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      if (audioSourceRef.current) {
        URL.revokeObjectURL(audioSourceRef.current)
        audioSourceRef.current = null
      }
      audioRef.current = null
    } else {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
    setIsSpeaking(false)
    setIsPaused(false)
    setIsLoading(false)
  }, [useGoogleCloud])

  const pause = useCallback(() => {
    if (useGoogleCloud) {
      if (audioRef.current && isSpeaking && !isPaused) {
        audioRef.current.pause()
        setIsPaused(true)
      }
    } else {
      if (synthRef.current && isSpeaking && !isPaused) {
        synthRef.current.pause()
        setIsPaused(true)
      }
    }
  }, [useGoogleCloud, isSpeaking, isPaused])

  const resume = useCallback(() => {
    if (useGoogleCloud) {
      if (audioRef.current && isPaused) {
        audioRef.current.play()
        setIsPaused(false)
      }
    } else {
      if (synthRef.current && isPaused) {
        synthRef.current.resume()
        setIsPaused(false)
      }
    }
  }, [useGoogleCloud, isPaused])

  const isSupported = typeof window !== "undefined" && 
    (useGoogleCloud || "speechSynthesis" in window)

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isLoading,
    isSupported,
  }
}

