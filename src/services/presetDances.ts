import { Choreography } from '../types/choreography';
import { Song } from '../types/song';

// ─────────────────────────────────────────────────────────────────────────────
// PRESET SONGS — one entry per BPM bracket so the BPM matcher always finds a
// near match regardless of what genre the user plays.
// BPM brackets covered: 60, 70, 75, 80, 84, 90, 95, 100, 110, 113, 120, 128,
//                       132, 140, 150, 160, 175
// ─────────────────────────────────────────────────────────────────────────────
export const PRESET_SONGS: Song[] = [
  // ── Very slow (60–75 BPM) ────────────────────────────────────────────────
  { songId: 'song_slow_ballad',   title: 'Midnight Heartbeat',   artist: 'Luna Voss',          bpm: 60,  danceId: 'dance_slow_ballad',   trending: false, genre: 'Ballad',            createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z' },
  { songId: 'song_soul_groove',   title: 'Velvet Soul',           artist: 'The Amber Section',  bpm: 70,  danceId: 'dance_soul_groove',   trending: false, genre: 'Soul / R&B',        createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z' },
  { songId: 'song_jazz_swing',    title: 'Smoky Room',            artist: 'Earl & The Trio',    bpm: 75,  danceId: 'dance_jazz_swing',    trending: false, genre: 'Jazz',              createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z' },
  // ── Slow–medium (80–95 BPM) ──────────────────────────────────────────────
  { songId: 'song_chill_sway',    title: 'Rainy Cafe Lo-Fi',      artist: 'Coffee & Dreams',    bpm: 84,  danceId: 'dance_chill_sway',    trending: false, genre: 'Lo-Fi Chill',       createdAt: '2026-07-30T00:00:00Z', updatedAt: '2026-08-25T00:00:00Z' },
  { songId: 'song_rnb_flow',      title: 'Golden Hour Drift',     artist: 'Sable & Co.',        bpm: 90,  danceId: 'dance_rnb_flow',      trending: false, genre: 'R&B',               createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z' },
  { songId: 'song_hiphop_bounce', title: 'Block Party Bounce',    artist: 'MC Low-End',         bpm: 95,  danceId: 'dance_hiphop_bounce', trending: false, genre: 'Hip-Hop / Boom Bap',createdAt: '2026-08-15T00:00:00Z', updatedAt: '2026-09-02T00:00:00Z' },
  // ── Medium (100–113 BPM) ─────────────────────────────────────────────────
  { songId: 'song_pop_bounce',    title: 'Sunshine Drive',        artist: 'The Coast Riders',   bpm: 100, danceId: 'dance_pop_bounce',    trending: true,  genre: 'Pop',               createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z' },
  { songId: 'song_funk_step',     title: 'Brass & Sneakers',      artist: 'Funkomatic',         bpm: 108, danceId: 'dance_funk_step',     trending: false, genre: 'Funk',              createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z' },
  { songId: 'song_rick_roll',     title: 'Never Gonna Give You Up', artist: 'Rick Astley',      bpm: 113, danceId: 'dance_rick_roll',     trending: true,  genre: '80s Pop',           createdAt: '2026-09-11T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z' },
  // ── Medium–fast (120–132 BPM) ────────────────────────────────────────────
  { songId: 'song_retro_disco',   title: 'Midnight Boogie',       artist: 'The Velvet Funk Band', bpm: 120, danceId: 'dance_retro_disco', trending: true,  genre: 'Nu-Disco / Funk',   createdAt: '2026-08-20T00:00:00Z', updatedAt: '2026-09-05T00:00:00Z' },
  { songId: 'song_cyber_groove',  title: 'Cyber Pulse 2099',      artist: 'Neon Synthetics',    bpm: 128, danceId: 'dance_cyber_groove',  trending: true,  genre: 'Electronic / Synthwave', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-10T00:00:00Z' },
  { songId: 'song_kpop_energy',   title: 'Starfire Prism',        artist: 'LUMEN-9',            bpm: 132, danceId: 'dance_kpop_energy',   trending: true,  genre: 'K-Pop / Dance Pop', createdAt: '2026-09-05T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z' },
  // ── Fast (140–160 BPM) ───────────────────────────────────────────────────
  { songId: 'song_house_drop',    title: 'Bass Station Alpha',    artist: 'DJ Parallel',        bpm: 140, danceId: 'dance_house_drop',    trending: true,  genre: 'House / EDM',       createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z' },
  { songId: 'song_techno_pulse',  title: 'Industrial Sunrise',    artist: 'Voltwerks',          bpm: 150, danceId: 'dance_techno_pulse',  trending: false, genre: 'Techno',            createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z' },
  { songId: 'song_drum_bass',     title: 'Liquid Chrome',         artist: 'Axiom & Fen',        bpm: 160, danceId: 'dance_drum_bass',     trending: false, genre: 'Drum & Bass',       createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z' },
  // ── Very fast (175 BPM) ──────────────────────────────────────────────────
  { songId: 'song_hardstyle',     title: 'Overdrive Horizon',     artist: 'Kore X',             bpm: 175, danceId: 'dance_hardstyle',     trending: false, genre: 'Hardstyle',         createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRESET CHOREOGRAPHIES — grouped by BPM, labelled with energy level so the
// energy-switcher can pick the right intensity variant at runtime.
// energyLevel: 'low' | 'medium' | 'high'  (used by the switcher in DollyContext)
// ─────────────────────────────────────────────────────────────────────────────
export const PRESET_CHOREOGRAPHIES: Choreography[] = [

  // ── 1. SLOW BALLAD — 60 BPM  (low energy) ───────────────────────────────
  {
    danceId: 'dance_slow_ballad',
    songId: 'song_slow_ballad',
    name: 'Slow Ballad Sway',
    artist: 'Luna Voss',
    bpm: 60,
    duration: 24.0,
    difficulty: 'easy',
    description: 'A tender, slow-breathing sway. Gentle hip rocks, soft head tilts, arms drifting like leaves.',
    tags: ['Ballad', 'Slow', 'Romantic'],
    trending: false,
    keyframes: [
      { time: 0.0,  intensity: 0.4, movementLabel: 'hip sway',  ease: 'easeInOut', pose: { pelvis: { x: -0.3, y: 0, angle: -0.12 }, head: { x: 0, y: 0, angle: 0.1 }, leftArm: { shoulderAngle: 0.3, elbowAngle: 0.3, wristAngle: 0 }, rightArm: { shoulderAngle: 0.3, elbowAngle: 0.3, wristAngle: 0 } } },
      { time: 2.0,  intensity: 0.4, movementLabel: 'hip sway',  ease: 'easeInOut', pose: { pelvis: { x: 0.3, y: 0, angle: 0.12 },  head: { x: 0, y: 0, angle: -0.1 }, leftArm: { shoulderAngle: 0.3, elbowAngle: 0.3, wristAngle: 0 }, rightArm: { shoulderAngle: 0.3, elbowAngle: 0.3, wristAngle: 0 } } },
      { time: 4.0,  intensity: 0.45, movementLabel: 'head bob',  ease: 'easeInOut', pose: { head: { x: 0, y: 0.08, angle: 0.12 }, root: { x: 0, y: 0.05, scaleX: 1, scaleY: 1, rotation: 0 } } },
      { time: 8.0,  intensity: 0.5,  movementLabel: 'left arm wave', ease: 'easeInOut', pose: { leftArm: { shoulderAngle: 0.8, elbowAngle: 0.6, wristAngle: 0.2 }, rightArm: { shoulderAngle: 0.25, elbowAngle: 0.3, wristAngle: 0 } } },
      { time: 12.0, intensity: 0.5,  movementLabel: 'right arm wave', ease: 'easeInOut', pose: { rightArm: { shoulderAngle: 0.8, elbowAngle: 0.6, wristAngle: -0.2 }, leftArm: { shoulderAngle: 0.25, elbowAngle: 0.3, wristAngle: 0 } } },
      { time: 16.0, intensity: 0.4,  movementLabel: 'hip sway',  ease: 'easeInOut', pose: { pelvis: { x: -0.25, y: 0, angle: -0.1 }, head: { x: 0, y: 0, angle: 0.08 } } },
      { time: 23.0, intensity: 0.35, movementLabel: 'final pose', ease: 'easeInOut', pose: { root: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, head: { x: 0, y: 0.04, angle: 0.08 }, leftArm: { shoulderAngle: 0.35, elbowAngle: 0.4, wristAngle: 0 }, rightArm: { shoulderAngle: 0.35, elbowAngle: 0.4, wristAngle: 0 } } },
    ],
  },

  // ── 2. SOUL GROOVE — 70 BPM  (low–medium energy) ────────────────────────
  {
    danceId: 'dance_soul_groove',
    songId: 'song_soul_groove',
    name: 'Velvet Soul Groove',
    artist: 'The Amber Section',
    bpm: 70,
    duration: 22.0,
    difficulty: 'easy',
    description: 'Smooth soul-inspired rolling shoulders, hip pops and a relaxed two-step.',
    tags: ['Soul', 'R&B', 'Smooth'],
    trending: false,
    keyframes: [
      { time: 0.0,  intensity: 0.55, movementLabel: 'shoulder bounce', ease: 'easeInOut', pose: { torso: { angle: 0.12, stretch: 1 }, leftArm: { shoulderAngle: 0.6, elbowAngle: 0.8, wristAngle: 0 }, rightArm: { shoulderAngle: 0.3, elbowAngle: 0.6, wristAngle: 0 } } },
      { time: 1.71, intensity: 0.55, movementLabel: 'shoulder bounce', ease: 'easeInOut', pose: { torso: { angle: -0.12, stretch: 1 }, leftArm: { shoulderAngle: 0.3, elbowAngle: 0.6, wristAngle: 0 }, rightArm: { shoulderAngle: 0.6, elbowAngle: 0.8, wristAngle: 0 } } },
      { time: 3.43, intensity: 0.6,  movementLabel: 'hip sway',  ease: 'easeInOut', pose: { pelvis: { x: -0.35, y: 0, angle: -0.15 }, leftLeg: { hipAngle: 0.15, kneeAngle: 0.2, ankleAngle: 0 }, rightLeg: { hipAngle: -0.05, kneeAngle: 0.05, ankleAngle: 0 } } },
      { time: 5.14, intensity: 0.6,  movementLabel: 'hip sway',  ease: 'easeInOut', pose: { pelvis: { x: 0.35, y: 0, angle: 0.15 },  leftLeg: { hipAngle: -0.05, kneeAngle: 0.05, ankleAngle: 0 }, rightLeg: { hipAngle: 0.15, kneeAngle: 0.2, ankleAngle: 0 } } },
      { time: 8.57, intensity: 0.65, movementLabel: 'left step',  ease: 'easeOut', pose: { root: { x: -0.2, y: 0.06, scaleX: 1, scaleY: 1, rotation: -0.04 }, leftArm: { shoulderAngle: 0.9, elbowAngle: 0.5, wristAngle: 0.1 } } },
      { time: 10.28, intensity: 0.65, movementLabel: 'right step', ease: 'easeOut', pose: { root: { x: 0.2, y: 0.06, scaleX: 1, scaleY: 1, rotation: 0.04 },  rightArm: { shoulderAngle: 0.9, elbowAngle: 0.5, wristAngle: -0.1 } } },
      { time: 14.0, intensity: 0.7,  movementLabel: 'body bounce', ease: 'easeInOut', pose: { root: { x: 0, y: 0.18, scaleX: 1.06, scaleY: 0.95, rotation: 0 }, leftArm: { shoulderAngle: 0.65, elbowAngle: 0.85, wristAngle: 0.1 }, rightArm: { shoulderAngle: 0.65, elbowAngle: 0.85, wristAngle: -0.1 } } },
      { time: 21.0, intensity: 0.5,  movementLabel: 'final pose',  ease: 'easeInOut', pose: { root: { x: 0.08, y: 0.04, scaleX: 1, scaleY: 1, rotation: 0.04 }, leftArm: { shoulderAngle: 0.4, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 0.4, elbowAngle: 0.5, wristAngle: 0 } } },
    ],
  },

  // ── 3. JAZZ SWING — 75 BPM  (low–medium energy) ─────────────────────────
  {
    danceId: 'dance_jazz_swing',
    songId: 'song_jazz_swing',
    name: 'Smoky Jazz Swing',
    artist: 'Earl & The Trio',
    bpm: 75,
    duration: 20.0,
    difficulty: 'easy',
    description: 'Laid-back jazz two-step with swinging arms, hip pendulum and Charleston-style kicks.',
    tags: ['Jazz', 'Swing', 'Classic'],
    trending: false,
    keyframes: [
      { time: 0.0,  intensity: 0.6,  movementLabel: 'side groove',   ease: 'easeInOut', pose: { root: { x: -0.2, y: 0.05, scaleX: 1, scaleY: 1, rotation: -0.06 }, pelvis: { x: -0.25, y: 0, angle: -0.12 }, leftArm: { shoulderAngle: 0.8, elbowAngle: 1.0, wristAngle: 0.15 }, rightArm: { shoulderAngle: 0.35, elbowAngle: 0.6, wristAngle: 0 } } },
      { time: 1.6,  intensity: 0.6,  movementLabel: 'side groove',   ease: 'easeInOut', pose: { root: { x: 0.2, y: 0.05, scaleX: 1, scaleY: 1, rotation: 0.06 },  pelvis: { x: 0.25, y: 0, angle: 0.12 },  leftArm: { shoulderAngle: 0.35, elbowAngle: 0.6, wristAngle: 0 }, rightArm: { shoulderAngle: 0.8, elbowAngle: 1.0, wristAngle: -0.15 } } },
      { time: 3.2,  intensity: 0.65, movementLabel: 'left step',     ease: 'easeOut', pose: { root: { x: -0.28, y: 0.08, scaleX: 1, scaleY: 1, rotation: -0.05 }, leftLeg: { hipAngle: 0.3, kneeAngle: 0.4, ankleAngle: 0 }, leftArm: { shoulderAngle: 1.1, elbowAngle: 0.7, wristAngle: 0.2 } } },
      { time: 4.8,  intensity: 0.65, movementLabel: 'right step',    ease: 'easeOut', pose: { root: { x: 0.28, y: 0.08, scaleX: 1, scaleY: 1, rotation: 0.05 },  rightLeg: { hipAngle: 0.3, kneeAngle: 0.4, ankleAngle: 0 }, rightArm: { shoulderAngle: 1.1, elbowAngle: 0.7, wristAngle: -0.2 } } },
      { time: 8.0,  intensity: 0.7,  movementLabel: 'shoulder bounce', ease: 'easeInOut', pose: { torso: { angle: 0.15, stretch: 1 }, leftArm: { shoulderAngle: 0.7, elbowAngle: 0.9, wristAngle: 0 }, rightArm: { shoulderAngle: 0.35, elbowAngle: 0.6, wristAngle: 0 } } },
      { time: 12.0, intensity: 0.7,  movementLabel: 'hands on hips', ease: 'easeInOut', pose: { leftArm: { shoulderAngle: 0.85, elbowAngle: 1.45, wristAngle: -0.4 }, rightArm: { shoulderAngle: 0.85, elbowAngle: 1.45, wristAngle: -0.4 }, head: { x: 0, y: 0, angle: 0.12 } } },
      { time: 19.0, intensity: 0.6,  movementLabel: 'final pose',    ease: 'easeInOut', pose: { root: { x: 0.1, y: 0.04, scaleX: 1, scaleY: 1, rotation: 0.05 }, leftArm: { shoulderAngle: 0.5, elbowAngle: 0.6, wristAngle: 0 }, rightArm: { shoulderAngle: 0.5, elbowAngle: 0.6, wristAngle: 0 } } },
    ],
  },

  // ── 4. CHILL LO-FI SWAY — 84 BPM  (low energy) ──────────────────────────
  {
    danceId: 'dance_chill_sway',
    songId: 'song_chill_sway',
    name: 'Chill Lo-Fi Sway',
    artist: 'Coffee & Dreams',
    bpm: 84,
    duration: 20.0,
    difficulty: 'easy',
    description: 'Relaxed, laid-back groove with smooth pelvic sways, gentle head tilts, and calming breathing cycles.',
    tags: ['Lo-Fi', 'Chill', 'Relaxed'],
    trending: false,
    keyframes: [
      { time: 0.0,  intensity: 0.6, movementLabel: 'hip sway',  ease: 'easeInOut', pose: { pelvis: { x: -0.35, y: 0, angle: -0.15 }, head: { x: 0, y: 0.05, angle: 0.12 }, leftArm: { shoulderAngle: 0.3, elbowAngle: 0.4, wristAngle: 0 }, rightArm: { shoulderAngle: 0.3, elbowAngle: 0.4, wristAngle: 0 } } },
      { time: 2.85, intensity: 0.6, movementLabel: 'hip sway',  ease: 'easeInOut', pose: { pelvis: { x: 0.35, y: 0, angle: 0.15 },  head: { x: 0, y: 0.05, angle: -0.12 }, leftArm: { shoulderAngle: 0.3, elbowAngle: 0.4, wristAngle: 0 }, rightArm: { shoulderAngle: 0.3, elbowAngle: 0.4, wristAngle: 0 } } },
      { time: 5.7,  intensity: 0.65, movementLabel: 'head bob', ease: 'easeInOut', pose: { head: { x: 0, y: 0.12, angle: 0.2 }, root: { x: 0, y: 0.08, scaleX: 1.02, scaleY: 0.98, rotation: 0 } } },
      { time: 10.0, intensity: 0.6, movementLabel: 'shoulder bounce', ease: 'easeInOut', pose: { torso: { angle: 0.1, stretch: 1 }, leftArm: { shoulderAngle: 0.5, elbowAngle: 0.7, wristAngle: 0 } } },
      { time: 19.0, intensity: 0.6, movementLabel: 'final pose', ease: 'easeInOut', pose: { root: { x: 0, y: 0.05, scaleX: 1, scaleY: 1, rotation: 0 }, head: { x: 0, y: 0.05, angle: 0.1 }, leftArm: { shoulderAngle: 0.4, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 0.4, elbowAngle: 0.5, wristAngle: 0 } } },
    ],
  },

  // ── 5. R&B FLOW — 90 BPM  (medium energy) ───────────────────────────────
  {
    danceId: 'dance_rnb_flow',
    songId: 'song_rnb_flow',
    name: 'Golden Hour R&B',
    artist: 'Sable & Co.',
    bpm: 90,
    duration: 18.0,
    difficulty: 'easy',
    description: 'Smooth R&B two-step with flowing arm rolls, hip locks and a relaxed body wave.',
    tags: ['R&B', 'Smooth', 'Groove'],
    trending: false,
    keyframes: [
      { time: 0.0,  intensity: 0.65, movementLabel: 'hip sway',       ease: 'easeInOut', pose: { pelvis: { x: -0.4, y: 0, angle: -0.18 }, leftArm: { shoulderAngle: 0.6, elbowAngle: 0.9, wristAngle: 0.1 }, rightArm: { shoulderAngle: 0.3, elbowAngle: 0.5, wristAngle: 0 } } },
      { time: 1.33, intensity: 0.65, movementLabel: 'hip sway',       ease: 'easeInOut', pose: { pelvis: { x: 0.4, y: 0, angle: 0.18 },  leftArm: { shoulderAngle: 0.3, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 0.6, elbowAngle: 0.9, wristAngle: -0.1 } } },
      { time: 2.67, intensity: 0.7,  movementLabel: 'shoulder bounce', ease: 'easeInOut', pose: { torso: { angle: 0.14, stretch: 1 }, leftArm: { shoulderAngle: 0.7, elbowAngle: 0.6, wristAngle: 0 } } },
      { time: 4.0,  intensity: 0.75, movementLabel: 'body bounce',    ease: 'easeInOut', pose: { root: { x: 0, y: 0.2, scaleX: 1.07, scaleY: 0.95, rotation: 0 }, leftArm: { shoulderAngle: 0.7, elbowAngle: 0.9, wristAngle: 0.1 }, rightArm: { shoulderAngle: 0.7, elbowAngle: 0.9, wristAngle: -0.1 } } },
      { time: 6.67, intensity: 0.75, movementLabel: 'left step',      ease: 'easeOut', pose: { root: { x: -0.25, y: 0.08, scaleX: 1, scaleY: 1, rotation: -0.05 }, leftArm: { shoulderAngle: 1.0, elbowAngle: 0.4, wristAngle: 0.15 } } },
      { time: 8.0,  intensity: 0.75, movementLabel: 'right step',     ease: 'easeOut', pose: { root: { x: 0.25, y: 0.08, scaleX: 1, scaleY: 1, rotation: 0.05 },  rightArm: { shoulderAngle: 1.0, elbowAngle: 0.4, wristAngle: -0.15 } } },
      { time: 12.0, intensity: 0.8,  movementLabel: 'side groove',    ease: 'easeInOut', pose: { root: { x: -0.2, y: 0.05, scaleX: 1, scaleY: 1, rotation: -0.07 }, pelvis: { x: -0.3, y: 0, angle: -0.14 } } },
      { time: 17.0, intensity: 0.65, movementLabel: 'final pose',     ease: 'easeInOut', pose: { root: { x: 0.08, y: 0.04, scaleX: 1, scaleY: 1, rotation: 0.04 }, leftArm: { shoulderAngle: 0.45, elbowAngle: 0.55, wristAngle: 0 }, rightArm: { shoulderAngle: 0.45, elbowAngle: 0.55, wristAngle: 0 } } },
    ],
  },

  // ── 6. HIP-HOP BOUNCE — 95 BPM  (medium energy) ─────────────────────────
  {
    danceId: 'dance_hiphop_bounce',
    songId: 'song_hiphop_bounce',
    name: 'Hip-Hop Bounce',
    artist: 'MC Low-End',
    bpm: 95,
    duration: 18.0,
    difficulty: 'medium',
    description: 'Heavy bass swagger with deep knee squats, forward chest pops, and rhythmic head nods.',
    tags: ['Hip-Hop', 'Street', 'Bass'],
    trending: false,
    keyframes: [
      { time: 0.0,  intensity: 0.9,  movementLabel: 'squat',         ease: 'easeOut', pose: { root: { x: 0, y: 0.35, scaleX: 1.15, scaleY: 0.9, rotation: 0 }, leftLeg: { hipAngle: 0.4, kneeAngle: 0.7, ankleAngle: -0.2 }, rightLeg: { hipAngle: 0.4, kneeAngle: 0.7, ankleAngle: -0.2 }, leftArm: { shoulderAngle: 0.7, elbowAngle: 1.0, wristAngle: 0 }, rightArm: { shoulderAngle: 0.7, elbowAngle: 1.0, wristAngle: 0 } } },
      { time: 1.26, intensity: 0.9,  movementLabel: 'forward step',  ease: 'easeInOut', pose: { root: { x: 0, y: 0.1, scaleX: 1.05, scaleY: 1.05, rotation: 0.05 }, torso: { angle: 0.2, stretch: 1 }, head: { x: 0, y: 0.1, angle: 0.25 } } },
      { time: 2.52, intensity: 0.85, movementLabel: 'backward step', ease: 'easeInOut', pose: { root: { x: 0, y: -0.05, scaleX: 0.95, scaleY: 0.95, rotation: -0.05 }, torso: { angle: -0.15, stretch: 1 } } },
      { time: 5.0,  intensity: 1.0,  movementLabel: 'body bounce',   ease: 'easeInOut', pose: { root: { x: 0, y: 0.25, scaleX: 1.1, scaleY: 0.9, rotation: 0 }, leftArm: { shoulderAngle: 0.9, elbowAngle: 0.8, wristAngle: 0.3 }, rightArm: { shoulderAngle: 0.9, elbowAngle: 0.8, wristAngle: -0.3 } } },
      { time: 10.0, intensity: 0.9,  movementLabel: 'side groove',   ease: 'easeInOut', pose: { root: { x: -0.35, y: 0.15, scaleX: 1, scaleY: 1, rotation: -0.12 }, leftArm: { shoulderAngle: 1.1, elbowAngle: 0.6, wristAngle: 0 }, rightArm: { shoulderAngle: 0.3, elbowAngle: 0.9, wristAngle: 0 } } },
      { time: 17.0, intensity: 1.0,  movementLabel: 'final pose',    ease: 'easeOut', pose: { root: { x: 0.15, y: 0.12, scaleX: 1, scaleY: 1, rotation: 0.08 }, leftArm: { shoulderAngle: 1.2, elbowAngle: 1.3, wristAngle: -0.2 }, rightArm: { shoulderAngle: 1.2, elbowAngle: 1.3, wristAngle: 0.2 } } },
    ],
  },

  // ── 7. POP BOUNCE — 100 BPM  (medium energy) ────────────────────────────
  {
    danceId: 'dance_pop_bounce',
    songId: 'song_pop_bounce',
    name: 'Sunshine Pop Bounce',
    artist: 'The Coast Riders',
    bpm: 100,
    duration: 16.0,
    difficulty: 'easy',
    description: 'Upbeat pop bounce with alternating arm swings, a little shimmy and cheerful body pops.',
    tags: ['Pop', 'Upbeat', 'Fun'],
    trending: true,
    keyframes: [
      { time: 0.0,  intensity: 0.75, movementLabel: 'body bounce',    ease: 'easeInOut', pose: { root: { x: 0, y: 0.18, scaleX: 1.06, scaleY: 0.95, rotation: 0 }, leftArm: { shoulderAngle: 0.65, elbowAngle: 0.85, wristAngle: 0.1 }, rightArm: { shoulderAngle: 0.65, elbowAngle: 0.85, wristAngle: -0.1 } } },
      { time: 1.2,  intensity: 0.8,  movementLabel: 'left arm wave',  ease: 'easeInOut', pose: { root: { x: -0.1, y: 0.1, scaleX: 1, scaleY: 1, rotation: -0.05 }, leftArm: { shoulderAngle: 1.4, elbowAngle: 0.9, wristAngle: 0.3 }, rightArm: { shoulderAngle: 0.4, elbowAngle: 0.5, wristAngle: 0 } } },
      { time: 2.4,  intensity: 0.8,  movementLabel: 'right arm wave', ease: 'easeInOut', pose: { root: { x: 0.1, y: 0.1, scaleX: 1, scaleY: 1, rotation: 0.05 },  leftArm: { shoulderAngle: 0.4, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 1.4, elbowAngle: 0.9, wristAngle: -0.3 } } },
      { time: 4.8,  intensity: 0.85, movementLabel: 'side groove',    ease: 'easeInOut', pose: { root: { x: -0.22, y: 0.08, scaleX: 1, scaleY: 1, rotation: -0.07 }, pelvis: { x: -0.28, y: 0, angle: -0.12 } } },
      { time: 6.0,  intensity: 0.85, movementLabel: 'side groove',    ease: 'easeInOut', pose: { root: { x: 0.22, y: 0.08, scaleX: 1, scaleY: 1, rotation: 0.07 },  pelvis: { x: 0.28, y: 0, angle: 0.12 } } },
      { time: 8.0,  intensity: 0.9,  movementLabel: 'both arms up',   ease: 'easeOut', pose: { root: { x: 0, y: -0.12, scaleX: 0.97, scaleY: 1.05, rotation: 0 }, leftArm: { shoulderAngle: 1.75, elbowAngle: 0.6, wristAngle: 0.2 }, rightArm: { shoulderAngle: 1.75, elbowAngle: 0.6, wristAngle: -0.2 } } },
      { time: 15.0, intensity: 0.85, movementLabel: 'final pose',     ease: 'easeOut', pose: { root: { x: 0.1, y: 0.05, scaleX: 1, scaleY: 1, rotation: 0.06 }, leftArm: { shoulderAngle: 1.9, elbowAngle: 0.2, wristAngle: 0.2 }, rightArm: { shoulderAngle: 0.8, elbowAngle: 1.3, wristAngle: -0.2 } } },
    ],
  },

  // ── 8. FUNK STEP — 108 BPM  (medium–high energy) ────────────────────────
  {
    danceId: 'dance_funk_step',
    songId: 'song_funk_step',
    name: 'Brass & Sneakers Funk',
    artist: 'Funkomatic',
    bpm: 108,
    duration: 16.0,
    difficulty: 'medium',
    description: 'Sharp funky steps with popping arms, hip locks and a classic point-and-bounce combo.',
    tags: ['Funk', 'Groove', 'Stepping'],
    trending: false,
    keyframes: [
      { time: 0.0,  intensity: 0.8,  movementLabel: 'hands on hips',  ease: 'easeInOut', pose: { leftArm: { shoulderAngle: 0.85, elbowAngle: 1.45, wristAngle: -0.4 }, rightArm: { shoulderAngle: 0.85, elbowAngle: 1.45, wristAngle: -0.4 }, torso: { angle: 0.1, stretch: 1 } } },
      { time: 1.11, intensity: 0.85, movementLabel: 'left step',      ease: 'easeOut', pose: { root: { x: -0.28, y: 0.08, scaleX: 1, scaleY: 1, rotation: -0.06 }, leftLeg: { hipAngle: 0.28, kneeAngle: 0.35, ankleAngle: 0 }, rightArm: { shoulderAngle: 1.1, elbowAngle: 0.2, wristAngle: -0.2 } } },
      { time: 2.22, intensity: 0.85, movementLabel: 'right step',     ease: 'easeOut', pose: { root: { x: 0.28, y: 0.08, scaleX: 1, scaleY: 1, rotation: 0.06 },  rightLeg: { hipAngle: 0.28, kneeAngle: 0.35, ankleAngle: 0 }, leftArm: { shoulderAngle: 1.1, elbowAngle: 0.2, wristAngle: 0.2 } } },
      { time: 3.33, intensity: 0.9,  movementLabel: 'body bounce',    ease: 'easeInOut', pose: { root: { x: 0, y: 0.22, scaleX: 1.08, scaleY: 0.94, rotation: 0 }, leftArm: { shoulderAngle: 0.8, elbowAngle: 0.9, wristAngle: 0.2 }, rightArm: { shoulderAngle: 0.8, elbowAngle: 0.9, wristAngle: -0.2 } } },
      { time: 6.67, intensity: 0.9,  movementLabel: 'shoulder bounce', ease: 'easeInOut', pose: { torso: { angle: 0.16, stretch: 1 }, leftArm: { shoulderAngle: 0.65, elbowAngle: 0.75, wristAngle: 0 }, rightArm: { shoulderAngle: 0.35, elbowAngle: 0.55, wristAngle: 0 } } },
      { time: 8.89, intensity: 0.95, movementLabel: 'side groove',    ease: 'easeInOut', pose: { root: { x: -0.25, y: 0.1, scaleX: 1, scaleY: 1, rotation: -0.09 }, pelvis: { x: -0.35, y: 0, angle: -0.16 }, leftArm: { shoulderAngle: 1.2, elbowAngle: 0.5, wristAngle: 0.15 } } },
      { time: 11.11, intensity: 0.95, movementLabel: 'side groove',   ease: 'easeInOut', pose: { root: { x: 0.25, y: 0.1, scaleX: 1, scaleY: 1, rotation: 0.09 },  pelvis: { x: 0.35, y: 0, angle: 0.16 }, rightArm: { shoulderAngle: 1.2, elbowAngle: 0.5, wristAngle: -0.15 } } },
      { time: 15.0, intensity: 1.0,  movementLabel: 'final pose',     ease: 'easeOut', pose: { root: { x: 0.12, y: 0.08, scaleX: 1, scaleY: 1, rotation: 0.07 }, leftArm: { shoulderAngle: 2.0, elbowAngle: 0.15, wristAngle: 0.3 }, rightArm: { shoulderAngle: 0.85, elbowAngle: 1.4, wristAngle: -0.3 } } },
    ],
  },

  // ── 9. RICK ROLL — 113 BPM  (medium–high energy) ────────────────────────
  {
    danceId: 'dance_rick_roll',
    songId: 'song_rick_roll',
    name: 'Rick Roll',
    artist: 'Rick Astley',
    bpm: 113,
    duration: 20.0,
    difficulty: 'medium',
    description: 'The legendary 80s point-and-shuffle. Features the iconic side-step, shoulder rolls, big arm swings and the unforgettable finger point.',
    tags: ['80s', 'Classic', 'Meme', 'Pop'],
    trending: true,
    keyframes: [
      { time: 0.0,  intensity: 0.75, movementLabel: 'hands on hips',  ease: 'easeInOut', pose: { root: { x: 0, y: 0.05, scaleX: 1, scaleY: 1, rotation: 0 }, head: { x: 0, y: 0, angle: 0.1 }, leftArm: { shoulderAngle: 0.85, elbowAngle: 1.45, wristAngle: -0.4 }, rightArm: { shoulderAngle: 0.85, elbowAngle: 1.45, wristAngle: -0.4 }, torso: { angle: 0.08, stretch: 1 } } },
      { time: 1.06, intensity: 0.8,  movementLabel: 'shoulder bounce', ease: 'easeInOut', pose: { root: { x: -0.1, y: 0.05, scaleX: 1, scaleY: 1, rotation: -0.06 }, torso: { angle: 0.18, stretch: 1 }, leftArm: { shoulderAngle: 0.7, elbowAngle: 1.3, wristAngle: -0.3 }, rightArm: { shoulderAngle: 1.0, elbowAngle: 1.5, wristAngle: -0.5 } } },
      { time: 2.12, intensity: 0.8,  movementLabel: 'shoulder bounce', ease: 'easeInOut', pose: { root: { x: 0.1, y: 0.05, scaleX: 1, scaleY: 1, rotation: 0.06 },  torso: { angle: -0.18, stretch: 1 }, leftArm: { shoulderAngle: 1.0, elbowAngle: 1.5, wristAngle: -0.5 }, rightArm: { shoulderAngle: 0.7, elbowAngle: 1.3, wristAngle: -0.3 } } },
      { time: 3.18, intensity: 0.9,  movementLabel: 'left step',      ease: 'easeOut', pose: { root: { x: -0.3, y: 0.08, scaleX: 1, scaleY: 1, rotation: -0.05 }, pelvis: { x: -0.2, y: 0, angle: -0.1 }, leftLeg: { hipAngle: 0.25, kneeAngle: 0.3, ankleAngle: 0 }, rightArm: { shoulderAngle: 1.1, elbowAngle: 0.2, wristAngle: -0.2 }, leftArm: { shoulderAngle: 0.5, elbowAngle: 0.8, wristAngle: 0 } } },
      { time: 4.24, intensity: 0.9,  movementLabel: 'right step',     ease: 'easeOut', pose: { root: { x: 0.3, y: 0.08, scaleX: 1, scaleY: 1, rotation: 0.05 },  pelvis: { x: 0.2, y: 0, angle: 0.1 },  rightLeg: { hipAngle: 0.25, kneeAngle: 0.3, ankleAngle: 0 }, leftArm: { shoulderAngle: 1.1, elbowAngle: 0.2, wristAngle: 0.2 }, rightArm: { shoulderAngle: 0.5, elbowAngle: 0.8, wristAngle: 0 } } },
      { time: 5.3,  intensity: 0.9,  movementLabel: 'left step',      ease: 'easeOut', pose: { root: { x: -0.25, y: 0.08, scaleX: 1, scaleY: 1, rotation: -0.05 }, rightArm: { shoulderAngle: 1.2, elbowAngle: 0.15, wristAngle: -0.25 }, leftArm: { shoulderAngle: 0.45, elbowAngle: 0.75, wristAngle: 0 } } },
      { time: 6.36, intensity: 0.85, movementLabel: 'body bounce',    ease: 'easeInOut', pose: { root: { x: 0, y: 0.2, scaleX: 1.08, scaleY: 0.94, rotation: 0 }, leftLeg: { hipAngle: 0.3, kneeAngle: 0.45, ankleAngle: -0.1 }, rightLeg: { hipAngle: 0.3, kneeAngle: 0.45, ankleAngle: -0.1 }, leftArm: { shoulderAngle: 0.7, elbowAngle: 0.9, wristAngle: 0.1 }, rightArm: { shoulderAngle: 0.7, elbowAngle: 0.9, wristAngle: -0.1 } } },
      { time: 7.96, intensity: 0.95, movementLabel: 'left arm wave',  ease: 'easeInOut', pose: { root: { x: -0.15, y: 0.1, scaleX: 1.05, scaleY: 0.96, rotation: -0.08 }, torso: { angle: 0.12, stretch: 1 }, leftArm: { shoulderAngle: 1.5, elbowAngle: 1.0, wristAngle: 0.3 }, rightArm: { shoulderAngle: 0.35, elbowAngle: 0.5, wristAngle: 0 }, head: { x: 0, y: 0, angle: 0.15 } } },
      { time: 9.03, intensity: 0.95, movementLabel: 'right arm wave', ease: 'easeInOut', pose: { root: { x: 0.15, y: 0.1, scaleX: 1.05, scaleY: 0.96, rotation: 0.08 },  torso: { angle: -0.12, stretch: 1 }, leftArm: { shoulderAngle: 0.35, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 1.5, elbowAngle: 1.0, wristAngle: -0.3 }, head: { x: 0, y: 0, angle: -0.15 } } },
      { time: 10.1, intensity: 1.0,  movementLabel: 'hip sway',       ease: 'easeOut', pose: { root: { x: -0.2, y: 0, scaleX: 1, scaleY: 1, rotation: -0.06 }, pelvis: { x: -0.4, y: 0, angle: -0.2 }, rightArm: { shoulderAngle: 1.35, elbowAngle: 0.1, wristAngle: -0.15 }, leftArm: { shoulderAngle: 0.5, elbowAngle: 1.1, wristAngle: 0.2 }, head: { x: 0, y: 0, angle: -0.12 } } },
      { time: 11.16, intensity: 1.0, movementLabel: 'hip sway',       ease: 'easeOut', pose: { root: { x: 0.2, y: 0, scaleX: 1, scaleY: 1, rotation: 0.06 },  pelvis: { x: 0.4, y: 0, angle: 0.2 },  leftArm: { shoulderAngle: 1.35, elbowAngle: 0.1, wristAngle: 0.15 }, rightArm: { shoulderAngle: 0.5, elbowAngle: 1.1, wristAngle: -0.2 }, head: { x: 0, y: 0, angle: 0.12 } } },
      { time: 12.21, intensity: 1.0, movementLabel: 'both arms up',   ease: 'easeOut', pose: { root: { x: 0, y: -0.12, scaleX: 0.97, scaleY: 1.06, rotation: 0 }, leftArm: { shoulderAngle: 1.75, elbowAngle: 0.6, wristAngle: 0.2 }, rightArm: { shoulderAngle: 1.75, elbowAngle: 0.6, wristAngle: -0.2 }, head: { x: 0, y: -0.05, angle: -0.08 } } },
      { time: 13.81, intensity: 1.0, movementLabel: 'spin',           ease: 'linear', pose: { root: { x: 0, y: 0, scaleX: -1, scaleY: 1, rotation: 0 }, leftArm: { shoulderAngle: 0.7, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 0.7, elbowAngle: 0.5, wristAngle: 0 } } },
      { time: 14.87, intensity: 1.0, movementLabel: 'jump',           ease: 'easeOut', pose: { root: { x: 0, y: -0.5, scaleX: 0.92, scaleY: 1.12, rotation: 0 }, leftLeg: { hipAngle: -0.2, kneeAngle: 0.4, ankleAngle: 0 }, rightLeg: { hipAngle: -0.2, kneeAngle: 0.4, ankleAngle: 0 }, leftArm: { shoulderAngle: 1.6, elbowAngle: 0.5, wristAngle: 0.1 }, rightArm: { shoulderAngle: 1.6, elbowAngle: 0.5, wristAngle: -0.1 } } },
      { time: 15.93, intensity: 0.9, movementLabel: 'body bounce',    ease: 'easeInOut', pose: { root: { x: 0, y: 0.15, scaleX: 1.06, scaleY: 0.95, rotation: 0 }, leftArm: { shoulderAngle: 0.65, elbowAngle: 0.85, wristAngle: 0.1 }, rightArm: { shoulderAngle: 0.65, elbowAngle: 0.85, wristAngle: -0.1 } } },
      { time: 18.0, intensity: 1.0,  movementLabel: 'final pose',     ease: 'easeOut', pose: { root: { x: 0.1, y: 0, scaleX: 1, scaleY: 1, rotation: 0.07 }, head: { x: 0, y: 0, angle: -0.18 }, rightArm: { shoulderAngle: 2.0, elbowAngle: 0.05, wristAngle: -0.1 }, leftArm: { shoulderAngle: 0.3, elbowAngle: 0.4, wristAngle: 0.1 }, torso: { angle: 0.06, stretch: 1.02 } } },
    ],
  },

  // ── 10. RETRO DISCO — 120 BPM  (medium–high energy) ─────────────────────
  {
    danceId: 'dance_retro_disco',
    songId: 'song_retro_disco',
    name: 'Retro Disco Pop',
    artist: 'The Velvet Funk Band',
    bpm: 120,
    duration: 16.0,
    difficulty: 'easy',
    description: 'Funky retro dance inspired by 70s disco, emphasizing hip sways, rhythmic shoulder shrugs, and point gestures.',
    tags: ['Disco', 'Funk', 'Party'],
    trending: true,
    keyframes: [
      { time: 0.0,  intensity: 0.7,  movementLabel: 'hip sway',       ease: 'easeInOut', pose: { pelvis: { x: -0.4, y: 0, angle: -0.2 }, leftArm: { shoulderAngle: 0.5, elbowAngle: 0.9, wristAngle: 0 }, rightArm: { shoulderAngle: 0.5, elbowAngle: 0.9, wristAngle: 0 } } },
      { time: 1.0,  intensity: 0.8,  movementLabel: 'hip sway',       ease: 'easeInOut', pose: { pelvis: { x: 0.4, y: 0, angle: 0.2 },  leftArm: { shoulderAngle: 0.3, elbowAngle: 0.6, wristAngle: 0 }, rightArm: { shoulderAngle: 1.2, elbowAngle: 0.4, wristAngle: 0.3 } } },
      { time: 2.0,  intensity: 0.85, movementLabel: 'shoulder bounce', ease: 'easeInOut', pose: { torso: { angle: 0.15, stretch: 1 }, leftArm: { shoulderAngle: 0.7, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 0.2, elbowAngle: 0.7, wristAngle: 0 } } },
      { time: 3.0,  intensity: 0.85, movementLabel: 'shoulder bounce', ease: 'easeInOut', pose: { torso: { angle: -0.15, stretch: 1 }, leftArm: { shoulderAngle: 0.2, elbowAngle: 0.7, wristAngle: 0 }, rightArm: { shoulderAngle: 0.7, elbowAngle: 0.5, wristAngle: 0 } } },
      { time: 4.0,  intensity: 0.9,  movementLabel: 'side groove',    ease: 'easeInOut', pose: { root: { x: -0.3, y: 0.1, scaleX: 1, scaleY: 1, rotation: -0.1 }, leftArm: { shoulderAngle: 1.4, elbowAngle: 0.3, wristAngle: 0.2 }, rightArm: { shoulderAngle: 0.4, elbowAngle: 1.2, wristAngle: 0 } } },
      { time: 6.0,  intensity: 0.9,  movementLabel: 'side groove',    ease: 'easeInOut', pose: { root: { x: 0.3, y: 0.1, scaleX: 1, scaleY: 1, rotation: 0.1 },  leftArm: { shoulderAngle: 0.4, elbowAngle: 1.2, wristAngle: 0 }, rightArm: { shoulderAngle: 1.4, elbowAngle: 0.3, wristAngle: -0.2 } } },
      { time: 8.0,  intensity: 0.8,  movementLabel: 'hands on hips',  ease: 'easeInOut', pose: { leftArm: { shoulderAngle: 0.85, elbowAngle: 1.45, wristAngle: -0.4 }, rightArm: { shoulderAngle: 0.85, elbowAngle: 1.45, wristAngle: -0.4 }, head: { x: 0, y: 0, angle: 0.15 } } },
      { time: 12.0, intensity: 1.0,  movementLabel: 'both arms up',   ease: 'easeOut', pose: { root: { x: 0, y: -0.15, scaleX: 0.95, scaleY: 1.06, rotation: 0 }, leftArm: { shoulderAngle: 1.8, elbowAngle: 0.6, wristAngle: 0.2 }, rightArm: { shoulderAngle: 1.8, elbowAngle: 0.6, wristAngle: -0.2 } } },
      { time: 15.5, intensity: 1.0,  movementLabel: 'final pose',     ease: 'easeOut', pose: { root: { x: 0.1, y: 0.05, scaleX: 1, scaleY: 1, rotation: 0.05 }, leftArm: { shoulderAngle: 2.0, elbowAngle: 0.2, wristAngle: 0.2 }, rightArm: { shoulderAngle: 0.9, elbowAngle: 1.4, wristAngle: -0.3 } } },
    ],
  },

  // ── 11. CYBER GROOVE — 128 BPM  (high energy) ───────────────────────────
  {
    danceId: 'dance_cyber_groove',
    songId: 'song_cyber_groove',
    name: 'Cyber Groove',
    artist: 'Neon Synthetics',
    bpm: 128,
    duration: 15.0,
    difficulty: 'medium',
    description: 'High-octane electronic shuffle featuring synchronized arm waves, jump drops, and rave pump keyframes.',
    tags: ['Electronic', 'High Energy', 'Rave'],
    trending: true,
    keyframes: [
      { time: 0.0,  intensity: 0.8,  movementLabel: 'body bounce',    pose: { root: { x: 0, y: 0.15, scaleX: 1.05, scaleY: 0.95, rotation: 0 }, leftArm: { shoulderAngle: 0.4, elbowAngle: 0.6, wristAngle: 0 }, rightArm: { shoulderAngle: 0.4, elbowAngle: 0.6, wristAngle: 0 } } },
      { time: 0.93, intensity: 0.9,  movementLabel: 'left arm wave',  pose: { root: { x: -0.15, y: -0.05, scaleX: 1, scaleY: 1, rotation: -0.08 }, leftArm: { shoulderAngle: 1.4, elbowAngle: 1.2, wristAngle: 0.3 }, rightArm: { shoulderAngle: 0.3, elbowAngle: 0.4, wristAngle: 0 } } },
      { time: 1.87, intensity: 0.9,  movementLabel: 'right arm wave', pose: { root: { x: 0.15, y: -0.05, scaleX: 1, scaleY: 1, rotation: 0.08 },  leftArm: { shoulderAngle: 0.3, elbowAngle: 0.4, wristAngle: 0 }, rightArm: { shoulderAngle: 1.4, elbowAngle: 1.2, wristAngle: -0.3 } } },
      { time: 2.81, intensity: 1.0,  movementLabel: 'both arms up',   pose: { root: { x: 0, y: -0.2, scaleX: 0.95, scaleY: 1.08, rotation: 0 }, head: { x: 0, y: -0.05, angle: -0.1 }, leftArm: { shoulderAngle: 1.9, elbowAngle: 0.8, wristAngle: 0.2 }, rightArm: { shoulderAngle: 1.9, elbowAngle: 0.8, wristAngle: -0.2 } } },
      { time: 3.75, intensity: 0.85, movementLabel: 'side groove',    pose: { root: { x: 0.25, y: 0.1, scaleX: 1, scaleY: 1, rotation: 0.1 }, pelvis: { x: 0.3, y: 0, angle: 0.15 }, leftArm: { shoulderAngle: 0.7, elbowAngle: 0.9, wristAngle: 0 }, rightArm: { shoulderAngle: 0.2, elbowAngle: 0.4, wristAngle: 0 } } },
      { time: 4.68, intensity: 1.0,  movementLabel: 'jump',           pose: { root: { x: 0, y: -0.6, scaleX: 0.9, scaleY: 1.15, rotation: 0 }, leftLeg: { hipAngle: -0.2, kneeAngle: 0.4, ankleAngle: 0 }, rightLeg: { hipAngle: -0.2, kneeAngle: 0.4, ankleAngle: 0 }, leftArm: { shoulderAngle: 1.6, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 1.6, elbowAngle: 0.5, wristAngle: 0 } } },
      { time: 5.62, intensity: 0.9,  movementLabel: 'squat',          pose: { root: { x: 0, y: 0.45, scaleX: 1.2, scaleY: 0.85, rotation: 0 }, leftLeg: { hipAngle: 0.6, kneeAngle: 0.9, ankleAngle: -0.2 }, rightLeg: { hipAngle: 0.6, kneeAngle: 0.9, ankleAngle: -0.2 }, leftArm: { shoulderAngle: 0.8, elbowAngle: 0.9, wristAngle: 0 }, rightArm: { shoulderAngle: 0.8, elbowAngle: 0.9, wristAngle: 0 } } },
      { time: 7.5,  intensity: 0.9,  movementLabel: 'spin',           pose: { root: { x: 0, y: 0, scaleX: -1, scaleY: 1, rotation: 0 }, leftArm: { shoulderAngle: 0.6, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 0.6, elbowAngle: 0.5, wristAngle: 0 } } },
      { time: 9.37, intensity: 1.0,  movementLabel: 'both arms up',   pose: { root: { x: 0, y: -0.15, scaleX: 1, scaleY: 1.05, rotation: 0 }, leftArm: { shoulderAngle: 2.1, elbowAngle: 0.5, wristAngle: 0.2 }, rightArm: { shoulderAngle: 2.1, elbowAngle: 0.5, wristAngle: -0.2 } } },
      { time: 14.5, intensity: 1.0,  movementLabel: 'final pose',     pose: { root: { x: 0.12, y: 0.08, scaleX: 1, scaleY: 1, rotation: 0.08 }, head: { x: 0, y: 0, angle: -0.2 }, leftArm: { shoulderAngle: 2.1, elbowAngle: 0.2, wristAngle: 0.3 }, rightArm: { shoulderAngle: 0.95, elbowAngle: 1.5, wristAngle: -0.3 } } },
    ],
  },

  // ── 12. K-POP ENERGY — 132 BPM  (high energy) ───────────────────────────
  {
    danceId: 'dance_kpop_energy',
    songId: 'song_kpop_energy',
    name: 'K-Pop Energy Blast',
    artist: 'LUMEN-9',
    bpm: 132,
    duration: 14.0,
    difficulty: 'hard',
    description: 'Razor-sharp choreography with synchronized arm transitions, jumping beat drops, and sharp silhouette freezes.',
    tags: ['K-Pop', 'Fast', 'Choreography'],
    trending: true,
    keyframes: [
      { time: 0.0,  intensity: 0.9,  movementLabel: 'both arms up',   pose: { root: { x: 0, y: -0.1, scaleX: 1, scaleY: 1.05, rotation: 0 }, leftArm: { shoulderAngle: 1.8, elbowAngle: 0.7, wristAngle: 0.2 }, rightArm: { shoulderAngle: 1.8, elbowAngle: 0.7, wristAngle: -0.2 } } },
      { time: 0.91, intensity: 1.0,  movementLabel: 'jump',           pose: { root: { x: 0, y: -0.55, scaleX: 0.9, scaleY: 1.12, rotation: 0 }, leftLeg: { hipAngle: -0.2, kneeAngle: 0.35, ankleAngle: 0 }, rightLeg: { hipAngle: -0.2, kneeAngle: 0.35, ankleAngle: 0 } } },
      { time: 1.82, intensity: 0.85, movementLabel: 'spin',           pose: { root: { x: 0, y: 0, scaleX: -1, scaleY: 1, rotation: 0 } } },
      { time: 2.73, intensity: 0.9,  movementLabel: 'left step',      pose: { root: { x: -0.3, y: 0.1, scaleX: 1, scaleY: 1, rotation: -0.08 }, leftArm: { shoulderAngle: 1.2, elbowAngle: 0.4, wristAngle: 0.3 }, rightArm: { shoulderAngle: 0.4, elbowAngle: 1.1, wristAngle: 0 } } },
      { time: 3.64, intensity: 0.9,  movementLabel: 'right step',     pose: { root: { x: 0.3, y: 0.1, scaleX: 1, scaleY: 1, rotation: 0.08 },  leftArm: { shoulderAngle: 0.4, elbowAngle: 1.1, wristAngle: 0 }, rightArm: { shoulderAngle: 1.2, elbowAngle: 0.4, wristAngle: -0.3 } } },
      { time: 6.0,  intensity: 1.0,  movementLabel: 'both arms up',   pose: { root: { x: 0, y: -0.15, scaleX: 0.96, scaleY: 1.07, rotation: 0 }, leftArm: { shoulderAngle: 2.0, elbowAngle: 0.5, wristAngle: 0.2 }, rightArm: { shoulderAngle: 2.0, elbowAngle: 0.5, wristAngle: -0.2 } } },
      { time: 8.0,  intensity: 0.95, movementLabel: 'side groove',    pose: { root: { x: -0.28, y: 0.1, scaleX: 1, scaleY: 1, rotation: -0.09 }, pelvis: { x: -0.35, y: 0, angle: -0.16 } } },
      { time: 10.0, intensity: 0.95, movementLabel: 'side groove',    pose: { root: { x: 0.28, y: 0.1, scaleX: 1, scaleY: 1, rotation: 0.09 },  pelvis: { x: 0.35, y: 0, angle: 0.16 } } },
      { time: 13.5, intensity: 1.0,  movementLabel: 'final pose',     pose: { root: { x: 0, y: 0.05, scaleX: 1, scaleY: 1, rotation: 0 }, leftArm: { shoulderAngle: 2.2, elbowAngle: 0.1, wristAngle: 0.4 }, rightArm: { shoulderAngle: 0.8, elbowAngle: 1.4, wristAngle: -0.3 } } },
    ],
  },

  // ── 13. HOUSE DROP — 140 BPM  (high energy) ─────────────────────────────
  {
    danceId: 'dance_house_drop',
    songId: 'song_house_drop',
    name: 'Bass Station Drop',
    artist: 'DJ Parallel',
    bpm: 140,
    duration: 14.0,
    difficulty: 'hard',
    description: 'Rapid house shuffle with pounding squat drops, fist pumps and fast alternating side steps.',
    tags: ['House', 'EDM', 'Drop', 'High Energy'],
    trending: true,
    keyframes: [
      { time: 0.0,  intensity: 0.9,  movementLabel: 'body bounce',    ease: 'easeInOut', pose: { root: { x: 0, y: 0.2, scaleX: 1.08, scaleY: 0.94, rotation: 0 }, leftArm: { shoulderAngle: 0.8, elbowAngle: 0.9, wristAngle: 0.15 }, rightArm: { shoulderAngle: 0.8, elbowAngle: 0.9, wristAngle: -0.15 } } },
      { time: 0.86, intensity: 1.0,  movementLabel: 'both arms up',   ease: 'easeOut', pose: { root: { x: 0, y: -0.18, scaleX: 0.95, scaleY: 1.08, rotation: 0 }, leftArm: { shoulderAngle: 2.0, elbowAngle: 0.6, wristAngle: 0.2 }, rightArm: { shoulderAngle: 2.0, elbowAngle: 0.6, wristAngle: -0.2 } } },
      { time: 1.71, intensity: 1.0,  movementLabel: 'squat',          ease: 'easeOut', pose: { root: { x: 0, y: 0.5, scaleX: 1.22, scaleY: 0.82, rotation: 0 }, leftLeg: { hipAngle: 0.65, kneeAngle: 1.0, ankleAngle: -0.25 }, rightLeg: { hipAngle: 0.65, kneeAngle: 1.0, ankleAngle: -0.25 }, leftArm: { shoulderAngle: 0.9, elbowAngle: 1.0, wristAngle: 0 }, rightArm: { shoulderAngle: 0.9, elbowAngle: 1.0, wristAngle: 0 } } },
      { time: 2.57, intensity: 0.95, movementLabel: 'left step',      ease: 'easeOut', pose: { root: { x: -0.32, y: 0.1, scaleX: 1, scaleY: 1, rotation: -0.07 }, leftArm: { shoulderAngle: 1.3, elbowAngle: 0.3, wristAngle: 0.2 }, rightArm: { shoulderAngle: 0.4, elbowAngle: 0.7, wristAngle: 0 } } },
      { time: 3.43, intensity: 0.95, movementLabel: 'right step',     ease: 'easeOut', pose: { root: { x: 0.32, y: 0.1, scaleX: 1, scaleY: 1, rotation: 0.07 },  leftArm: { shoulderAngle: 0.4, elbowAngle: 0.7, wristAngle: 0 }, rightArm: { shoulderAngle: 1.3, elbowAngle: 0.3, wristAngle: -0.2 } } },
      { time: 4.29, intensity: 1.0,  movementLabel: 'jump',           ease: 'easeOut', pose: { root: { x: 0, y: -0.55, scaleX: 0.9, scaleY: 1.14, rotation: 0 }, leftLeg: { hipAngle: -0.22, kneeAngle: 0.42, ankleAngle: 0 }, rightLeg: { hipAngle: -0.22, kneeAngle: 0.42, ankleAngle: 0 }, leftArm: { shoulderAngle: 1.7, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 1.7, elbowAngle: 0.5, wristAngle: 0 } } },
      { time: 6.0,  intensity: 1.0,  movementLabel: 'spin',           ease: 'linear', pose: { root: { x: 0, y: 0, scaleX: -1, scaleY: 1, rotation: 0 } } },
      { time: 8.57, intensity: 1.0,  movementLabel: 'both arms up',   ease: 'easeOut', pose: { root: { x: 0, y: -0.2, scaleX: 0.94, scaleY: 1.1, rotation: 0 }, leftArm: { shoulderAngle: 2.15, elbowAngle: 0.45, wristAngle: 0.25 }, rightArm: { shoulderAngle: 2.15, elbowAngle: 0.45, wristAngle: -0.25 } } },
      { time: 13.0, intensity: 1.0,  movementLabel: 'final pose',     ease: 'easeOut', pose: { root: { x: 0, y: -0.1, scaleX: 1, scaleY: 1.05, rotation: 0 }, leftArm: { shoulderAngle: 2.2, elbowAngle: 0.2, wristAngle: 0.3 }, rightArm: { shoulderAngle: 2.2, elbowAngle: 0.2, wristAngle: -0.3 } } },
    ],
  },

  // ── 14. TECHNO PULSE — 150 BPM  (very high energy) ──────────────────────
  {
    danceId: 'dance_techno_pulse',
    songId: 'song_techno_pulse',
    name: 'Industrial Sunrise',
    artist: 'Voltwerks',
    bpm: 150,
    duration: 12.0,
    difficulty: 'hard',
    description: 'Relentless techno stomp: rapid squat-jumps, windmill arms, full spins and sharp freeze poses.',
    tags: ['Techno', 'Industrial', 'Rave', 'Hard'],
    trending: false,
    keyframes: [
      { time: 0.0,  intensity: 0.95, movementLabel: 'body bounce',    ease: 'easeInOut', pose: { root: { x: 0, y: 0.22, scaleX: 1.1, scaleY: 0.92, rotation: 0 }, leftArm: { shoulderAngle: 0.9, elbowAngle: 1.0, wristAngle: 0.2 }, rightArm: { shoulderAngle: 0.9, elbowAngle: 1.0, wristAngle: -0.2 } } },
      { time: 0.8,  intensity: 1.0,  movementLabel: 'jump',           ease: 'easeOut', pose: { root: { x: 0, y: -0.6, scaleX: 0.88, scaleY: 1.18, rotation: 0 }, leftLeg: { hipAngle: -0.25, kneeAngle: 0.45, ankleAngle: 0 }, rightLeg: { hipAngle: -0.25, kneeAngle: 0.45, ankleAngle: 0 }, leftArm: { shoulderAngle: 1.8, elbowAngle: 0.4, wristAngle: 0 }, rightArm: { shoulderAngle: 1.8, elbowAngle: 0.4, wristAngle: 0 } } },
      { time: 1.6,  intensity: 1.0,  movementLabel: 'squat',          ease: 'easeOut', pose: { root: { x: 0, y: 0.52, scaleX: 1.25, scaleY: 0.8, rotation: 0 }, leftLeg: { hipAngle: 0.7, kneeAngle: 1.05, ankleAngle: -0.28 }, rightLeg: { hipAngle: 0.7, kneeAngle: 1.05, ankleAngle: -0.28 } } },
      { time: 2.4,  intensity: 1.0,  movementLabel: 'spin',           ease: 'linear', pose: { root: { x: 0, y: 0, scaleX: -1, scaleY: 1, rotation: 0 }, leftArm: { shoulderAngle: 0.8, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 0.8, elbowAngle: 0.5, wristAngle: 0 } } },
      { time: 3.2,  intensity: 1.0,  movementLabel: 'both arms up',   ease: 'easeOut', pose: { root: { x: 0, y: -0.22, scaleX: 0.93, scaleY: 1.12, rotation: 0 }, leftArm: { shoulderAngle: 2.2, elbowAngle: 0.4, wristAngle: 0.25 }, rightArm: { shoulderAngle: 2.2, elbowAngle: 0.4, wristAngle: -0.25 } } },
      { time: 4.8,  intensity: 1.0,  movementLabel: 'left arm wave',  ease: 'easeInOut', pose: { root: { x: -0.2, y: 0.1, scaleX: 1.04, scaleY: 0.97, rotation: -0.09 }, leftArm: { shoulderAngle: 1.6, elbowAngle: 1.1, wristAngle: 0.35 }, rightArm: { shoulderAngle: 0.4, elbowAngle: 0.5, wristAngle: 0 } } },
      { time: 5.6,  intensity: 1.0,  movementLabel: 'right arm wave', ease: 'easeInOut', pose: { root: { x: 0.2, y: 0.1, scaleX: 1.04, scaleY: 0.97, rotation: 0.09 },  leftArm: { shoulderAngle: 0.4, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 1.6, elbowAngle: 1.1, wristAngle: -0.35 } } },
      { time: 8.0,  intensity: 1.0,  movementLabel: 'jump',           ease: 'easeOut', pose: { root: { x: 0, y: -0.58, scaleX: 0.9, scaleY: 1.15, rotation: 0 }, leftLeg: { hipAngle: -0.22, kneeAngle: 0.42, ankleAngle: 0 }, rightLeg: { hipAngle: -0.22, kneeAngle: 0.42, ankleAngle: 0 }, leftArm: { shoulderAngle: 1.75, elbowAngle: 0.45, wristAngle: 0 }, rightArm: { shoulderAngle: 1.75, elbowAngle: 0.45, wristAngle: 0 } } },
      { time: 11.0, intensity: 1.0,  movementLabel: 'final pose',     ease: 'easeOut', pose: { root: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, leftArm: { shoulderAngle: 2.3, elbowAngle: 0.1, wristAngle: 0.3 }, rightArm: { shoulderAngle: 0.7, elbowAngle: 1.5, wristAngle: -0.35 } } },
    ],
  },

  // ── 15. DRUM & BASS — 160 BPM  (very high energy) ───────────────────────
  {
    danceId: 'dance_drum_bass',
    songId: 'song_drum_bass',
    name: 'Liquid Chrome DnB',
    artist: 'Axiom & Fen',
    bpm: 160,
    duration: 12.0,
    difficulty: 'hard',
    description: 'Frenetic DnB footwork: rapid alternating steps, windmill arm cycles and explosive jump combos.',
    tags: ['DnB', 'Fast', 'Footwork', 'Rave'],
    trending: false,
    keyframes: [
      { time: 0.0,  intensity: 1.0,  movementLabel: 'left step',      ease: 'easeOut', pose: { root: { x: -0.3, y: 0.1, scaleX: 1, scaleY: 1, rotation: -0.07 }, leftLeg: { hipAngle: 0.3, kneeAngle: 0.42, ankleAngle: 0 }, leftArm: { shoulderAngle: 1.2, elbowAngle: 0.35, wristAngle: 0.2 }, rightArm: { shoulderAngle: 0.45, elbowAngle: 0.7, wristAngle: 0 } } },
      { time: 0.75, intensity: 1.0,  movementLabel: 'right step',     ease: 'easeOut', pose: { root: { x: 0.3, y: 0.1, scaleX: 1, scaleY: 1, rotation: 0.07 },  rightLeg: { hipAngle: 0.3, kneeAngle: 0.42, ankleAngle: 0 }, leftArm: { shoulderAngle: 0.45, elbowAngle: 0.7, wristAngle: 0 }, rightArm: { shoulderAngle: 1.2, elbowAngle: 0.35, wristAngle: -0.2 } } },
      { time: 1.5,  intensity: 1.0,  movementLabel: 'left step',      ease: 'easeOut', pose: { root: { x: -0.28, y: 0.08, scaleX: 1, scaleY: 1, rotation: -0.06 }, leftArm: { shoulderAngle: 1.15, elbowAngle: 0.3, wristAngle: 0.18 } } },
      { time: 2.25, intensity: 1.0,  movementLabel: 'jump',           ease: 'easeOut', pose: { root: { x: 0, y: -0.58, scaleX: 0.89, scaleY: 1.16, rotation: 0 }, leftLeg: { hipAngle: -0.24, kneeAngle: 0.44, ankleAngle: 0 }, rightLeg: { hipAngle: -0.24, kneeAngle: 0.44, ankleAngle: 0 }, leftArm: { shoulderAngle: 1.8, elbowAngle: 0.42, wristAngle: 0 }, rightArm: { shoulderAngle: 1.8, elbowAngle: 0.42, wristAngle: 0 } } },
      { time: 3.0,  intensity: 1.0,  movementLabel: 'spin',           ease: 'linear', pose: { root: { x: 0, y: 0, scaleX: -1, scaleY: 1, rotation: 0 } } },
      { time: 3.75, intensity: 1.0,  movementLabel: 'squat',          ease: 'easeOut', pose: { root: { x: 0, y: 0.5, scaleX: 1.22, scaleY: 0.82, rotation: 0 }, leftLeg: { hipAngle: 0.68, kneeAngle: 1.02, ankleAngle: -0.26 }, rightLeg: { hipAngle: 0.68, kneeAngle: 1.02, ankleAngle: -0.26 } } },
      { time: 6.0,  intensity: 1.0,  movementLabel: 'both arms up',   ease: 'easeOut', pose: { root: { x: 0, y: -0.24, scaleX: 0.92, scaleY: 1.14, rotation: 0 }, leftArm: { shoulderAngle: 2.2, elbowAngle: 0.38, wristAngle: 0.28 }, rightArm: { shoulderAngle: 2.2, elbowAngle: 0.38, wristAngle: -0.28 } } },
      { time: 9.0,  intensity: 1.0,  movementLabel: 'side groove',    ease: 'easeInOut', pose: { root: { x: -0.3, y: 0.1, scaleX: 1, scaleY: 1, rotation: -0.1 }, pelvis: { x: -0.38, y: 0, angle: -0.18 } } },
      { time: 11.0, intensity: 1.0,  movementLabel: 'final pose',     ease: 'easeOut', pose: { root: { x: 0.1, y: -0.08, scaleX: 1, scaleY: 1.04, rotation: 0.07 }, leftArm: { shoulderAngle: 2.25, elbowAngle: 0.12, wristAngle: 0.32 }, rightArm: { shoulderAngle: 2.25, elbowAngle: 0.12, wristAngle: -0.32 } } },
    ],
  },

  // ── 16. HARDSTYLE — 175 BPM  (extreme energy) ───────────────────────────
  {
    danceId: 'dance_hardstyle',
    songId: 'song_hardstyle',
    name: 'Overdrive Horizon',
    artist: 'Kore X',
    bpm: 175,
    duration: 10.0,
    difficulty: 'hard',
    description: 'Explosive hardstyle kicking, rapid jump combos, double spins and full-extension arm blasts.',
    tags: ['Hardstyle', 'Extreme', 'Rave', 'Hard'],
    trending: false,
    keyframes: [
      { time: 0.0,  intensity: 1.0,  movementLabel: 'jump',           ease: 'easeOut', pose: { root: { x: 0, y: -0.65, scaleX: 0.87, scaleY: 1.2, rotation: 0 }, leftLeg: { hipAngle: -0.28, kneeAngle: 0.5, ankleAngle: 0 }, rightLeg: { hipAngle: -0.28, kneeAngle: 0.5, ankleAngle: 0 }, leftArm: { shoulderAngle: 1.85, elbowAngle: 0.38, wristAngle: 0 }, rightArm: { shoulderAngle: 1.85, elbowAngle: 0.38, wristAngle: 0 } } },
      { time: 0.69, intensity: 1.0,  movementLabel: 'squat',          ease: 'easeOut', pose: { root: { x: 0, y: 0.55, scaleX: 1.28, scaleY: 0.78, rotation: 0 }, leftLeg: { hipAngle: 0.75, kneeAngle: 1.1, ankleAngle: -0.3 }, rightLeg: { hipAngle: 0.75, kneeAngle: 1.1, ankleAngle: -0.3 } } },
      { time: 1.37, intensity: 1.0,  movementLabel: 'spin',           ease: 'linear', pose: { root: { x: 0, y: 0, scaleX: -1, scaleY: 1, rotation: 0 }, leftArm: { shoulderAngle: 0.9, elbowAngle: 0.5, wristAngle: 0 }, rightArm: { shoulderAngle: 0.9, elbowAngle: 0.5, wristAngle: 0 } } },
      { time: 2.06, intensity: 1.0,  movementLabel: 'both arms up',   ease: 'easeOut', pose: { root: { x: 0, y: -0.25, scaleX: 0.91, scaleY: 1.15, rotation: 0 }, leftArm: { shoulderAngle: 2.3, elbowAngle: 0.35, wristAngle: 0.3 }, rightArm: { shoulderAngle: 2.3, elbowAngle: 0.35, wristAngle: -0.3 } } },
      { time: 2.74, intensity: 1.0,  movementLabel: 'left step',      ease: 'easeOut', pose: { root: { x: -0.35, y: 0.1, scaleX: 1, scaleY: 1, rotation: -0.08 }, leftArm: { shoulderAngle: 1.35, elbowAngle: 0.28, wristAngle: 0.22 } } },
      { time: 3.43, intensity: 1.0,  movementLabel: 'right step',     ease: 'easeOut', pose: { root: { x: 0.35, y: 0.1, scaleX: 1, scaleY: 1, rotation: 0.08 },  rightArm: { shoulderAngle: 1.35, elbowAngle: 0.28, wristAngle: -0.22 } } },
      { time: 4.11, intensity: 1.0,  movementLabel: 'jump',           ease: 'easeOut', pose: { root: { x: 0, y: -0.62, scaleX: 0.88, scaleY: 1.18, rotation: 0 }, leftLeg: { hipAngle: -0.26, kneeAngle: 0.48, ankleAngle: 0 }, rightLeg: { hipAngle: -0.26, kneeAngle: 0.48, ankleAngle: 0 }, leftArm: { shoulderAngle: 1.9, elbowAngle: 0.4, wristAngle: 0 }, rightArm: { shoulderAngle: 1.9, elbowAngle: 0.4, wristAngle: 0 } } },
      { time: 5.49, intensity: 1.0,  movementLabel: 'spin',           ease: 'linear', pose: { root: { x: 0, y: 0, scaleX: -1, scaleY: 1, rotation: 0 } } },
      { time: 6.86, intensity: 1.0,  movementLabel: 'both arms up',   ease: 'easeOut', pose: { root: { x: 0, y: -0.28, scaleX: 0.9, scaleY: 1.18, rotation: 0 }, leftArm: { shoulderAngle: 2.35, elbowAngle: 0.3, wristAngle: 0.32 }, rightArm: { shoulderAngle: 2.35, elbowAngle: 0.3, wristAngle: -0.32 } } },
      { time: 9.0,  intensity: 1.0,  movementLabel: 'final pose',     ease: 'easeOut', pose: { root: { x: 0, y: -0.12, scaleX: 1, scaleY: 1.06, rotation: 0 }, leftArm: { shoulderAngle: 2.35, elbowAngle: 0.1, wristAngle: 0.35 }, rightArm: { shoulderAngle: 2.35, elbowAngle: 0.1, wristAngle: -0.35 } } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BPM → choreography lookup sorted by BPM for fast range queries
// ─────────────────────────────────────────────────────────────────────────────
export const CHOREO_BY_BPM = [...PRESET_CHOREOGRAPHIES].sort((a, b) => a.bpm - b.bpm);
