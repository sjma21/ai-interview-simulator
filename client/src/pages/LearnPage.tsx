import { useRef, useState, useEffect } from "react";
import { useLearn } from "../hooks/useLearn";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import LoadingIndicator from "../components/LoadingIndicator";
import EndInterviewModal from "../components/EndInterviewModal";
import TimerDisplay from "../components/TimerDisplay";
import { useTimer } from "../hooks/useTimer";

const timerOptions = [
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
  { label: "3 min", seconds: 180 },
];

interface LearnPageProps {
  onBack: () => void;
}

function UploadScreen({
  onUpload,
  loading,
  loadingText,
  pdfMeta,
  fileName,
  onStart,
  timerEnabled,
  setTimerEnabled,
  timerSeconds,
  setTimerSeconds,
}: {
  onUpload: (f: File) => void;
  loading: boolean;
  loadingText: string;
  pdfMeta: { title: string; topics: string[]; summary: string } | null;
  fileName: string;
  onStart: () => void;
  timerEnabled: boolean;
  setTimerEnabled: (v: boolean) => void;
  timerSeconds: number;
  setTimerSeconds: (v: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file.type === "application/pdf") onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col relative overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-80 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-600/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Learn with AI · PDF Mode
            </span>
          </div>

          <h1 className="text-center text-4xl font-extrabold mb-3 tracking-tight">
            <span className="text-white">Upload &amp; </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Get Quizzed</span>
          </h1>
          <p className="text-center text-slate-400 text-base mb-10 max-w-sm mx-auto leading-relaxed">
            Upload any PDF — notes, textbooks, articles — and AI will test your understanding with targeted questions.
          </p>

          {!pdfMeta ? (
            /* Drop zone */
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !loading && inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200 cursor-pointer ${
                dragging
                  ? "border-emerald-400/60 bg-emerald-500/10"
                  : loading
                  ? "border-white/10 bg-white/[0.02] cursor-wait"
                  : "border-white/10 bg-white/[0.02] hover:border-emerald-500/40 hover:bg-emerald-500/5"
              }`}
            >
              <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

              {loading ? (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                  <p className="text-sm text-emerald-300 font-medium">{loadingText}</p>
                  <p className="text-xs text-slate-600">This may take a few seconds...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">Drop your PDF here</p>
                    <p className="text-slate-500 text-sm">or <span className="text-emerald-400 underline underline-offset-2">click to browse</span></p>
                  </div>
                  <p className="text-xs text-slate-700">PDF only · Max 10 MB</p>
                </div>
              )}
            </div>
          ) : (
            /* PDF preview after upload */
            <div className="space-y-4">
              <div className="bg-[#13131a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-base leading-tight mb-0.5">{pdfMeta.title}</p>
                      <p className="text-xs text-slate-500 truncate">{fileName}</p>
                    </div>
                    <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">Ready</span>
                  </div>

                  {pdfMeta.summary && (
                    <p className="text-xs text-slate-400 leading-relaxed mb-4 border-l-2 border-emerald-500/30 pl-3">{pdfMeta.summary}</p>
                  )}

                  {pdfMeta.topics.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">Topics Detected</p>
                      <div className="flex flex-wrap gap-2">
                        {pdfMeta.topics.map((t) => (
                          <span key={t} className="text-xs bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { value: "5", label: "Questions" },
                  { value: "AI", label: "Evaluated" },
                  { value: "10", label: "Max Score" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.03] border border-white/8 rounded-xl py-3">
                    <p className="text-lg font-extrabold text-white">{s.value}</p>
                    <p className="text-xs text-slate-600 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Timer toggle */}
              <div className={`rounded-2xl border transition-all overflow-hidden ${timerEnabled ? "border-orange-500/30 bg-orange-500/5" : "border-white/8 bg-white/[0.02]"}`}>
                <button onClick={() => setTimerEnabled(!timerEnabled)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${timerEnabled ? "bg-orange-500/20 border border-orange-500/30" : "bg-white/5 border border-white/10"}`}>
                      <svg className={`w-4 h-4 ${timerEnabled ? "text-orange-400" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${timerEnabled ? "text-orange-300" : "text-slate-400"}`}>Time Pressure Mode</p>
                      <p className="text-xs text-slate-600">Countdown timer per question</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-all duration-300 relative ${timerEnabled ? "bg-orange-500" : "bg-white/10"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${timerEnabled ? "left-5" : "left-0.5"}`} />
                  </div>
                </button>
                {timerEnabled && (
                  <div className="px-4 pb-3 flex items-center gap-2">
                    <p className="text-xs text-slate-500 mr-1">Time per question:</p>
                    {timerOptions.map((opt) => (
                      <button key={opt.seconds} onClick={() => setTimerSeconds(opt.seconds)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${timerSeconds === opt.seconds ? "bg-orange-500/20 border-orange-500/40 text-orange-300" : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={onStart}
                className="group w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-2xl transition-all text-base shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Start Learning Session</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              <button
                onClick={() => onUpload(new File([], ""))}
                className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors py-1 cursor-pointer"
              >
                ← Upload a different PDF
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LearnPage({ onBack }: LearnPageProps) {
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);

  const {
    state,
    totalQuestions,
    lastMessageIsQuestion,
    lastMessageIsFeedback,
    isLastQuestion,
    hintUsedThisQuestion,
    hintLoading,
    uploadPdf,
    startSession,
    submitAnswer,
    requestHint,
    nextQuestion,
    endSession,
    reset,
  } = useLearn();

  const bottomRef = useRef<HTMLDivElement>(null);
  const [showEndModal, setShowEndModal] = useState(false);

  const { reset: resetTimer, ...timer } = useTimer({
    duration: timerEnabled ? timerSeconds : null,
    active: lastMessageIsQuestion && !state.loading,
    onExpire: () => submitAnswer("⏰ Time's up! I ran out of time for this question."),
  });

  useEffect(() => { resetTimer(); }, [state.questionNumber, resetTimer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.loading]);

  const handleBack = () => {
    reset();
    onBack();
  };

  /* ── Upload & preview screen ── */
  if (state.phase === "upload") {
    return (
      <div className="relative">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="fixed top-5 left-6 z-50 flex items-center gap-1.5 text-xs text-slate-500 hover:text-white bg-white/5 border border-white/10 px-3 py-2 rounded-xl transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <UploadScreen
          onUpload={uploadPdf}
          loading={state.loading}
          loadingText={state.loadingText}
          pdfMeta={state.pdfMeta}
          fileName={state.fileName}
          onStart={startSession}
          timerEnabled={timerEnabled}
          setTimerEnabled={setTimerEnabled}
          timerSeconds={timerSeconds}
          setTimerSeconds={setTimerSeconds}
        />
      </div>
    );
  }

  /* ── End screen ── */
  if (state.phase === "end") {
    const total = state.scores.reduce((a, b) => a + b, 0);
    const avg = state.scores.length > 0 ? (total / state.scores.length).toFixed(1) : "0";
    const avgNum = parseFloat(avg);
    const badgeLabel = avgNum >= 8 ? "Excellent" : avgNum >= 6 ? "Good" : avgNum >= 4 ? "Decent" : "Keep Studying";
    const badgeColor = avgNum >= 8 ? "text-emerald-400" : avgNum >= 6 ? "text-indigo-400" : avgNum >= 4 ? "text-amber-400" : "text-red-400";

    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col relative overflow-hidden">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-80 bg-emerald-600/8 rounded-full blur-3xl" />
        </div>
        <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-xs font-bold">AI</div>
            <span className="text-sm font-semibold text-white/80">Learn with AI</span>
          </div>
          <span className="text-xs text-slate-600">Session Complete</span>
        </nav>
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md space-y-5">
            <div className="bg-[#13131a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="p-7 text-center">
                <p className="text-5xl mb-3">{avgNum >= 8 ? "🎓" : avgNum >= 6 ? "📖" : avgNum >= 4 ? "✏️" : "📚"}</p>
                <h1 className={`text-3xl font-black mb-1 ${badgeColor}`}>{badgeLabel}</h1>
                <p className="text-slate-500 text-sm mb-6">{state.pdfMeta?.title ?? "PDF Session"}</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/[0.03] border border-white/8 rounded-xl py-3">
                    <p className={`text-2xl font-extrabold ${badgeColor}`}>{total}<span className="text-slate-600 text-sm">/{state.scores.length * 10}</span></p>
                    <p className="text-xs text-slate-600 uppercase tracking-widest mt-0.5">Total</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/8 rounded-xl py-3">
                    <p className={`text-2xl font-extrabold ${badgeColor}`}>{avg}<span className="text-slate-600 text-sm">/10</span></p>
                    <p className="text-xs text-slate-600 uppercase tracking-widest mt-0.5">Average</p>
                  </div>
                </div>
                <div className="space-y-2 mb-6 text-left">
                  {state.scores.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-slate-600 w-5">Q{i + 1}</span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s >= 8 ? "bg-emerald-500" : s >= 5 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${s * 10}%` }} />
                      </div>
                      <span className={`text-xs font-bold w-6 text-right ${s >= 8 ? "text-emerald-400" : s >= 5 ? "text-amber-400" : "text-red-400"}`}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleBack} className="py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold text-slate-300 transition-all cursor-pointer">← Home</button>
              <button onClick={() => { reset(); }} className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-sm font-bold text-white transition-all shadow-lg cursor-pointer">New Session</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Chat session screen ── */
  const lastScore = state.scores[state.scores.length - 1];
  const progressPercent = (state.questionNumber / totalQuestions) * 100;
  const avgScore = state.scores.length > 0 ? (state.scores.reduce((a, b) => a + b, 0) / state.scores.length).toFixed(1) : null;

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-600/8 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-10 w-72 flex-shrink-0 border-r border-white/5 bg-[#0d0d14] flex flex-col">
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-emerald-900/50">AI</div>
            <div>
              <p className="text-sm font-semibold text-white/90">Learn with AI</p>
              <p className="text-xs text-slate-600">PDF Session</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-b border-white/5 space-y-4">
          {state.pdfMeta && (
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3">
              <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-1">Document</p>
              <p className="text-sm font-semibold text-white leading-tight">{state.pdfMeta.title}</p>
              {state.pdfMeta.topics.slice(0, 3).map((t) => (
                <span key={t} className="inline-block text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full mr-1 mt-1">{t}</span>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">Progress</p>
              <p className="text-xs font-bold text-white">{state.questionNumber}<span className="text-slate-600">/{totalQuestions}</span></p>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              {Array.from({ length: totalQuestions }, (_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  i < state.scores.length ? "bg-emerald-600/30 border-emerald-500/50 text-emerald-300"
                  : i === state.questionNumber - 1 ? "bg-white/10 border-white/30 text-white"
                  : "bg-white/[0.03] border-white/5 text-slate-700"
                }`}>{i < state.scores.length ? state.scores[i] : i + 1}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-b border-white/5">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-3">Score Tracker</p>
          {state.scores.length === 0 ? (
            <p className="text-xs text-slate-700 italic">No scores yet...</p>
          ) : (
            <div className="space-y-2">
              {state.scores.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 w-5">Q{i + 1}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s >= 8 ? "bg-emerald-500" : s >= 5 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${s * 10}%` }} />
                  </div>
                  <span className={`text-xs font-bold w-5 text-right ${s >= 8 ? "text-emerald-400" : s >= 5 ? "text-amber-400" : "text-red-400"}`}>{s}</span>
                </div>
              ))}
            </div>
          )}
          {avgScore && (
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-slate-600">Average</p>
              <p className="text-sm font-extrabold text-emerald-400">{avgScore}/10</p>
            </div>
          )}
        </div>

        <div className="px-6 py-5 mt-auto space-y-3">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-1">Study Tips</p>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {["Answer from the document", "Be specific with details", "Use key terms", "Explain reasoning"].map((tip) => (
              <li key={tip} className="flex items-start gap-1.5"><span className="text-emerald-600 mt-0.5">›</span><span>{tip}</span></li>
            ))}
          </ul>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={() => setShowEndModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30 text-sm font-semibold text-red-400 transition-all cursor-pointer group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            End Session
          </button>
        </div>
      </aside>

      {/* Main chat */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <header className="flex-shrink-0 border-b border-white/5 bg-[#0d0d14]/80 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-white">
              Question <span className="text-emerald-400">{state.questionNumber}</span>
              <span className="text-slate-600"> of {totalQuestions}</span>
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {state.loading ? state.loadingText : lastMessageIsQuestion ? "Answer based on your PDF" : lastMessageIsFeedback ? "Review feedback" : "Starting session..."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TimerDisplay
              timeLeft={timer.timeLeft}
              pct={timer.pct}
              urgency={timer.urgency}
              enabled={timer.enabled}
            />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-500 font-medium">PDF Session</span>
            </div>
          </div>
        </header>

        {/* Danger banner */}
        {timer.enabled && timer.urgency === "danger" && lastMessageIsQuestion && !state.loading && (
          <div className="flex-shrink-0 bg-red-500/10 border-b border-red-500/20 px-6 py-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <p className="text-xs text-red-300 font-medium">Only {timer.timeLeft}s left — submit your answer now!</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
          {state.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-medium">Generating your first question...</p>
            </div>
          ) : (
            state.messages.map((msg, idx) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                onHint={
                  msg.type === "question" && idx === state.messages.length - 1 && lastMessageIsQuestion
                    ? requestHint
                    : undefined
                }
                hintUsed={
                  msg.type === "question" && idx === state.messages.length - 1
                    ? hintUsedThisQuestion
                    : undefined
                }
                hintLoading={
                  msg.type === "question" && idx === state.messages.length - 1
                    ? hintLoading
                    : undefined
                }
              />
            ))
          )}

          {state.loading && <LoadingIndicator text={state.loadingText} />}

          {lastMessageIsFeedback && !state.loading && (
            <div className="flex justify-center py-4">
              <div className="bg-[#13131a] border border-white/10 rounded-2xl p-5 max-w-sm w-full shadow-xl text-center">
                {lastScore !== undefined && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">Question Score</p>
                    <p className={`text-4xl font-extrabold ${lastScore >= 8 ? "text-emerald-400" : lastScore >= 5 ? "text-amber-400" : "text-red-400"}`}>
                      {lastScore}<span className="text-slate-600 text-xl font-normal">/10</span>
                    </p>
                  </div>
                )}
                <button
                  onClick={nextQuestion}
                  className="group w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                >
                  {isLastQuestion ? (
                    <><span>View Results</span><span>🎓</span></>
                  ) : (
                    <>
                      <span>Next Question</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
                {!isLastQuestion && <p className="text-xs text-slate-700 mt-2">{totalQuestions - state.questionNumber} question{totalQuestions - state.questionNumber !== 1 ? "s" : ""} remaining</p>}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <ChatInput onSubmit={submitAnswer} disabled={state.loading || !lastMessageIsQuestion} />
      </div>

      {showEndModal && (
        <EndInterviewModal
          questionsAnswered={state.scores.length}
          totalQuestions={totalQuestions}
          scores={state.scores}
          onConfirm={() => { setShowEndModal(false); endSession(); }}
          onCancel={() => setShowEndModal(false)}
        />
      )}
    </div>
  );
}
