# PDF Snipper ✂️

A fast, lightweight, and 100% private client-side web application to snip and trim page ranges from any PDF document.

Everything runs entirely in your browser using WebAssembly and Web Workers — zero server uploads, no file size limits, and complete data privacy.

## Features

- ⚡ **Zero-Server Processing**: All PDF manipulation happens locally in your browser. Files never leave your device.
- 📦 **Any PDF Size**: Handles large multi-hundred-page documents without server timeout or upload limits.
- 🎯 **Page Range Snipper**: Select start and end pages with numeric inputs, stepper controls, or presets (*All Pages*, *First Page*, *Last Page*).
- 👁️ **Live Boundary Preview**: Instant canvas preview of the selected start and end pages via PDF.js worker.
- 💾 **Instant Download**: Automatically generates and downloads clean, sanitized output files (e.g. `document-pages-3-to-8.pdf`).
- 🎨 **Modern Interface**: Built with React 19, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **PDF Trimming**: `pdf-lib` (zero-server page extraction and saving)
- **Page Previews**: `pdfjs-dist` (on-demand canvas rendering in Web Worker)
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (or npm / yarn)

### Installation

```bash
# Clone the repository
git clone git@github.com:seamoonpandey/pdfsnipper.git
cd pdfsnipper

# Install dependencies
pnpm install
```

### Development

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
pnpm test
```

### Production Build

```bash
pnpm run build
```

## License

MIT
