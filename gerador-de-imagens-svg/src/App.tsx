import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Download, Copy, Check, Info } from 'lucide-react';

/**
 * Blob Engine: Generates a smooth SVG path for an organic shape.
 * Based on radial points and cubic bezier curves.
 */
function generateBlobPath(complexity: number, contrast: number, seed: number) {
  const points = [];
  const angleStep = (Math.PI * 2) / complexity;
  const radius = 150;
  
  // Deterministic random based on seed
  const random = (i: number) => {
    const x = Math.sin(seed + i * 123.456) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < complexity; i++) {
    const angle = i * angleStep;
    const variance = random(i) * (contrast * 20);
    const r = radius + variance - (contrast * 10);
    const x = 200 + Math.cos(angle) * r;
    const y = 200 + Math.sin(angle) * r;
    points.push({ x, y });
  }

  // Create path using cubic bezier
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];
    
    // Control points for smoothness
    const cp1x = p1.x + (p2.x - points[(i - 1 + points.length) % points.length].x) * 0.2;
    const cp1y = p1.y + (p2.y - points[(i - 1 + points.length) % points.length].y) * 0.2;
    const cp2x = p2.x - (p3.x - p1.x) * 0.2;
    const cp2y = p2.y - (p3.y - p1.y) * 0.2;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path + ' Z';
}

export default function App() {
  // State
  const [complexity, setComplexity] = useState(6);
  const [contrast, setContrast] = useState(4);
  const [color, setColor] = useState('#3b82f6');
  const [seed, setSeed] = useState(Math.random());
  const [copied, setCopied] = useState(false);

  // Memoized path
  const path = useMemo(() => generateBlobPath(complexity, contrast, seed), [complexity, contrast, seed]);

  // Actions
  const randomize = () => setSeed(Math.random());
  
  const copyToClipboard = useCallback(() => {
    const svgCode = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">\n  <path fill="${color}" d="${path}" />\n</svg>`;
    navigator.clipboard.writeText(svgCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [color, path]);

  const downloadSVG = () => {
    const svgCode = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">\n  <path fill="${color}" d="${path}" />\n</svg>`;
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blob-${Math.floor(seed * 10000)}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-4 font-sans text-slate-900 md:p-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">Blobmaker</h1>
        <p className="mt-2 text-slate-500">Gere formas orgânicas e suaves instantaneamente.</p>
      </header>

      {/* Main Canvas Area */}
      <main className="relative flex h-[300px] w-full max-w-lg items-center justify-center rounded-3xl bg-white shadow-xl md:h-[450px]">
        <svg viewBox="0 0 400 400" className="h-full w-full drop-shadow-2xl">
          <motion.path
            initial={false}
            animate={{ d: path, fill: color }}
            transition={{ type: 'spring', damping: 20, stiffness: 60 }}
          />
        </svg>
      </main>

      {/* Control Bar */}
      <div className="mt-8 w-full max-w-2xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Complexity Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <label className="text-slate-700">Complexidade</label>
              <span className="text-slate-400">{complexity}</span>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              value={complexity}
              onChange={(e) => setComplexity(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-blue-600"
            />
          </div>

          {/* Contrast Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <label className="text-slate-700">Contraste</label>
              <span className="text-slate-400">{contrast}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-blue-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          {/* Color Picker */}
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-xl border-2 border-white shadow-md" 
              style={{ backgroundColor: color }}
            />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-12 cursor-pointer border-none bg-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={randomize}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
              title="Randomizar"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={copyToClipboard}
              className="flex h-11 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              <span>{copied ? 'Copiado!' : 'Copiar SVG'}</span>
            </button>
            <button
              onClick={downloadSVG}
              className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
            >
              <Download size={18} />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-8 flex items-center gap-2 text-xs text-slate-400">
        <Info size={14} />
        <span>Use as formas geradas livremente em seus projetos.</span>
      </footer>
    </div>
  );
}
