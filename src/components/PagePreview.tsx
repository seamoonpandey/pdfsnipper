import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, FileQuestion } from 'lucide-react';
import { PdfJsDocument, renderPageToCanvas } from '../lib/pdfPreview';

interface PagePreviewProps {
  pdfDoc: PdfJsDocument | null;
  pageNumber: number;
  totalPages: number;
  label: string;
  onPageChange?: (newPage: number) => void;
  minPage?: number;
  maxPage?: number;
}

export const PagePreview: React.FC<PagePreviewProps> = ({
  pdfDoc,
  pageNumber,
  totalPages,
  label,
  onPageChange,
  minPage = 1,
  maxPage = totalPages,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function render() {
      if (!pdfDoc || !canvasRef.current || pageNumber < 1 || pageNumber > totalPages) {
        setIsRendering(false);
        return;
      }

      setIsRendering(true);
      setRenderError(null);

      try {
        await renderPageToCanvas(pdfDoc, pageNumber, canvasRef.current, {
          maxWidth: 260,
          maxHeight: 340,
        });
        if (!isCancelled) {
          setIsRendering(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          // Ignore cancelled renders
          if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'RenderingCancelledException') {
            return;
          }
          console.error(`Error rendering page ${pageNumber}:`, err);
          setRenderError('Could not render preview');
          setIsRendering(false);
        }
      }
    }

    render();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNumber, totalPages]);

  const canGoPrev = onPageChange && pageNumber > minPage;
  const canGoNext = onPageChange && pageNumber < maxPage;

  return (
    <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl w-full max-w-[310px]">
      {/* Header with Title and Page Indicator */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          {label}
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
          Page {pageNumber} of {totalPages}
        </span>
      </div>

      {/* Canvas Viewport Container */}
      <div className="relative w-full aspect-[1/1.3] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80 shadow-inner">
        {isRendering && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs z-10">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
            <span className="text-xs text-slate-400">Rendering page {pageNumber}...</span>
          </div>
        )}

        {renderError ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <FileQuestion className="w-8 h-8 text-amber-500 mb-2" />
            <span className="text-xs text-slate-400">{renderError}</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="max-h-full max-w-full rounded shadow-sm object-contain transition-opacity duration-150"
          />
        )}
      </div>

      {/* Quick Navigation Stepper */}
      {onPageChange && (
        <div className="w-full flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={!canGoPrev}
            aria-label="Previous Page"
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="text-xs text-slate-400 font-mono">
            {pageNumber} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={!canGoNext}
            aria-label="Next Page"
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
