import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { DIFFICULTIES } from '../data/tables';
import { generateQuestions } from '../utils/questionGenerator';
import { calculateScore } from '../utils/scoreCalculator';
import { gameService } from '../services/gameService';

import DifficultyCard from '../components/DifficultyCard';
import Timer from '../components/Timer';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';
import AnswerOption from '../components/AnswerOption';
import ScoreCard from '../components/ScoreCard';

// ── Game phases ────────────────────────────────────────────────────────────
const PHASE = {
  SETUP:        'setup',
  INSTRUCTIONS: 'instructions',
  PLAYING:      'playing',
};

export default function TablesPractice() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const bestScores = gameService.getBestScores();

  // ── Setup state ─────────────────────────────────────────────────────────
  const [phase,      setPhase]      = useState(PHASE.SETUP);
  const [studentName, setStudentName] = useState(gameService.getStudentName);
  const [difficulty,  setDifficulty]  = useState(
    () => location.state?.difficultyId || gameService.getLastDifficulty()
  );

  // ── Game state ───────────────────────────────────────────────────────────
  const [questions,     setQuestions]     = useState([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [answers,       setAnswers]       = useState([]);
  const [score,         setScore]         = useState(0);
  const [correctCount,  setCorrectCount]  = useState(0);
  const [incorrectCount,setIncorrectCount]= useState(0);

  // ── Interaction state ────────────────────────────────────────────────────
  const [isLocked,    setIsLocked]    = useState(false);
  const [feedback,    setFeedback]    = useState(null); // { status, selectedValue, correctValue }
  const [animateKey,  setAnimateKey]  = useState(0);

  // ── Refs for stable callbacks (no stale closure issues) ──────────────────
  const isLockedRef       = useRef(false);
  const currentIndexRef   = useRef(0);
  const questionsRef      = useRef([]);
  const answersRef        = useRef([]);
  const correctCountRef   = useRef(0);
  const incorrectCountRef = useRef(0);
  const scoreRef          = useRef(0);
  const difficultyRef     = useRef(difficulty);

  // Sync refs to state
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { questionsRef.current    = questions;    }, [questions]);
  useEffect(() => { answersRef.current      = answers;      }, [answers]);
  useEffect(() => { difficultyRef.current   = difficulty;   }, [difficulty]);

  // Direct-start from "Try Again" button on results page
  useEffect(() => {
    if (location.state?.directStart) {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleDifficultySelect = (id) => {
    setDifficulty(id);
    gameService.setLastDifficulty(id);
  };

  const handleNameChange = (e) => {
    setStudentName(e.target.value);
    gameService.setStudentName(e.target.value);
  };

  const startGame = useCallback(() => {
    const config = DIFFICULTIES[difficultyRef.current];
    const generated = generateQuestions(config);

    // Reset all game state
    setQuestions(generated);
    questionsRef.current = generated;
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setAnswers([]);
    answersRef.current = [];
    setScore(0);
    scoreRef.current = 0;
    setCorrectCount(0);
    correctCountRef.current = 0;
    setIncorrectCount(0);
    incorrectCountRef.current = 0;
    isLockedRef.current = false;
    setIsLocked(false);
    setFeedback(null);
    setAnimateKey(0);
    setPhase(PHASE.PLAYING);
  }, []);

  /** Shared logic after any answer (correct / incorrect / timeout) */
  const processAnswer = useCallback((selectedValue, status) => {
    const idx      = currentIndexRef.current;
    const question = questionsRef.current[idx];
    if (!question) return;

    const newAnswer = {
      questionObj:    question,
      expectedAnswer: question.answer,
      selectedAnswer: selectedValue,
      status,
    };

    const newAnswers = [...answersRef.current, newAnswer];
    answersRef.current = newAnswers;
    setAnswers(newAnswers);

    // Update live counters
    if (status === 'correct') {
      scoreRef.current++;
      correctCountRef.current++;
      setScore(scoreRef.current);
      setCorrectCount(correctCountRef.current);
    } else {
      incorrectCountRef.current++;
      setIncorrectCount(incorrectCountRef.current);
    }

    // Show feedback, then advance
    const delay = status === 'correct' ? 700 : 1600;
    setTimeout(() => {
      const nextIdx = idx + 1;
      if (nextIdx < questionsRef.current.length) {
        currentIndexRef.current = nextIdx;
        isLockedRef.current = false;
        setCurrentIndex(nextIdx);
        setFeedback(null);
        setIsLocked(false);
        setAnimateKey(k => k + 1);
      } else {
        finishGame(newAnswers);
      }
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = useCallback((value) => {
    if (isLockedRef.current) return;  // immediate guard before re-render
    isLockedRef.current = true;
    setIsLocked(true);

    const question = questionsRef.current[currentIndexRef.current];
    const isCorrect = value === question.answer;
    const status = isCorrect ? 'correct' : 'incorrect';

    setFeedback({ status, selectedValue: value, correctValue: question.answer });
    processAnswer(value, status);
  }, [processAnswer]);

  const handleTimeout = useCallback(() => {
    if (isLockedRef.current) return;
    isLockedRef.current = true;
    setIsLocked(true);

    const question = questionsRef.current[currentIndexRef.current];
    setFeedback({ status: 'timeout', selectedValue: null, correctValue: question.answer });
    processAnswer(null, 'timeout');
  }, [processAnswer]);

  const finishGame = (finalAnswers) => {
    const config = DIFFICULTIES[difficultyRef.current];
    const calcResult = calculateScore(finalAnswers);

    const finalResult = {
      ...calcResult,
      studentName: studentName || 'Student',
      difficultyId:    difficultyRef.current,
      difficultyLabel: config.label,
      tableRange:      `${config.minTable}–${config.maxTable}`,
      answers:         finalAnswers,
    };

    gameService.saveResult(finalResult);
    navigate('/results', { state: { result: finalResult }, replace: true });
  };


  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: SETUP
  // ──────────────────────────────────────────────────────────────────────────
  if (phase === PHASE.SETUP) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-fade-up">
        <h1 className="text-2xl font-black text-slate-800 text-center tracking-tight">Game Setup</h1>

        {/* Name input */}
        <div className="card p-4 space-y-2">
          <label htmlFor="student-name" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Your Name (Optional)
          </label>
          <input
            id="student-name"
            type="text"
            maxLength={24}
            placeholder="Enter your name"
            value={studentName}
            onChange={handleNameChange}
            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-bold text-slate-700 outline-none focus:border-brand-400 focus:bg-white transition-colors"
            autoComplete="off"
          />
          <p className="text-xs text-slate-400">Your name will appear in the result shared with your teacher.</p>
        </div>

        {/* Difficulty selection */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
            Choose Difficulty
          </p>
          <div className="space-y-3">
            {Object.values(DIFFICULTIES).map(diff => (
              <DifficultyCard
                key={diff.id}
                difficulty={diff}
                selected={difficulty === diff.id}
                onClick={handleDifficultySelect}
                bestScore={bestScores[diff.id] || 0}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPhase(PHASE.INSTRUCTIONS)}
          disabled={!difficulty}
          className="btn-primary"
        >
          Continue →
        </button>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: INSTRUCTIONS
  // ──────────────────────────────────────────────────────────────────────────
  if (phase === PHASE.INSTRUCTIONS) {
    const cfg = DIFFICULTIES[difficulty];
    return (
      <div className="max-w-sm mx-auto px-4 py-8 animate-zoom-in">
        <div className="card overflow-hidden">
          {/* Header strip */}
          <div className="bg-slate-800 p-6 text-center">
            <div className="text-4xl mb-2">{cfg.emoji}</div>
            <h2 className="text-2xl font-black text-white">{cfg.label} Mode</h2>
            <p className="text-slate-400 text-sm mt-1">Tables {cfg.minTable}–{cfg.maxTable}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Questions', value: cfg.questions },
                { label: 'Seconds',   value: cfg.secondsPerQuestion },
                { label: 'Options',   value: 4 },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-2xl p-3">
                  <div className="text-3xl font-black text-brand-600 tabular-nums">{s.value}</div>
                  <div className="text-xs font-bold text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <ul className="space-y-3">
              {[
                'Pick the correct answer from 4 choices.',
                'Answer before the timer runs out.',
                'Missed questions count as wrong.',
                'Try to beat your best score!',
              ].map((tip, i) => (
                <li key={i} className="flex gap-3 items-start text-sm text-slate-600">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-black text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>

            <button type="button" onClick={startGame} className="btn-primary">
              🚀 Start Game
            </button>

            <button
              type="button"
              onClick={() => setPhase(PHASE.SETUP)}
              className="btn-secondary"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: PLAYING
  // ──────────────────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex];
  const cfg = DIFFICULTIES[difficulty];

  if (!currentQuestion) return null; // Safety guard

  // Compute each option's visual state
  const getOptionState = (opt) => {
    if (!feedback) return 'default';
    if (opt === feedback.correctValue) return 'correct';
    if (opt === feedback.selectedValue) return 'incorrect';
    return 'dimmed';
  };

  // Feedback banner
  const FeedbackBanner = () => {
    if (!feedback) return null;
    if (feedback.status === 'correct') {
      return (
        <div className="text-center animate-zoom-in">
          <div className="text-2xl font-black text-emerald-500">✅ Correct!</div>
        </div>
      );
    }
    if (feedback.status === 'incorrect') {
      return (
        <div className="text-center animate-zoom-in">
          <div className="text-lg font-black text-rose-500">Not quite!</div>
          <div className="text-sm text-slate-500">Correct answer: <strong>{feedback.correctValue}</strong></div>
        </div>
      );
    }
    if (feedback.status === 'timeout') {
      return (
        <div className="text-center animate-zoom-in">
          <div className="text-lg font-black text-amber-500">⏱ Time's Up!</div>
          <div className="text-sm text-slate-500">Correct answer: <strong>{feedback.correctValue}</strong></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="game-screen max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">

      {/* Top bar: progress + score */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>
        <ScoreCard score={score} correct={correctCount} incorrect={incorrectCount} />
      </div>

      {/* Timer + feedback area — fixed height to avoid layout shift */}
      <div className="flex flex-col items-center justify-center h-20 gap-1">
        {!feedback ? (
          <Timer
            key={`timer-${currentQuestion.id}`}
            totalSeconds={cfg.secondsPerQuestion}
            isActive={!isLocked}
            onTimeout={handleTimeout}
            resetKey={currentQuestion.id}
          />
        ) : (
          <FeedbackBanner />
        )}
      </div>

      {/* Question */}
      <QuestionCard question={currentQuestion} animateKey={animateKey} />

      {/* Answer options: 2×2 grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {currentQuestion.options.map((opt, i) => (
          <AnswerOption
            key={`${currentQuestion.id}-${i}`}
            value={opt}
            state={getOptionState(opt)}
            disabled={isLocked}
            onClick={handleAnswer}
          />
        ))}
      </div>

    </div>
  );
}
