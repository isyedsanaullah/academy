/** Compact live score ticker shown during gameplay */
export default function ScoreCard({ score, correct, incorrect }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="card flex flex-col items-center px-3 py-2 min-w-[52px]">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Score</span>
        <span className="text-xl font-black text-brand-600 leading-tight tabular-nums">{score}</span>
      </div>
      <div className="card flex flex-col items-center px-3 py-2 min-w-[52px]">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">✓ / ✗</span>
        <div className="flex gap-1.5 text-sm font-black leading-tight">
          <span className="text-emerald-500 tabular-nums">{correct}</span>
          <span className="text-slate-300">/</span>
          <span className="text-rose-400 tabular-nums">{incorrect}</span>
        </div>
      </div>
    </div>
  );
}
