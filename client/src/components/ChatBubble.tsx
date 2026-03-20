import { useTTS } from "../hooks/useSpeech";
import type { Message } from "../types";

interface ChatBubbleProps {
  message: Message;
  onHint?: () => void;
  hintUsed?: boolean;
  hintLoading?: boolean;
}

function ScoreMeter({ score }: { score: number }) {
  const color =
    score >= 8 ? "#34d399" : score >= 5 ? "#fbbf24" : "#f87171";
  const pct = (score / 10) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#ffffff10" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${(pct / 100) * 94.2} 94.2`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
          {score}
        </span>
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Score</p>
        <p className="text-lg font-extrabold" style={{ color }}>{score}<span className="text-slate-500 text-sm font-normal">/10</span></p>
      </div>
    </div>
  );
}

function formatFeedback(content: string) {
  const lines = content.split("\n");
  const scoreMatch = content.match(/Score:\s*(\d+)\/10/i);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

  const sections: { heading: string | null; lines: string[] }[] = [];
  let current: { heading: string | null; lines: string[] } = { heading: null, lines: [] };

  for (const line of lines) {
    if (/^Score:\s*\d+\/10/i.test(line)) continue;
    if (/^(Feedback:|Ideal Answer:|Improvement Tips:)/i.test(line.trim())) {
      if (current.lines.length > 0 || current.heading) sections.push(current);
      current = { heading: line.trim().replace(/:$/, ""), lines: [] };
    } else if (line.trim()) {
      current.lines.push(line.trim());
    }
  }
  if (current.lines.length > 0 || current.heading) sections.push(current);

  return { score, sections };
}

export default function ChatBubble({ message, onHint, hintUsed, hintLoading }: ChatBubbleProps) {
  const { speak, stop, speaking, supported: ttsSupported } = useTTS();
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-5 group">
        <div className="max-w-[78%]">
          <p className="text-xs text-slate-600 text-right mb-1.5 mr-1 font-medium">You</p>
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-lg shadow-indigo-900/30">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Hint bubble
  if (message.type === "hint") {
    return (
      <div className="flex justify-start mb-5">
        <div className="max-w-[80%]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-900/40">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-xs text-amber-500/80 font-semibold uppercase tracking-wide">Hint</p>
            <span className="text-xs text-amber-600/60 font-medium">· -1 pt</span>
          </div>
          <div className="bg-amber-500/8 border border-amber-500/20 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-lg">
            <p className="text-sm text-amber-200/90 leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "question") {
    return (
      <div className="flex justify-start mb-5">
        <div className="max-w-[82%]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Interviewer</p>
          </div>
          <div className="bg-[#13131a] border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm shadow-xl">
            <p className="text-sm text-slate-100 leading-relaxed font-medium">{message.content}</p>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap">
              {ttsSupported && (
                <button
                  onClick={() => speaking ? stop() : speak(message.content)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    speaking
                      ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                      : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
                  }`}
                >
                  {speaking ? (
                    <>
                      <span className="flex gap-0.5 items-end h-3">
                        <span className="w-0.5 bg-indigo-400 rounded-full animate-[soundbar_0.8s_ease-in-out_infinite]" style={{ height: "40%" }} />
                        <span className="w-0.5 bg-indigo-400 rounded-full animate-[soundbar_0.8s_ease-in-out_0.2s_infinite]" style={{ height: "100%" }} />
                        <span className="w-0.5 bg-indigo-400 rounded-full animate-[soundbar_0.8s_ease-in-out_0.4s_infinite]" style={{ height: "60%" }} />
                        <span className="w-0.5 bg-indigo-400 rounded-full animate-[soundbar_0.8s_ease-in-out_0.1s_infinite]" style={{ height: "80%" }} />
                      </span>
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0c-1.5-1.5-3-2.5-5-2.5H5a1 1 0 01-1-1v-5a1 1 0 011-1h2c2 0 3.5-1 5-2.5z" />
                      </svg>
                      <span>Listen to question</span>
                    </>
                  )}
                </button>
              )}
              {onHint && !hintUsed && (
                <button
                  onClick={onHint}
                  disabled={hintLoading}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-amber-500/25 bg-amber-500/8 text-amber-400/80 hover:bg-amber-500/15 hover:text-amber-300 hover:border-amber-500/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hintLoading ? (
                    <>
                      <span className="w-3 h-3 border border-amber-400/50 border-t-amber-400 rounded-full animate-spin" />
                      <span>Getting hint…</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>Need a hint? <span className="text-amber-600/70">(-1 pt)</span></span>
                    </>
                  )}
                </button>
              )}
              {hintUsed && (
                <span className="text-xs text-amber-600/50 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hint used
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Feedback bubble
  const { score, sections } = formatFeedback(message.content);
  const sectionIcons: Record<string, string> = {
    Feedback: "💬",
    "Ideal Answer": "✅",
    "Improvement Tips": "🚀",
  };

  return (
    <div className="flex justify-start mb-5">
      <div className="max-w-[88%] w-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Evaluation</p>
        </div>

        <div className="bg-[#13131a] border border-white/10 rounded-2xl rounded-tl-sm shadow-xl overflow-hidden">
          {score !== null && (
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-4">
              <ScoreMeter score={score} />
              <div className="flex-1 h-px bg-white/5" />
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                score >= 8
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : score >= 5
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  : "text-red-400 bg-red-500/10 border-red-500/20"
              }`}>
                {score >= 8 ? "Strong Answer" : score >= 5 ? "Decent" : "Needs Work"}
              </span>
            </div>
          )}

          <div className="px-5 py-4 space-y-4">
            {sections.map((section, i) => (
              <div key={i}>
                {section.heading && (
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span>{sectionIcons[section.heading] ?? "•"}</span>
                    <span>{section.heading}</span>
                  </p>
                )}
                <ul className="space-y-1.5">
                  {section.lines.map((line, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400/60 flex-shrink-0" />
                      <span>{line.replace(/^[-•]\s*/, "")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
