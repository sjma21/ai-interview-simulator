interface EndInterviewModalProps {
  questionsAnswered: number;
  totalQuestions: number;
  scores: number[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function EndInterviewModal({
  questionsAnswered,
  totalQuestions,
  scores,
  onConfirm,
  onCancel,
}: EndInterviewModalProps) {
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const avgScore =
    scores.length > 0
      ? (totalScore / scores.length).toFixed(1)
      : null;
  const remaining = totalQuestions - questionsAnswered;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-[#13131a] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Warning strip */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />

        <div className="px-6 py-5">
          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">End Interview?</h2>
              <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">
                You still have{" "}
                <span className="text-white font-semibold">{remaining}</span>{" "}
                question{remaining !== 1 ? "s" : ""} remaining. Your current
                progress will be saved.
              </p>
            </div>
          </div>

          {/* Score snapshot */}
          <div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 mb-5 space-y-2.5">
            <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
              Current Progress
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Questions answered</span>
              <span className="text-sm font-bold text-white">
                {questionsAnswered}
                <span className="text-slate-600 font-normal">/{totalQuestions}</span>
              </span>
            </div>

            {scores.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Total score</span>
                  <span className="text-sm font-bold text-white">
                    {totalScore}
                    <span className="text-slate-600 font-normal">/{scores.length * 10}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Average score</span>
                  <span className={`text-sm font-extrabold ${
                    parseFloat(avgScore!) >= 8
                      ? "text-emerald-400"
                      : parseFloat(avgScore!) >= 5
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}>
                    {avgScore}/10
                  </span>
                </div>

                {/* Mini score bars */}
                <div className="pt-1 space-y-1">
                  {scores.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-slate-700 w-5">Q{i + 1}</span>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s >= 8 ? "bg-emerald-500" : s >= 5 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${s * 10}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold w-5 text-right ${s >= 8 ? "text-emerald-400" : s >= 5 ? "text-amber-400" : "text-red-400"}`}>
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-600 italic">No answers submitted yet.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold text-slate-300 transition-all cursor-pointer active:scale-[0.97]"
            >
              Keep Going
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-sm font-bold text-white transition-all shadow-lg shadow-red-900/40 cursor-pointer active:scale-[0.97]"
            >
              End Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
