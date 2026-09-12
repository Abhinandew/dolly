import React, { useState, useEffect } from 'react';
import { Flame, Play, Clock, Activity, Tag, Star, Search } from 'lucide-react';
import { trendingDanceService, TrendingDanceItem, DanceCategory } from '../services/TrendingDanceService';
import { useDolly } from '../context/DollyContext';

interface DanceLibraryProps {
  onNavigateHome: () => void;
}

export const DanceLibrary: React.FC<DanceLibraryProps> = ({ onNavigateHome }) => {
  const { playChoreographyDirectly, activeChoreography } = useDolly();
  const [category, setCategory] = useState<DanceCategory>('Trending');
  const [dances, setDances] = useState<TrendingDanceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    trendingDanceService.getDancesByCategory(category).then((items) => {
      if (isMounted) {
        setDances(items);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [category]);

  const filteredDances = dances.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.choreography.name.toLowerCase().includes(q) ||
      item.song.title.toLowerCase().includes(q) ||
      item.song.artist.toLowerCase().includes(q) ||
      item.choreography.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleDanceWithDolly = (item: TrendingDanceItem) => {
    playChoreographyDirectly(item.choreography, item.song);
    onNavigateHome();
  };

  const categories: DanceCategory[] = ['Trending', 'Popular', 'New', 'All'];

  return (
    <div className="w-full min-h-screen pt-20 pb-12 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Dance Library
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
              <Flame className="w-3 h-3" /> Trending
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Browse structured dance choreographies synchronized to musical beats.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dances, songs, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-white/5'
            }`}
          >
            {cat === 'Trending' && <Flame className="w-3.5 h-3.5 inline mr-1.5 text-rose-400" />}
            {cat}
          </button>
        ))}
      </div>

      {/* Dance Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-56 glass-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredDances.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <p className="text-slate-400 text-sm">No dances found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDances.map((item) => {
            const isCurrent = activeChoreography?.danceId === item.choreography.danceId;
            return (
              <div
                key={item.choreography.danceId}
                className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border transition-all duration-200 hover:border-indigo-500/40 hover:-translate-y-1 ${
                  isCurrent ? 'border-pink-500/50 shadow-lg shadow-pink-500/10' : 'border-white/5'
                }`}
              >
                <div>
                  {/* Top Bar: Difficulty & Trending Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                      {item.choreography.difficulty || 'medium'}
                    </span>
                    {item.choreography.trending && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                        <Flame className="w-3.5 h-3.5" /> Trending
                      </span>
                    )}
                  </div>

                  {/* Dance Title & Song Details */}
                  <h3 className="text-lg font-bold text-white mb-0.5">
                    {item.choreography.name}
                  </h3>
                  <div className="text-xs text-slate-400 mb-2">
                    {item.song.title} • <span className="text-slate-300">{item.song.artist}</span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {item.choreography.description || 'Structured choreography keyframed to match musical rhythm.'}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.choreography.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-white/5 flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Metadata & Action Button */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 py-3 border-t border-white/5 mb-3">
                    <span className="flex items-center gap-1.5 font-mono text-indigo-300">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      {item.choreography.bpm} BPM
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {item.choreography.duration}s
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {item.playCount}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDanceWithDolly(item)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isCurrent ? 'Now Dancing' : 'Dance with Dolly'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
