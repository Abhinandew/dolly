import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { DollyAppearance, DEFAULT_APPEARANCE } from '../types/customization';
import { AudioAnalysis } from '../types/audio';
import { Choreography } from '../types/choreography';
import { Song, RecognizedSong } from '../types/song';
import { AudioAnalyzer } from '../audio/AudioAnalyzer';
import { AudioSynthesizer, SynthTrack, SYNTH_TRACKS } from '../audio/AudioSynthesizer';
import { DanceEngine } from '../dance/DanceEngine';
import { ChoreographyPlayer } from '../dance/ChoreographyPlayer';
import { MockSongRecognitionService } from '../services/SongRecognitionService';
import { trendingDanceService } from '../services/TrendingDanceService';
import { PRESET_SONGS, CHOREO_BY_BPM, matchSongByBpm } from '../services/presetDances';

export type DollyLiveState =
  | 'waiting'        // State 1: "Dolly is waiting..."
  | 'listening'      // State 2: "Listening..."
  | 'finding_song'   // State 3: "Finding your song..."
  | 'song_detected'  // State 4: "Song detected"
  | 'dance_found'    // State 5: "🔥 Dance found"
  | 'dancing';       // State 6: "🔥 Dancing"

export interface DollyContextType {
  // Live State
  liveState: DollyLiveState;
  statusMessage: string;
  errorMessage: string | null;

  // Audio & Playback
  isListening: boolean;
  activeSource: 'microphone' | 'synthesizer' | 'none';
  audioAnalysis: AudioAnalysis;
  activeSynthTrack: SynthTrack | null;
  recognizedSong: RecognizedSong | null;
  activeChoreography: Choreography | null;

  // Customization
  appearance: DollyAppearance;
  setAppearance: (appearance: DollyAppearance) => void;
  updateAppearance: (partial: Partial<DollyAppearance>) => void;
  resetAppearance: () => void;

  // Audio Controls
  startListening: () => Promise<void>;
  playSynthesizer: (track?: SynthTrack) => void;
  stopAudio: () => void;
  pauseAudio: () => void;
  playChoreographyDirectly: (choreo: Choreography, song?: Song) => void;

  // Dev & Settings
  showDebugRig: boolean;
  setShowDebugRig: (val: boolean) => void;
  audioSensitivity: number;
  setAudioSensitivity: (val: number) => void;
  mockFailRecognition: boolean;
  setMockFailRecognition: (val: boolean) => void;

  // Core Engine instances for Canvas renderer loop
  audioAnalyzerRef: React.MutableRefObject<AudioAnalyzer>;
  danceEngineRef: React.MutableRefObject<DanceEngine>;
  choreoPlayerRef: React.MutableRefObject<ChoreographyPlayer>;
  audioSynthRef: React.MutableRefObject<AudioSynthesizer>;
  // Shared analysis cache — RAF writes here; all other readers pull from here
  audioAnalysisRef: React.MutableRefObject<AudioAnalysis>;
}

const DollyContext = createContext<DollyContextType | null>(null);

