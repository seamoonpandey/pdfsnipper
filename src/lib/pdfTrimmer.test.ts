import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
  validatePageRange,
  getTrimmedFilename,
  formatFileSize,
  getPdfMetadata,
  trimPdf,
} from './pdfTrimmer';

describe('pdfTrimmer utility', () => {
  describe('validatePageRange', () => {
    it('accepts valid range within bounds', () => {
      expect(validatePageRange(1, 5, 10)).toEqual({ valid: true });
      expect(validatePageRange(3, 3, 10)).toEqual({ valid: true });
      expect(validatePageRange(1, 10, 10)).toEqual({ valid: true });
    });

    it('rejects start page less than 1', () => {
      const res = validatePageRange(0, 5, 10);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/less than 1/i);
    });

    it('rejects start page greater than end page', () => {
      const res = validatePageRange(6, 4, 10);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/greater than end page/i);
    });

    it('rejects end page exceeding total pages', () => {
      const res = validatePageRange(1, 11, 10);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/cannot exceed total pages/i);
    });

    it('rejects zero or negative total pages', () => {
      const res = validatePageRange(1, 1, 0);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/contains no pages/i);
    });
  });

  describe('getTrimmedFilename', () => {
    it('creates multi-page range filename', () => {
      expect(getTrimmedFilename('annual-report.pdf', 3, 8)).toBe(
        'annual-report-pages-3-to-8.pdf'
      );
    });

    it('creates single page filename', () => {
      expect(getTrimmedFilename('invoice.pdf', 4, 4)).toBe('invoice-page-4.pdf');
    });

    it('sanitizes special characters in filename', () => {
      expect(getTrimmedFilename('my file (final) [v2].pdf', 1, 2)).toBe(
        'my_file__final___v2_-pages-1-to-2.pdf'
      );
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
    });
  });

  describe('trimPdf and getPdfMetadata with synthesized PDF', () => {
    async function createTestPdf(pageCount: number): Promise<Uint8Array> {
      const doc = await PDFDocument.create();
      for (let i = 0; i < pageCount; i++) {
        const page = doc.addPage([200, 300]);
        page.drawText(`Page ${i + 1}`);
      }
      return await doc.save();
    }

    it('retrieves accurate page count and metadata', async () => {
      const pdfBytes = await createTestPdf(7);
      const meta = await getPdfMetadata(pdfBytes);
      expect(meta.pageCount).toBe(7);
    });

    it('accurately trims requested page slice', async () => {
      const originalPdf = await createTestPdf(10);
      const trimmed = await trimPdf(originalPdf, 3, 6);

      const trimmedMeta = await getPdfMetadata(trimmed);
      expect(trimmedMeta.pageCount).toBe(4); // pages 3, 4, 5, 6
    });

    it('throws error when trimming invalid range', async () => {
      const originalPdf = await createTestPdf(5);
      await expect(trimPdf(originalPdf, 4, 8)).rejects.toThrow(
        /cannot exceed total pages/i
      );
    });
  });
});
