'use client'
import { useState, useMemo } from 'react'
import lexiqueData from '@/data/lexique.json'
import { useUserProgress } from '@/hooks/useUserProgress'
import { useSpeech } from '@/hooks/useSpeech'
import { FlashCard } from '@/components/ui/FlashCard'
import { QCMCard } from '@/components/ui/QCMCard'

type Mode = 'menu' | 'flashcard' | 'qcm' | 'terminé'

export default function ExercicesPage() {
  const [mode, setMode] = useState<Mode>('menu')
  const [sessionIndex, setSessionIndex] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionCards, setSessionCards] = useState<any[]>([])

  const { progress, updateCard, getDueCards } = useUserProgress()
  const { speak, speaking } = useSpeech()

  const allPhrases = useMemo(() =>
    lexiqueData.categories.flatMap((c) =>
      c.phrases.map((p) => ({ ...p, categoryIcon: c.icon }))
    ), []
  )

  // Filtrer par niveau de l'utilisateur
  const userPhrases = useMemo(() => {
    const niveau = progress.niveau || 'A1'
    const niveauxAccessibles: Record<string, string[]> = {
      A1: ['A1'],
      A2: ['A1', 'A2'],
      B1: ['A1', 'A2', 'B1'],
    }
    return allPhrases.filter((p) => niveauxAccessibles[niveau]?.includes(p.niveau))
  }, [allPhrases, progress.niveau])

  const dueCardIds = getDueCards(userPhrases.map((p) => p.id))
  const dueCards = userPhrases.filter((p) => dueCardIds.includes(p.id))

  const startSession = (m: 'flashcard' | 'qcm') => {
    // Prendre max 10 cartes dues, ou toutes si moins de 5
    const cards = dueCards.length >= 5
      ? dueCards.slice(0, 10)
      : [...userPhrases].sort(() => Math.random() - 0.5).slice(0, 8)
    setSessionCards(cards)
    setSessionIndex(0)
    setSessionCorrect(0)
    setMode(m)
  }

  const handleFlashcardResult = (quality: number) => {
    const card = sessionCards[sessionIndex]
    updateCard(card.id, quality)
    if (quality >= 3) setSessionCorrect((n) => n + 1)
    advanceSession()
  }

  const handleQCMResult = (correct: boolean) => {
    const card = sessionCards[sessionIndex]
    updateCard(card.id, correct ? 4 : 1)
    if (correct) setSessionCorrect((n) => n + 1)
    advanceSession()
  }

  const advanceSession = () => {
    if (sessionIndex + 1 >= sessionCards.length) {
      setMode('terminé')
    } else {
      setSessionIndex((i) => i + 1)
    }
  }

  // ---- ÉCRANS ----

  if (mode === 'terminé') {
    const pct = Math.round((sessionCorrect / sessionCards.length) * 100)
    return (
      <div className="px-4 pt-12 flex flex-col items-center text-center space-y-6 animate-fade-in">
        <div className="text-6xl">{pct >= 70 ? '🏆' : pct >= 40 ? '👏' : '💪'}</div>
        <h2 className="font-display text-3xl font-bold text-white">Session terminée !</h2>
        <div className="card p-6 w-full max-w-xs">
          <div className="text-4xl font-bold text-white">{sessionCorrect}/{sessionCards.length}</div>
          <p className="text-slate-400 text-sm mt-1">bonnes réponses</p>
          <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-2xl font-bold mt-3 text-white">{pct}%</p>
        </div>
        <p className="text-slate-400 text-sm max-w-xs">
          {pct >= 70
            ? 'Excellent ! Continuez sur cette lancée.'
            : 'Continuez à pratiquer, ça va venir !'}
        </p>
        <button onClick={() => setMode('menu')} className="btn-primary w-full max-w-xs">
          Retour au menu
        </button>
      </div>
    )
  }

  if (mode === 'flashcard' && sessionCards.length > 0) {
    return (
      <div className="px-4 pt-8 pb-4 space-y-4">
        <ProgressBar current={sessionIndex} total={sessionCards.length} correct={sessionCorrect} />
        <FlashCard
          phrase={sessionCards[sessionIndex]}
          onResult={handleFlashcardResult}
          onSpeak={(text) => speak(text)}
          speaking={speaking}
        />
      </div>
    )
  }

  if (mode === 'qcm' && sessionCards.length > 0) {
    const card = sessionCards[sessionIndex]
    const options = generateOptions(card, userPhrases, 4)
    return (
      <div className="px-4 pt-8 pb-4 space-y-4">
        <ProgressBar current={sessionIndex} total={sessionCards.length} correct={sessionCorrect} />
        <QCMCard
          phrase={card}
          options={options}
          onResult={handleQCMResult}
          onSpeak={(text) => speak(text)}
          speaking={speaking}
        />
      </div>
    )
  }

  // Menu principal
  return (
    <div className="px-4 pt-8 pb-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold text-white">Exercices</h1>
        <p className="text-sm text-slate-400">Répétition espacée · Niveau {progress.niveau}</p>
      </div>

      {/* Stats SRS */}
      <div className="card p-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Cartes à réviser aujourd'hui
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-white">{dueCards.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              sur {userPhrases.length} phrases disponibles
            </p>
          </div>
          <div className="text-4xl">{dueCards.length > 5 ? '📚' : dueCards.length > 0 ? '✏️' : '🎉'}</div>
        </div>
        {dueCards.length === 0 && (
          <p className="text-sm text-emerald-400 mt-2">
            Tout est à jour ! Revenez demain.
          </p>
        )}
      </div>

      {/* Modes d'exercice */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Choisir un mode
        </h3>

        <button
          onClick={() => startSession('flashcard')}
          className="w-full card p-5 text-left hover:border-slate-700 transition-all
                     active:scale-[0.98] group"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">🃏</div>
            <div className="flex-1">
              <h3 className="font-bold text-white group-hover:text-brand-300 transition-colors">
                Flashcards
              </h3>
              <p className="text-sm text-slate-400">
                Retournez la carte et évaluez-vous honnêtement
              </p>
            </div>
            <span className="text-brand-500">→</span>
          </div>
        </button>

        <button
          onClick={() => startSession('qcm')}
          className="w-full card p-5 text-left hover:border-slate-700 transition-all
                     active:scale-[0.98] group"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">🎯</div>
            <div className="flex-1">
              <h3 className="font-bold text-white group-hover:text-brand-300 transition-colors">
                QCM
              </h3>
              <p className="text-sm text-slate-400">
                4 propositions, une seule bonne réponse
              </p>
            </div>
            <span className="text-brand-500">→</span>
          </div>
        </button>
      </div>

      {/* Info SRS */}
      <div className="card p-4 border-l-4 border-l-violet-500">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">
          ⚡ Répétition espacée
        </p>
        <p className="text-sm text-slate-300">
          L'algorithme SM-2 programme les révisions au moment optimal pour ancrer les mots en mémoire longue durée.
        </p>
      </div>
    </div>
  )
}

function ProgressBar({ current, total, correct }: { current: number; total: number; correct: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{current + 1}/{total}</span>
        <span className="text-emerald-400">✓ {correct}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((current) / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

function generateOptions(card: any, allPhrases: any[], count: number): string[] {
  const others = allPhrases
    .filter((p) => p.id !== card.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1)
    .map((p) => p.de)

  const options = [...others, card.de].sort(() => Math.random() - 0.5)
  return options
}
