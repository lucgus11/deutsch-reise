import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navigation } from '@/components/layout/Navigation'
import { PWARegister } from '@/components/ui/PWARegister'
import { OfflineBanner } from '@/components/ui/OfflineBanner'

export const metadata: Metadata = {
  title: 'Deutsch Reise – Apprenez l\'allemand',
  description: 'Application PWA pour apprendre l\'allemand de voyage. Fonctionne hors ligne.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Deutsch Reise',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a5aff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-950 text-white min-h-screen font-sans antialiased">
        <PWARegister />
        <OfflineBanner />
        <div className="flex flex-col min-h-screen max-w-2xl mx-auto">
          <main className="flex-1 pb-24">{children}</main>
          <Navigation />
        </div>
      </body>
    </html>
  )
}
