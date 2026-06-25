'use client'
import { useState, useRef, useEffect } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useUserProgress } from '@/hooks/useUserProgress'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SCENARIOS = [
  { id: 'hotel', emoji: '🏨', label: 'À l\'hôtel', prompt: 'Je suis à la réception d\'un hôtel à Berlin. Je veux faire un check-in.' },
  { id: 'restaurant', emoji: '🍽️', label: 'Au restaurant', prompt: 'Je veux commander un repas dans un restaurant allemand à Munich.' },
  { id: 'train', emoji: '🚆', label: 'À la gare', prompt: 'Je cherche mon train à la gare de Cologne et j\'ai des questions.' },
  { id: 'perdu', emoji: '🗺️', label: 'Je suis perdu', prompt: 'Je suis perdu dans une ville allemande et j\'ai besoin d\'aide.' },
  { id: 'libre', emoji: '💬', label: 'Conversation libre', prompt: '' },
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [scenario, setScenario] = useState<string | null>(null)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)

  const isOnline = useOnlineStatus()
  const { progress } = useUserProgress()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startScenario = async (s: typeof SCENARIOS[0]) => {
    setScenario(s.id)
    setMessages([])

    const systemMessage = s.id === 'libre'
      ? `Tu es un(e) habitant(e) germanophone sympathique. L'utilisateur apprend l'allemand (niveau ${progress.niveau}). Vous conversez librement. Parle en allemand, puis ajoute une traduction française entre parenthèses pour les phrases complexes. Reste simple et encourageant.`
      : `Tu joues le rôle d'un(e) local(e) allemand(e) dans ce scénario : ${s.prompt}. L'utilisateur est français, niveau ${progress.niveau} en allemand. Commence la scène de manière naturelle. Parle allemand avec la traduction française entre parenthèses. Guide l'utilisateur avec bienveillance.`

    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          system: systemMessage,
          scenario: s.label,
        }),
      })

      if (res.status === 503) {
        setApiKeyMissing(true)
        setLoading(false)
        return
      }

      const data = await res.json()
      if (data.content) {
        setMessages([{ role: 'assistant', content: data.content, timestamp: new Date() }])
      }
    } catch {
      setMessages([{
        role: 'assistant',
        content: '❌ Erreur de connexion. Vérifiez votre connexion Internet.',
        timestamp: new Date(),
      }])
    }
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading || !isOnline) return

    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          scenario: scenario,
          niveau: progress.niveau,
        }),
      })

      const data = await res.json()
      if (data.content) {
        setMessages([...newMessages, {
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
        }])
      }
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: '❌ Erreur. Vérifiez votre connexion.',
        timestamp: new Date(),
      }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  // Offline
  if (!isOnline) {
    return (
      <div className="px-4 pt-12 flex flex-col items-center text-center space-y-4">
        <div className="text-6xl">✈️</div>
        <h1 className="font-display text-2xl font-bold text-white">Mode avion détecté</h1>
        <p className="text-slate-400 text-sm max-w-xs">
          L'Assistant de poche nécessite une connexion Internet pour communiquer avec l'IA.
        </p>
        <div className="card p-4 text-left w-full max-w-xs">
          <p className="text-xs font-semibold text-emerald-400 mb-2">✓ Disponible hors ligne</p>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>📖 Lexique complet</li>
            <li>🎯 Flashcards & QCM</li>
            <li>🔈 Prononciation audio</li>
          </ul>
        </div>
      </div>
    )
  }

  // Écran de sélection de scénario
  if (!scenario) {
    return (
      <div className="px-4 pt-8 pb-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold text-white">Assistant de poche</h1>
          <p className="text-sm text-slate-400">Simulez une conversation avec un(e) local(e)</p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            En ligne · Propulsé par Groq
          </div>
        </div>

        {apiKeyMissing && (
          <div className="card p-4 border border-amber-800 bg-amber-900/20">
            <p className="text-sm text-amber-400 font-semibold mb-1">⚠️ Clé API requise</p>
            <p className="text-xs text-amber-300/70">
              Ajoutez votre clé Groq dans les variables d'environnement (<code>GROQ_API_KEY</code>) pour activer l'IA.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Choisissez un scénario
          </h3>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => startScenario(s)}
              className="w-full card p-4 text-left hover:border-slate-700 transition-all
                         active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-brand-300">{s.label}</p>
                  {s.prompt && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{s.prompt}</p>
                  )}
                </div>
                <span className="text-slate-600">→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="card p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            💡 Conseil
          </p>
          <p className="text-sm text-slate-300">
            N'ayez pas peur de faire des erreurs ! L'assistant est bienveillant et vous guidera.
          </p>
        </div>
      </div>
    )
  }

  // Interface de chat
  const currentScenario = SCENARIOS.find((s) => s.id === scenario)

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header chat */}
      <div className="px-4 pt-6 pb-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentScenario?.emoji}</span>
          <div>
            <p className="font-semibold text-white text-sm">{currentScenario?.label}</p>
            <p className="text-xs text-slate-500">Niveau {progress.niveau} · Groq AI</p>
          </div>
        </div>
        <button
          onClick={() => { setScenario(null); setMessages([]) }}
          className="text-slate-500 hover:text-white text-sm px-3 py-1.5
                     rounded-lg bg-slate-800 hover:bg-slate-700 transition-all"
        >
          Changer
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                          ${msg.role === 'user'
                            ? 'bg-brand-600 text-white rounded-br-sm'
                            : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'}`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Écrivez en français ou en allemand…"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl
                       px-4 py-3 text-sm text-white placeholder-slate-500
                       focus:outline-none focus:border-brand-500 transition-colors"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-40
                       text-white px-4 py-3 rounded-xl transition-all
                       active:scale-95 disabled:cursor-not-allowed"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}
