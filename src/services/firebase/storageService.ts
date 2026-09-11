import { ref, uploadString, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { ensureFirebaseInitialized } from './config';
import { Choreography } from '../../types/choreography';
import { PRESET_CHOREOGRAPHIES } from '../presetDances';

// In-memory LRU-like cache to avoid repeated storage/network parsing
const choreographyMemoryCache: Map<string, Choreography> = new Map();

// Pre-fill memory cache with presets
PRESET_CHOREOGRAPHIES.forEach((c) => {
  choreographyMemoryCache.set(`choreographies/${c.danceId}.json`, c);
  choreographyMemoryCache.set(c.danceId, c);
});

export class FirebaseStorageService {
  public static async uploadChoreography(choreo: Choreography): Promise<string> {
    const path = `choreographies/${choreo.danceId}.json`;
    const jsonString = JSON.stringify(choreo, null, 2);

    // Update in-memory cache immediately
    choreographyMemoryCache.set(path, choreo);
    choreographyMemoryCache.set(choreo.danceId, choreo);

    const { storage, status } = ensureFirebaseInitialized();
    if (!status.isConnected || !storage) {
      try {
        localStorage.setItem(`dolly_storage_${path}`, jsonString);
      } catch (err) {
        console.warn('[FirebaseStorageService] Local storage quota error:', err);
      }
      return path;
    }

    try {
      const storageRef = ref(storage as FirebaseStorage, path);
      await uploadString(storageRef, jsonString, 'raw', {
        contentType: 'application/json',
      });
      return path;
    } catch (err) {
      console.error('[FirebaseStorageService] Error uploading choreography:', err);
      localStorage.setItem(`dolly_storage_${path}`, jsonString);
      return path;
    }
  }

  public static async downloadChoreography(pathOrId: string): Promise<Choreography | null> {
    // 1. Fast Memory Cache Hit
    if (choreographyMemoryCache.has(pathOrId)) {
      return choreographyMemoryCache.get(pathOrId)!;
    }
    const normalizedPath = pathOrId.startsWith('choreographies/') ? pathOrId : `choreographies/${pathOrId}.json`;
    if (choreographyMemoryCache.has(normalizedPath)) {
      return choreographyMemoryCache.get(normalizedPath)!;
    }

    // 2. Local Storage Cache Hit
    const local = localStorage.getItem(`dolly_storage_${normalizedPath}`);
    if (local) {
      try {
        const parsed = JSON.parse(local) as Choreography;
        choreographyMemoryCache.set(normalizedPath, parsed);
        return parsed;
      } catch {
        // Fall through
      }
    }

    // 3. Network Fetch
    const { storage, status } = ensureFirebaseInitialized();
    if (!status.isConnected || !storage) {
      return null;
    }

    try {
      const storageRef = ref(storage as FirebaseStorage, normalizedPath);
      const url = await getDownloadURL(storageRef);
      const res = await fetch(url);
      const data = (await res.json()) as Choreography;
      choreographyMemoryCache.set(normalizedPath, data);
      return data;
    } catch (err) {
      console.warn('[FirebaseStorageService] Could not fetch choreography from storage:', err);
      return null;
    }
  }
}
