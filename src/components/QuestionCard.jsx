/**
 * QuestionCard — shows "7 × 8 = ?" in a large, readable format.
 * `animateKey` triggers the slide-in animation on each new question.
 */
export default function QuestionCard({ question, animateKey }) {
  return (
    <div
      key={animateKey}
      className="animate-fade-up card p-6 sm:p-8 flex flex-col items-center justify-center"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
        What is the answer?
      </p>
      <div className="flex items-center gap-3 sm:gap-4 select-none">
        <span className="text-5xl sm:text-6xl font-black text-slate-800 tabular-nums">
          {question.multiplier}
        </span>
        <span className="text-3xl sm:text-4xl font-black text-slate-400">×</span>
        <span className="text-5xl sm:text-6xl font-black text-slate-800 tabular-nums">
          {question.multiplicand}
        </span>
        <span className="text-3xl sm:text-4xl font-black text-slate-400">=</span>
        <span className="text-5xl sm:text-6xl font-black text-brand-500">?</span>
      </div>
    </div>
  );
}
