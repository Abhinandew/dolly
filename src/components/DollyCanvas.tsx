import React, { useRef, useEffect, memo } from 'react';
import { useDolly } from '../context/DollyContext';
import { DollyRenderer } from '../renderer/DollyRenderer';

interface DollyCanvasProps {
  className?: string;
}

export const DollyCanvas: React.FC<DollyCanvasProps> = memo(({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<DollyRenderer | null>(null);

  const {
    appearance,
    showDebugRig,
    audioAnalyzerRef,
    danceEngineRef,
    choreoPlayerRef,
    isListening,
  } = useDolly();

  // High-frequency animation loop access via stable refs (no React state in RAF)
  const appearanceRef = useRef(appearance);
  appearanceRef.current = appearance;

  const showDebugRigRef = useRef(showDebugRig);
  showDebugRigRef.current = showDebugRig;

  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    rendererRef.current = new DollyRenderer(ctx);

    let animationFrameId: number;
    let lastTime = performance.now();

    // High performance 60 FPS Render Loop with ZERO allocations
    const renderLoop = (time: number) => {
      const deltaTime = Math.max(1, Math.min(100, time - lastTime));
      lastTime = time;

      // 1. Fetch real-time audio analysis
      const audio = audioAnalyzerRef.current.analyze(time);

      // 2. Procedural movement generation
      const proceduralPose = danceEngineRef.current.update(
        audio,
        isListeningRef.current,
        deltaTime
      );

      // 3. Choreography player interpolation & crossfade blend
      const { pose } = choreoPlayerRef.current.update(proceduralPose, time);

      // 4. Render the seamless character
      if (rendererRef.current && canvas) {
        rendererRef.current.showDebugRig = showDebugRigRef.current;
        rendererRef.current.render(
          pose,
          appearanceRef.current,
          audio.beatIntensity,
          canvas.width,
          canvas.height
        );
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    // Mobile-optimized Resize Handler with GPU fill-rate protection
    const handleResize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Clamp DPR to 1.5 on mobile to avoid excessive fill-rate overhead
      const maxDpr = window.innerWidth < 768 ? 1.5 : 2.0;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

      const targetW = Math.floor(rect.width * dpr);
      const targetH = Math.floor(rect.height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        if (ctx) {
          ctx.scale(dpr, dpr);
        }
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [audioAnalyzerRef, danceEngineRef, choreoPlayerRef]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none will-change-transform ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block touch-none pointer-events-none"
      />
    </div>
  );
});
