'use client'
import { useState, useMemo } from 'react'
import lexiqueData from '@/data/lexique.json'
import { useSpeech } from '@/hooks/useSpeech'
import { useUserProgress } from '@/hooks/useUserProgress'

type Niveau = 'tous' | 'A1' | 'A2' | 'B1'

export default function LexiquePage() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeNiveau, setActiveNiveau] = useState<Niveau>('tous')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const { speak, speaking } = useSpeech()
  const { progress } = useUserProgress()

  const categories = lexiqueData.categories

  const allPhrases = useMemo(() => {
    return categories.flatMap((c) =>
      c.phrases.map((p) => ({ ...p, categoryId: c.id, categoryLabel: c.label, categoryIcon: c.icon }))
    )
  }, [categories])

  const filtered = useMemo(() => {
    let items = activeCategory === 'all'
      ? allPhrases
      : allPhrases.filter((p) => p.categoryId === activeCategory)

    if (activeNiveau !== 'tous') {
      items = items.filter((p) => p.niveau === activeNiveau)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (p) => p.fr.toLowerCase().includes(q) || p.de.toLowerCase().includes(q)
      )
    }

    return items
  }, [allPhrases, activeCategory, activeNiveau, search])

  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-900/30 border-blue-800',
    amber: 'text-amber-400 bg-amber-900/30 border-amber-800',
    green: 'text-emerald-400 bg-emerald-900/30 border-emerald-800',
    red: 'text-red-400 bg-red-900/30 border-red-800',
    purple: 'text-purple-400 bg-purple-900/30 border-purple-800',
    teal: 'text-teal-400 bg-teal-900/30 border-teal-800',
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-white">Lexique</h1>
          <span className="badge-niveau badge-{progress.niveau ?? 'A1'}">
            Mon niveau : {progress.niveau ?? 'A1'}
          </span>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            type="text"
            placeholder="Chercher une phrase..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl
                       pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500
                       focus:outline-none focus:border-brand-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtre par niveau */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(['tous', 'A1', 'A2', 'B1'] as Niveau[]).map((n) => (
            <button
              key={n}
              onClick={() => setActiveNiveau(n)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold
                          transition-all duration-150 border
                          ${activeNiveau === n
                            ? 'bg-brand-500 border-brand-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              {n === 'tous' ? 'Tous niveaux' : n}
            </button>
          ))}
        </div>
      </div>

      {/* Catégories horizontales */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium
                        border transition-all duration-150
                        ${activeCategory === 'all'
                          ? 'bg-slate-700 border-slate-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'}`}
          >
            🗂️ Tout
          </button>
          {categories.map((cat) => {
            const colorClass = colorMap[cat.color] || 'text-slate-400 bg-slate-900/30 border-slate-800'
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium
                            border transition-all duration-150
                            ${activeCategory === cat.id ? colorClass : 'bg-slate-900 border-slate-800 text-slate-400'}`}
              >
                {cat.icon} {cat.label.split(' ').slice(1).join(' ')}
              </button>
            )
          })}
        </div>
      </div>

      {/* Résultats count */}
      <div className="px-4 pb-3">
        <p className="text-xs text-slate-500">{filtered.length} phrase{filtered.length > 1 ? 's' : ''}</p>
      </div>

      {/* Liste des phrases */}
      <div className="px-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-3xl mb-3">🔍</p>
            <p>Aucune phrase trouvée</p>
          </div>
        ) : (
          filtered.map((phrase) => (
            <PhraseCard
              key={phrase.id}
              phrase={phrase}
              expanded={expanded === phrase.id}
              onToggle={() => setExpanded(expanded === phrase.id ? null : phrase.id)}
              onSpeak={() => speak(phrase.de)}
              speaking={speaking}
            />
          ))
        )}
      </div>
    </div>
  )
}

function PhraseCard({
  phrase,
  expanded,
  onToggle,
  onSpeak,
  speaking,
}: {
  phrase: any
  expanded: boolean
  onToggle: () => void
  onSpeak: () => void
  speaking: boolean
}) {
  return (
    <div
      className={`card transition-all duration-200
                  ${expanded ? 'border-brand-800' : 'hover:border-slate-700'}`}
    >
      <div
        className="p-4 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-400 mb-1">{phrase.fr}</p>
            <p className="text-base font-semibold text-white">{phrase.de}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`badge-niveau badge-${phrase.niveau}`}>{phrase.niveau}</span>
            <span className="text-slate-600 text-xs">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3 animate-slide-up">
          {/* Phonétique */}
          <div className="bg-slate-800/60 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Prononciation</p>
            <p className="text-sm text-slate-300 italic">[{phrase.phonetic}]</p>
          </div>

          {/* Bouton audio */}
          <button
            onClick={(e) => { e.stopPropagation(); onSpeak() }}
            className={`w-full flex items-center justify-center gap-2
                        py-3 rounded-xl border font-semibold text-sm
                        transition-all duration-150 active:scale-95
                        ${speaking
                          ? 'bg-brand-900/50 border-brand-700 text-brand-400 animate-pulse-soft'
                          : 'bg-brand-900/30 border-brand-800 text-brand-400 hover:bg-brand-900/50'}`}
          >
            <span className="text-lg">{speaking ? '🔊' : '🔈'}</span>
            {speaking ? 'En cours...' : 'Écouter la prononciation'}
          </button>

          {/* Tags */}
          {phrase.tags && phrase.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {phrase.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
