import { DollPose } from '../types/pose';
import { createNeutralPose } from './MovementLibrary';

export class PoseBlender {
  private static cachedBlendResult: DollPose = createNeutralPose();
  private static cachedPartialResult: DollPose = createNeutralPose();

  /**
   * Fast linear interpolation
   */
  public static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * (t < 0 ? 0 : t > 1 ? 1 : t);
  }

  /**
   * Fast angle interpolation taking shortest angular distance
   */
  public static lerpAngle(a: number, b: number, t: number): number {
    let diff = (b - a) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    const clampedT = t < 0 ? 0 : t > 1 ? 1 : t;
    return a + diff * clampedT;
  }

  /**
   * Fast clone of DollPose without JSON stringification overhead
   */
  public static clone(src: DollPose, target: DollPose = createNeutralPose()): DollPose {
    target.root.x = src.root.x;
    target.root.y = src.root.y;
    target.root.scaleX = src.root.scaleX;
    target.root.scaleY = src.root.scaleY;
    target.root.rotation = src.root.rotation;

    target.pelvis.x = src.pelvis.x;
    target.pelvis.y = src.pelvis.y;
    target.pelvis.angle = src.pelvis.angle;

    target.torso.angle = src.torso.angle;
    target.torso.stretch = src.torso.stretch;

    target.head.x = src.head.x;
    target.head.y = src.head.y;
    target.head.angle = src.head.angle;

    target.leftArm.shoulderAngle = src.leftArm.shoulderAngle;
    target.leftArm.elbowAngle = src.leftArm.elbowAngle;
    target.leftArm.wristAngle = src.leftArm.wristAngle;

    target.rightArm.shoulderAngle = src.rightArm.shoulderAngle;
    target.rightArm.elbowAngle = src.rightArm.elbowAngle;
    target.rightArm.wristAngle = src.rightArm.wristAngle;

    target.leftLeg.hipAngle = src.leftLeg.hipAngle;
    target.leftLeg.kneeAngle = src.leftLeg.kneeAngle;
    target.leftLeg.ankleAngle = src.leftLeg.ankleAngle;

    target.rightLeg.hipAngle = src.rightLeg.hipAngle;
    target.rightLeg.kneeAngle = src.rightLeg.kneeAngle;
    target.rightLeg.ankleAngle = src.rightLeg.ankleAngle;

    return target;
  }

  /**
   * Blend two complete DollPoses into a target pose.
   * Zero heap allocations when using target buffer.
   */
  public static blend(
    poseA: DollPose,
    poseB: DollPose,
    alpha: number,
    out: DollPose = PoseBlender.cachedBlendResult
  ): DollPose {
    const t = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;

    out.root.x = this.lerp(poseA.root.x, poseB.root.x, t);
    out.root.y = this.lerp(poseA.root.y, poseB.root.y, t);
    out.root.scaleX = this.lerp(poseA.root.scaleX, poseB.root.scaleX, t);
    out.root.scaleY = this.lerp(poseA.root.scaleY, poseB.root.scaleY, t);
    out.root.rotation = this.lerpAngle(poseA.root.rotation, poseB.root.rotation, t);

    out.pelvis.x = this.lerp(poseA.pelvis.x, poseB.pelvis.x, t);
    out.pelvis.y = this.lerp(poseA.pelvis.y, poseB.pelvis.y, t);
    out.pelvis.angle = this.lerpAngle(poseA.pelvis.angle, poseB.pelvis.angle, t);

    out.torso.angle = this.lerpAngle(poseA.torso.angle, poseB.torso.angle, t);
    out.torso.stretch = this.lerp(poseA.torso.stretch, poseB.torso.stretch, t);

    out.head.x = this.lerp(poseA.head.x, poseB.head.x, t);
    out.head.y = this.lerp(poseA.head.y, poseB.head.y, t);
    out.head.angle = this.lerpAngle(poseA.head.angle, poseB.head.angle, t);

    out.leftArm.shoulderAngle = this.lerpAngle(poseA.leftArm.shoulderAngle, poseB.leftArm.shoulderAngle, t);
    out.leftArm.elbowAngle = this.lerpAngle(poseA.leftArm.elbowAngle, poseB.leftArm.elbowAngle, t);
    out.leftArm.wristAngle = this.lerpAngle(poseA.leftArm.wristAngle, poseB.leftArm.wristAngle, t);

    out.rightArm.shoulderAngle = this.lerpAngle(poseA.rightArm.shoulderAngle, poseB.rightArm.shoulderAngle, t);
    out.rightArm.elbowAngle = this.lerpAngle(poseA.rightArm.elbowAngle, poseB.rightArm.elbowAngle, t);
    out.rightArm.wristAngle = this.lerpAngle(poseA.rightArm.wristAngle, poseB.rightArm.wristAngle, t);

    out.leftLeg.hipAngle = this.lerpAngle(poseA.leftLeg.hipAngle, poseB.leftLeg.hipAngle, t);
    out.leftLeg.kneeAngle = this.lerpAngle(poseA.leftLeg.kneeAngle, poseB.leftLeg.kneeAngle, t);
    out.leftLeg.ankleAngle = this.lerpAngle(poseA.leftLeg.ankleAngle, poseB.leftLeg.ankleAngle, t);

    out.rightLeg.hipAngle = this.lerpAngle(poseA.rightLeg.hipAngle, poseB.rightLeg.hipAngle, t);
    out.rightLeg.kneeAngle = this.lerpAngle(poseA.rightLeg.kneeAngle, poseB.rightLeg.kneeAngle, t);
    out.rightLeg.ankleAngle = this.lerpAngle(poseA.rightLeg.ankleAngle, poseB.rightLeg.ankleAngle, t);

    return out;
  }

  /**
   * Apply a partial pose onto a base pose with an additive/blended weight.
   * Fast field copies with zero JSON serialization.
   */
  public static applyPartial(
    base: DollPose,
    partial: Partial<DollPose>,
    weight: number = 1.0,
    out: DollPose = PoseBlender.cachedPartialResult
  ): DollPose {
    const w = weight < 0 ? 0 : weight > 1 ? 1 : weight;

    // Copy base into out first
    this.clone(base, out);
    if (w === 0) return out;

    if (partial.root) {
      if (partial.root.x !== undefined) out.root.x = this.lerp(out.root.x, partial.root.x, w);
      if (partial.root.y !== undefined) out.root.y = this.lerp(out.root.y, partial.root.y, w);
      if (partial.root.scaleX !== undefined) out.root.scaleX = this.lerp(out.root.scaleX, partial.root.scaleX, w);
      if (partial.root.scaleY !== undefined) out.root.scaleY = this.lerp(out.root.scaleY, partial.root.scaleY, w);
      if (partial.root.rotation !== undefined) out.root.rotation = this.lerpAngle(out.root.rotation, partial.root.rotation, w);
    }
    if (partial.pelvis) {
      if (partial.pelvis.x !== undefined) out.pelvis.x = this.lerp(out.pelvis.x, partial.pelvis.x, w);
      if (partial.pelvis.y !== undefined) out.pelvis.y = this.lerp(out.pelvis.y, partial.pelvis.y, w);
      if (partial.pelvis.angle !== undefined) out.pelvis.angle = this.lerpAngle(out.pelvis.angle, partial.pelvis.angle, w);
    }
    if (partial.torso) {
      if (partial.torso.angle !== undefined) out.torso.angle = this.lerpAngle(out.torso.angle, partial.torso.angle, w);
      if (partial.torso.stretch !== undefined) out.torso.stretch = this.lerp(out.torso.stretch, partial.torso.stretch, w);
    }
    if (partial.head) {
      if (partial.head.x !== undefined) out.head.x = this.lerp(out.head.x, partial.head.x, w);
      if (partial.head.y !== undefined) out.head.y = this.lerp(out.head.y, partial.head.y, w);
      if (partial.head.angle !== undefined) out.head.angle = this.lerpAngle(out.head.angle, partial.head.angle, w);
    }
    if (partial.leftArm) {
      if (partial.leftArm.shoulderAngle !== undefined) out.leftArm.shoulderAngle = this.lerpAngle(out.leftArm.shoulderAngle, partial.leftArm.shoulderAngle, w);
      if (partial.leftArm.elbowAngle !== undefined) out.leftArm.elbowAngle = this.lerpAngle(out.leftArm.elbowAngle, partial.leftArm.elbowAngle, w);
      if (partial.leftArm.wristAngle !== undefined) out.leftArm.wristAngle = this.lerpAngle(out.leftArm.wristAngle, partial.leftArm.wristAngle, w);
    }
    if (partial.rightArm) {
      if (partial.rightArm.shoulderAngle !== undefined) out.rightArm.shoulderAngle = this.lerpAngle(out.rightArm.shoulderAngle, partial.rightArm.shoulderAngle, w);
      if (partial.rightArm.elbowAngle !== undefined) out.rightArm.elbowAngle = this.lerpAngle(out.rightArm.elbowAngle, partial.rightArm.elbowAngle, w);
      if (partial.rightArm.wristAngle !== undefined) out.rightArm.wristAngle = this.lerpAngle(out.rightArm.wristAngle, partial.rightArm.wristAngle, w);
    }
    if (partial.leftLeg) {
      if (partial.leftLeg.hipAngle !== undefined) out.leftLeg.hipAngle = this.lerpAngle(out.leftLeg.hipAngle, partial.leftLeg.hipAngle, w);
      if (partial.leftLeg.kneeAngle !== undefined) out.leftLeg.kneeAngle = this.lerpAngle(out.leftLeg.kneeAngle, partial.leftLeg.kneeAngle, w);
      if (partial.leftLeg.ankleAngle !== undefined) out.leftLeg.ankleAngle = this.lerpAngle(out.leftLeg.ankleAngle, partial.leftLeg.ankleAngle, w);
    }
    if (partial.rightLeg) {
      if (partial.rightLeg.hipAngle !== undefined) out.rightLeg.hipAngle = this.lerpAngle(out.rightLeg.hipAngle, partial.rightLeg.hipAngle, w);
      if (partial.rightLeg.kneeAngle !== undefined) out.rightLeg.kneeAngle = this.lerpAngle(out.rightLeg.kneeAngle, partial.rightLeg.kneeAngle, w);
      if (partial.rightLeg.ankleAngle !== undefined) out.rightLeg.ankleAngle = this.lerpAngle(out.rightLeg.ankleAngle, partial.rightLeg.ankleAngle, w);
    }

    return out;
  }
}
