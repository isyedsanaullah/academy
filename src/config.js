/**
 * Application Configuration
 *
 * Centralized settings for Syeds Academy
 */

// Official Production URL
export const APP_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL) ||
  'https://syedsacademy.onrender.com';

// Teacher's WhatsApp Number (international format without + or spaces)
export const TEACHER_WA_NUMBER =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TEACHER_WA_NUMBER) ||
  '923135013303';

/**
 * Returns the effective base application URL.
 * Automatically avoids leaking localhost / 127.0.0.1 during local development
 * while using the live window origin in production deployments.
 */
export function getAppUrl() {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (
      hostname &&
      hostname !== 'localhost' &&
      hostname !== '127.0.0.1' &&
      !hostname.startsWith('192.168.') &&
      !hostname.startsWith('10.')
    ) {
      return window.location.origin;
    }
  }
  return APP_URL;
}
