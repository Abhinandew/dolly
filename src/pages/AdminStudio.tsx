import React, { useState, useRef, useEffect } from 'react';
import { DollyCanvas } from '../components/DollyCanvas';
import { useDolly } from '../context/DollyContext';
import { Choreography, ChoreographyKeyframe } from '../types/choreography';
import { MovementType, DollPose } from '../types/pose';
import { MovementLibrary } from '../dance/MovementLibrary';
import { trendingDanceService } from '../services/TrendingDanceService';
import { PRESET_CHOREOGRAPHIES } from '../services/presetDances';
import {
  ShieldCheck,
  Play,
  Pause,
  Plus,
  Trash2,
  Download,
  Upload,
  Save,
  Sliders,
  Sparkles,
  Flame,
  Check,
} from 'lucide-react';

export const AdminStudio: React.FC = () => {
  const { choreoPlayerRef } = useDolly();

  // Active choreography being edited
  const [choreo, setChoreo] = useState<Choreography>(() => {
    return JSON.parse(JSON.stringify(PRESET_CHOREOGRAPHIES[0]));
  });

  const [activeKeyframeIndex, setActiveKeyframeIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync with ChoreographyPlayer
  useEffect(() => {
    choreoPlayerRef.current.loadChoreography(choreo);
  }, [choreo, choreoPlayerRef]);

  // Scrubbing / Playback loop in editor
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastTime) * 0.001;
        setCurrentTime((prev) => {
          const next = (prev + delta) % choreo.duration;
          choreoPlayerRef.current.seek(next);
          return next;
        });
      }
      lastTime = now;
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, choreo.duration, choreoPlayerRef]);

  const activeKeyframe = choreo.keyframes[activeKeyframeIndex] || choreo.keyframes[0];

  // Helper to update current keyframe pose
  const updateKeyframePose = (updater: (prev: Partial<DollPose>) => Partial<DollPose>) => {
    setChoreo((prev) => {
      const nextKeyframes = [...prev.keyframes];
      const current = nextKeyframes[activeKeyframeIndex] || nextKeyframes[0];
      const updatedPose = updater(current.pose || {});

      nextKeyframes[activeKeyframeIndex] = {
        ...current,
        pose: updatedPose,
      };

      return {
        ...prev,
        keyframes: nextKeyframes,
      };
    });
  };

  // Add keyframe at current scrub time
  const handleAddKeyframe = () => {
    const newKeyframe: ChoreographyKeyframe = {
      time: parseFloat(currentTime.toFixed(2)),
      intensity: 0.9,
      movementLabel: 'custom move',
      pose: JSON.parse(JSON.stringify(activeKeyframe.pose || {})),
    };

    const sortedKeyframes = [...choreo.keyframes, newKeyframe].sort((a, b) => a.time - b.time);
    const newIdx = sortedKeyframes.findIndex((k) => k.time === newKeyframe.time);

    setChoreo((prev) => ({ ...prev, keyframes: sortedKeyframes }));
    setActiveKeyframeIndex(newIdx >= 0 ? newIdx : 0);
  };

  // Delete current keyframe
  const handleDeleteKeyframe = () => {
    if (choreo.keyframes.length <= 1) return; // Keep at least one keyframe
    const nextKeyframes = choreo.keyframes.filter((_, idx) => idx !== activeKeyframeIndex);
    setChoreo((prev) => ({ ...prev, keyframes: nextKeyframes }));
    setActiveKeyframeIndex(Math.max(0, activeKeyframeIndex - 1));
  };

  // Quick apply movement preset to keyframe
  const handleApplyPresetMovement = (type: MovementType) => {
    const generated = MovementLibrary.getMovementPose(type, 0.25, 1.0);
    updateKeyframePose(() => generated);
    setChoreo((prev) => {
      const nextKeyframes = [...prev.keyframes];
      nextKeyframes[activeKeyframeIndex] = {
        ...nextKeyframes[activeKeyframeIndex],
        movementLabel: type,
      };
      return { ...prev, keyframes: nextKeyframes };
    });
  };

  // Export Choreography JSON file
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(choreo, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${choreo.danceId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Choreography JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.keyframes && Array.isArray(parsed.keyframes)) {
          setChoreo(parsed);
          setActiveKeyframeIndex(0);
          setCurrentTime(0);
        }
      } catch (err) {
        alert('Invalid Choreography JSON format');
      }
    };
    reader.readAsText(file);
  };

  // Save to Trending Dance Library
  const handleSaveToLibrary = async () => {
    await trendingDanceService.saveChoreography(choreo);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const movementOptions: MovementType[] = [
    'idle',
    'head bob',
    'body bounce',
    'shoulder bounce',
    'left arm wave',
    'right arm wave',
    'both arms up',
    'left step',
    'right step',
    'forward step',
    'backward step',
    'hip sway',
    'squat',
    'jump',
    'spin',
    'side groove',
    'hands on hips',
    'final pose',
  ];

  return (
    <div className="w-full min-h-screen pt-20 pb-12 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
              Dolly Dance Studio
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Admin & Choreographer
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Create, edit keyframes, preview structured choreography, and publish dances with zero visible joints.
          </p>
        </div>

        {/* Studio Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleSaveToLibrary}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              saveSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? 'Saved!' : 'Save to Library'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Dolly Stage Preview (ZERO visible joints) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="glass-panel p-5 rounded-3xl border border-white/10 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Live Choreography Preview
              </span>
              <span className="font-mono text-indigo-300">
                {currentTime.toFixed(2)}s / {choreo.duration.toFixed(1)}s
              </span>
            </div>

            <div className="w-full h-[360px] flex items-center justify-center">
              <DollyCanvas className="w-full h-full" />
            </div>

            {/* Playback Scrubber Controls */}
            <div className="w-full flex items-center gap-3 pt-3 border-t border-white/5">
              <button
                onClick={() => {
                  if (isPlaying) {
                    choreoPlayerRef.current.pause();
                    setIsPlaying(false);
                  } else {
                    choreoPlayerRef.current.play(false);
                    setIsPlaying(true);
                  }
                }}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={choreo.duration}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCurrentTime(val);
                    choreoPlayerRef.current.seek(val);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Interactive Timeline & Keyframe Nodes */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Keyframe Timeline ({choreo.keyframes.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddKeyframe}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-500/30"
                >
                  <Plus className="w-3 h-3" /> Add at {currentTime.toFixed(2)}s
                </button>
                <button
                  onClick={handleDeleteKeyframe}
                  disabled={choreo.keyframes.length <= 1}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 disabled:opacity-40"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>

            {/* Visual Timeline Bar */}
            <div className="relative w-full h-12 bg-slate-950/80 rounded-xl border border-white/5 p-2 flex items-center overflow-x-auto">
              {choreo.keyframes.map((kf, idx) => {
                const leftPercent = (kf.time / choreo.duration) * 100;
                const isSelected = idx === activeKeyframeIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveKeyframeIndex(idx);
                      setCurrentTime(kf.time);
                      choreoPlayerRef.current.seek(kf.time);
                    }}
                    style={{ left: `${Math.min(96, Math.max(2, leftPercent))}%` }}
                    className={`absolute -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all shadow-md ${
                      isSelected
                        ? 'bg-pink-600 text-white scale-110 ring-2 ring-pink-400 z-20'
                        : 'bg-indigo-900/80 text-indigo-200 hover:bg-indigo-700 z-10'
                    }`}
                  >
                    {kf.time.toFixed(1)}s
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Keyframe Pose Sliders & Dance Metadata */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Metadata Card */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Choreography Metadata
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Dance Name</label>
                <input
                  type="text"
                  value={choreo.name}
                  onChange={(e) => setChoreo({ ...choreo, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Artist / Track</label>
                <input
                  type="text"
                  value={choreo.artist || ''}
                  onChange={(e) => setChoreo({ ...choreo, artist: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tempo (BPM)</label>
                <input
                  type="number"
                  value={choreo.bpm}
                  onChange={(e) => setChoreo({ ...choreo, bpm: parseInt(e.target.value) || 120 })}
                  className="w-full px-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Duration (seconds)</label>
                <input
                  type="number"
                  step="0.5"
                  value={choreo.duration}
                  onChange={(e) => setChoreo({ ...choreo, duration: parseFloat(e.target.value) || 15 })}
                  className="w-full px-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={!!choreo.trending}
                  onChange={(e) => setChoreo({ ...choreo, trending: e.target.checked })}
                  className="rounded accent-pink-500"
                />
                <span className="flex items-center gap-1 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-pink-400" /> Mark as Trending
                </span>
              </label>
            </div>
          </div>

          {/* Keyframe Pose Editor */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  Pose Editor (Keyframe @ {activeKeyframe.time.toFixed(2)}s)
                </h2>
              </div>
            </div>

            {/* Preset Movement Stamp */}
            <div className="mb-4">
              <label className="text-[11px] text-slate-400 block mb-1.5">
                Quick Apply Movement Preset:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {movementOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleApplyPresetMovement(opt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-white/5 text-[10px] capitalize transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders for Arms, Legs, and Body */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Left Shoulder Angle */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Left Shoulder</span>
                  <span className="font-mono text-indigo-300">
                    {((activeKeyframe.pose?.leftArm?.shoulderAngle ?? 0.5) * 57.3).toFixed(0)}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-1.5"
                  max="3.0"
                  step="0.05"
                  value={activeKeyframe.pose?.leftArm?.shoulderAngle ?? 0.5}
                  onChange={(e) =>
                    updateKeyframePose((p) => ({
                      ...p,
                      leftArm: {
                        ...(p.leftArm || { elbowAngle: 0.5, wristAngle: 0 }),
                        shoulderAngle: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full"
                />
              </div>

              {/* Right Shoulder Angle */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Right Shoulder</span>
                  <span className="font-mono text-indigo-300">
                    {((activeKeyframe.pose?.rightArm?.shoulderAngle ?? 0.5) * 57.3).toFixed(0)}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-1.5"
                  max="3.0"
                  step="0.05"
                  value={activeKeyframe.pose?.rightArm?.shoulderAngle ?? 0.5}
                  onChange={(e) =>
                    updateKeyframePose((p) => ({
                      ...p,
                      rightArm: {
                        ...(p.rightArm || { elbowAngle: 0.5, wristAngle: 0 }),
                        shoulderAngle: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full"
                />
              </div>

              {/* Vertical Root Bounce (Y) */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Bounce / Height</span>
                  <span className="font-mono text-pink-300">
                    {(activeKeyframe.pose?.root?.y ?? 0).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-0.8"
                  max="0.8"
                  step="0.05"
                  value={activeKeyframe.pose?.root?.y ?? 0}
                  onChange={(e) =>
                    updateKeyframePose((p) => ({
                      ...p,
                      root: {
                        ...(p.root || { x: 0, scaleX: 1, scaleY: 1, rotation: 0 }),
                        y: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full"
                />
              </div>

              {/* Hip Sway (Pelvis X) */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Hip Sway</span>
                  <span className="font-mono text-pink-300">
                    {(activeKeyframe.pose?.pelvis?.x ?? 0).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-0.7"
                  max="0.7"
                  step="0.05"
                  value={activeKeyframe.pose?.pelvis?.x ?? 0}
                  onChange={(e) =>
                    updateKeyframePose((p) => ({
                      ...p,
                      pelvis: {
                        ...(p.pelvis || { y: 0, angle: 0 }),
                        x: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
