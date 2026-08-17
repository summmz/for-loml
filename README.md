# Take Care of Nini 💜

A virtual boyfriend PWA built with love — feed him, pat him, cuddle him, chat with him, and leave love notes. He remembers your name, reacts to the weather, and misses you when you're gone.

---

## What is this?

This is a personal relationship app I built for my girlfriend. She can install it on her phone like a real app (PWA), take care of a virtual version of me, and we can talk through it — even when we're apart. It's basically a Tamagotchi boyfriend.

---

## Features

### Virtual Pet
- **Feed** — drag and drop food to keep him fed
- **Pat** — tap to give attention
- **Sleep** — let him rest when energy is low
- **Hold to Cuddle** — long press to cuddle, fills up the love bar
- **"Do Not Press"** — flirt button that drops pickup lines

### AI Chat
- Talks like me — trained on real chat history via a detailed system prompt
- Powered by Google Gemini (`gemini-3.5-flash-lite`)
- Streaming text responses in real-time
- Mood-aware — responds differently based on hunger, attention, and energy stats
- Weather-aware — mentions rain, heat, or cold based on your location
- Optional voice output via local TTS server (Coqui XTTS v2) or browser speech synthesis fallback

### Real-Time Chat Room
- Firebase Realtime Database peer-to-peer chat
- Instagram-style read receipts (Sent / Delivered / Seen with timestamp)
- Name picker so you know who's who
- Real-time — messages appear instantly on both sides

### Phone Calls
- Simulated incoming call overlay with ringing animation
- Scripted boyfriend dialogue that appears at timed intervals
- Auto-hangs up after 23 seconds

### Love Notes
- **Daily notes** — new handwritten-style note from him every day
- **Live notes** — sent from his phone to yours via ntfy.sh push notification
- **Send a note** — leave a note back, delivered straight to his device
- **Standalone send page** (`/send-note.html`) — he can send notes without opening the app

### Push Notifications
- Idle messages fire real OS notifications when the app is backgrounded
- "I need you" button sends an instant push notification to his phone via ntfy.sh
- Love notes push directly to his device
- All zero stats trigger an "I miss you..." notification

### Dynamic Themes
- Background changes based on time of day (morning, afternoon, evening, night)
- Character mood shifts based on stats (sad when low, flirty when high attention, loving when everything is full)
- Idle messages adapt to mood and weather

### Daily Check-In
- Mood check-in overlay on first open of the day
- Affects the character's tone and messages throughout the day

### Weather Integration
- Uses Open-Meteo API (free, no key required) with IP-based location fallback
- Rainy, hot, or cold weather subtly influences AI responses

### Customization
- Change your name, his name, nickname, and avatar emoji
- Notification permission toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| PWA | vite-plugin-pwa (service worker, manifest, installable) |
| AI Chat | Google Gemini API (`@google/genai`) |
| Realtime DB | Firebase Realtime Database |
| Push Notifications | ntfy.sh (serverless, no backend) |
| Web Notifications | Web Notifications API + Service Worker |
| Weather | Open-Meteo API + ipapi.co fallback |
| Voice (TTS) | Local Python server — Coqui XTTS v2 |
| Styling | Single CSS file (~2000 lines), Outfit font |
| Deployment | GitHub Pages via GitHub Actions |
| Linting | oxlint |

---

## Project Structure

```
├── src/
│   ├── App.jsx                     # Main app — state, AI chat, timers, all logic
│   ├── main.jsx                    # React root
│   ├── firebase.js                 # Firebase init
│   ├── index.css                   # All styles
│   ├── components/
│   │   ├── Character.jsx           # Emoji character with animations
│   │   ├── StatBars.jsx            # Hunger / Attention / Energy bars
│   │   ├── Controls.jsx            # Feed, Pat, Sleep, Flirt, Cuddle, Call, I Need You
│   │   ├── ChatInput.jsx           # AI chat text input
│   │   ├── ChatRoom.jsx            # Firebase real-time chat with read receipts
│   │   ├── CallOverlay.jsx         # Simulated phone call
│   │   ├── CuddleOverlay.jsx       # Hold-to-cuddle with haptic feedback
│   │   ├── FeedDrawer.jsx          # Drag-and-drop food drawer
│   │   ├── MusicPlayer.jsx         # Lo-Fi radio stream
│   │   ├── DailyCheckinOverlay.jsx # Daily mood check-in
│   │   ├── SurpriseEvent.jsx       # Random care package gift event
│   │   ├── CustomizeOverlay.jsx    # Settings (name, avatar, notifications)
│   │   └── LoveNotes.jsx           # Daily + live notes, send notes
│   ├── hooks/
│   │   └── useWeather.js           # Open-Meteo weather hook
│   └── utils/
│       ├── notifications.js        # Web Notification API wrapper
│       └── liveNotes.js            # ntfy.sh polling for live notes
├── public/
│   └── send-note.html              # Standalone page for him to send notes
├── tts_server.py                   # Local Python TTS server (Coqui XTTS v2)
├── extract_chats.py                # Messenger chat history extractor
├── .github/workflows/deploy.yml    # Auto-deploy to GitHub Pages
├── vite.config.js                  # Vite + PWA config
└── .env                            # API keys and config (gitignored)
```

---

## Environment Variables

```env
# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_key

# ntfy.sh push notifications
VITE_NTFY_TOPIC=your_ntfy_topic          # Her -> Him (I need you, notes)
VITE_NTFY_NOTES_TOPIC=your_notes_topic   # Him -> Her (live notes)

# Firebase (Realtime Database)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project-rtdb.firebaseio.com/
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Add your .env file (see above)

# Run dev server
npm run dev

# Build for production
npm run build
```

### TTS Server (optional)

```bash
# Requires Python 3.10+ and a GPU with ~4GB VRAM
pip install flask torch torchaudio TTS
python tts_server.py
# Runs on http://localhost:5002
```

---

## Deployment

Push to `main` — GitHub Actions builds and deploys to GitHub Pages automatically.

```bash
git add .
git commit -m "your message"
git push
```

---

## How it was built

This project started as a simple virtual pet idea and grew into something much more personal. Every feature was built with one person in mind — making her smile when she opens the app.

- The AI chat was fine-tuned on real conversation style — romanized Hindi/Punjabi, casual, flirty, sometimes dramatic
- The "Do Not Press" flirt button drops genuine pickup lines, not cringe ones
- The call feature was added because she missed hearing from him — so he calls now
- Love notes were built so he could leave little surprises that she'd discover throughout the day
- The whole thing works offline-ish (PWA) and feels like a real app on her phone
- Push notifications via ntfy.sh mean he can reach her even when the app is closed — no backend needed
- The read receipts were the last touch — she can see when he's seen her messages

Built with React, powered by love, deployed on GitHub Pages. No servers, no databases to manage, no billing — just a couple APIs and a lot of heart.

---

Made with love for someone special. 💜