export const DollyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Appearance state with localStorage persistence
  const [appearance, setAppearanceState] = useState<DollyAppearance>(() => {
    try {
      const saved = localStorage.getItem('dolly_appearance');
      return saved ? JSON.parse(saved) : DEFAULT_APPEARANCE;
    } catch {
      return DEFAULT_APPEARANCE;
    }
  });

  const [liveState, setLiveState] = useState<DollyLiveState>('waiting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeSource, setActiveSource] = useState<'microphone' | 'synthesizer' | 'none'>('none');
  const [activeSynthTrack, setActiveSynthTrack] = useState<SynthTrack | null>(null);
  const [recognizedSong, setRecognizedSong] = useState<RecognizedSong | null>(null);
  const [activeChoreography, setActiveChoreography] = useState<Choreography | null>(null);

  // Dev settings
  const [showDebugRig, setShowDebugRig] = useState<boolean>(false);
  const [audioSensitivity, setAudioSensitivityState] = useState<number>(1.0);
  const [mockFailRecognition, setMockFailRecognitionState] = useState<boolean>(false);

  // Audio Telemetry (Throttled for React components)
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysis>({
    volume: 0,
    energy: 0,
    bassEnergy: 0,
    midEnergy: 0,
    trebleEnergy: 0,
    beatDetected: false,
    beatIntensity: 0,
    estimatedBPM: 120,
    beatPhase: 0,
    timestamp: 0,
  });

  // Engine instance refs (high-frequency animation loop access)
  const audioAnalyzerRef = useRef<AudioAnalyzer>(new AudioAnalyzer({ sensitivity: 1.0 }));
  const audioSynthRef = useRef<AudioSynthesizer>(new AudioSynthesizer());
  const danceEngineRef = useRef<DanceEngine>(new DanceEngine());
  const choreoPlayerRef = useRef<ChoreographyPlayer>(new ChoreographyPlayer());
  const recognitionServiceRef = useRef<MockSongRecognitionService>(new MockSongRecognitionService());

  // Recognition timer handle
  const recognitionTimerRef = useRef<number | null>(null);
  const bpmSamplerRef = useRef<number | null>(null);
  const mockFailRef = useRef(mockFailRecognition);
  mockFailRef.current = mockFailRecognition;
  const liveStateRef = useRef(liveState);
  liveStateRef.current = liveState;
  const pendingEnergyStateRef = useRef<'low' | 'medium' | 'high' | null>(null);

  // Mirror of audioAnalysis kept in a ref so background intervals can read the
  // latest values without calling analyze() again (which would double-tick the BeatClock).
  const audioAnalysisRef = useRef<AudioAnalysis>({
    volume: 0, energy: 0, bassEnergy: 0, midEnergy: 0, trebleEnergy: 0,
    beatDetected: false, beatIntensity: 0, estimatedBPM: 120, beatPhase: 0, timestamp: 0,
  });

  // Energy monitoring state (used for choreography switching)
  const smoothedEnergyRef     = useRef<number>(0);
  const energyStateRef        = useRef<'low' | 'medium' | 'high'>('medium');
  const energyHoldTimerRef    = useRef<number | null>(null);
  const activeChoreoIndexRef  = useRef<number>(-1); // index into CHOREO_BY_BPM

  // Update appearance and persist
  const setAppearance = useCallback((newAppearance: DollyAppearance) => {
    setAppearanceState(newAppearance);
    try {
      localStorage.setItem('dolly_appearance', JSON.stringify(newAppearance));
    } catch {
      // Ignore storage error
    }
  }, []);

  const updateAppearance = useCallback((partial: Partial<DollyAppearance>) => {
    setAppearanceState((prev) => {
      const updated = {
        ...prev,
        ...partial,
        proportions: {
          ...prev.proportions,
          ...(partial.proportions || {}),
        },
      };
      try {
        localStorage.setItem('dolly_appearance', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const resetAppearance = useCallback(() => {
    setAppearance(DEFAULT_APPEARANCE);
  }, [setAppearance]);

  const setAudioSensitivity = useCallback((val: number) => {
    setAudioSensitivityState(val);
    audioAnalyzerRef.current.setSensitivity(val);
  }, []);

  const setMockFailRecognition = useCallback((val: boolean) => {
    setMockFailRecognitionState(val);
    recognitionServiceRef.current.setShouldFail(val);
  }, []);

  // Status message based on liveState
  const statusMessage = useMemo(() => {
    switch (liveState) {
      case 'listening':
        return 'Listening to music rhythm...';
      case 'finding_song':
        return 'Finding your song...';
      case 'song_detected':
        return `Song detected: ${recognizedSong?.title || 'Track'}`;
      case 'dance_found':
        return `🔥 Dance found: ${activeChoreography?.name || 'Choreography'}`;
      case 'dancing':
        return `🔥 Dancing to ${recognizedSong?.title || activeChoreography?.name || 'Beats'}!`;
      case 'waiting':
      default:
        return 'Dolly is waiting...';
    }
  }, [liveState, recognizedSong, activeChoreography]);

  /**
   * Triggers the song recognition flow:
   * State 2 (Listening) -> State 3 (Finding song) -> State 4 (Detected) -> State 5/6 (Dance found & Dancing)
   * Uses BPM-based matching: if the detected BPM stays close to a known song's BPM
   * for a few seconds, that choreography is loaded. Falls back to random dancing otherwise.
   */
  const triggerRecognitionFlow = useCallback((forcedSongId?: string) => {
    if (recognitionTimerRef.current) {
      clearTimeout(recognitionTimerRef.current);
    }
    if (bpmSamplerRef.current) {
      clearInterval(bpmSamplerRef.current);
      bpmSamplerRef.current = null;
    }

    // Start in pure listening/random-dance state — no choreography loaded yet
    setLiveState('listening');
    choreoPlayerRef.current.stop();

    if (forcedSongId) {
      recognitionServiceRef.current.setForcedSongId(forcedSongId);
    } else {
      recognitionServiceRef.current.setForcedSongId(null);
    }

    const scheduleRetry = () => {
      setLiveState('listening');
      recognitionTimerRef.current = window.setTimeout(() => {
        triggerRecognitionFlow();
      }, 5000);
    };

    // After 3s of listening, attempt BPM-based song matching
    recognitionTimerRef.current = window.setTimeout(async () => {
      if (!audioAnalyzerRef.current.isActive()) return;
      setLiveState('finding_song');

      try {
        if (mockFailRef.current) {
          await recognitionServiceRef.current.identify();
          scheduleRetry();
          return;
        }

        const bpmSamples: number[] = [];
        const energySamples: number[] = [];
        await new Promise<void>((resolve) => {
          let count = 0;
          bpmSamplerRef.current = window.setInterval(() => {
            if (!audioAnalyzerRef.current.isActive()) {
              if (bpmSamplerRef.current) clearInterval(bpmSamplerRef.current);
              bpmSamplerRef.current = null;
              resolve();
              return;
            }
            // Read from the cached ref — avoids double-ticking the BeatClock
            // (the telemetry loop already calls analyze() at 10 FPS).
            const analysis = audioAnalysisRef.current;
            if (analysis.estimatedBPM > 0) {
              bpmSamples.push(analysis.estimatedBPM);
            }
            energySamples.push(analysis.energy);
            count++;
            if (count >= 20) {
              if (bpmSamplerRef.current) clearInterval(bpmSamplerRef.current);
              bpmSamplerRef.current = null;
              resolve();
            }
          }, 100);
        });

        if (!audioAnalyzerRef.current.isActive()) return;

        const avgEnergy =
          energySamples.reduce((sum, v) => sum + v, 0) / Math.max(1, energySamples.length);
        if (energySamples.length === 0 || avgEnergy < 0.06) {
          scheduleRetry();
          return;
        }

        bpmSamples.sort((a, b) => a - b);
        const medianBpm = bpmSamples[Math.floor(bpmSamples.length / 2)] ?? 0;
        const bestMatch = matchSongByBpm(medianBpm, PRESET_SONGS, 12);

        if (bestMatch?.danceId) {
          const choreo = await trendingDanceService.getChoreographyById(bestMatch.danceId);
          if (choreo) {
            const directDiff = Math.abs(medianBpm - bestMatch.bpm);
            activeChoreoIndexRef.current = CHOREO_BY_BPM.findIndex((c) => c.danceId === choreo.danceId);
            setRecognizedSong({
              songId: bestMatch.songId,
              title: bestMatch.title,
              artist: bestMatch.artist,
              bpm: bestMatch.bpm,
              danceId: bestMatch.danceId,
              confidence: Math.max(0.5, 1 - Math.min(directDiff, 12) / 12),
              isMock: true,
            });
            setActiveChoreography(choreo);
            choreoPlayerRef.current.loadChoreography(choreo);
            setLiveState('song_detected');

            window.setTimeout(() => {
              setLiveState('dance_found');
              window.setTimeout(() => {
                setLiveState('dancing');
                choreoPlayerRef.current.play(true);
              }, 1000);
            }, 900);
            return;
          }
        }

        scheduleRetry();
      } catch (err) {
        console.warn('[Dolly] Recognition error, continuing random dancing:', err);
        setLiveState('listening');
      }
    }, 3000);
  }, []);

  /**
   * Start microphone audio listening after explicit user permission
   */
  const startListening = useCallback(async () => {
    setErrorMessage(null);
    try {
      // Stop synthesizer if running
      if (audioSynthRef.current.getIsPlaying()) {
        audioSynthRef.current.stop();
      }

      await audioAnalyzerRef.current.startMicrophone();
      setIsListening(true);
      setActiveSource('microphone');
      setActiveSynthTrack(null);
      setRecognizedSong(null);
      setLiveState('listening');

      triggerRecognitionFlow();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Dolly Audio Error]:', msg);
      if (msg.includes('Permission denied') || msg.includes('NotAllowedError')) {
        setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser or try a built-in Demo Groove.');
      } else {
        setErrorMessage(`Could not access microphone: ${msg}`);
      }
      setIsListening(false);
      setActiveSource('none');
      setLiveState('waiting');
    }
  }, [triggerRecognitionFlow]);

  /**
   * Play a built-in synthesized groove track (instant test without mic)
   */
  const playSynthesizer = useCallback((track: SynthTrack = SYNTH_TRACKS[0]) => {
    setErrorMessage(null);
    // Stop microphone if running
    if (audioAnalyzerRef.current.isActive()) {
      audioAnalyzerRef.current.stop();
    }

    const ctx = audioSynthRef.current.start(track);
    const masterNode = audioSynthRef.current.getMasterNode();
    if (masterNode) {
      audioAnalyzerRef.current.connectAudioNode(masterNode, ctx);
    }

    setIsListening(true);
    setActiveSource('synthesizer');
    setActiveSynthTrack(track);

    // Let recognition run naturally — no forced song ID.
    // Dolly dances randomly until the song is actually identified.
    triggerRecognitionFlow();
  }, [triggerRecognitionFlow]);

  /**
   * Play a specific choreography directly (e.g. from Dance Library or Admin Studio)
   */
  const playChoreographyDirectly = useCallback((choreo: Choreography, song?: Song) => {
    if (recognitionTimerRef.current) {
      clearTimeout(recognitionTimerRef.current);
    }

    setActiveChoreography(choreo);
    if (song) {
      setRecognizedSong({
        songId: song.songId,
        title: song.title,
        artist: song.artist,
        bpm: song.bpm,
        danceId: choreo.danceId,
        confidence: 1.0,
        isMock: false,
      });
    }

    choreoPlayerRef.current.loadChoreography(choreo);
    choreoPlayerRef.current.play(true);

    setIsListening(true);
    setLiveState('dancing');

    // Track index in CHOREO_BY_BPM for energy-based switching
    activeChoreoIndexRef.current = CHOREO_BY_BPM.findIndex(c => c.danceId === choreo.danceId);

    // Also spin up synthesizer track with matching tempo if not active
    if (!audioSynthRef.current.getIsPlaying() && !audioAnalyzerRef.current.isActive()) {
      const matchedSynth = SYNTH_TRACKS.find((t) => Math.abs(t.bpm - choreo.bpm) < 10) || SYNTH_TRACKS[0];
      const ctx = audioSynthRef.current.start(matchedSynth);
      const masterNode = audioSynthRef.current.getMasterNode();
      if (masterNode) {
        audioAnalyzerRef.current.connectAudioNode(masterNode, ctx);
      }
      setActiveSource('synthesizer');
      setActiveSynthTrack(matchedSynth);
    }
  }, []);

  const pauseAudio = useCallback(() => {
    if (recognitionTimerRef.current) {
      clearTimeout(recognitionTimerRef.current);
    }
    if (bpmSamplerRef.current) {
      clearInterval(bpmSamplerRef.current);
      bpmSamplerRef.current = null;
    }
    audioAnalyzerRef.current.stop();
    audioSynthRef.current.stop();
    if (choreoPlayerRef.current.getState(0).isPlaying) {
      choreoPlayerRef.current.pause();
    }
    setIsListening(false);
    setActiveSource('none');
    setActiveSynthTrack(null);
    setLiveState('waiting');
  }, []);

  const stopAudio = useCallback(() => {
    if (recognitionTimerRef.current) {
      clearTimeout(recognitionTimerRef.current);
    }
    if (bpmSamplerRef.current) {
      clearInterval(bpmSamplerRef.current);
      bpmSamplerRef.current = null;
    }
    if (energyHoldTimerRef.current) {
      clearTimeout(energyHoldTimerRef.current);
    }
    audioAnalyzerRef.current.stop();
    audioSynthRef.current.stop();
    choreoPlayerRef.current.stop();
    danceEngineRef.current.reset();

    smoothedEnergyRef.current   = 0;
    energyStateRef.current      = 'medium';
    activeChoreoIndexRef.current = -1;

    setIsListening(false);
    setActiveSource('none');
    setActiveSynthTrack(null);
    setRecognizedSong(null);
    setActiveChoreography(null);
    setLiveState('waiting');
  }, []);

  // ── Energy-based choreography switcher ──────────────────────────────────
  // Runs every 500ms while audio is active. Tracks a smoothed energy level and
  // switches to a calmer or more energetic choreography when the energy holds
  // at a new level for 2+ seconds (prevents thrashing on transients).
  useEffect(() => {
    const SMOOTH_FACTOR  = 0.15;  // EMA responsiveness
    const LOW_THRESHOLD  = 0.18;  // below → calm/slow
    const HIGH_THRESHOLD = 0.55;  // above → energetic/loud
    const HOLD_MS        = 2000;  // must hold new level for 2s before switching
    const TICK_MS        = 500;

    const switchChoreography = (direction: 'calmer' | 'hype') => {
      const current = activeChoreoIndexRef.current;
      if (current < 0) return; // not tracking a choreo yet

      const nextIdx = direction === 'calmer'
        ? Math.max(0, current - 1)
        : Math.min(CHOREO_BY_BPM.length - 1, current + 1);

      if (nextIdx === current) return; // already at the limit

      const nextChoreo = CHOREO_BY_BPM[nextIdx];
      activeChoreoIndexRef.current = nextIdx;
      choreoPlayerRef.current.loadChoreography(nextChoreo);
      choreoPlayerRef.current.play(true); // smooth crossfade
      setActiveChoreography(nextChoreo);
      setLiveState('dancing');
    };

    const interval = setInterval(() => {
      if (!audioAnalyzerRef.current.isActive()) return;
      if (liveStateRef.current !== 'dancing') return;

      // Read from the cached ref — avoids double-ticking the BeatClock
      // (the telemetry loop is the sole caller of analyze()).
      const a = audioAnalysisRef.current;

      smoothedEnergyRef.current =
        smoothedEnergyRef.current * (1 - SMOOTH_FACTOR) + a.energy * SMOOTH_FACTOR;

      const e = smoothedEnergyRef.current;
      const newState: 'low' | 'medium' | 'high' =
        e < LOW_THRESHOLD ? 'low' : e > HIGH_THRESHOLD ? 'high' : 'medium';

      if (newState === energyStateRef.current) {
        if (energyHoldTimerRef.current) clearTimeout(energyHoldTimerRef.current);
        pendingEnergyStateRef.current = null;
        return;
      }

      // Only arm the hold timer when the candidate state first changes
      if (pendingEnergyStateRef.current === newState) return;

      pendingEnergyStateRef.current = newState;
      if (energyHoldTimerRef.current) clearTimeout(energyHoldTimerRef.current);

      energyHoldTimerRef.current = window.setTimeout(() => {
        const ec = smoothedEnergyRef.current;
        const confirmed: 'low' | 'medium' | 'high' =
          ec < LOW_THRESHOLD ? 'low' : ec > HIGH_THRESHOLD ? 'high' : 'medium';

        pendingEnergyStateRef.current = null;
        if (confirmed !== energyStateRef.current) {
          const prevRank = energyStateRef.current === 'low' ? 0 : energyStateRef.current === 'medium' ? 1 : 2;
          const nextRank = confirmed === 'low' ? 0 : confirmed === 'medium' ? 1 : 2;
          energyStateRef.current = confirmed;
          if (nextRank < prevRank) switchChoreography('calmer');
          else if (nextRank > prevRank) switchChoreography('hype');
        }
      }, HOLD_MS);
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      if (energyHoldTimerRef.current) clearTimeout(energyHoldTimerRef.current);
    };
  }, []);

  // Periodic throttled telemetry updater (10 FPS) for React UI displays.
  // Does NOT call analyze() — that is the RAF loop's job (DollyCanvas).
  // Reads from audioAnalysisRef which the RAF writes every frame.
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioAnalyzerRef.current.isActive()) {
        // Snapshot the ref value into React state for UI components.
        setAudioAnalysis({ ...audioAnalysisRef.current });
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionTimerRef.current) {
        clearTimeout(recognitionTimerRef.current);
      }
      if (bpmSamplerRef.current) {
        clearInterval(bpmSamplerRef.current);
      }
      audioAnalyzerRef.current.stop();
      audioSynthRef.current.stop();
      choreoPlayerRef.current.stop();
    };
  }, []);

  const contextValue: DollyContextType = {
    liveState,
    statusMessage,
    errorMessage,
    isListening,
    activeSource,
    audioAnalysis,
    activeSynthTrack,
    recognizedSong,
    activeChoreography,

    appearance,
    setAppearance,
    updateAppearance,
    resetAppearance,

    startListening,
    playSynthesizer,
    stopAudio,
    pauseAudio,
    playChoreographyDirectly,

    showDebugRig,
    setShowDebugRig,
    audioSensitivity,
    setAudioSensitivity,
    mockFailRecognition,
    setMockFailRecognition,

    audioAnalyzerRef,
    danceEngineRef,
    choreoPlayerRef,
    audioSynthRef,
    audioAnalysisRef,
  };

  return <DollyContext.Provider value={contextValue}>{children}</DollyContext.Provider>;
};

export const useDolly = (): DollyContextType => {
  const context = useContext(DollyContext);
  if (!context) {
    throw new Error('useDolly must be used within a DollyProvider');
  }
  return context;
};

