import { DollPose, MovementType } from '../types/pose';
import { AudioAnalysis } from '../types/audio';
import { MovementLibrary, createNeutralPose } from './MovementLibrary';
import { PoseBlender } from './PoseBlender';

/**
 * Phrase-aware Procedural Dance Engine
 *
 * Key behaviours:
 *  ─ SILENCE GATE: Dolly stands still (breathing idle) when no music is
 *    detected. Uses dual hysteresis thresholds so she doesn't flicker
 *    between dancing and standing on quiet passages.
 *
 *      silence  → dancing:   energy must rise above DANCE_ON  (0.10)
 *      dancing  → silence:   energy must fall below DANCE_OFF (0.04)
 *
 *  ─ ENERGY-SCALED MOVEMENT: All five animation layers scale their
 *    intensity directly from live audio energy and bass. Quiet music →
 *    small subtle movement.  Loud drop → maximum exaggeration.
 *
 *  ─ PHRASE SEQUENCER: Beats → bars (4) → phrases (8). Groove switches
 *    every 2–3 beats (high energy) or 5–8 beats (low energy).
 *
 *  ─ BPM ZONES: Slow (<92), Mid (92-128), Fast (>128). Each zone has
 *    its own movement pool and counter-frequency multiplier.
 *
 *  ─ FIVE LAYERED CHANNELS:
 *      1. Primary groove    — full beat phase
 *      2. Counter groove    — ×0.5 / ×2 / ×3 depending on BPM zone
 *      3. Accent pulse      — sharp hit on beat 1 of every bar, fades
 *      4. Head bob          — continuous bass-driven
 *      5. Drop hype         — 2-beat explosive move every 8 beats
 */
export class DanceEngine {
  private currentPose: DollPose = createNeutralPose();
  private targetPose: DollPose  = createNeutralPose();

  // ── Silence gate ───────────────────────────────────────────────────────────
  /** Energy must exceed this to START dancing */
  private static readonly DANCE_ON  = 0.10;
  /** Energy must drop below this to STOP dancing */
  private static readonly DANCE_OFF = 0.04;
  /** true = currently in dance mode */
  private isDancing: boolean = false;
  /** Smoothed energy used by the gate (slower than raw so transients don't flicker) */
  private gateEnergy: number = 0;

  // ── Phrase / beat state ────────────────────────────────────────────────────
  private globalBeatCount: number = 0;
  private beatsSinceSwitch: number = 0;
  private switchAfterBeats: number = 4;
  private phrasePosition: number = 0;        // 0-7 within an 8-beat phrase

  // ── Movement slots ─────────────────────────────────────────────────────────
  private primaryMovement:    MovementType = 'body bounce';
  private counterMovement:    MovementType = 'hip sway';
  private accentMovement:     MovementType = 'body bounce';
  private dropMovement:       MovementType | null = null;
  private dropBeatsRemaining: number = 0;

  // ── BPM-zone movement pools ────────────────────────────────────────────────

  /** Slow (<92 BPM) — fluid, soulful, classical */
  private slowPrimaries: MovementType[] = [
    'hip sway', 'shoulder bounce', 'hands on hips',
    'left arm wave', 'right arm wave', 'side groove',
    'forward step', 'backward step', 'lock groove',
    'chest pop', 'bounce step', 'wave roll', 'groove pulse',
    'arabesque', 'ballet releve', 'worm wave', 'moonwalk',
  ];
  private slowCounters: MovementType[] = [
    'head bob', 'shoulder bounce', 'hip sway', 'chest pop', 'wave roll',
    'groove pulse', 'arabesque',
  ];

