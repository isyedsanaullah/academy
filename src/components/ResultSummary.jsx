/**
 * ResultSummary — displayed both after the game and in the teacher's shared link view.
 */
export default function ResultSummary({ result, isSharedView = false }) {
  const {
    score, totalQuestions, accuracy, correct, incorrect, timeout,
    weakTables, feedback, studentName, difficultyLabel, tableRange, date,
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
            {difficultyLabel} · Tables {tableRange}
            {date ? ` · ${date}` : ''}
          </p>
        </div>
      )}

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
        <p className="text-sm text-slate-500 max-w-[260px]">{feedback.message}</p>
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

      {/* Weak tables callout */}
      {weakTables && weakTables.length > 0 && (
        <div className="card p-4 bg-amber-50 border border-amber-100">
          <p className="text-sm font-black text-amber-800 mb-2">📌 Practice These Tables</p>
          <p className="text-xs text-amber-600 mb-3">You made mistakes with:</p>
          <div className="flex flex-wrap gap-2">
            {weakTables.map(t => (
              <span key={t}
                className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 font-black text-lg rounded-xl shadow-sm"
              >
                × {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Answer breakdown (teacher view or always visible) */}
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
                  <span className="font-bold text-slate-700 tabular-nums">{ans.questionObj.display} = {ans.expectedAnswer}</span>
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
