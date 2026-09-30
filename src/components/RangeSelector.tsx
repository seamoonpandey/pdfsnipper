import React from 'react';
import { ArrowRight, BookOpen, Layers } from 'lucide-react';

interface RangeSelectorProps {
  totalPages: number;
  startPage: number;
  endPage: number;
  onStartChange: (page: number) => void;
  onEndChange: (page: number) => void;
}

export const RangeSelector: React.FC<RangeSelectorProps> = ({
  totalPages,
  startPage,
  endPage,
  onStartChange,
  onEndChange,
}) => {
  const selectedCount = Math.max(0, endPage - startPage + 1);

  const handleStartInput = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(1, Math.min(num, endPage));
      onStartChange(clamped);
    }
  };

  const handleEndInput = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(startPage, Math.min(num, totalPages));
      onEndChange(clamped);
    }
  };

  // Quick action presets
  const selectAll = () => {
    onStartChange(1);
    onEndChange(totalPages);
  };

  const selectFirstPage = () => {
    onStartChange(1);
    onEndChange(1);
  };

  const selectLastPage = () => {
    onStartChange(totalPages);
    onEndChange(totalPages);
  };

  // Calculate percentage positions for visual bar
  const startPercent = totalPages > 1 ? ((startPage - 1) / (totalPages - 1)) * 100 : 0;
  const endPercent = totalPages > 1 ? ((endPage - 1) / (totalPages - 1)) * 100 : 100;
  const widthPercent = Math.max(1, endPercent - startPercent);

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Page Range Selection
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select the starting and ending page to trim from the document.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            All Pages
          </button>
          <button
            type="button"
            onClick={selectFirstPage}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            First Page
          </button>
          <button
            type="button"
            onClick={selectLastPage}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            Last Page
          </button>
        </div>
      </div>

      {/* Number Inputs Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Start Page Input */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <label htmlFor="start-page-input" className="block text-xs font-medium text-slate-400 mb-2">
            From Page
          </label>
          <div className="flex items-center gap-3">
            <input
              id="start-page-input"
              type="number"
              min={1}
              max={endPage}
              value={startPage}
              onChange={(e) => handleStartInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-lg focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onStartChange(Math.min(startPage + 1, endPage))}
                disabled={startPage >= endPage}
                className="w-7 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 text-xs font-bold"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => onStartChange(Math.max(startPage - 1, 1))}
                disabled={startPage <= 1}
                className="w-7 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 text-xs font-bold"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* End Page Input */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <label htmlFor="end-page-input" className="block text-xs font-medium text-slate-400 mb-2">
            To Page
          </label>
          <div className="flex items-center gap-3">
            <input
              id="end-page-input"
              type="number"
              min={startPage}
              max={totalPages}
              value={endPage}
              onChange={(e) => handleEndInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-lg focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onEndChange(Math.min(endPage + 1, totalPages))}
                disabled={endPage >= totalPages}
                className="w-7 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 text-xs font-bold"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => onEndChange(Math.max(endPage - 1, startPage))}
                disabled={endPage <= startPage}
                className="w-7 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 text-xs font-bold"
              >
                ▼
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Progress / Range Indicator Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Page 1</span>
          <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            Snippet: {selectedCount} of {totalPages} {totalPages === 1 ? 'page' : 'pages'}
          </span>
          <span>Page {totalPages}</span>
        </div>

        <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-150"
            style={{
              left: `${startPercent}%`,
              width: `${widthPercent}%`,
            }}
          />
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-900/50 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-indigo-200">
          <span className="font-semibold text-white">Range:</span>
          <span>Page {startPage}</span>
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          <span>Page {endPage}</span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-900/60 text-indigo-200 font-medium">
          {selectedCount} {selectedCount === 1 ? 'page' : 'pages'} will be snipped
        </span>
      </div>
    </div>
  );
};
