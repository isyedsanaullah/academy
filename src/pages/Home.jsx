import { useNavigate } from 'react-router-dom';
import { Smile, Zap, Flame, Brain, Trophy } from 'lucide-react';
import { gameService } from '../services/gameService.js';
import { DIFFICULTIES } from '../data/tables.js';

const ICON_MAP = {
  Smile,
  Zap,
  Flame,
  Brain,
  Trophy,
};

export default function Home() {
  const navigate = useNavigate();
  const bestScores = gameService.getBestScores();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8 animate-fade-up pb-12">

      {/* Hero Section */}
      <div className="text-center space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider">
          <span>📍</span>
          <span>Block B, Soan Gardens, Islamabad, Pakistan</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Syeds Academy
          </h1>
          <p className="text-lg sm:text-xl font-bold text-blue-600">
            Math Practice Made Simple
          </p>
        </div>

        <p className="text-slate-500 text-sm sm:text-base font-medium max-w-md mx-auto leading-relaxed">
          Interactive mathematics platform for <strong>Class 3 to Class 6</strong> students.
          Master multiplication tables, mental speed, and written column arithmetic.
        </p>

        {/* Primary Action Buttons (Part 26) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => navigate('/practice')}
            className="btn-primary w-full sm:w-auto px-6 py-3.5 text-base font-bold shadow-md shadow-blue-200"
            style={{ borderRadius: '14px' }}
          >
            <span>Practice Math</span>
            <span>⚡</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/tables')}
            className="btn-secondary w-full sm:w-auto px-6 py-3.5 text-base font-bold"
            style={{ borderRadius: '14px' }}
          >
            <span>Read Tables 1–10</span>
            <span>📖</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/games')}
            className="px-6 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-base w-full sm:w-auto transition-colors shadow-xs"
            style={{ borderRadius: '14px' }}
          >
            <span>Explore Games</span>
            <span>🎮</span>
          </button>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Featured Practice Activities
          </h2>
          <button
            type="button"
            onClick={() => navigate('/games')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            View All Games →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => navigate('/tables')}
            className="card p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
              ×
            </div>
            <h3 className="font-black text-slate-800 text-base">Tables 1–10</h3>
            <p className="text-xs text-slate-500">Read and memorize individual multiplication tables.</p>
            <span className="inline-block text-xs font-bold text-blue-600">Read & Practice →</span>
          </div>

          <div
            onClick={() => navigate('/games')}
            className="card p-4 border border-slate-200 hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
              +
            </div>
            <h3 className="font-black text-slate-800 text-base">Arithmetic Quizzes</h3>
            <p className="text-xs text-slate-500">Timed challenges for Addition, Subtraction & Division.</p>
            <span className="inline-block text-xs font-bold text-emerald-600">Play Quizzes →</span>
          </div>

          <div
            onClick={() => navigate('/written-math')}
            className="card p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg">
              📝
            </div>
            <h3 className="font-black text-slate-800 text-base">Written Math</h3>
            <p className="text-xs text-slate-500">School notebook vertical column arithmetic with carries.</p>
            <span className="inline-block text-xs font-bold text-indigo-600">Open Notebook →</span>
          </div>
        </div>
      </div>

      {/* Best Scores */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Multiplication Progression Best Scores
          </h2>
          <span className="text-[11px] font-bold text-blue-600">5 Tiers</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {Object.values(DIFFICULTIES).map(diff => {
            const IconComp = ICON_MAP[diff.iconName] || Smile;
            let best = bestScores[diff.id] || 0;
            if (diff.id === 'easy') {
              best = Math.max(bestScores.easy_0_5 || 0, bestScores.easy_6_10 || 0, bestScores.easy || 0);
            }

            return (
              <div
                key={diff.id}
                onClick={() => navigate('/practice', { state: { difficultyId: diff.id } })}
                className="card p-3 text-center space-y-1.5 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                    <IconComp className="w-4 h-4 stroke-[2.2]" />
                  </div>
                </div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  {diff.label}
                </div>
                {best > 0 ? (
                  <div className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
                    {best}
                    <span className="text-[11px] font-bold text-slate-400">/{diff.questions}</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-300 font-medium py-0.5">—</div>
                )}
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  {diff.secondsPerQuestion}s · {diff.questions}Q
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Curriculum Banner */}
      <div className="card p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏫</span>
          <h3 className="font-black text-slate-800 text-sm sm:text-base">
            Class 3 to Class 6 Curriculum
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Syeds Academy provides foundational numeracy practice for primary school students in Islamabad.
          Reinforce mental speed, practice daily, and share verified progress cards with teachers.
        </p>
      </div>

    </div>
  );
}
