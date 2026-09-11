/**
 * Song and Song Recognition Interfaces
 */

export interface Song {
  songId: string;
  title: string;
  artist: string;
  bpm: number;
  danceId?: string;
  trending?: boolean;
  artworkUrl?: string;
  audioPreviewUrl?: string;
  genre?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecognizedSong {
  songId: string;
  title: string;
  artist: string;
  bpm: number;
  danceId?: string;
  confidence: number;
  matchOffsetSeconds?: number;
  isMock: boolean;
}

/**
 * Pluggable Song Recognition Service interface.
 * Can be implemented by MockSongRecognitionService (in development)
 * or real services (ACRCloud, Shazam, AudD) in production.
 */
export interface SongRecognitionService {
  name: string;
  isRealService(): boolean;
  identify(audioData?: Float32Array): Promise<RecognizedSong | null>;
  reset(): void;
}
