import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Tables() {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState(7);
  const [viewMode, setViewMode] = useState('focused'); // 'focused' | 'all'

  const tablesList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handlePractice = (tableNum) => {
    navigate('/practice', {
      state: {
        gameType: 'multiplication',
        tableNum: tableNum,
        difficultyId: 'medium',
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-up pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
          Study & Memorize
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Multiplication Tables (1–10)
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Read, understand patterns, and practice each table individually before taking the challenge!
        </p>
      </div>

      {/* Table Selector (1 to 10) */}
      <div className="card p-3 sm:p-4 bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span>SELECT A TABLE:</span>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode('focused')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                viewMode === 'focused' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Card View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                viewMode === 'all' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All 1–10
            </button>
          </div>
        </div>

        {/* Buttons: 1 2 3 4 5 6 7 8 9 10 */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {tablesList.map(num => (
            <button
              key={num}
              type="button"
              onClick={() => {
                setSelectedTable(num);
                setViewMode('focused');
              }}
              className={`h-11 sm:h-12 rounded-xl text-base sm:text-lg font-black transition-all ${
                selectedTable === num && viewMode === 'focused'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
              aria-label={`Select table ${num}`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: FOCUSED TABLE CARD */}
      {viewMode === 'focused' && (
        <div className="card p-5 sm:p-7 shadow-sm border border-slate-200 space-y-5 animate-fade-up">
          {/* Top Banner */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Multiplication Table
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                {selectedTable} Times Table
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-black text-xl">
              ×{selectedTable}
            </div>
          </div>

          {/* Table Rows (1 to 10) */}
          <div className="space-y-1.5 max-w-sm mx-auto">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(multiplier => {
              const product = selectedTable * multiplier;
              return (
                <div
                  key={multiplier}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 transition-colors text-slate-700 font-bold text-base sm:text-lg"
                >
                  <span className="tabular-nums">
                    {selectedTable} × {multiplier}
                  </span>
                  <span className="text-slate-400 font-medium">=</span>
                  <span className="font-black text-blue-700 text-lg sm:text-xl tabular-nums">
                    {product}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Practice Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handlePractice(selectedTable)}
              className="btn-primary w-full py-4 text-base sm:text-lg font-bold shadow-md shadow-blue-200"
              style={{ borderRadius: '16px' }}
            >
              <span>Practice Table {selectedTable}</span>
              <span>→</span>
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              Starts a focused quiz testing only the ×{selectedTable} table facts
            </p>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL TABLES 1–10 GRID */}
      {viewMode === 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up">
          {tablesList.map(tableNum => (
            <div key={tableNum} className="card p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-black text-lg text-slate-800">
                  {tableNum} Times Table
                </h3>
                <button
                  type="button"
                  onClick={() => handlePractice(tableNum)}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors"
                >
                  Practice →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1 text-xs sm:text-sm font-semibold text-slate-600">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(mult => (
                  <div key={mult} className="flex justify-between px-2 py-1 bg-slate-50 rounded">
                    <span>{tableNum} × {mult}</span>
                    <span className="font-bold text-slate-800">{tableNum * mult}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
