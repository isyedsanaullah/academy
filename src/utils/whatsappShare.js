/**
 * whatsappShare.js
 *
 * GLOBAL sharing utility for ALL Syeds Academy games.
 *
 * Share strategy:
 *   1. Result is encoded as URL-safe base64 JSON into query param `?share=`
 *   2. The student shares: https://syedsacademy.onrender.com/results?share=<base64>
 *   3. Teacher opens the link → sees a read-only result card (decoded client-side)
 *
 * SECURITY NOTE: This is a frontend-only implementation.
 * The encoded URL contains the full result payload. Anyone with the link can read it.
 * This is intentional for a no-backend setup — treat decoded data as untrusted input.
 * A future backend can replace this with an opaque server-stored result ID.
 *
 * Supported games: multiplication, addition, subtraction, division, fractions, any new game.
 */

import { APP_URL, TEACHER_WA_NUMBER, getAppUrl } from '../config.js';

// ─── Compact status map (smaller URLs) ────────────────────────────────────────
const STATUS_MAP     = { correct: 'c', incorrect: 'i', timeout: 't' };
const STATUS_REVERSE = { c: 'correct', i: 'incorrect', t: 'timeout' };

// ─── URL-safe base64 helpers ──────────────────────────────────────────────────
function toBase64URL(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function fromBase64URL(encoded) {
  const pad    = encoded.length % 4;
  const padded = pad > 0 ? encoded + '='.repeat(4 - pad) : encoded;
  return decodeURIComponent(escape(atob(padded.replace(/-/g, '+').replace(/_/g, '/'))));
}

// ─── Device detection ─────────────────────────────────────────────────────────
export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || '');
}

// ─── Fallback feedback (if no game-specific feedback available) ───────────────
function defaultFeedback(accuracy) {
  if (accuracy >= 90) return { label: 'Excellent work! ⭐', message: 'Outstanding performance!',   colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200' };
  if (accuracy >= 70) return { label: 'Great job! 👏',     message: 'A little more practice and you\'ll be unbeatable.', colorClass: 'text-blue-600',    bgClass: 'bg-blue-50',    borderClass: 'border-blue-200' };
  if (accuracy >= 50) return { label: 'Good effort! 💪',   message: 'Review the questions you missed and try again.',    colorClass: 'text-amber-600',   bgClass: 'bg-amber-50',   borderClass: 'border-amber-200' };
  return                     { label: 'Keep practicing! 📚', message: 'Practice makes perfect. You can do it!',          colorClass: 'text-rose-600',    bgClass: 'bg-rose-50',    borderClass: 'border-rose-200' };
}

// ─── Encode result → URL-safe string ─────────────────────────────────────────
/**
 * Encodes any game result into a URL-safe base64 string.
 * Accepts a normalized result object from ANY game.
 *
 * Required fields:
 *   gameType, gameTitle, difficultyId, difficultyLabel,
 *   studentName, score, totalQuestions, correct, incorrect, timeout, accuracy
 *
 * Optional fields:
 *   weakTables, tableRange, answers[]
 */
export function encodeResult(result) {
  const compact = {
    v:  2,                                                          // schema version
    gt: result.gameType      || 'unknown',                         // game type key
    gn: result.gameTitle     || 'Math Challenge',                  // game display name
    n:  result.studentName   || 'Student',
    di: result.difficultyId  || 'medium',
    dl: result.difficultyLabel || 'Medium',
    tr: result.tableRange    || '',
    s:  result.score         ?? 0,
    tq: result.totalQuestions ?? 0,
    c:  result.correct       ?? 0,
    ic: result.incorrect     ?? 0,
    to: result.timeout       ?? 0,
    ac: result.accuracy      ?? 0,
    wk: result.weakTables    || [],
    dt: new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }),
    an: (result.answers || []).map(a => [
      a.questionObj?.display  || '',
      a.expectedAnswer        ?? a.correctAnswer ?? '',
      a.selectedAnswer        ?? a.selected      ?? '',
      STATUS_MAP[a.status]    ?? a.status,
    ]),
  };
  return toBase64URL(JSON.stringify(compact));
}

// ─── Decode URL string → result object ───────────────────────────────────────
/**
 * Decodes an encoded result payload back into a result object.
 * Handles both v1 (multiplication-only) and v2 (all games) schemas.
 * Returns null on any error — always validate before rendering.
 */
export function decodeResult(encoded) {
  if (!encoded || typeof encoded !== 'string') return null;
  // Reasonable payload size limit — prevents processing massive URLs
  if (encoded.length > 8000) return null;

  try {
    const compact  = JSON.parse(fromBase64URL(encoded));
    const accuracy = compact.ac ?? 0;
    const feedback = defaultFeedback(accuracy);

    return {
      // Schema version (use to handle future migrations)
      _schemaVersion:  compact.v ?? 1,

      // Game identity
      gameType:        compact.gt || 'multiplication',
      gameTitle:       compact.gn || compact.gt || 'Math Challenge',

      // Student & difficulty
      studentName:     compact.n  || 'Student',
      difficultyId:    compact.di || 'medium',
      difficultyLabel: compact.dl || 'Medium',
      tableRange:      compact.tr || '',

      // Scores
      score:           compact.s  ?? 0,
      totalQuestions:  compact.tq ?? 0,
      correct:         compact.c  ?? 0,
      incorrect:       compact.ic ?? 0,
      timeout:         compact.to ?? 0,
      accuracy,

      // Extra info
      weakTables:      compact.wk || [],
      date:            compact.dt || '',
      feedback,

      // Per-question breakdown
      answers: (compact.an || []).map(([display, expected, selected, status]) => ({
        questionObj:    { display },
        expectedAnswer: expected,
        selectedAnswer: selected === '' ? null : selected,
        status:         STATUS_REVERSE[status] ?? status,
      })),
    };
  } catch {
    return null;
  }
}

