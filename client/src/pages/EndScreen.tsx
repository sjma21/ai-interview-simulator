interface EndScreenProps {
  scores: number[];
  domain: string;
  difficulty: string;
  onRestart: () => void;
}

interface Badge {
  label: string;
  sublabel: string;
  gradient: string;
  ring: string;
  scoreColor: string;
  barColor: string;
  emoji: string;
}

function getPerformanceBadge(avg: number): Badge {
  if (avg >= 9)
    return {
      label: "Outstanding",
      sublabel: "You're interview-ready!",
      gradient: "from-emerald-500 to-teal-500",
      ring: "ring-emerald-500/30",
      scoreColor: "text-emerald-400",
      barColor: "from-emerald-500 to-teal-400",
      emoji: "🏆",
    };
  if (avg >= 7)
    return {
      label: "Strong",
      sublabel: "Solid performance overall",
      gradient: "from-indigo-500 to-violet-500",
      ring: "ring-indigo-500/30",
      scoreColor: "text-indigo-400",
      barColor: "from-indigo-500 to-violet-400",
      emoji: "🌟",
    };
  if (avg >= 5)
    return {
      label: "Decent",
      sublabel: "Good effort, keep pushing",
      gradient: "from-amber-500 to-orange-500",
      ring: "ring-amber-500/30",
      scoreColor: "text-amber-400",
      barColor: "from-amber-500 to-orange-400",
      emoji: "👍",
    };
  return {
    label: "Needs Work",
    sublabel: "Keep practising daily",
    gradient: "from-red-500 to-rose-500",
    ring: "ring-red-500/30",
    scoreColor: "text-red-400",
    barColor: "from-red-500 to-rose-400",
    emoji: "📚",
  };
}

function getSummaryFeedback(avg: number, domain: string): string {
  if (avg >= 9)
    return `Exceptional ${domain} performance! You demonstrated depth, clarity, and real-world understanding. You're well-prepared for technical interviews.`;
  if (avg >= 7)
    return `Strong ${domain} knowledge shown. You handled most concepts well — refine edge cases and communication to push to the next level.`;
  if (avg >= 5)
    return `Decent foundation in ${domain}. Focus on strengthening fundamentals and practice structuring your answers more clearly.`;
  return `Keep practising ${domain}. Review core concepts daily, study common patterns, and build hands-on projects to solidify your understanding.`;
}

function CircleProgress({ score, max = 10, badge }: { score: number; max?: number; badge: Badge }) {
  const pct = score / max;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={badge.gradient.includes("emerald") ? "#10b981" : badge.gradient.includes("indigo") ? "#6366f1" : badge.gradient.includes("amber") ? "#f59e0b" : "#ef4444"} />
            <stop offset="100%" stopColor={badge.gradient.includes("teal") ? "#14b8a6" : badge.gradient.includes("violet") ? "#8b5cf6" : badge.gradient.includes("orange") ? "#f97316" : "#f43f5e"} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-black ${badge.scoreColor}`}>{score}</span>
        <span className="text-xs text-slate-500 font-medium">/ {max * (1)}</span>
      </div>
    </div>
  );
}

const domainIcons: Record<string, string> = {
  JavaScript: "⚡",
  "React.js": "⚛️",
  TypeScript: "🔷",
  Backend: "⚙️",
  SQL: "🗄️",
  "System Design": "🏗️",
  DSA: "🧩",
};

export default function EndScreen({ scores, domain, difficulty, onRestart }: EndScreenProps) {
  const total = scores.reduce((a, b) => a + b, 0);
  const maxTotal = scores.length * 10;
  const avg = scores.length > 0 ? total / scores.length : 0;
  const avgDisplay = avg.toFixed(1);
  const badge = getPerformanceBadge(avg);
  const feedback = getSummaryFeedback(avg, domain);

  const difficultyColors: Record<string, string> = {
    Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Hard: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden relative">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold">AI</div>
          <span className="text-sm font-semibold text-white/80">InterviewSim</span>
        </div>
        <span className="text-xs text-slate-600">Session Complete</span>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl space-y-6">

          {/* Hero result card */}
          <div className={`bg-[#13131a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ${badge.ring}`}>
            {/* Top gradient bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${badge.gradient}`} />

            <div className="p-8">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                {/* Circle score */}
                <div className="flex-shrink-0">
                  <CircleProgress score={total} max={maxTotal || 10} badge={badge} />
                  <p className="text-center text-xs text-slate-600 mt-2 uppercase tracking-widest">Total Score</p>
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="text-3xl">{badge.emoji}</span>
                    <h1 className="text-3xl font-black text-white">{badge.label}</h1>
                  </div>
                  <p className="text-slate-500 text-sm mb-4">{badge.sublabel}</p>

                  {/* Session meta */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-5">
                    <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                      <span>{domainIcons[domain] ?? "💡"}</span>
                      <span className="text-slate-300 font-medium">{domain}</span>
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${difficultyColors[difficulty] ?? "text-slate-400 bg-white/5 border-white/10"}`}>
                      {difficulty}
                    </span>
                    <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-slate-400">
                      {scores.length} / 5 answered
                    </span>
                  </div>

                  {/* Stat pills */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-center">
                      <p className={`text-2xl font-extrabold ${badge.scoreColor}`}>{avgDisplay}<span className="text-slate-600 text-sm font-normal">/10</span></p>
                      <p className="text-xs text-slate-600 uppercase tracking-widest mt-0.5">Avg Score</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-center">
                      <p className="text-2xl font-extrabold text-white">{scores.filter(s => s >= 7).length}<span className="text-slate-600 text-sm font-normal">/{scores.length}</span></p>
                      <p className="text-xs text-slate-600 uppercase tracking-widest mt-0.5">Strong Ans.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question breakdown */}
              <div className="border-t border-white/5 pt-6">
                <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-4">
                  Question Breakdown
                </p>
                <div className="space-y-3">
                  {scores.map((score, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-slate-500">{i + 1}</span>
                      </div>
                      <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${
                            score >= 8 ? "from-emerald-500 to-teal-400"
                            : score >= 5 ? "from-amber-500 to-orange-400"
                            : "from-red-500 to-rose-400"
                          }`}
                          style={{ width: `${score * 10}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-sm font-extrabold w-6 text-right ${
                          score >= 8 ? "text-emerald-400" : score >= 5 ? "text-amber-400" : "text-red-400"
                        }`}>{score}</span>
                        <span className="text-slate-700 text-xs">/10</span>
                        <span className="text-base">
                          {score >= 8 ? "✅" : score >= 5 ? "🟡" : "❌"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback card */}
          <div className="bg-[#13131a] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">AI Coach Feedback</p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{feedback}</p>
          </div>

          {/* CTA */}
          <button
            onClick={onRestart}
            className="group w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 text-base shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
          >
            <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Start New Interview</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          <p className="text-center text-xs text-slate-700">
            Powered by AI · Results are based on your session answers
          </p>
        </div>
      </main>
    </div>
  );
}
