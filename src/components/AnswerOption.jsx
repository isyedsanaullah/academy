/**
 * AnswerOption — large touch-friendly button.
 *
 * state: 'default' | 'correct' | 'incorrect' | 'dimmed'
 * Displays clear ✓ and ✗ feedback markers upon selection.
 */
export default function AnswerOption({ value, state, onClick, disabled }) {
  const handleClick = () => {
    if (!disabled) onClick(value);
  };

  let cls = 'answer-btn relative flex items-center justify-center gap-2 ';
  if (state === 'correct') {
    cls += 'correct ring-4 ring-emerald-300 shadow-md scale-102 ';
  } else if (state === 'incorrect') {
    cls += 'incorrect ring-4 ring-rose-300 shadow-md ';
  } else if (state === 'dimmed') {
    cls += 'opacity-40 ';
  } else if (disabled) {
    cls += 'disabled ';
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cls}
      aria-label={`Answer: ${value}`}
    >
      <span className="tabular-nums leading-none text-2xl sm:text-3xl font-black">
        {value}
      </span>

      {state === 'correct' && (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-emerald-600 font-black text-base shadow-xs animate-zoom-in">
          ✓
        </span>
      )}

      {state === 'incorrect' && (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-600 text-white font-black text-base shadow-xs animate-zoom-in">
          ✗
        </span>
      )}
    </button>
  );
}
