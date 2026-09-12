/**
 * Internal Rig and Pose Types for Dolly.
 * 
 * The rig has 17 internal joints used for forward kinematics.
 * All rig lines/points are strictly INVISIBLE in production rendering.
 */

export interface JointTransform {
  x: number;
  y: number;
  angle: number; // in radians
}

export interface DollPose {
  // Global body root
  root: {
    x: number; // -1 to 1 normalized horizontal displacement
    y: number; // -1 to 1 normalized vertical bounce/jump
    scaleX: number; // 0.8 to 1.2 squash/stretch or horizontal flip for spins
    scaleY: number; // 0.8 to 1.2 squash/stretch
    rotation: number; // overall body lean in radians
  };

  // Pelvis / Hips
  pelvis: {
    x: number; // hip sway
    y: number;
    angle: number; // pelvic tilt
  };

  // Torso
  torso: {
    angle: number; // spine curve in radians
    stretch: number; // 0.8 to 1.2
  };

  // Head (Faceless round sphere)
  head: {
    x: number;
    y: number;
    angle: number; // head tilt / nod in radians
  };

  // Left Arm (upper-arm, forearm, hand)
  leftArm: {
    shoulderAngle: number; // relative to torso (radians)
    elbowAngle: number;    // relative to upper arm (radians)
    wristAngle: number;    // relative to forearm (radians)
  };

  // Right Arm
  rightArm: {
    shoulderAngle: number;
    elbowAngle: number;
    wristAngle: number;
  };

  // Left Leg (thigh, shin, foot)
  leftLeg: {
    hipAngle: number;   // relative to pelvis (radians)
    kneeAngle: number;  // relative to thigh (radians)
    ankleAngle: number; // relative to shin (radians)
  };

  // Right Leg
  rightLeg: {
    hipAngle: number;
    kneeAngle: number;
    ankleAngle: number;
  };
}

/**
 * 17 Hidden Rig Landmark Positions computed via Forward Kinematics.
 * Used exclusively for generating organic continuous body contours.
 */
export interface RigLandmarks {
  root: { x: number; y: number };
  pelvis: { x: number; y: number };
  torso: { x: number; y: number };
  neck: { x: number; y: number };
  head: { x: number; y: number; radius: number };

  leftShoulder: { x: number; y: number };
  leftElbow: { x: number; y: number };
  leftWrist: { x: number; y: number };
  leftHand: { x: number; y: number };

  rightShoulder: { x: number; y: number };
  rightElbow: { x: number; y: number };
  rightWrist: { x: number; y: number };
  rightHand: { x: number; y: number };

  leftHip: { x: number; y: number };
  leftKnee: { x: number; y: number };
  leftAnkle: { x: number; y: number };
  leftFoot: { x: number; y: number };

  rightHip: { x: number; y: number };
  rightKnee: { x: number; y: number };
  rightAnkle: { x: number; y: number };
  rightFoot: { x: number; y: number };
}

export type MovementType =
  | 'idle'
  | 'head bob'
  | 'body bounce'
  | 'shoulder bounce'
  | 'left arm wave'
  | 'right arm wave'
  | 'both arms up'
  | 'left step'
  | 'right step'
  | 'forward step'
  | 'backward step'
  | 'hip sway'
  | 'squat'
  | 'jump'
  | 'spin'
  | 'side groove'
  | 'hands on hips'
  | 'final pose'
  | 'running man'
  | 'robot chop'
  | 'chest pop'
  | 'windmill arms'
  | 'bounce step'
  | 'lock groove'
  | 'wave roll'
  | 'two step'
  | 'criss cross'
  | 'arm slash'
  | 'stomp'
  | 'groove pulse'
  | 'bboy freeze'
  | 'windmill spin'
  | 'worm wave'
  | 'moonwalk'
  | 'floss'
  | 'dab'
  | 'twerk bounce'
  | 'arabesque'
  | 'ballet releve'
  | 'tutting'
  | 'matrix lean'
  | 'power slide';
