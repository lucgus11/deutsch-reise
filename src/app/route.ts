import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Système prompt par défaut si pas de scénario
const DEFAULT_SYSTEM = `Tu es un assistant bienveillant pour apprendre l'allemand de voyage. 
Tu aides les utilisateurs francophones à pratiquer l'allemand.
Réponds toujours en allemand avec la traduction française entre parenthèses pour les phrases importantes.
Sois encourageant, patient et pédagogue.`

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
    const { messages = [], system, scenario, niveau } = body

    const systemPrompt = system || `${DEFAULT_SYSTEM}
L'utilisateur est niveau ${niveau || 'A1'} en allemand.
${scenario ? `Scénario actuel : ${scenario}` : ''}`

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 512,
        temperature: 0.8,
        stream: false,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq API error:', err)
      return NextResponse.json(
        { error: 'Erreur API Groq', content: null },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', content: null },
      { status: 500 }
    )
  }
}
