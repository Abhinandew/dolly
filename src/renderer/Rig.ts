import { DollPose, RigLandmarks } from '../types/pose';

/**
 * High-performance Forward Kinematics solver for Dolly's 17 internal joints.
 * 
 * POLISHED:
 * - Cute, plump, friendly proportions (pear-shaped torso, stable grounded stance).
 * - Anatomically natural joint angles preventing hyperextension or backward bends.
 * - Zero heap allocations via pre-allocated static landmarks buffer.
 */
export class RigSolver {
  private static landmarksBuffer: RigLandmarks = {
    root: { x: 0, y: 0 },
    pelvis: { x: 0, y: 0 },
    torso: { x: 0, y: 0 },
    neck: { x: 0, y: 0 },
    head: { x: 0, y: 0, radius: 40 },

    leftShoulder: { x: 0, y: 0 },
    leftElbow: { x: 0, y: 0 },
    leftWrist: { x: 0, y: 0 },
    leftHand: { x: 0, y: 0 },

    rightShoulder: { x: 0, y: 0 },
    rightElbow: { x: 0, y: 0 },
    rightWrist: { x: 0, y: 0 },
    rightHand: { x: 0, y: 0 },

    leftHip: { x: 0, y: 0 },
    leftKnee: { x: 0, y: 0 },
    leftAnkle: { x: 0, y: 0 },
    leftFoot: { x: 0, y: 0 },

    rightHip: { x: 0, y: 0 },
    rightKnee: { x: 0, y: 0 },
    rightAnkle: { x: 0, y: 0 },
    rightFoot: { x: 0, y: 0 },
  };

  /**
   * Helper to clamp joint angles to believable anatomical ranges
   */
  private static clamp(val: number, min: number, max: number): number {
    return val < min ? min : val > max ? max : val;
  }

