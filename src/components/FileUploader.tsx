import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, ShieldCheck, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isLoading = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Check MIME type or extension
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorMessage('Please select a valid PDF file.');
      return;
    }

    setErrorMessage(null);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative flex flex-col items-center justify-center p-10 sm:p-14 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-700 bg-slate-900/60 hover:border-indigo-500/70 hover:bg-slate-900/90'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isLoading}
        />

        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-5 text-indigo-400 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-semibold text-white mb-2 text-center">
          Drop your PDF here, or <span className="text-indigo-400 underline underline-offset-4">browse</span>
        </h3>
        <p className="text-sm text-slate-400 text-center max-w-sm mb-6">
          Supports PDFs of any size. Snip exact page ranges quickly with live preview.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-4 border-t border-slate-800 w-full">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Any file size accepted</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>100% In-Browser Privacy</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 flex items-center gap-2 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
