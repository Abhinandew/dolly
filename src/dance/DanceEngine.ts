import { DollPose, MovementType } from '../types/pose';
import { AudioAnalysis } from '../types/audio';
import { MovementLibrary, createNeutralPose } from './MovementLibrary';
import { PoseBlender } from './PoseBlender';

/**
 * Phrase-aware Procedural Dance Engine
 *
 * Architecture:
 *  - Tracks a global beat counter (incremented on every detected beat).
 *  - Divides time into 4-beat bars and 8-beat phrases.
 *  - Three BPM zones each have their own movement pool that feels musically right.
 *  - Five layered channels run simultaneously:
 *      Layer 1: Primary groove   (full beat phase)
 *      Layer 2: Counter groove   (double-time or half-time depending on BPM zone)
 *      Layer 3: Accent pulse     (sharp hit on beat 1 of every bar)
 *      Layer 4: Head bob         (continuous, driven by bass)
 *      Layer 5: Drop hype        (triggered on loud bass transients, every 4 bars)
 *  - Switch schedule:
 *      High energy  → switch primary every 2–3 beats
 *      Mid energy   → switch every 4–5 beats
 *      Low energy   → switch every 6–8 beats
 *  - Phase micro-jitter: ±3% random noise injected per frame so no two beats
 *    are mechanically identical.
 */
export class DanceEngine {
  private currentPose: DollPose = createNeutralPose();
  private targetPose: DollPose  = createNeutralPose();

  // ── Phrase / beat state ────────────────────────────────────────────────────
  private globalBeatCount: number = 0;       // total beats since start
  private beatsSinceSwitch: number = 0;      // beats since last groove change
  private switchAfterBeats: number = 4;      // beats to hold current groove
  private phrasePosition: number = 0;        // 0-7 position within 8-beat phrase

  // ── Movement slots ─────────────────────────────────────────────────────────
  private primaryMovement:   MovementType = 'body bounce';
  private counterMovement:   MovementType = 'hip sway';
  private accentMovement:    MovementType = 'body bounce';
  private dropMovement:      MovementType | null = null;
  private dropBeatsRemaining: number = 0;

  // ── BPM-zone movement pools ────────────────────────────────────────────────
  // Each zone has primary candidates + counter candidates that feel right at that tempo.

  /** Slow zone (< 90 BPM): fluid, laid-back, soulful */
  private slowPrimaries: MovementType[] = [
    'hip sway', 'shoulder bounce', 'hands on hips',
    'left arm wave', 'right arm wave', 'side groove',
    'forward step', 'backward step', 'lock groove',
    'chest pop', 'bounce step',
  ];
  private slowCounters: MovementType[] = [
    'head bob', 'shoulder bounce', 'hip sway', 'chest pop',
  ];

  /** Mid zone (90–130 BPM): pop/funk/disco — varied and punchy */
  private midPrimaries: MovementType[] = [
    'body bounce', 'side groove', 'hip sway',
    'left step', 'right step', 'left arm wave', 'right arm wave',
    'both arms up', 'squat', 'shoulder bounce', 'hands on hips',
    'forward step', 'spin', 'running man', 'chest pop',
    'bounce step', 'lock groove', 'robot chop',
  ];
  private midCounters: MovementType[] = [
    'head bob', 'shoulder bounce', 'hip sway', 'body bounce',
    'left arm wave', 'right arm wave', 'chest pop',
  ];

  /** Fast zone (> 130 BPM): EDM/K-pop — explosive, high-energy */
  private fastPrimaries: MovementType[] = [
    'body bounce', 'both arms up', 'spin', 'squat',
    'left step', 'right step', 'side groove',
    'left arm wave', 'right arm wave', 'jump',
    'forward step', 'running man', 'windmill arms',
    'robot chop', 'chest pop', 'bounce step',
  ];
  private fastCounters: MovementType[] = [
    'head bob', 'body bounce', 'shoulder bounce', 'both arms up',
    'windmill arms', 'chest pop',
  ];

  /** Big accent/drop moves (used on beat 1 of a phrase boundary) */
  private accentMoves: MovementType[] = [
    'jump', 'both arms up', 'squat', 'spin', 'final pose',
    'windmill arms', 'chest pop', 'robot chop',
  ];

  // ── Micro-jitter state ─────────────────────────────────────────────────────
  private jitter: number = 0;
  private jitterTarget: number = 0;
  private lastBpm: number = 120;

