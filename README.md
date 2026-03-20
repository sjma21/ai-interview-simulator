# 🎙️ AI Interview Simulator

> A full-stack, AI-powered interview preparation platform built as a **hiring assessment project** — designed to go well beyond a basic CRUD app and showcase real-world engineering skills across the entire stack.

---

## 🧠 Why I Built This

When given this task, I could have built a simple form or a todo list. Instead, I chose to build something that solves a **genuine real-world problem**: the gap between knowing technical concepts and being able to *perform* under interview pressure.

The AI Interview Simulator turns passive learning into active, scored practice. It is the kind of product that I would actually want to use — and that is exactly why I built it. It allowed me to demonstrate:

- End-to-end product thinking (not just coding)
- Integration with modern AI APIs
- Complex frontend state management
- Real-time voice interaction using browser APIs
- Clean architecture that scales across multiple features
- Consistent, production-quality UI/UX decisions

---

## 🚀 What This Project Does

The platform is a **multi-feature interview preparation suite** with five distinct tools:

### 1. 📋 Interview Simulator
The core feature. The AI acts as a strict technical interviewer across **7 domains** (JavaScript, React, SQL, Backend, System Design, Python, TypeScript).
- Asks one focused question at a time across 5 rounds
- Evaluates every answer with a **score out of 10**, structured feedback, the ideal answer, and improvement tips
- Supports **voice input** (speak your answer) and **TTS** (hear the question read aloud)
- Optional **Time Pressure Mode** — countdown timer auto-submits when it expires
- **Hint System** — request a nudge without seeing the full answer (costs −1 point)
- **End Interview early** with a confirmation modal showing current scores

### 2. 📚 Learn with AI
Upload any **PDF document** and the AI reads it, understands the content, and quizzes you on it.
- Drag-and-drop PDF upload with server-side text extraction (`pdf-parse`)
- AI generates targeted comprehension questions specific to *your* document
- Full evaluation loop with scoring and feedback
- Timer mode and hint system fully integrated

### 3. 🤖 AI Study Assistant
A dual-purpose study companion:
- **Study Plan Generator** — enter your role, experience level, and available time; the AI produces a personalised week-by-week roadmap
- **Paragraph Explainer** — paste any dense technical paragraph; the AI explains it in plain English
- Follow-up conversational chat for deeper understanding

### 4. 💻 Coding Practice
A full in-browser coding environment:
- AI generates realistic coding challenges across **6 languages** (JavaScript, TypeScript, Python, Java, C++, Go)
- **Monaco Editor** (the same editor powering VS Code) for a professional coding feel
- User sets a custom timer; the session auto-submits when time expires
- AI analyses the submitted code: correctness, time/space complexity, edge cases, and the optimal solution

### 5. 🎥 Real Voice Interview
A completely voice-first, immersive interview experience:
- AI asks **theoretical/conceptual questions** (no code blocks) read aloud via Text-to-Speech
- User answers by speaking; the browser transcribes live via Speech Recognition
- Animated AI avatar, pulsing microphone button, and real-time transcription
- Score flash between questions for instant feedback
- Evaluation is calibrated for *spoken* answers — judging conceptual clarity, not grammar

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** + **TypeScript** | Component-based UI with full type safety |
| **Vite 8** | Lightning-fast build tooling and HMR |
| **Tailwind CSS 4** | Utility-first styling with custom animations |
| **Monaco Editor** (`@monaco-editor/react`) | VS Code-quality in-browser code editor |
| **Web Speech API** | Browser-native Text-to-Speech and Speech Recognition |
| **Custom Hooks** | `useInterview`, `useLearn`, `useTimer`, `useSpeech`, `useSTT`, `useTTS` |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** + **Express** | REST API server |
| **OpenAI SDK** (via OpenRouter) | LLM integration using `gpt-oss-120b` |
| **Multer** | Multipart file upload handling |
| **pdf-parse** | Server-side PDF text extraction |
| **dotenv** + **CORS** | Environment configuration and cross-origin support |

---

## 📁 Project Structure

