import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ResultSummary from '../components/ResultSummary.jsx';
import ShareButton from '../components/ShareButton.jsx';
import { decodeResult, getWhatsAppLink } from '../utils/whatsappShare.js';

export default function Results() {
  const location      = useLocation();
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Two entry modes ───────────────────────────────────────────────────────
  // 1. After completing game: result in router state
  // 2. Teacher opened a share link: result encoded in ?share= query param

  const sharedEncoded = searchParams.get('share');
  const sharedResult  = sharedEncoded ? decodeResult(sharedEncoded) : null;
  const localResult   = location.state?.result ?? null;

  const isTeacherView = !!sharedResult;
  const result        = sharedResult ?? localResult;

  // 5-second automatic redirect to WhatsApp countdown for student
  const [countdown, setCountdown] = useState(5);
  const [autoSent, setAutoSent] = useState(false);

  // Redirect if neither source has valid data
  useEffect(() => {
    if (!result) {
      navigate('/', { replace: true });
    }
  }, [result, navigate]);

  const triggerSendWhatsApp = () => {
    if (!result) return;
    const link = getWhatsAppLink(result);
    // Open in a new window/tab so the student never loses their results tab!
    const win = window.open(link, '_blank', 'noopener,noreferrer');
    if (!win) {
      const a = document.createElement('a');
      a.href = link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Automatic WhatsApp redirect timer (5 seconds)
  useEffect(() => {
    if (isTeacherView || !result || autoSent) return;

    if (countdown <= 0) {
      setAutoSent(true);
      triggerSendWhatsApp();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, autoSent, isTeacherView, result]);

  if (!result) return null;

  // ── Teacher view (opened via shared link) ─────────────────────────────────
  if (isTeacherView) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-fade-up">
        {/* Teacher badge */}
        <div className="text-center space-y-1">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
            Teacher View
          </span>
          <h1 className="text-2xl font-black text-slate-800">Student Result</h1>
          <p className="text-sm text-slate-500">
            Shared by {result.studentName || 'Student'}
          </p>
        </div>

        <ResultSummary result={result} isSharedView={true} />

        <div className="card p-4 bg-slate-50 text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Powered by</p>
          <p className="text-sm font-black text-slate-700">Syeds Academy</p>
        </div>
      </div>
    );
  }

  const handleNavigateDifficulty = (nextDiff) => {
    navigate('/practice', {
      state: {
        gameType: result.gameType || 'multiplication',
        tableNum: null,
        difficultyId: nextDiff,
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 animate-fade-up pb-safe">

      {/* Auto-WhatsApp Countdown Banner (5 seconds) */}
      {autoSent ? (
        <div className="card p-3.5 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shrink-0">
              ✓
            </div>
            <div>
              <div className="font-black text-sm text-emerald-900 leading-tight">
                WhatsApp opened for teacher!
              </div>
              <div className="text-xs text-emerald-700 font-medium">
                Message prepared with full teacher result card link
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={triggerSendWhatsApp}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            Re-open WhatsApp
          </button>
        </div>
      ) : (
        <div className="card p-3.5 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs animate-pulse">
              {countdown}s
            </div>
            <div>
              <div className="font-black text-sm text-emerald-900 leading-tight">
                Sending Result to Teacher on WhatsApp...
              </div>
              <div className="text-xs text-emerald-700 font-medium">
                Opening WhatsApp automatically in {countdown} seconds
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setAutoSent(true);
              triggerSendWhatsApp();
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            Send Now →
          </button>
        </div>
      )}

      <div className="text-center space-y-1">
        <div className="text-4xl animate-celebrate inline-block">🎉</div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Practice Complete!</h1>
        <p className="text-sm text-slate-500">
          {result.gameTitle || 'Math Challenge'} · {result.difficultyLabel} {result.tableRange ? `(${result.tableRange})` : ''}
        </p>
      </div>

      <ResultSummary result={result} onNavigateDifficulty={handleNavigateDifficulty} />

      {/* Share section */}
      <div className="card p-4 space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
          Share with your teacher
        </p>
        <ShareButton result={result} />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() =>
            navigate('/practice', {
              state: {
                gameType: result.gameType,
                tableNum: result.tableNum,
                difficultyId: result.difficultyId,
                directStart: true,
              },
            })
          }
          className="btn-secondary"
        >
          🔁 Try Again
        </button>
        <button
          type="button"
          onClick={() => navigate('/games')}
          className="btn-secondary"
        >
          ⚙️ Math Games
        </button>
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="w-full text-center text-sm font-semibold text-slate-400 py-3 hover:text-slate-600 transition-colors"
      >
        ← Back to Home
      </button>

    </div>
  );
}
