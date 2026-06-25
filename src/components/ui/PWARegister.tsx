'use client'
import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[SW] Enregistré avec succès', reg.scope)

          // Écouter les mises à jour
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nouvelle version disponible
                  console.log('[SW] Nouvelle version disponible')
                  newWorker.postMessage({ type: 'SKIP_WAITING' })
                }
              })
            }
          })
        })
        .catch((err) => {
          console.error('[SW] Erreur d\'enregistrement:', err)
        })
    }
  }, [])

  return null
}
