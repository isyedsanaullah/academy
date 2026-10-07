/**
 * whatsappShare.js
 *
 * Share strategy:
 *   1. Result is encoded as URL-safe base64 JSON into query param `?share=`
 *   2. The student shares: https://syedsacademy.onrender.com/results?share=<base64>
 *   3. Teacher opens the link → sees a read-only result card (decoded client-side)
 *   4. Direct WhatsApp message contains full result card link for the teacher.
 */

import { getFeedback } from '../data/tables.js';
import { APP_URL, TEACHER_WA_NUMBER, getAppUrl } from '../config.js';

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

// ─── Device detection ─────────────────────────────────────────────────────
export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || '');
}

// ─── Encode result → URL-safe string ─────────────────────────────────────
export function encodeResult(result) {
  const compact = {
    v: 1,
    n:  result.studentName || 'Student',
    di: result.difficultyId || 'medium',
    dl: result.difficultyLabel || 'Medium',
    gt: result.gameTitle || 'Multiplication Challenge',
    tr: result.tableRange || '',
    s:  result.score ?? 0,
    tq: result.totalQuestions ?? 0,
    c:  result.correct ?? 0,
    ic: result.incorrect ?? 0,
    to: result.timeout ?? 0,
    ac: result.accuracy ?? 0,
    wk: result.weakTables || [],
    dt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    an: (result.answers || []).map(a => [
      a.questionObj?.display || '',
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
      gameTitle:      compact.gt || 'Math Challenge',
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
  const baseUrl = getAppUrl();
  return `${baseUrl}/results?share=${encoded}`;
}

// ─── Format readable WhatsApp message ─────────────────────────────────────
export function formatWhatsAppMessage(result) {
  const student = result.studentName?.trim() || 'Student';
  const gameTitle = result.gameTitle || (result.tableNum ? `Table ${result.tableNum} Practice` : 'Multiplication Challenge');
  const difficulty = result.difficultyLabel || 'Medium';
  const tables = result.tableRange ? `Tables: ${result.tableRange}` : '';
  const score = result.score ?? 0;
  const total = result.totalQuestions ?? 0;
  const accuracy = result.accuracy ?? (total > 0 ? Math.round((score / total) * 100) : 0);
  const correct = result.correct ?? 0;
  const incorrect = result.incorrect ?? 0;
  const timeouts = result.timeout ?? 0;

  // Weak tables list
  let weakText = '';
  if (Array.isArray(result.weakTables) && result.weakTables.length > 0) {
    weakText = `*Weak Tables:*\n${result.weakTables.map(t => `×${t}`).join(', ')}\n\n`;
  }

  const appBaseUrl = APP_URL;
  const teacherResultCardUrl = getShareURL(result);

  return (
    `*Syeds Academy — Math Practice*\n\n` +
    `*Student:* ${student}\n\n` +
    `*Game:* ${gameTitle}\n` +
    `*Difficulty:* ${difficulty}\n` +
    (tables ? `*${tables}*\n` : '') +
    `\n` +
    `*Score:* ${score}/${total}\n` +
    `*Accuracy:* ${accuracy}%\n\n` +
    `*Correct:* ${correct}\n` +
    `*Incorrect:* ${incorrect}\n` +
    `*Time Outs:* ${timeouts}\n\n` +
    weakText +
    `*Teacher Result Card:*\n` +
    `${teacherResultCardUrl}\n\n` +
    `*Practice Again:*\n` +
    `${appBaseUrl}`
  );
}

// ─── Build WhatsApp link → direct to teacher ──────────────────────────────
export function getWhatsAppLink(result) {
  const message = formatWhatsAppMessage(result);
  const phone = TEACHER_WA_NUMBER ? TEACHER_WA_NUMBER.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(message);

  // If on desktop browser without whatsapp desktop protocol,
  // web.whatsapp.com directly opens WhatsApp Web without "whatsapp://" scheme error!
  if (typeof window !== 'undefined' && !isMobileDevice()) {
    return phone
      ? `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}`
      : `https://web.whatsapp.com/send?text=${encodedText}`;
  }

  // On mobile devices, wa.me opens the native WhatsApp app directly
  return phone
    ? `https://wa.me/${phone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
}
