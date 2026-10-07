import { SCORING_RULES, getFeedback } from '../data/tables.js';

/**
 * Calculate final score and stats from an array of answer records.
 * Works seamlessly across Multiplication, Addition, Subtraction, and Division games.
 */
export function calculateScore(answers) {
  let score = 0;
  let correct = 0;
  let incorrect = 0;
  let timeout = 0;

  // Track mistake count per table number (for multiplication)
  const mistakeMap = {};
  const weakQuestions = [];

  answers.forEach(ans => {
    const isMistake = ans.status === 'incorrect' || ans.status === 'timeout';

    if (ans.status === 'correct') {
      score += SCORING_RULES.correct;
      correct++;
    } else if (ans.status === 'incorrect') {
      score += SCORING_RULES.incorrect;
      incorrect++;
    } else if (ans.status === 'timeout') {
      score += SCORING_RULES.timeout;
      timeout++;
    }

    if (isMistake && ans.questionObj) {
      weakQuestions.push(ans.questionObj.display);

      if (ans.questionObj.multiplier != null) {
        recordMistake(mistakeMap, ans.questionObj.multiplier);
      }
      if (ans.questionObj.multiplicand != null) {
        recordMistake(mistakeMap, ans.questionObj.multiplicand);
      }
    }
  });

  const totalQuestions = answers.length;
  const accuracy = totalQuestions === 0
    ? 0
    : Math.round((correct / totalQuestions) * 100);

  // Detect weak tables (for multiplication games)
  let weakTables = Object.entries(mistakeMap)
    .filter(([table]) => table !== 'undefined' && table !== 'null')
    .map(([table, count]) => ({ table: Number(table), count }))
    .sort((a, b) => b.count - a.count)
    .map(e => e.table);

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
    weakQuestions: weakQuestions.slice(0, 4),
    feedback,
  };
}

function recordMistake(map, tableNum) {
  if (tableNum != null) {
    map[tableNum] = (map[tableNum] ?? 0) + 1;
  }
}
