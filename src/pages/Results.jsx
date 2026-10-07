import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ResultSummary from '../components/ResultSummary';
import ShareButton from '../components/ShareButton';
import { decodeResult } from '../utils/whatsappShare';

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

  // Redirect if neither source has valid data
  useEffect(() => {
    if (!result) {
      navigate('/', { replace: true });
    }
  }, [result, navigate]);

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

  // ── Student view (after completing game) ──────────────────────────────────
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-fade-up pb-safe">

      <div className="text-center space-y-1">
        <div className="text-4xl animate-celebrate inline-block">🎉</div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Practice Complete!</h1>
        <p className="text-sm text-slate-500">
          {result.gameTitle || 'Math Challenge'} · {result.difficultyLabel} {result.tableRange ? `(${result.tableRange})` : ''}
        </p>
      </div>

      <ResultSummary result={result} />

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
