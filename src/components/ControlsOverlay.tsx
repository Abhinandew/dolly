import React, { useState } from 'react';
import { Mic, Square, Pause, Play, Maximize2, Minimize2, Music2, AlertCircle } from 'lucide-react';
import { useDolly } from '../context/DollyContext';
import { SYNTH_TRACKS, SynthTrack } from '../audio/AudioSynthesizer';

export const ControlsOverlay: React.FC = React.memo(() => {
  const {
    isListening,
    startListening,
    stopAudio,
    pauseAudio,
    playSynthesizer,
    activeSynthTrack,
    errorMessage,
  } = useDolly();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSelectDemoTrack = (track: SynthTrack) => {
    playSynthesizer(track);
    setShowDemoMenu(false);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xl mx-auto px-4 select-none">
      {/* Error notification banner if microphone is blocked */}
      {errorMessage && (
        <div className="w-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2.5 backdrop-blur-md">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="glass-panel p-2.5 sm:p-3 rounded-2xl flex items-center justify-between gap-3 w-full border border-white/10 shadow-2xl">
        {/* Left: Demo Synthesizer Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeSynthTrack
                ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                : 'bg-slate-800/80 border-white/5 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Music2 className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline">
              {activeSynthTrack ? activeSynthTrack.name : 'Play Demo Beat'}
            </span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Demo Tracks Dropdown */}
          {showDemoMenu && (
            <div className="absolute bottom-full mb-2 left-0 w-64 glass-panel border border-white/10 rounded-xl p-2 shadow-2xl z-50 flex flex-col gap-1">
              <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400">
                Synthesized Groove Tracks
              </div>
              {SYNTH_TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleSelectDemoTrack(track)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                    activeSynthTrack?.id === track.id
                      ? 'bg-pink-600 text-white'
                      : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <div>
                    <div>{track.name}</div>
                    <div className="text-[10px] text-slate-400">{track.genre}</div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
                    {track.bpm} BPM
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: Main Primary CTA Button */}
        {!isListening ? (
          <button
            onClick={startListening}
            className="flex-1 max-w-[220px] flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Mic className="w-5 h-5 text-white animate-pulse" />
            <span>Start Listening</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-1 justify-center">
            <button
              onClick={pauseAudio}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
            <button
              onClick={stopAudio}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-all"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>
          </div>
        )}

        {/* Right: Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl bg-slate-800/80 border border-white/5 hover:bg-slate-700 text-slate-300 transition-colors"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" aria-hidden="true" /> : <Maximize2 className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
});
