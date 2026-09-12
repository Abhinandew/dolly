import { SongRecognitionService, RecognizedSong } from '../types/song';
import { PRESET_SONGS } from './presetDances';

/**
 * Mock Song Recognition Service
 * 
 * DEVELOPMENT ONLY: Clearly marked in code and UI as simulated acoustic recognition.
 * Emulates the latency and fingerprint match results of services like ACRCloud/Shazam.
 * 
 * In production, replace or wrap with ACRCloudSongRecognitionService
 * utilizing backend audio fingerprinting.
 */
export class MockSongRecognitionService implements SongRecognitionService {
  public name: string = 'Mock Song Recognition (Local Acoustic Emulation)';
  private isIdentifying: boolean = false;
  private shouldFail: boolean = false; // Configurable via Settings for testing
  private simulatedLatencyMs: number = 2800; // 2.8s realistic recognition delay
  private forcedSongId: string | null = null;

  constructor() {}

  public isRealService(): boolean {
    return false; // Explicitly declared: MOCKED
  }

  public setShouldFail(fail: boolean): void {
    this.shouldFail = fail;
  }

  public setForcedSongId(songId: string | null): void {
    this.forcedSongId = songId;
  }

  public setLatency(ms: number): void {
    this.simulatedLatencyMs = Math.max(500, ms);
  }

  /**
   * Identify song from audio stream
   */
  public async identify(_audioData?: Float32Array): Promise<RecognizedSong | null> {
    if (this.isIdentifying) return null;
    this.isIdentifying = true;

    try {
      // Simulate realistic network round-trip & acoustic fingerprint match time
      await new Promise((resolve) => setTimeout(resolve, this.simulatedLatencyMs));

      if (this.shouldFail) {
        return null; // Graceful failure: Dolly will continue generic reactive dancing
      }

      // Only return a result if a specific song was forced (e.g. from Dance Library).
      // For real microphone input there is no forced ID, so return null and let
      // Dolly keep doing random procedural steps instead of faking a match.
      if (!this.forcedSongId) {
        return null;
      }

      const found = PRESET_SONGS.find((s) => s.songId === this.forcedSongId);
      if (!found) return null;

      return {
        songId: found.songId,
        title: found.title,
        artist: found.artist,
        bpm: found.bpm,
        danceId: found.danceId,
        confidence: 0.94,
        matchOffsetSeconds: 0,
        isMock: true,
      };
    } finally {
      this.isIdentifying = false;
    }
  }

  public reset(): void {
    this.isIdentifying = false;
  }
}
