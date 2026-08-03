import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../config/firebase";
import type { Game } from "../types/models";

export async function fetchAllGames(): Promise<Game[]> {
  const q = query(collection(db, "games"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Game);
}

/** Uploads a game image to Storage and returns its public download URL. */
export async function uploadGameImage(file: File, gameId: string): Promise<string> {
  const extension = file.name.split(".").pop() || "jpg";
  const storageRef = ref(storage, `games/${gameId}.${extension}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export interface GameFormInput {
  name: string;
  description: string;
  gameURL: string;
  deepLinkURL: string;
  category: string;
  reward: number;
  status: "active" | "inactive";
  isFeatured: boolean;
}

export async function createGame(
  input: GameFormInput,
  imageFile: File | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, "games"), {
      name: input.name.trim(),
      description: input.description.trim(),
      imageURL: "",
      gameURL: input.gameURL.trim(),
      deepLinkURL: input.deepLinkURL.trim() || null,
      category: input.category.trim(),
      reward: input.reward,
      status: input.status,
      isFeatured: input.isFeatured,
      playCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (imageFile) {
      const imageURL = await uploadGameImage(imageFile, docRef.id);
      await updateDoc(docRef, { imageURL });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateGame(
  gameId: string,
  input: GameFormInput,
  imageFile: File | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: Record<string, unknown> = {
      name: input.name.trim(),
      description: input.description.trim(),
      gameURL: input.gameURL.trim(),
      deepLinkURL: input.deepLinkURL.trim() || null,
      category: input.category.trim(),
      reward: input.reward,
      status: input.status,
      isFeatured: input.isFeatured,
      updatedAt: serverTimestamp(),
    };

    if (imageFile) {
      updates.imageURL = await uploadGameImage(imageFile, gameId);
    }

    await updateDoc(doc(db, "games", gameId), updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteGame(
  gameId: string,
  imageURL: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "games", gameId));
    if (imageURL) {
      try {
        await deleteObject(ref(storage, imageURL));
      } catch {
        // Image may already be gone or URL may not be a storage ref — the
        // Firestore doc deletion above already succeeded, which is what
        // actually matters; don't fail the whole operation over cleanup.
      }
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function toggleGameStatus(
  gameId: string,
  currentStatus: "active" | "inactive"
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "games", gameId), {
      status: currentStatus === "active" ? "inactive" : "active",
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
