/**
 * questionGenerator.js
 *
 * Generates randomized question sets for:
 * 1. Multiplication (5 difficulty levels: Easy 0–5, Easy 6–10, Medium 0–10, Hard 0–12, Expert 0–12, Master 0–12)
 * 2. Addition
 * 3. Subtraction (Always non-negative results)
 * 4. Division (Clean division without remainders)
 *
 * All questions produce 4 unique options with smart educational distractors.
 * Commutative duplicate prevention ensures e.g. 7×8 and 8×7 never appear in the same session.
 */

import { DIFFICULTIES } from '../data/tables.js';
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

  // 1. Table neighbor errors (most common student error: off by 1 multiple)
  const neighborCandidates = [
    (a + 1) * b,
    (a - 1) * b,
    a * (b + 1),
    a * (b - 1),
    correctAnswer + a,
    correctAnswer - a,
    correctAnswer + b,
    correctAnswer - b,
  ];

  // 2. Off by 2 multiples or calculation slip
  const slipCandidates = [
    (a + 2) * b,
    (a - 2) * b,
    correctAnswer + 2,
    correctAnswer - 2,
    correctAnswer + 4,
    correctAnswer - 4,
    correctAnswer + 10,
    correctAnswer - 10,
  ];

  // 3. Digit transposition (e.g., 54 -> 45) for double-digit answers
  if (correctAnswer >= 12 && correctAnswer <= 99) {
    const s = String(correctAnswer);
    if (s[0] !== s[1]) {
      const transposed = Number(s[1] + s[0]);
      if (transposed !== correctAnswer) {
        slipCandidates.push(transposed);
      }
    }
  }

  // 4. Addition confusion for early learners (e.g. 4 × 5 = 9 or 20)
  if (a + b !== correctAnswer) {
    slipCandidates.push(a + b);
  }

  // Add all valid non-negative candidates distinct from correct answer
  neighborCandidates.forEach(v => {
    if (v >= 0 && v !== correctAnswer) pool.add(v);
  });
  slipCandidates.forEach(v => {
    if (v >= 0 && v !== correctAnswer) pool.add(v);
  });

  const candidatesList = Array.from(pool).filter(v => v !== correctAnswer);
  shuffle(candidatesList);

  const distractors = candidatesList.slice(0, 3);

  // Guarantee exactly 3 unique distractors
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
  const difficultyId = options.difficultyId || 'easy';
  const tableNum = options.tableNum != null ? Number(options.tableNum) : null;
  const tableRange = options.tableRange || '0-5';

  // 1. Single Table Focused Practice (e.g. Table 7: randomized 7×4, 7×8, 7×2, 7×9...)
  if (gameType === 'multiplication' && tableNum != null && !isNaN(tableNum)) {
    const multipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    shuffle(multipliers);
    const selected = multipliers.slice(0, 11);

    return selected.map((b, idx) => {
      const a = tableNum;
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

  // 2. Progressive 5-Level Multiplication Challenge
  if (gameType === 'multiplication') {
    const diffConfig = DIFFICULTIES[difficultyId] || DIFFICULTIES.easy;
    const numQuestions = diffConfig.questions || 10;

    let minTable = 0;
    let maxTable = 5;
    let maxOperand = 10;

    if (difficultyId === 'easy') {
      if (tableRange === '6-10' || tableRange === '6–10') {
        minTable = 6;
        maxTable = 10;
        maxOperand = 10;
      } else {
        minTable = 0;
        maxTable = 5;
        maxOperand = 10;
      }
    } else if (difficultyId === 'medium') {
      minTable = 0;
      maxTable = 10;
      maxOperand = 10;
    } else if (difficultyId === 'hard') {
      minTable = 0;
      maxTable = 12;
      maxOperand = 12;
    } else if (difficultyId === 'expert') {
      minTable = 0;
      maxTable = 12;
      maxOperand = 12;
    } else if (difficultyId === 'master') {
      minTable = 0;
      maxTable = 12;
      maxOperand = 12;
    }

    // Build balanced candidate pool
    // To prevent duplicate questions (Section 15):
    // 7×8 and 8×7 are considered equivalent using normalize(a, b) = `${min}-${max}`
    const candidatePairs = [];
    const pairMap = new Map();

    for (let a = minTable; a <= maxTable; a++) {
      // Prioritize table multipliers 1..maxOperand, with occasional 0
      const bValues = [0];
      for (let b = 1; b <= maxOperand; b++) {
        bValues.push(b);
      }

      for (const b of bValues) {
        // Commutative key
        const normKey = `${Math.min(a, b)}-${Math.max(a, b)}`;
        if (!pairMap.has(normKey)) {
          pairMap.set(normKey, [a, b]);
        }
      }
    }

    const allPairs = Array.from(pairMap.values());
    shuffle(allPairs);

    // In Expert & Master, ensure balanced distribution across tables minTable..maxTable
    let sortedSelection = [];
    if (difficultyId === 'expert' || difficultyId === 'master') {
      // Group pairs by table
      const byTable = {};
      for (let t = minTable; t <= maxTable; t++) {
        byTable[t] = [];
      }
      for (const pair of allPairs) {
        if (byTable[pair[0]]) byTable[pair[0]].push(pair);
        if (pair[0] !== pair[1] && byTable[pair[1]]) byTable[pair[1]].push(pair);
      }

      // Round-robin selection across tables to ensure balanced table distribution
      const selectedKeys = new Set();
      let tableIndex = minTable;

      while (sortedSelection.length < numQuestions && selectedKeys.size < allPairs.length) {
        const poolForTable = byTable[tableIndex] || [];
        const nextPair = poolForTable.find(p => !selectedKeys.has(`${Math.min(p[0], p[1])}-${Math.max(p[0], p[1])}`));

        if (nextPair) {
          const key = `${Math.min(nextPair[0], nextPair[1])}-${Math.max(nextPair[0], nextPair[1])}`;
          selectedKeys.add(key);
          sortedSelection.push(nextPair);
        }

        tableIndex++;
        if (tableIndex > maxTable) {
          tableIndex = minTable;
        }

        // Failsafe in case round robin gets stuck
        if (sortedSelection.length < numQuestions && tableIndex === minTable && !nextPair) {
          for (const pair of allPairs) {
            const key = `${Math.min(pair[0], pair[1])}-${Math.max(pair[0], pair[1])}`;
            if (!selectedKeys.has(key)) {
              selectedKeys.add(key);
              sortedSelection.push(pair);
              if (sortedSelection.length >= numQuestions) break;
            }
          }
          break;
        }
      }
    } else {
      sortedSelection = allPairs.slice(0, numQuestions);
    }

    // Shuffle the final selection so sequence is unpredictable
    shuffle(sortedSelection);

    return sortedSelection.slice(0, numQuestions).map(([a, b], idx) => {
      // Randomize display order for natural variety (a × b or b × a)
      const swap = Math.random() > 0.5;
      const displayA = swap ? b : a;
      const displayB = swap ? a : b;
      const answer = a * b;
      const distractors = buildMultiplicationDistractors(a, b, answer);
      const optionsList = shuffle([answer, ...distractors]);

      return {
        id: `mul-${a}-${b}-${idx}-${Date.now()}`,
        multiplier: a,
        multiplicand: b,
        display: `${displayA} × ${displayB}`,
        answer,
        options: optionsList,
      };
    });
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
        a = Math.floor(Math.random() * 45) + 12; // 12-56
        b = Math.floor(Math.random() * 45) + 12; // 12-56
      }

      const key = `${Math.min(a, b)}+${Math.max(a, b)}`;
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
