import { useState, useEffect, useRef } from 'react';

/**
 * Timer — Countdown timer for MCQ quizzes.
 *
 * Supports both prop styles:
 *   totalSeconds / duration
 *   isActive / isPaused
 */
export default function Timer({
  totalSeconds,
  duration,
  isActive,
  isPaused,
  onTimeout,
  resetKey,
}) {
  const initialSeconds = Number(duration || totalSeconds) || 8;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const firedRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);

  // Keep callback ref updated
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  // Determine active running state
  const isRunning =
    isActive !== undefined ? Boolean(isActive) : isPaused !== undefined ? !isPaused : true;

  // Reset when question / resetKey changes or when duration changes
  useEffect(() => {
    setTimeLeft(initialSeconds);
    firedRef.current = false;
  }, [resetKey, initialSeconds]);

  // Interval countdown
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!firedRef.current) {
            firedRef.current = true;
            setTimeout(() => {
              if (onTimeoutRef.current) onTimeoutRef.current();
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, resetKey]);

  // Visual percentages & ring calculation
  const pct = initialSeconds > 0 ? (timeLeft / initialSeconds) * 100 : 0;
  const radius = 24;
  const circumference = 2 * Math.PI * radius; // ~150.8
  const dashOffset = circumference - (pct / 100) * circumference;

  let ringColor = '#3b82f6'; // blue
  let textColor = '#2563eb';
  if (pct <= 30) {
    ringColor = '#ef4444'; // red
    textColor = '#dc2626';
  } else if (pct <= 60) {
    ringColor = '#f59e0b'; // amber
    textColor = '#d97706';
  }

  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      <div className="relative w-14 h-14 sm:w-16 sm:h-16">
        <svg className="w-full h-full" viewBox="0 0 60 60" aria-hidden="true">
          {/* Background Track */}
          <circle cx="30" cy="30" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4.5" />
          {/* Animated Countdown Ring */}
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transformOrigin: '30px 30px',
              transform: 'rotate(-90deg)',
              transition: 'stroke-dashoffset 0.8s linear, stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Seconds text */}
        <div
          className="absolute inset-0 flex items-center justify-center font-black text-lg sm:text-xl tabular-nums transition-colors duration-300"
          style={{ color: textColor }}
        >
          {timeLeft}
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">sec</span>
    </div>
  );
}
