// ─── Difficulty Configuration ─────────────────────────────────────────────
// Single source of truth. Change numbers here to affect the whole game engine.
export const DIFFICULTIES = {
  easy: {
    id: 'easy',
    label: 'Easy',
    emoji: '😊',
    tagline: 'Great for beginners',
    minTable: 0,
    maxTable: 5,
    questions: 10,
    secondsPerQuestion: 10,
    colorClass: 'emerald',
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    emoji: '⚡',
    tagline: 'Build your confidence',
    minTable: 0,
    maxTable: 10,
    questions: 15,
    secondsPerQuestion: 8,
    colorClass: 'blue',
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    emoji: '🔥',
    tagline: 'Challenge yourself',
    minTable: 0,
    maxTable: 10,
    questions: 20,
    secondsPerQuestion: 5,
    colorClass: 'violet',
  },
};

// ─── Scoring rules ────────────────────────────────────────────────────────
// Structured for easy future extension (speed bonus, XP, streaks, etc.)
export const SCORING_RULES = {
  correct: 1,
  incorrect: 0,
  timeout: 0,
};

// ─── Performance feedback thresholds ─────────────────────────────────────
export const PERFORMANCE_THRESHOLDS = [
  {
    min: 90, max: 100,
    label: 'Excellent work! ⭐',
    message: 'Your multiplication skills are very strong. Keep it up!',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
  },
  {
    min: 70, max: 89,
    label: 'Great job! 👏',
    message: 'A little more practice can make you even faster.',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
  },
  {
    min: 50, max: 69,
    label: 'Good effort! 💪',
    message: 'Practice the tables you missed and try again.',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
  },
  {
    min: 0, max: 49,
    label: 'Keep practicing! 📚',
    message: "Let's focus on the tables that were difficult. You can do it!",
    colorClass: 'text-rose-600',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
  },
];

// ─── Helper: get feedback from accuracy ──────────────────────────────────
export function getFeedback(accuracy) {
  return (
    PERFORMANCE_THRESHOLDS.find(t => accuracy >= t.min && accuracy <= t.max)
    ?? PERFORMANCE_THRESHOLDS[PERFORMANCE_THRESHOLDS.length - 1]
  );
}

// ─── localStorage keys ────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  studentName:    'mathPractice:studentName',
  bestScores:     'mathPractice:bestScores',
  lastResult:     'mathPractice:lastResult',
  lastDifficulty: 'mathPractice:lastDifficulty',
};
