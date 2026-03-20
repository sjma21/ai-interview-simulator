import { useState, useRef, useEffect, useCallback } from "react";

interface AssistantPageProps {
  onBack: () => void;
}

type Mode = "study-plan" | "explain";
type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

/* ─── Markdown-ish renderer (bold, bullets, headers) ─── */
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        // Headers: **text** at start of line or lines like "Week 1:"
        if (/^\*\*(.+)\*\*:?$/.test(line.trim())) {
          const heading = line.trim().replace(/^\*\*|\*\*:?$/g, "");
          return (
            <p key={i} className="text-white font-bold mt-3 first:mt-0 text-sm">
              {heading}
            </p>
          );
        }
        if (/^Week \d+:/i.test(line.trim()) || /^Day \d+:/i.test(line.trim())) {
          return (
            <p key={i} className="text-indigo-300 font-bold mt-4 first:mt-0 text-sm border-l-2 border-indigo-500/50 pl-3">
              {line.trim()}
            </p>
          );
        }
        // Bullet points
        if (/^[-•*]\s/.test(line.trim())) {
          const content = line.trim().replace(/^[-•*]\s/, "");
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400/70 flex-shrink-0" />
              <span className="text-slate-300">{renderInline(content)}</span>
            </div>
          );
        }
        // Numbered list
        if (/^\d+\.\s/.test(line.trim())) {
          const [num, ...rest] = line.trim().split(/\.\s/);
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 min-w-[20px] text-xs font-bold text-violet-400">{num}.</span>
              <span className="text-slate-300">{renderInline(rest.join(". "))}</span>
            </div>
          );
        }
        return <p key={i} className="text-slate-300">{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    /^\*\*[^*]+\*\*$/.test(part)
      ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

/* ─── Study Plan Form ─── */
const domains = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Structures & Algorithms", "System Design", "React.js Developer",
  "Node.js Developer", "DevOps / Cloud", "Machine Learning", "SQL / Database",
];
const experienceLevels = ["Beginner (0–1 yr)", "Junior (1–2 yrs)", "Mid-level (2–4 yrs)", "Senior (4+ yrs)"];
const hoursOptions = ["1", "2", "3", "4", "5+"];
const weeksOptions = ["2", "4", "6", "8", "12"];

function StudyPlanForm({ onSubmit, loading }: { onSubmit: (d: string, e: string, h: string, w: string) => void; loading: boolean }) {
  const [domain, setDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [experience, setExperience] = useState("");
  const [hours, setHours] = useState("");
  const [weeks, setWeeks] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDomain = domain === "__custom__" ? customDomain : domain;
    if (!finalDomain || !experience || !hours || !weeks) return;
    onSubmit(finalDomain, experience, hours, weeks);
  };

  const isValid = (domain === "__custom__" ? customDomain.trim().length > 0 : domain) && experience && hours && weeks;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="grid grid-cols-1 gap-4">
        {/* Domain */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Target Role / Domain
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full bg-[#0d0d14] border border-white/10 text-sm text-white rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled>Select a role...</option>
            {domains.map((d) => <option key={d} value={d}>{d}</option>)}
            <option value="__custom__">✏️ Custom role...</option>
          </select>
          {domain === "__custom__" && (
            <input
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="e.g. iOS Developer, Blockchain..."
              className="mt-2 w-full bg-[#0d0d14] border border-white/10 text-sm text-white rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-slate-700"
            />
          )}
        </div>

        {/* Experience */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Your Current Experience
          </label>
          <div className="grid grid-cols-2 gap-2">
            {experienceLevels.map((lvl) => (
              <button
                key={lvl} type="button"
                onClick={() => setExperience(lvl)}
                className={`text-xs py-2.5 px-2 sm:px-3 rounded-xl border transition-all text-center font-medium cursor-pointer leading-tight ${
                  experience === lvl
                    ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                    : "bg-white/3 border-white/8 text-slate-500 hover:border-white/20 hover:text-slate-300"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Hours + Weeks side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Hours / Day
            </label>
            <div className="flex gap-1.5">
              {hoursOptions.map((h) => (
                <button
                  key={h} type="button"
                  onClick={() => setHours(h)}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-all font-semibold cursor-pointer ${
                    hours === h
                      ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                      : "bg-white/3 border-white/8 text-slate-500 hover:border-white/20 hover:text-slate-300"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Weeks Available
            </label>
            <div className="flex gap-1.5">
              {weeksOptions.map((w) => (
                <button
                  key={w} type="button"
                  onClick={() => setWeeks(w)}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-all font-semibold cursor-pointer ${
                    weeks === w
                      ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                      : "bg-white/3 border-white/8 text-slate-500 hover:border-white/20 hover:text-slate-300"
                  }`}
                >
                  {w}w
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-900/40 active:scale-[0.98] cursor-pointer"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Building your plan…</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Generate My Study Plan</span>
          </>
        )}
      </button>
    </form>
  );
}

/* ─── Explain Form ─── */
function ExplainForm({ onSubmit, loading }: { onSubmit: (text: string) => void; loading: boolean }) {
  const [text, setText] = useState("");
  const charCount = text.trim().length;

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (charCount >= 10) onSubmit(text.trim()); }}
      className="space-y-4 max-w-2xl"
    >
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Paste your paragraph or technical text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste any technical paragraph, concept, or code snippet here — the AI will explain it in simple terms..."
          rows={6}
          className="w-full bg-[#0d0d14] border border-white/10 text-sm text-slate-200 rounded-xl px-4 py-3.5 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all placeholder:text-slate-700 scrollbar-thin"
        />
        <div className="flex justify-between items-center mt-1.5">
          <p className="text-xs text-slate-700">
            {charCount < 10 && charCount > 0 ? "Need a bit more text…" : charCount >= 10 ? "Ready to explain ✓" : ""}
          </p>
          <p className={`text-xs font-medium ${charCount > 2000 ? "text-amber-500" : "text-slate-700"}`}>
            {charCount} chars
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={charCount < 10 || loading}
        className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-teal-900/40 active:scale-[0.98] cursor-pointer"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Explaining…</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Explain This</span>
          </>
        )}
      </button>
    </form>
  );
}

