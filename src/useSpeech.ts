'use client'
import { useCallback, useRef, useState } from 'react'

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    // Arrêter si déjà en train de parler
    window.speechSynthesis.cancel()
    setSpeaking(false)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'de-DE'
    utterance.rate = 0.85
    utterance.pitch = 1
    utterance.volume = 1

    // Chercher une voix allemande de qualité
    const voices = window.speechSynthesis.getVoices()
    const germanVoice = voices.find(
      (v) => v.lang === 'de-DE' && v.localService
    ) || voices.find(
      (v) => v.lang.startsWith('de')
    )
    if (germanVoice) utterance.voice = germanVoice

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }, [])

  return { speak, stop, speaking }
}
