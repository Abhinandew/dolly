import React from 'react';
import { Mic, Info } from 'lucide-react';
import { useDolly } from '../context/DollyContext';

export const Settings: React.FC = () => {
  const {
    audioSensitivity,
    setAudioSensitivity,
    isListening,
    activeSource,
  } = useDolly();

  return (
    <div className="w-full min-h-screen pt-20 pb-12 px-4 sm:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
          Settings & Diagnostics
        </h1>
        <p className="text-sm text-slate-400">
          Configure real-time audio sensitivity, song recognition emulation, and Firebase storage options.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* 1. Real-time Audio Settings */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Audio Processing</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Microphone Sensitivity</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {audioSensitivity.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.05"
                value={audioSensitivity}
                onChange={(e) => setAudioSensitivity(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-[11px] text-slate-500">
                Increase if music is quiet or distant from your microphone.
              </span>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Audio Source:</span>
              <span className="font-semibold text-slate-200 uppercase px-2 py-0.5 rounded bg-slate-800">
                {isListening ? activeSource : 'Idle'}
              </span>
            </div>
          </div>
        </div>

        {/* Removed dev/mock sections */}

        {/* Privacy Note */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-3">
          <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Privacy & Performance:</strong> Audio is processed 100% in your browser using the Web Audio API. No microphone audio or voice data is ever recorded, stored, or transmitted to any external server.
          </p>
        </div>
      </div>
    </div>
  );
};