/* ─── Chat Bubble ─── */
function AssistantBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-5">
        <div className="max-w-[75%]">
          <p className="text-xs text-slate-600 text-right mb-1.5 mr-1 font-medium">You</p>
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-lg shadow-indigo-900/30">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start mb-5">
      <div className="max-w-[88%] w-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">AI Assistant</p>
        </div>
        <div className="bg-[#13131a] border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm shadow-xl">
          <RenderMarkdown text={msg.content} />
        </div>
      </div>
    </div>
  );
}

/* ─── Typing indicator ─── */
function TypingIndicator({ text }: { text: string }) {
  return (
    <div className="flex justify-start mb-5">
      <div className="max-w-[88%]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">AI Assistant</p>
        </div>
        <div className="bg-[#13131a] border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-slate-500 italic">{text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AssistantPage({ onBack }: AssistantPageProps) {
  const [mode, setMode] = useState<Mode>("study-plan");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [followUpInput, setFollowUpInput] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const addMessage = (role: Role, content: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role, content }]);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setMessages([]);
    setHasStarted(false);
    setFollowUpInput("");
  };

  const handleStudyPlan = useCallback(async (domain: string, experience: string, hours: string, weeks: string) => {
    const userMsg = `Generate a study plan for ${domain} | Experience: ${experience} | ${hours} hrs/day | ${weeks} weeks`;
    addMessage("user", userMsg);
    setHasStarted(true);
    setLoading(true);
    setLoadingText("Building your personalized study plan…");

    try {
      const res = await fetch("/api/assistant/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, experience, hoursPerDay: hours, weeks }),
      });
      const data = await res.json();
      addMessage("assistant", data.message ?? data.error);
    } catch {
      addMessage("assistant", "Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  }, []);

  const handleExplain = useCallback(async (text: string) => {
    addMessage("user", text);
    setHasStarted(true);
    setLoading(true);
    setLoadingText("Reading and explaining your text…");

    try {
      const res = await fetch("/api/assistant/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      addMessage("assistant", data.message ?? data.error);
    } catch {
      addMessage("assistant", "Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  }, []);

  const handleFollowUp = useCallback(async () => {
    const msg = followUpInput.trim();
    if (!msg || loading) return;
    setFollowUpInput("");
    addMessage("user", msg);
    setLoading(true);
    setLoadingText("Thinking…");

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, message: msg, mode }),
      });
      const data = await res.json();
      addMessage("assistant", data.message ?? data.error);
    } catch {
      addMessage("assistant", "Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  }, [followUpInput, loading, messages, mode]);

  const modeConfig = {
    "study-plan": {
      label: "Study Plan",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      accent: "violet",
      description: "Get a personalized week-by-week plan tailored to your goals.",
    },
    "explain": {
      label: "Explain Text",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      accent: "cyan",
      description: "Paste any paragraph — the AI explains it in plain English.",
    },
  };

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex overflow-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      {/* ── Sidebar (desktop only) ── */}
      <aside className="relative z-10 w-72 flex-shrink-0 border-r border-white/5 bg-[#0d0d14] hidden md:flex flex-col">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/50">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">AI Study Assistant</p>
              <p className="text-xs text-slate-600">Powered by AI</p>
            </div>
          </div>
        </div>

        {/* Mode switcher */}
        <div className="px-4 py-4 border-b border-white/5 space-y-2">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold px-2 mb-3">Choose Mode</p>
          {(["study-plan", "explain"] as Mode[]).map((m) => {
            const cfg = modeConfig[m];
            const isActive = mode === m;
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl border transition-all text-left cursor-pointer ${
                  isActive
                    ? m === "study-plan"
                      ? "bg-violet-600/15 border-violet-500/30 text-violet-300"
                      : "bg-cyan-600/15 border-cyan-500/30 text-cyan-300"
                    : "bg-white/2 border-white/5 text-slate-500 hover:bg-white/5 hover:border-white/10 hover:text-slate-300"
                }`}
              >
                <span className={`mt-0.5 flex-shrink-0 ${isActive ? "" : "text-slate-600"}`}>{cfg.icon}</span>
                <div>
                  <p className="text-xs font-bold">{cfg.label}</p>
                  <p className="text-xs mt-0.5 opacity-70 leading-snug">{cfg.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tips */}
        <div className="px-4 py-4 flex-1">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold px-2 mb-3">Quick Tips</p>
          <div className="space-y-2 text-xs text-slate-600 px-2">
            {mode === "study-plan" ? (
              <>
                <p>• Be specific about your target role</p>
                <p>• Ask follow-ups like "focus on week 3"</p>
                <p>• Request resources for specific topics</p>
                <p>• Ask "what should I practice daily?"</p>
              </>
            ) : (
              <>
                <p>• Works with code snippets too</p>
                <p>• Ask "give me an example" after</p>
                <p>• Try "explain simpler" or "go deeper"</p>
                <p>• Paste error messages for debugging help</p>
              </>
            )}
          </div>
        </div>

        {/* Back button */}
        <div className="px-4 py-4 border-t border-white/5">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-all cursor-pointer group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">

        {/* ── Mobile top bar (hidden on desktop) ── */}
        <div className="md:hidden flex-shrink-0 border-b border-white/5 bg-[#0d0d14] px-4 py-3 space-y-3">
          {/* Back + title row */}
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Home
            </button>
            <span className="text-white/10">│</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">AI Study Assistant</span>
            </div>
          </div>
          {/* Mode tabs */}
          <div className="flex gap-2">
            {(["study-plan", "explain"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  mode === m
                    ? m === "study-plan"
                      ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                      : "bg-cyan-600/20 border-cyan-500/40 text-cyan-300"
                    : "bg-white/3 border-white/8 text-slate-500"
                }`}
              >
                {modeConfig[m].icon}
                {modeConfig[m].label}
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <header className="flex-shrink-0 border-b border-white/5 bg-[#0d0d14]/80 backdrop-blur px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-white">
              {mode === "study-plan" ? "📋 Study Plan Generator" : "⚡ Paragraph Explainer"}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {mode === "study-plan"
                ? "Get a personalized roadmap to crack your target interview"
                : "Paste any technical text and get a clear explanation"}
            </p>
          </div>
          {hasStarted && (
            <button
              onClick={() => { setMessages([]); setHasStarted(false); }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-white/10 bg-white/3 hover:bg-white/8 text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Start Over
            </button>
          )}
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 scrollbar-thin">
          {/* Input form (shown at top before starting, or hidden once started) */}
          {!hasStarted && (
            <div className="mb-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white mb-1">
                  {mode === "study-plan" ? "Build Your Interview Roadmap" : "Explain Any Technical Text"}
                </h2>
                <p className="text-sm text-slate-500">
                  {mode === "study-plan"
                    ? "Fill in the details below and get a detailed, personalized study plan in seconds."
                    : "Paste a technical paragraph, concept, algorithm or code snippet — the AI will break it down for you."}
                </p>
              </div>
              {mode === "study-plan" ? (
                <StudyPlanForm onSubmit={handleStudyPlan} loading={loading} />
              ) : (
                <ExplainForm onSubmit={handleExplain} loading={loading} />
              )}
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg) => (
            <AssistantBubble key={msg.id} msg={msg} />
          ))}

          {loading && <TypingIndicator text={loadingText} />}

          <div ref={bottomRef} />
        </div>

        {/* Follow-up chat input (shown after first response) */}
        {hasStarted && !loading && messages.some((m) => m.role === "assistant") && (
          <div className="flex-shrink-0 border-t border-white/5 bg-[#0d0d14]/80 backdrop-blur px-4 sm:px-6 py-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleFollowUp();
                    }
                  }}
                  placeholder={
                    mode === "study-plan"
                      ? "Ask a follow-up — e.g. \"Focus more on system design\" or \"Resources for week 2\"…"
                      : "Ask a follow-up — e.g. \"Give me a code example\" or \"Explain simpler\"…"
                  }
                  rows={2}
                  className="w-full bg-[#13131a] border border-white/10 text-sm text-slate-200 rounded-xl px-4 py-3 pr-14 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all placeholder:text-slate-700 scrollbar-thin"
                />
              </div>
              <button
                onClick={handleFollowUp}
                disabled={!followUpInput.trim() || loading}
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-violet-900/40 active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-slate-700 mt-2">Press Enter to send · Shift+Enter for new line</p>
          </div>
        )}
      </div>
    </div>
  );
}
