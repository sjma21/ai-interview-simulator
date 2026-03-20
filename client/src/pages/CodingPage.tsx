import { useState, useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";

interface CodingPageProps {
  onBack: () => void;
}

type CodingPhase = "setup" | "coding" | "result";

interface CodingQuestion {
  title: string;
  description: string;
  examples: { input: string; output: string; explanation: string }[];
  constraints: string[];
  starterCode: string;
}

/* ─── Language config ─── */
const LANGUAGES = [
  { id: "javascript", label: "JavaScript", icon: "🟨", monaco: "javascript" },
  { id: "python",     label: "Python",     icon: "🐍", monaco: "python"     },
  { id: "typescript", label: "TypeScript", icon: "🔷", monaco: "typescript" },
  { id: "java",       label: "Java",       icon: "☕", monaco: "java"       },
  { id: "cpp",        label: "C++",        icon: "⚡", monaco: "cpp"        },
  { id: "go",         label: "Go",         icon: "🐹", monaco: "go"         },
];

/* ─── Topic config ─── */
const TOPICS = [
  { label: "Arrays & Strings",        icon: "📦" },
  { label: "Hash Maps",               icon: "🗂️" },
  { label: "Two Pointers",            icon: "👆" },
  { label: "Linked Lists",            icon: "🔗" },
  { label: "Trees & Graphs",          icon: "🌳" },
  { label: "Dynamic Programming",     icon: "🧮" },
  { label: "Sorting & Searching",     icon: "🔍" },
  { label: "Recursion & Backtracking",icon: "🔄" },
  { label: "Stack & Queue",           icon: "📚" },
  { label: "Binary Search",           icon: "🎯" },
];

const DIFFICULTIES = [
  { label: "Easy",   color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/60" },
  { label: "Medium", color: "text-amber-400   bg-amber-500/10   border-amber-500/30   hover:border-amber-400/60"   },
  { label: "Hard",   color: "text-red-400     bg-red-500/10     border-red-500/30     hover:border-red-400/60"     },
];

const TIMER_OPTIONS = [
  { label: "No Timer", seconds: null },
  { label: "10 min",   seconds: 600  },
  { label: "20 min",   seconds: 1200 },
  { label: "30 min",   seconds: 1800 },
  { label: "45 min",   seconds: 2700 },
];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ─── Markdown-ish renderer for analysis ─── */
function RenderAnalysis({ text }: { text: string }) {
  const lines = text.split("\n");
  let inCodeBlock = false;
  let codeLang = "";
  const codeLines: string[] = [];
  const result: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (/^```(\w*)/.test(line)) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.replace(/^```/, "").trim();
        i++;
        continue;
      }
    }
    if (line.trim() === "```" && inCodeBlock) {
      inCodeBlock = false;
      result.push(
        <div key={i} className="my-3 rounded-xl overflow-hidden border border-white/10">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0d0d14] border-b border-white/8">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            <span className="text-xs text-slate-600 ml-1 font-mono">{codeLang || "code"}</span>
          </div>
          <pre className="bg-[#13131a] px-4 py-3 text-xs text-emerald-300 font-mono overflow-x-auto leading-relaxed scrollbar-thin">
            {codeLines.join("\n")}
          </pre>
        </div>
      );
      codeLines.length = 0;
      codeLang = "";
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      i++;
      continue;
    }

    if (!line.trim()) { result.push(<div key={i} className="h-2" />); i++; continue; }

    // Score line
    if (/\*\*Score:\*\*/i.test(line)) {
      const scoreMatch = line.match(/(\d+)\/10/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
      const color = score != null ? (score >= 8 ? "text-emerald-400" : score >= 5 ? "text-amber-400" : "text-red-400") : "text-white";
      result.push(
        <div key={i} className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-white/3 border border-white/8">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Score</span>
          <span className={`text-2xl font-extrabold ${color}`}>{score ?? "?"}<span className="text-slate-600 text-base font-normal">/10</span></span>
          {score != null && (
            <span className={`ml-auto text-xs font-bold px-3 py-1.5 rounded-full border ${
              score >= 8 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : score >= 5 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                : "text-red-400 bg-red-500/10 border-red-500/20"
            }`}>
              {score >= 8 ? "Excellent 🎉" : score >= 5 ? "Good Work 👍" : "Keep Practicing 💪"}
            </span>
          )}
        </div>
      );
      i++; continue;
    }

    // Section header **...**
    if (/^\*\*(.+)\*\*:?\s*$/.test(line.trim())) {
      const heading = line.trim().replace(/^\*\*|\*\*:?\s*$/g, "");
      result.push(
        <p key={i} className="text-sm font-bold text-white mt-4 first:mt-0">{heading}</p>
      );
      i++; continue;
    }

    // **Verdict:** special
    if (/^\*\*Verdict:\*\*/.test(line)) {
      const verdict = line.replace(/^\*\*Verdict:\*\*\s*/i, "");
      const isCorrect = /correct ✅/i.test(verdict);
      const isPartial = /partially/i.test(verdict);
      result.push(
        <div key={i} className={`mt-2 px-4 py-2.5 rounded-xl border text-sm font-bold ${
          isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : isPartial ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
            : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          Verdict: {verdict}
        </div>
      );
      i++; continue;
    }

    // Bullet point
    if (/^[-•*]\s/.test(line.trim())) {
      const content = line.trim().replace(/^[-•*]\s/, "");
      result.push(
        <div key={i} className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400/60 flex-shrink-0" />
          <span>{renderInline(content)}</span>
        </div>
      );
      i++; continue;
    }

    result.push(
      <p key={i} className="text-sm text-slate-300 leading-relaxed">{renderInline(line)}</p>
    );
    i++;
  }

  return <div className="space-y-1.5">{result}</div>;
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    /^\*\*[^*]+\*\*$/.test(part)
      ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

/* ─── Setup Screen ─── */
function SetupScreen({
  onStart,
  loading,
}: {
  onStart: (lang: string, topic: string, difficulty: string, seconds: number | null) => void;
  loading: boolean;
}) {
  const [lang, setLang]         = useState("");
  const [topic, setTopic]       = useState("");
  const [difficulty, setDiff]   = useState("");
  const [timerSec, setTimerSec] = useState<number | null>(null);

  const isReady = lang && topic && difficulty;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold text-white mb-1">Configure Your Session</h2>
          <p className="text-slate-500 text-sm">Pick your language, topic, and difficulty — then start coding.</p>
        </div>

        {/* Language */}
        <section>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">01 — Language</p>
          <div className="grid grid-cols-3 gap-3">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all cursor-pointer ${
                  lang === l.id
                    ? "bg-violet-600/15 border-violet-500/50 text-white ring-1 ring-violet-500/30"
                    : "bg-white/3 border-white/8 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span className="text-xl">{l.icon}</span>
                <span className="text-sm font-semibold">{l.label}</span>
                {lang === l.id && (
                  <svg className="ml-auto w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Topic */}
        <section>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">02 — Topic</p>
          <div className="grid grid-cols-5 gap-2">
            {TOPICS.map((t) => (
              <button
                key={t.label}
                onClick={() => setTopic(t.label)}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all cursor-pointer ${
                  topic === t.label
                    ? "bg-indigo-600/15 border-indigo-500/50 text-white ring-1 ring-indigo-500/30"
                    : "bg-white/3 border-white/8 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="text-[11px] font-semibold leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty + Timer side by side */}
        <div className="grid grid-cols-2 gap-6">
          <section>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">03 — Difficulty</p>
            <div className="flex gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.label}
                  onClick={() => setDiff(d.label)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${d.color} ${
                    difficulty === d.label ? "ring-2 ring-white/20 scale-105" : ""
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </section>
          <section>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">04 — Timer (optional)</p>
            <div className="flex gap-2">
              {TIMER_OPTIONS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setTimerSec(t.seconds)}
                  className={`flex-1 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    timerSec === t.seconds
                      ? "bg-cyan-600/15 border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/30"
                      : "bg-white/3 border-white/8 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Start button */}
        <button
          onClick={() => isReady && onStart(lang, topic, difficulty, timerSec)}
          disabled={!isReady || loading}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-violet-900/40 active:scale-[0.99] cursor-pointer text-base"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Question…</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>Start Coding Challenge</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function CodingPage({ onBack }: CodingPageProps) {
  const [phase, setPhase]             = useState<CodingPhase>("setup");
  const [question, setQuestion]       = useState<CodingQuestion | null>(null);
  const [selectedLang, setSelectedLang] = useState("javascript");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDiff, setSelectedDiff]   = useState("");
  const [timerSeconds, setTimerSeconds]   = useState<number | null>(null);
  const [code, setCode]               = useState("");
  const [timeLeft, setTimeLeft]       = useState(0);
  const [timeTaken, setTimeTaken]     = useState(0);
  const [loading, setLoading]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [analysis, setAnalysis]       = useState("");
  const [timedOut, setTimedOut]       = useState(false);
  const [activeTab, setActiveTab]     = useState<"problem" | "examples" | "constraints">("problem");

  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef  = useRef<number>(0);
  const firedRef      = useRef(false);
  // Refs to latest mutable values — avoids stale closures without adding deps
  const codeRef         = useRef(code);
  const questionRef     = useRef(question);
  const selectedLangRef = useRef(selectedLang);
  const timerSecondsRef = useRef(timerSeconds);

  useEffect(() => { codeRef.current = code; });
  useEffect(() => { questionRef.current = question; });
  useEffect(() => { selectedLangRef.current = selectedLang; });
  useEffect(() => { timerSecondsRef.current = timerSeconds; });

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current!);
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeTaken(elapsed);
  }, []);

  const triggerSubmit = useCallback(async (auto = false) => {
    const q = questionRef.current;
    if (!q) return;
    if (!auto) stopTimer();
    setSubmitting(true);

    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await fetch("/api/coding/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          code: codeRef.current,
          language: selectedLangRef.current,
          timeTaken: elapsed,
          timerSeconds: timerSecondsRef.current,
        }),
      });
      const data = await res.json();
      setAnalysis(data.analysis ?? "Failed to analyze.");
      setPhase("result");
    } catch {
      setAnalysis("Something went wrong while analyzing your code.");
      setPhase("result");
    } finally {
      setSubmitting(false);
    }
  }, [stopTimer]);

  const handleTimesUp = useCallback(() => {
    setTimedOut(true);
    stopTimer();
    triggerSubmit(true);
  }, [stopTimer, triggerSubmit]);

  const handleTimesUpRef = useRef(handleTimesUp);
  useEffect(() => { handleTimesUpRef.current = handleTimesUp; });

  /* Timer */
  useEffect(() => {
    if (phase !== "coding" || timerSeconds == null) return;
    setTimeLeft(timerSeconds);
    firedRef.current = false;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (!firedRef.current) {
            firedRef.current = true;
            setTimeout(() => handleTimesUpRef.current(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [phase, timerSeconds]);

  const handleStart = useCallback(async (lang: string, topic: string, diff: string, seconds: number | null) => {
    setSelectedLang(lang);
    setSelectedTopic(topic);
    setSelectedDiff(diff);
    setTimerSeconds(seconds);
    setLoading(true);
    setTimedOut(false);

    try {
      const res = await fetch("/api/coding/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, topic, difficulty: diff }),
      });
      const data = await res.json();
      if (data.question) {
        setQuestion(data.question);
        setCode(data.question.starterCode || "");
        setPhase("coding");
        startTimeRef.current = Date.now();
        firedRef.current = false;
      }
    } catch {
      // stay on setup
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = () => {
    clearInterval(timerRef.current!);
    setPhase("setup");
    setQuestion(null);
    setCode("");
    setAnalysis("");
    setScore(null);
    setTimedOut(false);
    setActiveTab("problem");
  };

  const currentLang = LANGUAGES.find((l) => l.id === selectedLang);
  const urgencyPct = timerSeconds && timeLeft > 0 ? (timeLeft / timerSeconds) * 100 : 100;
  const urgency = urgencyPct > 50 ? "safe" : urgencyPct > 20 ? "warning" : "danger";
  const urgencyColor = urgency === "safe" ? "text-emerald-400" : urgency === "warning" ? "text-amber-400" : "text-red-400";
  const timerRingColor = urgency === "safe" ? "#34d399" : urgency === "warning" ? "#fbbf24" : "#f87171";

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      {/* ─── Top Bar ─── */}
      <header className="relative z-10 flex-shrink-0 border-b border-white/5 bg-[#0d0d14]/90 backdrop-blur px-6 py-3 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition-colors cursor-pointer group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Home
        </button>
        <span className="text-white/10">│</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white/90">Coding Practice</span>
        </div>

        {phase === "coding" && question && (
          <>
            <span className="text-white/10">│</span>
            <span className="text-sm font-semibold text-white">{question.title}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              selectedDiff === "Easy" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : selectedDiff === "Medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                : "text-red-400 bg-red-500/10 border-red-500/20"
            }`}>{selectedDiff}</span>
            {selectedTopic && (
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <span className="text-slate-700">·</span>{selectedTopic}
              </span>
            )}
            <span className="text-xs text-slate-600 flex items-center gap-1.5">
              {currentLang?.icon} {currentLang?.label}
            </span>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          {/* Timer */}
          {phase === "coding" && timerSeconds && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              urgency === "safe" ? "border-emerald-500/20 bg-emerald-500/5"
                : urgency === "warning" ? "border-amber-500/20 bg-amber-500/5"
                : "border-red-500/30 bg-red-500/10 animate-pulse"
            }`}>
              <svg className="w-3.5 h-3.5" style={{ color: timerRingColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-sm font-mono font-bold tabular-nums ${urgencyColor}`}>
                {fmt(timeLeft)}
              </span>
            </div>
          )}
          {phase === "coding" && timerSeconds == null && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No timer
            </div>
          )}

          {phase === "coding" && (
            <>
              <button
                onClick={handleReset}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/3 hover:bg-white/8 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                New Question
              </button>
              <button
                onClick={() => triggerSubmit(false)}
                disabled={submitting}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-violet-900/40 active:scale-[0.98] cursor-pointer"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit Code
                  </>
                )}
              </button>
            </>
          )}

          {phase === "result" && (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all shadow-lg cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Another
              </button>
            </>
          )}
        </div>
      </header>

      {/* ─── Body ─── */}
      <div className="relative z-10 flex-1 flex min-h-0">

        {/* ── Setup ── */}
        {phase === "setup" && (
          <SetupScreen onStart={handleStart} loading={loading} />
        )}

        {/* ── Coding + Result: two-panel layout ── */}
        {(phase === "coding" || phase === "result") && question && (
          <>
            {/* Left: Question Panel */}
            <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0d0d14]/60">
              {/* Timed-out banner */}
              {timedOut && (
                <div className="flex-shrink-0 bg-red-500/10 border-b border-red-500/20 px-4 py-2.5 flex items-center gap-2">
                  <span className="text-sm">⏰</span>
                  <p className="text-xs text-red-300 font-semibold">Time's up — your code was auto-submitted</p>
                </div>
              )}

              {/* Tabs */}
              <div className="flex-shrink-0 flex border-b border-white/5">
                {(["problem", "examples", "constraints"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-xs font-semibold capitalize transition-all cursor-pointer ${
                      activeTab === tab
                        ? "text-white border-b-2 border-violet-500"
                        : "text-slate-600 hover:text-slate-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin space-y-4">
                {activeTab === "problem" && (
                  <>
                    <div>
                      <h2 className="text-base font-extrabold text-white mb-1">{question.title}</h2>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        selectedDiff === "Easy" ? "text-emerald-400 bg-emerald-500/10"
                          : selectedDiff === "Medium" ? "text-amber-400 bg-amber-500/10"
                          : "text-red-400 bg-red-500/10"
                      }`}>{selectedDiff}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{question.description}</p>
                  </>
                )}

                {activeTab === "examples" && (
                  <div className="space-y-4">
                    {question.examples.map((ex, i) => (
                      <div key={i} className="rounded-xl border border-white/8 overflow-hidden">
                        <div className="px-3 py-2 bg-white/3 border-b border-white/5">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Example {i + 1}</span>
                        </div>
                        <div className="px-4 py-3 space-y-2">
                          <div>
                            <span className="text-xs text-slate-600 font-semibold">Input: </span>
                            <code className="text-xs text-cyan-300 font-mono">{ex.input}</code>
                          </div>
                          <div>
                            <span className="text-xs text-slate-600 font-semibold">Output: </span>
                            <code className="text-xs text-emerald-300 font-mono">{ex.output}</code>
                          </div>
                          {ex.explanation && (
                            <p className="text-xs text-slate-400 leading-relaxed">
                              <span className="font-semibold">Explanation: </span>{ex.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "constraints" && (
                  <ul className="space-y-2">
                    {question.constraints.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400/60 flex-shrink-0" />
                        <code className="font-mono text-xs text-slate-300">{c}</code>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Right: Editor or Results */}
            <div className="flex-1 flex flex-col min-w-0">
              {phase === "coding" && (
                <>
                  {/* Editor toolbar */}
                  <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-[#0d0d14]/60">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500/60" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                    </div>
                    <span className="text-xs font-mono text-slate-500">solution.{selectedLang === "cpp" ? "cpp" : selectedLang === "java" ? "java" : selectedLang === "python" ? "py" : selectedLang === "go" ? "go" : selectedLang === "typescript" ? "ts" : "js"}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <select
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="text-xs bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-500/50 cursor-pointer"
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.id} value={l.id} className="bg-[#0d0d14]">{l.icon} {l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Monaco Editor */}
                  <div className="flex-1 overflow-hidden">
                    <Editor
                      height="100%"
                      language={LANGUAGES.find((l) => l.id === selectedLang)?.monaco ?? "javascript"}
                      value={code}
                      onChange={(val) => setCode(val ?? "")}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        renderLineHighlight: "all",
                        cursorBlinking: "smooth",
                        smoothScrolling: true,
                        padding: { top: 16, bottom: 16 },
                        wordWrap: "on",
                        tabSize: 2,
                        bracketPairColorization: { enabled: true },
                      }}
                    />
                  </div>

                  {/* Bottom bar */}
                  <div className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 border-t border-white/5 bg-[#0d0d14]/60">
                    <p className="text-xs text-slate-600">{code.split("\n").length} lines · {code.length} chars</p>
                    {submitting ? (
                      <p className="text-xs text-violet-400 flex items-center gap-1.5">
                        <span className="w-3 h-3 border border-violet-400/50 border-t-violet-400 rounded-full animate-spin" />
                        Analyzing your solution…
                      </p>
                    ) : (
                      <p className="text-xs text-slate-600">Ctrl+S or press Submit when ready</p>
                    )}
                  </div>
                </>
              )}

              {phase === "result" && (
                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
                  <div className="max-w-2xl space-y-2">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                        <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Code Review</h3>
                        <p className="text-xs text-slate-500">
                          {timeTaken > 0 ? `Completed in ${fmt(timeTaken)}` : "Submitted"}
                          {timedOut ? " · ⏰ Auto-submitted" : ""}
                        </p>
                      </div>
                    </div>
                    <RenderAnalysis text={analysis} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
