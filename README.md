# 🇩🇪 Deutsch Reise – Apprendre l'Allemand de Voyage

Application Progressive Web App (PWA) pour apprendre l'allemand essentiel du voyageur, construite avec **Next.js 14**, **Tailwind CSS** et **TypeScript**.

## ✨ Fonctionnalités

### 📱 PWA & Offline-First
- Service Worker personnalisé avec stratégie cache-first
- Fonctionne **entièrement sans internet** (lexique, exercices, audio)
- Installable sur mobile (iOS & Android) et desktop
- Bannière de notification online/offline

### 🎯 Test de Niveau Initial
- 10 questions progressives (A1 → B1)
- Calcul automatique du niveau (A1, A2, B1)
- Stockage dans `localStorage`
- Possibilité de refaire le test

### 📖 Lexique avec Prononciation
- **60+ phrases** réparties en 6 catégories :
  - 🏨 Hôtel  |  🍽️ Restaurant  |  🚆 Transports
  - 🆘 Urgences  |  🛍️ Shopping  |  😊 Politesse
- Filtrage par catégorie et **niveau (A1/A2/B1)**
- Barre de recherche en temps réel
- Phonétique détaillée pour chaque phrase
- **API SpeechSynthesis** pour l'audio (100% hors ligne)

### 🃏 Exercices avec Répétition Espacée
- **Flashcards** avec animation 3D et auto-évaluation (facile / hésitant / difficile)
- **QCM** à 4 propositions
- Algorithme **SM-2** (SuperMemo) pour planifier les révisions
- Score de streak journalier 🔥
- Adapté au niveau de l'utilisateur

### 🤖 Assistant de Poche (IA)
- Propulsé par **Groq API** (llama3-8b-8192)
- 5 scénarios de mise en situation :
  - 🏨 À l'hôtel  |  🍽️ Au restaurant  |  🚆 À la gare
  - 🗺️ Je suis perdu  |  💬 Conversation libre
- **Actif uniquement en ligne** avec indicateur visuel
- Réponses bilingues allemand/français

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### 1. Cloner et installer
```bash
git clone https://github.com/votre-username/deutsch-reise.git
cd deutsch-reise
npm install
```

### 2. Configurer l'API Groq
```bash
cp .env.local.example .env.local
# Éditez .env.local et ajoutez votre clé Groq
# Obtenez une clé gratuite sur https://console.groq.com
```

### 3. Lancer en développement
```bash
npm run dev
# Ouvrez http://localhost:3000
```

### 4. Build de production
```bash
npm run build
npm start
```

## 🌐 Déploiement sur Vercel

### Option A : Interface Vercel (recommandé)
1. Pushez votre code sur GitHub
2. Importez le repo sur [vercel.com](https://vercel.com)
3. Ajoutez la variable d'environnement `GROQ_API_KEY`
4. Deploy !

### Option B : CLI Vercel
```bash
npm i -g vercel
vercel --prod
```

## 📁 Architecture

```
deutsch-reise/
├── public/
│   ├── sw.js              # Service Worker
│   ├── manifest.json      # PWA Manifest
│   └── icons/             # Icônes PWA (à générer)
├── src/
│   ├── app/
│   │   ├── layout.tsx     # Layout racine
│   │   ├── page.tsx       # Accueil
│   │   ├── test-niveau/   # Test de niveau
│   │   ├── lexique/       # Lexique
│   │   ├── exercices/     # Flashcards & QCM
│   │   ├── assistant/     # Chat IA
│   │   └── api/chat/      # API Route Groq
│   ├── components/
│   │   ├── ui/
│   │   │   ├── FlashCard.tsx
│   │   │   ├── QCMCard.tsx
│   │   │   ├── PWARegister.tsx
│   │   │   └── OfflineBanner.tsx
│   │   └── layout/
│   │       └── Navigation.tsx
│   ├── data/
│   │   ├── lexique.json   # Base de données phrases
│   │   └── questions.ts   # Questions test de niveau
│   └── hooks/
│       ├── useUserProgress.ts   # SRS + localStorage
│       ├── useSpeech.ts         # SpeechSynthesis
│       └── useOnlineStatus.ts   # Détection réseau
```

## 🎨 Générer les icônes PWA

Utilisez un outil comme [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) :

```bash
npx pwa-asset-generator logo.png public/icons \
  --icon-only --background "#000f50" --padding "15%"
```

Ou utilisez [realfavicongenerator.net](https://realfavicongenerator.net) et placez les icônes dans `public/icons/`.

## 🔑 Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `GROQ_API_KEY` | Clé API Groq pour l'IA | Pour l'Assistant |

## 📜 Licence

CC 4.0