// ─── Build shareable result URL ───────────────────────────────────────────────
export function getShareURL(result) {
  const encoded = encodeResult(result);
  const baseUrl = getAppUrl();
  return `${baseUrl}/results?share=${encoded}`;
}

// ─── Format readable WhatsApp message for any game ────────────────────────────
export function formatWhatsAppMessage(result) {
  const student    = result.studentName?.trim() || 'Student';
  const gameTitle  = result.gameTitle  || result.gameName || 'Math Challenge';
  const difficulty = result.difficultyLabel || 'Medium';
  const tableInfo  = result.tableRange ? `*Tables/Range:* ${result.tableRange}\n` : '';
  const score      = result.score    ?? 0;
  const total      = result.totalQuestions ?? 0;
  const accuracy   = result.accuracy ?? (total > 0 ? Math.round((score / total) * 100) : 0);
  const correct    = result.correct  ?? 0;
  const incorrect  = result.incorrect ?? 0;
  const timeouts   = result.timeout  ?? 0;

  // Completed timestamp
  const completed = new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });

  // Weak tables (only relevant for multiplication)
  let weakText = '';
  if (Array.isArray(result.weakTables) && result.weakTables.length > 0) {
    weakText = `*Weak Tables:*\n${result.weakTables.map(t => `×${t}`).join(', ')}\n\n`;
  }

  const teacherResultCardUrl = getShareURL(result);
  const appBaseUrl           = APP_URL;

  return (
    `*Syeds Academy — Game Results*\n\n` +
    `*Student:* ${student}\n\n` +
    `*Game:* ${gameTitle}\n` +
    `*Difficulty:* ${difficulty}\n` +
    tableInfo +
    `\n` +
    `*Score:* ${score}/${total}\n` +
    `*Accuracy:* ${accuracy}%\n\n` +
    `*Correct:* ${correct}\n` +
    `*Incorrect:* ${incorrect}\n` +
    `*Time Outs:* ${timeouts}\n\n` +
    `*Completed:* ${completed}\n\n` +
    weakText +
    `*Teacher Result Card:*\n` +
    `${teacherResultCardUrl}\n\n` +
    `*Practice Again:*\n` +
    `${appBaseUrl}`
  );
}

// ─── Build WhatsApp link → direct to teacher ──────────────────────────────────
export function getWhatsAppLink(result) {
  const message     = formatWhatsAppMessage(result);
  const phone       = TEACHER_WA_NUMBER ? TEACHER_WA_NUMBER.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(message);

  // Desktop: use web.whatsapp.com (avoids whatsapp:// protocol error in browsers)
  if (typeof window !== 'undefined' && !isMobileDevice()) {
    return phone
      ? `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}`
      : `https://web.whatsapp.com/send?text=${encodedText}`;
  }

  // Mobile: use wa.me which opens the native WhatsApp app
  return phone
    ? `https://wa.me/${phone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
}

// ─── Normalize result from any game into a standard shape ─────────────────────
/**
 * buildGameResult — creates a normalized result object from any game's internal state.
 *
 * Games can pass their own field names; this function maps them to the canonical schema.
 * Call this at the game boundary before navigating to /results or calling encodeResult().
 *
 * @param {object} raw - Game-specific result data
 * @returns {object}   - Normalized result conforming to the shared schema
 */
export function buildGameResult(raw) {
  const score    = raw.score   ?? raw.correct ?? 0;
  const total    = raw.totalQuestions ?? raw.total ?? 0;
  const correct  = raw.correct   ?? score;
  const incorrect = raw.incorrect ?? (total - correct - (raw.timeout ?? 0));
  const timeout  = raw.timeout   ?? 0;
  const accuracy = raw.accuracy  ?? (total > 0 ? Math.round((correct / total) * 100) : 0);

  return {
    gameType:        raw.gameType       || 'unknown',
    gameTitle:       raw.gameTitle      || raw.gameName || 'Math Challenge',
    difficultyId:    raw.difficultyId   || 'medium',
    difficultyLabel: raw.difficultyLabel || raw.difficulty || 'Medium',
    studentName:     raw.studentName    || raw.name || 'Student',
    score,
    totalQuestions:  total,
    correct,
    incorrect,
    timeout,
    accuracy,
    weakTables:      raw.weakTables     || [],
    tableRange:      raw.tableRange     || raw.tables || '',
    answers:         raw.answers        || [],
    startedAt:       raw.startedAt      || null,
    completedAt:     raw.completedAt    || Date.now(),
  };
}
