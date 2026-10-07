/**
 * ResultSummary — displayed both after the game and in the teacher's shared link view.
 */

export function getAdaptiveRecommendation(result) {
  const { difficultyId, accuracy, gameType } = result;
  if (gameType && gameType !== 'multiplication') return null;

  if (difficultyId === 'easy') {
    if (accuracy >= 80) {
      return {
        nextDifficultyId: 'medium',
        title: 'Ready for a bigger challenge?',
        text: 'Try Medium → Build speed with tables 0–10',
        badge: 'Recommended Next',
        colorClass: 'border-blue-300 bg-blue-50 text-blue-900',
        btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      };
    }
    return {
      nextDifficultyId: 'easy',
      title: 'Keep Practicing Easy',
      text: 'Keep practicing Easy to build strong confidence before moving to Medium.',
      badge: 'Practice Tip',
      colorClass: 'border-emerald-300 bg-emerald-50 text-emerald-900',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    };
  }

  if (difficultyId === 'medium') {
    if (accuracy >= 80) {
      return {
        nextDifficultyId: 'hard',
        title: 'Great speed & accuracy!',
        text: 'Ready for Hard → Challenge tables up to 12!',
        badge: 'Recommended Next',
        colorClass: 'border-amber-300 bg-amber-50 text-amber-900',
        btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      };
    }
    return {
      nextDifficultyId: 'medium',
      title: 'Keep Practicing Medium',
      text: 'Practice Medium a bit more before moving to Hard.',
      badge: 'Practice Tip',
      colorClass: 'border-blue-300 bg-blue-50 text-blue-900',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    };
  }

  if (difficultyId === 'hard') {
    if (accuracy >= 80) {
      return {
        nextDifficultyId: 'expert',
        title: 'Multiplication skills are soaring!',
        text: 'Ready for Expert → For strong math learners!',
        badge: 'Recommended Next',
        colorClass: 'border-purple-300 bg-purple-50 text-purple-900',
        btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
      };
    }
    return {
      nextDifficultyId: 'hard',
      title: 'Solid Effort on Hard',
      text: 'Strengthen 11 and 12 table facts before moving to Expert.',
      badge: 'Practice Tip',
      colorClass: 'border-amber-300 bg-amber-50 text-amber-900',
      btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    };
  }

  if (difficultyId === 'expert') {
    if (accuracy >= 80) {
      return {
        nextDifficultyId: 'master',
        title: 'Incredible calculation speed!',
        text: 'Take on the ultimate Master Challenge 🏆',
        badge: 'Ultimate Step',
        colorClass: 'border-rose-300 bg-rose-50 text-rose-900',
        btnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
      };
    }
    return {
      nextDifficultyId: 'expert',
      title: 'Keep Pushing in Expert',
      text: 'Practice Expert combinations to sharpen rapid recall under 8 seconds.',
      badge: 'Practice Tip',
      colorClass: 'border-purple-300 bg-purple-50 text-purple-900',
      btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    };
  }

  if (difficultyId === 'master') {
    if (accuracy >= 90) {
      return {
        nextDifficultyId: 'master',
        title: '🏆 Master of Multiplication!',
        text: 'You conquered 30 questions under 7-second time pressure!',
        badge: 'Champion',
        colorClass: 'border-amber-300 bg-amber-50 text-amber-950',
        btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      };
    }
    return {
      nextDifficultyId: 'master',
      title: 'Master Challenge Completed!',
      text: 'Great perseverance! Practice again to hit 100% accuracy under pressure.',
      badge: 'Keep Training',
      colorClass: 'border-rose-300 bg-rose-50 text-rose-950',
      btnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    };
  }

  return null;
}

