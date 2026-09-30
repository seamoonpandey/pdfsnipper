# PDF Snipper - Design Specification

## Overview
A fast, 100% client-side web application that lets users upload a PDF of any size, inspect and specify a start-and-end page range with live visual preview, trim that range cleanly, and download the trimmed PDF file.

## User Flow & Requirements
1. **File Input**: Drag-and-drop or file picker accepting `.pdf` of any size.
2. **Document Loading**: In-browser ArrayBuffer reading and metadata extraction (total page count, file size, name).
3. **Range Selection**:
   - Start Page input (min 1, max End Page).
   - End Page input (min Start Page, max Total Pages).
   - Range validation & helper shortcuts (e.g., "First Page Only", "Last Page Only", "Select All").
4. **On-Demand Visual Preview**:
   - Preview card for the selected Start Page.
   - Preview card for the selected End Page.
   - Visual page navigation/stepper.
5. **Trimming Engine**:
   - Extract `[startPage - 1 ... endPage - 1]` using `pdf-lib`.
   - Preserve vector elements, original page dimensions, fonts, and contents.
6. **Download Output**:
   - Export trimmed PDF `Blob` and auto/manual download with sanitized filename: `<basename>-pages-<start>-<end>.pdf`.
   - Option to snip another range or reset to snip another file.

## Architecture & Tech Stack
- **Framework**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS + Lucide icons.
- **PDF Manipulation**: `pdf-lib` for fast, client-side zero-server extraction.
- **PDF Rendering**: `pdfjs-dist` configured with web worker for responsive canvas previews.
- **Unit / Component Testing**: Vitest + React Testing Library.

## Microtask Plan
- **Task 1**: Scaffold Vite + React + TypeScript + Tailwind CSS project & configure dependencies (`pdf-lib`, `pdfjs-dist`, `lucide-react`).
- **Task 2**: Implement core PDF trimmer utility (`src/lib/pdfTrimmer.ts`) with unit tests.
- **Task 3**: Implement PDF preview renderer utility / hook (`src/lib/pdfPreview.ts`) with canvas rendering.
- **Task 4**: Build Drag-and-Drop file uploader component (`src/components/FileUploader.tsx`).
- **Task 5**: Build Page Range Selector & Preview UI (`src/components/RangeSelector.tsx`, `src/components/PagePreview.tsx`).
- **Task 6**: Assemble Main Application with status indicators, trimming action, download trigger, and reset.
- **Task 7**: End-to-end verification and production build test.
