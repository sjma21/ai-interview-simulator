interface TimerDisplayProps {
  timeLeft: number;
  pct: number;
  urgency: "safe" | "warning" | "danger";
  enabled: boolean;
}

const RADIUS = 18;
const CIRC = 2 * Math.PI * RADIUS;

const colors = {
  safe:    { stroke: "#34d399", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  warning: { stroke: "#fbbf24", text: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  danger:  { stroke: "#f87171", text: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
};

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function TimerDisplay({ timeLeft, pct, urgency, enabled }: TimerDisplayProps) {
  if (!enabled) return null;

  const c = colors[urgency];
  const dash = (pct / 100) * CIRC;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${c.bg} transition-all duration-300 ${urgency === "danger" ? "animate-pulse" : ""}`}>
      {/* SVG ring */}
      <svg width="38" height="38" viewBox="0 0 44 44" className="-rotate-90">
        <circle cx="22" cy="22" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <circle
          cx="22" cy="22" r={RADIUS} fill="none"
          stroke={c.stroke}
          strokeWidth="3.5"
          strokeDasharray={`${dash} ${CIRC}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s linear, stroke 0.5s" }}
        />
      </svg>
      <div>
        <p className={`text-sm font-black tabular-nums leading-none ${c.text}`}>{fmt(timeLeft)}</p>
        <p className="text-[10px] text-slate-600 leading-none mt-0.5">
          {urgency === "danger" ? "Hurry!" : urgency === "warning" ? "Time check" : "Time left"}
        </p>
      </div>
    </div>
  );
}
