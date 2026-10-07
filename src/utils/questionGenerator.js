/**
 * questionGenerator.js
 *
 * Generates randomized question sets for:
 * 1. Multiplication (General random or single-table focus)
 * 2. Addition
 * 3. Subtraction (Always non-negative results)
 * 4. Division (Clean division without remainders)
 *
 * All questions produce 4 unique options with smart distractors.
 */

import { GAME_TYPES } from '../data/gameConfigs.js';

// In-place Fisher-Yates shuffle that returns the mutated array
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Multiplication Distractors ──────────────────────────────────────────
function buildMultiplicationDistractors(a, b, correctAnswer) {
  const pool = new Set();
  const candidates = [
    (a + 1) * b, (a - 1) * b, a * (b + 1), a * (b - 1),
    (a + 1) * (b + 1), (a - 1) * (b - 1),
    correctAnswer + a, correctAnswer - a,
    correctAnswer + b, correctAnswer - b,
    correctAnswer + 2, correctAnswer - 2,
    correctAnswer + 4, correctAnswer - 4,
  ];

  candidates.forEach(v => {
    if (v >= 0 && v !== correctAnswer) pool.add(v);
  });

  const filtered = Array.from(pool).filter(v => v !== correctAnswer);
  shuffle(filtered);

  const distractors = filtered.slice(0, 3);
  let offset = 3;
  while (distractors.length < 3) {
    const cand = correctAnswer + offset;
    if (!distractors.includes(cand) && cand !== correctAnswer && cand >= 0) {
      distractors.push(cand);
    }
    offset = offset > 0 ? -offset : -offset + 2;
  }
  return distractors.slice(0, 3);
}

// ─── Addition Distractors ────────────────────────────────────────────────
function buildAdditionDistractors(a, b, correctAnswer) {
  const pool = new Set([
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
    correctAnswer + 10,
    correctAnswer - 10,
    correctAnswer + 5,
    correctAnswer - 5,
  ]);

  const filtered = Array.from(pool).filter(v => v > 0 && v !== correctAnswer);
  shuffle(filtered);
  const distractors = filtered.slice(0, 3);
  let off = 3;
  while (distractors.length < 3) {
    const v = correctAnswer + off;
    if (!distractors.includes(v) && v > 0 && v !== correctAnswer) distractors.push(v);
    off += 2;
  }
  return distractors.slice(0, 3);
}

// ─── Subtraction Distractors ─────────────────────────────────────────────
function buildSubtractionDistractors(a, b, correctAnswer) {
  const pool = new Set([
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
    correctAnswer + 10,
    correctAnswer - 10,
  ]);

  const filtered = Array.from(pool).filter(v => v >= 0 && v !== correctAnswer);
  shuffle(filtered);
  const distractors = filtered.slice(0, 3);
  let off = 3;
  while (distractors.length < 3) {
    const v = Math.max(0, correctAnswer + off);
    if (!distractors.includes(v) && v !== correctAnswer) distractors.push(v);
    off += 2;
  }
  return distractors.slice(0, 3);
}

// ─── Division Distractors ────────────────────────────────────────────────
function buildDivisionDistractors(a, b, correctAnswer) {
  const pool = new Set([
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
    correctAnswer + 3,
    correctAnswer - 3,
  ]);

  const filtered = Array.from(pool).filter(v => v > 0 && v !== correctAnswer);
  shuffle(filtered);
  const distractors = filtered.slice(0, 3);
  let off = 4;
  while (distractors.length < 3) {
    const v = correctAnswer + off;
    if (!distractors.includes(v) && v > 0 && v !== correctAnswer) distractors.push(v);
    off += 1;
  }
  return distractors.slice(0, 3);
}

