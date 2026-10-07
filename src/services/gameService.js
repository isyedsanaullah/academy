/**
 * gameService.js
 *
 * Abstracts all localStorage operations behind a clean API.
 * In the future, replace these functions with API calls — no UI changes needed.
 */

import { STORAGE_KEYS } from '../data/tables';

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable (private mode, storage full, etc.) — fail silently
  }
}

export const gameService = {
  // ── Student name ────────────────────────────────────────────────────────
  getStudentName() {
    try {
      return localStorage.getItem(STORAGE_KEYS.studentName) ?? '';
    } catch {
      return '';
    }
  },

  setStudentName(name) {
    try {
      localStorage.setItem(STORAGE_KEYS.studentName, name);
    } catch {
      // ignore
    }
  },

  // ── Last selected difficulty ────────────────────────────────────────────
  getLastDifficulty() {
    try {
      return localStorage.getItem(STORAGE_KEYS.lastDifficulty) ?? 'easy';
    } catch {
      return 'easy';
    }
  },

  setLastDifficulty(difficultyId) {
    try {
      localStorage.setItem(STORAGE_KEYS.lastDifficulty, difficultyId);
    } catch {
      // ignore
    }
  },

  // ── Last selected Easy table range ('0-5' or '6-10') ───────────────────
  getLastEasyRange() {
    try {
      return localStorage.getItem(STORAGE_KEYS.lastEasyRange) ?? '0-5';
    } catch {
      return '0-5';
    }
  },

  setLastEasyRange(rangeId) {
    try {
      localStorage.setItem(STORAGE_KEYS.lastEasyRange, rangeId);
    } catch {
      // ignore
    }
  },

  // ── Best scores ─────────────────────────────────────────────────────────
  getBestScores() {
    return safeGet(STORAGE_KEYS.bestScores, {
      easy: 0,
      easy_0_5: 0,
      easy_6_10: 0,
      medium: 0,
      hard: 0,
      expert: 0,
      master: 0,
    });
  },

  /**
   * Update best score for a difficulty key.
   * Supports 'easy_0_5', 'easy_6_10', 'medium', 'hard', 'expert', 'master'
   * @returns {boolean} true if this was a new personal best
   */
  updateBestScore(key, newScore) {
    const scores = this.getBestScores();
    const previous = scores[key] ?? 0;
    let isNewBest = false;

    if (newScore > previous) {
      scores[key] = newScore;
      isNewBest = true;
    }

    // Keep top-level easy in sync
    if (key === 'easy_0_5' || key === 'easy_6_10') {
      scores.easy = Math.max(scores.easy_0_5 || 0, scores.easy_6_10 || 0);
    }

    if (isNewBest) {
      safeSet(STORAGE_KEYS.bestScores, scores);
    }
    return isNewBest;
  },

  // ── Save full result ────────────────────────────────────────────────────
  /**
   * Persist the result and update best score.
   * @returns {{ isNewBest: boolean, previousBest: number, scoreKey: string }}
   */
  saveResult(result) {
    let scoreKey = result.difficultyId || 'medium';
    if (result.difficultyId === 'easy') {
      if (result.tableRange && (result.tableRange.includes('6–10') || result.tableRange.includes('6-10'))) {
        scoreKey = 'easy_6_10';
      } else {
        scoreKey = 'easy_0_5';
      }
    }

    const previousBest = (this.getBestScores())[scoreKey] ?? 0;
    const isNewBest = this.updateBestScore(scoreKey, result.score);

    // Store compact version (without full answers array — saves space)
    const compact = {
      difficultyId:    result.difficultyId,
      difficultyLabel: result.difficultyLabel,
      scoreKey,
      tableRange:      result.tableRange,
      score:           result.score,
      totalQuestions:  result.totalQuestions,
      accuracy:        result.accuracy,
      savedAt:         Date.now(),
    };
    safeSet(STORAGE_KEYS.lastResult, compact);

    return { isNewBest, previousBest, scoreKey };
  },

  // ── Last result (compact, for home screen preview) ──────────────────────
  getLastResult() {
    return safeGet(STORAGE_KEYS.lastResult, null);
  },
};
