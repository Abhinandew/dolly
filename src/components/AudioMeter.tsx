import React, { useEffect, useRef } from 'react';
import { Volume2, Activity, Zap } from 'lucide-react';
import { useDolly } from '../context/DollyContext';

export const AudioMeter: React.FC = React.memo(() => {
  const { audioAnalysis, isListening, audioAnalyzerRef } = useDolly();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw mini spectrum analyzer on canvas
  useEffect(() => {
    let animId: number;

    const draw = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const freq = audioAnalyzerRef.current.getByteFrequencyData();
          if (freq && isListening) {
            const barCount = 18;
            const barWidth = canvas.width / barCount;
            const step = Math.floor(freq.length / (barCount * 2));

            for (let i = 0; i < barCount; i++) {
              const val = freq[i * step] / 255;
              const barHeight = Math.max(2, val * canvas.height);
              const x = i * barWidth;
              const y = canvas.height - barHeight;

              // Gradient from cyan to purple
              const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
              grad.addColorStop(0, '#06b6d4');
              grad.addColorStop(1, '#ec4899');

              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.roundRect(x + 1, y, barWidth - 2, barHeight, 2);
              ctx.fill();
            }
          } else {
            // Idle subtle line
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(0, canvas.height - 2, canvas.width, 2);
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [isListening, audioAnalyzerRef]);

  return (
    <div className="glass-card px-4 py-3 rounded-2xl flex items-center gap-4 text-xs select-none">
      {/* Mini frequency spectrum canvas */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" /> Spectrum
        </span>
        <canvas
          ref={canvasRef}
          width={80}
          height={28}
          className="rounded bg-slate-950/60 border border-white/5"
        />
      </div>

      {/* Energy & Bass Levels */}
      <div className="flex flex-col gap-1.5 w-24">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-indigo-400" /> Energy
          </span>
          <span className="font-mono text-slate-300">
            {Math.round(audioAnalysis.energy * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-75"
            style={{ width: `${Math.min(100, audioAnalysis.energy * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-pink-400" /> Bass
          </span>
          <span className="font-mono text-slate-300">
            {Math.round(audioAnalysis.bassEnergy * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-pink-500 rounded-full transition-all duration-75"
            style={{ width: `${Math.min(100, audioAnalysis.bassEnergy * 100)}%` }}
          />
        </div>
      </div>

      {/* BPM & Beat Flash */}
      <div className="flex flex-col items-center justify-center pl-2 border-l border-white/10">
        <div className="text-[10px] uppercase font-bold text-slate-400">Tempo</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`w-2.5 h-2.5 rounded-full transition-all duration-75 ${
              audioAnalysis.beatDetected
                ? 'bg-rose-500 scale-125 shadow-lg shadow-rose-500/60'
                : 'bg-slate-700'
            }`}
          />
          <span className="text-sm font-bold font-mono text-white">
            {audioAnalysis.estimatedBPM || 120}
          </span>
        </div>
        <span className="text-[9px] text-slate-500 font-medium">BPM</span>
      </div>
    </div>
  );
});
