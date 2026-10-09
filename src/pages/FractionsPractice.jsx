import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Smile, Zap, Flame, Brain, Trophy, Check, ArrowLeft } from 'lucide-react';

import { FRACTION_DIFFICULTIES, generateFractionQuestions, formatFraction } from '../utils/fractionGenerator.js';
import { gameService } from '../services/gameService.js';
import { encodeResult, isMobileDevice } from '../utils/whatsappShare.js';
import { APP_URL, TEACHER_WA_NUMBER, getAppUrl } from '../config.js';

import FractionShape from '../components/fractions/FractionShape.jsx';
import Timer from '../components/Timer.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

// ── Phase enum ────────────────────────────────────────────────────────────────
const PHASE = { SETUP: 'setup', PLAYING: 'playing', RESULTS: 'results' };

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICON_MAP = { Smile, Zap, Flame, Brain, Trophy };

// ── Color schemes per difficulty ──────────────────────────────────────────────
const DIFF_COLOR = {
  easy:   { scheme: 'emerald', ring: 'ring-emerald-400', bg: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800', card: 'border-emerald-300 bg-emerald-50' },
  medium: { scheme: 'blue',    ring: 'ring-blue-400',    bg: 'bg-blue-600',    badge: 'bg-blue-100 text-blue-800',       card: 'border-blue-300 bg-blue-50' },
  hard:   { scheme: 'amber',   ring: 'ring-amber-400',   bg: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-800',     card: 'border-amber-300 bg-amber-50' },
  expert: { scheme: 'default', ring: 'ring-purple-400',  bg: 'bg-purple-600',  badge: 'bg-purple-100 text-purple-800',   card: 'border-purple-300 bg-purple-50' },
  master: { scheme: 'rose',    ring: 'ring-rose-400',    bg: 'bg-rose-600',    badge: 'bg-rose-100 text-rose-800',       card: 'border-rose-300 bg-rose-50' },
};

// ─── WhatsApp sharing for fractions ──────────────────────────────────────────
function buildFractionResult(state) {
  const { answers, difficulty, studentName, startedAt } = state;
  const cfg = FRACTION_DIFFICULTIES[difficulty] || FRACTION_DIFFICULTIES.easy;

  const correct   = answers.filter(a => a.status === 'correct').length;
  const incorrect = answers.filter(a => a.status === 'incorrect').length;
  const timeout   = answers.filter(a => a.status === 'timeout').length;
  const score     = correct;
  const total     = answers.length;
  const accuracy  = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    gameType:        'fractions',
    gameTitle:       'Visual Fractions Challenge',
    difficultyId:    difficulty,
    difficultyLabel: cfg.label,
    studentName:     studentName || 'Student',
    score,
    totalQuestions:  total,
    correct,
    incorrect,
    timeout,
    accuracy,
    weakTables:      [],
    tableRange:      `Denominators ${cfg.minDenominator}–${cfg.maxDenominator}`,
    startedAt,
    completedAt:     Date.now(),
    answers: answers.map(a => ({
      questionObj:    { display: a.question?.display || '' },
      expectedAnswer: a.question?.answer || a.correctAnswer || '',
      selectedAnswer: a.selected ?? null,
      status:         a.status,
    })),
  };
}

function getFractionsShareURL(result) {
  const encoded = encodeResult(result);
  return `${getAppUrl()}/results?share=${encoded}`;
}

function getFractionsWhatsAppLink(result) {
  const student   = result.studentName?.trim() || 'Student';
  const score     = result.score ?? 0;
  const total     = result.totalQuestions ?? 0;
  const accuracy  = result.accuracy ?? 0;
  const correct   = result.correct ?? 0;
  const incorrect = result.incorrect ?? 0;
  const timeouts  = result.timeout ?? 0;
  const completed = new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
  const shareURL  = getFractionsShareURL(result);
  const appUrl    = APP_URL;
  const phone     = TEACHER_WA_NUMBER ? TEACHER_WA_NUMBER.replace(/[^0-9]/g, '') : '';

  const message =
    `*Syeds Academy — Game Results*\n\n` +
    `*Student:* ${student}\n\n` +
    `*Game:* ${result.gameTitle || 'Visual Fractions Challenge'}\n` +
    `*Difficulty:* ${result.difficultyLabel || 'Easy'}\n` +
    `*Tables:* ${result.tableRange || ''}\n\n` +
    `*Score:* ${score}/${total}\n` +
    `*Accuracy:* ${accuracy}%\n\n` +
    `*Correct:* ${correct}\n` +
    `*Incorrect:* ${incorrect}\n` +
    `*Time Outs:* ${timeouts}\n\n` +
    `*Completed:* ${completed}\n\n` +
    `*View Result:*\n${shareURL}\n\n` +
    `*Practice more:*\n${appUrl}`;

  const encoded = encodeURIComponent(message);
  if (!isMobileDevice()) {
    return phone
      ? `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`
      : `https://web.whatsapp.com/send?text=${encoded}`;
  }
  return phone
    ? `https://wa.me/${phone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}

// ─── Accuracy feedback ────────────────────────────────────────────────────────
function getAccuracyFeedback(accuracy) {
  if (accuracy >= 90) return { emoji: '⭐', label: 'Excellent!',      color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (accuracy >= 70) return { emoji: '👏', label: 'Great job!',      color: 'text-blue-600',    bg: 'bg-blue-50' };
  if (accuracy >= 50) return { emoji: '💪', label: 'Good effort!',    color: 'text-amber-600',   bg: 'bg-amber-50' };
  return                     { emoji: '📚', label: 'Keep practicing!',color: 'text-rose-600',    bg: 'bg-rose-50' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETUP SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function SetupScreen({ onStart, studentName, setStudentName, difficulty, setDifficulty, bestScores }) {
  const diffList = Object.values(FRACTION_DIFFICULTIES);

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-fade-up pb-12">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full uppercase tracking-wider mb-1">
          <span>🥧</span> Visual Fractions
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Visual Fractions Challenge
        </h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          See it. Understand it. Master fractions.
        </p>
      </div>

      {/* Name input */}
      <div className="card p-4 space-y-2">
        <label htmlFor="frac-student-name" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Your Name (Optional)
        </label>
        <input
          id="frac-student-name"
          type="text"
          maxLength={24}
          placeholder="Enter your name"
          value={studentName}
          onChange={e => setStudentName(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-base font-bold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
          autoComplete="off"
        />
        <p className="text-xs text-slate-400">Your name appears when you share your score with your teacher.</p>
      </div>

      {/* Difficulty cards */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Choose Difficulty</p>
        <div className="grid grid-cols-1 gap-2.5">
          {diffList.map(diff => {
            const IconComp = ICON_MAP[diff.iconName] || Smile;
            const isSelected = difficulty === diff.id;
            const best = bestScores[`frac_${diff.id}`] || 0;
            const dc = DIFF_COLOR[diff.id] || DIFF_COLOR.easy;

            return (
              <button
                key={diff.id}
                type="button"
                onClick={() => setDifficulty(diff.id)}
                className={`w-full text-left rounded-2xl border-2 p-3.5 transition-all duration-200 outline-none active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? `${dc.bg} text-white border-transparent ring-2 ${dc.ring} shadow-md`
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <IconComp className={`w-5 h-5 stroke-[2.2] ${isSelected ? 'text-white' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-base leading-tight">{diff.label}</span>
                      {best > 0 && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : dc.badge}`}>
                          Best: {best}/{diff.questions}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 font-semibold ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      {diff.description}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                      {diff.questions}Q · {diff.secondsPerQuestion}s each · Denominators {diff.minDenominator}–{diff.maxDenominator}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button type="button" onClick={onStart} disabled={!difficulty} className="btn-primary">
        🚀 Start Challenge
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function ResultsScreen({ answers, difficulty, studentName, onRetry, onHome, onChangeDifficulty, startedAt }) {
  const [countdown, setCountdown] = useState(5);
  const [autoSent, setAutoSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const cfg         = FRACTION_DIFFICULTIES[difficulty] || FRACTION_DIFFICULTIES.easy;
  const correct     = answers.filter(a => a.status === 'correct').length;
  const incorrect   = answers.filter(a => a.status === 'incorrect').length;
  const timeout     = answers.filter(a => a.status === 'timeout').length;
  const total       = answers.length;
  const score       = correct;
  const accuracy    = total > 0 ? Math.round((correct / total) * 100) : 0;
  const fb          = getAccuracyFeedback(accuracy);
  const dc          = DIFF_COLOR[difficulty] || DIFF_COLOR.easy;

  const result = buildFractionResult({ answers, difficulty, studentName, startedAt });

  // Save best score
  useEffect(() => {
    const key = `frac_${difficulty}`;
    const scores = gameService.getBestScores();
    const prev = scores[key] || 0;
    if (score > prev) {
      scores[key] = score;
      try { localStorage.setItem('mathPractice:bestScores', JSON.stringify(scores)); } catch {}
    }
  }, [difficulty, score]);

  // Auto-WhatsApp
  useEffect(() => {
    if (autoSent || countdown <= 0) {
      if (countdown <= 0 && !autoSent) {
        setAutoSent(true);
        const link = getFractionsWhatsAppLink(result);
        window.open(link, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, autoSent]);

  const sendNow = () => {
    setAutoSent(true);
    const link = getFractionsWhatsAppLink(result);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    const url = getFractionsShareURL(result);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // SVG score ring
  const radius = 52;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (accuracy / 100) * circ;
  const strokeColor = accuracy >= 90 ? '#10b981' : accuracy >= 70 ? '#3b82f6' : accuracy >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 animate-fade-up pb-12">

      {/* Auto-WhatsApp Banner */}
      <div className={`card p-3.5 border-2 border-emerald-300 bg-emerald-50 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shrink-0 ${!autoSent ? 'animate-pulse' : ''}`}>
            {autoSent ? '✓' : `${countdown}s`}
          </div>
          <div>
            <div className="font-black text-sm text-emerald-900 leading-tight">
              {autoSent ? 'WhatsApp opened for teacher!' : 'Sending Result to Teacher...'}
            </div>
            <div className="text-xs text-emerald-700 font-medium">
              {autoSent ? 'Result card link included in message' : `Opening WhatsApp in ${countdown} seconds`}
            </div>
          </div>
        </div>
        <button type="button" onClick={sendNow}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0">
          {autoSent ? 'Re-open' : 'Send Now →'}
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-1">
        <div className="text-4xl animate-celebrate inline-block">🎉</div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Practice Complete!</h1>
        <p className="text-sm text-slate-500">
          Visual Fractions Challenge · <span className={`font-bold ${dc.badge.split(' ')[1]}`}>{cfg.label}</span>
        </p>
      </div>

      {/* Level banner */}
      <div className="card p-3 bg-slate-50 border border-slate-200 flex items-center justify-between px-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Challenge Tier</span>
          <span className="text-base font-black text-slate-800">{cfg.label} — {cfg.description}</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Denominators</span>
          <span className="text-sm font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
            {cfg.minDenominator}–{cfg.maxDenominator}
          </span>
        </div>
      </div>

      {/* Score ring */}
      <div className="card p-6 flex flex-col items-center text-center">
        <div className="relative w-36 h-36 mb-4">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
              cx="60" cy="60" r={radius}
              fill="none" stroke={strokeColor} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transformOrigin: '60px 60px', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 1.2s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-slate-800 tabular-nums leading-none">{score}</span>
            <span className="text-sm font-bold text-slate-400">/ {total}</span>
          </div>
        </div>
        <p className={`text-xl font-black mb-1 ${fb.color}`}>{fb.emoji} {fb.label}</p>
        <div className={`mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${fb.bg} ${fb.color}`}>
          {accuracy}% Accuracy
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Correct',  val: correct,  color: 'text-emerald-500' },
          { label: 'Wrong',    val: incorrect, color: 'text-rose-400' },
          { label: 'Timeouts', val: timeout,   color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`text-3xl font-black tabular-nums ${s.color}`}>{s.val}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Answer breakdown */}
      {answers.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Question Breakdown</p>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {answers.map((ans, i) => {
              const icon   = ans.status === 'correct' ? '✅' : ans.status === 'timeout' ? '⏱' : '❌';
              const detail = ans.status === 'correct'
                ? 'Correct!'
                : ans.status === 'timeout'
                ? `Time out — answer: ${ans.correctAnswer}`
                : `Chose ${ans.selected} — answer: ${ans.correctAnswer}`;
              return (
                <div key={i} className="flex items-start gap-3 py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-base w-5 flex-shrink-0 text-center mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-700 truncate">{ans.question?.questionText}</div>
                    <div className="text-[11px] text-slate-400">{ans.question?.display}</div>
                  </div>
                  <span className="text-xs text-slate-400 text-right leading-tight flex-shrink-0 max-w-[90px]">{detail}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share with teacher */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Share with your teacher</p>
        <button type="button" onClick={sendNow} className="btn-whatsapp">
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>Send to Teacher via WhatsApp</span>
        </button>
        <button type="button" onClick={copyLink} className="btn-secondary">
          {copied ? <><span>✅</span><span>Link Copied!</span></> : <><span>🔗</span><span>Copy Result Link</span></>}
        </button>
        <p className="text-center text-xs text-slate-400">Teacher can see your full result card by tapping the link.</p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onRetry} className="btn-secondary">🔁 Try Again</button>
        <button type="button" onClick={onChangeDifficulty} className="btn-secondary">🎯 Change Level</button>
      </div>

      <button type="button" onClick={onHome}
        className="w-full text-center text-sm font-semibold text-slate-400 py-3 hover:text-slate-600 transition-colors">
        ← Back to Home
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLAYING SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function PlayingScreen({ questions, difficulty, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [animateKey, setAnimateKey] = useState(0);

  const isLockedRef     = useRef(false);
  const currentIndexRef = useRef(0);
  const answersRef      = useRef([]);

  const cfg = FRACTION_DIFFICULTIES[difficulty] || FRACTION_DIFFICULTIES.easy;
  const dc  = DIFF_COLOR[difficulty] || DIFF_COLOR.easy;

  const question = questions[currentIndex];
  const correctCount   = answers.filter(a => a.status === 'correct').length;
  const incorrectCount = answers.filter(a => a.status === 'incorrect').length;

  const handleAnswer = useCallback((selected) => {
    if (isLockedRef.current) return;
    isLockedRef.current = true;
    setIsLocked(true);

    const q = questions[currentIndexRef.current];
    const isCorrect = selected === q.correctAnswer;
    const status = isCorrect ? 'correct' : 'incorrect';

    setFeedback({ status, selected, correctAnswer: q.correctAnswer, question: q });

    const newAnswer = { status, selected, correctAnswer: q.correctAnswer, question: q };
    const nextAnswers = [...answersRef.current, newAnswer];
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);

    setTimeout(() => {
      const nextIdx = currentIndexRef.current + 1;
      if (nextIdx >= questions.length) {
        onFinish(nextAnswers);
      } else {
        currentIndexRef.current = nextIdx;
        setCurrentIndex(nextIdx);
        setFeedback(null);
        setAnimateKey(k => k + 1);
        isLockedRef.current = false;
        setIsLocked(false);
      }
    }, 1000);
  }, [questions, onFinish]);

  const handleTimeout = useCallback(() => {
    if (isLockedRef.current) return;
    isLockedRef.current = true;
    setIsLocked(true);

    const q = questions[currentIndexRef.current];
    setFeedback({ status: 'timeout', selected: null, correctAnswer: q.correctAnswer, question: q });

    const newAnswer = { status: 'timeout', selected: null, correctAnswer: q.correctAnswer, question: q };
    const nextAnswers = [...answersRef.current, newAnswer];
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);

    setTimeout(() => {
      const nextIdx = currentIndexRef.current + 1;
      if (nextIdx >= questions.length) {
        onFinish(nextAnswers);
      } else {
        currentIndexRef.current = nextIdx;
        setCurrentIndex(nextIdx);
        setFeedback(null);
        setAnimateKey(k => k + 1);
        isLockedRef.current = false;
        setIsLocked(false);
      }
    }, 1000);
  }, [questions, onFinish]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  if (!question) return null;

  const getOptionState = (opt) => {
    if (!feedback) return 'default';
    if (opt === feedback.correctAnswer) return 'correct';
    if (opt === feedback.selected) return 'incorrect';
    return 'dimmed';
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-safe animate-fade-in">
      {/* Header bar */}
      <div className="card p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          {/* Score */}
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xl font-black text-emerald-500 tabular-nums">{correctCount}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Correct</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-xl font-black text-rose-400 tabular-nums">{incorrectCount}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Wrong</div>
            </div>
          </div>

          {/* Level badge */}
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-black ${dc.badge}`}>
            {cfg.label}
          </div>

          {/* Timer */}
          <Timer
            key={animateKey}
            totalSeconds={cfg.secondsPerQuestion}
            duration={cfg.secondsPerQuestion}
            isActive={!isLocked}
            isPaused={isLocked}
            onTimeout={handleTimeout}
            resetKey={animateKey}
          />
        </div>

        <ProgressBar current={currentIndex} total={questions.length} />
      </div>

      {/* Fraction Shape */}
      <div key={`shape-${animateKey}`} className="card p-5 animate-fade-up">
        {/* Question type label */}
        <div className="text-center mb-3">
          {question.askSimplified && (
            <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
              💡 Give the simplest form
            </span>
          )}
        </div>

        {/* Shape visualization */}
        <div className="flex items-center justify-center py-2" style={{ minHeight: '160px' }}>
          <FractionShape
            shapeType={question.shapeType}
            totalParts={question.totalParts}
            coloredParts={question.coloredParts}
            colorScheme={dc.scheme}
          />
        </div>

        {/* Shape label */}
        <div className="text-center mt-3 space-y-0.5">
          <p className="text-xs text-slate-400 font-medium">
            {question.totalParts} equal parts · {question.coloredParts} colored
          </p>
        </div>
      </div>

      {/* Question text */}
      <div className="text-center">
        <p className="text-base sm:text-lg font-black text-slate-800 px-2">
          {question.questionText}
        </p>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="min-h-[48px] flex items-center justify-center animate-zoom-in">
          {feedback.status === 'correct' && (
            <div className="flex items-center gap-2 text-xl font-black text-emerald-600">
              <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-lg">✓</span>
              <span>Correct!</span>
            </div>
          )}
          {feedback.status === 'incorrect' && (
            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center gap-2 text-lg font-black text-rose-600">
                <span className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-base">✗</span>
                <span>Incorrect!</span>
              </div>
              <div className="text-xs font-bold text-slate-500">
                Answer: <strong className="text-slate-800 text-base">{feedback.correctAnswer}</strong>
              </div>
            </div>
          )}
          {feedback.status === 'timeout' && (
            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center gap-2 text-lg font-black text-amber-600">
                <span>⏰</span><span>Time's Up! ✗</span>
              </div>
              <div className="text-xs font-bold text-slate-500">
                Answer: <strong className="text-slate-800 text-base">{feedback.correctAnswer}</strong>
              </div>
            </div>
          )}
        </div>
      )}
      {!feedback && <div className="min-h-[48px]" />}

      {/* Answer options — fractions displayed large */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt, i) => {
          const state = getOptionState(opt);
          const [num, den] = opt.split('/');
          return (
            <button
              key={`${animateKey}-${opt}-${i}`}
              type="button"
              disabled={isLocked}
              onClick={() => handleAnswer(opt)}
              aria-label={`Answer: ${opt}`}
              className={`
                relative flex flex-col items-center justify-center min-h-[80px] rounded-2xl border-2.5
                font-black cursor-pointer transition-all duration-150 outline-none select-none
                ${state === 'correct'   ? 'bg-emerald-500 border-emerald-600 text-white ring-4 ring-emerald-300 scale-[1.02] shadow-md' : ''}
                ${state === 'incorrect' ? 'bg-rose-50 border-rose-300 text-rose-500 ring-4 ring-rose-200 animate-shake' : ''}
                ${state === 'dimmed'    ? 'opacity-40 border-slate-200 bg-white text-slate-400 cursor-not-allowed' : ''}
                ${state === 'default' && !isLocked ? 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/40 active:scale-95' : ''}
                ${state === 'default' && isLocked  ? 'bg-white border-slate-200 text-slate-500 cursor-not-allowed' : ''}
              `}
            >
              {/* Fraction display */}
              <div className="flex flex-col items-center gap-0">
                <span className="text-2xl sm:text-3xl leading-none tabular-nums">{num}</span>
                <div className={`w-8 h-0.5 my-0.5 rounded-full ${state === 'correct' ? 'bg-white' : state === 'incorrect' ? 'bg-rose-400' : 'bg-slate-400'}`} />
                <span className="text-2xl sm:text-3xl leading-none tabular-nums">{den}</span>
              </div>

              {/* Feedback markers */}
              {state === 'correct' && (
                <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white text-emerald-600 font-black text-sm flex items-center justify-center shadow-xs">✓</span>
              )}
              {state === 'incorrect' && (
                <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white font-black text-sm flex items-center justify-center shadow-xs">✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback explanation */}
      {feedback && feedback.question && (
        <div className={`card p-3 text-sm font-medium text-center rounded-xl ${
          feedback.status === 'correct' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          feedback.status === 'timeout' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
          'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.status === 'correct'
            ? feedback.question.feedbackCorrect
            : feedback.status === 'timeout'
            ? `Time's up! ${feedback.question.feedbackIncorrect}`
            : feedback.question.feedbackIncorrect}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function FractionsPractice() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [phase,      setPhase]      = useState(PHASE.SETUP);
  const [difficulty, setDifficulty] = useState(
    () => location.state?.difficultyId || localStorage.getItem('mathPractice:lastFracDiff') || 'easy'
  );
  const [studentName, setStudentName] = useState(
    () => gameService.getStudentName()
  );
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState([]);
  const [startedAt, setStartedAt] = useState(null);

  const bestScores = gameService.getBestScores();

  const handleStart = useCallback(() => {
    const qs = generateFractionQuestions(difficulty);
    setQuestions(qs);
    setAnswers([]);
    setStartedAt(Date.now());
    gameService.setStudentName(studentName);
    try { localStorage.setItem('mathPractice:lastFracDiff', difficulty); } catch {}
    setPhase(PHASE.PLAYING);
  }, [difficulty, studentName]);

  const handleFinish = useCallback((finalAnswers) => {
    setAnswers(finalAnswers);
    setPhase(PHASE.RESULTS);
  }, []);

  const handleRetry = useCallback(() => {
    const qs = generateFractionQuestions(difficulty);
    setQuestions(qs);
    setAnswers([]);
    setStartedAt(Date.now());
    setPhase(PHASE.PLAYING);
  }, [difficulty]);

  const handleChangeDifficulty = useCallback(() => {
    setPhase(PHASE.SETUP);
  }, []);

  return (
    <>
      {phase === PHASE.SETUP && (
        <SetupScreen
          onStart={handleStart}
          studentName={studentName}
          setStudentName={setStudentName}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          bestScores={bestScores}
        />
      )}
      {phase === PHASE.PLAYING && (
        <PlayingScreen
          questions={questions}
          difficulty={difficulty}
          onFinish={handleFinish}
        />
      )}
      {phase === PHASE.RESULTS && (
        <ResultsScreen
          answers={answers}
          difficulty={difficulty}
          studentName={studentName}
          startedAt={startedAt}
          onRetry={handleRetry}
          onHome={() => navigate('/')}
          onChangeDifficulty={handleChangeDifficulty}
        />
      )}
    </>
  );
}
