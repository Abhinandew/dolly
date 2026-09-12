import React from 'react';
import { DollyCanvas } from '../components/DollyCanvas';
import { useDolly } from '../context/DollyContext';
import { Palette, Shirt, Sparkles, RefreshCw, Sliders } from 'lucide-react';
import { OutfitType, AccessoryType } from '../types/customization';

export const CustomizeDolly: React.FC = () => {
  const { appearance, updateAppearance, resetAppearance } = useDolly();

  const colorPresets = [
    { name: 'Pure White (Default)', hex: '#FFFFFF', glow: 'rgba(99, 102, 241, 0.4)' },
    { name: 'Cyber Cyan', hex: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)' },
    { name: 'Neon Pink', hex: '#ec4899', glow: 'rgba(236, 72, 153, 0.45)' },
    { name: 'Pastel Gold', hex: '#fde047', glow: 'rgba(253, 224, 71, 0.45)' },
    { name: 'Emerald Wave', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.45)' },
    { name: 'Obsidian Shadow', hex: '#1e293b', glow: 'rgba(148, 163, 184, 0.4)' },
  ];

  const outfits: Array<{ type: OutfitType; label: string; desc: string }> = [
    { type: 'none',        label: 'Classic',             desc: 'Minimal continuous bulky silhouette' },
    { type: 'hoodie',      label: 'Cozy Hoodie',         desc: 'Relaxed street hoodie with kangaroo pouch' },
    { type: 'suspenders',  label: 'Suspenders',          desc: 'Classic dance suspenders' },
    { type: 'bowtie',      label: 'Gentleman Bowtie',    desc: 'Formal crimson bowtie' },
    { type: 'athletic',    label: 'Athletic Bands',      desc: 'Sporty wrist sweatbands' },
    { type: 'cape',        label: '🦸 Hero Cape',        desc: 'Dramatic flowing cape behind' },
    { type: 'tracksuit',   label: '🏃 Tracksuit',        desc: 'Side-stripe athletic tracksuit' },
  ];

  const accessories: Array<{ type: AccessoryType; label: string }> = [
    { type: 'none',         label: 'None' },
    { type: 'headphones',   label: '🎧 DJ Headphones' },
    { type: 'cool_shades',  label: '😎 Cool Shades' },
    { type: 'party_visor',  label: '🕶️ Cyber Visor' },
    { type: 'top_hat',      label: '🎩 Top Hat' },
    { type: 'halo',         label: '😇 Angel Halo' },
    { type: 'crown',        label: '👑 Royal Crown' },
    { type: 'cat_ears',     label: '🐱 Cat Ears' },
    { type: 'devil_horns',  label: '😈 Devil Horns' },
    { type: 'flower_crown', label: '🌸 Flower Crown' },
    { type: 'ninja_band',   label: '🥷 Ninja Band' },
    { type: 'star_glasses', label: '⭐ Star Glasses' },
  ];

  return (
    <div className="w-full min-h-screen pt-20 pb-12 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
            Customize Dolly
          </h1>
          <p className="text-sm text-slate-400">
            Personalize Dolly's body color, outfits, accessories, and cute chubby proportions.
          </p>
        </div>
        <button
          onClick={resetAppearance}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-semibold self-start transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset to Default</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Real-time Live Preview */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl flex flex-col items-center justify-center border border-white/10 lg:sticky lg:top-24 mb-6 lg:mb-0">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Live Character Preview
          </div>
          <div className="w-full h-[280px] sm:h-[400px] flex items-center justify-center">
            <DollyCanvas className="w-full h-full" />
          </div>
          <div className="text-[11px] text-slate-500 text-center mt-2">
            Maintains Dolly's seamless, zero-joint continuous body in real time.
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 1. Body Color */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Body Color</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {colorPresets.map((preset) => {
                const isSelected = appearance.bodyColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    onClick={() => updateAppearance({ bodyColor: preset.hex, glowColor: preset.glow })}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-white/5 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-white/20 shrink-0 shadow-sm"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Color Picker */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/5">
              <label htmlFor="custom-color-picker" className="text-xs text-slate-400">Custom Color:</label>
              <input
                id="custom-color-picker"
                type="color"
                value={appearance.bodyColor}
                onChange={(e) => updateAppearance({ bodyColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
              />
              <span className="text-xs font-mono text-slate-300 uppercase">{appearance.bodyColor}</span>
            </div>
          </div>

          {/* 2. Accessories */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <h2 className="text-base font-bold text-white">Accessories</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {accessories.map((acc) => {
                const isSelected = appearance.accessory === acc.type;
                return (
                  <button
                    key={acc.type}
                    onClick={() => updateAppearance({ accessory: acc.type })}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      isSelected
                        ? 'bg-pink-600/20 border-pink-500 text-white shadow-md shadow-pink-600/10'
                        : 'bg-slate-900/60 border-white/5 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {acc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Outfits */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Shirt className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Outfits</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {outfits.map((outfit) => {
                const isSelected = appearance.outfit === outfit.type;
                return (
                  <button
                    key={outfit.type}
                    onClick={() => updateAppearance({ outfit: outfit.type })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-white/5 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">{outfit.label}</div>
                    <div className="text-[11px] text-slate-400">{outfit.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Cute Proportions */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Chubby Proportions</h2>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Chubbiness Factor</span>
                  <span className="font-mono text-slate-200">
                    {Math.round(appearance.proportions.chubbiness * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={appearance.proportions.chubbiness}
                  onChange={(e) =>
                    updateAppearance({
                      proportions: {
                        ...appearance.proportions,
                        chubbiness: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Head Scale</span>
                  <span className="font-mono text-slate-200">
                    {Math.round(appearance.proportions.headScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.25"
                  step="0.05"
                  value={appearance.proportions.headScale}
                  onChange={(e) =>
                    updateAppearance({
                      proportions: {
                        ...appearance.proportions,
                        headScale: parseFloat(e.target.value),
                      },
                    })
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