  /** Mid (92-128 BPM) — pop, funk, disco, street */
  private midPrimaries: MovementType[] = [
    'body bounce', 'side groove', 'hip sway',
    'left step', 'right step', 'left arm wave', 'right arm wave',
    'both arms up', 'squat', 'shoulder bounce', 'hands on hips',
    'forward step', 'spin', 'running man', 'chest pop',
    'bounce step', 'lock groove', 'robot chop',
    'two step', 'criss cross', 'groove pulse', 'stomp',
    'floss', 'dab', 'moonwalk', 'tutting',
    'power slide', 'twerk bounce', 'matrix lean',
  ];
  private midCounters: MovementType[] = [
    'head bob', 'shoulder bounce', 'hip sway', 'body bounce',
    'left arm wave', 'right arm wave', 'chest pop', 'arm slash',
    'groove pulse', 'tutting',
  ];

  /** Fast (>128 BPM) — EDM, K-pop, rave, breakdance */
  private fastPrimaries: MovementType[] = [
    'body bounce', 'both arms up', 'spin', 'squat',
    'left step', 'right step', 'side groove',
    'left arm wave', 'right arm wave', 'jump',
    'forward step', 'running man', 'windmill arms',
    'robot chop', 'chest pop', 'bounce step',
    'arm slash', 'stomp', 'criss cross',
    'bboy freeze', 'windmill spin', 'floss',
    'dab', 'twerk bounce', 'matrix lean', 'power slide',
  ];
  private fastCounters: MovementType[] = [
    'head bob', 'body bounce', 'shoulder bounce', 'both arms up',
    'windmill arms', 'chest pop', 'arm slash', 'tutting',
  ];

  /** Accent / drop accents (fired on bar downbeats & phrase drops) */
  private accentMoves: MovementType[] = [
    'jump', 'both arms up', 'squat', 'spin', 'final pose',
    'windmill arms', 'chest pop', 'robot chop', 'arm slash', 'stomp',
    'bboy freeze', 'windmill spin', 'matrix lean', 'dab', 'power slide',
  ];

  // ── Micro-jitter ──────────────────────────────────────────────────────────
  private jitter: number = 0;
  private jitterTarget: number = 0;
  private lastSwitchTimeMs: number = 0;        // wall-clock time of last groove switch
  private switchIntervalMs: number = 2500;     // fallback switch interval in ms
  private lastBpm: number = 120;

