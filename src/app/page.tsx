'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserProgress } from '@/hooks/useUserProgress'
import Link from 'next/link'

export default function HomePage() {
  const { progress, loaded } = useUserProgress()
  const router = useRouter()

  useEffect(() => {
    if (loaded && !progress.testCompleted) {
      router.push('/test-niveau')
    }
  }, [loaded, progress.testCompleted, router])

  if (!loaded || !progress.testCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const menuItems = [
    {
      href: '/lexique',
      icon: '📖',
      title: 'Lexique',
      subtitle: 'Phrases utiles par catégorie',
      color: 'from-blue-600 to-blue-800',
      badge: 'Hors ligne ✓',
    },
    {
      href: '/exercices',
      icon: '🎯',
      title: 'Exercices',
      subtitle: 'Flashcards & répétition espacée',
      color: 'from-violet-600 to-violet-800',
      badge: 'Hors ligne ✓',
    },
    {
      href: '/assistant',
      icon: '🤖',
      title: 'Assistant de poche',
      subtitle: 'Conversation IA avec un local',
      color: 'from-amber-500 to-orange-700',
      badge: 'En ligne requis',
    },
  ]

  return (
    <div className="px-4 pt-8 pb-4 space-y-6">
      {/* Hero */}
      <div className="text-center space-y-3">
        {/* Drapeau miniature */}
        <div className="flex justify-center">
          <div className="w-10 h-7 rounded overflow-hidden de-flag-stripe shadow-lg" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white">
          Deutsch Reise
        </h1>
        <p className="text-slate-400 text-sm">
          Votre compagnon de voyage en Allemagne
        </p>
      </div>

      {/* Niveau badge */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Votre niveau</p>
          <p className="text-2xl font-display font-bold text-white mt-1">{progress.niveau}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Série</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">🔥 {progress.streak}j</p>
        </div>
        <Link
          href="/test-niveau"
          className="text-xs text-brand-400 hover:text-brand-300 underline"
        >
          Refaire le test
        </Link>
      </div>

      {/* Menu principal */}
      <div className="space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block bg-gradient-to-r ${item.color} rounded-2xl p-5
                        border border-white/10 hover:border-white/20
                        transition-all duration-200 active:scale-[0.98]
                        shadow-lg shadow-black/40`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-white">{item.title}</h2>
                <p className="text-sm text-white/70">{item.subtitle}</p>
              </div>
              <div className="text-right">
                <span className="text-xs bg-black/30 text-white/80 px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-white">{Object.keys(progress.cards).length}</p>
          <p className="text-xs text-slate-500 mt-1">Cartes étudiées</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-white">{progress.totalSessions}</p>
          <p className="text-xs text-slate-500 mt-1">Sessions</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-white">{progress.streak}</p>
          <p className="text-xs text-slate-500 mt-1">Jours consec.</p>
        </div>
      </div>

      {/* Astuce du jour */}
      <div className="card p-4 border-l-4 border-l-gold-400">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">💡 Le saviez-vous ?</p>
        <p className="text-sm text-slate-300">
          En allemand, tous les noms s'écrivent avec une majuscule : <span className="font-bold text-white">der Bahnhof</span> (la gare), <span className="font-bold text-white">das Hotel</span> (l'hôtel).
        </p>
      </div>
    </div>
  )
}
