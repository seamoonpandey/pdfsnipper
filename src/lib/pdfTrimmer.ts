import { PDFDocument } from 'pdf-lib';

export interface PageRangeValidation {
  valid: boolean;
  error?: string;
}

export interface PdfMetadata {
  pageCount: number;
  title?: string;
  author?: string;
}

/**
 * Validates that the requested page range is within acceptable document bounds (1-indexed).
 */
export function validatePageRange(
  startPage: number,
  endPage: number,
  totalPages: number
): PageRangeValidation {
  if (totalPages < 1) {
    return { valid: false, error: 'The document contains no pages.' };
  }
  if (!Number.isInteger(startPage) || !Number.isInteger(endPage)) {
    return { valid: false, error: 'Page numbers must be integers.' };
  }
  if (startPage < 1) {
    return { valid: false, error: 'Start page cannot be less than 1.' };
  }
  if (endPage > totalPages) {
    return { valid: false, error: `End page cannot exceed total pages (${totalPages}).` };
  }
  if (startPage > endPage) {
    return { valid: false, error: 'Start page cannot be greater than end page.' };
  }
  return { valid: true };
}

/**
 * Derives a clean filename for the trimmed PDF based on original name and selected range.
 */
export function getTrimmedFilename(
  originalFilename: string,
  startPage: number,
  endPage: number
): string {
  const baseName = originalFilename.replace(/\.[^/.]+$/, '').trim() || 'document';
  const sanitized = baseName.replace(/[^a-zA-Z0-9_\-]/g, '_');
  if (startPage === endPage) {
    return `${sanitized}-page-${startPage}.pdf`;
  }
  return `${sanitized}-pages-${startPage}-to-${endPage}.pdf`;
}

/**
 * Formats byte count into human-readable size string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const digitGroups = Math.floor(Math.log(bytes) / Math.log(1024));
  const unit = units[Math.min(digitGroups, units.length - 1)];
  const size = bytes / Math.pow(1024, digitGroups);
  return `${size.toFixed(size >= 10 || digitGroups === 0 ? 0 : 1)} ${unit}`;
}

/**
 * Inspects PDF bytes and retrieves total page count and metadata.
 */
export async function getPdfMetadata(
  pdfData: ArrayBuffer | Uint8Array
): Promise<PdfMetadata> {
  const doc = await PDFDocument.load(pdfData, { ignoreEncryption: true });
  return {
    pageCount: doc.getPageCount(),
    title: doc.getTitle(),
    author: doc.getAuthor(),
  };
}

/**
 * Trims a PDF to only the specified 1-indexed page range [startPage, endPage].
 */
export async function trimPdf(
  pdfData: ArrayBuffer | Uint8Array,
  startPage: number,
  endPage: number
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfData, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const validation = validatePageRange(startPage, endPage, totalPages);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid page range');
  }

  const trimmedDoc = await PDFDocument.create();
  
  // 1-indexed to 0-indexed page indices
  const pageIndices: number[] = [];
  for (let i = startPage - 1; i <= endPage - 1; i++) {
    pageIndices.push(i);
  }

  const copiedPages = await trimmedDoc.copyPages(srcDoc, pageIndices);
  for (const page of copiedPages) {
    trimmedDoc.addPage(page);
  }

  return await trimmedDoc.save();
}

/**
 * Utility to trigger immediate client-side file download.
 */
export function downloadPdf(data: Uint8Array, filename: string): void {
  const blob = new Blob([data as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
