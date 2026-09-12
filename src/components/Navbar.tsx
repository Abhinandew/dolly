import React from 'react';
import { Sparkles, Sliders, Palette, Activity } from 'lucide-react';
import { useDolly } from '../context/DollyContext';

export interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({ currentPath, onNavigate }) => {
  const { isListening, activeSource, audioAnalysis } = useDolly();

  const navItems = [
    { path: '/', label: 'Home', icon: Sparkles },
    { path: '/customize', label: 'Customize', icon: Palette },
    { path: '/settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between glass-panel border-b border-white/5">
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>
      {/* Brand Logo */}
      <div
        onClick={() => onNavigate('/')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="3" />
            <path d="M12 9c-3.3 0-5 2.2-5 4.5v4.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5v-3h4v3c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5v-4.5C17 11.2 15.3 9 12 9z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Dolly
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live 2D
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Audio Status & Mobile Menu Icons */}
      <div className="flex items-center gap-3">
        {isListening ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline capitalize">{activeSource}:</span>
            <span>{audioAnalysis.estimatedBPM || 120} BPM</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-white/5 text-slate-400 text-xs">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>Audio Idle</span>
          </div>
        )}

        {/* Quick Settings Shortcut */}
        <button
          onClick={() => onNavigate('/settings')}
          className="p-2 rounded-xl bg-slate-800/70 border border-white/10 hover:bg-slate-700/80 text-slate-300 transition-colors"
          aria-label="Open Settings"
          title="Settings"
        >
          <Sliders className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/5 flex items-center justify-around px-2 pb-safe shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center gap-1 py-3 px-1 flex-1 transition-colors ${
                isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
});
