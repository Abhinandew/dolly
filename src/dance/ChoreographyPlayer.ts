import { DollPose } from '../types/pose';
import { Choreography, ChoreographyKeyframe, ChoreographyPlayerState } from '../types/choreography';
import { createNeutralPose } from './MovementLibrary';
import { PoseBlender } from './PoseBlender';

/**
 * Choreography Player
 * 
 * Plays structured dance choreographies by interpolating between keyframes
 * and smoothly blending with procedural rhythm movement.
 */
export class ChoreographyPlayer {
  private choreography: Choreography | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0; // seconds
  private lastUpdateTime: number = performance.now();
  private blendWeight: number = 0; // 0.0 = fully procedural, 1.0 = fully choreography
  private targetBlendWeight: number = 0;
  private readonly blendSpeed: number = 2.2; // ~0.45s full crossfade

  constructor() {}

  public loadChoreography(choreo: Choreography): void {
    this.choreography = choreo;
    this.currentTime = 0;
  }

  public play(crossfade: boolean = true): void {
    if (!this.choreography) return;
    this.isPlaying = true;
    this.lastUpdateTime = performance.now();
    this.targetBlendWeight = 1.0;
    if (!crossfade) {
      this.blendWeight = 1.0;
    }
  }

  public pause(): void {
    this.isPlaying = false;
  }

  public stop(): void {
    this.isPlaying = false;
    this.currentTime = 0;
    this.targetBlendWeight = 0;
    this.blendWeight = 0;
  }

  public seek(timeInSeconds: number): void {
    if (!this.choreography) return;
    this.currentTime = Math.max(0, Math.min(this.choreography.duration, timeInSeconds));
  }

  /**
   * Transition back to procedural dancing gracefully
   */
  public transitionOut(): void {
    this.targetBlendWeight = 0.0;
  }

  /**
   * Update choreography playhead and compute interpolated pose.
   * 
   * @param proceduralPose Live pose from procedural DanceEngine
   * @param now Current timestamp in ms
   * @returns Blended DollPose
   */
  public update(proceduralPose: DollPose, now: number = performance.now()): { pose: DollPose; state: ChoreographyPlayerState } {
    const deltaSeconds = Math.max(0, Math.min(0.1, (now - this.lastUpdateTime) * 0.001));
    this.lastUpdateTime = now;

    // Smoothly update blend weight
    if (this.blendWeight < this.targetBlendWeight) {
      this.blendWeight = Math.min(this.targetBlendWeight, this.blendWeight + deltaSeconds * this.blendSpeed);
    } else if (this.blendWeight > this.targetBlendWeight) {
      this.blendWeight = Math.max(this.targetBlendWeight, this.blendWeight - deltaSeconds * this.blendSpeed);
    }

    if (!this.choreography || this.choreography.keyframes.length === 0) {
      return {
        pose: proceduralPose,
        state: this.getState(0),
      };
    }

    if (this.isPlaying) {
      this.currentTime += deltaSeconds;

      // Loop or stop when reaching end of choreography
      if (this.currentTime >= this.choreography.duration) {
        this.currentTime = this.currentTime % this.choreography.duration;
      }
    }

    // 1. Calculate interpolated choreography pose
    const choreoPose = this.samplePoseAtTime(this.currentTime);

    // 2. Crossfade blend between procedural movement and structured choreography
    const finalPose = PoseBlender.blend(proceduralPose, choreoPose, this.blendWeight);

    return {
      pose: finalPose,
      state: this.getState(this.getActiveKeyframeIndex()),
    };
  }

  /**
   * Interpolate between nearest surrounding keyframes
   */
  public samplePoseAtTime(time: number): DollPose {
    if (!this.choreography || this.choreography.keyframes.length === 0) {
      return createNeutralPose();
    }

    const keyframes = this.choreography.keyframes;

    // If time is before first keyframe
    if (time <= keyframes[0].time) {
      return PoseBlender.applyPartial(createNeutralPose(), keyframes[0].pose, keyframes[0].intensity, createNeutralPose());
    }

    // If time is after last keyframe
    const last = keyframes[keyframes.length - 1];
    if (time >= last.time) {
      return PoseBlender.applyPartial(createNeutralPose(), last.pose, last.intensity, createNeutralPose());
    }

    // Find bounding keyframes k1 and k2
    let k1: ChoreographyKeyframe = keyframes[0];
    let k2: ChoreographyKeyframe = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
        k1 = keyframes[i];
        k2 = keyframes[i + 1];
        break;
      }
    }

    const duration = k2.time - k1.time;
    const rawProgress = duration > 0 ? (time - k1.time) / duration : 0;

    // Apply easing
    const easedT = this.applyEasing(rawProgress, k1.ease || 'easeInOut');

    // Use explicit output buffers to avoid the shared static cache aliasing bug:
    // without separate buffers, both applyPartial calls write to the same
    // PoseBlender.cachedPartialResult, so pose1 === pose2 and no interpolation occurs.
    const buf1 = createNeutralPose();
    const buf2 = createNeutralPose();
    const pose1 = PoseBlender.applyPartial(createNeutralPose(), k1.pose, k1.intensity, buf1);
    const pose2 = PoseBlender.applyPartial(createNeutralPose(), k2.pose, k2.intensity, buf2);

    return PoseBlender.blend(pose1, pose2, easedT);
  }

  private applyEasing(t: number, ease: string): number {
    switch (ease) {
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'easeOut':
        return 1 - Math.pow(1 - t, 3);
      case 'bounce': {
        const n1 = 7.5625;
        const d1 = 2.75;
        let x = t;
        if (x < 1 / d1) {
          return n1 * x * x;
        } else if (x < 2 / d1) {
          return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
          return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
          return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
      }
      case 'linear':
      default:
        return t;
    }
  }

  private getActiveKeyframeIndex(): number {
    if (!this.choreography) return 0;
    const keyframes = this.choreography.keyframes;
    for (let i = keyframes.length - 1; i >= 0; i--) {
      if (this.currentTime >= keyframes[i].time) {
        return i;
      }
    }
    return 0;
  }

  public getState(activeIdx: number): ChoreographyPlayerState {
    const dur = this.choreography?.duration || 1;
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: dur,
      progress: Math.min(1.0, this.currentTime / dur),
      currentBpm: this.choreography?.bpm || 120,
      activeKeyframeIndex: activeIdx,
      blendWeight: this.blendWeight,
    };
  }

  public getChoreography(): Choreography | null {
    return this.choreography;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getBlendWeight(): number {
    return this.blendWeight;
  }
}
