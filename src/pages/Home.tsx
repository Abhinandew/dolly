import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DollyCanvas } from '../components/DollyCanvas';
import { DanceStatusBadge } from '../components/DanceStatusBadge';
import { AudioMeter } from '../components/AudioMeter';
import { ControlsOverlay } from '../components/ControlsOverlay';
import { useDolly } from '../context/DollyContext';
import { Disc, Music } from 'lucide-react';

export const Home: React.FC = () => {
  const { liveState, recognizedSong, activeChoreography } = useDolly();

  // Fire celebratory party confetti when entering 🔥 Dance found / 🔥 Dancing
  useEffect(() => {
    if (liveState === 'dance_found') {
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#6366f1', '#ec4899', '#06b6d4', '#ffffff'],
      });
    }
  }, [liveState]);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between pt-16 pb-6 overflow-hidden bg-radial-vignette">
      {/* Dynamic Stage Lighting Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft centered stage spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl opacity-70" />
      </div>

      {/* Top Header Information: Live Status Badge & Telemetry */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <DanceStatusBadge state={liveState} />
        <AudioMeter />
      </div>

      {/* Center Stage: Large Animated Dolly Character */}
      <main className="relative z-10 flex-1 w-full flex items-center justify-center my-auto min-h-[380px]">
        <div className="w-full max-w-2xl h-[520px] max-h-[65vh]">
          <DollyCanvas className="w-full h-full" />
        </div>
      </main>

      {/* Bottom Area: Song Info Card (if detected) & Controls */}
      <footer className="relative z-10 w-full flex flex-col items-center gap-3">
        {/* Detected Song Card */}
        {recognizedSong && (
          <div className="glass-card px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-indigo-500/30 animate-fade-in shadow-xl shadow-indigo-500/10">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Disc className="w-4 h-4 animate-spin text-pink-400" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{recognizedSong.title}</span>
                {recognizedSong.isMock && (
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/10 font-mono">
                    Mock Match
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>{recognizedSong.artist}</span>
                <span>•</span>
                <span className="font-mono text-indigo-300">{recognizedSong.bpm} BPM</span>
                {activeChoreography && (
                  <>
                    <span>•</span>
                    <span className="text-pink-400 font-medium flex items-center gap-1">
                      <Music className="w-3 h-3" /> {activeChoreography.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Primary Controls */}
        <ControlsOverlay />
      </footer>
    </div>
  );
};
