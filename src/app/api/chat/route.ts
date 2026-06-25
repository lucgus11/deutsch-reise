import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const DEFAULT_SYSTEM = `Tu es un assistant bienveillant pour apprendre l'allemand de voyage. 
Tu aides les utilisateurs francophones à pratiquer l'allemand.
Réponds toujours en allemand avec la traduction française entre parenthèses pour les phrases importantes.
Sois encourageant, patient et pédagogue. Réponds en 3-4 phrases maximum.`

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY non configurée', content: null },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const { messages = [], system, scenario, niveau, initScenario } = body

    const systemPrompt = system || `${DEFAULT_SYSTEM}
L'utilisateur est niveau ${niveau || 'A1'} en allemand.
${scenario ? `Scénario actuel : ${scenario}` : ''}
Réponds en 3-4 phrases maximum. Sois naturel et concis.`

    // Si c'est l'ouverture d'un scénario, on ajoute un message déclencheur
    const finalMessages = initScenario
      ? [{ role: 'user', content: 'Commence la scène.' }]
      : messages

    // Sécurité : ne jamais envoyer un tableau vide à Groq
    if (!finalMessages || finalMessages.length === 0) {
      return NextResponse.json(
        { error: 'Aucun message', content: null },
        { status: 400 }
      )
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...finalMessages,
        ],
        max_tokens: 300,
        temperature: 0.8,
        stream: false,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq API error:', response.status, err)
      return NextResponse.json(
        { error: `Erreur API Groq: ${response.status}`, content: null },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error('Groq returned empty content:', JSON.stringify(data))
      return NextResponse.json(
        { error: 'Réponse vide de Groq', content: null },
        { status: 502 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', content: null },
      { status: 500 }
    )
  }
}
