import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function WrittenMath() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'multiplication';

  const [mode, setMode] = useState(initialMode); // 'multiplication' | 'addition' | 'subtraction'
  const [level, setLevel] = useState('medium'); // 'easy' | 'medium' | 'hard'
  const [numA, setNumA] = useState(123);
  const [numB, setNumB] = useState(6);

  // Student inputs
  const [carries, setCarries] = useState({});
  const [partialRows, setPartialRows] = useState({}); // rowIdx -> { colIdx: digit }
  const [finalAnswerInputs, setFinalAnswerInputs] = useState({}); // colIdx -> digit
  const [checked, setChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Focus ref tracking
  const inputRefs = useRef({});

  // Generate a random problem based on mode & level
  const generateProblem = (currentMode = mode, currentLevel = level) => {
    setChecked(false);
    setShowSolution(false);
    setCarries({});
    setPartialRows({});
    setFinalAnswerInputs({});

    if (currentMode === 'multiplication') {
      if (currentLevel === 'easy') {
        // 2-digit × 1-digit (e.g. 23 × 4)
        const a = Math.floor(Math.random() * 40) + 12;
        const b = Math.floor(Math.random() * 7) + 3;
        setNumA(a);
        setNumB(b);
      } else if (currentLevel === 'hard') {
        // 3-digit × 2-digit (e.g. 342 × 37)
        const a = Math.floor(Math.random() * 400) + 120;
        const b = Math.floor(Math.random() * 40) + 14;
        setNumA(a);
        setNumB(b);
      } else {
        // medium: 3-digit × 1-digit or 2-digit × 2-digit
        const a = Math.floor(Math.random() * 150) + 110;
        const b = Math.floor(Math.random() * 7) + 3;
        setNumA(a);
        setNumB(b);
      }
    } else if (currentMode === 'addition') {
      if (currentLevel === 'easy') {
        // 2-digit + 2-digit
        setNumA(Math.floor(Math.random() * 40) + 20);
        setNumB(Math.floor(Math.random() * 35) + 15);
      } else if (currentLevel === 'hard') {
        // 3-digit + 3-digit
        setNumA(Math.floor(Math.random() * 400) + 250);
        setNumB(Math.floor(Math.random() * 350) + 180);
      } else {
        // medium
        setNumA(Math.floor(Math.random() * 250) + 120);
        setNumB(Math.floor(Math.random() * 200) + 95);
      }
    } else if (currentMode === 'subtraction') {
      if (currentLevel === 'easy') {
        const b = Math.floor(Math.random() * 25) + 12;
        const a = b + Math.floor(Math.random() * 30) + 8;
        setNumA(a);
        setNumB(b);
      } else if (currentLevel === 'hard') {
        const b = Math.floor(Math.random() * 300) + 120;
        const a = b + Math.floor(Math.random() * 350) + 60;
        setNumA(a);
        setNumB(b);
      } else {
        // medium
        const b = Math.floor(Math.random() * 180) + 80;
        const a = b + Math.floor(Math.random() * 150) + 35;
        setNumA(a);
        setNumB(b);
      }
    }
  };

  useEffect(() => {
    generateProblem(mode, level);
  }, [mode, level]);

  // Expected calculated results
  const solution = useMemo(() => {
    const a = Number(numA) || 0;
    const b = Number(numB) || 0;

    if (mode === 'multiplication') {
      const product = a * b;
      const bDigits = String(b).split('').map(Number).reverse(); // ones, tens...
      const rows = bDigits.map((digit, idx) => {
        const rowVal = a * digit;
        const shiftZeros = idx;
        const strVal = String(rowVal) + '0'.repeat(shiftZeros);
        return { digit, rowVal, strVal };
      });
      return { answer: product, strAnswer: String(product), rows };
    }

    if (mode === 'addition') {
      const sum = a + b;
      return { answer: sum, strAnswer: String(sum), rows: [] };
    }

    if (mode === 'subtraction') {
      const diff = Math.max(0, a - b);
      return { answer: diff, strAnswer: String(diff), rows: [] };
    }

    return { answer: 0, strAnswer: '0', rows: [] };
  }, [mode, numA, numB]);

  // Calculate grid columns needed
  const strA = String(numA);
  const strB = String(numB);
  const strAns = solution.strAnswer;
  const numColumns = Math.max(strA.length, strB.length, strAns.length) + 1;

  // Single digit input handler with auto-advance
  const handleDigitChange = (value, id, nextId) => {
    const clean = value.replace(/[^0-9]/g, '').slice(-1);

    if (id.startsWith('ans-')) {
      const col = id.replace('ans-', '');
      setFinalAnswerInputs(prev => ({ ...prev, [col]: clean }));
    } else if (id.startsWith('part-')) {
      const [, row, col] = id.split('-');
      setPartialRows(prev => ({
        ...prev,
        [row]: { ...(prev[row] || {}), [col]: clean },
      }));
    } else if (id.startsWith('carry-')) {
      const col = id.replace('carry-', '');
      setCarries(prev => ({ ...prev, [col]: clean }));
    }

    if (clean && nextId && inputRefs.current[nextId]) {
      inputRefs.current[nextId].focus();
    }
  };

  const handleKeyDown = (e, prevId) => {
    if (e.key === 'Backspace' && !e.target.value && prevId && inputRefs.current[prevId]) {
      inputRefs.current[prevId].focus();
    }
  };

  // Check if student's answer is correct
  const enteredAnswerStr = useMemo(() => {
    const digits = [];
    for (let c = 0; c < numColumns; c++) {
      const val = finalAnswerInputs[c];
      if (val !== undefined && val !== '') {
        digits.push(val);
      }
    }
    return digits.join('');
  }, [finalAnswerInputs, numColumns]);

  const isAnswerCorrect = enteredAnswerStr === solution.strAnswer;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-up pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
          School Notebook Method
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Written Arithmetic Practice
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Practice column-by-column math with place value alignment, carry boxes, and step checks.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-center gap-1.5 p-1 bg-slate-100 rounded-2xl max-w-md mx-auto text-xs font-black">
        {[
          { id: 'multiplication', label: 'Multiplication (×)', emoji: '✖️' },
          { id: 'addition', label: 'Addition (+)', emoji: '➕' },
          { id: 'subtraction', label: 'Subtraction (−)', emoji: '➖' },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={`flex-1 py-2 sm:py-2.5 rounded-xl transition-all ${
              mode === item.id
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="hidden xs:inline mr-1">{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Level Selector */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2 max-w-md mx-auto">
        <span className="uppercase tracking-wider">Difficulty:</span>
        <div className="flex gap-1.5">
          {['easy', 'medium', 'hard'].map(lvl => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevel(lvl)}
              className={`px-3 py-1 rounded-lg capitalize font-bold transition-colors ${
                level === lvl
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* NOTEBOOK WORK AREA */}
      <div className="card p-5 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden bg-slate-50/50">
        {/* Notebook styling header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">
              Notebook Page · Place Value Grid
            </span>
          </div>

          <button
            type="button"
            onClick={() => generateProblem(mode, level)}
            className="px-3 py-1 bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            ↻ New Problem
          </button>
        </div>

        {/* Math Grid Container (scales nicely on mobile) */}
        <div className="overflow-x-auto py-2">
          <div className="min-w-fit mx-auto flex flex-col items-end pr-4 pl-8 font-mono text-xl sm:text-2xl font-black text-slate-800">

            {/* Carry/Borrow Row */}
            <div className="flex gap-1.5 sm:gap-2 mb-1.5">
              {Array.from({ length: numColumns }).map((_, colIdx) => {
                const id = `carry-${colIdx}`;
                return (
                  <input
                    key={id}
                    ref={el => (inputRefs.current[id] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={carries[colIdx] || ''}
                    placeholder="˙"
                    onChange={e => handleDigitChange(e.target.value, id, `carry-${colIdx - 1}`)}
                    className="w-8 h-8 sm:w-10 sm:h-10 text-center text-xs sm:text-sm font-bold bg-amber-50/80 border border-amber-200 rounded-lg text-amber-800 outline-none focus:border-amber-500 focus:bg-white transition-colors"
                    title="Carry or Borrow box"
                  />
                );
              })}
            </div>

            {/* Top Operand (numA) */}
            <div className="flex gap-1.5 sm:gap-2 mb-1">
              {Array.from({ length: numColumns }).map((_, colIdx) => {
                // Right aligned
                const offset = numColumns - strA.length;
                const digit = colIdx >= offset ? strA[colIdx - offset] : '';
                return (
                  <div
                    key={`top-${colIdx}`}
                    className="w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center font-bold text-slate-800"
                  >
                    {digit}
                  </div>
                );
              })}
            </div>

            {/* Operator and Bottom Operand (numB) */}
            <div className="flex gap-1.5 sm:gap-2 mb-2 relative">
              {/* Operator Symbol on the left */}
              <div className="absolute -left-7 top-1 sm:top-2 text-2xl font-black text-indigo-600 select-none">
                {mode === 'multiplication' ? '×' : mode === 'addition' ? '+' : '−'}
              </div>

              {Array.from({ length: numColumns }).map((_, colIdx) => {
                const offset = numColumns - strB.length;
                const digit = colIdx >= offset ? strB[colIdx - offset] : '';
                return (
                  <div
                    key={`bot-${colIdx}`}
                    className="w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center font-bold text-slate-800"
                  >
                    {digit}
                  </div>
                );
              })}
            </div>

            {/* Main Divider Line */}
            <div className="w-full border-b-2 sm:border-b-3 border-slate-700 my-1"></div>

            {/* Multi-digit Partial Rows (for Multiplication with 2+ digits multiplier) */}
            {mode === 'multiplication' && strB.length > 1 && (
              <div className="space-y-1 my-1 w-full flex flex-col items-end">
                {Array.from({ length: strB.length }).map((_, rowIdx) => (
                  <div key={`part-row-${rowIdx}`} className="flex gap-1.5 sm:gap-2">
                    {Array.from({ length: numColumns }).map((_, colIdx) => {
                      const id = `part-${rowIdx}-${colIdx}`;
                      return (
                        <input
                          key={id}
                          ref={el => (inputRefs.current[id] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={partialRows[rowIdx]?.[colIdx] || ''}
                          onChange={e => handleDigitChange(e.target.value, id, `part-${rowIdx}-${colIdx - 1}`)}
                          onKeyDown={e => handleKeyDown(e, `part-${rowIdx}-${colIdx + 1}`)}
                          className="w-8 h-10 sm:w-10 sm:h-12 text-center font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 text-lg sm:text-xl transition-all"
                        />
                      );
                    })}
                  </div>
                ))}
                <div className="w-full border-b-2 border-slate-400 my-1"></div>
              </div>
            )}

            {/* Final Answer Row Input Boxes */}
            <div className="flex gap-1.5 sm:gap-2 mt-1">
              {Array.from({ length: numColumns }).map((_, colIdx) => {
                const offset = numColumns - strAns.length;
                const id = `ans-${colIdx}`;
                const isExpectedCol = colIdx >= offset;

                // Color validation on check
                let statusClass = 'border-slate-300 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100';
                if (checked) {
                  const expectedDigit = isExpectedCol ? strAns[colIdx - offset] : '';
                  const userDigit = finalAnswerInputs[colIdx] || '';
                  if (userDigit === expectedDigit && userDigit !== '') {
                    statusClass = 'border-emerald-500 bg-emerald-50 text-emerald-800';
                  } else if (userDigit !== expectedDigit) {
                    statusClass = 'border-rose-400 bg-rose-50 text-rose-800';
                  }
                }

                return (
                  <input
                    key={id}
                    ref={el => (inputRefs.current[id] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={finalAnswerInputs[colIdx] || ''}
                    placeholder={isExpectedCol ? '□' : ''}
                    onChange={e => handleDigitChange(e.target.value, id, `ans-${colIdx - 1}`)}
                    onKeyDown={e => handleKeyDown(e, `ans-${colIdx + 1}`)}
                    className={`w-8 h-10 sm:w-10 sm:h-12 text-center font-bold border-2 rounded-xl text-lg sm:text-xl outline-none transition-all ${statusClass}`}
                  />
                );
              })}
            </div>

            {/* Bottom double divider for final answer */}
            <div className="w-full border-b-2 sm:border-b-3 border-slate-700 mt-2"></div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex flex-col sm:flex-row gap-2.5 mt-2">
          <button
            type="button"
            onClick={() => setChecked(true)}
            className="btn-primary flex-1 py-3 text-base font-bold shadow-xs"
            style={{ borderRadius: '12px' }}
          >
            <span>✓ Check My Work</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSolution(prev => !prev)}
            className="btn-secondary px-4 py-3 text-sm font-bold"
            style={{ borderRadius: '12px' }}
          >
            {showSolution ? 'Hide Solution' : '👁 Show Solution'}
          </button>
        </div>

        {/* Result Feedback Banner */}
        {checked && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-center font-bold text-sm animate-fade-up ${
              isAnswerCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {isAnswerCorrect ? (
              <p>🎉 Excellent! Your column arithmetic is 100% correct!</p>
            ) : (
              <p>Review the highlighted boxes above or click "Show Solution" to see the step method.</p>
            )}
          </div>
        )}

        {/* Step-by-Step Solution Card */}
        {showSolution && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 text-slate-800 space-y-2 animate-fade-up">
            <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-700">
              Standard Textbook Solution:
            </h4>
            <div className="font-mono font-bold text-base text-slate-800 pl-2 border-l-2 border-indigo-400 space-y-1">
              <div>Top number: {numA}</div>
              <div>Operation: {mode === 'multiplication' ? '×' : mode === 'addition' ? '+' : '−'} {numB}</div>
              {mode === 'multiplication' && solution.rows.length > 1 && (
                <div className="text-xs text-slate-600 py-1">
                  {solution.rows.map((r, i) => (
                    <div key={i}>
                      Row {i + 1}: {numA} × {r.digit} = {r.strVal}
                    </div>
                  ))}
                </div>
              )}
              <div className="text-indigo-900 text-lg pt-1">
                Final Result = {solution.answer}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
