'use client'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const [wasOffline, setWasOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
    }
    if (isOnline && wasOffline) {
      setShowReconnected(true)
      const t = setTimeout(() => setShowReconnected(false), 3000)
      return () => clearTimeout(t)
    }
  }, [isOnline, wasOffline])

  if (isOnline && showReconnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-emerald-900/90 text-emerald-300
                      text-center text-xs py-2 font-semibold backdrop-blur-sm animate-slide-up">
        ✓ Connexion rétablie
      </div>
    )
  }

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-900/90 text-amber-300
                      text-center text-xs py-2 font-semibold backdrop-blur-sm">
        ✈️ Mode hors ligne – Lexique et exercices disponibles
      </div>
    )
  }

  return null
}
