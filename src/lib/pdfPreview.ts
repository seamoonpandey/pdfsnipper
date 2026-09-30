import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export type PdfJsDocument = pdfjsLib.PDFDocumentProxy;

/**
 * Loads a PDF document instance for preview purposes.
 * Note: Clones the ArrayBuffer to ensure the original buffer isn't detached by worker transfer.
 */
export async function loadPreviewDocument(data: ArrayBuffer | Uint8Array): Promise<PdfJsDocument> {
  const clonedData = data instanceof Uint8Array ? data.slice().buffer : data.slice(0);
  const loadingTask = pdfjsLib.getDocument({
    data: clonedData,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@' + pdfjsLib.version + '/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

// Track active render tasks per canvas to cleanly cancel in-flight jobs
const activeRenderTasks = new WeakMap<HTMLCanvasElement, { cancel: () => void }>();

export interface RenderPageOptions {
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Renders a specific 1-indexed page onto an HTMLCanvasElement with device pixel ratio scaling.
 */
export async function renderPageToCanvas(
  pdfDoc: PdfJsDocument,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  options: RenderPageOptions = {}
): Promise<void> {
  // Cancel any existing render operation on this canvas
  const existingTask = activeRenderTasks.get(canvas);
  if (existingTask) {
    try {
      existingTask.cancel();
    } catch {
      // Ignore cancellation exceptions
    }
    activeRenderTasks.delete(canvas);
  }

  const page = await pdfDoc.getPage(pageNumber);
  const unscaledViewport = page.getViewport({ scale: 1.0 });

  const maxWidth = options.maxWidth || 280;
  const maxHeight = options.maxHeight || 380;

  const scaleX = maxWidth / unscaledViewport.width;
  const scaleY = maxHeight / unscaledViewport.height;
  const scale = Math.min(scaleX, scaleY, 1.5); // cap maximum zoom

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const viewport = page.getViewport({ scale: scale * dpr });

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
  canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Failed to get 2D canvas context');
  }

  // Draw white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
  };

  const renderTask = page.render(renderContext);
  activeRenderTasks.set(canvas, renderTask);

  try {
    await renderTask.promise;
  } catch (err: unknown) {
    // If it was cancelled by a subsequent page render, silently swallow
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'RenderingCancelledException') {
      return;
    }
    throw err;
  } finally {
    if (activeRenderTasks.get(canvas) === renderTask) {
      activeRenderTasks.delete(canvas);
    }
  }
}
