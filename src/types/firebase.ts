/**
 * Firebase Firestore and Storage Schema Types
 */

export interface FirestoreSongDoc {
  songId: string;
  title: string;
  artist: string;
  bpm: number;
  danceId?: string;
  trending: boolean;
  artworkUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreDanceDoc {
  danceId: string;
  name: string;
  songId: string;
  duration: number;
  bpm: number;
  choreographyPath: string; // Path in Firebase Storage
  thumbnailUrl?: string;
  trending: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  usingFallback: boolean;
  error?: string;
}
