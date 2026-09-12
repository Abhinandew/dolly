import { RigSolver } from '../renderer/Rig';
import { createNeutralPose, MovementLibrary } from '../dance/MovementLibrary';
import { PoseBlender } from '../dance/PoseBlender';
import { ChoreographyPlayer } from '../dance/ChoreographyPlayer';
import { BeatDetector } from '../audio/BeatDetector';
import { BeatClock } from '../audio/BeatClock';
import { PRESET_CHOREOGRAPHIES, matchSongByBpm } from '../services/presetDances';
import { TrendingDanceService } from '../services/TrendingDanceService';
import { MockSongRecognitionService } from '../services/SongRecognitionService';
import { MovementType } from '../types/pose';

function runTests() {
  console.log('--- STARTING DOLLY COMPREHENSIVE TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. RigSolver FK Tests
  console.log('\n[1] Testing RigSolver & 17 Hidden Joints:');
  const neutralPose = createNeutralPose();
  const landmarks = RigSolver.solve(neutralPose, 300, 300, 1.0, 1.0);

  assert(landmarks.head !== undefined && !isNaN(landmarks.head.x), 'Head landmark solved');
  assert(landmarks.neck !== undefined && !isNaN(landmarks.neck.y), 'Neck landmark solved');
  assert(landmarks.pelvis !== undefined && !isNaN(landmarks.pelvis.x), 'Pelvis landmark solved');
  assert(landmarks.leftShoulder !== undefined && !isNaN(landmarks.leftShoulder.x), 'Left shoulder solved');
  assert(landmarks.rightShoulder !== undefined && !isNaN(landmarks.rightShoulder.x), 'Right shoulder solved');
  assert(landmarks.leftElbow !== undefined && !isNaN(landmarks.leftElbow.x), 'Left elbow solved');
  assert(landmarks.rightElbow !== undefined && !isNaN(landmarks.rightElbow.x), 'Right elbow solved');
  assert(landmarks.leftWrist !== undefined && !isNaN(landmarks.leftWrist.x), 'Left wrist solved');
  assert(landmarks.rightWrist !== undefined && !isNaN(landmarks.rightWrist.x), 'Right wrist solved');
  assert(landmarks.leftHand !== undefined && !isNaN(landmarks.leftHand.x), 'Left hand solved');
  assert(landmarks.rightHand !== undefined && !isNaN(landmarks.rightHand.x), 'Right hand solved');
  assert(landmarks.leftHip !== undefined && !isNaN(landmarks.leftHip.x), 'Left hip solved');
  assert(landmarks.rightHip !== undefined && !isNaN(landmarks.rightHip.x), 'Right hip solved');
  assert(landmarks.leftKnee !== undefined && !isNaN(landmarks.leftKnee.x), 'Left knee solved');
  assert(landmarks.rightKnee !== undefined && !isNaN(landmarks.rightKnee.x), 'Right knee solved');
  assert(landmarks.leftAnkle !== undefined && !isNaN(landmarks.leftAnkle.x), 'Left ankle solved');
  assert(landmarks.rightAnkle !== undefined && !isNaN(landmarks.rightAnkle.x), 'Right ankle solved');
  assert(landmarks.leftFoot !== undefined && !isNaN(landmarks.leftFoot.x), 'Left foot solved');
  assert(landmarks.rightFoot !== undefined && !isNaN(landmarks.rightFoot.x), 'Right foot solved');

  // 2. Movement Library Tests
  console.log('\n[2] Testing Movement Library (all 18 primitives):');
  const movements: MovementType[] = [
    'idle', 'head bob', 'body bounce', 'shoulder bounce',
    'left arm wave', 'right arm wave', 'both arms up',
    'left step', 'right step', 'forward step', 'backward step',
    'hip sway', 'squat', 'jump', 'spin', 'side groove',
    'hands on hips', 'final pose',
  ];

  for (const m of movements) {
    const partial = MovementLibrary.getMovementPose(m, 0.5, 1.0);
    assert(partial !== undefined && typeof partial === 'object', `Movement generated: ${m}`);
  }

  // 3. PoseBlender Tests
  console.log('\n[3] Testing PoseBlender interpolation & blending:');
  const poseA = createNeutralPose();
  const poseB = createNeutralPose();
  poseB.root.y = 0.5;
  poseB.head.angle = 0.4;

  const blendedMid = PoseBlender.blend(poseA, poseB, 0.5);
  assert(Math.abs(blendedMid.root.y - 0.25) < 0.001, 'Root Y blends smoothly at 50%');
  assert(Math.abs(blendedMid.head.angle - 0.2) < 0.001, 'Head angle blends smoothly at 50%');

  // Shortest angular distance check
  const angleBlend = PoseBlender.lerpAngle(Math.PI * 0.9, -Math.PI * 0.9, 0.5);
  assert(Math.abs(Math.abs(angleBlend) - Math.PI) < 0.001, 'Angular interpolation handles wrap-around smoothly');

  const wrapNeg = PoseBlender.lerpAngle(0.1, -0.1, 0.5);
  assert(Math.abs(wrapNeg) < 0.001, 'Angular interpolation stays on the short arc across 0');

  console.log('\n[3b] Testing BPM song matching:');
  const match120 = matchSongByBpm(120);
  assert(match120?.bpm === 120, '120 BPM prefers the 120 BPM song over 60 BPM double-time');
  const match60 = matchSongByBpm(60);
  assert(match60?.bpm === 60, '60 BPM prefers the 60 BPM song over 120 BPM half-time');
  const match128 = matchSongByBpm(128);
  assert(match128?.bpm === 128, 'Exact catalog BPM maps to the matching song');
  assert(matchSongByBpm(0) === null, 'Zero BPM does not force a false match');

  // 4. ChoreographyPlayer Tests
  console.log('\n[4] Testing ChoreographyPlayer:');
  const player = new ChoreographyPlayer();
  const testChoreo = PRESET_CHOREOGRAPHIES[0];
  player.loadChoreography(testChoreo);
  player.play(true);

  const sampled0 = player.samplePoseAtTime(0.0);
  assert(sampled0 !== undefined, 'Sampled keyframe at 0.0s');

  const sampledMid = player.samplePoseAtTime(1.5);
  assert(sampledMid !== undefined && !isNaN(sampledMid.root.y), 'Sampled interpolated keyframe at 1.5s');

  const updateResult = player.update(createNeutralPose(), performance.now() + 100);
  assert(updateResult.pose !== undefined, 'Player update returned valid pose');
  assert(updateResult.state.isPlaying, 'Player state reports isPlaying');

  // 5. BeatDetector & BeatClock Tests
  console.log('\n[5] Testing BeatDetector & BeatClock:');
  const clock = new BeatClock(120);
  const c1 = clock.update(1000);
  const c2 = clock.update(1100);
  assert(c2.phase > c1.phase, 'BeatClock phase increments forward over time');

  clock.syncToBeatOnset(1.0);
  assert(clock.getPhase() <= 1.0 && clock.getPhase() >= 0.0, 'BeatClock phase gently normalized after beat onset');

  const detector = new BeatDetector();
  // Simulate heavy rhythmic kick pulse
  detector.process(0.1, 0.1, 1000);
  detector.process(0.1, 0.1, 1200);
  const beatCheck = detector.process(0.9, 0.8, 1500);
  assert(beatCheck.isBeat, 'BeatDetector reliably identifies kick transient onset');

  // 6. Song Recognition Emulation Tests
  console.log('\n[6] Testing MockSongRecognitionService:');
  const recog = new MockSongRecognitionService();
  recog.setLatency(10);
  assert(!recog.isRealService(), 'Correctly reports service as mock/emulated');

  // A forcedSongId must be set — without it the service intentionally returns null
  // (it has no audio fingerprinting and won't fake a random match from mic input).
  recog.setForcedSongId('song_retro_disco');
  recog.identify().then((song) => {
    assert(song !== null && song.isMock === true, 'Mock recognition returned recognized song item');
    assert(song?.bpm !== undefined && song.bpm > 0, 'Recognized song includes valid BPM');

    // Test failure mode
    recog.setShouldFail(true);
    recog.identify().then((failedSong) => {
      assert(failedSong === null, 'Correctly returns null on recognition failure without crashing');

      // 7. Trending Dance Service Tests
      console.log('\n[7] Testing TrendingDanceService:');
      const trendService = new TrendingDanceService();
      trendService.getDancesByCategory('Trending').then((trending) => {
        assert(trending.length > 0, `Found ${trending.length} trending dances`);
        trendService.getDancesByCategory('All').then((all) => {
          assert(all.length >= trending.length, `Found ${all.length} total dances`);

          console.log('\n=======================================');
          console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
          console.log('=======================================');
          if (failed > 0) {
            process.exit(1);
          } else {
            console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
            process.exit(0);
          }
        });
      });
    });
  });
}

runTests();
