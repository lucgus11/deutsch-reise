// sw.js — Service Worker Deutsch Reise
const CACHE_NAME = 'deutsch-reise-v1'
const DATA_CACHE = 'deutsch-reise-data-v1'

const STATIC_ASSETS = [
  '/',
  '/lexique',
  '/exercices',
  '/assistant',
  '/test-niveau',
  '/manifest.json',
  '/_next/static/css/',
]

// Installation : précache les assets critiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/lexique',
        '/exercices',
        '/manifest.json',
      ]).catch(() => {
        // Ignore errors for individual assets
      })
    })
  )
  self.skipWaiting()
})

// Activation : nettoyer les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DATA_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch : stratégie Network-first pour navigation, Cache-first pour assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ne pas intercepter les requêtes vers l'API Groq ou Anthropic (online only)
  if (url.hostname.includes('groq') || url.hostname.includes('anthropic')) {
    return
  }

  // Assets Next.js (_next/static) → Cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
      })
    )
    return
  }

  // API routes → Network-only (sauf si offline)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Hors ligne – cette fonctionnalité nécessite Internet.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
    return
  }

  // Pages et ressources → Network-first avec fallback cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached
          // Fallback page offline
          if (request.mode === 'navigate') {
            return caches.match('/')
          }
          return new Response('Ressource indisponible hors ligne', { status: 503 })
        })
      })
  )
})

// Message pour skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
