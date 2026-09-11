import { DollPose, MovementType } from './pose';

/**
 * Keyframe representation for structured choreographies
 */
export interface ChoreographyKeyframe {
  time: number; // in seconds from start
  pose: Partial<DollPose>;
  intensity: number; // 0.0 to 1.0
  movementLabel?: MovementType | string;
  ease?: 'linear' | 'easeInOut' | 'easeOut' | 'bounce';
}

/**
 * Complete Choreography JSON structure.
 * Stored in Firebase Storage / local repository as structured JSON.
 */
export interface Choreography {
  danceId: string;
  songId: string;
  name: string;
  artist?: string;
  bpm: number;
  duration: number; // in seconds
  difficulty?: 'easy' | 'medium' | 'hard';
  description?: string;
  tags?: string[];
  keyframes: ChoreographyKeyframe[];
  trending?: boolean;
}

export interface ChoreographyPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0 to 1
  currentBpm: number;
  activeKeyframeIndex: number;
  blendWeight: number; // 0 = fully procedural, 1 = fully choreography
}
