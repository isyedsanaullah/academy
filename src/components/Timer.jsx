import { useState, useEffect, useRef } from 'react';

/**
 * Timer — stable interval-based countdown with double-fire guard.
 *
 * Props:
 *   totalSeconds  — how long each question gets
 *   isActive      — false when answer is locked; stops the interval
 *   onTimeout     — called exactly once when time reaches 0
 *   resetKey      — change this to reset the timer (use question id or index)
 */
export default function Timer({ totalSeconds, isActive, onTimeout, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const firedRef    = useRef(false);  // prevent double-fire
  const onTimeoutRef = useRef(onTimeout);

  // Keep callback ref current without re-running effect
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  // Reset when question changes
  useEffect(() => {
    setTimeLeft(totalSeconds);
    firedRef.current = false;
  }, [resetKey, totalSeconds]);

  // Countdown interval
  useEffect(() => {
    if (!isActive) return; // paused — don't start interval

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!firedRef.current) {
            firedRef.current = true;
            // Defer so state settles before parent state changes
            setTimeout(() => onTimeoutRef.current(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval); // cleanup on isActive change or unmount
  }, [isActive, resetKey]); // resetKey restarts the interval for the new question

  // ── Visual ──────────────────────────────────────────────────────────────
  const pct = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  const radius = 26;
  const circumference = 2 * Math.PI * radius; // ~163
  const dashOffset = circumference - (pct / 100) * circumference;

  let ringColor = '#3b82f6';   // blue — plenty of time
  let textColor = '#2563eb';
  if (pct <= 30) {
    ringColor = '#ef4444';     // red — urgent
    textColor = '#dc2626';
  } else if (pct <= 60) {
    ringColor = '#f59e0b';     // amber — getting tight
    textColor = '#d97706';
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full" viewBox="0 0 60 60" aria-hidden="true">
          {/* Track */}
          <circle cx="30" cy="30" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
          {/* Countdown ring */}
          <circle
            cx="30" cy="30" r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="timer-ring"
            style={{ transformOrigin: '30px 30px', transform: 'rotate(-90deg)' }}
          />
        </svg>
        {/* Number */}
        <div
          className="absolute inset-0 flex items-center justify-center font-black text-xl tabular-nums transition-colors duration-300"
          style={{ color: textColor }}
        >
          {timeLeft}
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">sec</span>
    </div>
  );
}
