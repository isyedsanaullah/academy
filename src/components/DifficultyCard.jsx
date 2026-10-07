import { Smile, Zap, Flame, Brain, Trophy, Check } from 'lucide-react';

const ICON_MAP = {
  Smile,
  Zap,
  Flame,
  Brain,
  Trophy,
};

const COLORS = {
  emerald: {
    selected:   'bg-emerald-500 text-white border-transparent ring-2 ring-emerald-400/40 shadow-md shadow-emerald-500/20',
    default:    'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50',
    badge:      'bg-emerald-100 text-emerald-800',
    iconWrap:   'bg-emerald-50 text-emerald-600',
    iconActive: 'bg-white/20 text-white',
    subText:    'text-emerald-100',
  },
  blue: {
    selected:   'bg-blue-600 text-white border-transparent ring-2 ring-blue-400/40 shadow-md shadow-blue-500/20',
    default:    'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50',
    badge:      'bg-blue-100 text-blue-800',
    iconWrap:   'bg-blue-50 text-blue-600',
    iconActive: 'bg-white/20 text-white',
    subText:    'text-blue-100',
  },
  amber: {
    selected:   'bg-amber-500 text-white border-transparent ring-2 ring-amber-400/40 shadow-md shadow-amber-500/20',
    default:    'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50',
    badge:      'bg-amber-100 text-amber-800',
    iconWrap:   'bg-amber-50 text-amber-600',
    iconActive: 'bg-white/20 text-white',
    subText:    'text-amber-100',
  },
  purple: {
    selected:   'bg-purple-600 text-white border-transparent ring-2 ring-purple-400/40 shadow-md shadow-purple-500/20',
    default:    'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50',
    badge:      'bg-purple-100 text-purple-800',
    iconWrap:   'bg-purple-50 text-purple-600',
    iconActive: 'bg-white/20 text-white',
    subText:    'text-purple-100',
  },
  rose: {
    selected:   'bg-rose-600 text-white border-transparent ring-2 ring-rose-400/40 shadow-md shadow-rose-500/20',
    default:    'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50',
    badge:      'bg-rose-100 text-rose-800',
    iconWrap:   'bg-rose-50 text-rose-600',
    iconActive: 'bg-white/20 text-white',
    subText:    'text-rose-100',
  },
};

export default function DifficultyCard({ difficulty, selected, onClick, bestScore, customSubtitle }) {
  const c = COLORS[difficulty.colorClass] || COLORS.blue;
  const IconComponent = ICON_MAP[difficulty.iconName] || Smile;

  // Formatted range string
  const rangeText = difficulty.id === 'easy'
    ? 'Tables 0–5 or 6–10'
    : `Tables ${difficulty.minTable ?? 0}–${difficulty.maxTable ?? 12}`;

  return (
    <button
      type="button"
      onClick={() => onClick(difficulty.id)}
      className={`
        w-full text-left rounded-2xl border-2 p-3.5 sm:p-4 transition-all duration-200 outline-none
        active:scale-[0.98] focus:ring-4 focus:ring-offset-2 focus:ring-blue-200 cursor-pointer
        ${selected ? c.selected : c.default}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Lucide SVG Icon container */}
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${selected ? c.iconActive : c.iconWrap}`}>
          <IconComponent className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-black text-base sm:text-lg leading-tight tracking-tight">
              {difficulty.label}
            </span>
            {bestScore > 0 && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 tabular-nums ${selected ? 'bg-white/20 text-white' : c.badge}`}>
                Best: {bestScore}/{difficulty.questions}
              </span>
            )}
          </div>

          <p className={`text-xs sm:text-sm mt-0.5 leading-snug truncate ${selected ? c.subText : 'text-slate-500'}`}>
            {difficulty.tagline}
          </p>

          <p className={`text-[11px] sm:text-xs mt-1 font-medium ${selected ? 'text-white/80' : 'text-slate-400'}`}>
            {customSubtitle || `${rangeText} · ${difficulty.questions}Q · ${difficulty.secondsPerQuestion}s each`}
          </p>
        </div>

        {/* Selected Checkmark */}
        {selected && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
          </div>
        )}
      </div>
    </button>
  );
}
