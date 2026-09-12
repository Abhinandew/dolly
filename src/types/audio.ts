/**
 * Audio analysis types for real-time Web Audio API processing
 */

export interface AudioAnalysis {
  volume: number;        // Overall volume 0.0 - 1.0
  energy: number;        // RMS energy 0.0 - 1.0
  bassEnergy: number;    // Sub-bass & bass (20Hz - 140Hz) 0.0 - 1.0
  midEnergy: number;     // Mid frequencies (140Hz - 2500Hz) 0.0 - 1.0
  trebleEnergy: number;  // Treble frequencies (2500Hz - 16000Hz) 0.0 - 1.0
  beatDetected: boolean; // Instantaneous beat onset flag
  beatIntensity: number; // 0.0 - 1.0 intensity of detected beat
  estimatedBPM: number;  // Real-time estimated tempo (e.g. 120)
  bpmConfidence: number; // 0.0 - 1.0 confidence of the estimated tempo
  beatPhase: number;     // 0.0 - 1.0 phase within the current beat
  timestamp: number;     // High-resolution timestamp in ms
}

export interface BeatEvent {
  timestamp: number;
  energy: number;
  confidence: number;
  bpm: number;
}

export type AudioSourceType = 'microphone' | 'synthesizer' | 'audio_file';

export interface AudioConfig {
  sourceType: AudioSourceType;
  sensitivity: number; // 0.5 to 2.0 multiplier
  minBpm: number;
  maxBpm: number;
  smoothingTimeConstant: number;
  fftSize: number;
}