  constructor() {
    this._randomizePrimary('mid');
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _bpmZone(bpm: number): 'slow' | 'mid' | 'fast' {
    if (bpm < 92)  return 'slow';
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

  private _pickFrom<T>(pool: T[], avoid: T): T {
    if (pool.length <= 1) return pool[0];
    let pick: T;
    let tries = 0;
    do {
      pick = pool[Math.floor(Math.random() * pool.length)];
      tries++;
    } while (pick === avoid && tries < 10);
    return pick;
  }

  private _randomizePrimary(zone: 'slow' | 'mid' | 'fast'): void {
    this.primaryMovement = this._pickFrom(this._primaryPool(zone), this.primaryMovement);
    this.counterMovement = this._pickFrom(this._counterPool(zone), this.counterMovement);
  }

  // ── Main update ────────────────────────────────────────────────────────────

  public update(audio: AudioAnalysis, isListening: boolean, deltaTimeMs: number = 16): DollPose {
    const neutral = createNeutralPose();

    // ── Gate energy: slow EMA so single loud frames don't flicker the gate ──
    this.gateEnergy += (audio.energy - this.gateEnergy) * 0.08;

    // ── Silence gate with hysteresis ──────────────────────────────────────
    if (!isListening) {
      this.isDancing = false;
    } else if (!this.isDancing && this.gateEnergy >= DanceEngine.DANCE_ON) {
      this.isDancing = true;
    } else if (this.isDancing && this.gateEnergy < DanceEngine.DANCE_OFF) {
      this.isDancing = false;
    }

    // ── Stand still when no music ─────────────────────────────────────────
    if (!this.isDancing) {
      const slowPhase = (performance.now() * 0.0005) % 1.0;
      // Gentle breathing — amplitude proportional to how quiet it is (very subtle)
      const breathIntensity = 0.3 + this.gateEnergy * 1.5;
      const idlePose = MovementLibrary.idle(slowPhase, Math.min(0.5, breathIntensity));
      this.targetPose  = PoseBlender.applyPartial(neutral, idlePose, 1.0, createNeutralPose());
      // Slow blend back to idle so the transition out of dancing is graceful
      this.currentPose = PoseBlender.blend(this.currentPose, this.targetPose, 0.08);
      return this.currentPose;
    }

    // ── Audio scalars ──────────────────────────────────────────────────────
    const rawEnergy = Math.min(1.0, audio.energy);
    const energy    = Math.min(1.0, rawEnergy * 1.5);   // amplified for animation
    const bass      = Math.min(1.0, audio.bassEnergy  * 1.6);
    const treble    = Math.min(1.0, audio.trebleEnergy * 1.6);
    const bpm       = Math.max(60, Math.min(200, audio.estimatedBPM));
    const zone      = this._bpmZone(bpm);
    const prevZone  = this._bpmZone(this.lastBpm);
    this.lastBpm    = bpm;

    // ── Beat counter & phrase tracking ─────────────────────────────────────
    const nowMs = performance.now();

    // Time-based fallback: switch move every switchIntervalMs even if no beats detected.
    // This ensures the character always varies even when beat detection is unreliable.
    const timeSinceSwitch = nowMs - this.lastSwitchTimeMs;
    const shouldSwitchByTime = timeSinceSwitch >= this.switchIntervalMs;

    if (audio.beatDetected) {
      this.globalBeatCount++;
      this.beatsSinceSwitch++;
      this.phrasePosition = this.globalBeatCount % 8;

      // Accent on beat 1 of every 4-beat bar
      if (this.phrasePosition % 4 === 0) {
        this.accentMovement = this._pickFrom(this.accentMoves, this.accentMovement);
      }

      // Drop hype: every 8-beat phrase boundary when loud
      if (this.phrasePosition === 0 && energy > 0.60 && bass > 0.50) {
        this.dropMovement = this._pickFrom(
          this.accentMoves,
          (this.dropMovement ?? 'jump') as MovementType
        ) as MovementType;
        this.dropBeatsRemaining = 2;
      }

      if (this.dropBeatsRemaining > 0) {
        this.dropBeatsRemaining--;
        if (this.dropBeatsRemaining === 0) this.dropMovement = null;
      }

      // Micro-jitter: slightly randomise phase each beat
      this.jitterTarget = (Math.random() - 0.5) * 0.06;
    }

    // ── Groove switch (beat-driven OR time-driven fallback) ───────────────
    const beatDrivenSwitch = audio.beatDetected && this.beatsSinceSwitch >= this.switchAfterBeats;
    if (beatDrivenSwitch || shouldSwitchByTime || zone !== prevZone) {
      this.beatsSinceSwitch = 0;
      this.lastSwitchTimeMs = nowMs;
      this._randomizePrimary(zone);

      // Recalculate both beat-count hold AND time hold
      if (energy > 0.75 || treble > 0.65) {
        this.switchAfterBeats  = 2 + Math.floor(Math.random() * 2);    // 2-3 beats
        this.switchIntervalMs  = 800 + Math.random() * 700;            // 0.8–1.5 s
      } else if (energy > 0.45) {
        this.switchAfterBeats  = 3 + Math.floor(Math.random() * 3);    // 3-5 beats
        this.switchIntervalMs  = 1500 + Math.random() * 1000;          // 1.5–2.5 s
      } else {
        this.switchAfterBeats  = 5 + Math.floor(Math.random() * 4);    // 5-8 beats
        this.switchIntervalMs  = 2500 + Math.random() * 1500;          // 2.5–4 s
      }

      // Fire an accent on any switch so the transition is visually punchy
      this.accentMovement = this._pickFrom(this.accentMoves, this.accentMovement);
    }

    this.jitter += (this.jitterTarget - this.jitter) * 0.15;

    // ── Phase calculations ─────────────────────────────────────────────────
    const phase        = (audio.beatPhase + this.jitter + 1.0) % 1.0;
    const cMult        = zone === 'slow' ? 0.5 : zone === 'fast' ? 3.0 : 2.0;
    const counterPhase = (audio.beatPhase * cMult + this.jitter * 0.5) % 1.0;
    const accentPhase  = (this.phrasePosition % 4) / 4.0;

    // ── Speed scalar (how fast pose transitions snap) ──────────────────────
    const bpmFactor   = (bpm - 60) / 140;
    const speedScalar = 0.55 + energy * 0.85 + treble * 0.55 + bpmFactor * 0.45;

    // ── ENERGY-SCALED INTENSITIES ─────────────────────────────────────────
    // All intensity values rise linearly with audio energy so quiet music
    // produces subtle movement and loud music produces full exaggerated poses.
    //
    //  quietFloor: minimum movement at DANCE_ON threshold (just above silence)
    //  loudCeil:   maximum at full energy
    //
    const quietFloor = 0.18;
    const loudCeil   = 1.35;
    // Map rawEnergy → [quietFloor, loudCeil]
    const energyFraction = Math.max(0, (rawEnergy - DanceEngine.DANCE_ON) / (1.0 - DanceEngine.DANCE_ON));
    const baseScale  = quietFloor + energyFraction * (loudCeil - quietFloor);

    const primaryIntensity = Math.min(loudCeil, baseScale * (1.0 + treble * 0.3));
    const counterIntensity = Math.min(1.1,      baseScale * (0.7 + bass   * 0.35));
    const headBobIntensity = Math.min(1.2,      Math.max(quietFloor, baseScale * (0.6 + bass * 0.4)));
    const accentIntensity  = Math.min(loudCeil, baseScale * (1.1 + bass * 0.4));
    const accentWeight     = Math.max(0, 1.0 - accentPhase * 3.5) * Math.min(0.7, energy * 0.9);

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
      0.65,
      createNeutralPose()
    );

    // Layer 3 — bar-downbeat accent (fades over the bar)
    if (accentWeight > 0.02) {
      synthesized = PoseBlender.applyPartial(
        synthesized,
        MovementLibrary.getMovementPose(this.accentMovement, accentPhase, accentIntensity),
        accentWeight,
        createNeutralPose()
      );
    }

    // Layer 4 — continuous head bob
    synthesized = PoseBlender.applyPartial(
      synthesized,
      MovementLibrary.headBob(phase, headBobIntensity),
      0.72,
      createNeutralPose()
    );

    // Layer 5 — phrase drop hype
    if (this.dropMovement !== null) {
      const dropIntensity = Math.min(loudCeil, baseScale * 1.4 + bass * 0.4);
      synthesized = PoseBlender.applyPartial(
        synthesized,
        MovementLibrary.getMovementPose(this.dropMovement, phase, dropIntensity),
        Math.min(0.88, energy * 1.1),
        createNeutralPose()
      );
    }

    this.targetPose = synthesized;

    // ── Blend toward target ────────────────────────────────────────────────
    const baseBlend = (deltaTimeMs / 16.6) * 0.42;
    const blendRate = Math.min(1.0, baseBlend * speedScalar);
    this.currentPose = PoseBlender.blend(this.currentPose, this.targetPose, blendRate);

    return this.currentPose;
  }

  // ── Public helpers ─────────────────────────────────────────────────────────

  public setMovement(primary: MovementType, secondary: MovementType = 'head bob'): void {
    this.primaryMovement = primary;
    this.counterMovement = secondary;
  }

  public reset(): void {
    this.currentPose        = createNeutralPose();
    this.targetPose         = createNeutralPose();
    this.globalBeatCount    = 0;
    this.beatsSinceSwitch   = 0;
    this.phrasePosition     = 0;
    this.dropMovement       = null;
    this.dropBeatsRemaining = 0;
    this.jitter             = 0;
    this.jitterTarget       = 0;
    this.isDancing          = false;
    this.gateEnergy         = 0;
    this.lastSwitchTimeMs   = 0;
    this.switchIntervalMs   = 2500;
    this._randomizePrimary(this._bpmZone(this.lastBpm));
  }
}
