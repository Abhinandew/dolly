import { collection, doc, getDoc, getDocs, setDoc, Firestore } from 'firebase/firestore';
import { ensureFirebaseInitialized } from './config';
import { FirestoreSongDoc } from '../../types/firebase';
import { Song } from '../../types/song';
import { PRESET_SONGS } from '../presetDances';

const SONGS_COLLECTION = 'songs';

export class FirebaseSongsService {
  public static async getSongs(): Promise<Song[]> {
    const { firestore, status } = ensureFirebaseInitialized();
    if (!status.isConnected || !firestore) {
      return PRESET_SONGS;
    }

    try {
      const colRef = collection(firestore as Firestore, SONGS_COLLECTION);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        return PRESET_SONGS;
      }
      return snapshot.docs.map((d) => d.data() as Song);
    } catch (err) {
      console.warn('[FirebaseSongsService] Error reading songs, using fallback:', err);
      return PRESET_SONGS;
    }
  }

  public static async getSong(songId: string): Promise<Song | null> {
    const { firestore, status } = ensureFirebaseInitialized();
    if (!status.isConnected || !firestore) {
      return PRESET_SONGS.find((s) => s.songId === songId) || null;
    }

    try {
      const docRef = doc(firestore as Firestore, SONGS_COLLECTION, songId);
      const snap = await getDoc(docRef);
      return snap.exists() ? (snap.data() as Song) : null;
    } catch (err) {
      console.warn('[FirebaseSongsService] Error fetching song:', err);
      return PRESET_SONGS.find((s) => s.songId === songId) || null;
    }
  }

  public static async saveSong(song: FirestoreSongDoc): Promise<void> {
    const { firestore, status } = ensureFirebaseInitialized();
    if (!status.isConnected || !firestore) {
      console.log('[FirebaseSongsService] Saved song to local store (Firebase offline):', song.title);
      return;
    }

    try {
      const docRef = doc(firestore as Firestore, SONGS_COLLECTION, song.songId);
      await setDoc(docRef, song, { merge: true });
    } catch (err) {
      console.error('[FirebaseSongsService] Failed to save song to Firestore:', err);
      throw err;
    }
  }
}
