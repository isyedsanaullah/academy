export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs font-bold text-slate-500">
          Q <span className="text-slate-800 text-sm">{current}</span>
          <span className="text-slate-400"> / {total}</span>
        </span>
        <span className="text-xs font-semibold text-slate-400">{pct}%</span>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
