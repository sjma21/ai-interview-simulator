import { useEffect, useRef, useState } from "react";
import type { InterviewConfig, Message } from "../types";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import LoadingIndicator from "../components/LoadingIndicator";
import EndInterviewModal from "../components/EndInterviewModal";
import TimerDisplay from "../components/TimerDisplay";
import { useTimer } from "../hooks/useTimer";

interface InterviewPageProps {
  config: InterviewConfig;
  messages: Message[];
  questionNumber: number;
  totalQuestions: number;
  scores: number[];
  loading: boolean;
  loadingText: string;
  lastMessageIsQuestion: boolean;
  lastMessageIsFeedback: boolean;
  isLastQuestion: boolean;
  hintUsedThisQuestion: boolean;
  hintLoading: boolean;
  onSubmitAnswer: (answer: string) => void;
  onNextQuestion: () => void;
  onEndInterview: () => void;
  onRequestHint: () => void;
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

const difficultyColors: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function InterviewPage({
  config,
  messages,
  questionNumber,
  totalQuestions,
  scores,
  loading,
  loadingText,
  lastMessageIsQuestion,
  lastMessageIsFeedback,
  isLastQuestion,
  hintUsedThisQuestion,
  hintLoading,
  onSubmitAnswer,
  onNextQuestion,
  onEndInterview,
  onRequestHint,
}: InterviewPageProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showEndModal, setShowEndModal] = useState(false);

  // Reset timer key on each new question so duration restarts
  const timerKey = questionNumber;
  const { reset: resetTimer, ...timer } = useTimer({
    duration: config.timerSeconds,
    active: lastMessageIsQuestion && !loading,
    onExpire: () => onSubmitAnswer("⏰ Time's up! I ran out of time for this question."),
  });

  // Reset timer when question changes
  useEffect(() => {
    resetTimer();
  }, [timerKey, resetTimer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const progressPercent = (questionNumber / totalQuestions) * 100;
  const lastScore = scores[scores.length - 1];
  const avgScore =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : null;

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex overflow-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      {/* ── Sidebar ── */}
      <aside className="relative z-10 w-72 flex-shrink-0 border-r border-white/5 bg-[#0d0d14] flex flex-col">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-indigo-900/50">
              AI
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">InterviewSim</p>
              <p className="text-xs text-slate-600">Live Session</p>
            </div>
          </div>
        </div>

        {/* Session info */}
        <div className="px-6 py-5 border-b border-white/5 space-y-4">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">
              Session
            </p>
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-xl p-3">
              <span className="text-2xl">{domainIcons[config.domain]}</span>
              <div>
                <p className="text-sm font-semibold text-white">{config.domain}</p>
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${difficultyColors[config.difficulty]}`}>
                  {config.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
                Progress
              </p>
              <p className="text-xs font-bold text-white">
                {questionNumber}<span className="text-slate-600">/{totalQuestions}</span>
              </p>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {Array.from({ length: totalQuestions }, (_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                    i < scores.length
                      ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
                      : i === questionNumber - 1
                      ? "bg-white/10 border-white/30 text-white"
                      : "bg-white/[0.03] border-white/5 text-slate-700"
                  }`}
                >
                  {i < scores.length ? scores[i] : i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score tracker */}
        <div className="px-6 py-5 border-b border-white/5">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-3">
            Score Tracker
          </p>
          {scores.length === 0 ? (
            <p className="text-xs text-slate-700 italic">No scores yet...</p>
          ) : (
            <div className="space-y-2">
              {scores.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 w-5">Q{i + 1}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        s >= 8 ? "bg-emerald-500" : s >= 5 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${s * 10}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold w-6 text-right ${
                    s >= 8 ? "text-emerald-400" : s >= 5 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          )}

          {avgScore && (
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-slate-600">Average</p>
              <p className="text-sm font-extrabold text-indigo-400">{avgScore}/10</p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="px-6 py-5 mt-auto">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">
            Interview Tips
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {[
              "Be concise and structured",
              "Think out loud",
              "Use examples",
              "Ask clarifying questions",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-1.5">
                <span className="text-indigo-600 mt-0.5">›</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* End Interview button */}
        <div className="px-6 pb-6">
          <button
            onClick={() => setShowEndModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30 text-sm font-semibold text-red-400 transition-all cursor-pointer group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            End Interview
          </button>
        </div>
      </aside>

      {/* ── Main chat panel ── */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex-shrink-0 border-b border-white/5 bg-[#0d0d14]/80 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-white">
              Question <span className="text-indigo-400">{questionNumber}</span>
              <span className="text-slate-600"> of {totalQuestions}</span>
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {loading
                ? loadingText
                : lastMessageIsQuestion
                ? "Your turn to answer"
                : lastMessageIsFeedback
                ? "Review your feedback"
                : "Starting session..."}
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
              <span className="text-xs text-slate-500 font-medium">Live Interview</span>
            </div>
          </div>
        </header>

        {/* Danger banner when < 15s */}
        {timer.enabled && timer.urgency === "danger" && lastMessageIsQuestion && !loading && (
          <div className="flex-shrink-0 bg-red-500/10 border-b border-red-500/20 px-6 py-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <p className="text-xs text-red-300 font-medium">
              Only {timer.timeLeft}s left — submit your answer now!
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-medium">Preparing your first question...</p>
              <p className="text-slate-700 text-xs mt-1">The interviewer is getting ready</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                onHint={
                  msg.type === "question" && idx === messages.length - 1 && lastMessageIsQuestion
                    ? onRequestHint
                    : undefined
                }
                hintUsed={
                  msg.type === "question" && idx === messages.length - 1
                    ? hintUsedThisQuestion
                    : undefined
                }
                hintLoading={
                  msg.type === "question" && idx === messages.length - 1
                    ? hintLoading
                    : undefined
                }
              />
            ))
          )}

          {loading && <LoadingIndicator text={loadingText} />}

          {/* Next question CTA */}
          {lastMessageIsFeedback && !loading && (
            <div className="flex justify-center py-4">
              <div className="bg-[#13131a] border border-white/10 rounded-2xl p-5 max-w-sm w-full shadow-xl text-center">
                {lastScore !== undefined && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">
                      Question Score
                    </p>
                    <p className={`text-4xl font-extrabold ${
                      lastScore >= 8 ? "text-emerald-400" : lastScore >= 5 ? "text-amber-400" : "text-red-400"
                    }`}>
                      {lastScore}<span className="text-slate-600 text-xl font-normal">/10</span>
                    </p>
                  </div>
                )}
                <button
                  onClick={onNextQuestion}
                  className="group w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 active:scale-[0.98]"
                >
                  {isLastQuestion ? (
                    <>
                      <span>View Final Results</span>
                      <span>🏁</span>
                    </>
                  ) : (
                    <>
                      <span>Next Question</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
                {!isLastQuestion && (
                  <p className="text-xs text-slate-700 mt-2">
                    {totalQuestions - questionNumber} question{totalQuestions - questionNumber !== 1 ? "s" : ""} remaining
                  </p>
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSubmit={onSubmitAnswer}
          disabled={loading || !lastMessageIsQuestion}
        />
      </div>

      {/* End interview confirmation modal */}
      {showEndModal && (
        <EndInterviewModal
          questionsAnswered={scores.length}
          totalQuestions={totalQuestions}
          scores={scores}
          onConfirm={() => {
            setShowEndModal(false);
            onEndInterview();
          }}
          onCancel={() => setShowEndModal(false)}
        />
      )}
    </div>
  );
}
