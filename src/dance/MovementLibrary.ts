import { DollPose, MovementType } from '../types/pose';

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
   * 3. BODY BOUNCE: Downward compression on the beat with knee flexion and volume-preserving squash
   */
  public static bodyBounce(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    // Downward compression peak at phase 0.0 / 1.0
    const bounce = Math.cos(p);
    const compression = Math.max(0, bounce) * 0.32 * intensity; // Downward dip

    return {
      root: {
        x: 0,
        y: compression * 0.65, // Lower center of gravity
        scaleX: 1 + compression * 0.22, // Fleshy lateral squash
        scaleY: 1 - compression * 0.18, // Vertical compression
        rotation: 0,
      },
      pelvis: {
        x: 0,
        y: compression * 0.15,
        angle: 0,
      },
      torso: {
        angle: compression * 0.05,
        stretch: 1 - compression * 0.1,
      },
      leftLeg: {
        hipAngle: 0.08 + compression * 0.45,
        kneeAngle: 0.08 + compression * 0.75, // Knees bend to absorb weight
        ankleAngle: -compression * 0.2,
      },
      rightLeg: {
        hipAngle: 0.08 + compression * 0.45,
        kneeAngle: 0.08 + compression * 0.75,
        ankleAngle: -compression * 0.2,
      },
      leftArm: {
        shoulderAngle: 0.25 + compression * 0.25, // Arms swing slightly out on squash
        elbowAngle: 0.35 + compression * 0.3,
        wristAngle: -compression * 0.15,
      },
      rightArm: {
        shoulderAngle: 0.25 + compression * 0.25,
        elbowAngle: 0.35 + compression * 0.3,
        wristAngle: -compression * 0.15,
      },
      head: {
        x: 0,
        y: compression * 0.1,
        angle: Math.sin(p - 0.3) * 0.12 * intensity, // Head follow-through lag
      },
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
   * 12. HIP SWAY: Fluid rhythmic pelvis sway with organic S-curve spine balance
   */
  public static hipSway(phase: number, intensity: number = 1.0): Partial<DollPose> {
    const p = phase * Math.PI * 2;
    const sway = Math.sin(p);
    const swayArm = Math.sin(p - 0.25); // Arms swing with pendulum delay

    return {
      pelvis: {
        x: sway * 0.52 * intensity,
        y: Math.abs(Math.cos(p)) * 0.08 * intensity,
        angle: sway * 0.24 * intensity,
      },
      root: {
        x: sway * 0.18 * intensity,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: -sway * 0.06 * intensity,
      },
      torso: {
        angle: -sway * 0.18 * intensity, // S-curve counter-tilt
        stretch: 1,
      },
      head: {
        x: -sway * 0.06 * intensity,
        y: 0,
        angle: sway * 0.14 * intensity, // Head stays level
      },
      leftArm: {
        shoulderAngle: 0.28 + swayArm * 0.35 * intensity,
        elbowAngle: 0.35 + Math.abs(sway) * 0.2 * intensity,
        wristAngle: swayArm * 0.15 * intensity,
      },
      rightArm: {
        shoulderAngle: 0.28 - swayArm * 0.35 * intensity,
        elbowAngle: 0.35 + Math.abs(sway) * 0.2 * intensity,
        wristAngle: -swayArm * 0.15 * intensity,
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

  /**
   * Dispatcher helper by movement name
   */
  public static getMovementPose(type: MovementType, phase: number, intensity: number = 1.0): Partial<DollPose> {
    switch (type) {
      case 'head bob': return this.headBob(phase, intensity);
      case 'body bounce': return this.bodyBounce(phase, intensity);
      case 'shoulder bounce': return this.shoulderBounce(phase, intensity);
      case 'left arm wave': return this.leftArmWave(phase, intensity);
      case 'right arm wave': return this.rightArmWave(phase, intensity);
      case 'both arms up': return this.bothArmsUp(phase, intensity);
      case 'left step': return this.leftStep(phase, intensity);
      case 'right step': return this.rightStep(phase, intensity);
      case 'forward step': return this.forwardStep(phase, intensity);
      case 'backward step': return this.backwardStep(phase, intensity);
      case 'hip sway': return this.hipSway(phase, intensity);
      case 'squat': return this.squat(phase, intensity);
      case 'jump': return this.jump(phase, intensity);
      case 'spin': return this.spin(phase, intensity);
      case 'side groove': return this.sideGroove(phase, intensity);
      case 'hands on hips': return this.handsOnHips(phase, intensity);
      case 'final pose': return this.finalPose(phase, intensity);
      case 'idle':
      default:
        return this.idle(phase, intensity);
    }
  }
}
