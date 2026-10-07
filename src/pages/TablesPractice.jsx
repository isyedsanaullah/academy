import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Smile, Zap, Flame, Brain, Trophy, Target } from 'lucide-react';

import { DIFFICULTIES } from '../data/tables.js';
import { GAME_TYPES } from '../data/gameConfigs.js';
import { generateQuestions } from '../utils/questionGenerator.js';
import { calculateScore } from '../utils/scoreCalculator.js';
import { gameService } from '../services/gameService.js';

import DifficultyCard from '../components/DifficultyCard.jsx';
import Timer from '../components/Timer.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import AnswerOption from '../components/AnswerOption.jsx';
import ScoreCard from '../components/ScoreCard.jsx';

// ── Game phases ────────────────────────────────────────────────────────────
const PHASE = {
  SETUP:        'setup',
  INSTRUCTIONS: 'instructions',
  PLAYING:      'playing',
};

export default function TablesPractice() {
  const navigate   = useNavigate();
  const location   = useLocation();

  const gameType = location.state?.gameType || 'multiplication';
  const tableNum = location.state?.tableNum != null ? Number(location.state.tableNum) : null;
  const gameDef = GAME_TYPES[gameType] || GAME_TYPES.multiplication;
  const gameTitle = tableNum != null ? `Table ${tableNum} Practice` : gameDef.title;

  const bestScores = gameService.getBestScores();

  // ── Setup state ─────────────────────────────────────────────────────────
  const [phase, setPhase] = useState(tableNum != null ? PHASE.INSTRUCTIONS : PHASE.SETUP);
  const [studentName, setStudentName] = useState(gameService.getStudentName);
  const [difficulty, setDifficulty] = useState(
    () => location.state?.difficultyId || gameService.getLastDifficulty()
  );
  const [easyRange, setEasyRange] = useState(
    () => gameService.getLastEasyRange()
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
  const [feedback,    setFeedback]    = useState(null);
  const [animateKey,  setAnimateKey]  = useState(0);

  // ── Refs for stable callbacks ────────────────────────────────────────────
  const isLockedRef       = useRef(false);
  const currentIndexRef   = useRef(0);
  const questionsRef      = useRef([]);
  const answersRef        = useRef([]);
  const correctCountRef   = useRef(0);
  const incorrectCountRef = useRef(0);
  const scoreRef          = useRef(0);
  const difficultyRef     = useRef(difficulty);
  const easyRangeRef      = useRef(easyRange);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { questionsRef.current    = questions;    }, [questions]);
  useEffect(() => { answersRef.current      = answers;      }, [answers]);
  useEffect(() => { difficultyRef.current   = difficulty;   }, [difficulty]);
  useEffect(() => { easyRangeRef.current    = easyRange;    }, [easyRange]);

  const getActiveConfig = useCallback(() => {
    if (tableNum != null) {
      return {
        id: 'focus',
        label: `Table ${tableNum}`,
        iconName: 'Target',
        tagline: `Focused practice on the ×${tableNum} table`,
        questions: 11,
        secondsPerQuestion: 8,
        minTable: tableNum,
        maxTable: tableNum,
        tableRange: `×${tableNum}`,
        colorClass: 'blue',
      };
    }

    const diffMap = gameDef.difficulties || DIFFICULTIES;
    const base = diffMap[difficulty] || DIFFICULTIES[difficulty] || DIFFICULTIES.easy;

    if (gameType === 'multiplication' && difficulty === 'easy') {
      const isHigher = easyRange === '6-10';
      return {
        ...base,
        label: `Easy (${isHigher ? '6–10' : '0–5'})`,
        minTable: isHigher ? 6 : 0,
        maxTable: isHigher ? 10 : 5,
        tableRange: isHigher ? '6–10' : '0–5',
      };
    }

    if (gameType === 'multiplication') {
      return {
        ...base,
        tableRange: `${base.minTable ?? 0}–${base.maxTable ?? 12}`,
      };
    }

    return base;
  }, [tableNum, gameDef, difficulty, gameType, easyRange]);

  // Direct-start from "Try Again"
  useEffect(() => {
    if (location.state?.directStart) {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDifficultySelect = (id) => {
    setDifficulty(id);
    gameService.setLastDifficulty(id);
  };

  const handleEasyRangeSelect = (rangeId) => {
    setEasyRange(rangeId);
    gameService.setLastEasyRange(rangeId);
  };

  const handleNameChange = (e) => {
    setStudentName(e.target.value);
    gameService.setStudentName(e.target.value);
  };

  const startGame = useCallback(() => {
    const generated = generateQuestions({
      gameType,
      difficultyId: difficultyRef.current,
      tableNum,
      tableRange: easyRangeRef.current,
    });

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
  }, [gameType, tableNum]);

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

    const nextAnswers = [...answersRef.current, newAnswer];
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);

    if (status === 'correct') {
      const nextCorrect = correctCountRef.current + 1;
      correctCountRef.current = nextCorrect;
      setCorrectCount(nextCorrect);
      const nextScore = scoreRef.current + 1;
      scoreRef.current = nextScore;
      setScore(nextScore);
    } else {
      const nextInc = incorrectCountRef.current + 1;
      incorrectCountRef.current = nextInc;
      setIncorrectCount(nextInc);
    }

    const nextIdx = idx + 1;
    const totalQ  = questionsRef.current.length;

    setTimeout(() => {
      if (nextIdx >= totalQ) {
        finishGame(nextAnswers);
      } else {
        currentIndexRef.current = nextIdx;
        setCurrentIndex(nextIdx);
        setFeedback(null);
        setAnimateKey(k => k + 1);
        isLockedRef.current = false;
        setIsLocked(false);
      }
    }, 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOptionSelect = useCallback((value) => {
    if (isLockedRef.current) return;
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
    const activeCfg = getActiveConfig();
    const calcResult = calculateScore(finalAnswers);

    const finalResult = {
      ...calcResult,
      gameType,
      gameTitle,
      tableNum,
      studentName: studentName || 'Student',
      difficultyId: difficultyRef.current,
      difficultyLabel: activeCfg.label,
      tableRange: tableNum ? `×${tableNum}` : (activeCfg.tableRange || `${activeCfg.minTable}–${activeCfg.maxTable}`),
      answers: finalAnswers,
    };

    gameService.saveResult(finalResult);
    navigate('/results', { state: { result: finalResult }, replace: true });
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: SETUP
  // ──────────────────────────────────────────────────────────────────────────
  if (phase === PHASE.SETUP) {
    const diffList = Object.values(gameDef.difficulties || DIFFICULTIES);

    return (
      <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-fade-up pb-12">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            {gameDef.tagline || 'Challenge Setup'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {gameTitle}
          </h1>
        </div>

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
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-base font-bold text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-colors"
            autoComplete="off"
          />
          <p className="text-xs text-slate-400">Your name will appear when you share your score with your teacher.</p>
        </div>

        {/* Difficulty selection */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
            Choose Difficulty
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {diffList.map(diff => {
              // Best score per difficulty
              let bScore = bestScores[diff.id] || 0;
              if (diff.id === 'easy') {
                bScore = easyRange === '6-10' ? (bestScores.easy_6_10 || 0) : (bestScores.easy_0_5 || bestScores.easy || 0);
              }

              let customSubtitle = null;
              if (diff.id === 'easy' && difficulty === 'easy') {
                customSubtitle = easyRange === '6-10'
                  ? 'Tables 6–10 · 10Q · 15s each'
                  : 'Tables 0–5 · 10Q · 15s each';
              }

              return (
                <div key={diff.id} className="space-y-2">
                  <DifficultyCard
                    difficulty={diff}
                    selected={difficulty === diff.id}
                    onClick={handleDifficultySelect}
                    bestScore={bScore}
                    customSubtitle={customSubtitle}
                  />

                  {/* Section 8: Easy Table-Range Selection */}
                  {diff.id === 'easy' && difficulty === 'easy' && gameType === 'multiplication' && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 space-y-3 animate-fade-down">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                          Choose Your Tables
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          10 Questions · 15s each
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleEasyRangeSelect('0-5')}
                          className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                            easyRange === '0-5'
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                              : 'border-emerald-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <Smile className="w-4 h-4 shrink-0" />
                            <span className="font-black text-base">0 – 5</span>
                          </div>
                          <div className={`text-xs font-bold ${easyRange === '0-5' ? 'text-emerald-100' : 'text-slate-500'}`}>
                            Beginner
                          </div>
                          {bestScores.easy_0_5 > 0 && (
                            <div className={`text-[10px] font-bold mt-1 ${easyRange === '0-5' ? 'text-white/80' : 'text-emerald-700'}`}>
                              Best: {bestScores.easy_0_5}/10
                            </div>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEasyRangeSelect('6-10')}
                          className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                            easyRange === '6-10'
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                              : 'border-emerald-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="w-4 h-4 shrink-0" />
                            <span className="font-black text-base">6 – 10</span>
                          </div>
                          <div className={`text-xs font-bold ${easyRange === '6-10' ? 'text-emerald-100' : 'text-slate-500'}`}>
                            Next Step
                          </div>
                          {bestScores.easy_6_10 > 0 && (
                            <div className={`text-[10px] font-bold mt-1 ${easyRange === '6-10' ? 'text-white/80' : 'text-emerald-700'}`}>
                              Best: {bestScores.easy_6_10}/10
                            </div>
                          )}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs text-slate-700 font-semibold text-center shadow-2xs">
                        {easyRange === '0-5' ? (
                          <>Selected: Easy · Tables <strong className="text-emerald-700 font-black">0–5</strong> · 10 Questions · 15 seconds each</>
                        ) : (
                          <>Selected: Easy · Tables <strong className="text-emerald-700 font-black">6–10</strong> · 10 Questions · 15 seconds each</>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
    const cfg = getActiveConfig();

    return (
      <div className="max-w-sm mx-auto px-4 py-8 animate-zoom-in">
        <div className="card overflow-hidden">
          <div className="bg-slate-800 p-6 text-center">
            <div className="flex justify-center mb-2">
              {cfg.iconName === 'Zap' ? <Zap className="w-10 h-10 text-yellow-400" />
                : cfg.iconName === 'Flame' ? <Flame className="w-10 h-10 text-orange-400" />
                : cfg.iconName === 'Brain' ? <Brain className="w-10 h-10 text-purple-400" />
                : cfg.iconName === 'Trophy' ? <Trophy className="w-10 h-10 text-amber-300" />
                : <Smile className="w-10 h-10 text-emerald-400" />}
            </div>
            <h2 className="text-2xl font-black text-white">{gameTitle}</h2>
            <p className="text-slate-400 text-sm mt-1">{cfg.label} · {cfg.tagline}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Questions', value: cfg.questions },
                { label: 'Seconds',   value: cfg.secondsPerQuestion },
                { label: 'Options',   value: 4 },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-2xl p-3">
                  <div className="text-2xl font-black text-blue-600 tabular-nums">{s.value}</div>
                  <div className="text-xs font-bold text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <ul className="space-y-2.5">
              {[
                'Choose the correct answer from 4 choices.',
                'Answer before the countdown timer expires.',
                'Try to get 100% accuracy to earn full stars!',
              ].map((tip, i) => (
                <li key={i} className="flex gap-2.5 items-start text-xs sm:text-sm text-slate-600">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>

            <button type="button" onClick={startGame} className="btn-primary">
              🚀 Start Challenge
            </button>

            {tableNum == null && (
              <button
                type="button"
                onClick={() => setPhase(PHASE.SETUP)}
                className="btn-secondary"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: PLAYING
  // ──────────────────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex];
  const activeCfg = getActiveConfig();

  if (!currentQuestion) return null;

  const getOptionState = (opt) => {
    if (!feedback) return 'default';
    if (opt === feedback.correctValue) return 'correct';
    if (opt === feedback.selectedValue) return 'incorrect';
    return 'dimmed';
  };

  const FeedbackBanner = () => {
    if (!feedback) return null;
    if (feedback.status === 'correct') {
      return (
        <div className="flex items-center justify-center gap-2 text-2xl font-black text-emerald-600 animate-zoom-in">
          <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">✓</span>
          <span>Correct!</span>
        </div>
      );
    }
    if (feedback.status === 'incorrect') {
      return (
        <div className="text-center animate-zoom-in space-y-0.5">
          <div className="flex items-center justify-center gap-2 text-xl font-black text-rose-600">
            <span className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-base">✗</span>
            <span>Incorrect!</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-500">
            Correct answer is: <strong className="text-slate-800 text-base">{feedback.correctValue}</strong>
          </div>
        </div>
      );
    }
    if (feedback.status === 'timeout') {
      return (
        <div className="text-center animate-zoom-in space-y-0.5">
          <div className="flex items-center justify-center gap-2 text-xl font-black text-amber-600">
            <span>⏰</span>
            <span>Time's Up! ✗</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-500">
            Correct answer is: <strong className="text-slate-800 text-base">{feedback.correctValue}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-safe animate-fade-in">
      {tableNum != null && (
        <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <span className="text-sm font-black tracking-tight">Table {tableNum} Times Table Practice</span>
          </div>
          <span className="text-xs font-bold bg-blue-500 px-2 py-0.5 rounded-lg">
            ×{tableNum} facts
          </span>
        </div>
      )}

      <div className="card p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <ScoreCard
            score={score}
            correctCount={correctCount}
            incorrectCount={incorrectCount}
            totalQuestions={questions.length}
          />
          <Timer
            totalSeconds={activeCfg.secondsPerQuestion}
            duration={activeCfg.secondsPerQuestion}
            isActive={!isLocked}
            isPaused={isLocked}
            onTimeout={handleTimeout}
            resetKey={animateKey}
          />
        </div>

        <ProgressBar
          current={currentIndex}
          total={questions.length}
        />
      </div>

      <div className="min-h-[56px] flex items-center justify-center">
        <FeedbackBanner />
      </div>

      <div key={animateKey} className="animate-fade-up">
        <QuestionCard
          question={currentQuestion}
          display={currentQuestion.display}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          animateKey={animateKey}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        {currentQuestion.options.map((opt, i) => (
          <AnswerOption
            key={`${animateKey}-${opt}-${i}`}
            value={opt}
            state={getOptionState(opt)}
            onClick={handleOptionSelect}
            disabled={isLocked}
          />
        ))}
      </div>
    </div>
  );
}
