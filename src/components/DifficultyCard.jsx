const COLORS = {
  emerald: {
    selected:  'bg-emerald-500 text-white border-transparent',
    default:   'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50',
    badge:     'bg-emerald-100 text-emerald-700',
    icon:      'bg-white/20',
    check:     'text-emerald-200',
  },
  blue: {
    selected:  'bg-blue-500 text-white border-transparent',
    default:   'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50',
    badge:     'bg-blue-100 text-blue-700',
    icon:      'bg-white/20',
    check:     'text-blue-200',
  },
  violet: {
    selected:  'bg-violet-500 text-white border-transparent',
    default:   'bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:bg-violet-50',
    badge:     'bg-violet-100 text-violet-700',
    icon:      'bg-white/20',
    check:     'text-violet-200',
  },
};

export default function DifficultyCard({ difficulty, selected, onClick, bestScore }) {
  const c = COLORS[difficulty.colorClass] || COLORS.blue;

  return (
    <button
      type="button"
      onClick={() => onClick(difficulty.id)}
      className={`
        w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 outline-none
        active:scale-[0.97] focus:ring-4 focus:ring-offset-2 focus:ring-blue-200
        ${selected ? c.selected : c.default}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${selected ? c.icon : 'bg-slate-100'}`}>
          {difficulty.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-black text-lg leading-tight">{difficulty.label}</span>
            {bestScore > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${selected ? 'bg-white/20 text-white' : c.badge}`}>
                Best: {bestScore}/{difficulty.questions}
              </span>
            )}
          </div>
          <p className={`text-sm mt-0.5 leading-tight ${selected ? 'text-white/80' : 'text-slate-500'}`}>
            {difficulty.tagline}
          </p>
          <p className={`text-xs mt-1 ${selected ? 'text-white/60' : 'text-slate-400'}`}>
            Tables 0–{difficulty.maxTable} · {difficulty.questions}Q · {difficulty.secondsPerQuestion}s each
          </p>
        </div>

        {selected && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
            <span className="text-white text-sm">✓</span>
          </div>
        )}
      </div>
    </button>
  );
}
