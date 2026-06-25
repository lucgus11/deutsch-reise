export interface Question {
  id: string
  question: string
  options: string[]
  correct: number
  niveau: 'A1' | 'A2' | 'B1'
  explication: string
}

export const questions: Question[] = [
  {
    id: 'q1',
    question: 'Comment dit-on "Bonjour" (dans la journée) en allemand ?',
    options: ['Guten Morgen', 'Guten Tag', 'Guten Abend', 'Auf Wiedersehen'],
    correct: 1,
    niveau: 'A1',
    explication: '"Guten Tag" s\'utilise dans la journée. "Guten Morgen" = matin, "Guten Abend" = soir.'
  },
  {
    id: 'q2',
    question: 'Que signifie "Danke schön" ?',
    options: ['S\'il vous plaît', 'Au revoir', 'Merci beaucoup', 'Excusez-moi'],
    correct: 2,
    niveau: 'A1',
    explication: '"Danke schön" signifie "Merci beaucoup". "Bitte" = s\'il vous plaît / de rien.'
  },
  {
    id: 'q3',
    question: 'Comment demande-t-on "Combien ça coûte ?" en allemand ?',
    options: ['Was ist das?', 'Wie viel kostet das?', 'Wo ist das?', 'Wann ist das?'],
    correct: 1,
    niveau: 'A1',
    explication: '"Wie viel kostet das?" = Combien ça coûte ? "Was" = quoi, "Wo" = où, "Wann" = quand.'
  },
  {
    id: 'q4',
    question: 'Que signifie "Ich verstehe nicht" ?',
    options: ['Je ne sais pas', 'Je ne comprends pas', 'Je ne parle pas allemand', 'Je ne veux pas'],
    correct: 1,
    niveau: 'A1',
    explication: '"Ich verstehe nicht" = Je ne comprends pas. "Verstehen" = comprendre, "nicht" = ne pas.'
  },
  {
    id: 'q5',
    question: 'Comment dit-on "La gare" en allemand ?',
    options: ['Der Flughafen', 'Der Bahnhof', 'Die Haltestelle', 'Der Hafen'],
    correct: 1,
    niveau: 'A1',
    explication: '"Der Bahnhof" = la gare. "Der Flughafen" = aéroport, "Die Haltestelle" = arrêt de bus.'
  },
  {
    id: 'q6',
    question: 'Quelle phrase signifie "L\'addition, s\'il vous plaît" ?',
    options: ['Die Speisekarte, bitte', 'Die Rechnung, bitte', 'Ein Glas Wasser, bitte', 'Einen Tisch, bitte'],
    correct: 1,
    niveau: 'A1',
    explication: '"Die Rechnung" = l\'addition. "Die Speisekarte" = la carte, "Ein Glas Wasser" = un verre d\'eau.'
  },
  {
    id: 'q7',
    question: 'Comment complétez-vous cette phrase ? "Haben Sie ___ freies Zimmer?"',
    options: ['ein', 'eine', 'einen', 'einer'],
    correct: 0,
    niveau: 'A2',
    explication: '"Ein" est l\'article indéfini neutre pour "Zimmer" (la chambre, neutre en allemand).'
  },
  {
    id: 'q8',
    question: 'Que signifie "Mein Zug hat Verspätung" ?',
    options: ['Mon train est annulé', 'Mon train a du retard', 'Mon train est en avance', 'Mon train est complet'],
    correct: 1,
    niveau: 'A2',
    explication: '"Verspätung" = retard. "Mein" = mon, "Zug" = train, "hat" = a.'
  },
  {
    id: 'q9',
    question: 'Comment dit-on "Je voudrais réserver une table" ?',
    options: [
      'Ich möchte einen Tisch reservieren',
      'Ich habe einen Tisch reserviert',
      'Ich brauche einen Tisch',
      'Ich suche einen Tisch'
    ],
    correct: 0,
    niveau: 'A2',
    explication: '"Ich möchte… reservieren" = Je voudrais réserver… "Möchte" est le conditionnel de "mögen".'
  },
  {
    id: 'q10',
    question: 'Que signifie "Gibt es einen Umstieg?" dans le contexte des transports ?',
    options: [
      'Y a-t-il une gare ?',
      'Y a-t-il une correspondance ?',
      'Y a-t-il un retard ?',
      'Y a-t-il un guichet ?'
    ],
    correct: 1,
    niveau: 'B1',
    explication: '"Umstieg" = correspondance / changement de transport. "Gibt es" = Y a-t-il ?'
  }
]

export function calculerNiveau(score: number, total: number): 'A1' | 'A2' | 'B1' {
  const pct = score / total
  if (pct < 0.4) return 'A1'
  if (pct < 0.7) return 'A2'
  return 'B1'
}
