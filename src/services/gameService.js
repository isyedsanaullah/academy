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
      return localStorage.getItem(STORAGE_KEYS.lastDifficulty) ?? 'medium';
    } catch {
      return 'medium';
    }
  },

  setLastDifficulty(difficultyId) {
    try {
      localStorage.setItem(STORAGE_KEYS.lastDifficulty, difficultyId);
    } catch {
      // ignore
    }
  },

  // ── Best scores ─────────────────────────────────────────────────────────
  getBestScores() {
    return safeGet(STORAGE_KEYS.bestScores, { easy: 0, medium: 0, hard: 0 });
  },

  /**
   * Update best score for a difficulty.
   * @returns {boolean} true if this was a new personal best
   */
  updateBestScore(difficultyId, newScore) {
    const scores = this.getBestScores();
    const previous = scores[difficultyId] ?? 0;
    if (newScore > previous) {
      scores[difficultyId] = newScore;
      safeSet(STORAGE_KEYS.bestScores, scores);
      return true;
    }
    return false;
  },

  // ── Save full result ────────────────────────────────────────────────────
  /**
   * Persist the result and update best score.
   * @returns {{ isNewBest: boolean, previousBest: number }}
   */
  saveResult(result) {
    const previousBest = (this.getBestScores())[result.difficultyId] ?? 0;
    const isNewBest = this.updateBestScore(result.difficultyId, result.score);

    // Store compact version (without full answers array — saves space)
    const compact = {
      difficultyId:   result.difficultyId,
      difficultyLabel: result.difficultyLabel,
      score:          result.score,
      totalQuestions: result.totalQuestions,
      accuracy:       result.accuracy,
      savedAt:        Date.now(),
    };
    safeSet(STORAGE_KEYS.lastResult, compact);

    return { isNewBest, previousBest };
  },

  // ── Last result (compact, for home screen preview) ──────────────────────
  getLastResult() {
    return safeGet(STORAGE_KEYS.lastResult, null);
  },
};