```
Chatbot-APP/
├── client/                        # React frontend (Vite + TypeScript)
│   └── src/
│       ├── components/
│       │   ├── ChatBubble.tsx     # Message bubbles with scoring, hints, TTS
│       │   ├── ChatInput.tsx      # Text input with voice (STT) integration
│       │   ├── TimerDisplay.tsx   # Animated countdown display
│       │   ├── EndInterviewModal.tsx
│       │   └── LoadingIndicator.tsx
│       ├── hooks/
│       │   ├── useInterview.ts    # Interview state machine + hint logic
│       │   ├── useLearn.ts        # PDF learning session state
│       │   ├── useTimer.ts        # Countdown timer (double-fire safe)
│       │   └── useSpeech.ts       # TTS + STT custom hooks
│       ├── pages/
│       │   ├── LandingPage.tsx    # Feature showcase + session configurator
│       │   ├── InterviewPage.tsx  # Chat-based interview UI
│       │   ├── LearnPage.tsx      # PDF upload + quiz session
│       │   ├── AssistantPage.tsx  # Study plan + text explainer
│       │   ├── CodingPage.tsx     # Monaco editor + timed coding session
│       │   ├── RealInterviewPage.tsx # Voice-first interview room
│       │   └── EndScreen.tsx      # Results and score summary
│       ├── types.ts               # Shared TypeScript interfaces
│       └── App.tsx                # Mode-based routing
│
└── server/
    ├── server.js                  # Express entry point
    ├── routes/
    │   ├── interview.js           # /api/generate-question, /evaluate-answer, /hint
    │   ├── learn.js               # /api/learn/* (PDF upload, Q&A, hints)
    │   ├── assistant.js           # /api/assistant/* (study plan, explain, chat)
    │   └── coding.js              # /api/coding/* (question gen, code analysis)
    ├── controllers/
    │   ├── interviewController.js
    │   ├── learnController.js
    │   ├── assistantController.js
    │   └── codingController.js
    └── .env                       # OPENROUTER_API_KEY, PORT
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key (free tier works)

### 1. Clone and install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment

Create `server/.env`:

```env
OPENROUTER_API_KEY=your_openrouter_key_here
PORT=3001
```

### 3. Run the app

```bash
# Terminal 1 — start the API server
cd server
npm run dev

# Terminal 2 — start the React frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 💡 Skills This Project Demonstrates

| Skill Area | Evidence |
|---|---|
| **Full-Stack Architecture** | Separate client/server with clean API boundaries, proxy configuration, modular routing |
| **TypeScript Proficiency** | Strict types across all components, hooks, API contracts, and discriminated unions for state phases |
| **React Patterns** | Custom hooks for complex state, derived state during render, `useReducer` for timer state machine |
| **AI/LLM Integration** | Structured prompt engineering for 5 different AI modes; verbal vs written evaluation distinction |
| **Voice UI Development** | Web Speech API (TTS + STT) with graceful degradation, callback-chained speaking sequences |
| **File Handling** | Multipart upload, server-side PDF parsing, content summarization pipeline |
| **UX Engineering** | Timer with double-fire prevention, hint system with score penalty, early exit with confirmation |
| **Code Quality** | ESLint with strict react-hooks rules, zero lint errors, no `any` types, clean component separation |
| **UI Design** | Dark-mode first, animated backgrounds, glassmorphism, responsive grid layouts, micro-interactions |
| **Problem Solving** | Debugged ESLint ref-in-render issues, circular hook deps, PDF library CJS/ESM conflicts |

---

## 🔑 Key Engineering Decisions

**Why OpenRouter instead of a direct model API?**
OpenRouter provides a single unified API key that works with many models. It allowed easy switching between providers during development without changing application code.

**Why custom hooks over a state library?**
The feature set is entirely self-contained per session. Custom hooks (`useInterview`, `useLearn`) cleanly encapsulate all state and side effects without the overhead of Redux or Zustand, keeping components purely presentational.

**Why `useReducer` for the timer?**
The timer had a subtle double-fire bug where `onExpire` was called twice per expiry. Using `useReducer` with an atomic state update and a `firedRef` guard eliminated the race condition entirely, and satisfied strict ESLint rules about refs and setState in effects.

**Why separate prompts for verbal vs written evaluation?**
Spoken answers are naturally less structured than typed ones. The Real Voice Interview uses a dedicated AI prompt that explicitly acknowledges this and judges *conceptual clarity* rather than completeness, making scores fair for voice-first interaction.

---

## 📸 Features at a Glance

- ✅ 7 interview domains · 3 difficulty levels
- ✅ 5-question structured sessions with total scoring
- ✅ Voice input + voice output (TTS) on all interview modes
- ✅ Time Pressure Mode with auto-submission
- ✅ Hint system with −1 point penalty
- ✅ PDF upload → AI-generated comprehension quiz
- ✅ Personalised study plan generator
- ✅ In-browser Monaco code editor (VS Code quality)
- ✅ Real voice interview (fully voice-driven, no typing)
- ✅ Animated, immersive dark-mode UI throughout
- ✅ Zero TypeScript errors · Zero ESLint errors

---

## 👤 Author

**Sajal Mishra**
Built as a hiring assessment project to demonstrate full-stack engineering, AI integration, and product-level thinking.
