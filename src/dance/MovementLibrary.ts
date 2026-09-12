import { DollPose, MovementType } from '../types/pose';

// ─── Tiny seeded hash so we get repeatable-per-phase variation ───────────────
function fract(x: number): number { return x - Math.floor(x); }
function hash(n: number): number { return fract(Math.sin(n) * 43758.5453123); }

/**
 * Creates a fresh default neutral standing pose
 */
export function createNeutralPose(): DollPose {
  return {
    root: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
    pelvis: { x: 0, y: 0, angle: 0 },
    torso: { angle: 0, stretch: 1 },
    head: { x: 0, y: 0, angle: 0 },
    leftArm: { shoulderAngle: 0.18, elbowAngle: 0.22, wristAngle: 0 },
    rightArm: { shoulderAngle: 0.18, elbowAngle: 0.22, wristAngle: 0 },
    leftLeg: { hipAngle: 0.05, kneeAngle: 0.04, ankleAngle: 0 },
    rightLeg: { hipAngle: 0.05, kneeAngle: 0.04, ankleAngle: 0 },
  };
}

/**
 * Movement Synthesizer Library
 * 
 * POLISHED BIOMECHANICS & ANIMATION PRINCIPLES:
 * - Whole-body coordinated motion (spine, hips, head, and limbs move in unison).
 * - Squash and stretch with volume preservation (scaleX * scaleY ≈ 1).
 * - Anticipation: subtle compression/dip before upward reaches or explosive leaps.
 * - Overlapping action & follow-through: head and wrists lag behind torso and elbows.
 * - Weight shifting & balance: spine counter-curves to keep head centered over base of support.
 */
export class MovementLibrary {
  /**
   * 1. IDLE: Natural resting breathing cycle with gentle weight transfer and subtle head tilt
   */
  public static idle(phase: number, intensity: number = 0.5): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const breathe = Math.sin(p);
    const sway = Math.cos(p * 0.5);

