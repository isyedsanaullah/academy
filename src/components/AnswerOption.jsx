/**
 * AnswerOption — large touch-friendly button.
 *
 * state: 'default' | 'correct' | 'incorrect' | 'dimmed'
 * 'dimmed' = other options when one has been answered (not selected, not correct)
 */
export default function AnswerOption({ value, state, onClick, disabled }) {
  const handleClick = () => {
    if (!disabled) onClick(value);
  };

  let cls = 'answer-btn ';
  if (state === 'correct')   cls += 'correct';
  else if (state === 'incorrect') cls += 'incorrect';
  else if (state === 'dimmed')    cls += 'opacity-40';
  else if (disabled)              cls += 'disabled';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cls}
      aria-label={`Answer: ${value}`}
    >
      <span className="tabular-nums leading-none">{value}</span>
    </button>
  );
}
