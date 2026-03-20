interface LoadingIndicatorProps {
  text: string;
}

export default function LoadingIndicator({ text }: LoadingIndicatorProps) {
  return (
    <div className="flex justify-start mb-5">
      <div className="max-w-[80%]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Interviewer</p>
        </div>
        <div className="bg-[#13131a] border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="text-sm text-slate-400 italic">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
