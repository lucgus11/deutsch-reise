'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

const navItems = [
  { href: '/', icon: '🏠', label: 'Accueil' },
  { href: '/lexique', icon: '📖', label: 'Lexique' },
  { href: '/exercices', icon: '🎯', label: 'Exercices' },
  { href: '/assistant', icon: '🤖', label: 'Assistant' },
]

export function Navigation() {
  const pathname = usePathname()
  const isOnline = useOnlineStatus()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md
                 border-t border-slate-800 safe-pb"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex max-w-2xl mx-auto">
        {navItems.map((item) => {
          const active = pathname === item.href
          const isAssistant = item.href === '/assistant'

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5
                          transition-all duration-150 active:scale-95
                          ${active ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className="text-xl relative">
                {item.icon}
                {isAssistant && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-gray-950
                                ${isOnline ? 'bg-emerald-400' : 'bg-slate-600'}`}
                  />
                )}
              </span>
              <span className={`text-[10px] font-semibold tracking-wide
                               ${active ? 'text-brand-400' : 'text-slate-600'}`}>
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-brand-500 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
