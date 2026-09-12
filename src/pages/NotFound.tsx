import React from 'react';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  onNavigateHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigateHome }) => (
  <div className="w-full min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center">
    {/* Animated 404 number */}
    <div className="relative select-none">
      <span className="text-[9rem] sm:text-[12rem] font-extrabold leading-none tracking-tighter bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent opacity-20">
        404
      </span>
      {/* Dolly icon floating in the middle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-bounce">
          <svg className="w-11 h-11 text-white" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="3" />
            <path d="M12 9c-3.3 0-5 2.2-5 4.5v4.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5v-3h4v3c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5v-4.5C17 11.2 15.3 9 12 9z" />
          </svg>
        </div>
      </div>
    </div>

    {/* Message */}
    <div className="flex flex-col gap-2 max-w-sm">
      <h1 className="text-2xl font-extrabold text-white tracking-tight">
        Page not found
      </h1>
      <p className="text-sm text-slate-400 leading-relaxed">
        Dolly looked everywhere but couldn't find this page.
        Maybe it was deleted, or the URL is wrong.
      </p>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-3">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Go back
      </button>
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <Home className="w-4 h-4" />
        Back to Dolly
      </button>
    </div>

    {/* Subtle sparkle decoration */}
    <div className="flex items-center gap-1.5 text-slate-600 text-xs">
      <Sparkles className="w-3 h-3 text-indigo-500/50" />
      <span>dolly.live</span>
      <Sparkles className="w-3 h-3 text-pink-500/50" />
    </div>
  </div>
);
