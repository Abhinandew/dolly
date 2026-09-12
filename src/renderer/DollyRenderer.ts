import { DollPose, RigLandmarks } from '../types/pose';
import { DollyAppearance } from '../types/customization';
import { RigSolver } from './Rig';

/**
 * Dolly Canvas 2D Renderer
 * 
 * Renders a cute, bulky, white, faceless 2D character inspired by the restroom symbol silhouette.
 * 
 * CRITICAL REQUIREMENTS:
 * - ABSOLUTELY NO VISIBLE JOINTS (no elbow/knee/wrist circles, no bones, no skeleton lines, no seams, no pivot points).
 * - The character looks like ONE continuous, smooth, organic chubby body.
 * - All rig information is 100% invisible in production.
 * - Organic limb deformation, natural bending, believable weight, and foot placement.
 */
export class DollyRenderer {
  private ctx: CanvasRenderingContext2D;
  public showDebugRig: boolean = false;

  // ── Gradient cache — recreate only when position/scale changes ────────────
  private cachedGlowGrad: CanvasGradient | null = null;
  private cachedGlowKey: string = '';

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Render a complete frame of Dolly.
   * 
   * @param pose Current normalized DollPose
   * @param appearance Customization settings (color, outfit, accessories)
   * @param beatIntensity 0.0 - 1.0 real-time beat pulse from audio engine
   * @param width Canvas width
   * @param height Canvas height
   */
  public render(
    pose: DollPose,
    appearance: DollyAppearance,
    beatIntensity: number = 0,
    width: number,
    height: number
  ): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);

    // Responsive scaling based on viewport dimensions
    const minDim = Math.min(width, height);
    const baseScale = Math.max(0.68, Math.min(1.42, minDim / 560)) * (appearance.proportions.heightScale || 1.0);
    const chubbiness = (appearance.proportions.chubbiness || 1.0);

    const centerX = width * 0.5;
    // Ground level positioned so Dolly is well-centered vertically
    const centerY = height * 0.57;

    // 1. Solve the 17 hidden internal rig landmarks
    const landmarks = RigSolver.solve(pose, centerX, centerY, baseScale, chubbiness);

    ctx.save();

    // Apply global body squash/stretch and rotation with volume preservation
    if (pose.root.scaleX !== 1 || pose.root.scaleY !== 1 || pose.root.rotation !== 0) {
      ctx.translate(landmarks.root.x, landmarks.root.y);
      ctx.rotate(pose.root.rotation);
      ctx.scale(pose.root.scaleX, pose.root.scaleY);
      ctx.translate(-landmarks.root.x, -landmarks.root.y);
    }

    // 2. Draw ground shadow under Dolly (dynamic contact & weight)
    this.drawGroundShadow(landmarks, baseScale, chubbiness, pose.root.y);

    // 3. Draw stage aura / ambient beat pulse glow
    this.drawBeatGlow(landmarks, appearance, beatIntensity, baseScale);

    // 4. Render the continuous, seamless character silhouette with organic bending
    this.drawContinuousBody(landmarks, appearance, baseScale, chubbiness);

    // 4.5 Render cute face
    this.drawFace(landmarks, baseScale);

    // 5. Render accessories & outfits layered naturally
    this.drawOutfitAndAccessories(landmarks, appearance, baseScale, chubbiness);

    // 6. Optional Debug Rig (strictly for internal testing, disabled by default)
    if (this.showDebugRig) {
      this.drawDebugRig(landmarks);
    }

    ctx.restore();
  }

  /**
   * Dynamic ground shadow: expands and darkens on heavy landing squash, diffuses on jump
   */
  private drawGroundShadow(
    landmarks: RigLandmarks,
    scale: number,
    chubbiness: number,
    rootYOffset: number
  ): void {
    const ctx = this.ctx;
    // Plant ground level right beneath the feet
    const feetAverageY = Math.max(landmarks.leftFoot.y, landmarks.rightFoot.y) + 10 * scale;

    const jumpHeight = Math.max(0, -rootYOffset);
    const landCompression = Math.max(0, rootYOffset);

    // Expansion on squash, reduction on jump
    const shadowScaleX = (1.0 + landCompression * 0.35 - jumpHeight * 0.25);
    const shadowScaleY = (1.0 + landCompression * 0.2 - jumpHeight * 0.35);
    const shadowAlpha = Math.max(0.06, Math.min(0.42, 0.32 + landCompression * 0.18 - jumpHeight * 0.2));

    const shadowWidth = 115 * scale * chubbiness * shadowScaleX;
    const shadowHeight = 24 * scale * shadowScaleY;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(landmarks.pelvis.x, feetAverageY, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.fill();
    ctx.restore();
  }

  /**
   * Ambient aura that pulses dynamically to bass beats.
   * Gradient is cached and only recreated when the torso position or scale changes.
   */
  private drawBeatGlow(
    landmarks: RigLandmarks,
    appearance: DollyAppearance,
    beatIntensity: number,
    scale: number
  ): void {
    if (beatIntensity < 0.01 && appearance.glowIntensity < 0.05) return; // skip if invisible

    const ctx = this.ctx;
    const glowRadius = (165 + beatIntensity * 55) * scale;
    const glowAlpha = (0.12 + beatIntensity * 0.32) * (appearance.glowIntensity ?? 0.5);
    const tx = Math.round(landmarks.torso.x);
    const ty = Math.round(landmarks.torso.y);
    const glowColor = appearance.glowColor || 'rgba(99, 102, 241, 0.45)';

    // Only recreate gradient when position or color changes (not every frame)
    const gradKey = `${tx},${ty},${Math.round(glowRadius)},${glowColor}`;
    if (gradKey !== this.cachedGlowKey || !this.cachedGlowGrad) {
      this.cachedGlowGrad = ctx.createRadialGradient(tx, ty, 20 * scale, tx, ty, glowRadius);
      this.cachedGlowGrad.addColorStop(0, glowColor);
      this.cachedGlowGrad.addColorStop(0.6, 'rgba(99, 102, 241, 0.08)');
      this.cachedGlowGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      this.cachedGlowKey = gradKey;
    }

    ctx.save();
    ctx.fillStyle = this.cachedGlowGrad;
    ctx.globalAlpha = glowAlpha;
    ctx.beginPath();
    ctx.arc(tx, ty, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * The core continuous character renderer:
   * Draws a seamless, organic, chubby humanoid silhouette with ABSOLUTELY ZERO visible joints.
   * 
   * Limbs bend with natural organic curvature rather than rigid angular lines.
   * Torso is shaped like a friendly chubby pear with seamless neck and hip transitions.
   * Feet have rounded grounded pads for believable weight and balance.
   */
  private drawContinuousBody(
    lm: RigLandmarks,
    appearance: DollyAppearance,
    scale: number,
    chubbiness: number
  ): void {
    const ctx = this.ctx;
    const bodyColor = appearance.bodyColor || '#FFFFFF';

    ctx.save();
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = bodyColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Limb thickness - chubby, plump, and friendly
    const upperLegThickness = 42 * scale * chubbiness;
    const lowerLegThickness = 36 * scale * chubbiness;
    const upperArmThickness = 34 * scale * chubbiness;
    const lowerArmThickness = 28 * scale * chubbiness;

    // ==========================================
    // 1. LEGS (Thigh -> Knee -> Ankle -> Grounded Foot)
    // ==========================================

    // LEFT LEG: Smooth curved stroke through knee
    // Midpoint between knee and ankle for smooth organic spline
    ctx.lineWidth = upperLegThickness;
    ctx.beginPath();
    ctx.moveTo(lm.leftHip.x, lm.leftHip.y);
    // Smooth quadratic curve through knee
    ctx.quadraticCurveTo(lm.leftKnee.x, lm.leftKnee.y, lm.leftAnkle.x, lm.leftAnkle.y);
    ctx.stroke();

    ctx.lineWidth = lowerLegThickness;
    ctx.beginPath();
    ctx.moveTo(lm.leftKnee.x, lm.leftKnee.y);
    ctx.lineTo(lm.leftFoot.x, lm.leftFoot.y);
    ctx.stroke();

    // Left Grounded Foot Pad: Cute rounded capsule that anchors Dolly to the floor
    const footPadW = 20 * scale * chubbiness;
    const footPadH = 12 * scale;
    ctx.beginPath();
    ctx.ellipse(lm.leftFoot.x, lm.leftFoot.y, footPadW, footPadH, 0, 0, Math.PI * 2);
    ctx.fill();

    // RIGHT LEG
    ctx.lineWidth = upperLegThickness;
    ctx.beginPath();
    ctx.moveTo(lm.rightHip.x, lm.rightHip.y);
    ctx.quadraticCurveTo(lm.rightKnee.x, lm.rightKnee.y, lm.rightAnkle.x, lm.rightAnkle.y);
    ctx.stroke();

    ctx.lineWidth = lowerLegThickness;
    ctx.beginPath();
    ctx.moveTo(lm.rightKnee.x, lm.rightKnee.y);
    ctx.lineTo(lm.rightFoot.x, lm.rightFoot.y);
    ctx.stroke();

    // Right Grounded Foot Pad
    ctx.beginPath();
    ctx.ellipse(lm.rightFoot.x, lm.rightFoot.y, footPadW, footPadH, 0, 0, Math.PI * 2);
    ctx.fill();

    // ==========================================
    // 2. CHUBBY PEAR-SHAPED TORSO BODY HULL
    // ==========================================
    // Fuses shoulders and hips into ONE continuous organic pear silhouette
    const torsoPad = 20 * scale * chubbiness;
    ctx.beginPath();

    // Top neck bridge: smooth curved neckline
    ctx.moveTo(lm.leftShoulder.x - torsoPad * 0.35, lm.leftShoulder.y);
    ctx.quadraticCurveTo(lm.neck.x, lm.neck.y - torsoPad * 0.4, lm.rightShoulder.x + torsoPad * 0.35, lm.rightShoulder.y);

    // Right chest and flank curving down to chubby belly
    ctx.bezierCurveTo(
      lm.rightShoulder.x + torsoPad * 0.8,
      lm.torso.y - 10 * scale,
      lm.rightHip.x + torsoPad * 1.15,
      lm.torso.y + 15 * scale,
      lm.rightHip.x + torsoPad * 0.8,
      lm.pelvis.y + torsoPad * 0.6
    );

    // Chubby lower belly / pelvis cradle
    ctx.quadraticCurveTo(
      lm.pelvis.x,
      lm.pelvis.y + torsoPad * 1.05,
      lm.leftHip.x - torsoPad * 0.8,
      lm.pelvis.y + torsoPad * 0.6
    );

    // Left flank curving back up to left shoulder
    ctx.bezierCurveTo(
      lm.leftHip.x - torsoPad * 1.15,
      lm.torso.y + 15 * scale,
      lm.leftShoulder.x - torsoPad * 0.8,
      lm.torso.y - 10 * scale,
      lm.leftShoulder.x - torsoPad * 0.35,
      lm.leftShoulder.y
    );
    ctx.closePath();
    ctx.fill();

    // Reinforce belly plumpness with a soft central circular mass
    const bellyRadius = 46 * scale * chubbiness;
    ctx.beginPath();
    ctx.arc(lm.torso.x, lm.torso.y + 12 * scale, bellyRadius, 0, Math.PI * 2);
    ctx.fill();

    // ==========================================
    // 3. ARMS (Shoulder -> Curved Elbow -> Wrist -> Rounded Hand)
    // ==========================================

    // LEFT ARM: Organic curved stroke through elbow
    ctx.lineWidth = upperArmThickness;
    ctx.beginPath();
    ctx.moveTo(lm.leftShoulder.x, lm.leftShoulder.y);
    // Smooth quadratic curve through elbow to wrist
    ctx.quadraticCurveTo(lm.leftElbow.x, lm.leftElbow.y, lm.leftWrist.x, lm.leftWrist.y);
    ctx.stroke();

    ctx.lineWidth = lowerArmThickness;
    ctx.beginPath();
    ctx.moveTo(lm.leftWrist.x, lm.leftWrist.y);
    ctx.lineTo(lm.leftHand.x, lm.leftHand.y);
    ctx.stroke();

    // Cute rounded left hand
    const handRadius = 13 * scale * chubbiness;
    ctx.beginPath();
    ctx.arc(lm.leftHand.x, lm.leftHand.y, handRadius, 0, Math.PI * 2);
    ctx.fill();

    // RIGHT ARM
    ctx.lineWidth = upperArmThickness;
    ctx.beginPath();
    ctx.moveTo(lm.rightShoulder.x, lm.rightShoulder.y);
    ctx.quadraticCurveTo(lm.rightElbow.x, lm.rightElbow.y, lm.rightWrist.x, lm.rightWrist.y);
    ctx.stroke();

    ctx.lineWidth = lowerArmThickness;
    ctx.beginPath();
    ctx.moveTo(lm.rightWrist.x, lm.rightWrist.y);
    ctx.lineTo(lm.rightHand.x, lm.rightHand.y);
    ctx.stroke();

    // Cute rounded right hand
    ctx.beginPath();
    ctx.arc(lm.rightHand.x, lm.rightHand.y, handRadius, 0, Math.PI * 2);
    ctx.fill();

    // ==========================================
    // 4. HEAD (Smooth round sphere, strictly faceless)
    // ==========================================
    // Gentle neck bridge for organic head attachment
    ctx.lineWidth = 26 * scale * chubbiness;
    ctx.beginPath();
    ctx.moveTo(lm.neck.x, lm.neck.y);
    ctx.lineTo(lm.head.x, lm.head.y);
    ctx.stroke();

    // Iconic round faceless head
    const headR = lm.head.radius * (appearance.proportions.headScale || 1.0);
    ctx.beginPath();
    ctx.arc(lm.head.x, lm.head.y, headR, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Render a cute face on Dolly
   */
  private drawFace(lm: RigLandmarks, scale: number): void {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.fillStyle = '#1e293b'; // Dark slate for facial features
    ctx.lineWidth = 2.5 * scale;
    ctx.lineCap = 'round';

    // Face rotation logic - look slightly up and forward
    const faceOffsetY = -3 * scale;
    const eyeSpacing = 16 * scale;
    const eyeSize = 3.5 * scale;

    // Eyes
    ctx.beginPath();
    ctx.arc(lm.head.x - eyeSpacing * 0.5, lm.head.y + faceOffsetY, eyeSize, 0, Math.PI * 2);
    ctx.arc(lm.head.x + eyeSpacing * 0.5, lm.head.y + faceOffsetY, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Cute small curved smile
    ctx.beginPath();
    ctx.strokeStyle = '#1e293b';
    const mouthY = lm.head.y + faceOffsetY + 8 * scale;
    ctx.moveTo(lm.head.x - 4 * scale, mouthY - 1 * scale);
    ctx.quadraticCurveTo(lm.head.x, mouthY + 3 * scale, lm.head.x + 4 * scale, mouthY - 1 * scale);
    ctx.stroke();
    
    // Tiny blush cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.4)'; // Soft pink
    ctx.beginPath();
    ctx.arc(lm.head.x - eyeSpacing * 0.75, lm.head.y + faceOffsetY + 4 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.arc(lm.head.x + eyeSpacing * 0.75, lm.head.y + faceOffsetY + 4 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Layered Outfits and Accessories
   */
  private drawOutfitAndAccessories(
    lm: RigLandmarks,
    appearance: DollyAppearance,
    scale: number,
    chubbiness: number
  ): void {
    const ctx = this.ctx;
    const accent = appearance.accentColor || '#6366F1';

    // 1. OUTFITS
    if (appearance.outfit === 'hoodie') {
      ctx.save();
      ctx.fillStyle = accent;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 14 * scale * chubbiness;
      ctx.lineCap = 'round';

      // Hoodie pocket on belly
      const pocketW = 46 * scale * chubbiness;
      const pocketH = 26 * scale;
      ctx.beginPath();
      ctx.roundRect(lm.torso.x - pocketW * 0.5, lm.torso.y + 10 * scale, pocketW, pocketH, 9 * scale);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fill();

      // Draw hoodie strings
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(lm.neck.x - 8 * scale, lm.neck.y + 4 * scale);
      ctx.lineTo(lm.neck.x - 8 * scale, lm.neck.y + 24 * scale);
      ctx.moveTo(lm.neck.x + 8 * scale, lm.neck.y + 4 * scale);
      ctx.lineTo(lm.neck.x + 8 * scale, lm.neck.y + 24 * scale);
      ctx.stroke();
      ctx.restore();
    } else if (appearance.outfit === 'bowtie') {
      ctx.save();
      ctx.fillStyle = accent;
      // Elegant red/accent bowtie at neck
      const bowX = lm.neck.x;
      const bowY = lm.neck.y + 4 * scale;
      const bw = 17 * scale;
      const bh = 11 * scale;

      ctx.beginPath();
      ctx.moveTo(bowX, bowY);
      ctx.lineTo(bowX - bw, bowY - bh);
      ctx.lineTo(bowX - bw, bowY + bh);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(bowX, bowY);
      ctx.lineTo(bowX + bw, bowY - bh);
      ctx.lineTo(bowX + bw, bowY + bh);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bowX, bowY, 4.5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
    } else if (appearance.outfit === 'suspenders') {
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 5 * scale;
      // Two vertical suspender straps
      ctx.beginPath();
      ctx.moveTo(lm.leftShoulder.x + 6 * scale, lm.leftShoulder.y + 2 * scale);
      ctx.lineTo(lm.leftHip.x + 4 * scale, lm.pelvis.y);
      ctx.moveTo(lm.rightShoulder.x - 6 * scale, lm.rightShoulder.y + 2 * scale);
      ctx.lineTo(lm.rightHip.x - 4 * scale, lm.pelvis.y);
      ctx.stroke();
      ctx.restore();
    } else if (appearance.outfit === 'athletic') {
      ctx.save();
      ctx.fillStyle = accent;
      // Wrist sweatbands on both arms
      const bandR = 17 * scale * chubbiness;
      ctx.beginPath();
      ctx.arc(lm.leftWrist.x, lm.leftWrist.y, bandR, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(lm.rightWrist.x, lm.rightWrist.y, bandR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (appearance.outfit === 'cape') {
      ctx.save();
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.88;
      // Cape body — drapes from shoulders down behind, fluttering shape
      ctx.beginPath();
      ctx.moveTo(lm.leftShoulder.x - 4 * scale, lm.leftShoulder.y + 2 * scale);
      // Left drape
      ctx.bezierCurveTo(
        lm.leftShoulder.x - 20 * scale, lm.torso.y + 10 * scale,
        lm.leftHip.x - 18 * scale,      lm.pelvis.y + 10 * scale,
        lm.leftHip.x - 8 * scale,       lm.pelvis.y + 30 * scale
      );
      // Bottom flutter
      ctx.bezierCurveTo(
        lm.pelvis.x - 10 * scale,       lm.pelvis.y + 45 * scale,
        lm.pelvis.x + 10 * scale,       lm.pelvis.y + 45 * scale,
        lm.rightHip.x + 8 * scale,      lm.pelvis.y + 30 * scale
      );
      // Right drape back up
      ctx.bezierCurveTo(
        lm.rightHip.x + 18 * scale,     lm.pelvis.y + 10 * scale,
        lm.rightShoulder.x + 20 * scale, lm.torso.y + 10 * scale,
        lm.rightShoulder.x + 4 * scale,  lm.rightShoulder.y + 2 * scale
      );
      ctx.closePath();
      ctx.fill();
      // Cape collar
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = appearance.bodyColor || '#FFFFFF';
      ctx.beginPath();
      ctx.arc(lm.neck.x, lm.neck.y + 4 * scale, 11 * scale, 0, Math.PI);
      ctx.fill();
      ctx.restore();
    } else if (appearance.outfit === 'tracksuit') {
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4.5 * scale;
      ctx.lineCap = 'round';
      // Side stripes down both legs
      ctx.beginPath();
      ctx.moveTo(lm.leftHip.x + 12 * scale * (lm.leftHip.x < lm.pelvis.x ? 1 : -1), lm.leftHip.y);
      ctx.lineTo(lm.leftAnkle.x + 8 * scale * (lm.leftHip.x < lm.pelvis.x ? 1 : -1), lm.leftAnkle.y);
      ctx.moveTo(lm.rightHip.x - 12 * scale * (lm.rightHip.x > lm.pelvis.x ? 1 : -1), lm.rightHip.y);
      ctx.lineTo(lm.rightAnkle.x - 8 * scale * (lm.rightHip.x > lm.pelvis.x ? 1 : -1), lm.rightAnkle.y);
      ctx.stroke();
      // Side stripes down both arms
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(lm.leftShoulder.x, lm.leftShoulder.y + 4 * scale);
      ctx.lineTo(lm.leftWrist.x,    lm.leftWrist.y);
      ctx.moveTo(lm.rightShoulder.x, lm.rightShoulder.y + 4 * scale);
      ctx.lineTo(lm.rightWrist.x,    lm.rightWrist.y);
      ctx.stroke();
      // Chest zip line
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(lm.neck.x, lm.neck.y + 6 * scale);
      ctx.lineTo(lm.torso.x, lm.torso.y + 5 * scale);
      ctx.stroke();
      ctx.restore();
    }

    // 2. ACCESSORIES
    const headR = lm.head.radius * (appearance.proportions.headScale || 1.0);

    if (appearance.accessory === 'headphones') {
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 6 * scale;
      // Headphone headband arching over top of head
      ctx.beginPath();
      ctx.arc(lm.head.x, lm.head.y, headR + 6 * scale, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // Left & right ear cups
      ctx.fillStyle = accent;
      const cupW = 12 * scale;
      const cupH = 22 * scale;
      ctx.beginPath();
      ctx.roundRect(lm.head.x - headR - cupW * 0.7, lm.head.y - cupH * 0.5, cupW, cupH, 5 * scale);
      ctx.roundRect(lm.head.x + headR - cupW * 0.3, lm.head.y - cupH * 0.5, cupW, cupH, 5 * scale);
      ctx.fill();

      // Metallic detail
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(lm.head.x - headR - cupW * 0.2, lm.head.y, 4 * scale, 0, Math.PI * 2);
      ctx.arc(lm.head.x + headR + cupW * 0.2, lm.head.y, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (appearance.accessory === 'cool_shades') {
      ctx.save();
      ctx.fillStyle = '#0f172a';
      // Retro black wayfarer shades resting seamlessly on faceless head
      const shadeW = 54 * scale;
      const shadeH = 16 * scale;
      ctx.beginPath();
      ctx.roundRect(lm.head.x - shadeW * 0.5, lm.head.y - 4 * scale, shadeW, shadeH, 4 * scale);
      ctx.fill();

      // Glass shine reflection
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(lm.head.x - 18 * scale, lm.head.y - 2 * scale);
      ctx.lineTo(lm.head.x - 8 * scale, lm.head.y + 8 * scale);
      ctx.moveTo(lm.head.x + 8 * scale, lm.head.y - 2 * scale);
      ctx.lineTo(lm.head.x + 18 * scale, lm.head.y + 8 * scale);
      ctx.stroke();
      ctx.restore();
    } else if (appearance.accessory === 'party_visor') {
      ctx.save();
      ctx.fillStyle = 'rgba(6, 182, 212, 0.85)';
      const visorW = 62 * scale;
      const visorH = 12 * scale;
      ctx.beginPath();
      ctx.roundRect(lm.head.x - visorW * 0.5, lm.head.y - 12 * scale, visorW, visorH, 3 * scale);
      ctx.fill();
      ctx.restore();
    } else if (appearance.accessory === 'top_hat') {
      ctx.save();
      ctx.fillStyle = '#1e1b4b';
      const brimW = 64 * scale;
      const hatW = 40 * scale;
      const hatH = 34 * scale;
      const topY = lm.head.y - headR + 4 * scale;

      // Brim
      ctx.beginPath();
      ctx.roundRect(lm.head.x - brimW * 0.5, topY, brimW, 6 * scale, 3 * scale);
      ctx.fill();

      // Crown
      ctx.beginPath();
      ctx.roundRect(lm.head.x - hatW * 0.5, topY - hatH, hatW, hatH, 4 * scale);
      ctx.fill();

      // Ribbon band on hat
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.rect(lm.head.x - hatW * 0.5, topY - 8 * scale, hatW, 8 * scale);
      ctx.fill();
      ctx.restore();
    } else if (appearance.accessory === 'halo') {
      ctx.save();
      // Outer soft glow ring (cheap — no shadowBlur)
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.35)';
      ctx.lineWidth = 10 * scale;
      ctx.beginPath();
      ctx.ellipse(lm.head.x, lm.head.y - headR - 14 * scale, 32 * scale, 9 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Solid bright ring on top
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.ellipse(lm.head.x, lm.head.y - headR - 14 * scale, 32 * scale, 9 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (appearance.accessory === 'crown') {
      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2 * scale;
      const crownY = lm.head.y - headR + 2 * scale;
      const cw = headR * 1.1;
      // Crown base band
      ctx.beginPath();
      ctx.roundRect(lm.head.x - cw, crownY - 6 * scale, cw * 2, 10 * scale, 3 * scale);
      ctx.fill();
      ctx.stroke();
      // Five crown points
      const pts = 5;
      for (let i = 0; i < pts; i++) {
        const px = lm.head.x - cw + (i / (pts - 1)) * cw * 2;
        const ptH = (i % 2 === 0 ? 20 : 12) * scale;
        ctx.beginPath();
        ctx.moveTo(px - 6 * scale, crownY - 4 * scale);
        ctx.lineTo(px, crownY - ptH);
        ctx.lineTo(px + 6 * scale, crownY - 4 * scale);
        ctx.fillStyle = '#facc15';
        ctx.fill();
        ctx.stroke();
      }
      // Gem dots on tall points
      ctx.fillStyle = accent;
      for (let i = 0; i < pts; i += 2) {
        const px = lm.head.x - cw + (i / (pts - 1)) * cw * 2;
        ctx.beginPath();
        ctx.arc(px, crownY - 17 * scale, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (appearance.accessory === 'cat_ears') {
      ctx.save();
      ctx.fillStyle = appearance.bodyColor || '#FFFFFF';
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2 * scale;
      const earBase = lm.head.y - headR + 4 * scale;
      // Left ear
      ctx.beginPath();
      ctx.moveTo(lm.head.x - headR * 0.55, earBase);
      ctx.lineTo(lm.head.x - headR * 0.75, earBase - 22 * scale);
      ctx.lineTo(lm.head.x - headR * 0.15, earBase - 8 * scale);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Left inner ear
      ctx.fillStyle = 'rgba(244,114,182,0.5)';
      ctx.beginPath();
      ctx.moveTo(lm.head.x - headR * 0.54, earBase - 2 * scale);
      ctx.lineTo(lm.head.x - headR * 0.7,  earBase - 16 * scale);
      ctx.lineTo(lm.head.x - headR * 0.22, earBase - 7 * scale);
      ctx.closePath();
      ctx.fill();
      // Right ear
      ctx.fillStyle = appearance.bodyColor || '#FFFFFF';
      ctx.strokeStyle = accent;
      ctx.beginPath();
      ctx.moveTo(lm.head.x + headR * 0.55, earBase);
      ctx.lineTo(lm.head.x + headR * 0.75, earBase - 22 * scale);
      ctx.lineTo(lm.head.x + headR * 0.15, earBase - 8 * scale);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(244,114,182,0.5)';
      ctx.beginPath();
      ctx.moveTo(lm.head.x + headR * 0.54, earBase - 2 * scale);
      ctx.lineTo(lm.head.x + headR * 0.7,  earBase - 16 * scale);
      ctx.lineTo(lm.head.x + headR * 0.22, earBase - 7 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (appearance.accessory === 'devil_horns') {
      ctx.save();
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2 * scale;
      const hornBase = lm.head.y - headR + 6 * scale;
      // Left horn
      ctx.beginPath();
      ctx.moveTo(lm.head.x - headR * 0.45, hornBase);
      ctx.bezierCurveTo(
        lm.head.x - headR * 0.65, hornBase - 16 * scale,
        lm.head.x - headR * 0.55, hornBase - 26 * scale,
        lm.head.x - headR * 0.38, hornBase - 28 * scale
      );
      ctx.bezierCurveTo(
        lm.head.x - headR * 0.3, hornBase - 14 * scale,
        lm.head.x - headR * 0.22, hornBase - 4 * scale,
        lm.head.x - headR * 0.2, hornBase
      );
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Right horn
      ctx.beginPath();
      ctx.moveTo(lm.head.x + headR * 0.45, hornBase);
      ctx.bezierCurveTo(
        lm.head.x + headR * 0.65, hornBase - 16 * scale,
        lm.head.x + headR * 0.55, hornBase - 26 * scale,
        lm.head.x + headR * 0.38, hornBase - 28 * scale
      );
      ctx.bezierCurveTo(
        lm.head.x + headR * 0.3, hornBase - 14 * scale,
        lm.head.x + headR * 0.22, hornBase - 4 * scale,
        lm.head.x + headR * 0.2, hornBase
      );
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    } else if (appearance.accessory === 'flower_crown') {
      ctx.save();
      const crownCX = lm.head.x;
      const crownCY = lm.head.y - headR - 2 * scale;
      const flowers = [
        { dx: -headR * 0.9, dy: 2 * scale,  color: '#fb7185' },
        { dx: -headR * 0.45, dy: -8 * scale, color: '#facc15' },
        { dx: 0,            dy: -11 * scale, color: '#34d399' },
        { dx: headR * 0.45, dy: -8 * scale,  color: '#a78bfa' },
        { dx: headR * 0.9,  dy: 2 * scale,   color: '#fb7185' },
      ];
      // Stem band
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.arc(crownCX, crownCY, headR * 0.92, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      // Flower petals
      for (const f of flowers) {
        const fx = crownCX + f.dx;
        const fy = crownCY + f.dy;
        const pr = 5.5 * scale;
        // 5 petals
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          ctx.fillStyle = f.color;
          ctx.beginPath();
          ctx.ellipse(fx + Math.cos(a) * pr, fy + Math.sin(a) * pr, pr * 0.7, pr * 0.5, a, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.arc(fx, fy, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (appearance.accessory === 'ninja_band') {
      ctx.save();
      ctx.fillStyle = '#1e293b';
      // Dark band wrapped around head
      const bandH = 14 * scale;
      ctx.beginPath();
      ctx.ellipse(lm.head.x, lm.head.y - 1 * scale, headR + 3 * scale, bandH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Knot/tie on left side
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(lm.head.x - headR - 2 * scale, lm.head.y - 3 * scale);
      ctx.lineTo(lm.head.x - headR - 16 * scale, lm.head.y - 10 * scale);
      ctx.lineTo(lm.head.x - headR - 14 * scale, lm.head.y + 8 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(lm.head.x - headR - 2 * scale, lm.head.y + 2 * scale);
      ctx.lineTo(lm.head.x - headR - 18 * scale, lm.head.y + 12 * scale);
      ctx.lineTo(lm.head.x - headR - 12 * scale, lm.head.y - 5 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (appearance.accessory === 'star_glasses') {
      ctx.save();
      const sg = 18 * scale;
      const sy  = lm.head.y - 3 * scale;
      // Left star lens
      const drawStar = (cx: number, cy: number, r: number) => {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a   = (i * Math.PI) / 5 - Math.PI / 2;
          const rad = i % 2 === 0 ? r : r * 0.42;
          const sx  = cx + Math.cos(a) * rad;
          const ssy = cy + Math.sin(a) * rad;
          i === 0 ? ctx.moveTo(sx, ssy) : ctx.lineTo(sx, ssy);
        }
        ctx.closePath();
        ctx.fill();
      };
      ctx.fillStyle = accent;
      drawStar(lm.head.x - sg, sy, sg * 0.58);
      drawStar(lm.head.x + sg, sy, sg * 0.58);
      // Bridge
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(lm.head.x - sg * 0.38, sy);
      ctx.lineTo(lm.head.x + sg * 0.38, sy);
      ctx.stroke();
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      drawStar(lm.head.x - sg, sy - sg * 0.12, sg * 0.18);
      drawStar(lm.head.x + sg, sy - sg * 0.12, sg * 0.18);
      ctx.restore();
    }
  }

  /**
   * Internal Rig visualizer (for developers to inspect math; strictly hidden in production)
   */
  private drawDebugRig(lm: RigLandmarks): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.fillStyle = '#3b82f6';
    ctx.lineWidth = 2;

    const pairs: [keyof RigLandmarks, keyof RigLandmarks][] = [
      ['neck', 'head'],
      ['neck', 'leftShoulder'],
      ['leftShoulder', 'leftElbow'],
      ['leftElbow', 'leftWrist'],
      ['leftWrist', 'leftHand'],
      ['neck', 'rightShoulder'],
      ['rightShoulder', 'rightElbow'],
      ['rightElbow', 'rightWrist'],
      ['rightWrist', 'rightHand'],
      ['neck', 'torso'],
      ['torso', 'pelvis'],
      ['pelvis', 'leftHip'],
      ['leftHip', 'leftKnee'],
      ['leftKnee', 'leftAnkle'],
      ['leftAnkle', 'leftFoot'],
      ['pelvis', 'rightHip'],
      ['rightHip', 'rightKnee'],
      ['rightKnee', 'rightAnkle'],
      ['rightAnkle', 'rightFoot'],
    ];

    for (const [p1, p2] of pairs) {
      const pt1 = lm[p1];
      const pt2 = lm[p2];
      ctx.beginPath();
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.stroke();
    }

    // Draw landmark dots
    for (const key of Object.keys(lm) as (keyof RigLandmarks)[]) {
      const pt = lm[key];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
