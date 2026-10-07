import { useNavigate } from 'react-router-dom';
import { gameService } from '../services/gameService';
import { DIFFICULTIES } from '../data/tables';

export default function Home() {
  const navigate = useNavigate();
  const bestScores = gameService.getBestScores();

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8 animate-fade-up">

      {/* Hero */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-600 rounded-3xl text-white text-4xl font-black shadow-lg shadow-brand-200 mb-2">
          ×
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight tracking-tight">
          Master Your<br />Multiplication Tables
        </h1>
        <p className="text-slate-500 text-base font-medium max-w-xs mx-auto">
          Practice, improve your speed, and challenge yourself!
        </p>

        <button
          type="button"
          onClick={() => navigate('/practice')}
          className="btn-primary max-w-xs mx-auto mt-2 shadow-md shadow-brand-200"
          style={{ borderRadius: '999px', fontSize: '1.125rem' }}
        >
          <span>Start Tables Practice</span>
          <span>→</span>
        </button>
      </div>

      {/* Feature pills */}
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {[
          { icon: '📊', text: 'Tables 0–10' },
          { icon: '⏱', text: 'Timed Questions' },
          { icon: '🏆', text: '3 Difficulty Levels' },
          { icon: '📲', text: 'Share with Teacher' },
        ].map(f => (
          <div key={f.text} className="card flex items-center gap-2 px-3 py-2.5">
            <span className="text-xl">{f.icon}</span>
            <span className="text-xs font-bold text-slate-600">{f.text}</span>
          </div>
        ))}
      </div>

      {/* Best Scores */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 text-center">
          Your Best Scores
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {Object.values(DIFFICULTIES).map(diff => {
            const best = bestScores[diff.id] || 0;
            return (
              <div key={diff.id} className="card p-4 text-center space-y-1">
                <span className="text-2xl">{diff.emoji}</span>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {diff.label}
                </div>
                {best > 0 ? (
                  <div className="text-xl font-black text-slate-800 tabular-nums">
                    {best}
                    <span className="text-xs font-bold text-slate-400">/{diff.questions}</span>
                  </div>
                ) : (
                  <div className="text-sm text-slate-300 font-medium">—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Coming soon */}
      <div className="card p-4 bg-slate-50 border-dashed border-slate-200 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Coming Soon</p>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Addition · Subtraction · Fractions · Mental Math
        </p>
      </div>

    </div>
  );
}
