'use client'
import { useState, useEffect } from 'react'

export interface UserProgress {
  niveau: 'A1' | 'A2' | 'B1' | null
  testCompleted: boolean
  testScore: number
  // SRS (Spaced Repetition System)
  cards: Record<string, CardProgress>
  lastStudied: string | null
  totalSessions: number
  streak: number
  lastStreakDate: string | null
}

export interface CardProgress {
  id: string
  easeFactor: number      // 2.5 par défaut
  interval: number        // jours avant prochaine révision
  repetitions: number     // nombre de fois révisée
  nextReview: string      // date ISO
  quality: number         // dernière qualité 0-5
}

const DEFAULT_PROGRESS: UserProgress = {
  niveau: null,
  testCompleted: false,
  testScore: 0,
  cards: {},
  lastStudied: null,
  totalSessions: 0,
  streak: 0,
  lastStreakDate: null,
}

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('deutsch-reise-progress')
      if (stored) {
        setProgress(JSON.parse(stored))
      }
    } catch {}
    setLoaded(true)
  }, [])

  const save = (updated: UserProgress) => {
    setProgress(updated)
    try {
      localStorage.setItem('deutsch-reise-progress', JSON.stringify(updated))
    } catch {}
  }

  const setNiveau = (niveau: 'A1' | 'A2' | 'B1', score: number) => {
    save({ ...progress, niveau, testCompleted: true, testScore: score })
  }

  const resetProgress = () => {
    save(DEFAULT_PROGRESS)
  }

  // Algorithme SM-2 pour la répétition espacée
  const updateCard = (cardId: string, quality: number) => {
    const existing = progress.cards[cardId] || {
      id: cardId,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: new Date().toISOString(),
      quality: 0,
    }

    let { easeFactor, interval, repetitions } = existing

    if (quality >= 3) {
      if (repetitions === 0) interval = 1
      else if (repetitions === 1) interval = 6
      else interval = Math.round(interval * easeFactor)
      repetitions += 1
    } else {
      repetitions = 0
      interval = 1
    }

    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)

    const updatedCard: CardProgress = {
      id: cardId,
      easeFactor,
      interval,
      repetitions,
      nextReview: nextReview.toISOString(),
      quality,
    }

    // Mise à jour du streak
    const today = new Date().toDateString()
    let { streak, lastStreakDate } = progress
    if (lastStreakDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      streak = lastStreakDate === yesterday.toDateString() ? streak + 1 : 1
      lastStreakDate = today
    }

    save({
      ...progress,
      cards: { ...progress.cards, [cardId]: updatedCard },
      lastStudied: new Date().toISOString(),
      totalSessions: progress.totalSessions + 1,
      streak,
      lastStreakDate,
    })
  }

  const getDueCards = (allCardIds: string[]): string[] => {
    const now = new Date()
    return allCardIds.filter((id) => {
      const card = progress.cards[id]
      if (!card) return true // jamais étudié = à réviser
      return new Date(card.nextReview) <= now
    })
  }

  return { progress, loaded, setNiveau, resetProgress, updateCard, getDueCards }
}
