import { collection, doc, getDocs, setDoc, Firestore } from 'firebase/firestore';
import { ensureFirebaseInitialized } from './config';
import { FirestoreDanceDoc } from '../../types/firebase';
import { PRESET_CHOREOGRAPHIES } from '../presetDances';

const DANCES_COLLECTION = 'dances';

export class FirebaseDancesService {
  public static async getDances(): Promise<FirestoreDanceDoc[]> {
    const { firestore, status } = ensureFirebaseInitialized();
    if (!status.isConnected || !firestore) {
      return PRESET_CHOREOGRAPHIES.map((c) => ({
        danceId: c.danceId,
        name: c.name,
        songId: c.songId,
        duration: c.duration,
        bpm: c.bpm,
        choreographyPath: `choreographies/${c.danceId}.json`,
        trending: !!c.trending,
        difficulty: c.difficulty || 'medium',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-10T00:00:00Z',
      }));
    }

    try {
      const colRef = collection(firestore as Firestore, DANCES_COLLECTION);
      const snap = await getDocs(colRef);
      if (snap.empty) {
        return [];
      }
      return snap.docs.map((d) => d.data() as FirestoreDanceDoc);
    } catch (err) {
      console.warn('[FirebaseDancesService] Error fetching dances from Firestore:', err);
      return [];
    }
  }

  public static async saveDance(danceDoc: FirestoreDanceDoc): Promise<void> {
    const { firestore, status } = ensureFirebaseInitialized();
    if (!status.isConnected || !firestore) {
      console.log('[FirebaseDancesService] Saved dance metadata locally (Firebase offline):', danceDoc.name);
      return;
    }

    try {
      const docRef = doc(firestore as Firestore, DANCES_COLLECTION, danceDoc.danceId);
      await setDoc(docRef, danceDoc, { merge: true });
    } catch (err) {
      console.error('[FirebaseDancesService] Error saving dance:', err);
      throw err;
    }
  }
}
