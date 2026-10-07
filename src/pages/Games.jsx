import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_TYPES } from '../data/gameConfigs.js';

export default function Games() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all' | 'available' | 'coming-soon'

  const availableGames = [
    {
      id: 'multiplication',
      title: 'Multiplication Challenge',
      symbol: '×',
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Practice multiplication tables with timed multiple-choice questions.',
      grade: 'Class 3–6',
      badge: 'Available',
      status: 'active',
      action: () => navigate('/practice', { state: { gameType: 'multiplication' } }),
    },
    {
      id: 'addition',
      title: 'Addition Challenge',
      symbol: '+',
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Improve mental addition speed, 2-digit sums, and accuracy.',
      grade: 'Class 3–6',
      badge: 'Available',
      status: 'active',
      action: () => navigate('/practice', { state: { gameType: 'addition' } }),
    },
    {
      id: 'subtraction',
      title: 'Subtraction Challenge',
      symbol: '−',
      color: 'bg-amber-600',
      lightColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Master subtraction with clean positive answers and regrouping.',
      grade: 'Class 3–6',
      badge: 'Available',
      status: 'active',
      action: () => navigate('/practice', { state: { gameType: 'subtraction' } }),
    },
    {
      id: 'division',
      title: 'Division Challenge',
      symbol: '÷',
      color: 'bg-violet-600',
      lightColor: 'bg-violet-50 text-violet-700 border-violet-200',
      description: 'Practice division facts without remainders.',
      grade: 'Class 3–6',
      badge: 'Available',
      status: 'active',
      action: () => navigate('/practice', { state: { gameType: 'division' } }),
    },
    {
      id: 'written-multiplication',
      title: 'Written Multiplication',
      symbol: '📝',
      color: 'bg-indigo-600',
      lightColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'School notebook-style column multiplication with carry digits.',
      grade: 'Class 4–6',
      badge: 'Available',
      status: 'active',
      action: () => navigate('/written-math?mode=multiplication'),
    },
    {
      id: 'written-addition-subtraction',
      title: 'Written Addition & Subtraction',
      symbol: '📋',
      color: 'bg-teal-600',
      lightColor: 'bg-teal-50 text-teal-700 border-teal-200',
      description: 'Column arithmetic with carry and borrow boxes on notebook grid.',
      grade: 'Class 3–6',
      badge: 'Available',
      status: 'active',
      action: () => navigate('/written-math?mode=addition'),
    },
  ];

  const comingSoonGames = [
    {
      id: 'fractions',
      title: 'Fraction Practice',
      symbol: '🥧',
      description: 'Identifying, comparing, and adding simple fractions.',
      grade: 'Class 4–6',
      badge: 'Coming Soon',
      status: 'soon',
    },
    {
      id: 'fraction-division',
      title: 'Fraction Division',
      symbol: '🧮',
      description: 'Step-by-step reciprocal fraction division for upper primary.',
      grade: 'Class 5–6',
      badge: 'Coming Soon',
      status: 'soon',
    },
    {
      id: 'decimals-percentages',
      title: 'Decimals & Percentages',
      symbol: '💯',
      description: 'Place values, conversions between fractions, decimals, and percent.',
      grade: 'Class 5–6',
      badge: 'Coming Soon',
      status: 'soon',
    },
    {
      id: 'geometry',
      title: 'Geometry & Measurement',
      symbol: '📐',
      description: 'Perimeter, area, shapes, angles, and unit conversions.',
      grade: 'Class 4–6',
      badge: 'Coming Soon',
      status: 'soon',
    },
    {
      id: 'word-problems',
      title: 'Word Problems',
      symbol: '📖',
      description: 'Real-world mathematical puzzles and multi-step word scenarios.',
      grade: 'Class 3–6',
      badge: 'Coming Soon',
      status: 'soon',
    },
    {
      id: 'logic-puzzles',
      title: 'Logical Thinking & Puzzles',
      symbol: '🧩',
      description: 'Number patterns, sequences, missing numbers, and brain teasers.',
      grade: 'Class 3–6',
      badge: 'Coming Soon',
      status: 'soon',
    },
  ];

  const allGames = [...availableGames, ...comingSoonGames];
  const displayedGames =
    filter === 'available'
      ? availableGames
      : filter === 'coming-soon'
      ? comingSoonGames
      : allGames;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-up pb-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
          Mathematics Curriculum
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Math Games & Challenges
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Tailored for Class 3 to Class 6 learners. Practice mental arithmetic or written notebook methods.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-xs mx-auto text-xs font-bold text-slate-600">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg transition-colors ${
            filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          All ({allGames.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('available')}
          className={`flex-1 py-1.5 rounded-lg transition-colors ${
            filter === 'available' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Available ({availableGames.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('coming-soon')}
          className={`flex-1 py-1.5 rounded-lg transition-colors ${
            filter === 'coming-soon' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Coming Soon
        </button>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedGames.map(game => {
          const isAvailable = game.status === 'active';

          return (
            <div
              key={game.id}
              className={`card p-5 border transition-all flex flex-col justify-between ${
                isAvailable
                  ? 'border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                  : 'border-dashed border-slate-200 bg-slate-50/70 opacity-80'
              }`}
              onClick={isAvailable ? game.action : undefined}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xl shadow-xs ${
                      isAvailable ? `${game.color} text-white` : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {game.symbol}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {game.grade}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {game.badge}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">
                    {game.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {game.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100">
                {isAvailable ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      game.action();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Play Challenge</span>
                    <span>→</span>
                  </button>
                ) : (
                  <div className="text-center text-xs font-semibold text-slate-400 py-1">
                    🔒 Curriculum in Development
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