    return {
      root: {
        x: sway * 0.03 * intensity,
        y: Math.abs(breathe) * 0.04 * intensity,
        scaleX: 1 - breathe * 0.02 * intensity,
        scaleY: 1 + breathe * 0.02 * intensity,
        rotation: sway * 0.02 * intensity,
      },
      torso: {
        angle: sway * 0.025 * intensity,
        stretch: 1 + breathe * 0.02 * intensity,
      },
      head: {
        x: 0,
        y: breathe * 0.025 * intensity,
        angle: -sway * 0.035 * intensity, // Subtle counter-tilt for balance
      },
      leftArm: {
        shoulderAngle: 0.18 + breathe * 0.03 * intensity,
        elbowAngle: 0.25 + breathe * 0.04 * intensity,
        wristAngle: sway * 0.02 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.18 - breathe * 0.03 * intensity,
        elbowAngle: 0.25 - breathe * 0.04 * intensity,
        wristAngle: -sway * 0.02 * intensity,
      },
      leftLeg: {
        hipAngle: 0.05 + sway * 0.02 * intensity,
        kneeAngle: 0.04,
        ankleAngle: 0,
      },
      rightLeg: {
        hipAngle: 0.05 - sway * 0.02 * intensity,
        kneeAngle: 0.04,
        ankleAngle: 0,
      },
    };
  }

  /**
   * 2. HEAD BOB: Rhythmic nodding with organic spine and shoulder follow-through
   */
  public static headBob(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    // Primary downward nod on beat (sine wave shaped for quick snap down, smooth return)
    const rawBob = Math.sin(p);
    const nodDown = Math.max(0, rawBob);
    const followThrough = Math.sin(p - 0.35); // 0.35 rad lag for head follow-through

    return {
      head: {
        x: 0,
        y: nodDown * 0.24 * intensity,
        angle: followThrough * 0.32 * intensity,
      },
      torso: {
        angle: nodDown * 0.08 * intensity, // Torso bends slightly forward to support nod
        stretch: 1 - nodDown * 0.04 * intensity,
      },
      leftArm: {
        shoulderAngle: 0.2 + nodDown * 0.12 * intensity,
        elbowAngle: 0.3 + nodDown * 0.08 * intensity,
        wristAngle: 0,
      },
      rightArm: {
        shoulderAngle: 0.2 + nodDown * 0.12 * intensity,
        elbowAngle: 0.3 + nodDown * 0.08 * intensity,
        wristAngle: 0,
      },
    };
  }

  /**
   * 3. BODY BOUNCE: Sharp downward compression on the beat with knee flexion.
   * Now has a subtle side-sway that makes every bounce slightly different.
   */
  public static bodyBounce(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const bounce = Math.cos(p);
    const compression = Math.max(0, bounce) * 0.35 * intensity;
    // Slight random sway so no two bounces look identical
    const swayNoise = Math.sin(p * 1.7 + 0.9) * 0.08 * intensity;

    return {
      root: {
        x: swayNoise,
        y: compression * 0.72,
        scaleX: 1 + compression * 0.24,
        scaleY: 1 - compression * 0.19,
        rotation: swayNoise * 0.08,
      },
      pelvis: { x: swayNoise * 0.8, y: compression * 0.18, angle: swayNoise * 0.15 },
      torso:  { angle: compression * 0.06 + swayNoise * 0.04, stretch: 1 - compression * 0.1 },
      leftLeg:  { hipAngle: 0.08 + compression * 0.5,  kneeAngle: 0.08 + compression * 0.82, ankleAngle: -compression * 0.22 },
      rightLeg: { hipAngle: 0.08 + compression * 0.5,  kneeAngle: 0.08 + compression * 0.82, ankleAngle: -compression * 0.22 },
      leftArm:  { shoulderAngle: 0.25 + compression * 0.3,  elbowAngle: 0.35 + compression * 0.35, wristAngle: -compression * 0.18 },
      rightArm: { shoulderAngle: 0.25 + compression * 0.3,  elbowAngle: 0.35 + compression * 0.35, wristAngle: compression * 0.18 },
      head: { x: swayNoise * 0.3, y: compression * 0.12, angle: Math.sin(p - 0.3) * 0.14 * intensity },
    };
  }

  /**
   * 4. SHOULDER BOUNCE: Alternating shoulder roll with spinal counter-flexion
   */
  public static shoulderBounce(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const shrug = Math.sin(p);
    const lagArm = Math.sin(p - 0.4);

    return {
      torso: {
        angle: shrug * 0.18 * intensity,
        stretch: 1,
      },
      head: {
        x: -shrug * 0.04 * intensity,
        y: 0,
        angle: -shrug * 0.14 * intensity, // Head tilts gently opposite to shoulders
      },
      leftArm: {
        shoulderAngle: 0.25 + shrug * 0.45 * intensity,
        elbowAngle: 0.45 + lagArm * 0.35 * intensity,
        wristAngle: lagArm * 0.2 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.25 - shrug * 0.45 * intensity,
        elbowAngle: 0.45 - lagArm * 0.35 * intensity,
        wristAngle: -lagArm * 0.2 * intensity,
      },
      pelvis: {
        x: -shrug * 0.1 * intensity,
        y: 0,
        angle: -shrug * 0.08 * intensity, // Pelvis counter-sits for balance
      },
    };
  }

  /**
   * 5. LEFT ARM WAVE: Fluid sequential whip propagation (shoulder -> elbow -> wrist)
   */
  public static leftArmWave(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const s1 = Math.sin(p);
    const s2 = Math.sin(p - 0.35); // Elbow lags shoulder
    const s3 = Math.sin(p - 0.7);  // Wrist lags elbow

    return {
      leftArm: {
        shoulderAngle: 0.9 + s1 * 0.7 * intensity,
        elbowAngle: 0.85 + s2 * 0.65 * intensity,
        wristAngle: s3 * 0.45 * intensity,
      },
      torso: {
        angle: -s1 * 0.12 * intensity, // Torso tilts slightly into wave
        stretch: 1,
      },
      head: {
        x: 0,
        y: 0,
        angle: -s2 * 0.1 * intensity,
      },
    };
  }

  /**
   * 6. RIGHT ARM WAVE: Fluid sequential whip propagation
   */
  public static rightArmWave(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const s1 = Math.sin(p);
    const s2 = Math.sin(p - 0.35);
    const s3 = Math.sin(p - 0.7);

    return {
      rightArm: {
        shoulderAngle: 0.9 + s1 * 0.7 * intensity,
        elbowAngle: 0.85 + s2 * 0.65 * intensity,
        wristAngle: -s3 * 0.45 * intensity,
      },
      torso: {
        angle: s1 * 0.12 * intensity,
        stretch: 1,
      },
      head: {
        x: 0,
        y: 0,
        angle: s2 * 0.1 * intensity,
      },
    };
  }

  /**
   * 7. BOTH ARMS UP: Celebratory pump with pre-reach anticipation & upward stretch
   */
  public static bothArmsUp(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const reach = Math.sin(p);
    const stretch = Math.max(0, reach);

    return {
      root: {
        x: 0,
        y: -stretch * 0.22 * intensity, // Body lifts upward
        scaleX: 1 - stretch * 0.08 * intensity, // Slender stretch
        scaleY: 1 + stretch * 0.12 * intensity,
        rotation: 0,
      },
      leftArm: {
        shoulderAngle: 1.85 + reach * 0.4 * intensity,
        elbowAngle: 0.65 + reach * 0.35 * intensity,
        wristAngle: Math.sin(p - 0.3) * 0.25 * intensity,
      },
      rightArm: {
        shoulderAngle: 1.85 + reach * 0.4 * intensity,
        elbowAngle: 0.65 + reach * 0.35 * intensity,
        wristAngle: -Math.sin(p - 0.3) * 0.25 * intensity,
      },
      head: {
        x: 0,
        y: -stretch * 0.08 * intensity,
        angle: -stretch * 0.16 * intensity, // Look slightly upward
      },
      torso: {
        angle: 0,
        stretch: 1 + stretch * 0.08 * intensity,
      },
    };
  }

  /**
   * 8. LEFT STEP: Realistic lateral weight shift with planted foot & spinal counter-balance
   */
  public static leftStep(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const cycle = Math.sin(p);
    const stepWeight = Math.max(0, cycle);

    return {
      root: {
        x: -0.38 * intensity * stepWeight,
        y: Math.sin(p * 2) * 0.14 * intensity,
        scaleX: 1,
        scaleY: 1,
        rotation: -0.09 * intensity * stepWeight,
      },
      pelvis: {
        x: -0.42 * intensity * stepWeight,
        y: 0,
        angle: -0.15 * intensity * stepWeight,
      },
      torso: {
        angle: 0.12 * intensity * stepWeight, // Spinal counter-tilt for balance
        stretch: 1,
      },
      head: {
        x: 0,
        y: 0,
        angle: -0.06 * intensity * stepWeight, // Keeps head centered
      },
      leftLeg: {
        hipAngle: 0.32 * intensity * stepWeight,
        kneeAngle: 0.22 * intensity * stepWeight,
        ankleAngle: -0.12 * intensity * stepWeight,
      },
      rightLeg: {
        hipAngle: -0.18 * intensity * stepWeight,
        kneeAngle: 0.06,
        ankleAngle: 0,
      },
      leftArm: {
        shoulderAngle: 0.35 + stepWeight * 0.35,
        elbowAngle: 0.45 + stepWeight * 0.3,
        wristAngle: 0,
      },
      rightArm: {
        shoulderAngle: 0.35 - stepWeight * 0.2,
        elbowAngle: 0.45,
        wristAngle: 0,
      },
    };
  }

  /**
   * 9. RIGHT STEP: Realistic lateral weight shift to right
   */
  public static rightStep(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const cycle = Math.sin(p);
    const stepWeight = Math.max(0, cycle);

    return {
      root: {
        x: 0.38 * intensity * stepWeight,
        y: Math.sin(p * 2) * 0.14 * intensity,
        scaleX: 1,
        scaleY: 1,
        rotation: 0.09 * intensity * stepWeight,
      },
      pelvis: {
        x: 0.42 * intensity * stepWeight,
        y: 0,
        angle: 0.15 * intensity * stepWeight,
      },
      torso: {
        angle: -0.12 * intensity * stepWeight,
        stretch: 1,
      },
      head: {
        x: 0,
        y: 0,
        angle: 0.06 * intensity * stepWeight,
      },
      rightLeg: {
        hipAngle: 0.32 * intensity * stepWeight,
        kneeAngle: 0.22 * intensity * stepWeight,
        ankleAngle: -0.12 * intensity * stepWeight,
      },
      leftLeg: {
        hipAngle: -0.18 * intensity * stepWeight,
        kneeAngle: 0.06,
        ankleAngle: 0,
      },
      rightArm: {
        shoulderAngle: 0.35 + stepWeight * 0.35,
        elbowAngle: 0.45 + stepWeight * 0.3,
        wristAngle: 0,
      },
      leftArm: {
        shoulderAngle: 0.35 - stepWeight * 0.2,
        elbowAngle: 0.45,
        wristAngle: 0,
      },
    };
  }

  /**
   * 10. FORWARD STEP: Rocking weight forward with chest presentation
   */
  public static forwardStep(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const fwd = Math.sin(p);

    return {
      root: {
        x: 0,
        y: fwd * 0.18 * intensity,
        scaleX: 1 + fwd * 0.08 * intensity,
        scaleY: 1 + fwd * 0.08 * intensity,
        rotation: fwd * 0.08 * intensity,
      },
      torso: {
        angle: fwd * 0.18 * intensity,
        stretch: 1,
      },
      head: {
        x: 0,
        y: fwd * 0.08 * intensity,
        angle: fwd * 0.15 * intensity,
      },
      leftLeg: {
        hipAngle: 0.08 + fwd * 0.2 * intensity,
        kneeAngle: 0.06 + fwd * 0.15 * intensity,
        ankleAngle: 0,
      },
      rightLeg: {
        hipAngle: 0.08 - fwd * 0.15 * intensity,
        kneeAngle: 0.06,
        ankleAngle: 0,
      },
    };
  }

  /**
   * 11. BACKWARD STEP: Rocking weight back with torso opening
   */
  public static backwardStep(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const back = Math.sin(p);

    return {
      root: {
        x: 0,
        y: -back * 0.14 * intensity,
        scaleX: 1 - back * 0.06 * intensity,
        scaleY: 1 - back * 0.06 * intensity,
        rotation: -back * 0.08 * intensity,
      },
      torso: {
        angle: -back * 0.16 * intensity,
        stretch: 1,
      },
      head: {
        x: 0,
        y: -back * 0.06 * intensity,
        angle: -back * 0.12 * intensity,
      },
    };
  }

  /**
   * 12. HIP SWAY: Figure-8 pelvis path with organic S-curve spine.
   * Deliberately different frequency ratio so it doesn't sync perfectly with body bounce.
   */
  public static hipSway(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const sway     = Math.sin(p);
    const lift     = Math.sin(p * 2) * 0.12 * intensity;        // figure-8 vertical
    const swayArm  = Math.sin(p - 0.3) * intensity;
    const lagArm2  = Math.sin(p + 0.4) * intensity;

    return {
      pelvis: {
        x: sway * 0.58 * intensity,
        y: lift,
        angle: sway * 0.28 * intensity,
      },
      root: {
        x: sway * 0.2 * intensity,
        y: Math.abs(lift) * 0.5,
        scaleX: 1,
        scaleY: 1,
        rotation: -sway * 0.07 * intensity,
      },
      torso: { angle: -sway * 0.2 * intensity, stretch: 1 },
      head:  { x: -sway * 0.07 * intensity, y: 0, angle: sway * 0.16 * intensity },
      leftArm: {
        shoulderAngle: 0.3 + swayArm * 0.42 * intensity,
        elbowAngle:    0.38 + Math.abs(sway) * 0.25 * intensity,
        wristAngle:    swayArm * 0.18 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.3 - lagArm2 * 0.42 * intensity,
        elbowAngle:    0.38 + Math.abs(sway) * 0.25 * intensity,
        wristAngle:    -lagArm2 * 0.18 * intensity,
      },
    };
  }

  /**
   * 13. SQUAT: Biomechanically believable deep groove drop with arm counter-balance
   */
  public static squat(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const depth = Math.max(0, Math.sin(p)) * intensity;

    return {
      root: {
        x: 0,
        y: depth * 0.58, // Lower body deep
        scaleX: 1 + depth * 0.24, // Wide lateral squash
        scaleY: 1 - depth * 0.2,  // Vertical squash
        rotation: 0,
      },
      torso: {
        angle: depth * 0.16, // Lean forward slightly for balance
        stretch: 1 - depth * 0.08,
      },
      leftLeg: {
        hipAngle: depth * 0.72,
        kneeAngle: depth * 1.15,
        ankleAngle: -depth * 0.32,
      },
      rightLeg: {
        hipAngle: depth * 0.72,
        kneeAngle: depth * 1.15,
        ankleAngle: -depth * 0.32,
      },
      leftArm: {
        shoulderAngle: 0.45 + depth * 0.55, // Arms reach forward to balance weight
        elbowAngle: 0.55 + depth * 0.5,
        wristAngle: -depth * 0.2,
      },
      rightArm: {
        shoulderAngle: 0.45 + depth * 0.55,
        elbowAngle: 0.55 + depth * 0.5,
        wristAngle: -depth * 0.2,
      },
      head: {
        x: 0,
        y: 0,
        angle: -depth * 0.12, // Head looks forward
      },
    };
  }

  /**
   * 14. JUMP: Classic 4-phase jump (Anticipation crouch -> Launch stretch -> Apex float -> Landing squash)
   */
  public static jump(phase: number, intensity: number = 1.0): Partial<DollPose> {
    let rootY = 0;
    let scaleX = 1;
    let scaleY = 1;
    let hipAngle = 0;
    let kneeAngle = 0;
    let armShoulder = 0.3;

    if (phase < 0.18) {
      // Phase 1: Anticipation crouch / compression
      const crouchT = phase / 0.18;
      const squash = Math.sin(crouchT * Math.PI * 0.5) * 0.28 * intensity;
      rootY = squash * 0.5;
      scaleY = 1 - squash;
      scaleX = 1 + squash * 0.9;
      hipAngle = squash * 0.6;
      kneeAngle = squash * 0.9;
      armShoulder = 0.2 - squash * 0.3;
    } else if (phase < 0.7) {
      // Phase 2: Launch and airborne float
      const airT = (phase - 0.18) / 0.52;
      const height = Math.sin(airT * Math.PI);
      rootY = -height * 0.88 * intensity;
      scaleY = 1 + height * 0.16 * intensity; // Upward stretch
      scaleX = 1 - height * 0.1 * intensity;
      hipAngle = -0.22 * intensity;
      kneeAngle = 0.38 * intensity;
      armShoulder = 1.65 * intensity; // High swinging arms
    } else {
      // Phase 3: Landing squash and recovery
      const landT = (phase - 0.7) / 0.3;
      const landSquash = Math.sin(landT * Math.PI) * 0.32 * intensity;
      rootY = landSquash * 0.45;
      scaleY = 1 - landSquash;
      scaleX = 1 + landSquash;
      hipAngle = landSquash * 0.5;
      kneeAngle = landSquash * 0.85;
      armShoulder = 0.7 - landSquash * 0.3;
    }

    return {
      root: { x: 0, y: rootY, scaleX, scaleY, rotation: 0 },
      leftLeg: { hipAngle, kneeAngle, ankleAngle: 0 },
      rightLeg: { hipAngle, kneeAngle, ankleAngle: 0 },
      leftArm: { shoulderAngle: armShoulder, elbowAngle: 0.5 * intensity, wristAngle: 0 },
      rightArm: { shoulderAngle: armShoulder, elbowAngle: 0.5 * intensity, wristAngle: 0 },
    };
  }

  /**
   * 15. SPIN: Continuous 360-degree illusion through cosine modulation with arm tuck
   */
  public static spin(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const cosVal = Math.cos(p);
    const bounce = Math.abs(Math.sin(p)) * 0.12 * intensity;

    return {
      root: {
        x: 0,
        y: bounce,
        scaleX: cosVal, // 3D spin illusion
        scaleY: 1,
        rotation: 0,
      },
      leftArm: {
        shoulderAngle: 0.65 + Math.sin(p) * 0.35,
        elbowAngle: 0.8, // Tucked in close during spin
        wristAngle: 0,
      },
      rightArm: {
        shoulderAngle: 0.65 - Math.sin(p) * 0.35,
        elbowAngle: 0.8,
        wristAngle: 0,
      },
    };
  }

  /**
   * 16. SIDE GROOVE: 2-step shuffle with coordinated arm pump and hip bounce
   */
  public static sideGroove(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const side = Math.sin(p);
    const verticalBounce = Math.abs(Math.cos(p)) * 0.22 * intensity;

    return {
      root: {
        x: side * 0.44 * intensity,
        y: verticalBounce,
        scaleX: 1,
        scaleY: 1,
        rotation: side * 0.12 * intensity,
      },
      pelvis: {
        x: side * 0.32 * intensity,
        y: 0,
        angle: side * 0.22 * intensity,
      },
      torso: {
        angle: -side * 0.1 * intensity,
        stretch: 1,
      },
      head: {
        x: 0,
        y: 0,
        angle: -side * 0.08 * intensity,
      },
      leftArm: {
        shoulderAngle: 0.55 + side * 0.55 * intensity,
        elbowAngle: 0.75 + Math.cos(p) * 0.45 * intensity,
        wristAngle: side * 0.2 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.55 - side * 0.55 * intensity,
        elbowAngle: 0.75 - Math.cos(p) * 0.45 * intensity,
        wristAngle: -side * 0.2 * intensity,
      },
    };
  }

  /**
   * 17. HANDS ON HIPS: Confident grounded stance with rhythmic breathing bounce
   */
  public static handsOnHips(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const bob = Math.sin(p) * 0.1 * intensity;
    const sway = Math.cos(p * 0.5) * 0.12 * intensity;

    return {
      root: { x: sway, y: bob, scaleX: 1, scaleY: 1, rotation: sway * 0.05 },
      pelvis: { x: sway * 1.5, y: 0, angle: sway * 0.15 },
      leftArm: {
        shoulderAngle: 0.88,
        elbowAngle: 1.48,
        wristAngle: -0.38,
      },
      rightArm: {
        shoulderAngle: 0.88,
        elbowAngle: 1.48,
        wristAngle: -0.38,
      },
      head: {
        x: 0,
        y: 0,
        angle: -sway * 0.15 * intensity,
      },
    };
  }

  /**
   * 18. FINAL POSE: Climax freeze with organic chest breathing
   */
  public static finalPose(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const breath = Math.sin(phase * Math.PI * 2) * 0.02;

    return {
      root: {
        x: 0.15 * intensity,
        y: (0.08 + breath) * intensity,
        scaleX: 1 - breath,
        scaleY: 1 + breath,
        rotation: 0.08 * intensity,
      },
      head: { x: 0, y: 0, angle: -0.22 * intensity },
      torso: { angle: 0.08 * intensity, stretch: 1 + breath },
      leftArm: {
        shoulderAngle: 2.15 * intensity,
        elbowAngle: 0.2,
        wristAngle: 0.28,
      },
      rightArm: {
        shoulderAngle: 0.95 * intensity,
        elbowAngle: 1.52,
        wristAngle: -0.32,
      },
      leftLeg: { hipAngle: 0.35 * intensity, kneeAngle: 0.12, ankleAngle: 0 },
      rightLeg: { hipAngle: -0.22 * intensity, kneeAngle: 0.32 * intensity, ankleAngle: 0 },
    };
  }

  // ─── NEW MOVEMENTS ────────────────────────────────────────────────────────

  /**
   * 19. RUNNING MAN: Alternating high-knee march with opposing arms — the classic.
   *     Phase drives left/right alternation; at double tempo it looks like a real running man.
   */
  public static runningMan(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    // Left leg lifts on beat, right on off-beat
    const leftLift  = Math.max(0,  Math.sin(p));
    const rightLift = Math.max(0, -Math.sin(p));
    const bounce    = Math.abs(Math.sin(p)) * 0.18 * intensity;

    return {
      root: { x: 0, y: bounce, scaleX: 1 + bounce * 0.08, scaleY: 1 - bounce * 0.06, rotation: Math.sin(p) * 0.04 * intensity },
      torso: { angle: Math.sin(p) * 0.1 * intensity, stretch: 1 },
      head:  { x: 0, y: 0, angle: Math.sin(p - 0.4) * 0.1 * intensity },
      leftLeg: {
        hipAngle:   0.12 + leftLift  * 0.72 * intensity,
        kneeAngle:  0.08 + leftLift  * 0.95 * intensity,
        ankleAngle: leftLift * 0.15 * intensity,
      },
      rightLeg: {
        hipAngle:   0.12 + rightLift * 0.72 * intensity,
        kneeAngle:  0.08 + rightLift * 0.95 * intensity,
        ankleAngle: rightLift * 0.15 * intensity,
      },
      // Arms swing opposite to legs
      leftArm:  { shoulderAngle: 0.45 - Math.sin(p) * 0.65 * intensity, elbowAngle: 0.6 + leftLift  * 0.4, wristAngle: 0 },
      rightArm: { shoulderAngle: 0.45 + Math.sin(p) * 0.65 * intensity, elbowAngle: 0.6 + rightLift * 0.4, wristAngle: 0 },
    };
  }

  /**
   * 20. ROBOT CHOP: Mechanical stiff-joint arms with sharp syncopated chops.
   *     Uses a stepped wave (quantized sine) for mechanical feel.
   */
  public static robotChop(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    // Quantize to 4 steps per beat for robotic snap
    const stepped = Math.round(Math.sin(p) * 2) / 2;
    const steppedCos = Math.round(Math.cos(p) * 2) / 2;

    return {
      root: { x: 0, y: Math.abs(stepped) * 0.12 * intensity, scaleX: 1, scaleY: 1, rotation: stepped * 0.04 * intensity },
      torso: { angle: stepped * 0.14 * intensity, stretch: 1 },
      head:  { x: steppedCos * 0.1 * intensity, y: 0, angle: -stepped * 0.18 * intensity },
      leftArm: {
        shoulderAngle: 0.4 + stepped  * 0.9 * intensity,
        elbowAngle:    0.1 + Math.abs(stepped) * 1.2 * intensity,
        wristAngle:    stepped * 0.35 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.4 - steppedCos * 0.9 * intensity,
        elbowAngle:    0.1 + Math.abs(steppedCos) * 1.2 * intensity,
        wristAngle:    -steppedCos * 0.35 * intensity,
      },
      leftLeg:  { hipAngle: 0.05 + Math.abs(stepped) * 0.15 * intensity, kneeAngle: 0.04, ankleAngle: 0 },
      rightLeg: { hipAngle: 0.05 + Math.abs(steppedCos) * 0.15 * intensity, kneeAngle: 0.04, ankleAngle: 0 },
    };
  }

  /**
   * 21. CHEST POP: Sharp chest isolation — torso punches forward on every beat.
   *     Quick pop-and-lock feel. The wrists flick outward on the accent.
   */
  public static chestPop(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    // Sharp attack, long decay — looks like a hard pop
    const pop = Math.max(0, Math.pow(Math.sin(p), 3)) * intensity;
    const retract = Math.max(0, -Math.sin(p)) * 0.4 * intensity;

    return {
      root: { x: 0, y: pop * 0.15, scaleX: 1 + pop * 0.1, scaleY: 1 - pop * 0.07, rotation: 0 },
      torso: { angle: pop * 0.25, stretch: 1 + pop * 0.06 },
      head:  { x: 0, y: pop * 0.06, angle: pop * 0.12 },
      leftArm: {
        shoulderAngle: 0.55 - pop * 0.2,
        elbowAngle:    0.8  + pop * 0.45,
        wristAngle:    pop * 0.45 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.55 - pop * 0.2,
        elbowAngle:    0.8  + pop * 0.45,
        wristAngle:    -pop * 0.45 * intensity,
      },
      leftLeg:  { hipAngle: retract * 0.2 + 0.05, kneeAngle: retract * 0.15 + 0.04, ankleAngle: 0 },
      rightLeg: { hipAngle: retract * 0.2 + 0.05, kneeAngle: retract * 0.15 + 0.04, ankleAngle: 0 },
    };
  }

  /**
   * 22. WINDMILL ARMS: Big sweeping arm circles in alternating directions.
   *     Each arm runs at offset phase for asynchronous windmill feel.
   */
  public static windmillArms(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const leftPhase  = p;
    const rightPhase = p + Math.PI; // 180° offset

    return {
      root: { x: 0, y: Math.abs(Math.sin(p)) * 0.14 * intensity, scaleX: 1, scaleY: 1, rotation: Math.sin(p) * 0.06 * intensity },
      torso: { angle: Math.sin(p) * 0.15 * intensity, stretch: 1 },
      head:  { x: 0, y: 0, angle: Math.sin(p - 0.5) * 0.12 * intensity },
      leftArm: {
        shoulderAngle: 1.0 + Math.sin(leftPhase)  * 1.05 * intensity,
        elbowAngle:    0.55 + Math.cos(leftPhase)  * 0.35 * intensity,
        wristAngle:    Math.sin(leftPhase  + 0.5)  * 0.3 * intensity,
      },
      rightArm: {
        shoulderAngle: 1.0 + Math.sin(rightPhase) * 1.05 * intensity,
        elbowAngle:    0.55 + Math.cos(rightPhase) * 0.35 * intensity,
        wristAngle:    Math.sin(rightPhase + 0.5)  * 0.3 * intensity,
      },
      leftLeg:  { hipAngle: 0.06, kneeAngle: 0.05, ankleAngle: 0 },
      rightLeg: { hipAngle: 0.06, kneeAngle: 0.05, ankleAngle: 0 },
    };
  }

  /**
   * 23. BOUNCE STEP: Alternating left-right weight shifts with full body bob.
   *     Uses `hash()` to add slightly different arc heights each cycle.
   */
  public static bounceStep(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const dir   = Math.sin(p);              // -1 → left, +1 → right
    const bob   = Math.abs(Math.cos(p));    // up on the off-beats
    // slight random height variation each cycle
    const noiseHeight = hash(Math.floor(phase * 4)) * 0.12;

    const shiftLeft  = Math.max(0, -dir);
    const shiftRight = Math.max(0,  dir);

    return {
      root: { x: dir * 0.32 * intensity, y: (bob + noiseHeight) * 0.25 * intensity, scaleX: 1 + bob * 0.06, scaleY: 1 - bob * 0.04, rotation: dir * 0.06 * intensity },
      pelvis: { x: dir * 0.28 * intensity, y: 0, angle: dir * 0.2 * intensity },
      torso:  { angle: -dir * 0.12 * intensity, stretch: 1 },
      head:   { x: 0, y: 0, angle: dir * 0.08 * intensity },
      leftLeg: {
        hipAngle:   0.08 + shiftLeft  * 0.35 * intensity,
        kneeAngle:  0.08 + shiftLeft  * 0.4 * intensity + bob * 0.15,
        ankleAngle: -shiftLeft * 0.12,
      },
      rightLeg: {
        hipAngle:   0.08 + shiftRight * 0.35 * intensity,
        kneeAngle:  0.08 + shiftRight * 0.4 * intensity + bob * 0.15,
        ankleAngle: -shiftRight * 0.12,
      },
      leftArm: {
        shoulderAngle: 0.3 - dir * 0.4 * intensity,
        elbowAngle:    0.45 + Math.abs(dir) * 0.3,
        wristAngle:    dir * 0.12 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.3 + dir * 0.4 * intensity,
        elbowAngle:    0.45 + Math.abs(dir) * 0.3,
        wristAngle:    -dir * 0.12 * intensity,
      },
    };
  }

  /**
   * 24. LOCK GROOVE: Classic funk lock — alternate arm lock at 90°, weight-back strut.
   *     Feels like a funk-style point-and-lock sequence.
   */
  public static lockGroove(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    // Lock snaps on beat (sharp quantized feel)
    const lock = Math.sign(Math.sin(p)) * 0.5 + 0.5;  // 0 or 1
    const lockSmooth = Math.sin(p * 2) * 0.5 + 0.5;   // smooth version
    const swagger = Math.sin(p * 0.5);

    return {
      root: { x: swagger * 0.18 * intensity, y: lockSmooth * 0.22 * intensity, scaleX: 1, scaleY: 1, rotation: swagger * 0.06 * intensity },
      pelvis: { x: swagger * 0.28 * intensity, y: 0, angle: swagger * 0.18 * intensity },
      torso:  { angle: -swagger * 0.12 * intensity, stretch: 1 },
      head:   { x: Math.sin(p - 0.5) * 0.06 * intensity, y: 0, angle: swagger * 0.1 * intensity },
      // Left arm: locks upward on beat
      leftArm: {
        shoulderAngle: lock > 0.5
          ? 1.55 * intensity
          : 0.35,
        elbowAngle: lock > 0.5
          ? 1.55 * intensity
          : 0.5,
        wristAngle: (lock - 0.5) * 0.5 * intensity,
      },
      // Right arm: pointing down-side funk strut
      rightArm: {
        shoulderAngle: 0.6 + lockSmooth * 0.5 * intensity,
        elbowAngle:    0.3 + lockSmooth * 0.8 * intensity,
        wristAngle:    -lockSmooth * 0.3 * intensity,
      },
      leftLeg:  { hipAngle: 0.08 + lockSmooth * 0.25 * intensity, kneeAngle: 0.06 + lockSmooth * 0.2, ankleAngle: 0 },
      rightLeg: { hipAngle: 0.12 - lockSmooth * 0.15 * intensity, kneeAngle: 0.08, ankleAngle: 0 },
    };
  }

  /**
   * 25. WAVE ROLL: Full-body ripple from legs through torso to arms.
   *     Slow sinusoidal propagation up the body — great for slow R&B.
   */
  public static waveRoll(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    // Wave travels up the body — each segment lags the one below
    const legWave    = Math.sin(p);
    const pelvisWave = Math.sin(p - 0.4);
    const torsoWave  = Math.sin(p - 0.8);
    const armWave    = Math.sin(p - 1.2);
    const headWave   = Math.sin(p - 1.6);

    return {
      root: { x: pelvisWave * 0.1 * intensity, y: Math.abs(legWave) * 0.15 * intensity, scaleX: 1, scaleY: 1, rotation: torsoWave * 0.04 * intensity },
      pelvis: { x: pelvisWave * 0.3 * intensity, y: 0, angle: pelvisWave * 0.18 * intensity },
      torso:  { angle: torsoWave * 0.22 * intensity, stretch: 1 + Math.abs(torsoWave) * 0.04 * intensity },
      head:   { x: headWave * 0.08 * intensity, y: headWave * 0.06 * intensity, angle: headWave * 0.18 * intensity },
      leftArm: {
        shoulderAngle: 0.3 + armWave * 0.55 * intensity,
        elbowAngle:    0.4 + Math.sin(p - 1.5) * 0.4 * intensity,
        wristAngle:    Math.sin(p - 1.8) * 0.25 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.3 - armWave * 0.55 * intensity,
        elbowAngle:    0.4 - Math.sin(p - 1.5) * 0.4 * intensity,
        wristAngle:    -Math.sin(p - 1.8) * 0.25 * intensity,
      },
      leftLeg:  { hipAngle: 0.06 + Math.max(0,  legWave) * 0.25 * intensity, kneeAngle: 0.04 + Math.max(0,  legWave) * 0.2, ankleAngle: 0 },
      rightLeg: { hipAngle: 0.06 + Math.max(0, -legWave) * 0.25 * intensity, kneeAngle: 0.04 + Math.max(0, -legWave) * 0.2, ankleAngle: 0 },
    };
  }

  /**
   * 26. TWO STEP: Classic 2-step side-to-side with arm swing.
   *     Alternates weight every half-beat — quintessential country/swing feel.
   */
  public static twoStep(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    // Two full weight shifts per beat cycle
    const step = Math.sin(p * 2);
    const lift  = Math.abs(Math.cos(p * 2)) * 0.18 * intensity;

    return {
      root: { x: step * 0.3 * intensity, y: lift, scaleX: 1, scaleY: 1, rotation: step * 0.05 * intensity },
      pelvis: { x: step * 0.22 * intensity, y: 0, angle: step * 0.14 * intensity },
      torso:  { angle: -step * 0.1 * intensity, stretch: 1 },
      head:   { x: 0, y: 0, angle: step * 0.07 * intensity },
      leftArm: {
        shoulderAngle: 0.3 - step * 0.45 * intensity,
        elbowAngle:    0.45 + Math.abs(step) * 0.2,
        wristAngle:    -step * 0.1 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.3 + step * 0.45 * intensity,
        elbowAngle:    0.45 + Math.abs(step) * 0.2,
        wristAngle:    step * 0.1 * intensity,
      },
      leftLeg: {
        hipAngle:   0.06 + Math.max(0, -step) * 0.32 * intensity,
        kneeAngle:  0.04 + Math.max(0, -step) * 0.28 * intensity,
        ankleAngle: 0,
      },
      rightLeg: {
        hipAngle:   0.06 + Math.max(0,  step) * 0.32 * intensity,
        kneeAngle:  0.04 + Math.max(0,  step) * 0.28 * intensity,
        ankleAngle: 0,
      },
    };
  }

  /**
   * 27. CRISS CROSS: Feet cross and uncross while arms open and close.
   *     Gives a fast shuffly footwork impression.
   */
  public static crissCross(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const cross = Math.sin(p * 2); // fast crossover
    const open  = Math.cos(p * 2);
    const bob   = Math.abs(Math.sin(p)) * 0.14 * intensity;

    return {
      root: { x: 0, y: bob, scaleX: 1 + Math.abs(cross) * 0.05, scaleY: 1 - Math.abs(cross) * 0.03, rotation: cross * 0.04 * intensity },
      pelvis: { x: cross * 0.15 * intensity, y: 0, angle: cross * 0.12 * intensity },
      torso:  { angle: -cross * 0.08 * intensity, stretch: 1 },
      head:   { x: 0, y: 0, angle: -cross * 0.06 * intensity },
      leftArm: {
        shoulderAngle: 0.35 + open * 0.5 * intensity,
        elbowAngle:    0.5  + Math.abs(cross) * 0.3,
        wristAngle:    open * 0.15 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.35 - open * 0.5 * intensity,
        elbowAngle:    0.5  + Math.abs(cross) * 0.3,
        wristAngle:    -open * 0.15 * intensity,
      },
      leftLeg: {
        hipAngle:   0.08 + cross * 0.22 * intensity,
        kneeAngle:  0.06 + Math.abs(cross) * 0.18,
        ankleAngle: cross * 0.08 * intensity,
      },
      rightLeg: {
        hipAngle:   0.08 - cross * 0.22 * intensity,
        kneeAngle:  0.06 + Math.abs(cross) * 0.18,
        ankleAngle: -cross * 0.08 * intensity,
      },
    };
  }

  /**
   * 28. ARM SLASH: Sharp diagonal arm cuts — one arm slashes down while the other swings up.
   *     Fast and aggressive — great for EDM drops and high-energy moments.
   */
  public static armSlash(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    // Sharp asymmetric cuts — use power curve for attack feel
    const slash = Math.pow(Math.abs(Math.sin(p)), 0.4) * Math.sign(Math.sin(p));
    const body  = Math.sin(p) * 0.1 * intensity;

    return {
      root: { x: body * 0.8, y: Math.abs(body) * 0.5 + 0.05 * intensity, scaleX: 1, scaleY: 1, rotation: body * 0.08 },
      torso: { angle: slash * 0.2 * intensity, stretch: 1 },
      head:  { x: 0, y: 0, angle: -slash * 0.14 * intensity },
      leftArm: {
        shoulderAngle: 0.5  + slash * 1.1 * intensity,
        elbowAngle:    0.25 + Math.abs(slash) * 0.6 * intensity,
        wristAngle:    slash * 0.4 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.5  - slash * 1.1 * intensity,
        elbowAngle:    0.25 + Math.abs(slash) * 0.6 * intensity,
        wristAngle:    -slash * 0.4 * intensity,
      },
      leftLeg:  { hipAngle: 0.06 + Math.abs(slash) * 0.12 * intensity, kneeAngle: 0.04, ankleAngle: 0 },
      rightLeg: { hipAngle: 0.06 + Math.abs(slash) * 0.12 * intensity, kneeAngle: 0.04, ankleAngle: 0 },
    };
  }

  /**
   * 29. STOMP: Heavy single-leg stomp alternating each beat.
   *     Body drops on the stomp, springs back up. Very bass-forward feel.
   */
  public static stomp(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const leftStomp  = Math.max(0,  Math.sin(p));   // stomp on beat
    const rightStomp = Math.max(0, -Math.sin(p));   // stomp on off-beat
    const drop       = Math.max(leftStomp, rightStomp);

    return {
      root: {
        x: (leftStomp - rightStomp) * 0.12 * intensity,
        y: drop * 0.35 * intensity,
        scaleX: 1 + drop * 0.18,
        scaleY: 1 - drop * 0.14,
        rotation: (leftStomp - rightStomp) * 0.04 * intensity,
      },
      pelvis: { x: (leftStomp - rightStomp) * 0.18 * intensity, y: drop * 0.1, angle: (leftStomp - rightStomp) * 0.12 * intensity },
      torso:  { angle: drop * 0.08 * intensity, stretch: 1 - drop * 0.04 },
      head:   { x: 0, y: drop * 0.06, angle: 0 },
      leftLeg: {
        hipAngle:   0.08 + leftStomp  * 0.55 * intensity,
        kneeAngle:  0.06 + leftStomp  * 0.85 * intensity,
        ankleAngle: -leftStomp  * 0.28 * intensity,
      },
      rightLeg: {
        hipAngle:   0.08 + rightStomp * 0.55 * intensity,
        kneeAngle:  0.06 + rightStomp * 0.85 * intensity,
        ankleAngle: -rightStomp * 0.28 * intensity,
      },
      leftArm: {
        shoulderAngle: 0.35 + leftStomp  * 0.35 * intensity,
        elbowAngle:    0.5  + leftStomp  * 0.4 * intensity,
        wristAngle:    0,
      },
      rightArm: {
        shoulderAngle: 0.35 + rightStomp * 0.35 * intensity,
        elbowAngle:    0.5  + rightStomp * 0.4 * intensity,
        wristAngle:    0,
      },
    };
  }

  /**
   * 30. GROOVE PULSE: Subtle whole-body throb synced to the beat.
   *     Low-key, perpetual motion — ideal as a counter-layer for slow songs.
   *     Keeps Dolly alive without overpowering the primary move.
   */
  public static groovePulse(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const pulse = Math.sin(p);
    const micro = Math.sin(p * 3) * 0.25; // higher-harmonic flutter

    return {
      root: { x: micro * 0.04 * intensity, y: Math.abs(pulse) * 0.12 * intensity, scaleX: 1 + Math.abs(pulse) * 0.06, scaleY: 1 - Math.abs(pulse) * 0.04, rotation: micro * 0.02 * intensity },
      pelvis: { x: pulse * 0.12 * intensity, y: 0, angle: pulse * 0.08 * intensity },
      torso:  { angle: -pulse * 0.06 * intensity, stretch: 1 + Math.abs(pulse) * 0.02 },
      head:   { x: micro * 0.03 * intensity, y: Math.abs(pulse) * 0.04 * intensity, angle: pulse * 0.06 * intensity },
      leftArm: {
        shoulderAngle: 0.2  + pulse * 0.15 * intensity,
        elbowAngle:    0.28 + Math.abs(pulse) * 0.12 * intensity,
        wristAngle:    micro * 0.08 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.2  - pulse * 0.15 * intensity,
        elbowAngle:    0.28 + Math.abs(pulse) * 0.12 * intensity,
        wristAngle:    -micro * 0.08 * intensity,
      },
      leftLeg:  { hipAngle: 0.05 + Math.abs(pulse) * 0.06 * intensity, kneeAngle: 0.04, ankleAngle: 0 },
      rightLeg: { hipAngle: 0.05 + Math.abs(pulse) * 0.06 * intensity, kneeAngle: 0.04, ankleAngle: 0 },
    };
  }

  /**
   * 31. BBOY FREEZE: B-boy one-arm freeze balance pose — body tips sideways,
   *     one arm supports weight, legs kicked up. Sharp and athletic.
   */
  public static bboyFreeze(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    // Oscillates between upright and the freeze position
    const freeze = Math.max(0, Math.sin(p)) * intensity;
    const antiFreeze = 1 - freeze;

    return {
      root: {
        x: freeze * 0.25,
        y: freeze * 0.1,
        scaleX: 1 - freeze * 0.05,
        scaleY: 1 + freeze * 0.05,
        rotation: -freeze * 0.35,
      },
      torso:  { angle: -freeze * 0.4, stretch: 1 + freeze * 0.06 },
      pelvis: { x: freeze * 0.3, y: -freeze * 0.1, angle: freeze * 0.3 },
      head:   { x: freeze * 0.1, y: -freeze * 0.06, angle: freeze * 0.2 },
      // Support arm — fully extended down-side
      leftArm: {
        shoulderAngle: 0.2 + freeze * 1.4,
        elbowAngle: 0.1 + freeze * 0.3,
        wristAngle: -freeze * 0.3,
      },
      // Free arm — kicked up dramatically
      rightArm: {
        shoulderAngle: antiFreeze * 0.25 + freeze * 2.0,
        elbowAngle: 0.4 + freeze * 0.6,
        wristAngle: freeze * 0.4,
      },
      // Legs kick up for balance
      leftLeg:  { hipAngle: -freeze * 0.45, kneeAngle: freeze * 0.6, ankleAngle: 0 },
      rightLeg: { hipAngle: -freeze * 0.7, kneeAngle: freeze * 0.9, ankleAngle: 0 },
    };
  }

  /**
   * 32. WINDMILL SPIN: B-boy windmill — body rotation illusion with alternating
   *     arm sweeps. Uses scaleX cosine trick for 2D 3D spin effect.
   */
  public static windmillSpin(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 4; // double speed
    const spin  = Math.cos(p);
    const sweep = Math.sin(p);
    const drop  = Math.abs(Math.sin(p * 0.5)) * 0.3 * intensity;

    return {
      root: { x: sweep * 0.15 * intensity, y: drop, scaleX: spin, scaleY: 1 + drop * 0.15, rotation: sweep * 0.12 },
      torso: { angle: sweep * 0.25 * intensity, stretch: 1 },
      head:  { x: 0, y: 0, angle: sweep * 0.15 * intensity },
      // Arms sweep wide in alternating circles
      leftArm: {
        shoulderAngle: 1.0 + Math.sin(p + 0.5) * 1.2 * intensity,
        elbowAngle: 0.4 + Math.cos(p) * 0.4 * intensity,
        wristAngle: Math.sin(p + 1.0) * 0.4,
      },
      rightArm: {
        shoulderAngle: 1.0 + Math.sin(p - 0.5) * 1.2 * intensity,
        elbowAngle: 0.4 + Math.cos(p + Math.PI) * 0.4 * intensity,
        wristAngle: Math.sin(p - 1.0) * 0.4,
      },
      leftLeg:  { hipAngle: Math.max(0, Math.sin(p)) * 0.6 * intensity, kneeAngle: 0.3, ankleAngle: 0 },
      rightLeg: { hipAngle: Math.max(0, -Math.sin(p)) * 0.6 * intensity, kneeAngle: 0.3, ankleAngle: 0 },
    };
  }

  /**
   * 33. WORM WAVE: Ground-level body wave rolling from feet to head.
   *     Body drops low, then peristaltic wave travels upward.
   */
  public static wormWave(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    // Wave travels bottom-to-top with delay chain
    const base   = Math.sin(p) * intensity;
    const mid    = Math.sin(p - 0.6) * intensity;
    const top    = Math.sin(p - 1.2) * intensity;
    const peak   = Math.sin(p - 1.8) * intensity;

    return {
      root:   { x: 0, y: Math.max(0, base) * 0.45, scaleX: 1 + Math.abs(base) * 0.12, scaleY: 1 - Math.abs(base) * 0.1, rotation: mid * 0.06 },
      pelvis: { x: base * 0.18, y: 0, angle: base * 0.2 },
      torso:  { angle: mid * 0.28, stretch: 1 + Math.abs(mid) * 0.05 },
      head:   { x: peak * 0.1, y: peak * 0.08, angle: peak * 0.22 },
      leftArm: {
        shoulderAngle: 0.25 + top * 0.4 * intensity,
        elbowAngle: 0.3 + Math.abs(top) * 0.35,
        wristAngle: peak * 0.25,
      },
      rightArm: {
        shoulderAngle: 0.25 - top * 0.4 * intensity,
        elbowAngle: 0.3 + Math.abs(top) * 0.35,
        wristAngle: -peak * 0.25,
      },
      leftLeg:  { hipAngle: 0.06 + Math.abs(base) * 0.35 * intensity, kneeAngle: Math.abs(base) * 0.55, ankleAngle: -Math.abs(base) * 0.2 },
      rightLeg: { hipAngle: 0.06 + Math.abs(base) * 0.35 * intensity, kneeAngle: Math.abs(base) * 0.55, ankleAngle: -Math.abs(base) * 0.2 },
    };
  }

  /**
   * 34. MOONWALK: Iconic backward sliding step illusion.
   *     Alternating heel-lift while body glides backward.
   */
  public static moonwalk(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const slide  = Math.sin(p * 2);          // 2 slides per beat
    const glide  = Math.cos(p);
    const lean   = -0.08 * intensity;        // slight backward lean always

    return {
      root: { x: glide * 0.06 * intensity, y: Math.abs(slide) * 0.08 * intensity, scaleX: 1, scaleY: 1, rotation: lean },
      pelvis: { x: slide * 0.12 * intensity, y: 0, angle: slide * 0.1 * intensity },
      torso:  { angle: lean * 0.6, stretch: 1 },
      head:   { x: 0, y: 0, angle: -lean * 0.4 },
      // Arms hang cool at sides with slight swagger
      leftArm: {
        shoulderAngle: 0.2 + slide * 0.15 * intensity,
        elbowAngle: 0.3 + Math.abs(glide) * 0.1,
        wristAngle: slide * 0.08 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.2 - slide * 0.15 * intensity,
        elbowAngle: 0.3 + Math.abs(glide) * 0.1,
        wristAngle: -slide * 0.08 * intensity,
      },
      // Alternating heel raise — left up while right is flat
      leftLeg: {
        hipAngle: 0.06 + Math.max(0,  slide) * 0.12 * intensity,
        kneeAngle: 0.04 + Math.max(0,  slide) * 0.22 * intensity,
        ankleAngle: Math.max(0,  slide) * 0.18 * intensity,
      },
      rightLeg: {
        hipAngle: 0.06 + Math.max(0, -slide) * 0.12 * intensity,
        kneeAngle: 0.04 + Math.max(0, -slide) * 0.22 * intensity,
        ankleAngle: Math.max(0, -slide) * 0.18 * intensity,
      },
    };
  }

  /**
   * 35. FLOSS: The viral floss dance — alternating hip swings with opposing arm sweeps.
   *     Hips go one way, arms the other. Fast and rhythmic.
   */
  public static floss(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 4; // double tempo — floss is fast
    const swing  = Math.sin(p);
    const bob    = Math.abs(Math.cos(p)) * 0.12 * intensity;

    return {
      root: { x: swing * 0.2 * intensity, y: bob, scaleX: 1, scaleY: 1, rotation: swing * 0.04 },
      pelvis: { x: swing * 0.32 * intensity, y: 0, angle: swing * 0.22 * intensity },
      torso:  { angle: -swing * 0.16 * intensity, stretch: 1 },
      head:   { x: -swing * 0.05 * intensity, y: 0, angle: -swing * 0.08 },
      // Arms swing OPPOSITE to hips — both arms go the same direction
      leftArm: {
        shoulderAngle: 0.35 - swing * 0.7 * intensity,
        elbowAngle:    0.8  - swing * 0.4 * intensity,
        wristAngle:    -swing * 0.25 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.35 - swing * 0.7 * intensity,
        elbowAngle:    0.8  - swing * 0.4 * intensity,
        wristAngle:    -swing * 0.25 * intensity,
      },
      leftLeg:  { hipAngle: 0.08, kneeAngle: 0.06 + bob * 0.3, ankleAngle: 0 },
      rightLeg: { hipAngle: 0.08, kneeAngle: 0.06 + bob * 0.3, ankleAngle: 0 },
    };
  }

  /**
   * 36. DAB: The iconic dab — one arm shoots diagonal-up, head drops into elbow crook.
   *     Sharp on the beat, relaxed on the off-beat.
   */
  public static dab(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const hit = Math.max(0, Math.pow(Math.sin(p), 2)) * intensity;
    const side = Math.sign(Math.sin(p * 0.5 + 0.1)); // alternates L/R each cycle

    return {
      root: { x: hit * side * 0.08, y: hit * 0.06, scaleX: 1 + hit * 0.04, scaleY: 1 - hit * 0.03, rotation: -hit * side * 0.12 },
      torso: { angle: -hit * side * 0.2 * intensity, stretch: 1 },
      head:  { x: hit * side * 0.08, y: hit * 0.12, angle: -hit * side * 0.35 * intensity },
      // Dab arm — shoots up diagonal on the dab side
      leftArm: {
        shoulderAngle: side > 0 ? 0.25 + hit * 0.1 : 0.35 + hit * 1.55 * intensity,
        elbowAngle:    side > 0 ? 0.3  + hit * 0.1 : 0.45 + hit * 0.8  * intensity,
        wristAngle:    side > 0 ? 0    : hit * 0.2,
      },
      rightArm: {
        shoulderAngle: side > 0 ? 0.35 + hit * 1.55 * intensity : 0.25 + hit * 0.1,
        elbowAngle:    side > 0 ? 0.45 + hit * 0.8  * intensity : 0.3  + hit * 0.1,
        wristAngle:    side > 0 ? hit * 0.2 : 0,
      },
      leftLeg:  { hipAngle: 0.06 + hit * 0.06, kneeAngle: 0.04 + hit * 0.05, ankleAngle: 0 },
      rightLeg: { hipAngle: 0.06 + hit * 0.06, kneeAngle: 0.04 + hit * 0.05, ankleAngle: 0 },
    };
  }

  /**
   * 37. TWERK BOUNCE: Fast rhythmic hip drop-and-pop with deep knee bend.
   *     Very bass-forward — body stays low, hips pop on every beat.
   */
  public static twerkBounce(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 4; // double tempo
    const pop    = Math.max(0, Math.sin(p)) * intensity;
    const sway   = Math.sin(p * 0.5) * 0.3 * intensity;

    return {
      root: { x: sway * 0.1, y: 0.2 * intensity + pop * 0.25, scaleX: 1 + pop * 0.15, scaleY: 1 - pop * 0.12, rotation: sway * 0.03 },
      pelvis: { x: sway * 0.2, y: pop * 0.18, angle: sway * 0.25 + pop * 0.15 },
      torso: { angle: -0.12 * intensity + sway * 0.08, stretch: 1 - pop * 0.06 },
      head:  { x: 0, y: 0, angle: -sway * 0.06 },
      leftArm:  { shoulderAngle: 0.55 + sway * 0.2, elbowAngle: 0.75 + pop * 0.2, wristAngle: 0 },
      rightArm: { shoulderAngle: 0.55 - sway * 0.2, elbowAngle: 0.75 + pop * 0.2, wristAngle: 0 },
      leftLeg:  { hipAngle: 0.35 * intensity + pop * 0.3, kneeAngle: 0.55 * intensity + pop * 0.4, ankleAngle: -pop * 0.18 },
      rightLeg: { hipAngle: 0.35 * intensity + pop * 0.3, kneeAngle: 0.55 * intensity + pop * 0.4, ankleAngle: -pop * 0.18 },
    };
  }

  /**
   * 38. ARABESQUE: Classical ballet arabesque — one leg extended back, arms spread gracefully.
   *     Elegant and held, great for slow/classical music.
   */
  public static arabesque(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const extend = Math.max(0, Math.sin(p)) * intensity;
    const breathe = Math.sin(p * 2) * 0.015;

    return {
      root: { x: 0, y: extend * 0.05 + breathe, scaleX: 1, scaleY: 1 + breathe, rotation: extend * 0.06 },
      pelvis: { x: extend * 0.1, y: 0, angle: extend * 0.12 },
      torso:  { angle: extend * 0.1, stretch: 1 + breathe },
      head:   { x: 0, y: -extend * 0.05, angle: extend * 0.08 },
      // Arms spread wide and graceful — classical port de bras
      leftArm: {
        shoulderAngle: 0.5 + extend * 0.9 * intensity,
        elbowAngle:    0.25 + extend * 0.1,
        wristAngle:    extend * 0.15,
      },
      rightArm: {
        shoulderAngle: 0.5 + extend * 1.3 * intensity,
        elbowAngle:    0.2,
        wristAngle:    -extend * 0.1,
      },
      // Standing leg: straight and planted
      leftLeg:  { hipAngle: 0.04 + breathe * 2, kneeAngle: 0.03, ankleAngle: 0 },
      // Arabesque leg: extended back and up
      rightLeg: { hipAngle: -extend * 0.55 * intensity, kneeAngle: extend * 0.15, ankleAngle: extend * 0.1 },
    };
  }

  /**
   * 39. BALLET RELEVE: Rising onto tiptoe with arms in graceful fifth position overhead.
   *     Body elongates, head lifts, arms form a soft oval above.
   */
  public static balletReleve(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const rise = Math.max(0, Math.sin(p)) * intensity;
    const breathe = Math.sin(p * 3) * 0.01;

    return {
      root: { x: 0, y: -(rise * 0.18), scaleX: 1 - rise * 0.04, scaleY: 1 + rise * 0.08 + breathe, rotation: 0 },
      torso: { angle: breathe * 2, stretch: 1 + rise * 0.06 },
      head:  { x: 0, y: -(rise * 0.06), angle: -(rise * 0.1) },
      pelvis: { x: 0, y: 0, angle: 0 },
      // Fifth position — arms form a graceful oval crown
      leftArm: {
        shoulderAngle: 1.4 + rise * 0.5 * intensity,
        elbowAngle:    0.6 - rise * 0.2,
        wristAngle:    rise * 0.1,
      },
      rightArm: {
        shoulderAngle: 1.4 + rise * 0.5 * intensity,
        elbowAngle:    0.6 - rise * 0.2,
        wristAngle:    -rise * 0.1,
      },
      // Rising onto tiptoe — ankles extend
      leftLeg:  { hipAngle: 0.04, kneeAngle: 0.02, ankleAngle: rise * 0.25 * intensity },
      rightLeg: { hipAngle: 0.04, kneeAngle: 0.02, ankleAngle: rise * 0.25 * intensity },
    };
  }

  /**
   * 40. TUTTING: Sharp angular arm geometry — elbows locked at 90°, wrists snap to positions.
   *     Mechanical precision, every beat a new box shape.
   */
  public static tutting(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    // Snap to discrete angular positions (quantized)
    const snap4 = Math.round(Math.sin(p) * 2) / 2;    // 4-position snap
    const snap2 = Math.round(Math.cos(p) * 2) / 2;

    return {
      root: { x: snap4 * 0.04 * intensity, y: Math.abs(snap4) * 0.06 * intensity, scaleX: 1, scaleY: 1, rotation: snap4 * 0.02 },
      torso: { angle: snap2 * 0.1 * intensity, stretch: 1 },
      head:  { x: snap2 * 0.06 * intensity, y: 0, angle: -snap4 * 0.12 * intensity },
      // Angular box shapes — elbows always near 90° (PI/2 ≈ 1.57)
      leftArm: {
        shoulderAngle: 0.8 + snap4 * 0.7 * intensity,
        elbowAngle:    1.55,                           // locked 90°
        wristAngle:    snap2 * 0.5 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.8 - snap2 * 0.7 * intensity,
        elbowAngle:    1.55,
        wristAngle:    snap4 * 0.5 * intensity,
      },
      leftLeg:  { hipAngle: 0.05 + Math.abs(snap4) * 0.08 * intensity, kneeAngle: 0.04, ankleAngle: 0 },
      rightLeg: { hipAngle: 0.05 + Math.abs(snap2) * 0.08 * intensity, kneeAngle: 0.04, ankleAngle: 0 },
    };
  }

  /**
   * 41. MATRIX LEAN: Slow-motion bullet-dodge lean — body tilts backward dramatically
   *     while legs stay planted. Great for drops.
   */
  public static matrixLean(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const lean = Math.sin(p) * intensity;
    const leanBack = Math.max(0, lean);

    return {
      root: { x: 0, y: leanBack * 0.28, scaleX: 1 + leanBack * 0.06, scaleY: 1 - leanBack * 0.08, rotation: -leanBack * 0.42 * intensity },
      torso: { angle: -leanBack * 0.35 * intensity, stretch: 1 + leanBack * 0.05 },
      head:  { x: 0, y: -leanBack * 0.1, angle: leanBack * 0.3 * intensity },
      pelvis: { x: 0, y: leanBack * 0.12, angle: leanBack * 0.15 },
      // Arms drift backward naturally with the lean
      leftArm: {
        shoulderAngle: 0.3 + leanBack * 0.5 * intensity,
        elbowAngle:    0.4 + leanBack * 0.4,
        wristAngle:    leanBack * 0.2,
      },
      rightArm: {
        shoulderAngle: 0.3 + leanBack * 0.5 * intensity,
        elbowAngle:    0.4 + leanBack * 0.4,
        wristAngle:    -leanBack * 0.2,
      },
      // Legs bend forward to keep balance during lean
      leftLeg:  { hipAngle: 0.08 + leanBack * 0.4 * intensity, kneeAngle: 0.06 + leanBack * 0.6, ankleAngle: -leanBack * 0.2 },
      rightLeg: { hipAngle: 0.08 + leanBack * 0.4 * intensity, kneeAngle: 0.06 + leanBack * 0.6, ankleAngle: -leanBack * 0.2 },
    };
  }

  /**
   * 42. POWER SLIDE: Sideways sliding step with one leg straight out — James Brown / MJ style.
   *     Weight shifts side-to-side with a gliding foot extension.
   */
  public static powerSlide(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const dir    = Math.sin(p);
    const extend = Math.abs(dir);
    const bob    = Math.abs(Math.cos(p * 2)) * 0.1 * intensity;

    return {
      root: { x: dir * 0.38 * intensity, y: bob, scaleX: 1, scaleY: 1, rotation: dir * 0.07 },
      pelvis: { x: dir * 0.28 * intensity, y: 0, angle: dir * 0.18 * intensity },
      torso:  { angle: -dir * 0.15 * intensity, stretch: 1 },
      head:   { x: 0, y: 0, angle: dir * 0.1 * intensity },
      leftArm: {
        shoulderAngle: dir > 0 ? 0.3 + extend * 0.8 * intensity : 0.35,
        elbowAngle:    dir > 0 ? 0.5 + extend * 0.5 : 0.45,
        wristAngle:    dir > 0 ? extend * 0.2 : 0,
      },
      rightArm: {
        shoulderAngle: dir < 0 ? 0.3 + extend * 0.8 * intensity : 0.35,
        elbowAngle:    dir < 0 ? 0.5 + extend * 0.5 : 0.45,
        wristAngle:    dir < 0 ? -extend * 0.2 : 0,
      },
      // Slide leg extends out straight, planted leg bends deep
      leftLeg: {
        hipAngle:   dir > 0 ? extend * 0.5 * intensity : -extend * 0.15,
        kneeAngle:  dir > 0 ? extend * 0.55 * intensity : 0.04,
        ankleAngle: dir > 0 ? -extend * 0.15 : 0,
      },
      rightLeg: {
        hipAngle:   dir < 0 ? extend * 0.5 * intensity : -extend * 0.15,
        kneeAngle:  dir < 0 ? extend * 0.55 * intensity : 0.04,
        ankleAngle: dir < 0 ? -extend * 0.15 : 0,
      },
    };
  }

  public static getMovementPose(type: MovementType, phase: number, intensity: number = 1.0): Partial<DollPose> {
    switch (type) {
      case 'head bob':        return this.headBob(phase, intensity);
      case 'body bounce':     return this.bodyBounce(phase, intensity);
      case 'shoulder bounce': return this.shoulderBounce(phase, intensity);
      case 'left arm wave':   return this.leftArmWave(phase, intensity);
      case 'right arm wave':  return this.rightArmWave(phase, intensity);
      case 'both arms up':    return this.bothArmsUp(phase, intensity);
      case 'left step':       return this.leftStep(phase, intensity);
      case 'right step':      return this.rightStep(phase, intensity);
      case 'forward step':    return this.forwardStep(phase, intensity);
      case 'backward step':   return this.backwardStep(phase, intensity);
      case 'hip sway':        return this.hipSway(phase, intensity);
      case 'squat':           return this.squat(phase, intensity);
      case 'jump':            return this.jump(phase, intensity);
      case 'spin':            return this.spin(phase, intensity);
      case 'side groove':     return this.sideGroove(phase, intensity);
      case 'hands on hips':   return this.handsOnHips(phase, intensity);
      case 'final pose':      return this.finalPose(phase, intensity);
      case 'running man':     return this.runningMan(phase, intensity);
      case 'robot chop':      return this.robotChop(phase, intensity);
      case 'chest pop':       return this.chestPop(phase, intensity);
      case 'windmill arms':   return this.windmillArms(phase, intensity);
      case 'bounce step':     return this.bounceStep(phase, intensity);
      case 'lock groove':     return this.lockGroove(phase, intensity);
      case 'wave roll':       return this.waveRoll(phase, intensity);
      case 'two step':        return this.twoStep(phase, intensity);
      case 'criss cross':     return this.crissCross(phase, intensity);
      case 'arm slash':       return this.armSlash(phase, intensity);
      case 'stomp':           return this.stomp(phase, intensity);
      case 'groove pulse':    return this.groovePulse(phase, intensity);
      case 'bboy freeze':     return this.bboyFreeze(phase, intensity);
      case 'windmill spin':   return this.windmillSpin(phase, intensity);
      case 'worm wave':       return this.wormWave(phase, intensity);
      case 'moonwalk':        return this.moonwalk(phase, intensity);
      case 'floss':           return this.floss(phase, intensity);
      case 'dab':             return this.dab(phase, intensity);
      case 'twerk bounce':    return this.twerkBounce(phase, intensity);
      case 'arabesque':       return this.arabesque(phase, intensity);
      case 'ballet releve':   return this.balletReleve(phase, intensity);
      case 'tutting':         return this.tutting(phase, intensity);
      case 'matrix lean':     return this.matrixLean(phase, intensity);
      case 'power slide':     return this.powerSlide(phase, intensity);
      case 'idle':
      default:
        return this.idle(phase, intensity);
    }
  }
}
