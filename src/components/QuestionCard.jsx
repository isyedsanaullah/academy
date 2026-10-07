/**
 * QuestionCard
 *
 * Displays mathematical expressions (e.g. "7 × 8 = ?", "24 + 18 = ?", "48 ÷ 6 = ?")
 * in large, legible typography for students.
 */
export default function QuestionCard({
  question,
  display,
  questionNumber,
  totalQuestions,
  animateKey,
}) {
  const displayText =
    display ||
    question?.display ||
    (question && question.multiplier != null && question.multiplicand != null
      ? `${question.multiplier} × ${question.multiplicand}`
      : '');

  return (
    <div
      key={animateKey}
      className="card p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 shadow-xs"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {questionNumber && totalQuestions
          ? `Question ${questionNumber} of ${totalQuestions}`
          : 'What is the answer?'}
      </p>

      <div className="flex items-center justify-center gap-3 sm:gap-4 select-none flex-wrap">
        <span className="text-4xl sm:text-6xl font-black text-slate-800 tabular-nums tracking-tight">
          {displayText}
        </span>
        <span className="text-3xl sm:text-4xl font-black text-slate-300">=</span>
        <span className="text-4xl sm:text-6xl font-black text-blue-600">?</span>
      </div>
    </div>
  );
}