  /**
   * Solve all 17 joint landmarks from a DollPose for a given canvas viewport.
   * Zero heap allocations.
   */
  public static solve(
    pose: DollPose,
    centerX: number,
    centerY: number,
    baseScale: number = 1.0,
    chubbiness: number = 1.0,
    out: RigLandmarks = RigSolver.landmarksBuffer
  ): RigLandmarks {
    const s = baseScale;

    // Refined cute, bulky, friendly proportions
    const torsoLength = 104 * s;
    const neckLength = 20 * s;
    const headRadius = (39 * chubbiness) * s;

    const shoulderHalfWidth = (40 * chubbiness) * s;
    const upperArmLength = 52 * s;
    const forearmLength = 48 * s;
    const handLength = 18 * s;

    // Stable, grounded pelvis and legs
    const hipHalfWidth = (32 * chubbiness) * s;
    const thighLength = 62 * s;
    const shinLength = 58 * s;
    const footLength = 22 * s;

    // 1. Root and Pelvis
    const rootX = centerX + pose.root.x * 60 * s;
    const rootY = centerY + pose.root.y * 70 * s;
    out.root.x = rootX;
    out.root.y = rootY;

    // Pelvic position with weight shift
    const pelvisX = rootX + pose.pelvis.x * 28 * s;
    const pelvisY = rootY + pose.pelvis.y * 22 * s;
    out.pelvis.x = pelvisX;
    out.pelvis.y = pelvisY;
    const pelvisAngle = pose.root.rotation + pose.pelvis.angle;

    // 2. Spine & Torso & Neck
    const spineAngle = pelvisAngle + pose.torso.angle;
    const effectiveTorsoLength = torsoLength * (pose.torso.stretch || 1.0);

    // Torso center of mass
    out.torso.x = pelvisX - Math.sin(spineAngle) * (effectiveTorsoLength * 0.48);
    out.torso.y = pelvisY - Math.cos(spineAngle) * (effectiveTorsoLength * 0.48);

    // Neck base
    const neckX = pelvisX - Math.sin(spineAngle) * effectiveTorsoLength;
    const neckY = pelvisY - Math.cos(spineAngle) * effectiveTorsoLength;
    out.neck.x = neckX;
    out.neck.y = neckY;

    // 3. Head (Faceless round sphere)
    const headAngle = spineAngle + pose.head.angle;
    const headDist = neckLength + headRadius * 0.82;
    out.head.x = neckX - Math.sin(headAngle) * headDist + pose.head.x * 20 * s;
    out.head.y = neckY - Math.cos(headAngle) * headDist + pose.head.y * 20 * s;
    out.head.radius = headRadius;

    // 4. Left Arm (Shoulder -> Elbow -> Wrist -> Hand)
    const cosSpine = Math.cos(spineAngle);
    const sinSpine = Math.sin(spineAngle);

    const leftShoulderX = neckX - cosSpine * shoulderHalfWidth;
    const leftShoulderY = neckY + sinSpine * shoulderHalfWidth;
    out.leftShoulder.x = leftShoulderX;
    out.leftShoulder.y = leftShoulderY;

    // Natural elbow bend: prevent unnatural inward hyper-flexion
    const leftShoulderAngle = pose.leftArm.shoulderAngle;
    const leftElbowAngle = this.clamp(pose.leftArm.elbowAngle, -0.2, 2.6);

    const leftShoulderWorldAngle = spineAngle + Math.PI * 0.5 + leftShoulderAngle;
    const leftElbowX = leftShoulderX + Math.cos(leftShoulderWorldAngle) * upperArmLength;
    const leftElbowY = leftShoulderY + Math.sin(leftShoulderWorldAngle) * upperArmLength;
    out.leftElbow.x = leftElbowX;
    out.leftElbow.y = leftElbowY;

    const leftElbowWorldAngle = leftShoulderWorldAngle + leftElbowAngle;
    const leftWristX = leftElbowX + Math.cos(leftElbowWorldAngle) * forearmLength;
    const leftWristY = leftElbowY + Math.sin(leftElbowWorldAngle) * forearmLength;
    out.leftWrist.x = leftWristX;
    out.leftWrist.y = leftWristY;

    const leftHandWorldAngle = leftElbowWorldAngle + pose.leftArm.wristAngle;
    out.leftHand.x = leftWristX + Math.cos(leftHandWorldAngle) * handLength;
    out.leftHand.y = leftWristY + Math.sin(leftHandWorldAngle) * handLength;

    // 5. Right Arm
    const rightShoulderX = neckX + cosSpine * shoulderHalfWidth;
    const rightShoulderY = neckY - sinSpine * shoulderHalfWidth;
    out.rightShoulder.x = rightShoulderX;
    out.rightShoulder.y = rightShoulderY;

    const rightShoulderAngle = pose.rightArm.shoulderAngle;
    const rightElbowAngle = this.clamp(pose.rightArm.elbowAngle, -0.2, 2.6);

    const rightShoulderWorldAngle = spineAngle - Math.PI * 0.5 - rightShoulderAngle;
    const rightElbowX = rightShoulderX - Math.cos(rightShoulderWorldAngle) * upperArmLength;
    const rightElbowY = rightShoulderY + Math.sin(rightShoulderWorldAngle) * upperArmLength;
    out.rightElbow.x = rightElbowX;
    out.rightElbow.y = rightElbowY;

    const rightElbowWorldAngle = rightShoulderWorldAngle + rightElbowAngle;
    const rightWristX = rightElbowX - Math.cos(rightElbowWorldAngle) * forearmLength;
    const rightWristY = rightElbowY + Math.sin(rightElbowWorldAngle) * forearmLength;
    out.rightWrist.x = rightWristX;
    out.rightWrist.y = rightWristY;

    const rightHandWorldAngle = rightElbowWorldAngle + pose.rightArm.wristAngle;
    out.rightHand.x = rightWristX - Math.cos(rightHandWorldAngle) * handLength;
    out.rightHand.y = rightWristY + Math.sin(rightHandWorldAngle) * handLength;

    // 6. Left Leg (Hip -> Knee -> Ankle -> Foot)
    const cosPelvis = Math.cos(pelvisAngle);
    const sinPelvis = Math.sin(pelvisAngle);

    const leftHipX = pelvisX - cosPelvis * hipHalfWidth;
    const leftHipY = pelvisY + sinPelvis * hipHalfWidth;
    out.leftHip.x = leftHipX;
    out.leftHip.y = leftHipY;

    // Prevent knees from bending unnaturally backwards
    const leftKneeAngle = this.clamp(pose.leftLeg.kneeAngle, -0.1, 2.2);

    const leftHipWorldAngle = pelvisAngle + Math.PI * 0.5 + pose.leftLeg.hipAngle;
    const leftKneeX = leftHipX - Math.cos(leftHipWorldAngle) * (thighLength * 0.45);
    const leftKneeY = leftHipY + Math.sin(leftHipWorldAngle) * thighLength;
    out.leftKnee.x = leftKneeX;
    out.leftKnee.y = leftKneeY;

    const leftKneeWorldAngle = leftHipWorldAngle + leftKneeAngle;
    const leftAnkleX = leftKneeX - Math.cos(leftKneeWorldAngle) * (shinLength * 0.4);
    const leftAnkleY = leftKneeY + Math.sin(leftKneeWorldAngle) * shinLength;
    out.leftAnkle.x = leftAnkleX;
    out.leftAnkle.y = leftAnkleY;

    const leftFootWorldAngle = leftKneeWorldAngle + pose.leftLeg.ankleAngle;
    out.leftFoot.x = leftAnkleX + Math.sin(leftFootWorldAngle) * footLength;
    out.leftFoot.y = leftAnkleY + Math.cos(leftFootWorldAngle) * (footLength * 0.5);

    // 7. Right Leg
    const rightHipX = pelvisX + cosPelvis * hipHalfWidth;
    const rightHipY = pelvisY - sinPelvis * hipHalfWidth;
    out.rightHip.x = rightHipX;
    out.rightHip.y = rightHipY;

    const rightKneeAngle = this.clamp(pose.rightLeg.kneeAngle, -0.1, 2.2);

    const rightHipWorldAngle = pelvisAngle + Math.PI * 0.5 - pose.rightLeg.hipAngle;
    const rightKneeX = rightHipX + Math.cos(rightHipWorldAngle) * (thighLength * 0.45);
    const rightKneeY = rightHipY + Math.sin(rightHipWorldAngle) * thighLength;
    out.rightKnee.x = rightKneeX;
    out.rightKnee.y = rightKneeY;

    const rightKneeWorldAngle = rightHipWorldAngle - rightKneeAngle;
    const rightAnkleX = rightKneeX + Math.cos(rightKneeWorldAngle) * (shinLength * 0.4);
    const rightAnkleY = rightKneeY + Math.sin(rightKneeWorldAngle) * shinLength;
    out.rightAnkle.x = rightAnkleX;
    out.rightAnkle.y = rightAnkleY;

    const rightFootWorldAngle = rightKneeWorldAngle - pose.rightLeg.ankleAngle;
    out.rightFoot.x = rightAnkleX - Math.sin(rightFootWorldAngle) * footLength;
    out.rightFoot.y = rightAnkleY + Math.cos(rightFootWorldAngle) * (footLength * 0.5);

    return out;
  }
}
