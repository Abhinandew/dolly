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
    audioAnalysisRef,
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

    const cssSizeRef = { w: 0, h: 0 };

    const renderLoop = (time: number) => {
      const deltaTime = Math.max(1, Math.min(100, time - lastTime));
      lastTime = time;

      // analyze() is called ONLY here (the sole RAF tick owner).
      // Result is written into audioAnalysisRef so the telemetry loop
      // and energy switcher can read it without calling analyze() again.
      const audio = audioAnalyzerRef.current.analyze(time);
      audioAnalysisRef.current = audio;

      const proceduralPose = danceEngineRef.current.update(
        audio,
        isListeningRef.current,
        deltaTime
      );

      const { pose } = choreoPlayerRef.current.update(proceduralPose, time);

      if (rendererRef.current && canvas && cssSizeRef.w > 0 && cssSizeRef.h > 0) {
        rendererRef.current.showDebugRig = showDebugRigRef.current;
        rendererRef.current.render(
          pose,
          appearanceRef.current,
          audio.beatIntensity,
          cssSizeRef.w,
          cssSizeRef.h
        );
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    const handleResize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const maxDpr = window.innerWidth < 768 ? 1.5 : 2.0;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

      const targetW = Math.floor(rect.width * dpr);
      const targetH = Math.floor(rect.height * dpr);
      cssSizeRef.w = rect.width;
      cssSizeRef.h = rect.height;

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      }

      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      // Clear the canvas so a stale frame isn't visible on remount
      if (canvas) {
        const cleanCtx = canvas.getContext('2d');
        if (cleanCtx) cleanCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
      rendererRef.current = null;
    };
  }, [audioAnalyzerRef, audioAnalysisRef, danceEngineRef, choreoPlayerRef]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none will-change-transform ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block touch-none pointer-events-none"
        aria-label="Dolly dancing character animation"
        role="img"
      />
    </div>
  );
});
