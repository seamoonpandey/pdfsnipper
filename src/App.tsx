import { useState, useCallback, useEffect } from 'react';
import {
  Scissors,
  Download,
  RotateCcw,
  FileCheck,
  Sparkles,
  AlertTriangle,
  Loader2,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { RangeSelector } from './components/RangeSelector';
import { PagePreview } from './components/PagePreview';
import {
  getPdfMetadata,
  trimPdf,
  downloadPdf,
  getTrimmedFilename,
  formatFileSize,
} from './lib/pdfTrimmer';
import { loadPreviewDocument, PdfJsDocument } from './lib/pdfPreview';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfPreviewDoc, setPdfPreviewDoc] = useState<PdfJsDocument | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);

  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [isTrimming, setIsTrimming] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [trimmedBytes, setTrimmedBytes] = useState<Uint8Array | null>(null);
  const [lastDownloadedName, setLastDownloadedName] = useState<string | null>(null);

  // Clean up PDF.js document when unmounting or changing files
  useEffect(() => {
    return () => {
      if (pdfPreviewDoc) {
        pdfPreviewDoc.destroy();
      }
    };
  }, [pdfPreviewDoc]);

  // Handle incoming file selection
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setIsLoadingFile(true);
    setErrorMessage(null);
    setDownloadSuccess(false);
    setTrimmedBytes(null);

    try {
      const buffer = await selectedFile.arrayBuffer();

      // Read metadata with pdf-lib
      const meta = await getPdfMetadata(buffer);
      if (meta.pageCount < 1) {
        throw new Error('This PDF appears to have no readable pages.');
      }

      // Load preview document with PDF.js (cloned buffer so ownership transfer to worker is safe)
      const previewDoc = await loadPreviewDocument(buffer);

      setFile(selectedFile);
      setFileBuffer(buffer);
      setPdfPreviewDoc(previewDoc);
      setTotalPages(meta.pageCount);
      setStartPage(1);
      setEndPage(meta.pageCount);
    } catch (err: unknown) {
      console.error('Failed to load PDF:', err);
      const msg = err instanceof Error ? err.message : 'Failed to parse the PDF file.';
      setErrorMessage(msg);
      setFile(null);
      setFileBuffer(null);
      setPdfPreviewDoc(null);
    } finally {
      setIsLoadingFile(false);
    }
  }, []);

  // Reset to initial upload screen
  const handleReset = () => {
    if (pdfPreviewDoc) {
      pdfPreviewDoc.destroy();
    }
    setFile(null);
    setFileBuffer(null);
    setPdfPreviewDoc(null);
    setTotalPages(0);
    setStartPage(1);
    setEndPage(1);
    setDownloadSuccess(false);
    setTrimmedBytes(null);
    setErrorMessage(null);
  };

  // Perform trimming & trigger automatic download
  const handleTrimAndDownload = async () => {
    if (!file || !fileBuffer || totalPages < 1) return;

    setIsTrimming(true);
    setErrorMessage(null);
    setDownloadSuccess(false);

    try {
      const resultBytes = await trimPdf(fileBuffer, startPage, endPage);
      const filename = getTrimmedFilename(file.name, startPage, endPage);

      setTrimmedBytes(resultBytes);
      setLastDownloadedName(filename);
      downloadPdf(resultBytes, filename);
      setDownloadSuccess(true);
    } catch (err: unknown) {
      console.error('Error trimming PDF:', err);
      const msg = err instanceof Error ? err.message : 'An error occurred while trimming the PDF.';
      setErrorMessage(msg);
    } finally {
      setIsTrimming(false);
    }
  };

  // Manual re-download of already trimmed document
  const handleRedownload = () => {
    if (trimmedBytes && lastDownloadedName) {
      downloadPdf(trimmedBytes, lastDownloadedName);
    }
  };

  const selectedCount = Math.max(0, endPage - startPage + 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation / Brand Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                PDF Snipper
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Client-side
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {file && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload Another PDF</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col justify-center">
        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 flex items-start gap-3 text-red-200">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1 text-sm">{errorMessage}</div>
          </div>
        )}

        {/* View 1: Initial Upload State */}
        {!file ? (
          <div className="py-8 sm:py-12 flex flex-col items-center">
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-medium mb-4">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Zero-Server Fast PDF Page Trimmer
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Snip any page range from your PDF in seconds
              </h1>
              <p className="mt-3 text-slate-400 text-sm sm:text-base">
                Works with PDFs of any size. All operations execute directly in your browser with zero uploads, total privacy, and no file size limits.
              </p>
            </div>

            {isLoadingFile ? (
              <div className="w-full max-w-md p-10 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                <h4 className="text-white font-medium mb-1">Inspecting PDF...</h4>
                <p className="text-xs text-slate-400">Loading document pages and preparing preview.</p>
              </div>
            ) : (
              <FileUploader onFileSelect={handleFileSelect} isLoading={isLoadingFile} />
            )}
          </div>
        ) : (
          /* View 2: Trimming Workspace */
          <div className="space-y-8 animate-fadeIn">
            {/* Active Document Info Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate max-w-md" title={file.name}>
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span className="text-indigo-400 font-medium">{totalPages} total pages</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline"
                >
                  Change file
                </button>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Range Controls & Actions (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <RangeSelector
                  totalPages={totalPages}
                  startPage={startPage}
                  endPage={endPage}
                  onStartChange={setStartPage}
                  onEndChange={setEndPage}
                />

                {/* Primary Action Button */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleTrimAndDownload}
                    disabled={isTrimming}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none transition-all active:scale-[0.99] cursor-pointer"
                  >
                    {isTrimming ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Trimming {selectedCount} pages...</span>
                      </>
                    ) : (
                      <>
                        <Scissors className="w-5 h-5" />
                        <span>
                          Snip & Download Pages {startPage}–{endPage}
                        </span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Processed 100% locally. No files are uploaded to any server.</span>
                  </div>
                </div>

                {/* Download Success Card */}
                {downloadSuccess && (
                  <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-900/50 flex items-center justify-center text-emerald-400 shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Your trimmed PDF is ready!</h4>
                        <p className="text-xs text-emerald-300 mt-0.5 truncate max-w-xs sm:max-w-sm">
                          {lastDownloadedName}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRedownload}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shrink-0 shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Again</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Visual Boundary Previews (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-semibold text-white">Boundary Preview</h3>
                  <span className="text-xs text-slate-400">Visual verification</span>
                </div>

                {startPage === endPage ? (
                  /* Single Page Preview */
                  <div className="w-full flex justify-center">
                    <PagePreview
                      pdfDoc={pdfPreviewDoc}
                      pageNumber={startPage}
                      totalPages={totalPages}
                      label={`Single Snipped Page (${startPage})`}
                      onPageChange={(p) => {
                        setStartPage(p);
                        setEndPage(p);
                      }}
                      minPage={1}
                      maxPage={totalPages}
                    />
                  </div>
                ) : (
                  /* Start & End Side-by-Side Previews */
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 justify-items-center">
                    <PagePreview
                      pdfDoc={pdfPreviewDoc}
                      pageNumber={startPage}
                      totalPages={totalPages}
                      label="Start Page (First)"
                      onPageChange={setStartPage}
                      minPage={1}
                      maxPage={endPage}
                    />

                    <PagePreview
                      pdfDoc={pdfPreviewDoc}
                      pageNumber={endPage}
                      totalPages={totalPages}
                      label="End Page (Last)"
                      onPageChange={setEndPage}
                      minPage={startPage}
                      maxPage={totalPages}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>PDF Snipper — Instant, Private, Client-Side PDF Trimmer</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by pdf-lib & PDF.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
