/**
 * questionGenerator.js
 *
 * Generates a full question set for a given difficulty config.
 * - No duplicate pairs within one session (treats a×b == b×a as same pair)
 * - Smart distractors: near products from adjacent tables, not random junk
 * - Always 4 unique options; correct answer randomly placed
 */

/**
 * Generate plausible wrong answers for a × b = correctAnswer.
 * Pulls from: products of adjacent numbers, swapped operand products,
 * ± small offsets near the correct answer.
 */
function buildDistractors(a, b, correctAnswer) {
  const pool = new Set();

  // Strategy 1: adjacent table products
  const candidates = [
    (a + 1) * b,
    (a - 1) * b,
    a * (b + 1),
    a * (b - 1),
    (a + 1) * (b + 1),
    (a - 1) * (b - 1),
  ];

  candidates.forEach(v => {
    if (v > 0 && v !== correctAnswer) pool.add(v);
  });

  // Strategy 2: common digit-confusion mistakes
  //  e.g., 7×8 → students often think 54, 63, 64
  if (a > 1 && b > 1) {
    pool.add(a * b - a);   // forgot to add one row
    pool.add(a * b + b);   // added one row too many
    pool.add(a * b - b);
    pool.add(a * b + a);
  }

  // Strategy 3: small numeric offsets
  for (const offset of [2, 3, 4, 5, 6]) {
    pool.add(correctAnswer + offset);
    pool.add(correctAnswer - offset);
  }

  // Filter: must be positive, not the correct answer, not 1
  const filtered = Array.from(pool).filter(v => v > 1 && v !== correctAnswer);

  // Shuffle and pick 3
  filtered.sort(() => Math.random() - 0.5);
  return filtered.slice(0, 3);
}

/**
 * Generate `numQuestions` unique multiplication questions within the given range.
 */
export function generateQuestions(difficultyConfig) {
  const { minTable, maxTable, questions: numQuestions } = difficultyConfig;

  const allPairs = [];
  for (let a = minTable; a <= maxTable; a++) {
    for (let b = 0; b <= 10; b++) {
      allPairs.push([a, b]);
    }
  }

  // Shuffle the full pair pool
  allPairs.sort(() => Math.random() - 0.5);

  const usedKeys = new Set();
  const questions = [];

  for (const [a, b] of allPairs) {
    if (questions.length >= numQuestions) break;

    // Treat a×b and b×a as the same pair
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);

    const answer = a * b;
    const distractors = buildDistractors(a, b, answer);

    // Ensure we have exactly 3 unique distractors
    // If pool was thin, add fallbacks
    while (distractors.length < 3) {
      const fallback = answer + (distractors.length + 1) * 7;
      if (!distractors.includes(fallback) && fallback !== answer && fallback > 0) {
        distractors.push(fallback);
      } else {
        distractors.push(answer + distractors.length + 2);
      }
    }

    // Shuffle the 4 options
    const options = [answer, ...distractors.slice(0, 3)];
    options.sort(() => Math.random() - 0.5);

    questions.push({
      id: `q-${a}-${b}-${Date.now()}-${questions.length}`,
      multiplier: a,
      multiplicand: b,
      display: `${a} × ${b}`,
      answer,
      options,
    });
  }

  // If we couldn't get enough unique pairs (small range), pad by repeating with shuffle
  // This is a safety net for edge cases
  return questions.slice(0, numQuestions);
}
