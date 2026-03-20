import { useState } from "react";
import type { Domain, Difficulty, InterviewConfig } from "../types";

interface LandingPageProps {
  onStart: (config: InterviewConfig) => void;
  onLearn: () => void;
  onAssistant: () => void;
  onCoding: () => void;
  onRealInterview: () => void;
}

const domains: { value: Domain; icon: string; desc: string; color: string; glow: string }[] = [
  { value: "JavaScript", icon: "⚡", desc: "Closures, async, ES6+",     color: "from-yellow-500/20 to-amber-500/10  border-yellow-500/30  hover:border-yellow-400/70",  glow: "shadow-yellow-500/20" },
  { value: "React.js",   icon: "⚛️", desc: "Hooks, state, lifecycle",   color: "from-cyan-500/20   to-sky-500/10    border-cyan-500/30    hover:border-cyan-400/70",    glow: "shadow-cyan-500/20"   },
  { value: "TypeScript", icon: "🔷", desc: "Types, generics, inference", color: "from-blue-500/20   to-indigo-500/10 border-blue-500/30   hover:border-blue-400/70",    glow: "shadow-blue-500/20"   },
  { value: "Backend",    icon: "⚙️", desc: "APIs, databases, auth",      color: "from-violet-500/20 to-purple-500/10 border-violet-500/30 hover:border-violet-400/70",  glow: "shadow-violet-500/20" },
  { value: "SQL",        icon: "🗄️", desc: "Queries, joins, optimization",color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400/70",glow: "shadow-emerald-500/20"},
  { value: "System Design",icon:"🏗️",desc: "Scalability, architecture",  color: "from-orange-500/20 to-amber-500/10  border-orange-500/30  hover:border-orange-400/70",  glow: "shadow-orange-500/20" },
  { value: "DSA",        icon: "🧩", desc: "Arrays, trees, complexity",  color: "from-pink-500/20   to-rose-500/10   border-pink-500/30    hover:border-pink-400/70",    glow: "shadow-pink-500/20"   },
];

const difficulties = [
  { value: "Easy"   as Difficulty, emoji: "🌱", desc: "Fundamentals",     active: "border-emerald-400 bg-emerald-500/10", text: "text-emerald-400", ring: "shadow-emerald-500/30" },
  { value: "Medium" as Difficulty, emoji: "🔥", desc: "Real scenarios",   active: "border-amber-400   bg-amber-500/10",   text: "text-amber-400",   ring: "shadow-amber-500/30"   },
  { value: "Hard"   as Difficulty, emoji: "💀", desc: "Senior-level",     active: "border-red-400     bg-red-500/10",     text: "text-red-400",     ring: "shadow-red-500/30"     },
];

const timerOptions = [
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
  { label: "3 min", seconds: 180 },
];


export default function LandingPage({ onStart, onLearn, onAssistant, onCoding, onRealInterview }: LandingPageProps) {
  const [domain, setDomain] = useState<Domain>("JavaScript");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);

  const selectedDomain = domains.find((d) => d.value === domain)!;
  const selectedDiff = difficulties.find((d) => d.value === difficulty)!;

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">

      {/* ── Animated background ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Primary glow orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/12 blur-[120px] animate-float-slow" />
        <div className="absolute top-[10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[5%] left-[20%] w-[400px] h-[400px] rounded-full bg-cyan-600/8 blur-[90px] animate-float-slow" style={{ animationDelay: "4s" }} />
        <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-emerald-600/8 blur-[80px] animate-float" style={{ animationDelay: "1s" }} />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_40%,#050508_100%)]" />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-900/60">
              AI
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#050508]" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-wide">InterviewSim</span>
            <span className="text-xs text-slate-600 block leading-none">Pro</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/8 rounded-2xl px-2 py-1.5">
          {["Interview", "Learn", "Assistant", "Code"].map((item) => (
            <span key={item} className="text-xs text-slate-500 px-3 py-1.5 rounded-xl hover:bg-white/5 hover:text-slate-300 transition-all cursor-default">{item}</span>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-xs text-emerald-300 font-medium">AI Online</span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-10 pb-16">

        {/* Top badge */}
        <div className="inline-flex items-center gap-2.5 bg-white/[0.05] border border-white/10 rounded-full px-5 py-2 mb-8 animate-fade-up backdrop-blur-sm">
          <span className="text-xs">✦</span>
          <span className="text-xs text-slate-300 font-medium tracking-wide">AI-Powered · Real Interview Experience · Instant Feedback</span>
          <span className="text-xs">✦</span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up text-6xl sm:text-7xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-6" style={{ animationDelay: "0.1s" }}>
          <span className="block text-white">Master</span>
          <span className="block" style={{
            background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 25%, #c084fc 50%, #67e8f9 80%, #34d399 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "gradient-shift 5s ease infinite",
          }}>
            Technical
          </span>
          <span className="block text-white">Interviews.</span>
        </h1>

        <p className="animate-fade-up text-slate-400 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10" style={{ animationDelay: "0.2s" }}>
          Practice with a relentless AI interviewer. Get ruthlessly scored, deeply evaluated,
          and coached to land your <span className="text-white font-semibold">dream role</span>.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up flex flex-col sm:flex-row items-center gap-4 mb-12" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={() => document.getElementById("configure")?.scrollIntoView({ behavior: "smooth" })}
            className="group relative overflow-hidden flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-8 py-4 rounded-2xl text-base shadow-2xl shadow-indigo-900/60 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span className="relative z-10">Start Interview</span>
            <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-2 text-slate-400 hover:text-white font-semibold px-6 py-4 rounded-2xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] transition-all text-sm cursor-pointer"
          >
            Explore Features
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Stats pills */}
        <div className="animate-fade-up flex flex-wrap justify-center gap-3 mb-10" style={{ animationDelay: "0.4s" }}>
          {[
            { icon: "🎯", label: "7 Interview Domains" },
            { icon: "📊", label: "Scored 0–10" },
            { icon: "🤖", label: "GPT-Powered AI" },
            { icon: "🎙️", label: "Voice Enabled" },
            { icon: "⏱️", label: "Time Pressure Mode" },
            { icon: "💡", label: "Hint System" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 bg-white/[0.04] border border-white/8 rounded-full px-4 py-2 text-xs text-slate-400 hover:border-white/20 hover:text-slate-200 transition-all">
              <span>{s.icon}</span>
              <span className="font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Mock Interview Window ── */}
        <div className="animate-fade-up w-full max-w-2xl mx-auto hidden md:block" style={{ animationDelay: "0.5s" }}>
          {/* Browser chrome */}
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] bg-[#0a0a14]">

            {/* Title bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#0d0d1a]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-500 font-mono">interviewsim.ai · JavaScript · Medium</span>
                </div>
              </div>
              <div className="text-xs text-slate-600 font-semibold">Question 2 of 5</div>
            </div>

            {/* Chat area */}
            <div className="px-5 py-4 space-y-3">

              {/* AI question bubble */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black">AI</div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-xs">
                  <p className="text-xs text-slate-200 leading-relaxed">Can you explain how event delegation works in JavaScript and why it's beneficial?</p>
                </div>
              </div>

              {/* User answer bubble */}
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">U</div>
                <div className="bg-indigo-600/15 border border-indigo-500/20 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs">
                  <p className="text-xs text-slate-200 leading-relaxed">Event delegation means attaching one listener to a parent instead of each child, using bubbling to catch events efficiently…</p>
                </div>
              </div>

              {/* AI feedback bubble */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black">AI</div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-sm">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-emerald-400">Score: 9/10</span>
                    <span className="text-xs text-emerald-300/60">· Strong Answer ✓</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">Excellent! You correctly described the bubbling mechanism. Consider also mentioning performance benefits with dynamic elements.</p>
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-t border-white/[0.06] bg-[#0d0d1a]">
              <div className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2 text-xs text-slate-600">
                Type your answer or use voice…
              </div>
              <button className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19c-4.3 0-8-3.6-8-8m8 8v2m0-2c4.3 0 8-3.6 8-8M8 12a4 4 0 118 0" />
                </svg>
              </button>
              <button className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Static badges below the window */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3.5 py-1.5 text-xs text-slate-500">
              <span className="text-emerald-400">●</span> Real-time scoring
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3.5 py-1.5 text-xs text-slate-500">
              <span className="text-indigo-400">●</span> Voice enabled
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3.5 py-1.5 text-xs text-slate-500">
              <span className="text-violet-400">●</span> Instant feedback
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-slate-600 uppercase tracking-[0.3em] font-semibold mb-3">Everything You Need</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Five Powerful Tools</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">Each tool sharpens a different skill — from live interviews to coding to deep learning.</p>
          </div>

          {/* Top row — 3 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

            {/* 1 — Interview Simulator */}
            <div className="group relative flex flex-col bg-gradient-to-b from-indigo-600/25 via-violet-600/15 to-transparent border border-indigo-500/30 hover:border-indigo-400/60 rounded-xl p-5 aspect-square cursor-default hover:shadow-2xl hover:shadow-indigo-500/15 hover:-translate-y-1 transition-all duration-200 overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-md border bg-indigo-500/20 border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-indigo-500/20 border-indigo-500/30 text-indigo-300">Active</span>
              </div>
              {/* Visual: mock score + chat bubbles */}
              <div className="flex-1 flex flex-col justify-center gap-2 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 bg-white/[0.06] border border-white/[0.08] rounded-sm px-2 flex items-center gap-1.5 text-[10px] text-slate-400 w-full"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />Can you explain closures?</div>
                </div>
                <div className="flex justify-end">
                  <div className="h-6 bg-indigo-500/15 border border-indigo-500/20 rounded-sm px-2 flex items-center text-[10px] text-slate-300 max-w-[85%]">A closure captures outer scope…</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-auto bg-emerald-500/10 border border-emerald-500/20 rounded-sm px-2 py-1.5 flex flex-col gap-0.5 w-full">
                    <span className="text-[10px] font-bold text-emerald-400">Score: 9/10 ✓</span>
                    <span className="text-[9px] text-slate-500">Strong use of lexical scope</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white mb-0.5">Interview Simulator</h3>
                <div className="flex flex-wrap gap-1">
                  {["7 Domains","5 Questions","Scored 0–10"].map(p => <span key={p} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/[0.06] border border-white/[0.08] text-slate-500">{p}</span>)}
                </div>
              </div>
              <svg className="absolute bottom-4 right-4 w-3.5 h-3.5 text-slate-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </div>

            {/* 2 — Learn with AI */}
            <div onClick={onLearn} className="group relative flex flex-col bg-gradient-to-b from-emerald-600/25 via-teal-600/15 to-transparent border border-emerald-500/30 hover:border-emerald-400/60 rounded-xl p-5 aspect-square cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/15 hover:-translate-y-1 transition-all duration-200 overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-md border bg-emerald-500/20 border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-500/20 border-emerald-500/30 text-emerald-300">New</span>
              </div>
              {/* Visual: PDF doc mock */}
              <div className="flex-1 flex items-center justify-center py-2">
                <div className="w-full max-w-[120px] bg-white/[0.04] border border-white/[0.08] rounded-md p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-6 bg-emerald-500/20 border border-emerald-500/30 rounded-sm flex items-center justify-center">
                      <span className="text-[7px] font-black text-emerald-400">PDF</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 bg-white/10 rounded-full w-full" />
                      <div className="h-1.5 bg-white/10 rounded-full w-3/4" />
                    </div>
                  </div>
                  {[100,80,90,60].map((w,i) => <div key={i} className="h-1 bg-emerald-500/20 rounded-full" style={{width:`${w}%`}} />)}
                  <div className="pt-1 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[8px] text-emerald-400">AI analysing…</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white mb-0.5">Learn with AI</h3>
                <div className="flex flex-wrap gap-1">
                  {["PDF Upload","Smart Q&A","Timer Mode"].map(p => <span key={p} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/[0.06] border border-white/[0.08] text-slate-500">{p}</span>)}
                </div>
              </div>
              <svg className="absolute bottom-4 right-4 w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </div>

            {/* 3 — AI Study Assistant */}
            <div onClick={onAssistant} className="group relative flex flex-col bg-gradient-to-b from-violet-600/25 via-purple-600/15 to-transparent border border-violet-500/30 hover:border-violet-400/60 rounded-xl p-5 aspect-square cursor-pointer hover:shadow-2xl hover:shadow-violet-500/15 hover:-translate-y-1 transition-all duration-200 overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-md border bg-violet-500/20 border-violet-500/30 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-violet-500/20 border-violet-500/30 text-violet-300">New</span>
              </div>
              {/* Visual: study roadmap */}
              <div className="flex-1 flex flex-col justify-center gap-1.5 py-2">
                {[
                  { label: "Week 1 · DSA Basics", done: true, color: "bg-violet-400" },
                  { label: "Week 2 · System Design", done: true, color: "bg-violet-400" },
                  { label: "Week 3 · Behavioural", done: false, color: "bg-white/10" },
                  { label: "Week 4 · Mock Interviews", done: false, color: "bg-white/10" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-sm flex-shrink-0 ${step.color}`} />
                    <span className={`text-[10px] ${step.done ? "text-slate-300" : "text-slate-600"}`}>{step.label}</span>
                    {step.done && <span className="ml-auto text-[9px] text-violet-400">✓</span>}
                  </div>
                ))}
                <div className="mt-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white mb-0.5">AI Study Assistant</h3>
                <div className="flex flex-wrap gap-1">
                  {["Study Roadmap","Text Explainer","Follow-up Chat"].map(p => <span key={p} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/[0.06] border border-white/[0.08] text-slate-500">{p}</span>)}
                </div>
              </div>
              <svg className="absolute bottom-4 right-4 w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </div>
          </div>

          {/* Bottom row — 2 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* 4 — Coding Practice */}
            <div onClick={onCoding} className="group relative flex flex-col bg-gradient-to-b from-cyan-600/25 via-teal-600/15 to-transparent border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl p-5 aspect-square cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/15 hover:-translate-y-1 transition-all duration-200 overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-md border bg-cyan-500/20 border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-cyan-500/20 border-cyan-500/30 text-cyan-300">New</span>
              </div>
              {/* Visual: mini code editor */}
              <div className="flex-1 flex items-center justify-center py-3">
                <div className="w-full bg-[#0a0a14] border border-white/[0.08] rounded-md overflow-hidden">
                  <div className="flex items-center gap-1 px-2 py-1.5 border-b border-white/[0.06] bg-white/[0.02]">
                    <span className="w-2 h-2 rounded-full bg-red-500/60" /><span className="w-2 h-2 rounded-full bg-amber-500/60" /><span className="w-2 h-2 rounded-full bg-emerald-500/60" />
                    <span className="ml-1 text-[9px] text-slate-600 font-mono">solution.js</span>
                  </div>
                  <div className="px-3 py-2 font-mono space-y-0.5">
                    <div className="text-[9px]"><span className="text-violet-400">function </span><span className="text-cyan-300">twoSum</span><span className="text-white/50">(nums, target) {"{"}</span></div>
                    <div className="text-[9px] pl-3"><span className="text-violet-400">const </span><span className="text-white/50">map = {"{}"};</span></div>
                    <div className="text-[9px] pl-3"><span className="text-violet-400">for </span><span className="text-white/50">(let i = 0…) {"{"}</span></div>
                    <div className="text-[9px] pl-6 text-emerald-400/70">// O(n) solution</div>
                    <div className="text-[9px] pl-3 text-white/50">{"}"}</div>
                    <div className="text-[9px] text-white/50">{"}"}</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white mb-0.5">Coding Practice</h3>
                <div className="flex flex-wrap gap-1">
                  {["6 Languages","Monaco Editor","AI Code Review","Timed"].map(p => <span key={p} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/[0.06] border border-white/[0.08] text-slate-500">{p}</span>)}
                </div>
              </div>
              <svg className="absolute bottom-4 right-4 w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </div>

            {/* 5 — Real Voice Interview */}
            <div onClick={onRealInterview} className="group relative flex flex-col bg-gradient-to-b from-red-600/25 via-rose-600/15 to-transparent border border-red-500/30 hover:border-red-400/60 rounded-xl p-5 aspect-square cursor-pointer hover:shadow-2xl hover:shadow-red-500/15 hover:-translate-y-1 transition-all duration-200 overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-md border bg-red-500/20 border-red-500/30 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-red-500/20 border-red-500/30 text-red-300">🔴 Live</span>
              </div>
              {/* Visual: voice waveform + avatar */}
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2">
                {/* AI avatar circle */}
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-red-600/40 to-rose-600/40 border border-red-500/40 flex items-center justify-center">
                  <span className="text-xl font-black text-red-300">AI</span>
                  <span className="absolute -inset-1 rounded-full border border-red-500/20 animate-ping" />
                </div>
                {/* Waveform bars */}
                <div className="flex items-end gap-1 h-8">
                  {[3,6,10,7,12,5,9,4,11,6,8,3,10,7,5].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-400/60 rounded-full"
                      style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-red-400/70 font-medium tracking-wide">● Speaking…</span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white mb-0.5">Real Voice Interview</h3>
                <div className="flex flex-wrap gap-1">
                  {["Voice-First","AI Speaks","Auto-Listen","Live Score"].map(p => <span key={p} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/[0.06] border border-white/[0.08] text-slate-500">{p}</span>)}
                </div>
              </div>
              <svg className="absolute bottom-4 right-4 w-3.5 h-3.5 text-slate-600 group-hover:text-red-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONFIGURE ── */}
      <section id="configure" className="relative z-10 px-6 pb-24">
        <div className="max-w-3xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-10">
            <p className="text-xs text-slate-600 uppercase tracking-[0.3em] font-semibold mb-3">Interview Simulator</p>
            <h2 className="text-3xl font-extrabold text-white mb-2">Configure Your Session</h2>
            <p className="text-slate-500 text-sm">Choose your domain and difficulty, then step into the interview room.</p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-3xl p-8 shadow-2xl shadow-black/60 space-y-8">

            {/* Domain */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-black text-indigo-400">1</span>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Choose Domain</p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {domains.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDomain(d.value)}
                    className={`group relative flex flex-col items-start gap-1.5 p-3.5 rounded-2xl border bg-gradient-to-br transition-all duration-200 cursor-pointer shadow-lg ${d.color} ${d.glow} ${
                      domain === d.value
                        ? "ring-2 ring-white/25 scale-[1.03] brightness-115 shadow-lg"
                        : "opacity-60 hover:opacity-100 hover:scale-[1.01]"
                    }`}
                  >
                    {domain === d.value && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/80 shadow-sm" />
                    )}
                    <span className="text-2xl">{d.icon}</span>
                    <span className="text-sm font-bold text-white leading-tight">{d.value}</span>
                    <span className="text-[10px] text-slate-400 leading-tight">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Difficulty */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-black text-indigo-400">2</span>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Set Difficulty</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {difficulties.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer shadow-lg ${
                      difficulty === d.value
                        ? `${d.active} shadow-lg ${d.ring} scale-[1.02]`
                        : "bg-white/[0.03] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className="text-2xl">{d.emoji}</span>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${difficulty === d.value ? d.text : "text-slate-300"}`}>{d.value}</p>
                      <p className="text-xs text-slate-500">{d.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Time Pressure */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-black text-indigo-400">3</span>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Time Pressure <span className="text-slate-600 normal-case tracking-normal">(optional)</span></p>
              </div>
              <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${timerEnabled ? "border-orange-500/30 bg-orange-500/[0.05]" : "border-white/8 bg-white/[0.02]"}`}>
                <button
                  onClick={() => setTimerEnabled(!timerEnabled)}
                  className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${timerEnabled ? "bg-orange-500/20 border border-orange-500/30" : "bg-white/5 border border-white/10"}`}>
                      <svg className={`w-4.5 h-4.5 ${timerEnabled ? "text-orange-400" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${timerEnabled ? "text-orange-300" : "text-slate-400"}`}>⚡ Time Pressure Mode</p>
                      <p className="text-xs text-slate-600">Countdown timer per question — adds real pressure</p>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${timerEnabled ? "bg-orange-500" : "bg-white/10"}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${timerEnabled ? "left-6" : "left-1"}`} />
                  </div>
                </button>
                {timerEnabled && (
                  <div className="px-5 pb-4 flex items-center gap-2.5">
                    <p className="text-xs text-slate-500">Per question:</p>
                    {timerOptions.map((opt) => (
                      <button
                        key={opt.seconds}
                        onClick={() => setTimerSeconds(opt.seconds)}
                        className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                          timerSeconds === opt.seconds
                            ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                            : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Session Preview */}
            <div className="flex items-center justify-between bg-white/[0.04] border border-white/8 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl">
                  {selectedDomain.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{domain} Interview</p>
                  <p className="text-xs text-slate-500">{selectedDomain.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {timerEnabled && (
                  <div className="flex items-center gap-1.5 text-xs text-orange-400 font-semibold bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {timerOptions.find(t => t.seconds === timerSeconds)?.label}/q
                  </div>
                )}
                <div className="text-right">
                  <p className={`text-sm font-black ${selectedDiff.text}`}>{difficulty}</p>
                  <p className="text-xs text-slate-600">5 questions</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => onStart({ domain, difficulty, timerSeconds: timerEnabled ? timerSeconds : null })}
              className="group w-full relative overflow-hidden flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%] text-white font-black py-5 px-6 rounded-2xl text-lg transition-all shadow-2xl shadow-indigo-900/60 hover:shadow-indigo-500/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer animate-gradient"
            >
              <span className="relative z-10">Enter the Interview Room</span>
              <svg className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-6 pt-2">
              {["Real evaluation rubric", "Instant AI feedback", "Score out of 10"].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-slate-500">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-6 flex items-center justify-between">
        <p className="text-xs text-slate-700">© 2026 InterviewSim Pro · Built with AI</p>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-700">All systems operational</span>
        </div>
      </footer>
    </div>
  );
}
