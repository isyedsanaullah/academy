import { SCORING_RULES, getFeedback } from '../data/tables';

/**
 * Calculate final score and stats from an array of answer records.
 *
 * Each answer record shape:
 * {
 *   questionObj:    { display, multiplier, multiplicand, answer, ... },
 *   expectedAnswer: number,
 *   selectedAnswer: number | null,
 *   status:         'correct' | 'incorrect' | 'timeout',
 * }
 */
export function calculateScore(answers) {
  let score = 0;
  let correct = 0;
  let incorrect = 0;
  let timeout = 0;

  // Track mistake count per table number (both operands)
  const mistakeMap = {};

  answers.forEach(ans => {
    switch (ans.status) {
      case 'correct':
        score += SCORING_RULES.correct;
        correct++;
        break;
      case 'incorrect':
        score += SCORING_RULES.incorrect;
        incorrect++;
        recordMistake(mistakeMap, ans.questionObj.multiplier);
        recordMistake(mistakeMap, ans.questionObj.multiplicand);
        break;
      case 'timeout':
        score += SCORING_RULES.timeout;
        timeout++;
        recordMistake(mistakeMap, ans.questionObj.multiplier);
        recordMistake(mistakeMap, ans.questionObj.multiplicand);
        break;
      default:
        break;
    }
  });

  const totalQuestions = answers.length;
  const accuracy = totalQuestions === 0
    ? 0
    : Math.round((correct / totalQuestions) * 100);

  // Detect weak tables: top 3 table numbers with most mistakes
  // Exclude 0 (trivial) and 1 (trivial) unless everything is weak
  let weakTables = Object.entries(mistakeMap)
    .map(([table, count]) => ({ table: Number(table), count }))
    .sort((a, b) => b.count - a.count)
    .map(e => e.table);

  // Filter out 0 and 1 if there are other tables to show
  const significantWeak = weakTables.filter(t => t > 1);
  weakTables = significantWeak.length > 0 ? significantWeak.slice(0, 3) : weakTables.slice(0, 3);

  const feedback = getFeedback(accuracy);

  return {
    score,
    totalQuestions,
    correct,
    incorrect,
    timeout,
    accuracy,
    weakTables,
    feedback,
  };
}

function recordMistake(map, tableNum) {
  map[tableNum] = (map[tableNum] ?? 0) + 1;
}
