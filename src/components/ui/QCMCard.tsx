'use client'
import { useState } from 'react'

interface QCMCardProps {
  phrase: {
    id: string
    fr: string
    de: string
    phonetic: string
    niveau: string
    categoryIcon: string
  }
  options: string[]
  onResult: (correct: boolean) => void
  onSpeak: (text: string) => void
  speaking: boolean
}

export function QCMCard({ phrase, options, onResult, onSpeak, speaking }: QCMCardProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = (opt: string) => {
    if (answered) return
    setSelected(opt)
    setAnswered(true)
    const correct = opt === phrase.de
    // Lire la bonne réponse automatiquement
    setTimeout(() => onSpeak(phrase.de), 300)
    setTimeout(() => onResult(correct), 1400)
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Question */}
      <div className="card p-6 text-center bg-gradient-to-br from-slate-900 to-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          🇫🇷 Comment dit-on en allemand ?
        </p>
        <p className="text-xl font-semibold text-white">{phrase.fr}</p>
        <span className={`badge-niveau badge-${phrase.niveau} mt-3 inline-flex`}>{phrase.niveau}</span>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {options.map((opt, idx) => {
          let style = 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
          if (answered) {
            if (opt === phrase.de) {
              style = 'bg-emerald-900/60 border-emerald-500 text-emerald-100'
            } else if (opt === selected) {
              style = 'bg-red-900/60 border-red-500 text-red-200'
            } else {
              style = 'bg-slate-900/40 border-slate-800 text-slate-500'
            }
          }

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={answered}
              className={`w-full text-left px-4 py-3.5 rounded-xl border-2
                          font-medium transition-all duration-200 active:scale-[0.99]
                          ${style}`}
            >
              <span className="text-xs font-bold mr-3 text-slate-500">
                {String.fromCharCode(65 + idx)}.
              </span>
              {opt}
              {answered && opt === phrase.de && (
                <span className="float-right text-emerald-400">✓</span>
              )}
              {answered && opt === selected && opt !== phrase.de && (
                <span className="float-right text-red-400">✗</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Phonétique après réponse */}
      {answered && (
        <div className="card p-4 border-l-4 border-l-brand-500 animate-slide-up">
          <p className="text-xs text-brand-400 font-semibold mb-1">🇩🇪 Prononciation</p>
          <p className="text-sm text-slate-300 italic">[{phrase.phonetic}]</p>
          <button
            onClick={() => onSpeak(phrase.de)}
            className="mt-2 text-xs flex items-center gap-1.5 text-brand-400 hover:text-brand-300"
          >
            <span>{speaking ? '🔊' : '🔈'}</span>
            {speaking ? 'En cours…' : 'Réécouter'}
          </button>
        </div>
      )}
    </div>
  )
}
