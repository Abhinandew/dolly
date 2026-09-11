import React, { useState } from 'react';
import { Sliders, Mic, Cpu, Database, Eye, Info } from 'lucide-react';
import { useDolly } from '../context/DollyContext';
import { getFirebaseStatus } from '../services/firebase/config';

export const Settings: React.FC = () => {
  // Read Firebase status on mount so the badge reflects the actual connection
  // state rather than the stale module-level variable value at import time.
  const [connectionStatus] = useState(() => getFirebaseStatus());
  const {
    audioSensitivity,
    setAudioSensitivity,
    showDebugRig,
    setShowDebugRig,
    mockFailRecognition,
    setMockFailRecognition,
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

        {/* 2. Song Recognition Emulation */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Song Recognition Service</h2>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Mock Emulation
            </span>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            <p className="text-slate-400 leading-relaxed">
              Pluggable service architecture. In development, <span className="text-indigo-300 font-mono">MockSongRecognitionService</span> simulates realistic acoustic fingerprinting delay and matching without exposing external API keys.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Simulate Recognition Failure</div>
                <div className="text-[11px] text-slate-500">
                  Tests Dolly's fallback behavior: continues generic beat-reactive dancing without freezing.
                </div>
              </div>
              <input
                type="checkbox"
                checked={mockFailRecognition}
                onChange={(e) => setMockFailRecognition(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Firebase Architecture Status */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-pink-400" />
              <h2 className="text-base font-bold text-white">Firebase Architecture</h2>
            </div>
            <span
              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                connectionStatus.isConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}
            >
              {connectionStatus.isConnected ? 'Connected' : 'Offline / Local Store Active'}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 text-xs text-slate-400">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span>Firestore Collections:</span>
              <span className="font-mono text-slate-300">songs, dances</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span>Storage Strategy:</span>
              <span className="text-slate-300">Large JSON choreography files stored in Firebase Storage</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Local Offline Fallback:</span>
              <span className="text-emerald-400 font-semibold">Enabled (App operates 100% without cloud)</span>
            </div>
          </div>
        </div>

        {/* 4. Internal Rig Diagnostics */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white">Internal Rig Diagnostics</h2>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Dev Only
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-200">Display Hidden 17-Joint Skeleton</div>
              <div className="text-[11px] text-slate-500">
                Shows forward kinematics wireframe. Strictly disabled in production.
              </div>
            </div>
            <input
              type="checkbox"
              checked={showDebugRig}
              onChange={(e) => setShowDebugRig(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

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
