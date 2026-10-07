/**
 * gameConfigs.js
 *
 * Game specifications and difficulty tiers for Syeds Academy.
 * Designed for Class 3 to Class 6 learners.
 */

import { DIFFICULTIES } from './tables.js';

export const GAME_TYPES = {
  multiplication: {
    id: 'multiplication',
    title: 'Multiplication Challenge',
    shortName: 'Multiplication',
    symbol: '×',
    badge: 'Available',
    description: 'Practice multiplication tables with timed questions.',
    tagline: 'Class 3–6 · Tables & Mental Math',
    accentColor: 'blue',
    difficulties: DIFFICULTIES,
  },

  addition: {
    id: 'addition',
    title: 'Addition Challenge',
    shortName: 'Addition',
    symbol: '+',
    badge: 'Available',
    description: 'Improve your addition speed and accuracy.',
    tagline: 'Class 3–6 · Fast Column & Mental Addition',
    accentColor: 'emerald',
    difficulties: {
      easy: {
        id: 'easy',
        label: 'Easy',
        tagline: 'Single digits & sums to 20',
        questions: 10,
        secondsPerQuestion: 10,
        emoji: '🌱',
      },
      medium: {
        id: 'medium',
        label: 'Medium',
        tagline: '2-digit addition up to 100',
        questions: 15,
        secondsPerQuestion: 8,
        emoji: '⚡',
      },
      hard: {
        id: 'hard',
        label: 'Hard',
        tagline: '3-digit addition up to 500',
        questions: 20,
        secondsPerQuestion: 7,
        emoji: '🔥',
      },
    },
  },

  subtraction: {
    id: 'subtraction',
    title: 'Subtraction Challenge',
    shortName: 'Subtraction',
    symbol: '−',
    badge: 'Available',
    description: 'Master subtraction with clean, positive numbers.',
    tagline: 'Class 3–6 · Regrouping & Mental Speed',
    accentColor: 'amber',
    difficulties: {
      easy: {
        id: 'easy',
        label: 'Easy',
        tagline: 'Numbers within 20 · No negatives',
        questions: 10,
        secondsPerQuestion: 10,
        emoji: '🐥',
      },
      medium: {
        id: 'medium',
        label: 'Medium',
        tagline: '2-digit subtraction with borrowing',
        questions: 15,
        secondsPerQuestion: 8,
        emoji: '⚡',
      },
      hard: {
        id: 'hard',
        label: 'Hard',
        tagline: '3-digit subtraction up to 500',
        questions: 20,
        secondsPerQuestion: 7,
        emoji: '🔥',
      },
    },
  },

  division: {
    id: 'division',
    title: 'Division Challenge',
    shortName: 'Division',
    symbol: '÷',
    badge: 'Available',
    description: 'Practice division without remainders.',
    tagline: 'Class 3–6 · Clean Division Facts',
    accentColor: 'violet',
    difficulties: {
      easy: {
        id: 'easy',
        label: 'Easy',
        tagline: 'Divide by 2, 3, 5, 10',
        questions: 10,
        secondsPerQuestion: 10,
        emoji: '🎈',
      },
      medium: {
        id: 'medium',
        label: 'Medium',
        tagline: 'Tables 2–10 division facts',
        questions: 15,
        secondsPerQuestion: 8,
        emoji: '⚡',
      },
      hard: {
        id: 'hard',
        label: 'Hard',
        tagline: 'Divide up to 12 & 2-digit answers',
        questions: 20,
        secondsPerQuestion: 7,
        emoji: '🔥',
      },
    },
  },
};
