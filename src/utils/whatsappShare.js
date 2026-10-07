/**
 * whatsappShare.js
 *
 * Share strategy:
 *   1. Result is encoded as URL-safe base64 JSON into the URL query param `?share=`
 *   2. The student shares:  https://yoursite.com/results?share=<base64>
 *   3. Teacher opens the link → sees a read-only result card (decoded client-side)
 *   4. Direct WhatsApp button sends a short message to teacher number with the link.
 *
 * This means:
 *   ✅ No backend required
 *   ✅ Link is self-contained (data lives in the URL)
 *   ✅ Student cannot easily tamper (base64 is not obvious)
 *   ✅ Teacher always sees a proper result card — not a wall of text
 */

import { getFeedback } from '../data/tables';

// ─── Teacher's WhatsApp number (international format, no +/spaces) ─────────
const TEACHER_WA_NUMBER = '923135013303';

// ─── Compact answer status map for smaller URL ────────────────────────────
const STATUS_MAP = { correct: 'c', incorrect: 'i', timeout: 't' };
const STATUS_REVERSE = { c: 'correct', i: 'incorrect', t: 'timeout' };

// ─── URL-safe base64 helpers ──────────────────────────────────────────────
function toBase64URL(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function fromBase64URL(encoded) {
  const pad = encoded.length % 4;
  const padded = pad > 0 ? encoded + '='.repeat(4 - pad) : encoded;
  return decodeURIComponent(escape(atob(padded.replace(/-/g, '+').replace(/_/g, '/'))));
}

// ─── Encode result → URL-safe string ─────────────────────────────────────
export function encodeResult(result) {
  const compact = {
    v: 1, // schema version for forward compat
    n:  result.studentName || 'Student',
    di: result.difficultyId,
    dl: result.difficultyLabel,
    tr: result.tableRange,
    s:  result.score,
    tq: result.totalQuestions,
    c:  result.correct,
    ic: result.incorrect,
    to: result.timeout,
    ac: result.accuracy,
    wk: result.weakTables || [],
    dt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    // Compact answers: [display, expectedAnswer, selectedAnswer|null, status]
    an: (result.answers || []).map(a => [
      a.questionObj.display,
      a.expectedAnswer,
      a.selectedAnswer ?? '',
      STATUS_MAP[a.status] ?? a.status,
    ]),
  };
  return toBase64URL(JSON.stringify(compact));
}

// ─── Decode URL string → result object ───────────────────────────────────
export function decodeResult(encoded) {
  try {
    const compact = JSON.parse(fromBase64URL(encoded));

    const accuracy = compact.ac ?? 0;
    const feedback = getFeedback(accuracy);

    return {
      studentName:    compact.n,
      difficultyId:   compact.di,
      difficultyLabel: compact.dl,
      tableRange:     compact.tr,
      score:          compact.s,
      totalQuestions: compact.tq,
      correct:        compact.c,
      incorrect:      compact.ic,
      timeout:        compact.to,
      accuracy,
      weakTables:     compact.wk || [],
      date:           compact.dt,
      feedback,
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

// ─── Build shareable result URL ───────────────────────────────────────────
export function getShareURL(result) {
  const encoded = encodeResult(result);
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
  // Works on both / and /results routes — always points to /results
  const origin = window.location.origin;
  return `${origin}/results?share=${encoded}`;
}

// ─── Build WhatsApp link → direct to teacher ──────────────────────────────
export function getWhatsAppLink(result) {
  const url = getShareURL(result);
  const name = result.studentName || 'Student';

  const text =
    `📚 Math Practice Result\n` +
    `Student: ${name}\n` +
    `Score: ${result.score}/${result.totalQuestions} (${result.accuracy}%)\n` +
    `Difficulty: ${result.difficultyLabel} | Tables ${result.tableRange}\n\n` +
    `Tap to see full result:\n${url}`;

  return `https://wa.me/${TEACHER_WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
