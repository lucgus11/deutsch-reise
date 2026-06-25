'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { questions, calculerNiveau } from '@/data/questions'
import { useUserProgress } from '@/hooks/useUserProgress'

export default function TestNiveauPage() {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showExplication, setShowExplication] = useState(false)

  const { setNiveau } = useUserProgress()
  const router = useRouter()

  const q = questions[current]
  const total = questions.length

  const handleSelect = (idx: number) => {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    setShowExplication(true)
    if (idx === q.correct) setScore((s) => s + 1)
  }

  const handleNext = () => {
    if (current + 1 >= total) {
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setAnswered(false)
      setShowExplication(false)
    }
  }

  const handleFinish = () => {
    const niveau = calculerNiveau(score + (selected === q.correct ? 0 : 0), total)
    // score déjà comptabilisé dans handleSelect
    const finalNiveau = calculerNiveau(score, total)
    setNiveau(finalNiveau, score)
    router.push('/')
  }

  if (finished) {
    const finalNiveau = calculerNiveau(score, total)
    const niveauInfo = {
      A1: { emoji: '🌱', label: 'Débutant', desc: 'Parfait pour commencer ! Vous allez apprendre les bases essentielles du voyage.' },
      A2: { emoji: '🌿', label: 'Élémentaire', desc: 'Vous connaissez déjà quelques bases. On va enrichir votre vocabulaire de voyage.' },
      B1: { emoji: '🌳', label: 'Intermédiaire', desc: 'Félicitations ! Vous pouvez vous débrouiller. On va affiner vos compétences.' },
    }[finalNiveau]

    return (
      <div className="px-4 pt-12 pb-8 flex flex-col items-center text-center space-y-6 animate-fade-in">
        <div className="text-7xl">{niveauInfo.emoji}</div>
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Niveau {finalNiveau}</h1>
          <p className="text-xl text-slate-400 mt-1">{niveauInfo.label}</p>
        </div>
        <div className="card p-6 w-full max-w-sm">
          <div className="text-4xl font-bold text-white mb-1">{score}/{total}</div>
          <p className="text-slate-400 text-sm">bonnes réponses</p>
          <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${(score / total) * 100}%` }}
            />
          </div>
        </div>
        <p className="text-slate-300 text-sm max-w-xs">{niveauInfo.desc}</p>
        <button onClick={handleFinish} className="btn-primary w-full max-w-xs">
          Commencer à apprendre →
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-8 h-5 rounded overflow-hidden de-flag-stripe" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Test de niveau</h1>
        <p className="text-sm text-slate-400">Évaluation initiale · {total} questions</p>
      </div>

      {/* Progression */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Question {current + 1}/{total}</span>
          <span>{score} point{score > 1 ? 's' : ''}</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div
            className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((current) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="card p-6 animate-slide-up">
        <span className={`badge-niveau badge-${q.niveau} mb-3 inline-flex`}>{q.niveau}</span>
        <p className="text-lg font-semibold text-white leading-snug">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((opt, idx) => {
          let style = 'bg-slate-900 border-slate-800 text-slate-200'
          if (answered) {
            if (idx === q.correct) style = 'bg-emerald-900/60 border-emerald-500 text-emerald-200'
            else if (idx === selected) style = 'bg-red-900/60 border-red-500 text-red-200'
            else style = 'bg-slate-900/40 border-slate-800 text-slate-500'
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`w-full text-left px-5 py-4 rounded-xl border-2
                          font-medium transition-all duration-200 active:scale-[0.99]
                          ${style}`}
            >
              <span className="text-xs font-bold mr-3 text-slate-500">
                {String.fromCharCode(65 + idx)}.
              </span>
              {opt}
              {answered && idx === q.correct && <span className="float-right">✓</span>}
              {answered && idx === selected && idx !== q.correct && <span className="float-right">✗</span>}
            </button>
          )
        })}
      </div>

      {/* Explication */}
      {showExplication && (
        <div className="card p-4 border-l-4 border-l-brand-500 animate-slide-up">
          <p className="text-xs font-semibold text-brand-400 mb-1">💡 Explication</p>
          <p className="text-sm text-slate-300">{q.explication}</p>
        </div>
      )}

      {/* Bouton suivant */}
      {answered && (
        <button
          onClick={handleNext}
          className="btn-primary w-full animate-slide-up"
        >
          {current + 1 >= total ? 'Voir mes résultats →' : 'Question suivante →'}
        </button>
      )}
    </div>
  )
}
