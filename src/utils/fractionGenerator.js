/**
 * fractionGenerator.js
 *
 * Generates mathematically accurate fraction questions for Visual Fractions Challenge.
 * Each question has a shape, colored parts, total parts, and 4 unique answer options.
 *
 * SECURITY NOTE: This is a frontend-only, self-contained payload.
 * Anyone with the URL can read/modify content. A future backend would store results by ID.
 *
 * 5 Difficulty Levels:
 *   Easy   — 10Q, 15s, denominators 2–6,  simple identification
 *   Medium — 15Q, 12s, denominators 2–8,  more variety
 *   Hard   — 20Q, 10s, denominators 2–10, includes simplified fractions
 *   Expert — 25Q,  8s, denominators 2–12, equivalence questions
 *   Master — 30Q,  7s, denominators 2–12, full variety
 */

// ─── GCD helper ──────────────────────────────────────────────────────────────
export function gcd(a, b) {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

// ─── Simplify a fraction ──────────────────────────────────────────────────────
export function simplify(num, den) {
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

// ─── Format fraction as string ────────────────────────────────────────────────
export function formatFraction(num, den) {
  return `${num}/${den}`;
}

// ─── Difficulty config ────────────────────────────────────────────────────────
export const FRACTION_DIFFICULTIES = {
  easy: {
    id: 'easy',
    label: 'Easy',
    iconName: 'Smile',
    tagline: 'Discover Fractions',
    description: 'Learn to count colored parts',
    questions: 10,
    secondsPerQuestion: 15,
    minDenominator: 2,
    maxDenominator: 6,
    colorClass: 'emerald',
    allowSimplified: false,
    shapes: ['circle', 'rectangle', 'pizza'],
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    iconName: 'Zap',
    tagline: 'Build Confidence',
    description: 'More shapes and variety',
    questions: 15,
    secondsPerQuestion: 12,
    minDenominator: 2,
    maxDenominator: 8,
    colorClass: 'blue',
    allowSimplified: false,
    shapes: ['circle', 'rectangle', 'pizza', 'strip', 'grid'],
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    iconName: 'Flame',
    tagline: 'Think Carefully',
    description: 'Includes simplified fractions',
    questions: 20,
    secondsPerQuestion: 10,
    minDenominator: 2,
    maxDenominator: 10,
    colorClass: 'amber',
    allowSimplified: true,
    simplifiedChance: 0.3, // 30% of questions ask for simplified form
    shapes: ['circle', 'rectangle', 'pizza', 'strip', 'grid'],
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    iconName: 'Brain',
    tagline: 'Master Equivalence',
    description: 'Equivalence and simplification',
    questions: 25,
    secondsPerQuestion: 8,
    minDenominator: 2,
    maxDenominator: 12,
    colorClass: 'purple',
    allowSimplified: true,
    simplifiedChance: 0.5,
    shapes: ['circle', 'rectangle', 'pizza', 'strip', 'grid'],
  },
  master: {
    id: 'master',
    label: 'Master',
    iconName: 'Trophy',
    tagline: 'Fraction Champion',
    description: 'Full mastery — all types',
    questions: 30,
    secondsPerQuestion: 7,
    minDenominator: 2,
    maxDenominator: 12,
    colorClass: 'rose',
    allowSimplified: true,
    simplifiedChance: 0.6,
    shapes: ['circle', 'rectangle', 'pizza', 'strip', 'grid'],
  },
};

// ─── Fisher-Yates shuffle ─────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Random integer in [min, max] ─────────────────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Random shape from allowed set ───────────────────────────────────────────
function pickShape(shapes) {
  return shapes[Math.floor(Math.random() * shapes.length)];
}

/**
 * Build 3 unique distractors for a fraction question.
 * Distractors are plausible wrong answers (same denominator or nearby values).
 * Never include the correct answer or fractions with numerator > denominator.
 *
 * @param {number} correctNum - Correct numerator
 * @param {number} correctDen - Correct denominator
 * @param {number} totalParts - Total parts of the shape (for denominator variety)
 * @param {boolean} isSimplified - Whether correct answer is simplified
 * @returns {string[]} Array of 3 distinct distractor strings
 */
function buildDistractors(correctNum, correctDen, totalParts, isSimplified) {
  const correctStr = formatFraction(correctNum, correctDen);
  const candidates = new Set();

  // Same denominator, different numerators
  for (let n = 1; n <= correctDen; n++) {
    if (n !== correctNum) {
      const s = formatFraction(n, correctDen);
      if (s !== correctStr) candidates.add(s);
    }
  }

  // If simplified, add the unsimplified original as a distractor
  if (isSimplified && totalParts !== correctDen) {
    // The original (unsimplified) version — common student "mistake"
    // We know colored parts = correctNum * (totalParts/correctDen) if simplifed cleanly
    const g = gcd(correctNum * (totalParts / correctDen), totalParts);
    if (g > 0) {
      const origNum = (correctNum * (totalParts / correctDen));
      const origStr = formatFraction(origNum, totalParts);
      if (origStr !== correctStr) candidates.add(origStr);
    }
  }

  // Neighbouring denominators ±1
  for (const d of [correctDen - 1, correctDen + 1, correctDen + 2]) {
    if (d >= 2) {
      const n = randInt(1, d - 1);
      const s = formatFraction(n, d);
      if (s !== correctStr) candidates.add(s);
    }
  }

  // Always add a few more candidates to have enough choices
  for (let d = 2; d <= Math.min(12, totalParts + 2); d++) {
    for (let n = 1; n < d; n++) {
      const s = formatFraction(n, d);
      if (s !== correctStr) candidates.add(s);
      if (candidates.size > 20) break;
    }
    if (candidates.size > 20) break;
  }

  const pool = shuffle(Array.from(candidates));
  return pool.slice(0, 3);
}

/**
 * Validate a generated question for correctness.
 * Returns true if valid, false if it should be discarded.
 */
function validateQuestion(q) {
  if (!q) return false;
  if (q.coloredParts < 1) return false;                        // no zero-colored
  if (q.coloredParts >= q.totalParts) return false;            // no fully colored (not a fraction of the whole)
  if (q.options.length !== 4) return false;                    // must have exactly 4 options
  if (new Set(q.options).size !== 4) return false;             // must be unique
  if (!q.options.includes(q.correctAnswer)) return false;      // correct must be present
  return true;
}

/**
 * Generate a single fraction question for the given difficulty.
 *
 * @param {object} diffConfig - Difficulty configuration object
 * @param {number} qIndex - Question index (for ID uniqueness)
 * @returns {object|null} Question object or null if generation failed
 */
function generateOneQuestion(diffConfig, qIndex) {
  const { minDenominator, maxDenominator, allowSimplified, simplifiedChance = 0, shapes } = diffConfig;

  // Pick total parts (denominator of the visual shape)
  const totalParts = randInt(minDenominator, maxDenominator);

  // Pick colored parts (numerator): at least 1, at most totalParts-1
  const coloredParts = randInt(1, totalParts - 1);

  // Decide if this question asks for simplified form
  const { num: sNum, den: sDen } = simplify(coloredParts, totalParts);
  const isAlreadySimplified = (sNum === coloredParts && sDen === totalParts);
  const canSimplify = !isAlreadySimplified;
  const askSimplified = allowSimplified && canSimplify && Math.random() < simplifiedChance;

  // Correct answer
  const correctNum = askSimplified ? sNum : coloredParts;
  const correctDen = askSimplified ? sDen : totalParts;
  const correctAnswer = formatFraction(correctNum, correctDen);

  // Shape type
  const shapeType = pickShape(shapes);

  // Build distractors
  const distractors = buildDistractors(correctNum, correctDen, totalParts, askSimplified);
  if (distractors.length < 3) return null; // not enough distractors, skip

  const options = shuffle([correctAnswer, ...distractors]);

  // Question text
  const questionText = askSimplified
    ? 'What is the colored fraction in its simplest form?'
    : 'What fraction of the shape is colored?';

  const feedbackCorrect = askSimplified
    ? `${formatFraction(coloredParts, totalParts)} simplifies to ${correctAnswer} — both show the same colored area!`
    : `${coloredParts} out of ${totalParts} equal parts are colored, so the fraction is ${correctAnswer}.`;

  const feedbackIncorrect = askSimplified
    ? `The colored region is ${formatFraction(coloredParts, totalParts)}. In simplest form, ${feedbackCorrect}`
    : `Count the colored parts for the numerator (top) and all equal parts for the denominator (bottom).`;

  return {
    id: `frac-${qIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    shapeType,
    totalParts,
    coloredParts,
    askSimplified,
    correctAnswer,
    options,
    questionText,
    feedbackCorrect,
    feedbackIncorrect,
    // For answer breakdown display
    display: `${coloredParts}/${totalParts}${askSimplified ? ' (simplify)' : ''}`,
    answer: correctAnswer,
  };
}

/**
 * Generate a full set of questions for a given difficulty level.
 * Ensures variety in shapes and denominators. Retries on invalid questions.
 *
 * @param {string} difficultyId - One of: easy, medium, hard, expert, master
 * @returns {object[]} Array of validated question objects
 */
export function generateFractionQuestions(difficultyId = 'easy') {
  const diffConfig = FRACTION_DIFFICULTIES[difficultyId] || FRACTION_DIFFICULTIES.easy;
  const { questions: targetCount } = diffConfig;

  const questions = [];
  const usedKeys = new Set();
  let attempts = 0;
  const maxAttempts = targetCount * 10;

  while (questions.length < targetCount && attempts < maxAttempts) {
    attempts++;
    const q = generateOneQuestion(diffConfig, questions.length);
    if (!q) continue;
    if (!validateQuestion(q)) continue;

    // Avoid exact duplicate (same totalParts, coloredParts, askSimplified)
    const key = `${q.totalParts}-${q.coloredParts}-${q.askSimplified}`;
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);

    questions.push(q);
  }

  return questions;
}
