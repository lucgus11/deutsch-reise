'use client'
import { useState, useRef, useEffect } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useUserProgress } from '@/hooks/useUserProgress'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SCENARIOS = [
  { id: 'hotel', emoji: '🏨', label: 'À l\'hôtel', prompt: 'Tu joues le rôle d\'un(e) réceptionniste dans un hôtel à Berlin. Accueille le client chaleureusement en allemand.' },
  { id: 'restaurant', emoji: '🍽️', label: 'Au restaurant', prompt: 'Tu joues le rôle d\'un(e) serveur/serveuse dans un restaurant bavarois à Munich. Accueille le client en allemand.' },
  { id: 'train', emoji: '🚆', label: 'À la gare', prompt: 'Tu joues le rôle d\'un(e) agent d\'accueil à la gare de Cologne. Le voyageur semble perdu. Approche-le en allemand.' },
  { id: 'perdu', emoji: '🗺️', label: 'Je suis perdu', prompt: 'Tu es un(e) passant(e) sympathique dans une rue de Hambourg. Un touriste t\'aborde. Réponds naturellement en allemand.' },
  { id: 'libre', emoji: '💬', label: 'Conversation libre', prompt: 'Tu es un(e) ami(e) germanophone sympathique. Engage une conversation détendue en allemand avec l\'utilisateur.' },
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [scenario, setScenario] = useState<string | null>(null)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOnline = useOnlineStatus()
  const { progress } = useUserProgress()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const callAPI = async (body: object): Promise<string | null> => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.status === 503) {
      setApiKeyMissing(true)
      return null
    }

    const data = await res.json()

    if (!res.ok || !data.content) {
      throw new Error(data.error || `HTTP ${res.status}`)
    }

    return data.content
  }

  const startScenario = async (s: typeof SCENARIOS[0]) => {
    setScenario(s.id)
    setMessages([])
    setError(null)
    setLoading(true)

    const systemPrompt = `${s.prompt}
L'utilisateur apprend l'allemand, niveau ${progress.niveau || 'A1'}.
RÈGLES IMPORTANTES :
- Commence directement la scène sans introduction méta.
- Parle principalement en allemand.
- Pour chaque phrase complexe, ajoute la traduction française entre parenthèses.
- Sois naturel, bienveillant, et aide discrètement l'utilisateur.
- Réponds en 2-3 phrases maximum.`

    try {
      const content = await callAPI({
        system: systemPrompt,
        scenario: s.label,
        niveau: progress.niveau,
        initScenario: true,
      })

      if (content) {
        setMessages([{ role: 'assistant', content }])
      }
    } catch (err: any) {
      setError(`Erreur : ${err.message}`)
      setMessages([{
        role: 'assistant',
        content: '⚠️ Impossible de démarrer la conversation. Vérifiez votre clé API Groq et votre connexion.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading || !isOnline) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setError(null)
    setLoading(true)

    try {
      const content = await callAPI({
        messages: newMessages,
        scenario: scenario,
        niveau: progress.niveau,
      })

      if (content) {
        setMessages([...newMessages, { role: 'assistant', content }])
      }
    } catch (err: any) {
      setError(`Erreur : ${err.message}`)
      setMessages([...newMessages, {
        role: 'assistant',
        content: '❌ Erreur de connexion. Réessayez.',
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  // ─── OFFLINE ────────────────────────────────────────────
  if (!isOnline) {
    return (
      <div className="px-4 pt-12 flex flex-col items-center text-center space-y-4">
        <div className="text-6xl">✈️</div>
        <h1 className="font-display text-2xl font-bold text-white">Mode avion détecté</h1>
        <p className="text-slate-400 text-sm max-w-xs">
          L'Assistant de poche nécessite une connexion Internet.
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

  // ─── SÉLECTION SCÉNARIO ─────────────────────────────────
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
            <p className="text-sm text-amber-400 font-semibold mb-1">⚠️ Clé API Groq manquante</p>
            <p className="text-xs text-amber-300/80">
              Ajoutez <code className="bg-black/30 px-1 rounded">GROQ_API_KEY</code> dans vos variables d'environnement Vercel ou dans <code className="bg-black/30 px-1 rounded">.env.local</code>.
            </p>
            <a
              href="https://console.groq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-400 underline mt-2 block"
            >
              → Obtenir une clé gratuite sur console.groq.com
            </a>
          </div>
        )}

        {error && (
          <div className="card p-3 border border-red-800 bg-red-900/20">
            <p className="text-xs text-red-400">{error}</p>
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
                </div>
                <span className="text-slate-600">→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="card p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">💡 Conseil</p>
          <p className="text-sm text-slate-300">
            N'ayez pas peur de faire des erreurs ! Écrivez en français ou en allemand, l'assistant s'adapte.
          </p>
        </div>
      </div>
    )
  }

  // ─── CHAT ────────────────────────────────────────────────
  const currentScenario = SCENARIOS.find((s) => s.id === scenario)

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 5.5rem)' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentScenario?.emoji}</span>
          <div>
            <p className="font-semibold text-white text-sm">{currentScenario?.label}</p>
            <p className="text-xs text-slate-500">Niveau {progress.niveau || 'A1'} · Groq AI</p>
          </div>
        </div>
        <button
          onClick={() => { setScenario(null); setMessages([]); setError(null) }}
          className="text-slate-500 hover:text-white text-sm px-3 py-1.5
                     rounded-lg bg-slate-800 hover:bg-slate-700 transition-all"
        >
          Changer
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">

        {/* Loading initial (premier message) */}
        {loading && messages.length === 0 && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm">
              <p className="text-xs text-slate-500 mb-2">L'IA prépare la scène…</p>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                          ${msg.role === 'user'
                            ? 'bg-brand-600 text-white rounded-br-sm'
                            : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'}`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading après envoi user */}
        {loading && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded-lg inline-block">
              {error}
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-3 pt-2 border-t border-slate-800 flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Écrivez en français ou en allemand…"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl
                       px-4 py-3 text-sm text-white placeholder-slate-500
                       focus:outline-none focus:border-brand-500 transition-colors"
            disabled={loading}
            autoComplete="off"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-40
                       text-white px-4 py-3 rounded-xl transition-all
                       active:scale-95 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
