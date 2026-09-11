import { Choreography } from '../types/choreography';
import { Song } from '../types/song';
import { PRESET_CHOREOGRAPHIES, PRESET_SONGS } from './presetDances';

export type DanceCategory = 'Trending' | 'Popular' | 'New' | 'All';

export interface TrendingDanceItem {
  choreography: Choreography;
  song: Song;
  category: DanceCategory[];
  playCount: number;
}

/**
 * Trending Dance Service Abstraction
 * 
 * Manages the choreography catalog across categories (Trending, Popular, New, All).
 * Supports local client-side persistence with fallback, ready to hook into a secure
 * cloud backend or Firebase Firestore.
 */
export class TrendingDanceService {
  private localDances: Map<string, Choreography> = new Map();
  private localSongs: Map<string, Song> = new Map();

  constructor() {
    this.init();
  }

  private init(): void {
    // 1. Load presets
    PRESET_CHOREOGRAPHIES.forEach((c) => this.localDances.set(c.danceId, c));
    PRESET_SONGS.forEach((s) => this.localSongs.set(s.songId, s));

    // 2. Load any user-created or edited dances from localStorage
    // Guard required: localStorage is browser-only and throws in Node.js (e.g. test runner)
    if (typeof localStorage === 'undefined') return;
    try {
      const savedDances = localStorage.getItem('dolly_user_dances');
      if (savedDances) {
        const parsed: Choreography[] = JSON.parse(savedDances);
        parsed.forEach((c) => this.localDances.set(c.danceId, c));
      }
      const savedSongs = localStorage.getItem('dolly_user_songs');
      if (savedSongs) {
        const parsed: Song[] = JSON.parse(savedSongs);
        parsed.forEach((s) => this.localSongs.set(s.songId, s));
      }
    } catch {
      // Ignore local storage parse errors
    }
  }

  /**
   * Get all dances filtered by category
   */
  public async getDancesByCategory(category: DanceCategory): Promise<TrendingDanceItem[]> {
    const items: TrendingDanceItem[] = [];

    this.localDances.forEach((choreo) => {
      const song = this.localSongs.get(choreo.songId) || {
        songId: choreo.songId,
        title: choreo.name,
        artist: choreo.artist || 'Unknown Artist',
        bpm: choreo.bpm,
        danceId: choreo.danceId,
        trending: !!choreo.trending,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const categories: DanceCategory[] = ['All'];
      if (choreo.trending) categories.push('Trending');
      if (choreo.bpm >= 120) categories.push('Popular');
      if (new Date(song.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000) {
        categories.push('New');
      }

      if (category === 'All' || categories.includes(category)) {
        items.push({
          choreography: choreo,
          song,
          category: categories,
          playCount: choreo.trending ? 4280 : 1250,
        });
      }
    });

    return items;
  }

  public async getChoreographyById(danceId: string): Promise<Choreography | null> {
    return this.localDances.get(danceId) || null;
  }

  public async getSongById(songId: string): Promise<Song | null> {
    return this.localSongs.get(songId) || null;
  }

  /**
   * Save or update choreography (used by Admin Dance Studio)
   */
  public async saveChoreography(choreo: Choreography, songMeta?: Partial<Song>): Promise<void> {
    this.localDances.set(choreo.danceId, choreo);

    const songId = choreo.songId;
    const existingSong = this.localSongs.get(songId);
    const updatedSong: Song = {
      songId,
      title: songMeta?.title || existingSong?.title || choreo.name,
      artist: songMeta?.artist || existingSong?.artist || choreo.artist || 'Unknown Artist',
      bpm: choreo.bpm,
      danceId: choreo.danceId,
      trending: choreo.trending ?? false,
      createdAt: existingSong?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.localSongs.set(songId, updatedSong);

    // Persist user-modified items to localStorage
    try {
      const dancesArray = Array.from(this.localDances.values());
      const songsArray = Array.from(this.localSongs.values());
      localStorage.setItem('dolly_user_dances', JSON.stringify(dancesArray));
      localStorage.setItem('dolly_user_songs', JSON.stringify(songsArray));
    } catch {
      // Ignore storage quota errors
    }
  }

  /**
   * Toggle trending flag on a dance
   */
  public async toggleTrending(danceId: string): Promise<boolean> {
    const choreo = this.localDances.get(danceId);
    if (!choreo) return false;
    choreo.trending = !choreo.trending;
    await this.saveChoreography(choreo);
    return choreo.trending;
  }
}

export const trendingDanceService = new TrendingDanceService();
