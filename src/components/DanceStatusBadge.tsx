import React from 'react';
import { Sparkles, Mic, Search, CheckCircle2, Flame } from 'lucide-react';
import { DollyLiveState } from '../context/DollyContext';

interface DanceStatusBadgeProps {
  state: DollyLiveState;
  customText?: string;
  className?: string;
}

export const DanceStatusBadge: React.FC<DanceStatusBadgeProps> = React.memo(({
  state,
  customText,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (state) {
      case 'dancing':
        return {
          icon: Flame,
          label: customText || '🔥 Dancing',
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-rose-500/20',
          iconColor: 'text-rose-400 animate-bounce',
        };
      case 'dance_found':
        return {
          icon: Flame,
          label: customText || '🔥 Dance found',
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-amber-500/20',
          iconColor: 'text-amber-400 animate-pulse',
        };
      case 'song_detected':
        return {
          icon: CheckCircle2,
          label: customText || 'Song detected',
          bg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-cyan-500/20',
          iconColor: 'text-cyan-400',
        };
      case 'finding_song':
        return {
          icon: Search,
          label: customText || 'Finding your song...',
          bg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-indigo-500/20',
          iconColor: 'text-indigo-400 animate-spin',
        };
      case 'listening':
        return {
          icon: Mic,
          label: customText || 'Listening...',
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-emerald-500/20',
          iconColor: 'text-emerald-400 animate-pulse',
        };
      case 'waiting':
      default:
        return {
          icon: Sparkles,
          label: customText || 'Dolly is waiting...',
          bg: 'bg-slate-800/60 border-slate-700/60 text-slate-300 shadow-black/20',
          iconColor: 'text-slate-400',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 ${config.bg} ${className}`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${config.iconColor}`} />
      <span className="text-sm font-semibold tracking-wide">
        {config.label}
      </span>
    </div>
  );
});