  constructor() {
    this._randomizePrimary('mid');
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _bpmZone(bpm: number): 'slow' | 'mid' | 'fast' {
    if (bpm < 92) return 'slow';
    if (bpm > 128) return 'fast';
    return 'mid';
  }

  private _primaryPool(zone: 'slow' | 'mid' | 'fast'): MovementType[] {
    if (zone === 'slow') return this.slowPrimaries;
    if (zone === 'fast') return this.fastPrimaries;
    return this.midPrimaries;
  }

  private _counterPool(zone: 'slow' | 'mid' | 'fast'): MovementType[] {
    if (zone === 'slow') return this.slowCounters;
    if (zone === 'fast') return this.fastCounters;
    return this.midCounters;
  }

  /** Pick randomly from pool, never repeating same move twice in a row */
  private _pickFrom<T>(pool: T[], avoid: T): T {
    if (pool.length <= 1) return pool[0];
    let pick: T;
    let attempts = 0;
    do {
      pick = pool[Math.floor(Math.random() * pool.length)];
      attempts++;
    } while (pick === avoid && attempts < 8);
    return pick;
  }

  private _randomizePrimary(zone: 'slow' | 'mid' | 'fast'): void {
    this.primaryMovement = this._pickFrom(this._primaryPool(zone), this.primaryMovement);
    this.counterMovement = this._pickFrom(this._counterPool(zone), this.counterMovement);
  }

  // ── Main update ────────────────────────────────────────────────────────────

  public update(audio: AudioAnalysis, isListening: boolean, deltaTimeMs: number = 16): DollPose {
    const neutral = createNeutralPose();

    // ── Idle state ─────────────────────────────────────────────────────────
    if (!isListening || audio.energy < 0.04) {
      const slowPhase = (performance.now() * 0.0006) % 1.0;
      const idlePose  = MovementLibrary.idle(slowPhase, 0.45);
      this.targetPose = PoseBlender.applyPartial(neutral, idlePose, 1.0, createNeutralPose());
      this.currentPose = PoseBlender.blend(this.currentPose, this.targetPose, 0.12);
      return this.currentPose;
    }

    // ── Audio scalars ──────────────────────────────────────────────────────
    const energy = Math.min(1.0, audio.energy * 1.4);
    const bass   = Math.min(1.0, audio.bassEnergy * 1.5);
    const treble = Math.min(1.0, audio.trebleEnergy * 1.6);
    const bpm    = Math.max(60, Math.min(200, audio.estimatedBPM));
    const zone   = this._bpmZone(bpm);

    // If BPM zone changed (song shifted tempo), refresh movement pool
    const prevZone = this._bpmZone(this.lastBpm);
    this.lastBpm = bpm;

    // ── Beat counter & phrase tracking ─────────────────────────────────────
    if (audio.beatDetected) {
      this.globalBeatCount++;
      this.beatsSinceSwitch++;
      this.phrasePosition = this.globalBeatCount % 8;

      // ── How many beats to hold current groove ────────────────────────────
      // Energy-adaptive: louder/faster = shorter holds = more variety
      if (this.beatsSinceSwitch >= this.switchAfterBeats || zone !== prevZone) {
        this.beatsSinceSwitch = 0;
        this._randomizePrimary(zone);

        // High energy → 2–3 beats; mid → 3–5 beats; low → 5–8 beats
        if (energy > 0.72 || treble > 0.6) {
          this.switchAfterBeats = 2 + Math.floor(Math.random() * 2);     // 2-3
        } else if (energy > 0.4) {
          this.switchAfterBeats = 3 + Math.floor(Math.random() * 3);     // 3-5
        } else {
          this.switchAfterBeats = 5 + Math.floor(Math.random() * 4);     // 5-8
        }
      }

      // ── Accent: big move on beat 1 of every 4-beat bar ──────────────────
      if (this.phrasePosition % 4 === 0) {
        // Beat 1 of bar — fire a sharp accent
        this.accentMovement = this._pickFrom(this.accentMoves, this.accentMovement);
      }

      // ── Drop hype: explosive move every 8 beats when loud ─────────────
      if (this.phrasePosition === 0 && energy > 0.65 && bass > 0.55) {
        this.dropMovement = this._pickFrom(this.accentMoves, this.dropMovement as MovementType ?? 'jump') as MovementType;
        this.dropBeatsRemaining = 2; // lasts 2 beats
      }

      // Count down drop duration
      if (this.dropBeatsRemaining > 0) {
        this.dropBeatsRemaining--;
        if (this.dropBeatsRemaining === 0) {
          this.dropMovement = null;
        }
      }

      // ── Micro-jitter: new random jitter target each beat ────────────────
      this.jitterTarget = (Math.random() - 0.5) * 0.06;
    }

    // Smooth jitter toward target each frame
    this.jitter += (this.jitterTarget - this.jitter) * 0.15;

    // ── Phase calculations ─────────────────────────────────────────────────
    // Primary: full beat phase + jitter
    const phase = (audio.beatPhase + this.jitter + 1.0) % 1.0;

    // Counter-movement runs at a different frequency:
    // - Slow zone: half-time (0.5x) — dreamy, drawn-out
    // - Mid zone: double-time (2x) — pop energy
    // - Fast zone: triple-time (3x) — rave frenzy
    const counterMultiplier = zone === 'slow' ? 0.5 : zone === 'fast' ? 3.0 : 2.0;
    const counterPhase = (audio.beatPhase * counterMultiplier + this.jitter * 0.5) % 1.0;

    // Accent phase: 4 beats within a bar (quarter-note accent)
    const accentPhase = (this.phrasePosition % 4) / 4.0;

    // ── Speed scalar (blend rate) ──────────────────────────────────────────
    const bpmFactor  = (bpm - 60) / 140;
    const speedScalar = 0.55 + energy * 0.85 + treble * 0.55 + bpmFactor * 0.45;

    // ── Intensity per layer ────────────────────────────────────────────────
    const primaryIntensity = Math.min(1.3, (energy + treble * 0.4) * 1.3);
    const counterIntensity = Math.min(1.1, (bass   + treble * 0.3) * 1.15);
    const headBobIntensity = Math.min(1.2, Math.max(0.5, (bass + treble * 0.25) * 1.3));
    // Accent intensity pulses sharply on the beat
    const accentIntensity  = Math.min(1.4, energy * 1.4 + bass * 0.5);
    // Accent weight — full at beat 1, fades in the first beat window
    const accentWeight = Math.max(0, 1.0 - accentPhase * 3.5) * 0.6;

    // ── Build layered pose ──────────────────────────────────────────────────
    // Layer 1 — primary groove
    let synthesized = PoseBlender.applyPartial(
      neutral,
      MovementLibrary.getMovementPose(this.primaryMovement, phase, primaryIntensity),
      1.0,
      createNeutralPose()
    );

    // Layer 2 — counter groove at different frequency
    synthesized = PoseBlender.applyPartial(
      synthesized,
      MovementLibrary.getMovementPose(this.counterMovement, counterPhase, counterIntensity),
      0.68,
      createNeutralPose()
    );

    // Layer 3 — accent hit on bar downbeat (strong transient punch)
    if (accentWeight > 0.02) {
      synthesized = PoseBlender.applyPartial(
        synthesized,
        MovementLibrary.getMovementPose(this.accentMovement, accentPhase, accentIntensity),
        accentWeight,
        createNeutralPose()
      );
    }

    // Layer 4 — continuous head bob driven by bass
    synthesized = PoseBlender.applyPartial(
      synthesized,
      MovementLibrary.headBob(phase, headBobIntensity),
      0.75,
      createNeutralPose()
    );

    // Layer 5 — drop hype (only active for 2 beats after trigger)
    if (this.dropMovement !== null) {
      const dropIntensity = Math.min(1.4, energy * 1.5 + bass * 0.6);
      synthesized = PoseBlender.applyPartial(
        synthesized,
        MovementLibrary.getMovementPose(this.dropMovement, phase, dropIntensity),
        0.88,
        createNeutralPose()
      );
    }

    this.targetPose = synthesized;

    // ── Blend toward target ────────────────────────────────────────────────
    // Faster blend at high energy so pose transitions snap with the beat.
    // Slower blend at low energy for smooth, lazy movement.
    const baseBlend  = (deltaTimeMs / 16.6) * 0.42;
    const blendRate  = Math.min(1.0, baseBlend * speedScalar);
    this.currentPose = PoseBlender.blend(this.currentPose, this.targetPose, blendRate);

    return this.currentPose;
  }

  // ── Public helpers ─────────────────────────────────────────────────────────

  public setMovement(primary: MovementType, secondary: MovementType = 'head bob'): void {
    this.primaryMovement = primary;
    this.counterMovement = secondary;
  }

  public reset(): void {
    this.currentPose = createNeutralPose();
    this.targetPose  = createNeutralPose();
    this.globalBeatCount = 0;
    this.beatsSinceSwitch = 0;
    this.phrasePosition = 0;
    this.dropMovement = null;
    this.dropBeatsRemaining = 0;
    this.jitter = 0;
    this.jitterTarget = 0;
    const zone = this._bpmZone(this.lastBpm);
    this._randomizePrimary(zone);
  }
}
