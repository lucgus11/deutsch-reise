'use client'
import { useState } from 'react'

interface FlashCardProps {
  phrase: {
    id: string
    fr: string
    de: string
    phonetic: string
    niveau: string
    categoryIcon: string
  }
  onResult: (quality: number) => void
  onSpeak: (text: string) => void
  speaking: boolean
}

export function FlashCard({ phrase, onResult, onSpeak, speaking }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const handleFlip = () => {
    setFlipped(true)
    setRevealed(true)
  }

  const handleRate = (quality: number) => {
    setFlipped(false)
    setRevealed(false)
    setTimeout(() => onResult(quality), 200)
  }

  return (
    <div className="space-y-4">
      {/* Indicateur */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{phrase.categoryIcon} {phrase.niveau}</span>
        <span>{flipped ? 'Évaluez-vous' : 'Tapez pour révéler'}</span>
      </div>

      {/* Carte principale */}
      <div
        className="perspective-1000 cursor-pointer select-none"
        onClick={!flipped ? handleFlip : undefined}
        style={{ minHeight: '220px' }}
      >
        <div
          className={`relative transform-style-3d transition-transform duration-500
                      ${flipped ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d', transition: 'transform 0.5s' }}
        >
          {/* Face avant (Français) */}
          <div
            className="card p-8 absolute inset-0 backface-hidden
                       flex flex-col items-center justify-center text-center
                       bg-gradient-to-br from-slate-900 to-slate-800
                       min-h-[220px]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              🇫🇷 Français
            </p>
            <p className="text-xl font-semibold text-white leading-snug">{phrase.fr}</p>
            <p className="text-xs text-brand-400 mt-6 animate-pulse-soft">
              Tapez pour voir la traduction →
            </p>
          </div>

          {/* Face arrière (Allemand) */}
          <div
            className="card p-8 absolute inset-0 backface-hidden
                       flex flex-col items-center justify-center text-center
                       bg-gradient-to-br from-brand-950 to-brand-900 border-brand-800
                       min-h-[220px]"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-3">
              🇩🇪 Allemand
            </p>
            <p className="text-xl font-bold text-white leading-snug mb-3">{phrase.de}</p>
            <p className="text-sm text-brand-300 italic mb-4">[{phrase.phonetic}]</p>

            <button
              onClick={(e) => { e.stopPropagation(); onSpeak(phrase.de) }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5
                          rounded-lg border transition-all
                          ${speaking
                            ? 'bg-brand-700 border-brand-500 text-white'
                            : 'bg-brand-900/50 border-brand-700 text-brand-400 hover:bg-brand-800/50'}`}
            >
              <span>{speaking ? '🔊' : '🔈'}</span>
              {speaking ? 'En cours…' : 'Écouter'}
            </button>
          </div>
        </div>

        {/* Spacer pour la hauteur */}
        <div className="invisible p-8 min-h-[220px] flex items-center justify-center">
          <p className="text-xl">{phrase.fr}</p>
        </div>
      </div>

      {/* Boutons d'auto-évaluation */}
      {revealed && (
        <div className="animate-slide-up space-y-2">
          <p className="text-xs text-center text-slate-500 font-semibold">
            Comment était-ce ?
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleRate(1)}
              className="flex flex-col items-center py-3 rounded-xl border-2
                         bg-red-900/30 border-red-800 text-red-400
                         hover:bg-red-900/50 active:scale-95 transition-all"
            >
              <span className="text-lg">😓</span>
              <span className="text-xs mt-1 font-semibold">Difficile</span>
            </button>
            <button
              onClick={() => handleRate(3)}
              className="flex flex-col items-center py-3 rounded-xl border-2
                         bg-amber-900/30 border-amber-800 text-amber-400
                         hover:bg-amber-900/50 active:scale-95 transition-all"
            >
              <span className="text-lg">🤔</span>
              <span className="text-xs mt-1 font-semibold">Hésitant</span>
            </button>
            <button
              onClick={() => handleRate(5)}
              className="flex flex-col items-center py-3 rounded-xl border-2
                         bg-emerald-900/30 border-emerald-800 text-emerald-400
                         hover:bg-emerald-900/50 active:scale-95 transition-all"
            >
              <span className="text-lg">😊</span>
              <span className="text-xs mt-1 font-semibold">Facile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
