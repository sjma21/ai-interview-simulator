import { useState, useCallback, useRef, useEffect } from "react";
import { useTTS, useSTT } from "../hooks/useSpeech";
import type { Domain, Difficulty } from "../types";

interface RealInterviewPageProps {
  onBack: () => void;
}

type Phase =
  | "setup"
  | "countdown"
  | "ai-asking"
  | "user-turn"
  | "listening"
  | "evaluating"
  | "score-flash"
  | "results";

interface QuestionResult {
  question: string;
  answer: string;
  score: number;
  feedback: string;
}

const DOMAINS: Domain[] = [
  "JavaScript", "React.js", "TypeScript", "Backend",
  "SQL", "System Design", "DSA",
];

const DOMAIN_ICONS: Record<string, string> = {
  JavaScript: "⚡", "React.js": "⚛️", TypeScript: "🔷", Backend: "⚙️",
  SQL: "🗄️", "System Design": "🏗️", DSA: "🧩",
};

const QUESTION_COUNTS = [3, 5, 7];

/* ── AI Avatar ── */
function AIAvatar({ phase }: { phase: Phase }) {
  const isSpeaking = phase === "ai-asking" || phase === "countdown";
  const isThinking = phase === "evaluating";
  const isListening = phase === "listening";

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      {/* Outer pulse rings when speaking */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-indigo-400/30 animate-ping" style={{ animationDuration: "1.5s" }} />
          <div className="absolute inset-[-12px] rounded-full border border-violet-400/20 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute inset-[-24px] rounded-full border border-indigo-400/10 animate-ping" style={{ animationDuration: "2.5s" }} />
        </>
      )}
      {/* Listening rings */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping" style={{ animationDuration: "1s" }} />
          <div className="absolute inset-[-10px] rounded-full border border-teal-400/20 animate-ping" style={{ animationDuration: "1.5s" }} />
        </>
      )}
      {/* Avatar circle */}
      <div className={`relative w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ${
        isSpeaking
          ? "bg-gradient-to-br from-indigo-600 to-violet-700 shadow-indigo-500/50 scale-105"
          : isListening
          ? "bg-gradient-to-br from-cyan-600 to-teal-700 shadow-cyan-500/40 scale-100"
          : isThinking
          ? "bg-gradient-to-br from-amber-600 to-orange-700 shadow-amber-500/40"
          : "bg-gradient-to-br from-slate-700 to-slate-800 shadow-black/40"
      }`}>
        {/* AI face / icon */}
        {isThinking ? (
          <div className="flex gap-1 items-center">
            <span className="w-2 h-2 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : isSpeaking ? (
          <div className="flex items-end gap-1 h-8">
            {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
              <span
                key={i}
                className="w-1.5 bg-white/90 rounded-full animate-[soundbar_0.8s_ease-in-out_infinite]"
                style={{ height: `${[40, 70, 100, 70, 40][i]}%`, animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        ) : (
          <svg className="w-12 h-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
          </svg>
        )}
      </div>
      {/* Name tag */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
        <p className="text-xs font-bold text-white">Alex</p>
        <p className="text-[10px] text-slate-500">AI Interviewer</p>
      </div>
    </div>
  );
}

/* ── Mic Button ── */
function MicButton({
  phase, onStart, onStop, sttSupported,
}: {
  phase: Phase;
  onStart: () => void;
  onStop: () => void;
  sttSupported: boolean;
}) {
  const isListening = phase === "listening";
  const canInteract = phase === "user-turn" || phase === "listening";

  if (!sttSupported) {
    return (
      <p className="text-xs text-slate-600 text-center">
        Voice not supported in this browser. Type your answer below.
      </p>
    );
  }

  return (
    <div className="relative flex items-center justify-center">
      {isListening && (
        <>
          <div className="absolute w-28 h-28 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: "1.2s" }} />
          <div className="absolute w-36 h-36 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: "1.8s" }} />
        </>
      )}
      <button
        onClick={isListening ? onStop : onStart}
        disabled={!canInteract}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
          isListening
            ? "bg-red-500 hover:bg-red-400 shadow-red-500/50 scale-110"
            : canInteract
            ? "bg-gradient-to-br from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 shadow-indigo-500/40 hover:scale-105 active:scale-95"
            : "bg-slate-800 opacity-40 cursor-not-allowed"
        }`}
      >
        {isListening ? (
          <div className="flex items-end gap-0.5 h-7">
            {[0, 0.1, 0.2, 0.1, 0].map((d, i) => (
              <span key={i} className="w-1.5 bg-white rounded-full animate-[soundbar_0.6s_ease-in-out_infinite]"
                style={{ height: `${[50, 80, 100, 80, 50][i]}%`, animationDelay: `${d}s` }} />
            ))}
          </div>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ── Setup Screen ── */
function SetupScreen({
  onStart,
}: {
  onStart: (domain: Domain, difficulty: Difficulty, count: number) => void;
}) {
  const [domain, setDomain] = useState<Domain>("JavaScript");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [count, setCount] = useState(5);

  return (
    <div className="relative z-10 w-full px-6 py-10">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl shadow-red-900/50 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Real Voice Interview</h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            The AI will speak questions aloud. You answer with your voice. Just like the real thing.
          </p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-7 space-y-7">
          {/* Domain */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">Domain</p>
            <div className="grid grid-cols-4 gap-2">
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                    domain === d
                      ? "bg-indigo-600/20 border-indigo-500/50 text-white ring-1 ring-indigo-500/30"
                      : "bg-white/3 border-white/8 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{DOMAIN_ICONS[d]}</span>
                  <span className="text-[10px] font-semibold leading-tight">{d}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">Difficulty</p>
            <div className="grid grid-cols-3 gap-3">
              {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => {
                const styles = { Easy: "emerald", Medium: "amber", Hard: "red" }[d];
                return (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-3 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${
                      difficulty === d
                        ? `bg-${styles}-500/15 border-${styles}-400/60 text-${styles}-300 scale-[1.02]`
                        : "bg-white/3 border-white/10 text-slate-400 hover:border-white/25"
                    }`}
                  >
                    {{ Easy: "🌱 Easy", Medium: "🔥 Medium", Hard: "💀 Hard" }[d]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question count */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">Number of Questions</p>
            <div className="flex gap-3">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${
                    count === n
                      ? "bg-violet-600/20 border-violet-500/50 text-violet-300 scale-[1.02]"
                      : "bg-white/3 border-white/10 text-slate-400 hover:border-white/25"
                  }`}
                >
                  {n} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Mic check callout */}
          <div className="flex items-start gap-3 bg-indigo-500/8 border border-indigo-500/20 rounded-2xl px-4 py-3">
            <span className="text-lg mt-0.5">🎙️</span>
            <div>
              <p className="text-xs font-bold text-indigo-300 mb-0.5">Microphone Required</p>
              <p className="text-xs text-slate-500 leading-relaxed">Make sure your mic is enabled. The AI will speak questions and you answer by voice. You can also type if needed.</p>
            </div>
          </div>

          <button
            onClick={() => onStart(domain, difficulty, count)}
            className="group w-full relative overflow-hidden flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-4 rounded-2xl text-base transition-all shadow-2xl shadow-red-900/50 hover:shadow-red-500/40 active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Enter the Interview Room</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Results Screen ── */
function ResultsScreen({
  results, domain, difficulty, onBack,
}: {
  results: QuestionResult[];
  domain: Domain;
  difficulty: Difficulty;
  onBack: () => void;
}) {
  const total = results.reduce((s, r) => s + r.score, 0);
  const avg = total / results.length;
  const maxTotal = results.length * 10;

  const grade =
    avg >= 8 ? { label: "Outstanding", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", emoji: "🏆" }
    : avg >= 6 ? { label: "Good Performance", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/30", emoji: "👍" }
    : avg >= 4 ? { label: "Needs Improvement", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", emoji: "📈" }
    : { label: "Keep Practicing", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", emoji: "💪" };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-10 scrollbar-thin">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">{grade.emoji}</div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Interview Complete</h2>
          <p className="text-slate-500 text-sm">{domain} · {difficulty} · {results.length} Questions</p>
        </div>

        {/* Score card */}
        <div className={`flex items-center justify-between border rounded-3xl px-8 py-6 mb-8 ${grade.bg}`}>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Total Score</p>
            <p className={`text-5xl font-black ${grade.color}`}>
              {total}<span className="text-slate-600 text-2xl font-normal">/{maxTotal}</span>
            </p>
            <p className={`text-sm font-bold mt-1 ${grade.color}`}>{grade.label}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Average</p>
            <p className={`text-4xl font-black ${grade.color}`}>{avg.toFixed(1)}<span className="text-slate-600 text-xl font-normal">/10</span></p>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="space-y-4 mb-10">
          {results.map((r, i) => {
            const sc = r.score >= 8 ? "text-emerald-400" : r.score >= 5 ? "text-amber-400" : "text-red-400";
            const bg = r.score >= 8 ? "border-emerald-500/20" : r.score >= 5 ? "border-amber-500/20" : "border-red-500/20";
            return (
              <div key={i} className={`bg-white/[0.03] border rounded-2xl p-5 ${bg}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-400">{i + 1}</span>
                    <p className="text-sm font-semibold text-white leading-snug">{r.question}</p>
                  </div>
                  <span className={`flex-shrink-0 text-xl font-black ${sc}`}>{r.score}<span className="text-slate-600 text-sm font-normal">/10</span></span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-8">{r.answer.slice(0, 120)}{r.answer.length > 120 ? "…" : ""}</p>
                <details className="mt-2 pl-8">
                  <summary className="text-xs text-indigo-400/70 cursor-pointer hover:text-indigo-300 transition-colors">View AI feedback</summary>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2 whitespace-pre-line">{r.feedback}</p>
                </details>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 bg-white/3 hover:bg-white/8 text-sm font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-sm font-bold text-white transition-all shadow-lg shadow-red-900/40 cursor-pointer"
          >
            Try Again
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function RealInterviewPage({ onBack }: RealInterviewPageProps) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [domain, setDomain] = useState<Domain>("JavaScript");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [flashScore, setFlashScore] = useState<number | null>(null);
  const [statusText, setStatusText] = useState("");
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);

  const { speak, stop: stopTTS } = useTTS();
  const { toggle: toggleSTT, stopListening, status: sttStatus, supported: sttSupported } = useSTT(
    useCallback((t: string) => setTranscript(t), [])
  );

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; });

  /* fetch next question */
  const fetchQuestion = useCallback(async (dom: Domain, diff: Difficulty, asked: string[]) => {
    setStatusText("Thinking of a question…");
    const res = await fetch("/api/generate-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: dom, difficulty: diff, askedQuestions: asked, verbal: true }),
    });
    const data = await res.json();
    return (data.question as string) ?? "Can you walk me through your understanding of this domain and how you approach problems in it?";
  }, []);

  /* ask a question via TTS */
  const askQuestion = useCallback((question: string) => {
    setCurrentQuestion(question);
    setTranscript("");
    setPhase("ai-asking");
    setStatusText("Alex is speaking…");
    speak(question, () => {
      if (phaseRef.current === "ai-asking") {
        setPhase("user-turn");
        setStatusText("Your turn — press the mic and speak your answer");
      }
    });
  }, [speak]);

  /* start interview */
  const handleStart = useCallback(async (dom: Domain, diff: Difficulty, count: number) => {
    setDomain(dom);
    setDifficulty(diff);
    setTotalQuestions(count);
    setResults([]);
    setAskedQuestions([]);
    setQuestionNumber(1);
    setPhase("countdown");
    setCountdown(3);

    // countdown
    let c = 3;
    const iv = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c === 0) {
        clearInterval(iv);
        fetchQuestion(dom, diff, []).then((q) => {
          setAskedQuestions([q]);
          askQuestion(q);
        });
      }
    }, 1000);
  }, [fetchQuestion, askQuestion]);

  /* submit voice answer */
  const handleSubmit = useCallback(async () => {
    if (sttStatus === "listening") stopListening();
    stopTTS();

    const answer = transcript.trim() || "[No answer given]";
    setPhase("evaluating");
    setStatusText("Evaluating your answer…");

    try {
      const res = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, question: currentQuestion, answer, verbal: true }),
      });
      const data = await res.json();
      const score: number = data.score ?? 5;
      const feedback: string = data.feedback ?? "";

      setFlashScore(score);
      setPhase("score-flash");
      setStatusText("");

      // Speak brief reaction
      const reaction =
        score >= 8 ? "Great answer! Moving to the next question."
        : score >= 5 ? "Good attempt. Let's continue."
        : "That's okay, let's keep going.";

      const newResults = [...results, { question: currentQuestion, answer, score, feedback }];
      setResults(newResults);

      speak(reaction, () => {
        setTimeout(() => {
          setFlashScore(null);
          if (newResults.length >= totalQuestions) {
            setPhase("results");
          } else {
            const nextNum = questionNumber + 1;
            setQuestionNumber(nextNum);
            const asked = [...askedQuestions];
            fetchQuestion(domain, difficulty, asked).then((q) => {
              setAskedQuestions((prev) => [...prev, q]);
              askQuestion(q);
            });
          }
        }, 500);
      });
    } catch {
      setPhase("user-turn");
      setStatusText("Something went wrong. Try again.");
    }
  }, [transcript, sttStatus, stopListening, stopTTS, domain, difficulty, currentQuestion, results, totalQuestions, questionNumber, askedQuestions, fetchQuestion, askQuestion, speak]);

  /* STT controls */
  const handleMicStart = useCallback(() => {
    setTranscript("");
    setPhase("listening");
    setStatusText("Listening… speak your answer");
    toggleSTT();
  }, [toggleSTT]);

  const handleMicStop = useCallback(() => {
    stopListening();
    setPhase("user-turn");
    setStatusText("Answer recorded — review and submit when ready");
  }, [stopListening]);

  /* keyboard shortcut: Space to toggle mic */
  useEffect(() => {
    if (phase !== "user-turn" && phase !== "listening") return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && (e.target as Element)?.tagName !== "TEXTAREA") {
        e.preventDefault();
        if (phase === "listening") handleMicStop();
        else handleMicStart();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, handleMicStart, handleMicStop]);

  const progress = results.length / totalQuestions;

  /* ── Render ── */
  if (phase === "setup") {
    return (
      <div className="h-screen bg-[#050508] text-white flex flex-col overflow-y-auto">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-rose-600/8 blur-[80px] animate-float" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>
        <nav className="relative z-10 flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b border-white/5">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors cursor-pointer group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </button>
          <span className="text-white/10">│</span>
          <span className="text-sm font-bold text-white">🎙️ Real Voice Interview</span>
        </nav>
        <SetupScreen onStart={handleStart} />
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div className="h-screen bg-[#050508] text-white flex flex-col overflow-hidden">
        <nav className="relative z-10 flex items-center gap-3 px-6 py-4 border-b border-white/5 flex-shrink-0">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors cursor-pointer group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </button>
        </nav>
        <ResultsScreen results={results} domain={domain} difficulty={difficulty} onBack={onBack} />
      </div>
    );
  }

  /* ── Interview Room ── */
  return (
    <div className="h-screen bg-[#050508] text-white flex flex-col overflow-hidden select-none">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-700/8 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-violet-700/8 rounded-full blur-[60px]" />
      </div>

      {/* ── Top bar ── */}
      <header className="relative z-10 flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a10]/80 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">{domain}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              difficulty === "Easy" ? "text-emerald-400 bg-emerald-500/10"
              : difficulty === "Medium" ? "text-amber-400 bg-amber-500/10"
              : "text-red-400 bg-red-500/10"
            }`}>{difficulty}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-1 max-w-xs mx-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-medium">
              Question <span className="text-white font-bold">{Math.min(questionNumber, totalQuestions)}</span> of {totalQuestions}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {results.length > 0 && `Avg: ${(results.reduce((s,r) => s + r.score, 0) / results.length).toFixed(1)}/10`}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        <button
          onClick={() => { stopTTS(); stopListening(); onBack(); }}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 border border-white/8 hover:border-red-500/30 bg-white/3 hover:bg-red-500/8 px-3 py-2 rounded-xl transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
          </svg>
          End
        </button>
      </header>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between px-6 py-8 overflow-hidden">

        {/* COUNTDOWN */}
        {phase === "countdown" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <p className="text-slate-500 text-sm uppercase tracking-widest font-semibold">Interview starts in</p>
            <div className="w-32 h-32 rounded-full border-4 border-indigo-500/40 flex items-center justify-center shadow-2xl shadow-indigo-900/40">
              <span className="text-7xl font-black text-indigo-400">{countdown}</span>
            </div>
            <p className="text-slate-600 text-xs">Get ready to speak clearly</p>
          </div>
        )}

        {/* INTERVIEW PHASES */}
        {phase !== "countdown" && (
          <>
            {/* AI Avatar */}
            <div className="flex flex-col items-center gap-14 mt-4">
              <AIAvatar phase={phase} />

              {/* Status badge */}
              <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-semibold transition-all ${
                phase === "ai-asking"
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                  : phase === "listening"
                  ? "bg-red-500/10 border-red-500/30 text-red-300"
                  : phase === "evaluating"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : phase === "score-flash"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-white/5 border-white/10 text-slate-400"
              }`}>
                {phase === "ai-asking" && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
                {phase === "listening" && <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />}
                {phase === "evaluating" && <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />}
                {phase === "score-flash" && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                {phase === "user-turn" && <span className="w-2 h-2 rounded-full bg-slate-400" />}
                <span>{statusText}</span>
              </div>
            </div>

            {/* Question card */}
            {currentQuestion && (
              <div className="w-full max-w-xl">
                <div className="relative bg-[#0d0d18] border border-white/10 rounded-3xl px-7 py-5 shadow-2xl">
                  <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Q{questionNumber}
                  </div>
                  <p className="text-base text-slate-100 leading-relaxed font-medium mt-1">{currentQuestion}</p>
                </div>
              </div>
            )}

            {/* Score flash */}
            {phase === "score-flash" && flashScore !== null && (
              <div className={`flex items-center gap-4 px-8 py-4 rounded-2xl border shadow-xl ${
                flashScore >= 8 ? "bg-emerald-500/15 border-emerald-500/40"
                : flashScore >= 5 ? "bg-amber-500/15 border-amber-500/40"
                : "bg-red-500/15 border-red-500/40"
              }`}>
                <p className={`text-5xl font-black ${flashScore >= 8 ? "text-emerald-400" : flashScore >= 5 ? "text-amber-400" : "text-red-400"}`}>
                  {flashScore}<span className="text-slate-600 text-2xl font-normal">/10</span>
                </p>
                <p className={`text-sm font-bold ${flashScore >= 8 ? "text-emerald-300" : flashScore >= 5 ? "text-amber-300" : "text-red-300"}`}>
                  {flashScore >= 8 ? "Excellent! 🎉" : flashScore >= 5 ? "Good answer 👍" : "Keep going 💪"}
                </p>
              </div>
            )}

            {/* Transcript + Mic area */}
            <div className="w-full max-w-xl space-y-5">
              {/* Live transcript */}
              {(phase === "user-turn" || phase === "listening") && (
                <div className="relative min-h-[64px] bg-white/[0.03] border border-white/8 rounded-2xl px-5 py-4">
                  {transcript ? (
                    <p className="text-sm text-slate-200 leading-relaxed">{transcript}</p>
                  ) : (
                    <p className="text-sm text-slate-700 italic">
                      {phase === "listening" ? "Listening…" : "Your answer will appear here as you speak"}
                    </p>
                  )}
                  {phase === "listening" && (
                    <div className="absolute top-3 right-4 flex items-end gap-0.5 h-4">
                      {[0, 0.1, 0.2, 0.1, 0].map((d, i) => (
                        <span key={i} className="w-1 bg-red-400/70 rounded-full animate-[soundbar_0.5s_ease-in-out_infinite]"
                          style={{ height: `${[40, 70, 100, 70, 40][i]}%`, animationDelay: `${d}s` }} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Controls row */}
              <div className="flex items-center justify-center gap-6">
                {/* Mic */}
                <div className="flex flex-col items-center gap-2">
                  <MicButton
                    phase={phase}
                    onStart={handleMicStart}
                    onStop={handleMicStop}
                    sttSupported={sttSupported}
                  />
                  <p className="text-xs text-slate-600">
                    {phase === "listening" ? "Click to stop" : phase === "user-turn" ? "Click to speak (Space)" : ""}
                  </p>
                </div>

                {/* Submit button */}
                {(phase === "user-turn" || phase === "listening") && (
                  <button
                    onClick={handleSubmit}
                    disabled={!transcript.trim()}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold text-white shadow-lg shadow-indigo-900/40 transition-all active:scale-[0.97] cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit Answer
                  </button>
                )}
              </div>

              {/* Fallback: type answer if voice not available */}
              {!sttSupported && (phase === "user-turn" || phase === "listening") && (
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Type your answer here…"
                  rows={3}
                  className="w-full bg-[#0d0d18] border border-white/10 text-sm text-slate-200 rounded-2xl px-5 py-3.5 resize-none focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700 scrollbar-thin"
                />
              )}
            </div>
          </>
        )}

        {/* Progress squares */}
        {phase !== "countdown" && (
          <div className="flex items-center gap-2.5 pb-2">
            {Array.from({ length: totalQuestions }).map((_, i) => {
              const done = i < results.length;
              const current = i === results.length;
              const r = results[i];
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-3 h-3 rounded-sm transition-all duration-300 ${
                    done
                      ? r.score >= 8 ? "bg-emerald-400" : r.score >= 5 ? "bg-amber-400" : "bg-red-400"
                      : current ? "bg-indigo-400 ring-2 ring-indigo-400/40 scale-125"
                      : "bg-white/10"
                  }`} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