// ─── Main Generator ───────────────────────────────────────────────────────
export function generateQuestions(options = {}) {
  const gameType = options.gameType || 'multiplication';
  const difficultyId = options.difficultyId || 'medium';
  const tableNum = options.tableNum != null ? Number(options.tableNum) : null;

  // 1. Single Table Focused Practice (e.g. Table 7: randomized 7×4, 7×8, 7×2, 7×9...)
  if (gameType === 'multiplication' && tableNum != null && !isNaN(tableNum)) {
    // Generate multipliers 1 to 10 (plus 11, 12)
    const multipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    shuffle(multipliers);
    const selected = multipliers.slice(0, 10);

    return selected.map((b, idx) => {
      const a = tableNum;
      // Randomly swap operand display order for variety (7 × 4 or 4 × 7)
      const swap = Math.random() > 0.5;
      const displayA = swap ? b : a;
      const displayB = swap ? a : b;
      const answer = a * b;
      const distractors = buildMultiplicationDistractors(a, b, answer);
      const optionsList = shuffle([answer, ...distractors]);

      return {
        id: `tbl-${a}-${b}-${idx}-${Date.now()}`,
        multiplier: a,
        multiplicand: b,
        display: `${displayA} × ${displayB}`,
        answer,
        options: optionsList,
      };
    });
  }

  // 2. Standard Multiplication Challenge (Randomized tables, NEVER only 0s!)
  if (gameType === 'multiplication') {
    let minT = 2;
    let maxT = 10;
    let numQuestions = 15;

    if (difficultyId === 'easy') {
      minT = 2;
      maxT = 5;
      numQuestions = 10;
    } else if (difficultyId === 'hard') {
      minT = 2;
      maxT = 12;
      numQuestions = 20;
    }

    const allPairs = [];
    for (let a = minT; a <= maxT; a++) {
      for (let b = 1; b <= 10; b++) {
        allPairs.push([a, b]);
      }
    }
    // Also add a couple of 10-table or 11/12 facts
    if (difficultyId !== 'easy') {
      for (let a = 2; a <= maxT; a++) {
        allPairs.push([a, 11]);
        allPairs.push([a, 12]);
      }
    }

    // Scramble the pairs thoroughly
    shuffle(allPairs);

    const usedKeys = new Set();
    const questions = [];

    for (const [a, b] of allPairs) {
      if (questions.length >= numQuestions) break;
      const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
      if (usedKeys.has(key)) continue;
      usedKeys.add(key);

      const swap = Math.random() > 0.5;
      const displayA = swap ? b : a;
      const displayB = swap ? a : b;

      const answer = a * b;
      const distractors = buildMultiplicationDistractors(a, b, answer);
      const optionsList = shuffle([answer, ...distractors]);

      questions.push({
        id: `mul-${a}-${b}-${questions.length}-${Date.now()}`,
        multiplier: a,
        multiplicand: b,
        display: `${displayA} × ${displayB}`,
        answer,
        options: optionsList,
      });
    }

    return questions.slice(0, numQuestions);
  }

  // 3. Addition Challenge
  if (gameType === 'addition') {
    const config = GAME_TYPES.addition.difficulties[difficultyId] || GAME_TYPES.addition.difficulties.medium;
    const numQuestions = config.questions || 15;
    const questions = [];
    const used = new Set();

    while (questions.length < numQuestions) {
      let a, b;
      if (difficultyId === 'easy') {
        a = Math.floor(Math.random() * 9) + 2; // 2-10
        b = Math.floor(Math.random() * 9) + 2; // 2-10
      } else if (difficultyId === 'hard') {
        a = Math.floor(Math.random() * 200) + 50; // 50-249
        b = Math.floor(Math.random() * 200) + 25; // 25-224
      } else {
        // medium
        a = Math.floor(Math.random() * 45) + 12; // 12-56
        b = Math.floor(Math.random() * 45) + 12; // 12-56
      }

      const key = `${a}+${b}`;
      if (used.has(key)) continue;
      used.add(key);

      const answer = a + b;
      const distractors = buildAdditionDistractors(a, b, answer);
      const optionsList = shuffle([answer, ...distractors]);

      questions.push({
        id: `add-${a}-${b}-${questions.length}`,
        firstOperand: a,
        secondOperand: b,
        display: `${a} + ${b}`,
        answer,
        options: optionsList,
      });
    }

    return questions;
  }

  // 4. Subtraction Challenge (Non-negative results!)
  if (gameType === 'subtraction') {
    const config = GAME_TYPES.subtraction.difficulties[difficultyId] || GAME_TYPES.subtraction.difficulties.medium;
    const numQuestions = config.questions || 15;
    const questions = [];
    const used = new Set();

    while (questions.length < numQuestions) {
      let a, b;
      if (difficultyId === 'easy') {
        a = Math.floor(Math.random() * 15) + 6; // 6-20
        b = Math.floor(Math.random() * (a - 2)) + 2; // 2 to a-1
      } else if (difficultyId === 'hard') {
        a = Math.floor(Math.random() * 300) + 100; // 100-399
        b = Math.floor(Math.random() * (a - 30)) + 25; // 25 to a-30
      } else {
        // medium
        a = Math.floor(Math.random() * 70) + 25; // 25-94
        b = Math.floor(Math.random() * (a - 10)) + 8; // 8 to a-10
      }

      const key = `${a}-${b}`;
      if (used.has(key)) continue;
      used.add(key);

      const answer = a - b;
      const distractors = buildSubtractionDistractors(a, b, answer);
      const optionsList = shuffle([answer, ...distractors]);

      questions.push({
        id: `sub-${a}-${b}-${questions.length}`,
        firstOperand: a,
        secondOperand: b,
        display: `${a} − ${b}`,
        answer,
        options: optionsList,
      });
    }

    return questions;
  }

  // 5. Division Challenge (Clean division without remainders)
  if (gameType === 'division') {
    const config = GAME_TYPES.division.difficulties[difficultyId] || GAME_TYPES.division.difficulties.medium;
    const numQuestions = config.questions || 15;
    const questions = [];
    const used = new Set();

    while (questions.length < numQuestions) {
      let divisor, quotient;
      if (difficultyId === 'easy') {
        const easyDivisors = [2, 3, 5, 10];
        divisor = easyDivisors[Math.floor(Math.random() * easyDivisors.length)];
        quotient = Math.floor(Math.random() * 9) + 2; // 2-10
      } else if (difficultyId === 'hard') {
        divisor = Math.floor(Math.random() * 9) + 4; // 4-12
        quotient = Math.floor(Math.random() * 11) + 4; // 4-14
      } else {
        // medium
        divisor = Math.floor(Math.random() * 8) + 2; // 2-9
        quotient = Math.floor(Math.random() * 8) + 2; // 2-9
      }

      const dividend = divisor * quotient;
      const key = `${dividend}/${divisor}`;
      if (used.has(key)) continue;
      used.add(key);

      const answer = quotient;
      const distractors = buildDivisionDistractors(dividend, divisor, answer);
      const optionsList = shuffle([answer, ...distractors]);

      questions.push({
        id: `div-${dividend}-${divisor}-${questions.length}`,
        firstOperand: dividend,
        secondOperand: divisor,
        display: `${dividend} ÷ ${divisor}`,
        answer,
        options: optionsList,
      });
    }

    return questions;
  }

  return [];
}
