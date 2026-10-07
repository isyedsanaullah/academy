// ─── Difficulty Configuration ─────────────────────────────────────────────
// Single source of truth for Multiplication Tables Practice.
// 5 progressive difficulty levels designed for Class 3 to Class 6 students.
export const DIFFICULTIES = {
  easy: {
    id: 'easy',
    label: 'Easy',
    iconName: 'Smile',
    tagline: 'Build your confidence',
    defaultMinTable: 0,
    defaultMaxTable: 5,
    minTable: 0,
    maxTable: 5,
    questions: 10,
    secondsPerQuestion: 15,
    colorClass: 'emerald',
    tableRanges: [
      { id: '0-5', label: '0–5', sublabel: 'Beginner', minTable: 0, maxTable: 5 },
      { id: '6-10', label: '6–10', sublabel: 'Next Step', minTable: 6, maxTable: 10 },
    ],
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    iconName: 'Zap',
    tagline: 'Build speed & confidence',
    minTable: 0,
    maxTable: 10,
    questions: 15,
    secondsPerQuestion: 12,
    colorClass: 'blue',
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    iconName: 'Flame',
    tagline: 'Challenge yourself',
    minTable: 0,
    maxTable: 12,
    questions: 20,
    secondsPerQuestion: 10,
    colorClass: 'amber',
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    iconName: 'Brain',
    tagline: 'For strong math learners',
    minTable: 0,
    maxTable: 12,
    questions: 25,
    secondsPerQuestion: 8,
    colorClass: 'purple',
  },
  master: {
    id: 'master',
    label: 'Master',
    iconName: 'Trophy',
    tagline: 'Master multiplication under pressure',
    minTable: 0,
    maxTable: 12,
    questions: 30,
    secondsPerQuestion: 7,
    colorClass: 'rose',
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
  lastEasyRange:  'mathPractice:lastEasyRange',
};