export default function ResultSummary({ result, isSharedView = false, onNavigateDifficulty }) {
  const {
    score, totalQuestions, accuracy, correct, incorrect, timeout,
    weakTables, feedback, studentName, difficultyLabel, tableRange, date,
    difficultyId,
  } = result;

  // SVG circle progress
  const radius = 52;
  const circumference = 2 * Math.PI * radius; // ~326.7
  const offset = circumference - (accuracy / 100) * circumference;

  const strokeColor =
    accuracy >= 90 ? '#10b981'   // emerald
    : accuracy >= 70 ? '#3b82f6' // blue
    : accuracy >= 50 ? '#f59e0b' // amber
    : '#ef4444';                  // rose

  const recommendation = getAdaptiveRecommendation(result);

  return (
    <div className="space-y-4">

      {/* Header info for shared/teacher view */}
      {isSharedView && (
        <div className="card p-4 bg-blue-50 border-blue-100 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Student Result</p>
          <h2 className="text-2xl font-black text-slate-800">
            {studentName || 'Student'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {difficultyLabel} {tableRange ? `· Tables ${tableRange}` : ''}
            {date ? ` · ${date}` : ''}
          </p>
        </div>
      )}

      {/* Level Banner (Section 18) */}
      <div className="card p-3 bg-slate-50 border border-slate-200 text-center flex items-center justify-between px-4">
        <div className="text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Challenge Tier
          </span>
          <span className="text-base font-black text-slate-800">
            {difficultyId === 'master' ? '🏆 ' : ''}{difficultyLabel}
          </span>
        </div>
        {tableRange && (
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Range
            </span>
            <span className="text-sm font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
              Tables {tableRange}
            </span>
          </div>
        )}
      </div>

      {/* Score circle */}
      <div className="card p-6 flex flex-col items-center text-center">
        <div className="relative w-36 h-36 mb-4">
          <svg className="w-full h-full" viewBox="0 0 120 120" aria-label={`Score: ${score} out of ${totalQuestions}`}>
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transformOrigin: '60px 60px',
                transform: 'rotate(-90deg)',
                transition: 'stroke-dashoffset 1.2s ease-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-slate-800 tabular-nums leading-none">{score}</span>
            <span className="text-sm font-bold text-slate-400">/ {totalQuestions}</span>
          </div>
        </div>

        <p className={`text-xl font-black mb-1 ${feedback.colorClass}`}>{feedback.label}</p>
        <p className="text-sm text-slate-500 max-w-[280px]">{feedback.message}</p>
        <div className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${feedback.bgClass} ${feedback.colorClass}`}>
          {accuracy}% Accuracy
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="text-3xl font-black text-emerald-500 tabular-nums">{correct}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Correct</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-black text-rose-400 tabular-nums">{incorrect}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Wrong</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-black text-amber-400 tabular-nums">{timeout}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Timeouts</div>
        </div>
      </div>

      {/* Adaptive Recommendation (Section 21) */}
      {!isSharedView && recommendation && (
        <div className={`card p-4 border-2 ${recommendation.colorClass} space-y-2.5`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider opacity-75">
              {recommendation.badge}
            </span>
          </div>
          <div>
            <h4 className="font-black text-base">{recommendation.title}</h4>
            <p className="text-xs sm:text-sm font-medium opacity-90 mt-0.5">
              {recommendation.text}
            </p>
          </div>
          {onNavigateDifficulty && recommendation.nextDifficultyId !== difficultyId && (
            <button
              type="button"
              onClick={() => onNavigateDifficulty(recommendation.nextDifficultyId)}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${recommendation.btnClass}`}
            >
              Try {recommendation.nextDifficultyId.toUpperCase()} Now →
            </button>
          )}
        </div>
      )}

      {/* Weak tables callout (Section 22) */}
      {weakTables && weakTables.length > 0 && (
        <div className="card p-4 bg-amber-50 border border-amber-200">
          <p className="text-sm font-black text-amber-900 mb-1">📌 Practice These Tables</p>
          <p className="text-xs text-amber-700 mb-3">You missed questions involving:</p>
          <div className="flex flex-wrap gap-2">
            {weakTables.map(t => (
              <span key={t}
                className="px-3.5 py-1.5 bg-white border border-amber-200 text-amber-800 font-black text-base rounded-xl shadow-xs"
              >
                × {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Answer breakdown (teacher view or student view) */}
      {result.answers && result.answers.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Question Breakdown</p>
          <div className="space-y-2">
            {result.answers.map((ans, i) => {
              const icon = ans.status === 'correct' ? '✅' : ans.status === 'timeout' ? '⏱' : '❌';
              const detail =
                ans.status === 'correct'
                  ? `Correct!`
                  : ans.status === 'timeout'
                  ? `Timed out — answer: ${ans.expectedAnswer}`
                  : `Chose ${ans.selectedAnswer} — answer: ${ans.expectedAnswer}`;
              return (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-base w-5 flex-shrink-0 text-center">{icon}</span>
                  <span className="font-bold text-slate-700 tabular-nums">{ans.questionObj?.display} = {ans.expectedAnswer}</span>
                  <span className="text-xs text-slate-400 ml-auto text-right leading-tight flex-shrink-0">{detail}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
